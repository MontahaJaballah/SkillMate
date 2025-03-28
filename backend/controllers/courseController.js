const Course = require('../models/Course');
const Skill = require('../models/Skill');

// Get all courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({ 
                path: 'skill',
                select: 'categorie proficiency' 
            })
            .populate({ path: 'teacher_id', select: 'username' }) 
            .select('title description thumbnail createdate price teacher_id duration');

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

// Create IT Course
const createItCourse = async (req, res) => {
    try {
        const { title, description, lessons, quiz, finalExam, teacher_id } = req.body;

        // Calculate total duration from lessons
        const totalDuration = lessons.reduce((sum, lesson) => sum + (parseInt(lesson.duration) || 0), 0);

        const newCourse = new Course({
            title,
            description,
            teacher_id,
            type: 'IT',
            duration: totalDuration,
            lessons: lessons.map(lesson => ({
                title: lesson.title,
                content: lesson.content,
                duration: parseInt(lesson.duration) || 30,
                codeChallenge: lesson.codeChallenge ? {
                    description: lesson.codeChallenge.description,
                    testCases: lesson.codeChallenge.testCases || [],
                    solution: lesson.codeChallenge.solution
                } : null
            })),
            quiz: quiz ? {
                questions: quiz.questions.map(q => ({
                    description: q.description,
                    testCases: q.testCases || [],
                    solution: q.solution
                }))
            } : null,
            finalExam: finalExam ? {
                description: finalExam.description,
                testCases: finalExam.testCases || [],
                solution: finalExam.solution
            } : null,
            status: 'active',
            createdate: new Date(),
            price: 0,
            students: [],
            ratings: []
        });

        await newCourse.save();
        res.status(201).json({ message: 'IT Course created successfully', course: newCourse });
    } catch (error) {
        console.error('Error creating IT course:', error);
        res.status(500).json({ message: 'Error creating IT course', error: error.message });
    }
};

module.exports = { getCourses, addCourse, createItCourse };
