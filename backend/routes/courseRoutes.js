const express = require('express');
const { getCourses, addCourse } = require('../controllers/courseController');

const router = express.Router();

router.get('/allcourses', getCourses);
router.post('/addcourse', addCourse);

module.exports = router;
