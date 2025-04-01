import React, { useState } from 'react';

const FAQs = ({ course }) => {
  const [openIndex, setOpenIndex] = useState(null);

  if (!course) return null;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      <h5 className="text-xl font-semibold mb-4 dark:text-white">Frequently Asked Questions</h5>
      <div className="space-y-4">
        {course.faqs?.map((faq, index) => (
          <div key={faq._id} className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => toggleFAQ(index)}
            >
              <span className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 font-semibold mr-3">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {openIndex === index ? '▲' : '▼'}
              </span>
            </button>
            {openIndex === index && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700">
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}

        {/* Default FAQs if none are provided */}
        {(!course.faqs || course.faqs.length === 0) && (
          <>
            {course.defaultFaqs?.map((faq, index) => (
              <div key={index} className="border dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 font-semibold mr-3">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {openIndex === index ? '▲' : '▼'}
                  </span>
                </button>
                {openIndex === index && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default FAQs;
