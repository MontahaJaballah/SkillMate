import React from 'react';
import { Star, Users, Signal, Clock, Globe, Tag } from 'lucide-react';

const CourseHeader = ({ course }) => {
  if (!course) return null;

  console.log('CourseHeader received course:', {
    id: course._id,
    title: course.title,
    skill: course.skill ? {
      id: course.skill._id,
      name: course.skill.name,
      category: course.skill.category,
      categorie: course.skill.categorie,
      proficiency: course.skill.proficiency
    } : null,
    tags: course.tags
  });

  // Get the category value, checking both spellings
  const categoryValue = course.skill?.categorie || course.skill?.category || 'No Category';

  return (
    <section className="bg-gray-100 dark:bg-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          {/* Category and Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {course.skill && (
              <span className="inline-block bg-violet-600 dark:bg-violet-500 text-white px-4 py-2 rounded-md">
                {categoryValue}
              </span>
            )}
            {Array.isArray(course.tags) && course.tags.length > 0 && course.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Tag className="h-4 w-4 mr-1" />
                {tag}
              </span>
            ))}
          </div>

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
                {course.level || 'All levels'}
              </span>
            </div>
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-violet-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-300">
                {course.language || 'English'}
              </span>
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