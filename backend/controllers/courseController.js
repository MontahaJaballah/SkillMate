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
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid course ID' });
        }

        const course = await Course.findById(id)
            .populate({
                path: 'skill',
                select: 'name category proficiency'
            })
            .populate({
                path: 'teacher_id',
                select: 'username firstName lastName email avatar bio rating reviews courses students',
                transform: doc => ({
                    _id: doc._id, // Make sure we include the instructor's ID
                    username: doc.username,
                    name: `${doc.firstName} ${doc.lastName}`,
                    email: doc.email,
                    avatar: doc.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
                    bio: doc.bio || 'Experienced instructor passionate about teaching',
                    rating: doc.rating || 4.5,
                    reviews: doc.reviews || 0,
                    courses: doc.courses || 1,
                    students: doc.students?.length || 0
                })
            })
            .lean();

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        console.log('Teacher ID:', course.teacher_id._id);

        // Fetch other courses by the same instructor (excluding the current course)
        const instructorCourses = await Course.find({
            teacher_id: course.teacher_id._id,
            _id: { $ne: id } // Use the course id from params
        })
            .select('title description thumbnail price')
            .limit(3)
            .lean();

        console.log('Found instructor courses:', instructorCourses);

        // Format the instructor data for the frontend
        course.instructor = {
            ...course.teacher_id,
            instructorCourses: instructorCourses.map(c => ({
                _id: c._id,
                title: c.title,
                description: c.description,
                thumbnail: c.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
                price: c.price
            }))
        };
        delete course.teacher_id;

        res.status(200).json(course);
    } catch (error) {
        console.error('Error in getCourseById:', error);
        res.status(500).json({ message: 'Error fetching course', error: error.message });
    }
};

module.exports = { getCourses, addCourse, createItCourse, getCourseById };
