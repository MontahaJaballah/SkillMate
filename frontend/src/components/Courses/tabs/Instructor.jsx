import React from 'react';
import { Star, Link, Instagram, Twitter, Facebook, Linkedin, Book, Users, MessageSquare } from 'lucide-react';

const Instructor = ({ course }) => {
    if (!course || !course.instructor) return null;

    const instructor = course.instructor;

    return (
        <div className="space-y-6">
            <h5 className="text-xl font-semibold mb-4 dark:text-white">Instructor</h5>
            <div className="flex items-center gap-4">
                <img
                    src={instructor.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'}
                    alt={instructor.name}
                    className="w-24 h-24 rounded-full"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{instructor.name}</h3>
                        <div className="flex items-center">
                            <span className="text-yellow-400">{instructor.rating.toFixed(1)}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-gray-500 dark:text-gray-400">({instructor.reviews})</span>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{instructor.bio}</p>
                    <div className="mt-4 flex gap-4">
                        <button className="flex items-center gap-2 px-3 py-1.5 border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                            <Link className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Follow</span>
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 border rounded-md hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700">
                            <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-sm text-gray-500 dark:text-gray-400">Message</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Book className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.courses}</p>
                        <p className="text-gray-500 dark:text-gray-400">Total Courses</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.students}</p>
                        <p className="text-gray-500 dark:text-gray-400">Students</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.reviews}</p>
                        <p className="text-gray-500 dark:text-gray-400">Reviews</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h5 className="text-xl font-semibold mb-4 dark:text-white">More Courses by {instructor.name}</h5>
                <div className="grid md:grid-cols-3 gap-6">
                    {course.instructorCourses?.map((course) => (
                        <div key={course._id} className="group">
                            <div className="relative overflow-hidden rounded-lg">
                                <img
                                    src={course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
                                    alt={course.title}
                                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex items-center justify-center">
                                    <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        View Course
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                                <p className="mt-1 text-gray-500 dark:text-gray-400">${course.price}</p>
                            </div>
                        </div>
                    ))}

                    {/* Default courses if none are provided */}
                    {(!course.instructorCourses || course.instructorCourses.length === 0) && (
                        <>
                            <div className="group">
                                <div className="relative overflow-hidden rounded-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                                        alt="Course 1"
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex items-center justify-center">
                                        <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            View Course
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Digital Marketing 101</h3>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400">$99</p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative overflow-hidden rounded-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                                        alt="Course 2"
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex items-center justify-center">
                                        <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            View Course
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SEO Mastery</h3>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400">$149</p>
                                </div>
                            </div>

                            <div className="group">
                                <div className="relative overflow-hidden rounded-lg">
                                    <img
                                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f"
                                        alt="Course 3"
                                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-300 flex items-center justify-center">
                                        <button className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            View Course
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Social Media Marketing</h3>
                                    <p className="mt-1 text-gray-500 dark:text-gray-400">$129</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Instructor;