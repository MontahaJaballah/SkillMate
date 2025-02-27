const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');
const User = require('../models/User');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads/certifications');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

router.get("/check-email/:email", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        res.json({ exists: !!user });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// All routes
router.post("/adduser", upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'certificationFile', maxCount: 1 }
]), userController.addUser);

router.post('/updateuser/:id', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'certificationFile', maxCount: 1 }
]), userController.update);

router.delete('/deleteuser/:id', userController.remove);

router.get("/allusers", userController.getAllUsers);
router.get("/alladmins", userController.getAllAdmins);
router.get("/user/:id", userController.getById);
router.post('/deactivate', userController.deactivate);
router.post('/reactivate/send-code', userController.reactivateWithPhone);
router.post('/reactivate/verify', userController.verifyAndReactivate);

// Sub-admin and user blocking routes
router.post("/addsubadmin", userController.addSubAdmin);
router.put("/updateadmin/:id", userController.updateAdmin);
router.put("/blockuser/:id", userController.blockUser);
router.put("/unblockuser/:id", userController.unblockUser);
router.get("/searchuser/:username", userController.searchByUsername);

// Chat endpoint
router.post("/chat", userController.chat);

// Serve uploaded files
router.get('/uploads/photos/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/photos', req.params.filename);
    res.sendFile(filePath);
});

router.get('/uploads/certifications/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/certifications', req.params.filename);
    res.sendFile(filePath);
});

module.exports = router;