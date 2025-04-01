import React from 'react';

const StepHeader = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Course details' },
    { number: 2, title: 'Course media' },
    { number: 3, title: 'Curriculum' },
    { number: 4, title: 'Additional information' }
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex justify-between items-center">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full ${
                step.number === currentStep
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {step.number}
            </div>
            <span className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepHeader;