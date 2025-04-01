import React from 'react';
import { Play, Share2, Clock, Star } from 'lucide-react';

const CourseInfo = ({ course }) => {
  if (!course) return null;

  return (
    <div className="space-y-6">
      {/* Video Preview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3"
            alt="Course preview"
            className="w-full h-48 object-cover"
          />
          <button className="absolute inset-0 m-auto w-16 h-16 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Play className="w-8 h-8 text-red-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-3xl font-bold text-gray-900 dark:text-white">${course.price}</span>
              <span className="text-lg text-gray-500 dark:text-gray-400 line-through ml-2">${course.originalPrice}</span>
            </div>
            <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm">
              {Math.floor(((course.originalPrice - course.price) / course.originalPrice) * 100)}% off
            </span>
          </div>
          <p className="text-red-600 text-sm mb-4 dark:text-red-400">
            <Clock className="inline h-4 w-4 mr-1" />
            {course.daysLeft} days left at this price
          </p>
          <div className="space-y-3">
            <button className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors">
              Buy Now
            </button>
            <button className="w-full border border-violet-600 text-violet-600 py-2 rounded-lg hover:bg-violet-50 dark:border-violet-400 dark:text-violet-400 dark:hover:bg-violet-900 transition-colors">
              Free Trial
            </button>
          </div>
        </div>
      </div>

      {/* Course Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Course Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Total Enrollments</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">12,000+</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Average Rating</h4>
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-1" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">4.5</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Course Duration</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">36 Hours</p>
          </div>
          <div>
            <h4 className="text-sm text-gray-600 dark:text-gray-300">Last Updated</h4>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">Sep 2021</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseInfo;