const express = require('express');
const { getCourses, createCourse, getCourseById } = require('../controllers/courseController');

const router = express.Router();

// Get all courses
router.get('/browsecourses', getCourses);

// Get a single course
router.get('/:id', getCourseById);

// Create a new course
router.post('/create', createCourse);

module.exports = router;
