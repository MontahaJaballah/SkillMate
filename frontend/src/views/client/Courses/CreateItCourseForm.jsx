import React, { useState } from 'react';
import axios from 'axios';
import './CreateItCourseForm.css';

const CreateItCourseForm = ({ onClose, onSuccess, user }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lessons: [],
        quiz: null,
        finalExam: null
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const courseData = {
                ...formData,
                teacher_id: user._id,
                type: 'IT'
            };

            const response = await axios.post(
                'http://localhost:5000/api/courses/createItCourse',
                courseData
            );

            if (response.data) {
                onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating course');
            console.error('Error creating course:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addLesson = () => {
        setFormData(prev => ({
            ...prev,
            lessons: [
                ...prev.lessons,
                {
                    title: '',
                    content: '',
                    duration: 30,
                    codeChallenge: null
                }
            ]
        }));
    };

    const updateLesson = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            lessons: prev.lessons.map((lesson, i) => 
                i === index ? { ...lesson, [field]: value } : lesson
            )
        }));
    };

    const toggleCodeChallenge = (index) => {
        setFormData(prev => ({
            ...prev,
            lessons: prev.lessons.map((lesson, i) => 
                i === index ? {
                    ...lesson,
                    codeChallenge: lesson.codeChallenge ? null : {
                        description: '',
                        testCases: [],
                        solution: ''
                    }
                } : lesson
            )
        }));
    };

    const updateCodeChallenge = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            lessons: prev.lessons.map((lesson, i) => 
                i === index ? {
                    ...lesson,
                    codeChallenge: {
                        ...lesson.codeChallenge,
                        [field]: value
                    }
                } : lesson
            )
        }));
    };

    const addTestCase = (index) => {
        setFormData(prev => ({
            ...prev,
            lessons: prev.lessons.map((lesson, i) => 
                i === index ? {
                    ...lesson,
                    codeChallenge: {
                        ...lesson.codeChallenge,
                        testCases: [
                            ...(lesson.codeChallenge?.testCases || []),
                            { input: '', expectedOutput: '' }
                        ]
                    }
                } : lesson
            )
        }));
    };

    const updateTestCase = (lessonIndex, testCaseIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            lessons: prev.lessons.map((lesson, i) => 
                i === lessonIndex ? {
                    ...lesson,
                    codeChallenge: {
                        ...lesson.codeChallenge,
                        testCases: lesson.codeChallenge.testCases.map((testCase, j) =>
                            j === testCaseIndex ? { ...testCase, [field]: value } : testCase
                        )
                    }
                } : lesson
            )
        }));
    };

    const removeLesson = (index) => {
        setFormData(prev => ({
            ...prev,
            lessons: prev.lessons.filter((_, i) => i !== index)
        }));
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <div className="form-step">
                        <h3>Course Details</h3>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-step">
                        <h3>Lessons</h3>
                        {formData.lessons.map((lesson, index) => (
                            <div key={index} className="lesson-form">
                                <div className="form-group">
                                    <label>Lesson Title</label>
                                    <input
                                        type="text"
                                        value={lesson.title}
                                        onChange={(e) => updateLesson(index, 'title', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Content</label>
                                    <textarea
                                        value={lesson.content}
                                        onChange={(e) => updateLesson(index, 'content', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Duration (minutes)</label>
                                    <input
                                        type="number"
                                        value={lesson.duration}
                                        onChange={(e) => updateLesson(index, 'duration', e.target.value)}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="form-group checkbox">
                                    <input
                                        type="checkbox"
                                        id={`hasCodeChallenge-${index}`}
                                        checked={!!lesson.codeChallenge}
                                        onChange={() => toggleCodeChallenge(index)}
                                    />
                                    <label htmlFor={`hasCodeChallenge-${index}`}>Include Code Challenge</label>
                                </div>
                                {lesson.codeChallenge && (
                                    <div className="code-challenge-form">
                                        <div className="form-group">
                                            <label>Challenge Description</label>
                                            <textarea
                                                value={lesson.codeChallenge.description}
                                                onChange={(e) => updateCodeChallenge(index, 'description', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Solution Template</label>
                                            <textarea
                                                value={lesson.codeChallenge.solution}
                                                onChange={(e) => updateCodeChallenge(index, 'solution', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="test-cases">
                                            <h4>Test Cases</h4>
                                            {lesson.codeChallenge.testCases.map((testCase, testIndex) => (
                                                <div key={testIndex} className="test-case">
                                                    <div className="form-group">
                                                        <label>Input</label>
                                                        <input
                                                            type="text"
                                                            value={testCase.input}
                                                            onChange={(e) => updateTestCase(index, testIndex, 'input', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Expected Output</label>
                                                        <input
                                                            type="text"
                                                            value={testCase.expectedOutput}
                                                            onChange={(e) => updateTestCase(index, testIndex, 'expectedOutput', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                className="add-test-case-btn"
                                                onClick={() => addTestCase(index)}
                                            >
                                                Add Test Case
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    className="remove-btn"
                                    onClick={() => removeLesson(index)}
                                >
                                    Remove Lesson
                                </button>
                            </div>
                        ))}
                        <button type="button" className="add-lesson-btn" onClick={addLesson}>
                            Add Lesson
                        </button>
                    </div>
                );
            case 3:
                return (
                    <div className="form-step">
                        <h3>Final Exam</h3>
                        <div className="form-group checkbox">
                            <input
                                type="checkbox"
                                id="hasFinalExam"
                                checked={!!formData.finalExam}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        finalExam: e.target.checked ? {
                                            description: '',
                                            testCases: [],
                                            solution: ''
                                        } : null
                                    }));
                                }}
                            />
                            <label htmlFor="hasFinalExam">Include Final Exam</label>
                        </div>
                        {formData.finalExam && (
                            <div className="exam-form">
                                <div className="form-group">
                                    <label>Problem Description</label>
                                    <textarea
                                        value={formData.finalExam.description}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            finalExam: {
                                                ...prev.finalExam,
                                                description: e.target.value
                                            }
                                        }))}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Solution Template</label>
                                    <textarea
                                        value={formData.finalExam.solution}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            finalExam: {
                                                ...prev.finalExam,
                                                solution: e.target.value
                                            }
                                        }))}
                                        required
                                    />
                                </div>
                                <div className="test-cases">
                                    <h4>Test Cases</h4>
                                    {formData.finalExam.testCases.map((testCase, index) => (
                                        <div key={index} className="test-case">
                                            <div className="form-group">
                                                <label>Input</label>
                                                <input
                                                    type="text"
                                                    value={testCase.input}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        finalExam: {
                                                            ...prev.finalExam,
                                                            testCases: prev.finalExam.testCases.map((tc, i) =>
                                                                i === index ? { ...tc, input: e.target.value } : tc
                                                            )
                                                        }
                                                    }))}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Expected Output</label>
                                                <input
                                                    type="text"
                                                    value={testCase.expectedOutput}
                                                    onChange={(e) => setFormData(prev => ({
                                                        ...prev,
                                                        finalExam: {
                                                            ...prev.finalExam,
                                                            testCases: prev.finalExam.testCases.map((tc, i) =>
                                                                i === index ? { ...tc, expectedOutput: e.target.value } : tc
                                                            )
                                                        }
                                                    }))}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        className="add-test-case-btn"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            finalExam: {
                                                ...prev.finalExam,
                                                testCases: [
                                                    ...prev.finalExam.testCases,
                                                    { input: '', expectedOutput: '' }
                                                ]
                                            }
                                        }))}
                                    >
                                        Add Test Case
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="create-course-form">
            <div className="form-header">
                <h2>Create IT Course - Step {step} of 3</h2>
                <button className="close-button" onClick={onClose}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                
                <div className="form-content">
                    {renderStep()}
                </div>

                <div className="form-actions">
                    {step > 1 && (
                        <button
                            type="button"
                            className="prev-btn"
                            onClick={() => setStep(step - 1)}
                        >
                            Previous
                        </button>
                    )}
                    
                    {step < 3 ? (
                        <button
                            type="button"
                            className="next-btn"
                            onClick={() => setStep(step + 1)}
                            disabled={
                                (step === 1 && (!formData.title || !formData.description)) ||
                                (step === 2 && formData.lessons.length === 0)
                            }
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className={`submit-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Course'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateItCourseForm;
