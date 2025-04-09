import React, { useState, useEffect, useMemo } from 'react';
import StepHeader from '../../../components/CreateCourse/StepHeader';
import CourseDetails from '../../../components/CreateCourse/CourseDetails';
import CourseMedia from '../../../components/CreateCourse/CourseMedia';
import Curriculum from '../../../components/CreateCourse/Curriculum';
import AdditionalInfo from '../../../components/CreateCourse/AdditionalInfo';
import SuccessView from '../../../components/CreateCourse/SuccessView';
import Header from '../../../components/CreateCourse/Header';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

const CreateCourseView = () => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(() => {
        const saved = sessionStorage.getItem('createCourseStep');
        return saved ? parseInt(saved, 10) : 1;
    });

    const [showSuccess, setShowSuccess] = useState(false);
    const [showAddLectureModal, setShowAddLectureModal] = useState(false);
    const [showAddTopicModal, setShowAddTopicModal] = useState(false);

    // Initialize formData state with useState
    const [formData, setFormData] = useState(() => {
        const saved = sessionStorage.getItem('createCourseFormData');
        return saved ? JSON.parse(saved) : {
            courseTitle: '',
            shortDescription: '',
            category: '',
            level: '',
            language: '',
            isFeatured: false,
            courseTime: '',
            totalLecture: '',
            price: '',
            originalPrice: '',
            discount: 0,
            enableDiscount: false,
            description: '',
            newLectureTitle: '',
            newTopicTitle: '',
            newTopicLectureId: null,
            tags: [], // Initialize as empty array instead of empty string
            agreeToTerms: false,
            title: '',
            type: 'regular',
            thumbnail: '',
            skill: '',
            schedule: 'flexible',
            duration: '',
            prerequisites: '',
            sections: '',
            topics: [], // Initialize topics array
            mediaUrl: '', // Initialize mediaUrl
            videoUrl: '', // Initialize videoUrl,
            faqs: [], // Initialize FAQs array
        };
    });

    // Initialize lectures state with useState
    const [lectures, setLectures] = useState(() => {
        const saved = sessionStorage.getItem('createCourseLectures');
        return saved ? JSON.parse(saved) : [];
    });

    const navigate = useNavigate();

    // Save state to sessionStorage whenever it changes
    useEffect(() => {
        sessionStorage.setItem('createCourseStep', currentStep.toString());
        sessionStorage.setItem('createCourseLectures', JSON.stringify(lectures));
        sessionStorage.setItem('createCourseFormData', JSON.stringify(formData));
    }, [currentStep, lectures, formData]);

    // Clear sessionStorage when window is closed
    useEffect(() => {
        const handleWindowClose = () => {
            clearSessionStorage();
        };

        window.addEventListener('beforeunload', handleWindowClose);
        return () => {
            window.removeEventListener('beforeunload', handleWindowClose);
        };
    }, []);

    const clearSessionStorage = () => {
        sessionStorage.removeItem('createCourseStep');
        sessionStorage.removeItem('createCourseLectures');
        sessionStorage.removeItem('createCourseFormData');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => {
            const newState = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Handle price and discount calculations
            if (name === 'price') {
                // When price is entered, set it as original price
                return {
                    ...newState,
                    originalPrice: value,
                    price: newState.enableDiscount && newState.discount ?
                        (parseFloat(value) * (1 - parseFloat(newState.discount) / 100)).toFixed(2).toString()
                        : value
                };
            }

            if (name === 'discount' || name === 'enableDiscount') {
                if (newState.enableDiscount && newState.originalPrice && value) {
                    // Calculate discounted price based on percentage
                    const originalPrice = parseFloat(newState.originalPrice);
                    const discountPercent = name === 'discount' ? parseFloat(value) : parseFloat(newState.discount);
                    const finalPrice = originalPrice * (1 - discountPercent / 100);

                    return {
                        ...newState,
                        price: finalPrice.toFixed(2).toString()
                    };
                } else if (!newState.enableDiscount) {
                    // If discount is disabled, price reverts to original price
                    return {
                        ...newState,
                        price: newState.originalPrice || ''
                    };
                }
            }

            return newState;
        });
    };

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSubmitCourse = async (e) => {
        e.preventDefault();

        // Validate skill ID
        if (!formData.skill) {
            toast.error('Please select a skill for the course');
            return;
        }

        // Ensure we have a valid teacher ID
        if (!user?._id) {
            toast.error('User authentication issue. Please log in again.');
            return;
        }

        const courseData = {
            title: formData.courseTitle,
            description: formData.description,
            shortDescription: formData.shortDescription,
            type: formData.type || 'regular',
            thumbnail: formData.thumbnail,
            skill: formData.skill,
            teacher_id: user._id,
            price: parseFloat(formData.enableDiscount ? formData.price : formData.originalPrice) || 0,
            originalPrice: parseFloat(formData.originalPrice) || 0,
            // Add a dummy duration field to satisfy server validation
            // The actual duration will be calculated on the server
            duration: {
                hours: 0,
                minutes: 0,
                totalMinutes: 0
            },
            level: formData.level,
            language: formData.language,
            prerequisites: formData.prerequisites ? [formData.prerequisites] : [],
            sections: lectures.map(lecture => ({
                title: lecture.title,
                content: lecture.topics.map(topic => {
                    // Normalize the type to lowercase
                    const contentType = (topic.type || '').toLowerCase();

                    const baseContent = {
                        title: topic.title,
                        type: contentType, // Use normalized type
                        duration: parseInt(topic.duration) || 0,
                        description: topic.description || '',
                        resources: topic.resources || []
                    };

                    // Add type-specific fields based on content type
                    if (contentType === 'video') {
                        return {
                            ...baseContent,
                            videoUrl: topic.videoUrl || '',
                            videoType: topic.videoType || 'youtube' // Always set for video type
                        };
                    } else if (contentType === 'quiz') {
                        return {
                            ...baseContent,
                            questions: topic.questions || []
                        };
                    } else if (contentType === 'assignment') {
                        return {
                            ...baseContent,
                            instructions: topic.instructions || '',
                            submissionType: topic.submissionType || 'text'
                        };
                    }

                    // Default to video type if no valid type is specified
                    return {
                        ...baseContent,
                        type: 'video',
                        videoUrl: '',
                        videoType: 'youtube'
                    };
                })
            })),
            tags: Array.isArray(formData.tags) ? formData.tags : [],
            faqs: Array.isArray(formData.faqs) ? formData.faqs : []
        };

        // Basic validation
        if (!courseData.title) {
            toast.error('Course title is required');
            return;
        }
        if (!courseData.description) {
            toast.error('Description is required');
            return;
        }
        if (!courseData.skill) {
            toast.error('Skill is required');
            return;
        } if (!courseData.level) {
            toast.error('Level is required');
            return;
        }
        if (!courseData.language) {
            toast.error('Language is required');
            return;
        }
        if (!courseData.thumbnail) {
            toast.error('Thumbnail is required');
            return;
        }

        // Additional validation for lectures
        if (!lectures || lectures.length === 0) {
            toast.error('Please add at least one lecture to the course');
            return;
        }

        // Validate that each lecture has at least one topic
        const emptyLectures = lectures.filter(lecture => !lecture.topics || lecture.topics.length === 0);
        if (emptyLectures.length > 0) {
            toast.error(`Some lectures have no topics: ${emptyLectures.map(l => l.title).join(', ')}`);
            return;
        }

        // Validate that video topics have valid URLs
        let hasInvalidVideoTopics = false;
        lectures.forEach(lecture => {
            lecture.topics.forEach(topic => {
                if (topic.type === 'video' && !topic.videoUrl && topic.videoType === 'youtube') {
                    hasInvalidVideoTopics = true;
                    toast.error(`Topic "${topic.title}" in lecture "${lecture.title}" is missing a video URL`);
                }
            });
        });
        if (hasInvalidVideoTopics) return;

        try {
            console.log('Submitting course data:', courseData);
            const response = await axios.post('http://localhost:5000/api/courses/create', courseData);

            toast.success('Course created successfully!');
            console.log('Course created successfully!');
            console.log('Response data:', response.data);

            // Clear form data and navigate to success page
            clearSessionStorage();
            setShowSuccess(true);
        } catch (error) {
            console.error('Error creating course:', error);

            // Improved error handling
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Server response:', error.response.data);
                toast.error(error.response.data.message || 'Error creating course');

                // Show more detailed error if available
                if (error.response.data.error) {
                    console.error('Error details:', error.response.data.error);
                    toast.error(`Error details: ${error.response.data.error}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error('No response received:', error.request);
                toast.error('No response from server. Please check your connection.');
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error setting up request:', error.message);
                toast.error(`Error: ${error.message}`);
            }
        }
    };

    const handleAddLecture = () => {
        if (formData.newLectureTitle.trim()) {
            setLectures(prev => [
                ...prev,
                {
                    id: Date.now(),
                    title: formData.newLectureTitle,
                    topics: []
                }
            ]);
            setFormData(prev => ({ ...prev, newLectureTitle: '' }));
            setShowAddLectureModal(false);
        }
    };

    const handleAddTopic = () => {
        if (!formData.newTopicTitle || !formData.newTopicLectureId) return;

        const newTopic = {
            id: Date.now(),
            title: formData.newTopicTitle,
            type: 'video', // default type
            duration: 0,
            description: '',
            videoUrl: '',
            videoType: 'youtube',
            resources: []
        };

        setLectures(prev => prev.map(lecture =>
            lecture.id === formData.newTopicLectureId
                ? { ...lecture, topics: [...lecture.topics, newTopic] }
                : lecture
        ));
        setFormData(prev => ({ ...prev, newTopicTitle: '', newTopicLectureId: null }));
        setShowAddTopicModal(false);
    };

    const handleDeleteTopic = (lectureId, topicId) => {
        setLectures(prev => prev.map(lecture => {
            if (lecture.id === lectureId) {
                return {
                    ...lecture,
                    topics: lecture.topics.filter(topic => topic.id !== topicId)
                };
            }
            return lecture;
        }));
    };

    const handleDeleteLecture = (lectureId) => {
        setLectures(prev => prev.filter(lecture => lecture.id !== lectureId));
    };

    const handleSaveTopicEdit = (lectureId, editedTopic) => {
        setLectures(prev => prev.map(lecture => {
            if (lecture.id === lectureId) {
                return {
                    ...lecture,
                    topics: lecture.topics.map(topic =>
                        topic.id === editedTopic.id ? editedTopic : topic
                    )
                };
            }
            return lecture;
        }));
    };

    if (showSuccess) {
        return <SuccessView />;
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <CourseDetails formData={formData} handleInputChange={handleInputChange} />;
            case 2:
                return <CourseMedia formData={formData} handleInputChange={handleInputChange} />;
            case 3:
                return (
                    <Curriculum
                        lectures={lectures}
                        showAddLectureModal={showAddLectureModal}
                        showAddTopicModal={showAddTopicModal}
                        formData={formData}
                        handleInputChange={handleInputChange}
                        setShowAddLectureModal={setShowAddLectureModal}
                        setShowAddTopicModal={setShowAddTopicModal}
                        handleAddLecture={handleAddLecture}
                        handleAddTopic={handleAddTopic}
                        handleDeleteTopic={handleDeleteTopic}
                        handleDeleteLecture={handleDeleteLecture}
                        handleSaveTopicEdit={handleSaveTopicEdit}
                        setFormData={setFormData}
                    />
                );
            case 4:
                return <AdditionalInfo formData={formData} handleInputChange={handleInputChange} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div><Header /></div>
            <div className="max-w-5xl mx-auto px-4 mt-12 pb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-none">
                    <StepHeader currentStep={currentStep} />

                    <div className="p-6">
                        {renderStepContent()}

                        <div className="flex justify-between mt-8">
                            {currentStep > 1 && (
                                <button
                                    onClick={handlePrevious}
                                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Previous
                                </button>
                            )}
                            <button
                                onClick={currentStep < 4 ? handleNext : handleSubmitCourse}
                                className={`px-6 py-2 ${currentStep < 4
                                    ? 'bg-violet-600 hover:bg-violet-700'
                                    : 'bg-green-600 hover:bg-green-700'
                                    } text-white rounded-md ${currentStep === 1 ? 'ml-auto' : ''} transition-colors`}
                            >
                                {currentStep < 4 ? 'Next' : 'Submit Course'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(CreateCourseView);