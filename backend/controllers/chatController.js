const Message = require('../models/Message');
const detectIntent = require('../services/dialogflowService');
const uuid = require('uuid');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get chat history between two users
exports.getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

async function chat(req, res) {
    const { message } = req.body;
    
    if (!message) {
        return res.status(400).json({ 
            error: "Message is required"
        });
    }
    
    // Check if Dialogflow environment variables are set
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return res.status(503).json({ 
            error: "The chatbot service is not configured properly. Please contact the administrator.",
            details: "Missing Dialogflow credentials"
        });
    }
    
    try {
        // Generate a unique session ID for each user or use their user ID if authenticated
        const sessionId = req.user && req.user._id ? req.user._id.toString() : uuid.v4();
        
        // Call our detectIntent function
        const response = await detectIntent(message, sessionId);
        res.json({ reply: response });
    } catch (error) {
        console.error("Error in chat endpoint:", error);
        let errorMessage = "An error occurred while processing your message.";
        
        if (error.code === 7 && error.details && error.details.includes('IAM permission')) {
            errorMessage = "The chatbot is currently unavailable due to authentication issues. Please try again later.";
            // Log detailed error for debugging
            console.error("Dialogflow authentication error. Please check:\n",
                "1. Service account permissions (needs Dialogflow API Client role)\n",
                "2. Dialogflow API is enabled\n",
                "3. Service account key file is valid and accessible");
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    chat,
    sendMessage: exports.sendMessage,
    getMessages: exports.getMessages
};
