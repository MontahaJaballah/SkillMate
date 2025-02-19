const User = require('../models/User');
const { sendBlockNotification } = require('../services/emailService');

async function add(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(200).send("User added successfully");
    } catch (error) {
      res.status(400).send({ error: error.toString() });
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
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(updatedUser);
    } catch (error) {
        res.status(500).send({ error: error.toString() });
    }
}

async function remove(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).send({ error: "User not found" });
        }
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

