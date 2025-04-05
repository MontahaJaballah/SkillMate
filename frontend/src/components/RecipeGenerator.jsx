import React, { useState } from "react";
import CookingSession from "./CookingSession";
import useAxios from "../hooks/useAxios";
import { TextField, Button, CircularProgress, Container, Grid, Card, CardContent, CardMedia, CardActions, Typography } from "@mui/material";

const RecipeGenerator = () => {
    const axios = useAxios();
    const [ingredients, setIngredients] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const handleFetchRecipes = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const ingredientsList = ingredients.split(",").map((ing) => ing.trim());
        
        try {
            const response = await axios.post("/recipes/get-recipes", {
                ingredients: ingredientsList,
            });
            setRecipes(response.data);
        } catch (error) {
            setError("Failed to fetch recipes. Please try again.");
            console.error("Error fetching recipes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartCooking = (recipe) => {
        setSelectedRecipe(recipe);
    };

    if (selectedRecipe) {
        return <CookingSession recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" className="text-center mb-6">
                AI Recipe Generator
            </Typography>

            <form onSubmit={handleFetchRecipes} className="mb-8 max-w-xl mx-auto">
                <div className="space-y-4">
                    <TextField
                        fullWidth
                        label="Enter your ingredients"
                        placeholder="e.g., chicken, rice, tomatoes"
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        required
                        helperText="Separate ingredients with commas"
                        variant="outlined"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        className="h-12"
                    >
                        {loading ? (
                            <>
                                <CircularProgress size={24} className="mr-2" />
                                Generating Recipes...
                            </>
                        ) : (
                            "Get Recipes"
                        )}
                    </Button>
                </div>
            </form>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    {error}
                </div>
            )}

            <Grid container spacing={4}>
                {recipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                        <Card className="h-full flex flex-col">
                            <CardMedia
                                component="img"
                                height="200"
                                image={recipe.image}
                                alt={recipe.title}
                                className="h-48 object-cover"
                            />
                            <CardContent className="flex-grow">
                                <Typography variant="h6" component="h2" className="mb-2">
                                    {recipe.title}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" className="mb-2">
                                    Ready in {recipe.readyInMinutes} minutes | Serves {recipe.servings}
                                </Typography>
                                <Typography variant="body2" className="mb-2">
                                    Used ingredients: {recipe.usedIngredientCount}
                                    <br />
                                    Missing ingredients: {recipe.missedIngredientCount}
                                </Typography>
                                {recipe.instructions && (
                                    <div className="mt-4">
                                        <Typography variant="subtitle2" className="font-bold mb-1">
                                            Instructions:
                                        </Typography>
                                        <Typography variant="body2" className="text-gray-600">
                                            {recipe.instructions}
                                        </Typography>
                                    </div>
                                )}
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Ready in {recipe.readyInMinutes} minutes
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleStartCooking(recipe)}
                                >
                                    Start Cooking
                                </Button>
                            </CardActions>
                            {recipe.sourceUrl && (
                                <CardActions>
                                    <Button
                                        href={recipe.sourceUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="outlined"
                                        fullWidth
                                    >
                                        View Full Recipe
                                    </Button>
                                </CardActions>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default RecipeGenerator;
