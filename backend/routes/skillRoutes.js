const express = require('express');
const { addSkill, getAllSkills } = require('../controllers/skillController');

const router = express.Router();

// Add a new skill
router.post('/addskill', addSkill);

// Get all skills
router.get('/allskills', getAllSkills);

module.exports = router;
