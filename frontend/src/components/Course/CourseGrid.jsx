import React from 'react'

const CourseGrid = ({ courses }) => {
  return (
    <div className="lg:col-span-3">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <div key={course._id} className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-colors duration-200">
            <div className="aspect-h-9 aspect-w-16 bg-gray-200 dark:bg-gray-700 group-hover:opacity-75">
              <img
                src={course.thumbnail || 'https://via.placeholder.com/640x360'}
                alt={course.title}
                className="object-cover object-center"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                <a href="#">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {course.title}
                </a>
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white">${course.price}</p>
                <div className="flex items-center">
                  <span className="text-gray-500 dark:text-gray-400">{course.teacher_id?.username || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseGrid
