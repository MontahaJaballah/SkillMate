const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// Recipe search endpoint
router.post("/get-recipes", async (req, res) => {
    const { ingredients } = req.body;
    if (!ingredients || ingredients.length === 0) {
        return res.status(400).json({ error: "Please provide ingredients" });
    }

    try {
        const response = await axios.get(
            "https://api.spoonacular.com/recipes/findByIngredients",
            {
                params: {
                    ingredients: ingredients.join(","),
                    apiKey: process.env.SPOONACULAR_API_KEY,
                    number: 5, // Limit results
                    ranking: 2, // Maximize used ingredients
                    ignorePantry: true // Ignore common ingredients
                },
            }
        );

        // Get detailed recipe information for each recipe
        const recipeDetails = await Promise.all(
            response.data.map(async (recipe) => {
                const detailResponse = await axios.get(
                    `https://api.spoonacular.com/recipes/${recipe.id}/information`,
                    {
                        params: {
                            apiKey: process.env.SPOONACULAR_API_KEY,
                        },
                    }
                );
                return {
                    ...recipe,
                    instructions: detailResponse.data.instructions,
                    sourceUrl: detailResponse.data.sourceUrl,
                    readyInMinutes: detailResponse.data.readyInMinutes,
                    servings: detailResponse.data.servings
                };
            })
        );

        res.json(recipeDetails);
    } catch (error) {
        console.error("Recipe API Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch recipes" });
    }
});

module.exports = router;
