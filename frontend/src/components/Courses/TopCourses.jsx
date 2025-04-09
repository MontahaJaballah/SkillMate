import React, { useState, useEffect } from 'react';
import { Star, Users, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const TopCourses = ({ currentCourse }) => {
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/browsecourses');
        const data = await response.json();

        // Filter courses to exclude current course and get related ones
        const filteredCourses = data.filter(course => {
          if (course._id === currentCourse._id) return false;

          // Check if course has the same category or same teacher
          const sameCategory = course.skill?.categorie === currentCourse.skill?.categorie;
          const sameTeacher = course.teacher_id?.name === currentCourse.teacher_id?.name;

          return sameCategory || sameTeacher;
        });

        // Limit to 3 courses
        setRelatedCourses(filteredCourses.slice(0, 3));
      } catch (error) {
        console.error('Error fetching related courses:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentCourse) {
      fetchRelatedCourses();
    }
  }, [currentCourse]);

  if (loading) {
    return (
      <div className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Related Courses</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (relatedCourses.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Related Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedCourses.map(course => (
            <Link to={`/client/course/${course._id}`} key={course._id} className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-violet-500 dark:text-violet-400 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{course.students?.length || 0} students</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{course.rating || 0}</span>
                      </div>
                    </div>
                    <img
                      src={course.teacher_id?.avatar}
                      alt={course.teacher_id?.name}
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">{course.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-violet-600 dark:text-violet-400 text-sm">{course.skill?.categorie}</span>
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-violet-600 dark:text-violet-400">${course.price || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCourses;