const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const upload = require('../middleware/upload');

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
        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const userData = { ...req.body };
        
        // Handle photo file upload
        if (req.files && req.files.photo) {
            const photo = req.files.photo[0];
            userData.photoURL = `/uploads/photos/${photo.filename}`;
        }

        // Handle certification file upload
        if (req.files && req.files.certificationFile) {
            const cert = req.files.certificationFile[0];
            userData.certificationFile = `/uploads/certifications/${cert.filename}`;
        }

        // Hash password if provided
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        // Parse teaching subjects if provided as string
        if (typeof userData.teachingSubjects === 'string') {
            userData.teachingSubjects = JSON.parse(userData.teachingSubjects);
        }

        const newUser = new User(userData);
        await newUser.save();

        // Log in the user after signup
        req.login(newUser, (err) => {
            if (err) {
                console.error('Session creation error:', err);
                return res.status(500).json({ message: 'Error creating session' });
            }

            // Create user response object without sensitive data
            const userResponse = {
                message: 'User created successfully',
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    photoURL: newUser.photoURL,
                    teachingSubjects: newUser.teachingSubjects
                }
            };

            res.status(201).json(userResponse);
        });
    } catch (error) {
        console.error('Error in user creation:', error);
        res.status(500).json({ message: error.message });
    }
});

// LinkedIn authentication route
router.get('/linkedin', passport.authenticate('linkedin'));

// LinkedIn callback route
router.get('/linkedin/callback', (req, res, next) => {
    passport.authenticate('linkedin', (err, user, info) => {
        if (err) {
            console.error('LinkedIn Auth Error:', err);
            return res.redirect('http://localhost:5173/auth/signin?error=auth_failed');
        }
        
        if (!user) {
            console.error('No user data:', info);
            return res.redirect('http://localhost:5173/auth/signin?error=no_user');
        }

        // Log the user in
        req.login(user, (err) => {
            if (err) {
                console.error('Session creation error:', err);
                return res.redirect('http://localhost:5173/auth/signin?error=session_failed');
            }

            // Successful authentication, redirect home
            res.redirect('http://localhost:5173/');
        });
    })(req, res, next);
});

// Sign in endpoint
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Log in the user
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Error logging in' });
            }
            return res.json({ user });
        });
    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
router.get('/check', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ 
        user: req.user,
        isAuthenticated: true
    });
});

// Check auth status
router.get('/status', (req, res) => {
    const isAuthenticated = req.isAuthenticated();
    res.json({
        isAuthenticated,
        user: isAuthenticated ? req.user : null
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Error during logout' });
        }
        res.redirect('http://localhost:5173/auth/signin');
    });
});

module.exports = router;
