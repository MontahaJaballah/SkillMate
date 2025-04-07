import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import useAxios from '../hooks/useAxios';
import {
    Box,
    Button,
    Typography,
    Paper,
    CircularProgress,
    Chip,
    Stack,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Delete as DeleteIcon,
    CameraAlt as CameraIcon,
    Check as CheckIcon,
    ContentPaste as PasteIcon,
} from '@mui/icons-material';

const FoodImageRecognition = ({ onIngredientsDetected }) => {
    const axios = useAxios();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [detectedIngredients, setDetectedIngredients] = useState([]);
    const fileInputRef = useRef(null);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        // Filter out non-image files
        const imageFiles = files.filter(file => file.type.match('image.*'));
        
        if (imageFiles.length === 0) {
            setError('Please select image files');
            return;
        }

        // Process each file
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                setImages(prevImages => [...prevImages, reader.result]);
                setError('');
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (!files.length) return;

        // Filter out non-image files
        const imageFiles = files.filter(file => file.type.match('image.*'));
        
        if (imageFiles.length === 0) {
            setError('Please drop image files');
            return;
        }

        // Process each file
        imageFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = () => {
                setImages(prevImages => [...prevImages, reader.result]);
                setError('');
            };
            reader.readAsDataURL(file);
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    // Handle paste from clipboard
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        // Check all items for images
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = () => {
                    setImages(prevImages => [...prevImages, reader.result]);
                    setError('');
                };
                reader.readAsDataURL(blob);
                // Don't break, process all images in clipboard
            }
        }
    };

    // Add event listener for paste
    React.useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, []);

    const handleCameraToggle = async () => {
        if (showCamera) {
            // Turn off camera
            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            setShowCamera(false);
        } else {
            // Turn on camera
            setShowCamera(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access camera. Please check permissions.");
                setShowCamera(false);
            }
        }
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to data URL
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        setImages(prevImages => [...prevImages, imageDataUrl]);

        // Turn off camera
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
        setShowCamera(false);
    };

    const clearImages = () => {
        setImages([]);
        setDetectedIngredients([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const removeImage = (index) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const detectIngredients = async () => {
        if (images.length === 0) {
            setError('Please upload at least one image first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Process each image and collect all ingredients
            let allIngredients = [];
            
            for (const image of images) {
                const response = await axios.post('/clarifai/detect-ingredients', {
                    imageBase64: image
                });
                
                // Add new ingredients to our collection (avoid duplicates)
                const newIngredients = response.data.ingredients;
                allIngredients = [...new Set([...allIngredients, ...newIngredients])];
            }
            
            setDetectedIngredients(allIngredients);
            
            // Notify parent component
            if (onIngredientsDetected && allIngredients.length > 0) {
                onIngredientsDetected(allIngredients);
            }
        } catch (err) {
            console.error('Error detecting ingredients:', err);
            setError('Failed to detect ingredients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper 
            elevation={3} 
            sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 2,
                background: 'linear-gradient(to right bottom, #f5f7fa, #f8f9fb)'
            }}
        >
            <Typography variant="h5" gutterBottom color="primary" align="center">
                📸 Detect Ingredients from Food Image
            </Typography>
            
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                Take a photo or upload an image of your food to automatically detect ingredients
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 2 
                }}
            >
                {/* Camera View */}
                {showCamera && (
                    <Box sx={{ position: 'relative', width: '100%', maxWidth: 500, mb: 2 }}>
                        <video 
                            ref={videoRef}
                            autoPlay 
                            playsInline
                            style={{ width: '100%', borderRadius: '8px' }}
                        >
                            <track kind="captions" src="" label="English captions" />
                        </video>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={captureImage}
                            sx={{ 
                                position: 'absolute', 
                                bottom: '10px', 
                                left: '50%', 
                                transform: 'translateX(-50%)',
                                borderRadius: '50%',
                                minWidth: '56px',
                                width: '56px',
                                height: '56px'
                            }}
                        >
                            <CameraIcon />
                        </Button>
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </Box>
                )}

                {/* Images Preview */}
                {images.length > 0 && !showCamera && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            {images.length} {images.length === 1 ? 'Image' : 'Images'} Ready for Analysis
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 2,
                            mb: 2
                        }}>
                            {images.map((image, index) => (
                                <Box 
                                    key={`image-${index}`} 
                                    sx={{ 
                                        position: 'relative',
                                        width: 150,
                                        height: 150,
                                    }}
                                >
                                    <img 
                                        src={image} 
                                        alt={`Food preview ${index + 1}`} 
                                        style={{ 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }} 
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => removeImage(index)}
                                        sx={{ 
                                            position: 'absolute', 
                                            top: '4px', 
                                            right: '4px',
                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                            }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={clearImages}
                            size="small"
                        >
                            Clear All Images
                        </Button>
                    </Box>
                )}

                {/* Upload Area */}
                {images.length === 0 && !showCamera && (
                    <Box
                        sx={{
                            border: '2px dashed #ccc',
                            borderRadius: 2,
                            p: 3,
                            textAlign: 'center',
                            backgroundColor: '#f8f9fa',
                            width: '100%',
                            cursor: 'pointer',
                            '&:hover': {
                                borderColor: 'primary.main',
                                backgroundColor: '#f0f4f8'
                            }
                        }}
                        onClick={() => fileInputRef.current.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="body1" gutterBottom>
                            Drag & drop images here, or click to select
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Supports JPG, PNG, WEBP
                        </Typography>
                        <Typography variant="body2" color="primary">
                            You can also paste images (Ctrl+V) anywhere on this page
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            multiple
                        />
                    </Box>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<CameraIcon />}
                        onClick={handleCameraToggle}
                    >
                        {showCamera ? 'Cancel' : 'Take Photo'}
                    </Button>
                    
                    <Tooltip title="Paste image from clipboard (Ctrl+V)">
                        <Button
                            variant="outlined"
                            startIcon={<PasteIcon />}
                            onClick={() => document.dispatchEvent(new Event('paste-requested'))}
                        >
                            Paste Image
                        </Button>
                    </Tooltip>
                    
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                        onClick={detectIngredients}
                        disabled={images.length === 0 || loading}
                    >
                        {loading ? 'Detecting...' : 'Detect Ingredients'}
                    </Button>
                </Stack>

                {/* Detected Ingredients */}
                {detectedIngredients.length > 0 && (
                    <Box sx={{ mt: 3, width: '100%' }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Detected Ingredients:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {detectedIngredients.map((ingredient) => (
                                <Chip
                                    key={`ingredient-${ingredient}`}
                                    label={ingredient}
                                    color="primary"
                                    variant="outlined"
                                    icon={<CheckIcon />}
                                />
                            ))}
                        </Box>
                        <Button
                            variant="contained"
                            color="success"
                            sx={{ mt: 2 }}
                            onClick={() => onIngredientsDetected(detectedIngredients)}
                        >
                            Use These Ingredients
                        </Button>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

FoodImageRecognition.propTypes = {
    onIngredientsDetected: PropTypes.func.isRequired
};

export default FoodImageRecognition;
