const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to get all users
router.get('/getAll', userController.showAllUsers);

// Route to get a user by ID
router.get('/getById/:id', userController.showUserById);

module.exports = router;
