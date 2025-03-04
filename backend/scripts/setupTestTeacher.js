const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Affiliate = require('../models/Affiliate');
const dbConfig = require('../config/db.json');

async function setupTestTeacher() {
    try {
        await mongoose.connect(dbConfig.mongodb.url);
        console.log('Connected to MongoDB');

        const newUsername = 'teteacher33';
        const newEmail = 'teachertest111@skillmate.com';

        // Clean up all test data
        console.log('Cleaning up existing test data...');
        await User.deleteMany({ 
            $or: [
                { username: newUsername },
                { username: { $regex: /^student\d+$/ } }
            ]
        });
        await Course.deleteMany({ title: { $regex: /^Test Course \d+$/ } });
        await Affiliate.deleteMany({ username: newUsername });
        console.log('Cleaned up test data');

        // Create test teacher
        const hashedPassword = await bcrypt.hash('securePassword123/@', 10);
        const teacher = await User.create({
            firstName: 'Test',
            lastName: 'Teacher',
            username: newUsername,
            email: newEmail,
            password: hashedPassword,
            role: 'teacher',
            isVerified: true,
            bio: 'Experienced test teacher',
            skills: ['Programming', 'Web Development', 'Testing'],
            photoURL: 'https://i.pravatar.cc/150',
            createdAt: new Date()
        });

        console.log('Created new test teacher:', teacher._id);

        // Create test students (30 to ensure we have more than 20 unique)
        const students = [];
        for (let i = 1; i <= 30; i++) {
            const student = await User.create({
                firstName: `Student${i}`,
                lastName: 'Test',
                username: `student${i}_${Math.random().toString(36).substring(7)}`,
                email: `student${i}_${Math.random().toString(36).substring(7)}@test.com`,
                password: hashedPassword,
                role: 'student',
                isVerified: true,
                createdAt: new Date()
            });
            students.push(student);
        }

        console.log('Created test students:', students.length);

        // Create test courses with reviews and students
        const courses = [];
        for (let i = 1; i <= 6; i++) {
            // Add more students to each course (25 instead of 20)
            const courseStudents = students
                .sort(() => 0.5 - Math.random())
                .slice(0, 25)
                .map(s => s._id);

            // Generate reviews with high ratings (4.5-5.0)
            const reviews = courseStudents.map(studentId => ({
                student: studentId,
                rating: 4.5 + (Math.random() * 0.5), // Rating between 4.5 and 5.0
                comment: `Excellent course! Very informative and well-structured. Review ${i}`,
                createdAt: new Date()
            }));

            const course = await Course.create({
                title: `Test Course ${i}`,
                description: `Comprehensive course covering all aspects of topic ${i}`,
                instructor: teacher._id,
                price: 200, // Increased price to ensure higher revenue
                students: courseStudents,
                reviews: reviews,
                rating: reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length,
                createdAt: new Date()
            });
            courses.push(course);
        }

        console.log('Created test courses:', courses.length);

        // Calculate and log metrics
        const uniqueStudents = new Set();
        let totalRevenue = 0;
        let totalRating = 0;
        let reviewCount = 0;

        courses.forEach(course => {
            course.students.forEach(student => uniqueStudents.add(student.toString()));
            totalRevenue += course.price * course.students.length;
            if (course.rating) {
                totalRating += course.rating;
                reviewCount++;
            }
        });

        const averageRating = totalRating / reviewCount;

        console.log('\n📊 Teacher Metrics:');
        console.log('- Total Students:', uniqueStudents.size);
        console.log('- Total Revenue: $', totalRevenue);
        console.log('- Average Rating:', averageRating.toFixed(1));
        console.log('- Total Courses:', courses.length);

        // Check if requirements are met
        const requirementsMet = {
            students: uniqueStudents.size >= 20,
            revenue: totalRevenue >= 500,
            rating: averageRating >= 4.0,
            courses: courses.length >= 5
        };

        console.log('\n✨ Requirements Check:');
        console.log('✓ More than 20 students:', requirementsMet.students, `(${uniqueStudents.size})`);
        console.log('✓ Revenue over $500:', requirementsMet.revenue, `($${totalRevenue})`);
        console.log('✓ Rating over 4.0:', requirementsMet.rating, `(${averageRating.toFixed(1)})`);
        console.log('✓ At least 5 courses:', requirementsMet.courses, `(${courses.length})`);

        console.log('\n🎯 Next Steps:');
        console.log('1. Start the backend and frontend');
        console.log('2. Login with:');
        console.log(`   Email: ${newEmail}`);
        console.log('   Password: securePassword123/@');
        console.log('3. Visit the Affiliate Program page');
        console.log('4. Click "Apply Now"');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        console.log('\n👋 Disconnected from MongoDB');
        await mongoose.disconnect();
    }
}

setupTestTeacher();
