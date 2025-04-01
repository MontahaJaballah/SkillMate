import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopCourses from '../../../components/Courses/TopCourses';
import CourseHeader from '../../../components/Courses/CourseHeader';
import CourseTabs from '../../../components/Courses/CourseTabs';
import CourseInfo from '../../../components/Courses/CourseInfo';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch course');
        }

        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Course Header Section */}
      <main className="container mx-auto px-4">
        <CourseHeader course={course} />

        {/* Main Content */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Course Content */}
              <div className="lg:col-span-2">
                <CourseTabs course={course} />
              </div>

              {/* Right Column - Course Info */}
              <div className="lg:col-span-1">
                <CourseInfo course={course} />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <TopCourses title="Related Courses" />
        </div>
      </main>
    </div>
  );
};

export default CourseDetail;
