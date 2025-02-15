const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define your routes here

router.post('/update/:id', userController.update);

module.exports = router;
