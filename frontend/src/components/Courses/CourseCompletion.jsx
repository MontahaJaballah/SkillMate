import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    EmojiEvents as TrophyIcon,
    Download as DownloadIcon,
    ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const CourseCompletion = () => {
    const { courseId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [course, setCourse] = useState(null);
    const [certificateLoading, setCertificateLoading] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`/api/courses/${courseId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch course details');
                }

                setCourse(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    const handleGetCertificate = async () => {
        try {
            setCertificateLoading(true);
            const response = await fetch(`/api/courses/certificate/${courseId}/${user._id}`);
            const data = await response.json();
            
            if (data.success) {
                // Open certificate in new tab
                window.open(`http://localhost:5000${data.certificatePath}`, '_blank');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Error getting certificate: ' + error.message);
        } finally {
            setCertificateLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button
                    startIcon={<BackIcon />}
                    onClick={() => navigate(-1)}
                    variant="outlined"
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <TrophyIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                        Congratulations!
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        You've successfully completed the course
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ mt: 1 }}>
                        {course?.title}
                    </Typography>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Card variant="outlined" sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Course Summary
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Course Duration:</Typography>
                                <Typography>{course?.duration} hours</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Level:</Typography>
                                <Typography sx={{ textTransform: 'capitalize' }}>{course?.level}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Instructor:</Typography>
                                <Typography>
                                    {course?.teacher_id?.firstName} {course?.teacher_id?.lastName}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography color="text.secondary">Completion Date:</Typography>
                                <Typography>{new Date().toLocaleDateString()}</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<BackIcon />}
                        onClick={() => navigate('/dashboard')}
                    >
                        Back to Dashboard
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleGetCertificate}
                        disabled={certificateLoading}
                    >
                        {certificateLoading ? 'Generating...' : 'Get Certificate'}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default CourseCompletion;
