import React, { useState } from 'react';
import { Play, ChevronDown } from 'lucide-react';

const Curriculum = ({ course }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  if (!course || !course.sections) return null;

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="space-y-6">
      {course.sections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => toggleSection(index)}
            className="w-full p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-300">{section.content.length} Topics</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${expandedSection === index ? 'rotate-180' : ''}`}
            />
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${expandedSection === index ? 'max-h-96' : 'max-h-0'}`}
          >
            <div className="p-4">
              <div className="space-y-2">
                {section.content.map((topic, topicIndex) => (
                  <div key={topicIndex} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Play className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{topic.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{topic.duration} minutes</p>
                    </div>
                    {topic.type === 'quiz' && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          Quiz
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Curriculum;