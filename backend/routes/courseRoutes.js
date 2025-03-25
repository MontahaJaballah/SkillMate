const express = require("express");
const { generateCourse } = require("../controllers/courseController");

const router = express.Router();
router.post("/generate", generateCourse);

module.exports = router;