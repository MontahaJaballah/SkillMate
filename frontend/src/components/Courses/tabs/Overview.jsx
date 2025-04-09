import React from 'react';
import { Check } from 'lucide-react';

const Overview = ({ course }) => {
  if (!course) return null;

  const formatDuration = (duration) => {
    if (!duration) return '0 minutes';
    if (typeof duration === 'object') {
      const { hours, minutes } = duration;
      if (hours && minutes) return `${hours} hours ${minutes} minutes`;
      if (hours) return `${hours} hours`;
      if (minutes) return `${minutes} minutes`;
      return '0 minutes';
    }
    return `${duration} minutes`; // Handle legacy format
  };

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
      </div>
    </div>
  );
};

export default Overview;