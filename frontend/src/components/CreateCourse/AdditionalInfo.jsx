import React from 'react';
import { Edit2, X, PlusCircle } from 'lucide-react';

const AdditionalInfo = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-6">
      <h4 className="text-2xl font-bold">Additional information</h4>
      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-xl font-semibold">Upload FAQs</h5>
          <button
            className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 dark:bg-blue-900 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            <PlusCircle size={18} />
            Add Question
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h6 className="font-semibold">How Digital Marketing Work?</h6>
              <div className="flex gap-2">
                <button
                  className="p-2 bg-green-50 dark:bg-green-900 text-green-600 rounded-full hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="p-2 bg-red-50 dark:bg-red-900 text-red-600 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Comfort reached gay perhaps chamber his six detract besides add...
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h5 className="text-xl font-semibold mb-4">Tags</h5>
        <input
          type="text"
          name="tags"
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          placeholder="Enter tags"
          value={formData.tags}
          onChange={handleInputChange}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Maximum of 14 keywords. Keywords should all be in lowercase and separated by commas.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h5 className="text-xl font-semibold mb-4">Message to a reviewer</h5>
        <textarea
          name="reviewerMessage"
          rows={4}
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
          placeholder="Write a message"
          value={formData.reviewerMessage}
          onChange={handleInputChange}
        />
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            name="agreeToTerms"
            className="mt-1"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Any images, sounds, or other assets that are not my own work, have been appropriately licensed for use in the file preview or main course. Other than these items, this work is entirely my own and I have full rights to sell it here.
          </span>
        </label>
      </div>
    </div>
  );
};

export default AdditionalInfo;