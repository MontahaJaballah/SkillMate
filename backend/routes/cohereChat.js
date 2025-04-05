const express = require('express');
const axios = require('axios');
const router = express.Router();

// Cohere chat endpoint
router.post('/ask-cooking-assistant', async (req, res) => {
    const { question } = req.body;

    try {
        const response = await axios.post(
            'https://api.cohere.ai/v1/chat',
            {
                message: question,
                model: "command-r-plus",
                chat_history: [],
                preamble: "You are a knowledgeable cooking assistant. You help users with cooking-related questions, recipe modifications, ingredient substitutions, and cooking techniques. Provide clear, concise, and practical advice.",
                temperature: 0.7,
                connectors: [{ id: "web-search" }]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const reply = response.data.text;
        res.json({ reply });

    } catch (error) {
        console.error('Error from Cohere API:', error.response?.data || error.message);
        res.status(500).json({ error: 'Cohere API request failed' });
    }
});

module.exports = router;
