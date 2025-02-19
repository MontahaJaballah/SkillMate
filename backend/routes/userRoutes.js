const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define your routes here
router.post("/adduser", userController.add);
router.delete('/deleteuser/:id', userController.remove);
router.post('/updateuser/:id', userController.update);
router.get("/allusers", userController.getAll);
router.get("/getuser/:id", userController.getById);

// Sub-admin and user blocking routes
router.post("/addsubadmin", userController.addSubAdmin);
router.put("/blockuser/:id", userController.blockUser);
router.put("/unblockuser/:id", userController.unblockUser);

router.get("/searchuser/:username", userController.searchByUsername);
router.post("/login", userController.login);
module.exports = router;