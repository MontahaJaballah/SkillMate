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
} from '@mui/material';
import { Send as SendIcon, Mic as MicIcon } from '@mui/icons-material';

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
            <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
                AI Cooking Assistant
            </Typography>
            
            <Typography variant="body1" gutterBottom align="center" sx={{ mb: 4 }}>
                Ask me anything about cooking, recipes, or ingredient substitutions!
            </Typography>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="E.g., Can I replace butter with olive oil in chocolate chip cookies?"
                        disabled={loading}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            color={isListening ? 'error' : 'secondary'}
                            onClick={startListening}
                            disabled={loading}
                            sx={{ minWidth: '140px' }}
                        >
                            <MicIcon sx={{ mr: 1 }} />
                            {isListening ? 'Listening...' : 'Voice Input'}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAsk()}
                            disabled={loading || !question.trim()}
                            sx={{ minWidth: '120px' }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                <>
                                    <SendIcon sx={{ mr: 1 }} />
                                    Ask
                                </>
                            )}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, mt: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    🔊 Text-to-Speech:
                </Typography>
                <Button
                    size="small"
                    variant={autoSpeak ? "contained" : "outlined"}
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    sx={{ minWidth: '100px' }}
                >
                    {autoSpeak ? 'On' : 'Off'}
                </Button>
            </Box>

            {reply && (
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Assistant's Response:
                        </Typography>
                        <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-wrap' }}>
                            {reply}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </Container>
    );
}

CookingAssistant.propTypes = {
    recipeContext: PropTypes.string
};

export default CookingAssistant;
