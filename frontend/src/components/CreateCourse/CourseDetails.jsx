import React from 'react';

const CourseDetails = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-2xl font-bold">Course details</h4>
      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Course title
          </label>
          <input
            type="text"
            name="courseTitle"
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
            placeholder="Enter course title"
            value={formData.courseTitle}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Short description
          </label>
          <textarea
            name="shortDescription"
            rows={2}
            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
            placeholder="Enter keywords"
            value={formData.shortDescription}
            onChange={handleInputChange}
          />
        </div>

        {/* Category and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course category
            </label>
            <select
              name="category"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              value={formData.category}
              onChange={handleInputChange}
            >
              <option value="">Select category</option>
              <option value="engineer">Engineer</option>
              <option value="medical">Medical</option>
              <option value="it">Information technology</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course level
            </label>
            <select
              name="level"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              value={formData.level}
              onChange={handleInputChange}
            >
              <option value="">Select course level</option>
              <option value="all">All level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Course Time and Total Lecture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course time
            </label>
            <input
              type="text"
              name="courseTime"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              placeholder="Enter course time"
              value={formData.courseTime}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total lecture
            </label>
            <input
              type="text"
              name="totalLecture"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              placeholder="Enter total lecture"
              value={formData.totalLecture}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Price and Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course price
            </label>
            <input
              type="text"
              name="price"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              placeholder="Enter course price"
              value={formData.price}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Discount price
            </label>
            <input
              type="text"
              name="discount"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
              placeholder="Enter discount"
              value={formData.discount}
              onChange={handleInputChange}
            />
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="enableDiscount"
                  className="form-checkbox h-4 w-4 text-blue-600"
                  checked={formData.enableDiscount}
                  onChange={handleInputChange}
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Enable this Discount
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;