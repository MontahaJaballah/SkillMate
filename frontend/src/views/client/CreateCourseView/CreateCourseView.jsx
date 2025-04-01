import React, { useState } from 'react';
import StepHeader from '../../../components/CreateCourse/StepHeader';
import CourseDetails from '../../../components/CreateCourse/CourseDetails';
import CourseMedia from '../../../components/CreateCourse/CourseMedia';
import Curriculum from '../../../components/CreateCourse/Curriculum';
import AdditionalInfo from '../../../components/CreateCourse/AdditionalInfo';
import SuccessView from '../../../components/CreateCourse/SuccessView';
import Header from '../../../components/CreateCourse/Header';

function App() {
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showAddLectureModal, setShowAddLectureModal] = useState(false);
    const [showAddTopicModal, setShowAddTopicModal] = useState(false);
    const [lectures, setLectures] = useState([
        {
            id: 1,
            title: 'Introduction of Digital Marketing',
            topics: [
                { id: 1, title: 'Introduction' },
                { id: 2, title: 'What is Digital Marketing' }
            ]
        }
    ]);
    const [formData, setFormData] = useState({
        courseTitle: '',
        shortDescription: '',
        category: '',
        level: '',
        language: '',
        isFeatured: false,
        courseTime: '',
        totalLecture: '',
        price: '',
        discount: '',
        enableDiscount: false,
        description: '',
        newLectureTitle: '',
        newTopicTitle: '',
        newTopicLectureId: null,
        reviewerMessage: '',
        tags: '',
        agreeToTerms: false
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
    };

    const handlePrevious = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSubmitCourse = () => {
        setShowSuccess(true);
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

    const handleAddTopic = (lectureId) => {
        if (formData.newTopicTitle.trim()) {
            setLectures(prev => prev.map(lecture => {
                if (lecture.id === lectureId) {
                    return {
                        ...lecture,
                        topics: [
                            ...lecture.topics,
                            { id: Date.now(), title: formData.newTopicTitle }
                        ]
                    };
                }
                return lecture;
            }));
            setFormData(prev => ({ ...prev, newTopicTitle: '', newTopicLectureId: null }));
            setShowAddTopicModal(false);
        }
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

    if (showSuccess) {
        return <SuccessView />;
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <CourseDetails formData={formData} handleInputChange={handleInputChange} />;
            case 2:
                return <CourseMedia />;
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
                                    ? 'bg-primary-500 dark:bg-primary-600'
                                    : 'bg-success-500 dark:bg-success-600'
                                    } text-white rounded-md ml-auto hover:opacity-90 transition-opacity`}
                            >
                                {currentStep < 4 ? 'Next' : 'Submit Course'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;