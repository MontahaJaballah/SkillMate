const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.delete('/:id', userController.remove);

module.exports = router;