import React, { useState } from "react";
import CookingSession from "./CookingSession";
import FoodImageRecognition from "./FoodImageRecognition";
import useAxios from "../hooks/useAxios";
import { 
    TextField, 
    Button, 
    CircularProgress, 
    Container, 
    Grid, 
    Card, 
    CardContent, 
    CardMedia, 
    CardActions, 
    Typography,
    Box,
    Tabs,
    Tab,
    Divider
} from "@mui/material";
import { Search as SearchIcon, Image as ImageIcon } from "@mui/icons-material";

const RecipeGenerator = () => {
    const axios = useAxios();
    const [ingredients, setIngredients] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

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

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleIngredientsDetected = (detectedIngredients) => {
        setIngredients(detectedIngredients.join(', '));
        setActiveTab(0); // Switch to text input tab after detection
    };

    if (selectedRecipe) {
        return <CookingSession recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" align="center" sx={{ mb: 4 }}>
                AI Recipe Generator
            </Typography>

            <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                centered 
                sx={{ mb: 3 }}
            >
                <Tab icon={<SearchIcon />} label="TEXT SEARCH" />
                <Tab icon={<ImageIcon />} label="IMAGE RECOGNITION" />
            </Tabs>

            {activeTab === 0 ? (
                <form onSubmit={handleFetchRecipes} style={{ marginBottom: '2rem' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Enter ingredients (comma separated)"
                            variant="outlined"
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            placeholder="e.g. chicken, rice, tomatoes"
                            required
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ minWidth: { xs: '100%', md: '180px' } }}
                        >
                            {loading ? <CircularProgress size={24} /> : "Find Recipes"}
                        </Button>
                    </Box>
                </form>
            ) : (
                <FoodImageRecognition onIngredientsDetected={handleIngredientsDetected} />
            )}
            
            {ingredients && (
                <Box sx={{ mb: 3, mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Current ingredients: 
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {ingredients}
                    </Typography>
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
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
