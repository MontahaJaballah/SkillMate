const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/stats/total-users', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching total users" });
    }
});

router.get('/stats/new-mentors', async (req, res) => {
    try {
        // Assuming you have a way to determine new mentors, 
        // e.g., mentors created in the last week
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const count = await User.countDocuments({
            role: 'mentor',
            createdAt: { $gte: oneWeekAgo }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching new mentors" });
    }
});

router.get('/stats/total-users-last-month', async (req, res) => {
    try {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const count = await User.countDocuments({
            createdAt: {
                $gte: oneMonthAgo,
                $lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching total users from last month" });
    }
});

router.get('/stats/new-mentors-last-week', async (req, res) => {
    try {
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const count = await User.countDocuments({
            role: 'mentor',
            createdAt: {
                $gte: twoWeeksAgo,
                $lt: oneWeekAgo
            }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: "Error fetching new mentors from last week" });
    }
});

module.exports = router;