import React from 'react';
import { Star, Users, Signal, Clock, Globe } from 'lucide-react';

const CourseHeader = ({ course }) => {
  if (!course) return null;

  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          <span className="inline-block bg-violet-600 dark:bg-violet-500 text-white px-4 py-2 rounded-md mb-4">
            {course.skill?.category || 'Digital Marketing'}
          </span>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {course.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-gray-900 dark:text-gray-300">
                {course.averageRating || 0}/5.0
              </span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-300">
                {course.students?.length || 0} Enrolled
              </span>
            </div>
            <div className="flex items-center">
              <Signal className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-300">
                {course.skill?.proficiency || 'All levels'}
              </span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-300">English</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-300">
                Last updated {new Date(course.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseHeader;