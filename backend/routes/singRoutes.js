const express = require('express');
const router = express.Router();
const singController = require('../controllers/singController');
const multer = require('multer');
const upload = multer();

// Routes pour l'analyse en temps réel
router.post('/analyze-live', singController.analyzeLiveAudio);
router.post('/analyze-posture', singController.analyzePosture);

module.exports = router;
