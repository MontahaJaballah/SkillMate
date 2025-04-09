import React, { useState, useEffect } from 'react';
import { Search, Clock, Layout, Heart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import CourseCard from '../../../components/AddCourse/CourseCard';
import Sidebar from '../../../components/AddCourse/Sidebar';

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPriceLevel, setSelectedPriceLevel] = useState('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('most-viewed');
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses/browsecourses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on all criteria
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase()?.includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.includes(course.skill?.categorie || '');
    const matchesPrice = selectedPriceLevel === 'all' ||
      (selectedPriceLevel === 'free' ? course.price === 0 : course.price > 0);
    const matchesSkill = selectedSkillLevel === 'all' ||
      course.skill?.proficiency?.toLowerCase() === selectedSkillLevel.toLowerCase();

    return matchesSearch && matchesCategory && matchesPrice && matchesSkill;
  });

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'most-viewed':
        return b.rating - a.rating;
      case 'recently-added':
        return new Date(b.createdate) - new Date(a.createdate);
      case 'most-popular':
        return b.lectures - a.lectures;
      default:
        return 0;
    }
  });

  // Paginate courses
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = sortedCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(sortedCourses.length / coursesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-3/4">
                <div className="flex flex-wrap gap-4 mb-8">
                  {user?.role === 'teacher' && (
                    <button
                      onClick={() => navigate('/client/create-course')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      <Plus size={20} />
                      Add Course
                    </button>
                  )}
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="search"
                        placeholder="Find your course"
                        className="w-full p-3 pr-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute right-3 top-3 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  <div className="w-48">
                    <select
                      className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-1 focus:ring-indigo-600 dark:focus:ring-indigo-400"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="most-viewed">Most Viewed</option>
                      <option value="recently-added">Recently added</option>
                      <option value="most-popular">Most popular</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentCourses.map((course) => (
                    <CourseCard
                      key={course._id}
                      title={course.title}
                      image={course.thumbnail || '/default-course-image.jpg'}
                      level={course.skill?.proficiency || 'All level'}
                      description={course.description}
                      rating={course.averageRating || 0}
                      duration={`${course.duration} mins`}
                      lectures={course.lectureCount || 0}
                      isFavorite={course.isFavorite || false}
                      _id={course._id}
                      {...course}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => handlePageChange(number)}
                          className={`px-3 py-2 rounded-md ${currentPage === number
                            ? 'bg-indigo-600 text-white dark:bg-indigo-400'
                            : 'bg-gray-100 text-indigo-600 hover:bg-indigo-50 dark:bg-gray-700 dark:text-indigo-400 dark:hover:bg-indigo-900'
                            }`}
                        >
                          {number}
                        </button>
                      ))}
                    </nav>
                  </div>
                )}
              </div>

              <Sidebar
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedPriceLevel={selectedPriceLevel}
                setSelectedPriceLevel={setSelectedPriceLevel}
                selectedSkillLevel={selectedSkillLevel}
                setSelectedSkillLevel={setSelectedSkillLevel}
                courses={courses}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;