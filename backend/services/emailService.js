const nodemailer = require('nodemailer');
require('dotenv').config();

// Debug: Check environment variables
console.log('Environment variables check:', {
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
});

// Email configuration for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBlockNotification = async (userEmail, reason) => {
    try {
        const mailOptions = {
            from: {
                name: 'SkillMate',
                address: process.env.EMAIL_USER
            },
            to: userEmail,
            subject: 'Account Blocked - SkillMate',
            html: `
                <h2>Your SkillMate Account Has Been Blocked</h2>
                <p>We regret to inform you that your account has been blocked for the following reason:</p>
                <p><strong>${reason}</strong></p>
                <p>If you believe this was done in error, please contact our support team.</p>
                <br>
                <p>Best regards,</p>
                <p>The SkillMate Team</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✉️ Email sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        console.error('Auth details being used:', {
            user: process.env.EMAIL_USER ? process.env.EMAIL_USER : 'Not set',
            pass: process.env.EMAIL_PASS ? '[HIDDEN]' : 'Not set'
        });
        return false;
    }
};

module.exports = {
    sendBlockNotification
};
