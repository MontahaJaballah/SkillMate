const express = require('express');
const { getCourses, createCourse, getCourseById, enrollInCourse, getEnrolledCourses } = require('../controllers/courseController');

const router = express.Router();

// Get all courses
router.get('/browsecourses', getCourses);

// Get a single course
router.get('/:id', getCourseById);

// Create a new course
router.post('/create', createCourse);

// Enroll in a course
router.post('/enroll/:courseId', enrollInCourse);

// Get all courses a user is enrolled in
router.get('/enrolled/:userId', getEnrolledCourses);

module.exports = router;
