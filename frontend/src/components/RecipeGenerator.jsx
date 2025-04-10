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
    Divider,
    Chip,
    Paper,
    IconButton,
    Alert
} from "@mui/material";
import { 
    Search as SearchIcon, 
    Image as ImageIcon, 
    Close as CloseIcon, 
    Add as AddIcon,
    AccessTime as ClockIcon,
    People as PeopleIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    Restaurant as ChefIcon,
    ArrowForward as ArrowRightIcon
} from "@mui/icons-material";

const RecipeGenerator = () => {
    const axios = useAxios();
    const [ingredientInput, setIngredientInput] = useState("");
    const [ingredientsList, setIngredientsList] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleAddIngredient = () => {
        if (ingredientInput.trim() && !ingredientsList.includes(ingredientInput.trim())) {
            setIngredientsList([...ingredientsList, ingredientInput.trim()]);
            setIngredientInput("");
        }
    };

    const handleRemoveIngredient = (ingredient) => {
        setIngredientsList(ingredientsList.filter(item => item !== ingredient));
    };

    const handleFetchRecipes = async (e) => {
        e.preventDefault();
        if (ingredientsList.length === 0) {
            setError("Please add at least one ingredient");
            return;
        }
        
        setLoading(true);
        setError("");
        
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
        setIngredientsList(prevList => {
            // Add only ingredients that aren't already in the list
            const newIngredients = detectedIngredients.filter(
                ing => !prevList.includes(ing)
            );
            return [...prevList, ...newIngredients];
        });
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

            <Paper elevation={3} sx={{ mb: 5, overflow: 'hidden', borderRadius: 2 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    centered 
                    variant="fullWidth"
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                >
                    <Tab 
                        icon={<SearchIcon />} 
                        label="TEXT SEARCH" 
                    />
                    <Tab 
                        icon={<ImageIcon />} 
                        label="IMAGE RECOGNITION" 
                    />
                </Tabs>

                <Box sx={{ p: 4 }}>
                    {activeTab === 0 ? (
                        <Box>
                            <form onSubmit={handleFetchRecipes}>
                                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3 }}>
                                    <Box sx={{ position: 'relative', flexGrow: 1 }}>
                                        <TextField
                                            fullWidth
                                            label="Enter ingredient"
                                            variant="outlined"
                                            value={ingredientInput}
                                            onChange={(e) => setIngredientInput(e.target.value)}
                                            placeholder="e.g. chicken"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddIngredient();
                                                }
                                            }}
                                            InputProps={{
                                                endAdornment: ingredientInput ? (
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => setIngredientInput('')}
                                                        edge="end"
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                ) : null
                                            }}
                                        />
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={handleAddIngredient}
                                        startIcon={<AddIcon />}
                                        sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                                    >
                                        Add
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading}
                                        sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Find Recipes"}
                                    </Button>
                                </Box>
                            </form>
                            
                            {ingredientsList.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Current ingredients:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {ingredientsList.map((ingredient, index) => (
                                            <Chip
                                                key={index}
                                                label={ingredient}
                                                onDelete={() => handleRemoveIngredient(ingredient)}
                                                color="primary"
                                                variant="outlined"
                                                size="medium"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        <FoodImageRecognition onIngredientsDetected={handleIngredientsDetected} />
                    )}
                </Box>
            </Paper>
            
            {error && (
                <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {recipes.length > 0 && (
                <Grid container spacing={4}>
                    {recipes.map((recipe) => (
                        <Grid item xs={12} sm={6} md={4} key={recipe.id}>
                            <Card elevation={3} sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                borderRadius: 2,
                                overflow: 'hidden'
                            }}>
                                <Box sx={{ position: 'relative' }}>
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={recipe.image}
                                        alt={recipe.title}
                                        sx={{ height: 200, objectFit: 'cover' }}
                                    />
                                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 1 }}>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip 
                                                size="small" 
                                                icon={<ClockIcon />} 
                                                label={`${recipe.readyInMinutes} min`}
                                            />
                                            <Chip 
                                                size="small" 
                                                icon={<PeopleIcon />} 
                                                label={`Serves ${recipe.servings}`}
                                            />
                                        </Box>
                                    </Box>
                                </Box>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="h2" gutterBottom>
                                        {recipe.title}
                                    </Typography>
                                    
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Used ingredients:
                                            </Typography>
                                            <Typography variant="body2">
                                                {recipe.usedIngredientCount}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Missing ingredients:
                                            </Typography>
                                            <Typography variant="body2">
                                                {recipe.missedIngredientCount}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    
                                    <Divider sx={{ my: 2 }} />
                                    
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {recipe.usedIngredients?.slice(0, 3).map((ing, idx) => (
                                            <Chip
                                                key={idx}
                                                size="small"
                                                icon={<CheckCircleIcon />}
                                                label={ing.name}
                                                variant="outlined"
                                            />
                                        ))}
                                        {recipe.missedIngredients?.slice(0, 2).map((ing, idx) => (
                                            <Chip
                                                key={idx}
                                                size="small"
                                                icon={<WarningIcon />}
                                                label={ing.name}
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleStartCooking(recipe)}
                                        startIcon={<ChefIcon />}
                                    >
                                        Start Cooking
                                    </Button>
                                    {recipe.sourceUrl && (
                                        <Button
                                            href={recipe.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            variant="outlined"
                                            endIcon={<ArrowRightIcon />}
                                            sx={{ ml: 1 }}
                                        >
                                            View Full Recipe
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default RecipeGenerator;
