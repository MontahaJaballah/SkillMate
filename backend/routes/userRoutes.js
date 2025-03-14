const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/User');
const upload = require('../middleware/upload');
const path = require('path');
const chatController = require("../controllers/chatController");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadDir = path.join(__dirname, '../uploads/certifications');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Check if email exists
router.get("/check-email/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// All routes
router.post("/adduser", upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certificationFile', maxCount: 1 }
]), userController.add);

router.post("/login", userController.login);
router.delete('/deleteuser/:id', userController.remove);

router.post('/updateuser/:id', upload.fields([
  { name: 'photo', maxCount: 1 },
  { name: 'certificationFile', maxCount: 1 }
]), userController.update);

router.get("/allusers", userController.getAll);
router.get("/user/:id", userController.getById);
router.post('/deactivate', userController.deactivate);
router.post('/reactivate/send-code', userController.reactivateWithPhone);
router.post('/reactivate/verify', userController.verifyAndReactivate);

// Sub-admin and user blocking routes
router.post("/addsubadmin", userController.addSubAdmin);
router.put("/blockuser/:id", userController.blockUser);
router.put("/unblockuser/:id", userController.unblockUser);
router.get("/searchuser/:username", userController.searchByUsername);

// Chat route
router.post("/chat", chatController.chat);

// Serve uploaded files
router.get('/uploads/photos/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/photos', req.params.filename);
  res.sendFile(filePath);
});

router.get('/uploads/certifications/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/certifications', req.params.filename);
  res.sendFile(filePath);
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  console.log("Password reset request for email:", email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("User found:", user.email);

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    console.log("Token generated");

    // Store token and its expiration (1 hour) in database
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    console.log("Token saved in database");

    // Configure email transporter with more options
    const transportConfig = {
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      debug: true, // Enable debug mode
      logger: true // Enable detailed logs
    };

    console.log("Complete email configuration:", {
      ...transportConfig,
      auth: {
        user: transportConfig.auth.user,
        passLength: transportConfig.auth.pass?.length || 0
      }
    });

    const transporter = nodemailer.createTransport(transportConfig);

    // Verify configuration
    try {
      console.log("Verifying SMTP configuration...");
      await transporter.verify();
      console.log("SMTP configuration validated!");
    } catch (verifyError) {
      console.error("SMTP configuration error:", verifyError);
      throw new Error(`SMTP configuration error: ${verifyError.message}`);
    }

    // Email content
    const mailOptions = {
      to: user.email,
      from: {
        name: "SkillMate Support",
        address: process.env.EMAIL_USER
      },
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) has requested a password reset for your account.\n\n
          Please click on the following link or paste it into your browser to reset your password:\n\n
          http://localhost:5173/reset-password/${token}\n\n
          This link will expire in 1 hour.\n\n
          If you did not request this reset, please ignore this email.\n\n
          Best regards,\n
          SkillMate Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6200ea;">Password Reset Request</h2>
          <p>You are receiving this email because you (or someone else) has requested a password reset for your account.</p>
          <p>Please click the button below to reset your password:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/reset-password/${token}" 
               style="background-color: #6200ea; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset My Password
            </a>
          </p>
          <p style="color: #666;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you did not request this reset, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Best regards,<br>SkillMate Team</p>
        </div>
      `
    };

    console.log("Attempting to send email to:", user.email);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully, ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token hasn't expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;