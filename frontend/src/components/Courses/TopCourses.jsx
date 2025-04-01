import React from 'react';
import { Star, Users, ShoppingCart } from 'lucide-react';

const TopCourses = () => {
  const courses = [
    {
      id: 1,
      title: "The Complete Digital Marketing Course - 12 Courses in 1",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3",
      instructor: {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      rating: 4.5,
      students: "9.1k",
      price: 140,
      originalPrice: 350,
      discount: "60% off",
      category: "Personal Development"
    },
    {
      id: 2,
      title: "Fundamentals of Business Analysis",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3",
      instructor: {
        name: "Jane Smith",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      rating: 4.8,
      students: "6.2k",
      price: 120,
      originalPrice: 300,
      discount: "60% off",
      category: "Business Development"
    },
    {
      id: 3,
      title: "Google Ads Training: Become a PPC Expert",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3",
      instructor: {
        name: "Mike Johnson",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
      },
      rating: 4.7,
      students: "8.3k",
      price: 226,
      originalPrice: 450,
      discount: "50% off",
      category: "SEO"
    }
  ];

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Top Listed Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-violet-500 dark:text-violet-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{course.students}</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{course.rating}</span>
                    </div>
                  </div>
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="w-8 h-8 rounded-full"
                  />
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{course.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-violet-600 dark:text-violet-400 text-sm">{course.category}</span>
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-violet-600 dark:text-violet-400">${course.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 line-through ml-2">${course.originalPrice}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 dark:hover:bg-violet-500 transition-colors">
                    <ShoppingCart className="h-4 w-4 inline-block mr-2" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCourses;