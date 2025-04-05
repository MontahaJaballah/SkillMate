// routes/clarifaiRoutes.js
const express = require("express");
const router = express.Router();
const { detectIngredients, testClarifaiConnection } = require("../controllers/clarifaiController");

// Test endpoint to check API connection
router.get("/test-connection", testClarifaiConnection);

// Main endpoint for ingredient detection
router.post("/detect-ingredients", detectIngredients);

module.exports = router;
