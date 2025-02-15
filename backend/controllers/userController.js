const User = require('../models/User');

// Async function to show all users
const showAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .populate('skillsInterested', 'name')
            .populate('exchanges', 'name')
            .populate('reviews', 'content rating')
            .populate('courses', 'title description');

        return res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Async function to show a user by ID
const showUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('skillsInterested', 'name')
            .populate('exchanges', 'name')
            .populate('reviews', 'content rating')
            .populate('courses', 'title description');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    showAllUsers,
    showUserById
};
