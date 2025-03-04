const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const passport = require('passport');

// Create a new course (teacher only)
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Only teachers can create courses' });
        }

        const course = new Course({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            instructor: req.user._id
        });

        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Enroll a student in a course
router.post('/:courseId/enroll', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if student is already enrolled
        if (course.students.includes(req.user._id)) {
            return res.status(400).json({ message: 'Student already enrolled' });
        }

        course.students.push(req.user._id);
        await course.save();

        res.json({ message: 'Successfully enrolled' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a review to a course
router.post('/:courseId/reviews', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user has already reviewed
        const existingReview = course.reviews.find(review => review.user.toString() === req.user._id.toString());
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this course' });
        }

        const review = {
            user: req.user._id,
            rating: req.body.rating,
            comment: req.body.comment
        };

        course.reviews.push(review);

        // Update course rating
        const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0);
        course.rating = totalRating / course.reviews.length;

        await course.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all courses
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('instructor', 'name email')
            .select('-reviews');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific course
router.get('/:courseId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId)
            .populate('instructor', 'name email')
            .populate('reviews.user', 'name');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
