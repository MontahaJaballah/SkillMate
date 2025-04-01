const Course = require('../models/Course');
const Skill = require('../models/Skill');
const mongoose = require('mongoose'); // mongoose is required for ObjectId validation

// Get all courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate({
                path: 'skill',
                select: 'name category proficiency'
            })
            .populate({ path: 'teacher_id', select: 'name email' })
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

// Get a single course
const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Validate the course ID
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const course = await Course.findById(courseId)
            .populate('teacher_id', 'name email')
            .populate('skill', 'name category proficiency')
            .populate('prerequisites', 'title');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message || 'Failed to fetch course'
        });
    }
};

module.exports = { getCourses, addCourse, createItCourse, getCourseById };
