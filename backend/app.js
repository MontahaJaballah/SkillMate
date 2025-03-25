const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
const path = require('path');
const cookieParser = require('cookie-parser');

const jwt = require('jsonwebtoken'); 
const http = require('http');
const { Server } = require('socket.io');

const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const chatRoutes = require('./routes/chatRoutes');
const friendRoutes = require('./routes/friendRoutes');
const statsRoutes = require('./routes/statsRoutes');
const compilerRoutes = require('./routes/compilerRoutes');
const dbConfig = require('./config/db.json');

require('./config/passport');

const app = express();

// Middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Content-Length', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag']
};

app.use(cors(corsOptions));

// Parse cookies before session middleware
app.use(cookieParser());

// Parse JSON and URL-encoded bodies (needed for form data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add pre-flight OPTIONS handling
app.options('*', cors(corsOptions));

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

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up Dialogflow credentials path
const dialogflowCredentialsPath = path.resolve(__dirname, 'config', 'skillmateBot.json');

// Always set the environment variable to use our skillmateBot.json
process.env.GOOGLE_APPLICATION_CREDENTIALS = dialogflowCredentialsPath;
console.log('Setting Dialogflow credentials path:', dialogflowCredentialsPath);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/compiler', compilerRoutes);

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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Vite dev server port
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.io connection
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // Handle user connection with their ID
  socket.on('user_connected', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', data); // Broadcast to all clients
  });

  // Handle friend request events
  socket.on('send_friend_request', ({ requesterId, recipientId }) => {
    const recipientSocketId = connectedUsers.get(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('friend_request_received', { requesterId });
    }
  });

  socket.on('accept_friend_request', ({ requesterId, recipientId }) => {
    const requesterSocketId = connectedUsers.get(requesterId);
    if (requesterSocketId) {
      io.to(requesterSocketId).emit('friend_request_accepted', { recipientId });
    }
  });

  socket.on('disconnect', () => {
    // Remove user from connected users
    for (const [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;