const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define your routes here
router.post("/adduser", userController.add);
router.delete('/:id', userController.remove);

router.post('/update/:id', userController.update);

module.exports = router;