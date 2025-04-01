import React from 'react';
import { Check } from 'lucide-react';

const Overview = ({ course }) => {
  if (!course) return null;

  return (
    <div className="container mx-auto px-4">
      <div className="space-y-8">
        <div>
          <h5 className="text-xl font-semibold mb-4">Course Description</h5>
          <p className="text-gray-600 mb-4">
            {course.description}
          </p>
        </div>

        <div>
          <h5 className="text-xl font-semibold mb-4">What you'll learn</h5>
          <div className="grid grid-cols-1 gap-4">
            {course.learningObjectives?.map((objective, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">{objective}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-xl font-semibold mb-4">Requirements</h5>
          <div className="grid grid-cols-1 gap-4">
            {course.requirements?.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-gray-600">{requirement}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="text-xl font-semibold mb-4">About the course</h5>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Duration:</span>
              <span className="text-gray-600">{course.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Price:</span>
              <span className="text-gray-600">${course.price}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Created by:</span>
              <span className="text-gray-600">{course.teacher_id?.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;