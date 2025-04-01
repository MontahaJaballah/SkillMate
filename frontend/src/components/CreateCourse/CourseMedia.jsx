import React from 'react';

const CourseMedia = () => {
  return (
    <div className="space-y-6">
      <h4 className="text-2xl font-bold">Course media</h4>
      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
        <div className="mx-auto w-24 h-24 mb-4">
          <img
            src="https://via.placeholder.com/96"
            alt="Upload placeholder"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/jpeg,image/png,image/jpg"
          />
          <p className="text-gray-600 dark:text-gray-400">
            Upload course image here, or{' '}
            <span className="text-blue-500 dark:text-blue-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-300 transition-colors">Browse</span>
          </p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Only JPG, JPEG and PNG. Our suggested dimensions are 600px * 450px.
        </p>
      </div>

      <div className="space-y-4">
        <h5 className="text-xl font-semibold">Upload video</h5>
        <input
          type="text"
          placeholder="Enter video URL"
          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500"
        />

        <div className="relative">
          <hr className="border-gray-200 dark:border-gray-700" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400">
            Or
          </span>
        </div>

        <div className="space-y-3">
          {['.mp4', '.WebM', '.OGG'].map((format) => (
            <div key={format} className="flex">
              <div className="relative flex-1">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept={format.toLowerCase()}
                />
                <div className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Choose File
                </div>
              </div>
              <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-md text-gray-500 dark:text-gray-400">
                {format}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseMedia;