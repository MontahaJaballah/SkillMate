const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Get user from database
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if user is active
        if (user.status === 'deactivated') {
            return res.status(401).json({ error: 'Account is deactivated' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ error: 'Admin access required' });
};

module.exports = {
    isAuthenticated,
    isAdmin
};
