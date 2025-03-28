const express = require('express');
const { getCourses, addCourse, createItCourse } = require('../controllers/courseController');

const router = express.Router();

router.get('/allcourses', getCourses);
router.post('/addcourse', addCourse);
router.post('/createItCourse', createItCourse);

module.exports = router;
