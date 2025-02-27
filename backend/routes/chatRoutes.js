const express = require('express');
const { sendMessage, getMessages } = require('../controllers/chatController');

const router = express.Router();

router.post("/send", sendMessage);
router.get("/:sender/:receiver", getMessages);

module.exports = router;
