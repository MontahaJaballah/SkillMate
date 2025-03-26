const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const http = require('http'); // Add this import for creating the server
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const chessRoutes = require('./routes/chessRoutes');
const dbConfig = require('./config/db.json');

require('./config/passport');

const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag']
}));

// Parse cookies before session middleware
app.use(cookieParser());

// Parse JSON and URL-encoded bodies (needed for form data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add pre-flight OPTIONS handling
app.options('*', cors());

// Session middleware with secure configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'skill-exchange-app-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    name: 'skillmate.sid',
    proxy: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    }
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

// JWT Authentication middleware
app.use((req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
            req.isAuthenticated = () => true;
        } catch (error) {
            req.user = null;
            req.isAuthenticated = () => false;
        }
    } else {
        req.user = null;
        req.isAuthenticated = () => false;
    }
    next();
});

// Debug middleware for session
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Is Authenticated:', req.isAuthenticated());
    console.log('User:', req.user);
    next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/chess', chessRoutes);

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something broke!' });
});

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(dbConfig.mongodb.url)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // Use server.listen instead of app.listen
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;