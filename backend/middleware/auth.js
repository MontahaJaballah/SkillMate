const authMiddleware = (req, res, next) => {
    // Check if req.user is set by the JWT middleware in app.js
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in to access this resource' });
    }
    // If req.user exists, the user is authenticated; proceed to the next middleware/route handler
    next();
};

module.exports = authMiddleware;