const express = require('express');
const router = express.Router();
const { saveGame, getGameHistory } = require('../controllers/chessController');
const authMiddleware = require('../middleware/auth');

router.post('/save-game', authMiddleware, saveGame);
router.get('/history', authMiddleware, getGameHistory);

module.exports = router;