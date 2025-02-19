const User = require('../models/User');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const { sendBlockNotification } = require('../services/emailService');

async function add(req, res) {
    try {
        console.log('Received registration data:', req.body);
        
        const userData = { ...req.body };
        
        // Handle file upload
        if (req.file) {
            console.log('File received:', req.file);
            userData.certificationFile = req.file.path;
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
                role: user.role
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

        // Handle file upload
        if (req.file) {
            // Delete old file if it exists
            const oldUser = await User.findById(req.params.id);
            if (oldUser && oldUser.certificationFile) {
                fs.unlink(oldUser.certificationFile, (err) => {
                    if (err) console.error('Error deleting old file:', err);
                });
            }
            userData.certificationFile = req.file.path;
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

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the password (no encryption or hashing)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Send response if login is successful
        res.status(200).json({ message: "Login successful", user: { id: user._id, username: user.username, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ error: error.message });
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



module.exports = {add,remove,update,getAll,getById,login,searchByUsername,addSubAdmin,blockUser,unblockUser};

