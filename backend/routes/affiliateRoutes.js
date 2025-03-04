const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Affiliate = require('../models/Affiliate');
const User = require('../models/User');
const Course = require('../models/Course');

const router = express.Router();

// Function to check eligibility
const checkEligibility = async (teacherId) => {
  try {
    console.log('Checking eligibility for teacher:', teacherId);
    
    const courses = await Course.find({ instructor: teacherId });
    console.log('Found courses:', courses.length);
    
    const uniqueStudents = new Set();
    let totalRevenue = 0;
    let totalRating = 0;
    let reviewCount = 0;

    courses.forEach(course => {
      console.log(`Course ${course.title}:`, {
        students: course.students.length,
        price: course.price,
        rating: course.rating
      });
      
      course.students.forEach(student => uniqueStudents.add(student.toString()));
      totalRevenue += course.price * course.students.length;
      if (course.rating) {
        totalRating += course.rating;
        reviewCount++;
      }
    });

    const metrics = {
      totalStudents: uniqueStudents.size,
      totalRevenue: totalRevenue,
      averageRating: reviewCount > 0 ? totalRating / reviewCount : 0,
      totalCourses: courses.length
    };

    console.log('Teacher Metrics:', metrics);

    // Lower eligibility criteria
    const isEligible = 
      metrics.totalStudents >= 5 && // Lowered from 20
      metrics.totalRevenue >= 100 && // Lowered from 500
      metrics.averageRating >= 3.5 && // Lowered from 4.0
      metrics.totalCourses >= 2; // Lowered from 5

    console.log('Requirements check:', {
      students: `${metrics.totalStudents} >= 5: ${metrics.totalStudents >= 5}`,
      revenue: `${metrics.totalRevenue} >= 100: ${metrics.totalRevenue >= 100}`,
      rating: `${metrics.averageRating} >= 3.5: ${metrics.averageRating >= 3.5}`,
      courses: `${metrics.totalCourses} >= 2: ${metrics.totalCourses >= 2}`
    });
    console.log('Is Eligible:', isEligible);

    return { isEligible, metrics };
  } catch (error) {
    console.error("Error checking eligibility:", error);
    throw error;
  }
};

// Apply for affiliate program
router.post("/apply", async (req, res) => {
  try {
    const teacherId = req.headers["teacher-id"];
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized: No teacher ID provided" });
    }

    // Verify teacher exists
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    console.log('Found teacher:', teacher.email);

    // Check if already applied
    const existingApplication = await Affiliate.findOne({ teacherId });
    if (existingApplication) {
      return res.status(400).json({
        message: "Already applied for the affiliate program",
        status: existingApplication.status,
        metrics: existingApplication.metrics,
        contractUrl: existingApplication.contractUrl
      });
    }

    // Check eligibility
    const { isEligible, metrics } = await checkEligibility(teacherId);

    let contractUrl = null;
    if (isEligible) {
      const contractPath = await generateContract(teacher, metrics);
      contractUrl = `/contracts/${path.basename(contractPath)}`;
    }

    // Create affiliate application
    const affiliate = new Affiliate({
      teacherId,
      status: isEligible ? "accepted" : "rejected",
      metrics,
      contractUrl,
      acceptedAt: isEligible ? Date.now() : null,
      perks: isEligible ? [
        "higher_revenue_share",
        "priority_support",
        "special_badge",
        "featured_courses"
      ] : []
    });

    await affiliate.save();

    res.json({
      success: true,
      message: isEligible 
        ? "Congratulations! You've been accepted into the SkillMate Affiliate Program" 
        : "Sorry, you don't meet the requirements for the affiliate program at this time",
      status: isEligible ? "accepted" : "rejected",
      metrics,
      contractUrl: isEligible ? contractUrl : null
    });
  } catch (error) {
    console.error("Error in affiliate application:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get affiliate status
router.get("/status", async (req, res) => {
  try {
    const teacherId = req.headers["teacher-id"];
    if (!teacherId) {
      return res.status(401).json({ message: "Unauthorized: No teacher ID provided" });
    }

    // Verify teacher exists
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    console.log('Checking status for teacher:', teacher.email);

    const affiliate = await Affiliate.findOne({ teacherId });
    if (!affiliate) {
      return res.json({ 
        status: "not_applied",
        message: "You haven't applied for the affiliate program yet"
      });
    }

    res.json({
      status: affiliate.status,
      metrics: affiliate.metrics,
      contractUrl: affiliate.contractUrl,
      perks: affiliate.perks
    });
  } catch (error) {
    console.error("Error fetching affiliate status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Generate PDF contract
const generateContract = async (teacher, metrics) => {
  const doc = new PDFDocument();
  const contractDir = path.join(__dirname, "../contracts");
  
  // Create contracts directory if it doesn't exist
  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir);
  }

  const contractPath = path.join(contractDir, `affiliate_contract_${teacher._id}.pdf`);
  const writeStream = fs.createWriteStream(contractPath);

  return new Promise((resolve, reject) => {
    doc.pipe(writeStream);

    // Contract header
    doc.fontSize(24)
      .text("SkillMate Affiliate Agreement", { align: "center" })
      .moveDown();

    // Teacher details
    doc.fontSize(12)
      .text(`Teacher Name: ${teacher.firstName} ${teacher.lastName}`)
      .text(`Email: ${teacher.email}`)
      .text(`Date: ${new Date().toLocaleDateString()}`)
      .moveDown();

    // Performance metrics
    doc.text("Current Performance Metrics:")
      .text(`Total Students: ${metrics.totalStudents}`)
      .text(`Total Revenue: $${metrics.totalRevenue}`)
      .text(`Average Rating: ${metrics.averageRating.toFixed(1)}`)
      .text(`Total Courses: ${metrics.totalCourses}`)
      .moveDown();

    // Affiliate perks
    doc.text("Affiliate Program Benefits:")
      .text("• Higher Revenue Share (30% → 40%)")
      .text("• Priority Support")
      .text("• Special Affiliate Badge")
      .text("• Featured Course Placement")
      .moveDown();

    // Terms and conditions
    doc.text("Terms and Conditions:", { underline: true })
      .text("1. Maintain quality standards for all courses")
      .text("2. Respond to student inquiries within 48 hours")
      .text("3. Create at least one new course every 3 months")
      .text("4. Maintain an average rating of 3.5 or higher")
      .moveDown();

    // Signatures
    doc.text("Agreed and Accepted:", { underline: true })
      .moveDown()
      .text("SkillMate Representative:", 50, 650)
      .text("_______________________", 50, 670)
      .text("Teacher Signature:", 300, 650)
      .text("_______________________", 300, 670);

    doc.end();

    writeStream.on('finish', () => resolve(contractPath));
    writeStream.on('error', reject);
  });
};

// Serve contract files
router.use('/contracts', express.static(path.join(__dirname, '../contracts')));

module.exports = router;
