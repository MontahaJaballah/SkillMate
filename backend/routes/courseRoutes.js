const express = require('express');
const { getCourses, addCourse, createItCourse, getCourseById } = require('../controllers/courseController');

const router = express.Router();

// Get all courses
router.get('/browsecourses', getCourses);

// Get a single course
router.get('/:id', getCourseById);

// Add new courses
router.post('/addcourse', addCourse);
router.post('/createItCourse', createItCourse);

module.exports = router;
