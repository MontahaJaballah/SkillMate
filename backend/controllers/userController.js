const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { sendBlockNotificationUser } = require('../services/emailServiceUser');
const { sendBlockNotificationAdmin, sendAdminCredentials, generateSecurePassword } = require('../services/emailServiceAdmin');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');  // Ensure this line is present
const detectIntent = require('../dialogflowService');
const uuid = require('uuid');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Initialize Twilio client only if credentials are available
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    console.log('Initializing Twilio with:', {
        accountSid: `${process.env.TWILIO_ACCOUNT_SID.substring(0, 6)}...`,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
    });
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
} else {
    console.log('Missing Twilio credentials');
}

async function addUser(req, res) {
    try {
        console.log('Received registration data:', req.body);

        const userData = { ...req.body };

        // Handle photo file upload
        let photoURL = '';
        if (req.files && req.files.photo) {
            const photoFile = req.files.photo;
            const fileName = `${Date.now()}-${photoFile.name}`;
            const filePath = path.join(uploadDir, 'photos', fileName);

            await photoFile.mv(filePath);
            photoURL = `http://localhost:5000/uploads/photos/${fileName}`;
        }

        // Handle certification file upload
        let certificationFile = '';
        if (req.files && req.files.certificationFile) {
            const certFile = req.files.certificationFile;
            const fileName = `${Date.now()}-${certFile.name}`;
            const filePath = path.join(uploadDir, 'certifications', fileName);

            await certFile.mv(filePath);
            certificationFile = `/uploads/certifications/${fileName}`;
        }

        // Parse teaching subjects if they're sent as a string
        if (typeof userData.teachingSubjects === 'string') {
            try {
                userData.teachingSubjects = JSON.parse(userData.teachingSubjects);
                console.log('Parsed teaching subjects:', userData.teachingSubjects);
            } catch (e) {
                console.error('Error parsing teaching subjects:', e);
                userData.teachingSubjects = [];
            }
        }

        // Hash password
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });

        const user = new User(userData);
        await user.save();

        console.log('User created successfully');
        // Send back the user data (excluding sensitive information)
        const userResponse = {
            success: true,
            message: "User added successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                photoURL: user.photoURL
            }
        };
        console.log('Sending response:', userResponse);
        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error in user registration:', error);

        // Clean up uploaded file if user creation fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        // Send more detailed error message
        if (error.code === 11000) {
            // Duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                success: false,
                error: `This ${field} is already registered. Please use a different ${field}.`
            });
        } else if (error.name === 'ValidationError') {
            // Mongoose validation error
            const errors = Object.values(error.errors).map(err => err.message);
            res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Registration failed. Please try again.',
                details: error.message
            });
        }
    }
}

async function getAllUsers(req, res) {
    try {
        const users = await User.find({ role: { $in: ['student', 'teacher'] } });
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function getAllAdmins(req, res) {
    try {
        const admins = await User.find({ role: 'admin' });
        res.status(200).send(admins);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function getById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

//Select profile photo
async function update(req, res) {
    try {
        const userData = { ...req.body };

        // Handle photo file upload
        let photoURL = req.user.photoURL; // Keep existing photo URL if no new photo
        if (req.files && req.files.photo) {
            const photoFile = req.files.photo;
            const fileName = `${Date.now()}-${photoFile.name}`;
            const filePath = path.join(uploadDir, 'photos', fileName);

            await photoFile.mv(filePath);
            photoURL = `http://localhost:5000/uploads/photos/${fileName}`;

            // Delete old photo if it exists
            if (req.user.photoURL) {
                const oldPhotoPath = req.user.photoURL.replace('http://localhost:5000', '');
                const fullOldPhotoPath = path.join(__dirname, '..', oldPhotoPath);
                if (fs.existsSync(fullOldPhotoPath)) {
                    fs.unlinkSync(fullOldPhotoPath);
                }
            }
        }

        // Handle certification file upload
        let certificationFile = '';
        if (req.files && req.files.certificationFile) {
            const certFile = req.files.certificationFile;
            const fileName = `${Date.now()}-${certFile.name}`;
            const filePath = path.join(uploadDir, 'certifications', fileName);

            await certFile.mv(filePath);
            certificationFile = `/uploads/certifications/${fileName}`;
        }

        // Parse teaching subjects if they're sent as a string
        if (typeof userData.teachingSubjects === 'string') {
            try {
                userData.teachingSubjects = JSON.parse(userData.teachingSubjects);
            } catch (e) {
                console.error('Error parsing teaching subjects:', e);
                userData.teachingSubjects = [];
            }
        }

        // Hash password if it's being updated
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { ...userData, photoURL },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(updatedUser);
    } catch (error) {
        // Clean up uploaded file if update fails
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        res.status(500).send({ error: error.toString() });
    }
}

async function remove(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }

        // Delete certification file if it exists
        if (user.certificationFile) {
            fs.unlink(user.certificationFile, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        await user.remove();
        res.status(200).send({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function addSubAdmin(req, res) {
    try {
        const { username, firstName, lastName, email, sendCredentials } = req.body;

        // Check if required fields are present
        if (!username || !firstName || !lastName || !email) {
            return res.status(400).json({
                success: false,
                message: 'All fields (username, firstName, lastName, email) are required'
            });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `${existingUser.username === username ? 'Username' : 'Email'} already exists`
            });
        }

        // Generate a secure password
        const generatedPassword = generateSecurePassword();

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        const subAdmin = new User({
            username,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: 'admin'
        });

        await subAdmin.save();

        // Send credentials via email
        const emailSent = await sendAdminCredentials(email, username, generatedPassword);

        res.status(201).json({
            message: 'Sub-admin created successfully' + (emailSent ? '. Credentials sent via email.' : ''),
            success: true,
            emailSent
        });
    } catch (error) {
        console.error('Error creating sub-admin:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create sub-admin account'
        });
    }
}

async function updateAdmin(req, res) {
    try {
        const { username, firstName, lastName, email, phoneNumber } = req.body;

        // Check if required fields are present
        if (!username || !firstName || !lastName || !email || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields (username, firstName, lastName, email, phoneNumber) are required'
            });
        }

        // Check if username or email already exists for other users
        const existingUser = await User.findOne({
            $and: [
                { _id: { $ne: req.params.id } },
                {
                    $or: [
                        { username },
                        { email },
                        { phoneNumber }
                    ]
                }
            ]
        });

        if (existingUser) {
            let errorMessage = '';
            if (existingUser.username === username) {
                errorMessage = 'Username already exists';
            } else if (existingUser.email === email) {
                errorMessage = 'Email already exists';
            } else if (existingUser.phoneNumber === phoneNumber) {
                errorMessage = 'Phone number already in use';
            }

            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }


        const updatedAdmin = await User.findByIdAndUpdate(
            req.params.id,
            {
                username,
                firstName,
                lastName,
                email,
                phoneNumber
            },
            { new: true, runValidators: true }
        );

        if (!updatedAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Admin updated successfully',
            admin: updatedAdmin
        });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update admin'
        });
    }
}

async function blockUser(req, res) {
    try {
        // Only retrieve the user by ID
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('📧user found:', user.username);
        // Block the user and set the reason

        user.isBlocked = true;
        user.blockReason = req.body.reason;
        user.status = 'deactivated'
        await user.save({ validateModifiedOnly: true }); // ✅ Only validates changed fields

        // Optionally send an email notification if required
        if (req.body.sendEmail) {
            console.log('📧 Sending block notification email to user:', user.email);
            if (user.role === 'user') {
                await sendBlockNotificationUser(user.email, req.body.reason);
            }
            else {
                await sendBlockNotificationAdmin(user.email, req.body.reason);
            }
        }

        res.status(200).json({
            message: 'User blocked successfully',
            emailSent: req.body.sendEmail
        });
    } catch (error) {
        console.error('❌ Error in blockUser:', error.message);
        res.status(500).send({ error: error.toString() });
    }
}

async function unblockUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        user.isBlocked = false;
        user.blockReason = null
        user.status = 'active'

        await user.save({ validateModifiedOnly: true }); // ✅ Only validates changed fields
        res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (user.isBlocked === true) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked.',
                details: {
                    reason: user.blockReason,
                    userId: user._id
                }
            });
        }

        // Check if account is deactivated
        if (user.status === 'deactivated') {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please reactivate it using your phone number.',
                deactivated: true,
                userId: user._id
            });
        }

        // Update user's online status
        user.isOnline = true;
        user.lastActive = new Date();
        await user.save();

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

        // Send user data without sensitive information
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            status: user.status,
            photoURL: user.photoURL,
            isOnline: user.isOnline
        };

        return res.status(200).json({
            success: true,
            user: userData,
            token: token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
}

async function searchByUsername(req, res) {
    try {
        const users = await User.find({ username: new RegExp(req.params.username, 'i') });
        res.status(200).send(users);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function logout(req, res) {
    try {
        // Get user ID from JWT token
        const userId = req.user ? req.user.id : null;
        
        if (userId) {
            // Update user's online status
            await User.findByIdAndUpdate(userId, {
                isOnline: false,
                lastActive: new Date()
            });
        }
        
        // Clear the token cookie
        res.clearCookie('token');
        
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
            error: error.message
        });
    }
}

async function deactivate(req, res) {
    try {
        const { userId, phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required for account deactivation' });
        }

        // Validate phone number format
        if (!/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
            return res.status(400).json({
                message: 'Invalid phone number format. Please use international format (e.g., +1234567890)'
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
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function reactivateWithPhone(req, res) {
    try {
        const { phoneNumber, userId } = req.body;
        console.log('Attempting reactivation for:', { userId, phoneNumber });

        const user = await User.findById(userId);

        if (!user) {
            console.log('User not found:', userId);
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.phoneNumber !== phoneNumber) {
            console.log('Phone number mismatch:', {
                provided: phoneNumber,
                stored: user.phoneNumber
            });
            return res.status(400).json({ message: 'Phone number does not match our records' });
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update user with verification code using findByIdAndUpdate
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                verificationCode: verificationCode,
                verificationCodeExpires: verificationCodeExpires
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send SMS with verification code
        if (!twilioClient) {
            return res.status(500).json({ message: 'SMS service not configured' });
        }

        try {
            const message = await twilioClient.messages.create({
                body: `Your SkillMate verification code is: ${verificationCode}. Valid for 10 minutes.`,
                to: phoneNumber,
                from: process.env.TWILIO_PHONE_NUMBER
            });

            console.log('SMS sent successfully:', {
                to: phoneNumber,
                messageId: message.sid,
                status: message.status
            });

            // In development mode, also log the verification code
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode - verification code:', verificationCode);
            }

            res.json({ message: 'Verification code sent successfully' });
        } catch (twilioError) {
            console.error('Twilio error:', twilioError);

            // In development mode, return the code even if SMS fails
            if (process.env.NODE_ENV === 'development') {
                console.log('Development mode - verification code (SMS failed):', verificationCode);
                return res.json({
                    message: 'SMS failed but code generated (development mode)',
                    verificationCode: verificationCode
                });
            }

            res.status(500).json({ message: 'Failed to send verification code' });
        }
    } catch (error) {
        console.warn('Reactivation error:', error);
        res.status(500).json({ message: error.message });
    }
}

async function verifyAndReactivate(req, res) {
    try {
        const { userId, verificationCode } = req.body;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.verificationCode || !user.verificationCodeExpires) {
            return res.status(400).json({ message: 'No verification code requested' });
        }

        if (Date.now() > user.verificationCodeExpires) {
            return res.status(400).json({ message: 'Verification code expired' });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Update user status using findByIdAndUpdate
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
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            status: updatedUser.status,
            photoURL: updatedUser.photoURL
        };

        res.json({ user: userData, message: 'Account reactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get online users
async function getOnlineUsers(req, res) {
    try {
        const onlineUsers = await User.find({ isOnline: true });
        res.status(200).send(onlineUsers);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

// Chat with Dialogflow
async function chat(req, res) {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ 
            error: "Message is required"
        });
    }
    
    // Check if Dialogflow environment variables are set
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return res.status(503).json({ 
            error: "The chatbot service is not configured properly. Please contact the administrator.",
            details: "Missing Dialogflow credentials"
        });
    }
    
    try {
        // Generate a unique session ID for each user or use their user ID if authenticated
        const sessionId = req.user ? req.user._id.toString() : uuid.v4();
        
        // Call our detectIntent function
        const response = await detectIntent(message, sessionId);
        res.json({ reply: response });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        let errorMessage = "An error occurred while processing your message.";
        
        if (error.code === 7 && error.details && error.details.includes('IAM permission')) {
            errorMessage = "The chatbot is currently unavailable due to authentication issues. Please try again later.";
            // Log detailed error for debugging
            console.error("Dialogflow authentication error. Please check:\n",
                "1. Service account permissions (needs Dialogflow API Client role)\n",
                "2. Dialogflow API is enabled\n",
                "3. Service account key file is valid and accessible");
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    addUser,
    update,
    remove,
    getAllUsers,
    getAllAdmins,
    getById,
    addSubAdmin,
    updateAdmin,
    blockUser,
    unblockUser,
    login,
    searchByUsername,
    logout,
    deactivate,
    reactivateWithPhone,
    verifyAndReactivate,
    getOnlineUsers,
    chat
};
