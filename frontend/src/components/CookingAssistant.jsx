import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useAxios from '../hooks/useAxios';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    CircularProgress,
    Card,
    CardContent,
    Alert,
    IconButton,
    Switch,
    FormControlLabel
} from '@mui/material';
import { 
    Send as SendIcon, 
    Mic as MicIcon,
    VolumeUp as SpeakerIcon,
    VolumeOff as MuteIcon,
    Close as CloseIcon 
} from '@mui/icons-material';

// Initialize speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
}

function CookingAssistant({ recipeContext }) {
    const [isListening, setIsListening] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const axios = useAxios();
    const [question, setQuestion] = useState('');
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAsk = async (transcriptText) => {
        const textToSend = transcriptText || question.trim();
        if (!textToSend) return;
        
        setLoading(true);
        try {
            const res = await axios.post('/chatrecipe/ask-cooking-assistant', { 
                question: recipeContext ? `${recipeContext} ${textToSend}` : textToSend 
            });
            const aiReply = res.data.reply;
            setReply(aiReply);
            speakText(aiReply);
            setQuestion(''); // Clear input after successful response
        } catch (err) {
            setReply('Sorry, I encountered an error while processing your request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Speech synthesis setup
    const speakText = (text) => {
        if (!autoSpeak) return;
        
        const synth = window.speechSynthesis;
        // Cancel any ongoing speech
        synth.cancel();

        // Split text into sentences for better speech handling
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        
        // Create and queue utterances for each sentence
        sentences.forEach((sentence, index) => {
            const utter = new SpeechSynthesisUtterance(sentence.trim());
            utter.lang = 'en-US';
            utter.rate = 1.0;
            utter.pitch = 1.0;
            
            // Add a small pause between sentences
            if (index > 0) {
                setTimeout(() => synth.speak(utter), index * 100);
            } else {
                synth.speak(utter);
            }
        });
    };

    // Voice input setup
    const startListening = () => {
        if (!recognition) {
            alert("Your browser doesn't support speech recognition.");
            return;
        }

        recognition.start();
        setIsListening(true);
    };

    useEffect(() => {
        if (!recognition) return;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            handleAsk(transcript);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        // Cleanup
        return () => {
            if (recognition) {
                recognition.onresult = null;
                recognition.onerror = null;
                recognition.onend = null;
            }
        };
    }, []);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium' }}>
                            Ask the AI Cooking Assistant
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Get help with recipes, techniques, substitutions, and more!
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="E.g., Can I replace butter with olive oil in chocolate chip cookies?"
                                disabled={loading}
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                            />
                        </Box>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: { xs: 'row', sm: 'column' }, 
                            gap: 1,
                            minWidth: { sm: '120px' }
                        }}>
                            <Button
                                variant="outlined"
                                color={isListening ? 'error' : 'primary'}
                                onClick={startListening}
                                disabled={loading || !SpeechRecognition}
                                fullWidth
                                sx={{ height: { xs: '40px', sm: '50%' } }}
                            >
                                <MicIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    {isListening ? 'Listening...' : 'Voice'}
                                </Box>
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleAsk()}
                                disabled={loading || !question.trim()}
                                fullWidth
                                sx={{ height: { xs: '40px', sm: '50%' } }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    <>
                                        <SendIcon sx={{ mr: { xs: 0, sm: 1 } }} />
                                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Ask</Box>
                                    </>
                                )}
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch 
                                    checked={autoSpeak} 
                                    onChange={(e) => setAutoSpeak(e.target.checked)}
                                    icon={<MuteIcon />}
                                    checkedIcon={<SpeakerIcon />}
                                />
                            }
                            label={
                                <Typography variant="body2" color="text.secondary">
                                    Text-to-Speech {autoSpeak ? 'enabled' : 'disabled'}
                                </Typography>
                            }
                        />
                    </Box>
                </Box>
            </Paper>

            {reply && (
                <Card 
                    variant="outlined" 
                    sx={{ 
                        borderRadius: 2,
                        position: 'relative',
                        borderColor: 'primary.main',
                        borderWidth: '2px'
                    }}
                >
                    <IconButton 
                        size="small" 
                        onClick={() => setReply('')}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                    <CardContent sx={{ p: 3, pt: 4 }}>
                        <Typography 
                            variant="body1" 
                            component="div" 
                            sx={{ 
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6
                            }}
                        >
                            {reply}
                        </Typography>
                    </CardContent>
                </Card>
            )}

            {!SpeechRecognition && (
                <Alert severity="info" sx={{ mt: 2 }}>
                    Voice input is not supported in your browser. Try using Chrome for the best experience.
                </Alert>
            )}
        </Container>
    );
}

CookingAssistant.propTypes = {
    recipeContext: PropTypes.string
};

export default CookingAssistant;
