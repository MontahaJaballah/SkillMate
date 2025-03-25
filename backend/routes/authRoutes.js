const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');
const jwt = require('jsonwebtoken');
const CertificateValidationService = require('../services/certificateValidation');
const validator = new CertificateValidationService();

const { sendWelcomeEmail } = require('../services/emailServiceUser');
const { sendSMS } = require('../services/smsService');

// Debug middleware for all routes
router.use((req, res, next) => {
    console.log('Auth Route Request:', {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        query: req.query,
        headers: {
            referer: req.headers.referer,
            origin: req.headers.origin
        }
    });
    next();
});

// Signup route
router.post('/signup', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'certificationFile', maxCount: 1 }
]), async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phoneNumber, role, teachingSubjects } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email or username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user object
        const userData = {
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            role,
            teachingSubjects: role === 'teacher' ? JSON.parse(teachingSubjects) : undefined,
            certification: role === 'teacher' ? (req.files?.certificationFile?.[0]?.originalname || 'Uploaded Certificate') : undefined // Set certification field
        };

        // Handle certification file validation for teachers
        let certificationFile = '';
        let certificationStatus = 'pending';
        if (role === 'teacher') {
            if (!req.files?.certificationFile?.[0]) {
                return res.status(400).json({
                    success: false,
                    error: 'Certification file is required for teachers'
                });
            }
            const certFile = req.files.certificationFile[0];
            certificationFile = certFile.path.replace(/\\/g, '/');
            const validationResult = await validator.validateCertificate(certificationFile, certFile.mimetype);
            certificationStatus = validationResult.fileInfo.status;
            if (!validationResult.isValid) {
                await validator.cleanupFile(certificationFile);
                return res.status(400).json({
                    success: false,
                    error: validationResult.message
                });
            }
            userData.certificationFile = certificationFile;
            userData.certificationStatus = certificationStatus;
        }

        // Add photo if provided
        if (req.files?.photo?.[0]) {
            userData.photoURL = req.files.photo[0].path.replace(/\\/g, '/');
        }

        // Create new user
        const user = new User(userData);
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        // Set JWT token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Return success response
        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                photoURL: user.photoURL,
                teachingSubjects: user.teachingSubjects,
                certificationFile: user.certificationFile || '',
                certificationStatus: user.certificationStatus || null
            }
        });
    } catch (error) {
        console.error('Signup Error:', error);
        // Clean up uploaded files if user creation fails
        const fs = require('fs'); // Import fs module here
        if (req.files?.photo?.[0]) {
            fs.unlink(req.files.photo[0].path, (err) => {
                if (err) console.error('Error deleting photo:', err);
            });
        }
        if (req.files?.certificationFile?.[0]) {
            fs.unlink(req.files.certificationFile[0].path, (err) => {
                if (err) console.error('Error deleting certificate:', err);
            });
        }
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// LinkedIn authentication route
router.get('/linkedin', passport.authenticate('linkedin'));

// LinkedIn callback route
router.get('/linkedin/callback', (req, res, next) => {
    passport.authenticate('linkedin', async (err, user, info) => {
        const frontendUrl = req.headers.referer?.includes('5174') ? 'http://localhost:5174' : 'http://localhost:5173';

        if (err) {
            console.error('LinkedIn Auth Error:', err);
            return res.redirect(`${frontendUrl}/auth/signin?error=auth_failed`);
        }

        if (!user) {
            console.error('LinkedIn Auth: No user data');
            return res.redirect(`${frontendUrl}/auth/signin?error=no_user`);
        }

        try {
            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    photoURL: user.photoURL
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '30d' }
            );

            // Set JWT token in HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Always redirect to dashboard after successful LinkedIn auth
            console.log('Successfully authenticated with LinkedIn. Redirecting to dashboard...');
            return res.redirect(`${frontendUrl}/dashboard`);
        } catch (error) {
            console.error('JWT Sign Error:', error);
            return res.redirect(`${frontendUrl}/auth/signin?error=auth_failed`);
        }
    })(req, res, next);
});

// Google Auth routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', async (err, user, info) => {
        const frontendUrl = req.headers.referer?.includes('5174') ? 'http://localhost:5174' : 'http://localhost:5173';

        if (err) {
            console.error('Google Auth Error:', err);
            return res.redirect(`${frontendUrl}/auth/signin?error=auth_failed`);
        }

        if (!user) {
            console.error('Google Auth: No user data');
            return res.redirect(`${frontendUrl}/auth/signin?error=no_user`);
        }

        try {
            // Check if this is a new user
            const isNewUser = info && info.isNewUser;

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '30d' }
            );

            // Set JWT token in HTTP-only cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            // Send welcome email if this is a new user
            if (isNewUser) {
                try {
                    await sendWelcomeEmail(user);
                } catch (emailError) {
                    console.error('Failed to send welcome email:', emailError);
                    // Don't block the auth process if email fails
                }
            }

            // Redirect to dashboard
            return res.redirect(`${frontendUrl}/dashboard`);
        } catch (error) {
            console.error('JWT Sign Error:', error);
            return res.redirect(`${frontendUrl}/auth/signin?error=auth_failed`);
        }
    })(req, res, next);
});

// Sign in endpoint
router.post('/signin', async (req, res) => {
    try {
        console.log('Sign in request received:', {
            body: req.body,
            headers: req.headers
        });

        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Missing credentials:', { email: !!email, password: !!password });
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user by email
        console.log('Finding user with email:', email);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found with email:', email);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // Check if account is deactivated
        if (user.status === 'deactivated') {
            console.log('Deactivated account attempted login:', user.email);
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated. Please reactivate it using your phone number.',
                deactivated: true,
                userId: user._id
            });
        }

        // Check password
        console.log('Checking password for user:', user.email);
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Password does not match for user:', user.email);
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        console.log('Password matched, generating token for user:', user.email);
        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        // Set JWT token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        // Return user data without sensitive information
        const userResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            photoURL: user.photoURL,
            teachingSubjects: user.teachingSubjects
        };

        console.log('Login successful for user:', user.email);
        res.json({
            success: true,
            user: userResponse
        });
    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Check auth status
router.get('/check', async (req, res) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                error: 'Not authenticated',
                isAuthenticated: false
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Get fresh user data from database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                error: 'User not found',
                isAuthenticated: false
            });
        }

        res.json({
            user,
            isAuthenticated: true
        });
    } catch (error) {
        console.error('Auth Check Error:', error);
        res.status(401).json({
            error: 'Invalid token',
            isAuthenticated: false
        });
    }
});

// Status
router.get('/status', (req, res) => {
    const isAuthenticated = req.isAuthenticated();
    res.json({
        isAuthenticated,
        user: isAuthenticated ? req.user : null
    });
});

// Logout route
router.post('/signout', (req, res) => {
    // Clear the authentication cookie
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    
    res.json({ success: true, message: 'Logged out successfully' });
});

// Account deactivation route
router.post('/deactivate', async (req, res) => {
    try {
        const { userId, phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required for account deactivation'
            });
        }

        // Validate phone number format
        if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid phone number format. Please use international format (e.g., +1234567890)'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                phoneNumber: phoneNumber,
                status: 'deactivated'
            },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Request reactivation route
router.post('/reactivate/request', async (req, res) => {
    try {
        const { phoneNumber, userId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (user.phoneNumber !== phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Phone number does not match our records'
            });
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with verification code
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                verificationCode: verificationCode,
                verificationCodeExpires: verificationCodeExpires
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Send SMS with verification code
        const message = `Your SkillMate verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
        await sendSMS(phoneNumber, message);

        // In development mode, also return the code in response
        if (process.env.NODE_ENV !== 'production') {
            console.log('\n=== Account Reactivation ===');
            console.log('Verification code:', verificationCode);
            console.log('==========================\n');

            return res.json({
                success: true,
                message: 'Verification code sent (development mode)',
                verificationCode: verificationCode
            });
        }

        res.json({
            success: true,
            message: 'Verification code sent successfully'
        });
    } catch (error) {
        console.error('Reactivation request error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Verify and reactivate route
router.post('/reactivate/verify', async (req, res) => {
    try {
        const { userId, verificationCode } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        if (!user.verificationCode || !user.verificationCodeExpires) {
            return res.status(400).json({
                success: false,
                error: 'No verification code requested'
            });
        }

        if (Date.now() > user.verificationCodeExpires) {
            return res.status(400).json({
                success: false,
                error: 'Verification code expired'
            });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification code'
            });
        }

        // Update user status
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                status: 'active',
                verificationCode: undefined,
                verificationCodeExpires: undefined
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Generate new JWT token for the reactivated user
        const token = jwt.sign(
            {
                id: updatedUser._id,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        // Set JWT token in HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        const userData = {
            id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            photoURL: updatedUser.photoURL
        };

        res.json({
            success: true,
            user: userData,
            message: 'Account reactivated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;