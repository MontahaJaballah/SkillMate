const Course = require('../models/Course');
const Skill = require('../models/Skill');

// Get all courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({ 
                path: 'skill',
                select: 'categorie proficiency' // Select only the needed fields
            })
            .populate({ path: 'teacher_id', select: 'username' }) // Get teacher's username
            .select('title description thumbnail createdate price teacher_id duration'); // Select required fields

        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};


const addCourse = async (req, res) => {
    try {
        const { title, description, skill, teacher_id, students, schedule, duration, price, ratings, status, createdate, thumbnail } = req.body;

        // Ensure skill exists before creating the course
        const existingSkill = await Skill.findById(skill);
        if (!existingSkill) {
            return res.status(400).json({ message: 'Skill not found' });
        }

        const newCourse = new Course({
            title,
            description,
            skill,
            teacher_id,
            students,
            schedule,
            duration,
            price,
            ratings,
            status,
            createdate,
            thumbnail
        });

        await newCourse.save();
        res.status(201).json({ message: 'Course added successfully', course: newCourse });
    } catch (error) {
        res.status(500).json({ message: 'Error adding course', error: error.message });
    }
};

module.exports = { getCourses, addCourse };
