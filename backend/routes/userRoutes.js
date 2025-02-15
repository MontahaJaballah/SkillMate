const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.delete('/:id', userController.remove);

router.post('/update/:id', userController.update);

router.post('/update/:id', userController.update);

module.exports = router;
