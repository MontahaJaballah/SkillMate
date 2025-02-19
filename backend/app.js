const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const dbConfig = require('./config/db.json');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With'],
    exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add pre-flight OPTIONS handling
app.options('*', cors());

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'skill-exchange-app-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// Connect to MongoDB
mongoose.connect(dbConfig.mongodb.url)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected to:', mongoose.connection.host);
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Routes
app.use('/api/users', userRoutes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to Skill Exchange API');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
