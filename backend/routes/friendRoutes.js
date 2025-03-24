const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');

// Send a friend request
router.post('/send', friendController.sendRequest);

// Accept a friend request
router.post('/accept', friendController.acceptRequest);

// Reject a friend request
router.post('/reject', friendController.rejectRequest);

// Get pending friend requests for a user
router.get('/pending/:userId', friendController.getPendingRequests);

// Get all friends for a user
router.get('/list/:userId', friendController.getFriends);

// Get sent friend requests by a user
router.get('/sent/:userId', friendController.getSentRequests);

// Remove a friend
router.post('/remove', friendController.removeFriend);

module.exports = router;
