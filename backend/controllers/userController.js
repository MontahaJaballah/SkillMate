const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { sendBlockNotification } = require('../services/emailService');
const twilio = require('twilio');

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

async function add(req, res) {
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
            photoURL = `/uploads/photos/${fileName}`;
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

async function getAll(req, res) {
    try {
        const users = await User.find();
        res.status(200).send(users);
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

async function update(req, res) {
    try {
        const userData = { ...req.body };

        // Handle photo file upload
        let photoURL = '';
        if (req.files && req.files.photo) {
            const photoFile = req.files.photo;
            const fileName = `${Date.now()}-${photoFile.name}`;
            const filePath = path.join(uploadDir, 'photos', fileName);
            
            await photoFile.mv(filePath);
            photoURL = `/uploads/photos/${fileName}`;
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
            userData,
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
        const { username, email, password } = req.body;
        const subAdmin = new User({
            username,
            email,
            password,
            role: 'admin'
        });
        await subAdmin.save();
        res.status(201).json({ message: 'Sub-admin created successfully', subAdmin });
    } catch (error) {
        res.status(400).send({ error: error.toString() });
    }
}

async function blockUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'Cannot block an admin user' });
        }

        user.isBlocked = true;
        user.blockReason = req.body.reason;
        await user.save();

        if (req.body.sendEmail) {
            console.log('📧 Sending block notification email to user:', user.email);
            await sendBlockNotification(user.email, req.body.reason);
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
        await user.save();
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
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is deactivated
        if (user.status === 'deactivated') {
            return res.status(403).json({ 
                message: 'Account is deactivated. Please reactivate it using your phone number.',
                deactivated: true,
                userId: user._id 
            });
        }

        // Send user data without sensitive information
        const userData = {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            status: user.status,
            photoURL: user.photoURL
        };

        res.json({ user: userData });
    } catch (error) {
        res.status(500).json({ message: error.message });
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

module.exports = {
    add,
    remove,
    update,
    getAll,
    getById,
    login,
    searchByUsername,
    addSubAdmin,
    blockUser,
    unblockUser,
    deactivate,
    reactivateWithPhone,
    verifyAndReactivate
};
