const Skill = require('../models/Skill');

// Create a new skill for a user
const addSkill = async (req, res) => {
    try {
        const { name, description, categorie, proficiency, certification, userId } = req.body;

        // Validate required fields
        if (!name || !description || !categorie || !proficiency || !userId) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                error: 'name, description, categorie, proficiency, and userId are required'
            });
        }

        // Create the new skill, associating it with the provided user
        const newSkill = new Skill({
            name,
            description,
            categorie,
            proficiency,
            certification,
            user: userId,  // Associate the skill with the provided user
        });

        // Save the skill to the database
        await newSkill.save();
        res.status(201).json({ 
            message: 'Skill added successfully',
            skill: newSkill
        });
    } catch (error) {
        console.error('Error adding skill:', error);
        res.status(500).json({ 
            message: 'Error adding skill',
            error: error.message
        });
    }
};

// Get all skills
const getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        res.status(200).json(skills);
    } catch (error) {
        console.error('Error getting skills:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { addSkill, getAllSkills };
