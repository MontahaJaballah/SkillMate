import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Play, Lock, ChevronDown, ChevronUp, ArrowLeft, Menu, X, HelpCircle, Code, FileText, MessageCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import CodeCompiler from '../../components/CodeCompiler/CodeCompiler';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(0);
  const [activeContent, setActiveContent] = useState(null);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [showFaqs, setShowFaqs] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);
  const [contentType, setContentType] = useState('lesson'); // 'lesson', 'faq'
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/courses/${courseId}`);
        setCourse(response.data);
        
        // Set first content as active by default
        if (response.data.sections && response.data.sections.length > 0 && 
            response.data.sections[0].content && response.data.sections[0].content.length > 0) {
          setActiveContent(response.data.sections[0].content[0]);
        }
        
        // Check if user is enrolled
        if (!response.data.students.includes(user?._id)) {
          toast.error('You are not enrolled in this course');
          navigate(`/course/${courseId}`);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, user, navigate]);

  const handleSectionToggle = (index) => {
    setActiveSection(activeSection === index ? -1 : index);
  };

  const handleContentSelect = (content) => {
    setActiveContent(content);
    setContentType('lesson');
    setShowFaqs(false);
  };

  const handleFaqSelect = (faq) => {
    setActiveFaq(faq);
    setContentType('faq');
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // Fix nested template literals
    let result = '';
    if (hours > 0) {
      result += `${hours}h `;
    }
    if (mins > 0) {
      result += `${mins}m`;
    }
    return result || '0m';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Course not found</h2>
          <button 
            onClick={() => navigate('/courses')}
            className="px-6 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900">
      <section className="py-0 bg-dark position-relative">
        <div className="flex flex-row h-screen">
          {/* Video Player */}
          <div className="flex-grow w-full bg-black relative overflow-hidden">
            {/* Video Content */}
            <div className="h-full flex items-center justify-center">
              {contentType === 'lesson' ? (
                // Regular course content display
                activeContent?.type === 'video' ? (
                  <div className="w-full h-full video-player rounded-lg overflow-hidden">
                    {activeContent.videoUrl?.includes('youtube') ? (
                      <iframe
                        className="w-full h-full"
                        src={activeContent.videoUrl}
                        title={activeContent.title}
                        border="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video 
                        ref={videoRef}
                        className="w-full h-full" 
                        controls 
                        crossOrigin="anonymous" 
                        playsInline
                        poster="https://images.unsplash.com/photo-1593642532744-d377ab507dc8"
                      >
                        <source src={activeContent.videoUrl} type="video/mp4" />
                        <track kind="captions" label="English" srcLang="en" src="#" default />
                      </video>
                    )}
                  </div>
                ) : activeContent?.type === 'quiz' ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl mx-auto my-8 p-6 w-full">
                    <div className="flex items-center mb-6">
                      <HelpCircle className="text-blue-500 mr-3 h-8 w-8" />
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{activeContent?.title || 'Quiz'}</h3>
                    </div>
                    
                    {activeContent?.description && (
                      <div className="mb-6 text-gray-600 dark:text-gray-300">
                        <p>{activeContent.description}</p>
                      </div>
                    )}
                    
                    {activeContent?.questions && activeContent.questions.length > 0 ? (
                      <div className="space-y-6">
                        {activeContent.questions.map((question, qIndex) => (
                          <div key={`question-${qIndex}`} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h4 className="font-semibold text-lg mb-3 text-gray-800 dark:text-white">{question.question}</h4>
                            
                            {question.options && (
                              <div className="space-y-2">
                                {question.options.map((option, oIndex) => (
                                  <div key={`option-${qIndex}-${oIndex}`} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                                    <input 
                                      type="radio" 
                                      id={`q${qIndex}-o${oIndex}`} 
                                      name={`question-${qIndex}`} 
                                      className="mr-3" 
                                    />
                                    <label htmlFor={`q${qIndex}-o${oIndex}`} className="text-gray-700 dark:text-gray-300 cursor-pointer w-full">
                                      {option}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        <div className="mt-6 flex justify-end">
                          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Submit Answers
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No questions available for this quiz.</p>
                      </div>
                    )}
                  </div>
                ) : activeContent?.type === 'assignment' ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl mx-auto my-8 p-6 w-full">
                    <div className="flex items-center mb-6">
                      <FileText className="text-green-500 mr-3 h-8 w-8" />
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{activeContent?.title || 'Assignment'}</h3>
                    </div>
                    
                    {activeContent?.description && (
                      <div className="mb-6 text-gray-600 dark:text-gray-300">
                        <p>{activeContent.description}</p>
                      </div>
                    )}
                    
                    {activeContent?.instructions && (
                      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Instructions:</h4>
                        <p className="text-gray-600 dark:text-gray-300">{activeContent.instructions}</p>
                      </div>
                    )}
                    
                    {activeContent?.submissionType === 'code' && (
                      <div className="mb-6">
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Your Solution:</h4>
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                          <textarea 
                            className="w-full h-40 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            placeholder="Write your code here..."
                          ></textarea>
                        </div>
                        <div className="mt-4 flex justify-end">
                          <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center">
                            <Code className="mr-2 h-4 w-4" />
                            Submit Solution
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-white p-8">
                    <h3 className="text-2xl font-bold mb-4">{activeContent?.title || 'Select a lesson to start'}</h3>
                    <p>{activeContent?.description || 'Click on a lesson from the sidebar to begin learning'}</p>
                  </div>
                )
              ) : contentType === 'faq' && showFaqs ? (
                // Course content area with collapsible coding challenges
                <div className="bg-white dark:bg-gray-800 w-full h-full overflow-auto">
                  {/* Course content header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Coding Challenges</h3>
                  </div>

                  {/* Collapsible coding challenges list */}
                  <div className="p-4">
                    {course?.faqs && course.faqs.length > 0 ? (
                      <div className="space-y-4">
                        {course.faqs.map((faq, index) => (
                          <div key={`faq-${index}`} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            {/* Challenge header - clickable to expand/collapse */}
                            <button
                              className={`w-full flex items-center justify-between p-4 text-left ${activeFaq?.question === faq.question
                                ? 'bg-purple-50 dark:bg-purple-900/20'
                                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                              onClick={() => {
                                if (activeFaq?.question === faq.question) {
                                  setActiveFaq(null);
                                } else {
                                  setActiveFaq(faq);
                                }
                              }}
                            >
                              <div className="flex items-center">
                                <div className="w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full mr-3">
                                  <Code size={16} />
                                </div>
                                <div className="text-left">
                                  <h4 className="font-medium text-gray-900 dark:text-white">{faq.question}</h4>
                                </div>
                              </div>
                              <div>
                                {activeFaq?.question === faq.question ? (
                                  <ChevronUp size={20} className="text-gray-500 dark:text-gray-400" />
                                ) : (
                                  <ChevronDown size={20} className="text-gray-500 dark:text-gray-400" />
                                )}
                              </div>
                            </button>

                            {/* Expanded challenge content with code compiler */}
                            {activeFaq?.question === faq.question && (
                              <div className="border-t border-gray-200 dark:border-gray-700">
                                {/* Challenge description */}
                                <div className="p-4 bg-gray-50 dark:bg-gray-700">
                                  <div className="prose dark:prose-invert max-w-none">
                                    <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                                  </div>
                                </div>

                                {/* Code editor section */}
                                <div className="p-4">
                                  <div className="mb-2">
                                    <h5 className="text-lg font-medium text-gray-900 dark:text-white">Your Solution</h5>
                                  </div>
                                  <CodeCompiler 
                                    expectedOutput={faq.expectedOutput} 
                                    testCases={faq.testCases} 
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p>No coding challenges available for this course.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-white p-8">
                  <h3 className="text-2xl font-bold mb-4">Select a lesson or FAQ to start</h3>
                  <p>Click on a lesson from the sidebar or the FAQs button to begin learning</p>
                </div>
              )}
            </div>

            {/* Toggle Sidebar Button */}
            <button
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all z-10"
              onClick={() => setOpenSidebar(!openSidebar)}
              aria-label="Toggle course content"
            >
              {openSidebar ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Course Content Sidebar */}
          <div 
            className={`${
              openSidebar ? 'block' : 'hidden'
            } absolute right-0 top-0 h-screen w-[280px] sm:w-[400px] bg-white dark:bg-gray-800 overflow-auto shadow-lg transition-all duration-300 ease-in-out z-20`}
          >
            {/* Course Title */}
            <div className="p-4 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold text-gray-800 dark:text-white">{course.title}</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    By {course.teacher_id?.name || 'Instructor'}
                  </p>
                </div>
                <button 
                  onClick={() => setOpenSidebar(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-4">
              <h5 className="font-bold text-gray-800 dark:text-white mb-2">Course content</h5>
              <hr className="border-gray-200 dark:border-gray-700 mb-4" />
              
              {/* Sections Accordion */}
              <div className="accordion accordion-flush-light accordion-flush space-y-2">
                {course.sections?.map((section, sectionIndex) => (
                  <div key={`section-${section.title}-${sectionIndex}`} className="accordion-item border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    {/* Section Header */}
                    <button
                      className="w-full flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-750 text-left accordion-button"
                      onClick={() => handleSectionToggle(sectionIndex)}
                    >
                      <span className="font-bold text-gray-800 dark:text-white">
                        {section.title}
                      </span>
                      <span>
                        {activeSection === sectionIndex ? (
                          <ChevronUp size={18} className="text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
                        )}
                      </span>
                    </button>

                    {/* Section Content */}
                    {activeSection === sectionIndex && (
                      <div className="accordion-body p-3 space-y-2 bg-white dark:bg-gray-800">
                        {section.content?.map((content, contentIndex) => (
                          <div 
                            key={`content-${content.title}-${contentIndex}`}
                            className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                              activeContent === content 
                                ? 'bg-violet-100 dark:bg-violet-900' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => handleContentSelect(content)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                handleContentSelect(content);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <div className="flex items-center">
                              <div className="position-relative d-flex align-items-center">
                                {content.type === 'video' ? (
                                  <div className="w-8 h-8 flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full mr-2">
                                    <Play size={14} />
                                  </div>
                                ) : content.type === 'quiz' ? (
                                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full mr-2">
                                    <HelpCircle size={14} />
                                  </div>
                                ) : content.type === 'assignment' ? (
                                  <div className="w-8 h-8 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full mr-2">
                                    <FileText size={14} />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full mr-2">
                                    <Lock size={14} />
                                  </div>
                                )}
                                <span className="d-inline-block text-truncate text-sm font-medium text-gray-800 dark:text-gray-200 w-[150px] sm:w-[250px]">
                                  {content.title}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center ml-auto">
                                {formatDuration(content.duration)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="d-grid">
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/course/${courseId}`)}
                    className="flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300 rounded-md transition-colors flex items-center justify-center"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to course
                  </button>
                  <button
                    onClick={() => {
                      setShowFaqs(!showFaqs);
                      setContentType('faq');
                      setOpenSidebar(false); // Close sidebar when clicking FAQs
                      if (!showFaqs && course?.faqs?.length > 0) {
                        setActiveFaq(course.faqs[0]);
                      }
                    }}
                    className="py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900 dark:hover:bg-purple-800 dark:text-purple-300 rounded-md transition-colors flex items-center justify-center"
                    aria-label="Toggle FAQs"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    FAQs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      

    </main>
  );
};

export default CoursePlayer;
