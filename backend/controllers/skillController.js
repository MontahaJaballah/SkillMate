const Skill = require('../models/Skill');

// Create a new skill for a user
const addSkill = async (req, res) => {
    try {
        const newSkill = new Skill(req.body);
        await newSkill.save();
        res.status(201).json(newSkill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all skills
const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's skills
const getUserSkills = async (req, res) => {
    try {
        const { userId } = req.params;
        const skills = await Skill.find({ user: userId });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addSkill, getAllSkills, getUserSkills };
