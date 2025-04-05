// controllers/clarifaiController.js
const axios = require("axios");
const FormData = require("form-data");

// Test endpoint to check if API key is configured correctly
const testClarifaiConnection = async (req, res) => {
    try {
        if (!process.env.CLARIFAI_API_KEY) {
            return res.status(500).json({ 
                error: "Clarifai API key is not configured", 
                setup: "Please add CLARIFAI_API_KEY to your .env file"
            });
        }

        // Get the user ID and app ID from environment variables
        const userId = process.env.CLARIFAI_USER_ID || "clarifai";
        const appId = process.env.CLARIFAI_APP_ID || "main";

        // Test connection with a simple request
        await axios.get(
            `https://api.clarifai.com/v2/users/${userId}/apps/${appId}/models`,
            {
                headers: {
                    Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.status(200).json({ 
            success: true, 
            message: "Clarifai API connection successful",
            apiKey: "Configured",
            userId,
            appId
        });

    } catch (error) {
        console.error("Clarifai Connection Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Failed to connect to Clarifai API", 
            details: error.response?.data || error.message,
            apiKey: process.env.CLARIFAI_API_KEY ? "Configured but may be invalid" : "Missing"
        });
    }
};

const detectIngredients = async (req, res) => {
    try {
        // Check if API key is configured
        if (!process.env.CLARIFAI_API_KEY) {
            return res.status(500).json({ 
                error: "Clarifai API key is not configured", 
                setup: "Please add CLARIFAI_API_KEY to your .env file"
            });
        }

        const { imageBase64 } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: "No image provided" });
        }

        // Remove data:image/jpeg;base64, prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        // Get the user ID and app ID from environment variables
        const userId = process.env.CLARIFAI_USER_ID || "clarifai";
        const appId = process.env.CLARIFAI_APP_ID || "main";
        const modelId = "food-item-recognition";
        
        console.log("Making request to Clarifai API...");
        const response = await axios.post(
            `https://api.clarifai.com/v2/users/${userId}/apps/${appId}/models/${modelId}/outputs`,
            {
                user_app_id: {
                    user_id: userId,
                    app_id: appId
                },
                inputs: [
                    {
                        data: {
                            image: { 
                                base64: base64Data 
                            }
                        }
                    }
                ]
            },
            {
                headers: {
                    Authorization: `Key ${process.env.CLARIFAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const concepts = response.data.outputs[0].data.concepts;
        
        // Filter concepts with confidence > 0.75 and map to ingredient names
        const ingredients = concepts
            .filter(concept => concept.value > 0.75)
            .map(concept => concept.name);

        res.status(200).json({ 
            ingredients,
            allConcepts: concepts 
        });

    } catch (error) {
        console.error("Clarifai Error:", error.response?.data || error.message);
        res.status(500).json({ 
            error: "Failed to recognize ingredients",
            details: error.response?.data || error.message,
            apiKey: process.env.CLARIFAI_API_KEY ? "Configured but may be invalid" : "Missing"
        });
    }
};

module.exports = { detectIngredients, testClarifaiConnection };
