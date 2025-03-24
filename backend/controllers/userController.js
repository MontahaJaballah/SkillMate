const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { sendBlockNotificationUser } = require('../services/emailServiceUser');
const { sendBlockNotificationAdmin, sendAdminCredentials, generateSecurePassword } = require('../services/emailServiceAdmin');
const twilio = require('twilio');
const CertificateValidationService = require('../services/certificateValidation');
const validator = new CertificateValidationService();
const crypto = require('crypto'); // Added for file hashing

// Create uploads directory and subdirectories if they don't exist
const uploadDir = path.join(__dirname, '../uploads');
const photosDir = path.join(uploadDir, 'photos');
const certsDir = path.join(uploadDir, 'certifications');

[uploadDir, photosDir, certsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

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
 
            const filePath = path.join(photosDir, fileName);


            await photoFile.mv(filePath);
            photoURL = `/uploads/photos/${fileName}`;
            userData.photoURL = photoURL;
        }

        // Handle certification file upload and validation
        let certificationFile = '';
        let certificationStatus = 'pending'; // Default to pending, will be updated based on validation
        if (req.files && req.files.certificationFile) {
            const certFile = req.files.certificationFile;
            const fileName = `${Date.now()}-${certFile.name}`;
            const filePath = path.join(certsDir, fileName);

            // Compute file hash for debugging
            const fileBuffer = fs.readFileSync(certFile.tempFilePath || certFile.path);
            const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
            console.log('Certificate file details:', {
                name: certFile.name,
                mimeType: certFile.mimetype,
                size: certFile.size,
                path: filePath,
                hash: fileHash
            });


            await certFile.mv(filePath);
            certificationFile = `/uploads/certifications/${fileName}`;

            // Validate certificate only for teachers
            if (userData.role === 'teacher') {
                const validationResult = await validator.validateCertificate(filePath, certFile.mimetype);
                certificationStatus = validationResult.fileInfo.status;
                if (!validationResult.isValid) {
                    console.log('Certificate validation failed, rejecting signup.');
                    await validator.cleanupFile(filePath); // Clean up invalid file
                    return res.status(400).json({
                        success: false,
                        error: validationResult.message,
                    });
                }
            }
        } else if (userData.role === 'teacher') {
            // No certificate uploaded for teacher
            console.log('No certificate uploaded for teacher, rejecting signup.');
            return res.status(400).json({
                success: false,
                error: 'Certificate file is required for teachers.',
            });
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

        // Add certification fields to user data if teacher
        if (userData.role === 'teacher') {
            userData.certificationFile = certificationFile;
            userData.certificationStatus = certificationStatus;
        }

        const user = new User(userData);
        await user.save();

        console.log('User created successfully');
        // Send back more complete user data
        const userResponse = {
            success: true,
            message: "User added successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
                role: user.role,
                photoURL: user.photoURL,
                teachingSubjects: user.teachingSubjects || [],
                certificationFile: user.certificationFile || '',
                certificationStatus: user.certificationStatus || null, // Include certificationStatus
            }
        };
        console.log('Sending response:', userResponse);
        res.status(200).json(userResponse);
    } catch (error) {
        console.error('Error in user registration:', error);

        // Clean up uploaded files if user creation fails
        const cleanupFiles = [];
        if (req.files?.photo) cleanupFiles.push(req.files.photo.path);
        if (req.files?.certificationFile) cleanupFiles.push(req.files.certificationFile.path);

        cleanupFiles.forEach(filePath => {
            fs.unlink(filePath, (err) => {

                if (err) console.error('Error deleting file:', err);
            });
        });

        // Send more detailed error message
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            res.status(400).json({
                success: false,
                error: `This ${field} is already registered. Please use a different ${field}.`
            });
        } else if (error.name === 'ValidationError') {
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

async function update(req, res) {
    try {
        const userData = { ...req.body };

        let photoURL = '';
        if (req.files && req.files.photo) {
            const photoFile = req.files.photo;
            const fileName = `${Date.now()}-${photoFile.name}`;
            const filePath = path.join(photosDir, fileName);


            await photoFile.mv(filePath);
            photoURL = `/uploads/photos/${fileName}`;
            userData.photoURL = photoURL;
        }

        let certificationFile = '';
        if (req.files && req.files.certificationFile) {
            const certFile = req.files.certificationFile;
            const fileName = `${Date.now()}-${certFile.name}`;
            const filePath = path.join(certsDir, fileName);

            await certFile.mv(filePath);
            certificationFile = `/uploads/certifications/${fileName}`;
            userData.certificationFile = certificationFile;
        }

        if (typeof userData.teachingSubjects === 'string') {
            try {
                userData.teachingSubjects = JSON.parse(userData.teachingSubjects);
            } catch (e) {
                console.error('Error parsing teaching subjects:', e);
                userData.teachingSubjects = [];
            }
        }

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
        if (req.files?.photo) {
            fs.unlink(req.files.photo.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
        if (req.files?.certificationFile) {
            fs.unlink(req.files.certificationFile.path, (err) => {
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

async function updateA(req, res) {
    try {
        const { id } = req.params;

        // Validate required fields
        if (!id) {
            return res.status(400).send({ error: "Admin ID is required" });
        }

        // Update the user by ID with the provided data
        const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }

        // Return the updated user
        res.status(200).send(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ error: error.toString() });
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
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (user.status === 'deactivated') {
            return res.status(403).json({
                message: 'Account is deactivated. Please reactivate it using your phone number.',
                deactivated: true,
                userId: user._id
            });
        }

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
        const query = req.params.query;
        const users = await User.find({
            $or: [
                { username: new RegExp(query, 'i') },
                { firstName: new RegExp(query, 'i') },
                { lastName: new RegExp(query, 'i') },
                { email: new RegExp(query, 'i') }
            ],
            role: { $ne: 'admin' } // Exclude admin users from search
        }).select('-password -verificationCode'); // Exclude sensitive fields
        
        res.status(200).json(users);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: "Error searching users" });
    }
}

async function deactivate(req, res) {
    try {
        const { userId, phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({ message: 'Phone number is required for account deactivation' });
        }

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

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

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
    updateAdmin,
    updateA,
    getAllAdmins,
    getAllUsers,
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