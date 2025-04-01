import React, { useState } from 'react';
import Overview from './tabs/Overview';
import Curriculum from './tabs/Curriculum';
import Instructor from './tabs/Instructor';
import Reviews from './tabs/Reviews';
import FAQs from './tabs/FAQs';

const CourseTabs = ({ course }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'instructor', label: 'Instructor' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`pb-4 px-2 font-medium transition-colors
              ${activeTab === tab.id
                ? 'text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400'
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && <Overview course={course} />}
        {activeTab === 'curriculum' && <Curriculum course={course} />}
        {activeTab === 'instructor' && <Instructor course={course} />}
        {activeTab === 'reviews' && <Reviews course={course} />}
        {activeTab === 'faqs' && <FAQs course={course} />}
      </div>
    </div>
  );
};

export default CourseTabs;