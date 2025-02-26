const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');
const User = require('./models/User');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const dbConfig = require('./config/db.json');

// Import passport config
require('./config/passport');

const app = express();

// CORS configuration with specific origins and credentials support
const corsOptions = {
    origin: function (origin, callback) {
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:5173',  // Vue dev server
            'http://localhost:5174',  // Vite dev server
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174'
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,  // Enable credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag']
};

// Apply CORS middleware with specific options
app.use(cors(corsOptions));

// Middleware configuration
app.use(cookieParser());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add pre-flight OPTIONS handling
// app.use(cors()); // Removed this line as it's already handled by the corsOptions

// Use connect-mongo for session storage if available
let sessionStore;
try {
    const MongoStore = require('connect-mongo');
    sessionStore = MongoStore.create({
        mongoUrl: dbConfig.mongodb.url,
        autoRemove: 'interval',
        autoRemoveInterval: 10 // Remove expired sessions every 10 minutes
    });
} catch (error) {
    console.warn('connect-mongo not installed. Using MemoryStore for sessions.');
    sessionStore = new session.MemoryStore();
}

// Session middleware configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'skill-exchange-app-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    name: 'skillmate.sid',
    store: sessionStore,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Passport initialization AFTER session middleware
app.use(passport.initialize());
app.use(passport.session());

// Passport session serialization
passport.serializeUser((user, done) => {
    try {
        done(null, user.id);
    } catch (error) {
        console.error('Passport Serialize Error:', error);
        done(error);
    }
});

passport.deserializeUser(async (id, done) => {
    try {
        if (!id) {
            return done(new Error('No user ID provided'));
        }
        const user = await User.findById(id).select('-password');
        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        console.error('Passport Deserialize Error:', error);
        done(error);
    }
});
// Debug middleware for session
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Is Authenticated:', req.isAuthenticated());
    next();
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something broke!' });
});

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(dbConfig.mongodb.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit process with failure
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
