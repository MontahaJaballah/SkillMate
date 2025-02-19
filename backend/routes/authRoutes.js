const express = require('express');
const passport = require('passport');
const router = express.Router();

// LinkedIn OAuth Routes
router.get('/auth/linkedin', (req, res, next) => {
    passport.authenticate('linkedin', {
        state: Math.random().toString(36).substring(7)
    })(req, res, next);
});

router.get('/auth/linkedin/callback', 
    passport.authenticate('linkedin', { 
        successRedirect: 'http://localhost:5000/dashboard',
        failureRedirect: 'http://localhost:5000/login',
        failureMessage: true
    })
);

// Get current user
router.get('/auth/current-user', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json(req.user);
});

// Check auth status
router.get('/auth/status', (req, res) => {
    res.json({
        isAuthenticated: req.isAuthenticated(),
        user: req.user
    });
});

// Logout
router.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Error during logout' });
        }
        res.redirect('http://localhost:5000');
    });
});

module.exports = router;
