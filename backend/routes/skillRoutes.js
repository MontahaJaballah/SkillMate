const express = require('express');
const { addSkill, getAllSkills, getUserSkills } = require('../controllers/skillController');

const router = express.Router();

// Add a new skill
router.post('/add', addSkill);

// Get all skills
router.get('/allskills', getAllSkills);

// Get user's skills
router.get('/user/:userId', getUserSkills);

module.exports = router;
