import React, { useState } from 'react';
import { Play, Clock, Star, CheckCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const CourseInfo = ({ course }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(course?.students?.includes(user?._id));
  
  if (!course) return null;

  const hasDiscount = course.originalPrice && course.originalPrice > course.price;
  const discountPercentage = hasDiscount
    ? Math.floor(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;
    
  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please log in to enroll in this course');
      return;
    }
    
    if (enrolled) {
      toast.success('You are already enrolled in this course');
      return;
    }
    
    try {
      setEnrolling(true);
      const response = await axios.post(`/courses/enroll/${course._id}`, {
        userId: user._id
      });
      
      setEnrolled(true);
      toast.success(response.data.message || 'Successfully enrolled in course');
      
      // Log enrolled users to the terminal
      console.log('User enrolled in course:', {
        courseId: course._id,
        courseTitle: course.title,
        userId: user._id,
        userName: user.firstName + ' ' + user.lastName,
        enrollmentDate: new Date().toISOString()
      });
      
      // Fetch and log all enrolled users
      try {
        const courseResponse = await axios.get(`/courses/${course._id}`);
        const enrolledUsers = courseResponse.data.students || [];
        console.log(`All users enrolled in course "${course.title}" (${course._id}):`, enrolledUsers);
        
        // Don't auto-navigate after enrollment, let the user click Continue Learning
      } catch (error) {
        console.error('Error fetching enrolled users:', error);
      }
      
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Preview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
            alt={course.title}
            className="w-full h-48 object-cover"
          />
          <button className="absolute inset-0 m-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Play className="w-8 h-8 text-red-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${course.price?.toFixed(2) || '0.00'}
              </span>
              {hasDiscount && (
                <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                  ${course.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm">
                {discountPercentage}% off
              </span>
            )}
          </div>
          {hasDiscount && course.daysLeft > 0 && (
            <p className="text-red-600 text-sm mb-4 dark:text-red-400">
              <Clock className="inline h-4 w-4 mr-1" />
              {course.daysLeft} days left at this price
            </p>
          )}
          <div className="space-y-3">
            {!enrolled ? (
              <button 
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full py-2 rounded-lg transition-colors flex items-center justify-center bg-violet-600 hover:bg-violet-700 dark:hover:bg-violet-500 text-white"
              >
                {enrolling ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enrolling...
                  </>
                ) : (
                  'Enroll Now'
                )}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center py-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  <span>Enrolled</span>
                </div>
                <button 
                  onClick={() => navigate(`/course-player/${course._id}`)}
                  className="w-full py-2 rounded-lg transition-colors bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white flex items-center justify-center"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Continue Learning
                </button>
              </div>
            )}
            {/* <button className="w-full border border-violet-600 text-violet-600 py-2 rounded-lg hover:bg-violet-50 dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-900 transition-colors">
              Add to Cart
            </button> */}
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">About the course</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Total Enrollments</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {course.students?.length || 0} {course.students?.length === 1 ? 'student' : 'students'}
            </p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Average Rating</h4>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {course.rating?.toFixed(1) || '0.0'}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({course.reviews || 0} {course.reviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Course Duration</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {course.duration ? (
                <>
                  {course.duration >= 60 && `${Math.floor(course.duration / 60)}h`}
                  {course.duration % 60 > 0 && ` ${course.duration % 60}m`}
                  {course.duration === 0 && '0m'}
                </>
              ) : '0m'}
            </p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Last Updated</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {course.updatedAt ? new Date(course.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              }) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInfo;