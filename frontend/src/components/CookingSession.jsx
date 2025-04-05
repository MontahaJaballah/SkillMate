import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Divider,
    Card,
} from '@mui/material';
import {
    NavigateNext as NextIcon,
    NavigateBefore as PrevIcon,
    RestartAlt as RestartIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import CookingAssistant from './CookingAssistant';

function CookingSession({ recipe, onBack }) {
    const [activeStep, setActiveStep] = useState(0);
    const steps = recipe.analyzedInstructions?.[0]?.steps || [];

    const handleNext = () => {
        setActiveStep((prevStep) => Math.min(steps.length - 1, prevStep + 1));
    };

    const handleBack = () => {
        setActiveStep((prevStep) => Math.max(0, prevStep - 1));
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    // Format the context for the AI assistant
    const getAssistantContext = () => {
        return `I'm cooking ${recipe.title}. The ingredients are: ${recipe.extendedIngredients?.map(ing => ing.original).join(', ')}. I'm currently on step ${activeStep + 1} which says: "${steps[activeStep]?.step}".`;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<BackIcon />}
                onClick={onBack}
                variant="outlined"
                sx={{ mb: 3 }}
            >
                Back to Recipes
            </Button>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom color="primary">
                    👨‍🍳 Cooking: {recipe.title}
                </Typography>

                {recipe.image && (
                    <Box
                        component="img"
                        src={recipe.image}
                        alt={recipe.title}
                        sx={{
                            width: '100%',
                            maxHeight: 300,
                            objectFit: 'cover',
                            borderRadius: 1,
                            mb: 3
                        }}
                    />
                )}

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Typography variant="body1">
                        ⏱️ Ready in: {recipe.readyInMinutes} minutes
                    </Typography>
                    <Typography variant="body1">
                        👥 Servings: {recipe.servings}
                    </Typography>
                </Box>

                {steps.length > 0 ? (
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                        <Stepper activeStep={activeStep} orientation="vertical">
                            {steps.map((step, index) => (
                                <Step key={index}>
                                    <StepLabel>Step {index + 1}</StepLabel>
                                    <StepContent>
                                        <Typography>{step.step}</Typography>
                                        {step.ingredients?.length > 0 && (
                                            <Box sx={{ mt: 1 }}>
                                                <Typography variant="subtitle2" color="primary">
                                                    Ingredients for this step:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {step.ingredients.map(ing => ing.name).join(', ')}
                                                </Typography>
                                            </Box>
                                        )}
                                        <Box sx={{ mt: 2 }}>
                                            <Button
                                                disabled={index === 0}
                                                onClick={handleBack}
                                                startIcon={<PrevIcon />}
                                                sx={{ mr: 1 }}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleNext}
                                                endIcon={<NextIcon />}
                                                disabled={index === steps.length - 1}
                                            >
                                                Next
                                            </Button>
                                        </Box>
                                    </StepContent>
                                </Step>
                            ))}
                        </Stepper>
                        {activeStep === steps.length - 1 && (
                            <Paper square elevation={0} sx={{ p: 3 }}>
                                <Typography>All steps completed! Ready to serve 🎉</Typography>
                                <Button
                                    onClick={handleReset}
                                    startIcon={<RestartIcon />}
                                    sx={{ mt: 1 }}
                                >
                                    Start Over
                                </Button>
                            </Paper>
                        )}
                    </Box>
                ) : (
                    <Typography color="error">
                        No detailed steps available for this recipe.
                    </Typography>
                )}
            </Paper>

            <Divider sx={{ my: 4 }} />

            {/* AI Cooking Assistant */}
            <Card variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom color="primary">
                    Need help? Ask the AI Cooking Assistant!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    The assistant knows about this recipe and can help with substitutions, techniques, or any questions you have.
                </Typography>
                <CookingAssistant recipeContext={getAssistantContext()} />
            </Card>
        </Container>
    );
}

export default CookingSession;
