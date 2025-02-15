const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.delete('/:id', userController.remove);
// Route to get all users
router.get('/getAll', userController.showAllUsers);

// Route to get a user by ID
router.get('/getById/:id', userController.showUserById);

router.post('/update/:id', userController.update);

router.post('/update/:id', userController.update);

module.exports = router;
