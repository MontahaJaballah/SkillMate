const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
    initializeGame,
    getGameState,
    makeMove,
    createChallenge,
    getChallenges,
    acceptChallenge,
    completeChallenge,
    getLeaderboard,
    saveGame
} = require('../controllers/rubikController');

// Initialize a new game
router.post('/init', protect, initializeGame);

// Get game state
router.get('/state/:gameId', protect, getGameState);

// Make a move
router.post('/move', protect, makeMove);

// Save game
router.post('/game', protect, saveGame);

// Challenge routes
router.post('/challenge', protect, createChallenge);
router.get('/challenges', protect, getChallenges);
router.post('/challenge/:challengeId/accept', protect, acceptChallenge);
router.post('/challenge/:challengeId/complete', protect, completeChallenge);

// Leaderboard route
router.get('/leaderboard', getLeaderboard);

module.exports = router;