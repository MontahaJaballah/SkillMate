const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define your routes here
router.post("/adduser", userController.add);
router.delete('/deleteuser/:id', userController.remove);
router.post('/updateuser/:id', userController.update);
router.get("/allusers", userController.getAll);
router.get("/getuser/:id", userController.getById);

module.exports = router;