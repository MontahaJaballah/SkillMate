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

const sendBlockNotificationAdmin = async (userEmail, reason) => {
    try {
        const mailOptions = {
            from: {
                name: 'SkillMate',
                address: process.env.EMAIL_USER
            },
            to: userEmail,
            subject: 'Admin Account Blocked - SkillMate',
            html: `
                <h2>Your SkillMate Admin Account Has Been Blocked</h2>
                <p>Due to your <strong>${reason}</strong>, we regret to inform you that your account has been suspended.</p>
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

const sendAdminCredentials = async (userEmail, username, password) => {
    try {
        const mailOptions = {
            from: {
                name: 'SkillMate',
                address: process.env.EMAIL_USER
            },
            to: userEmail,
            subject: 'Your SkillMate Admin Account Credentials',
            html: `
                <h2>Welcome to SkillMate Admin Panel</h2>
                <p>Your admin account has been created successfully. Here are your login credentials:</p>
                <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px;">
                    <p><strong>Username:</strong> ${username}</p>
                    <p><strong>Password:</strong> ${password}</p>
                </div>
                <p>Please change your password after your first login for security purposes.</p>
                <p><strong>Note:</strong> Keep these credentials secure and do not share them with anyone.</p>
                <br>
                <p>Best regards,</p>
                <p>The SkillMate Team</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✉️ Admin credentials sent successfully to:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ Failed to send admin credentials:', error.message);
        return false;
    }
};

// Function to generate a secure random password
const generateSecurePassword = () => {
    const length = 12; // 12 characters for better security
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each: uppercase, lowercase, number, special char
    password += charset.match(/[A-Z]/)[0];
    password += charset.match(/[a-z]/)[0];
    password += charset.match(/[0-9]/)[0];
    password += charset.match(/[!@#$%^&*]/)[0];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

module.exports = {
    sendBlockNotificationAdmin,
    sendAdminCredentials,
    generateSecurePassword
};
