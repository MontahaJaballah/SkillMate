const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middleware/upload');

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads/certifications');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// All routes
router.post("/adduser", upload.single('certificationFile'), userController.add);
router.post("/login", userController.login);
router.delete('/deleteuser/:id', userController.remove);
router.post('/updateuser/:id', upload.single('certificationFile'), userController.update);
router.get("/allusers", userController.getAll);
router.get("/user/:id", userController.getById);
router.post('/deactivate', userController.deactivate);
router.post('/reactivate/send-code', userController.reactivateWithPhone);
router.post('/reactivate/verify', userController.verifyAndReactivate);

// Sub-admin and user blocking routes
router.post("/addsubadmin", userController.addSubAdmin);
router.put("/blockuser/:id", userController.blockUser);
router.put("/unblockuser/:id", userController.unblockUser);
router.get("/searchuser/:username", userController.searchByUsername);

// Serve uploaded files
router.get('/uploads/certifications/:filename', (req, res) => {
    const filePath = path.join(__dirname, '../uploads/certifications', req.params.filename);
    res.sendFile(filePath);
});

module.exports = router;