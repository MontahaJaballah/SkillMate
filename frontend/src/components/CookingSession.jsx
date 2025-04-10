import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
    Card,
    LinearProgress,
    Chip,
    Alert
} from '@mui/material';
import {
    NavigateNext as NextIcon,
    NavigateBefore as PrevIcon,
    RestartAlt as RestartIcon,
    ArrowBack as BackIcon,
    Timer as TimerIcon,
    Group as GroupIcon,
    CheckCircle as CheckIcon,
    Kitchen as KitchenIcon
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
                sx={{ mb: 4 }}
            >
                Back to Recipes
            </Button>

            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <KitchenIcon color="primary" sx={{ fontSize: 32 }} />
                        <Typography variant="h4" sx={{ fontWeight: 'medium' }}>
                            {recipe.title}
                        </Typography>
                    </Box>

                    {recipe.image && (
                        <Box
                            sx={{
                                position: 'relative',
                                width: '100%',
                                height: { xs: 200, sm: 300 },
                                borderRadius: 2,
                                overflow: 'hidden',
                                boxShadow: 2
                            }}
                        >
                            <Box
                                component="img"
                                src={recipe.image}
                                alt={recipe.title}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>
                    )}

                    <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <Chip
                            icon={<TimerIcon />}
                            label={`${recipe.readyInMinutes} minutes`}
                            color="primary"
                            variant="outlined"
                        />
                        <Chip
                            icon={<GroupIcon />}
                            label={`${recipe.servings} servings`}
                            color="primary"
                            variant="outlined"
                        />
                    </Box>

                    {steps.length > 0 ? (
                        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                            <Box sx={{ mb: 3 }}>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={(activeStep / (steps.length - 1)) * 100} 
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                                    Step {activeStep + 1} of {steps.length}
                                </Typography>
                            </Box>

                            <Stepper activeStep={activeStep} orientation="vertical">
                                {steps.map((step, index) => (
                                    <Step key={`step-${step.number || index}`}>
                                        <StepLabel>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                                Step {index + 1}
                                            </Typography>
                                        </StepLabel>
                                        <StepContent>
                                            <Box sx={{ py: 2 }}>
                                                <Typography variant="body1" sx={{ mb: 2 }}>
                                                    {step.step}
                                                </Typography>
                                                
                                                {step.ingredients?.length > 0 && (
                                                    <Box 
                                                        sx={{ 
                                                            mt: 2,
                                                            p: 2, 
                                                            bgcolor: 'background.default',
                                                            borderRadius: 1
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="subtitle2" 
                                                            color="primary"
                                                            sx={{ mb: 1 }}
                                                        >
                                                            Ingredients needed:
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                            {step.ingredients.map((ing) => (
                                                                <Chip 
                                                                    key={`ingredient-${ing.id || ing.name}`}
                                                                    label={ing.name}
                                                                    size="small"
                                                                    variant="outlined"
                                                                />
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>

                                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                                <Button
                                                    variant="outlined"
                                                    disabled={index === 0}
                                                    onClick={handleBack}
                                                    startIcon={<PrevIcon />}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    onClick={handleNext}
                                                    endIcon={index === steps.length - 1 ? <CheckIcon /> : <NextIcon />}
                                                >
                                                    {index === steps.length - 1 ? 'Finish' : 'Next'}
                                                </Button>
                                            </Box>
                                        </StepContent>
                                    </Step>
                                ))}
                            </Stepper>

                            {activeStep === steps.length - 1 && (
                                <Alert 
                                    icon={<CheckIcon fontSize="large" />}
                                    severity="success" 
                                    sx={{ mt: 4, p: 2 }}
                                >
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        All steps completed! 🎉
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Your dish is ready to serve. Enjoy!
                                    </Typography>
                                    <Button
                                        onClick={handleReset}
                                        startIcon={<RestartIcon />}
                                        variant="outlined"
                                        color="success"
                                        size="small"
                                    >
                                        Start Over
                                    </Button>
                                </Alert>
                            )}
                        </Box>
                    ) : (
                        <Box>
                            <Alert severity="error" sx={{ mt: 2 }}>
                                No detailed steps available for this recipe.
                            </Alert>
                        </Box>
                    )}
                </Box>
            </Paper>

            <Card 
                variant="outlined" 
                sx={{ 
                    p: 4,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    borderWidth: 2
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'medium' }}>
                        Need help? Ask the AI Cooking Assistant!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Get instant help with ingredient substitutions, cooking techniques, or any other questions about this recipe.
                    </Typography>
                    <CookingAssistant recipeContext={getAssistantContext()} />
                </Box>
            </Card>
        </Container>
    );
}

CookingSession.propTypes = {
    recipe: PropTypes.shape({
        title: PropTypes.string.isRequired,
        image: PropTypes.string,
        readyInMinutes: PropTypes.number,
        servings: PropTypes.number,
        extendedIngredients: PropTypes.arrayOf(
            PropTypes.shape({
                original: PropTypes.string
            })
        ),
        analyzedInstructions: PropTypes.arrayOf(
            PropTypes.shape({
                steps: PropTypes.arrayOf(
                    PropTypes.shape({
                        number: PropTypes.number,
                        step: PropTypes.string.isRequired,
                        ingredients: PropTypes.arrayOf(
                            PropTypes.shape({
                                id: PropTypes.number,
                                name: PropTypes.string.isRequired
                            })
                        )
                    })
                )
            })
        )
    }).isRequired,
    onBack: PropTypes.func.isRequired
};

export default CookingSession;
