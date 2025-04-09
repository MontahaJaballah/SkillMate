import React from 'react';
import { Star, Link, Instagram, Twitter, Facebook, Linkedin, Book, Users, MessageSquare } from 'lucide-react';

const Instructor = ({ course }) => {
    if (!course || !course.teacher_id) return null;

    const instructor = course.teacher_id;
    console.log('Instructor data:', instructor);

    return (
        <div className="space-y-6">
            <h5 className="text-xl font-semibold mb-4 dark:text-white">Instructor</h5>
            <div className="flex items-center gap-4">
                <img
                    src={instructor.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'}
                    alt={instructor.name}
                    className="w-24 h-24 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{instructor.name}</h3>
                        <span className="text-sm text-blue-600 dark:text-blue-400 capitalize">{instructor.role}</span>
                        <div className="flex items-center">
                            <span className="text-yellow-400">{instructor.rating?.toFixed(1) || '0.0'}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-gray-500 dark:text-gray-400">({instructor.reviews || 0})</span>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{instructor.bio || 'No bio available'}</p>
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
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.courses?.length || 0}</p>
                        <p className="text-gray-500 dark:text-gray-400">Total Courses</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.totalStudents || 0}</p>
                        <p className="text-gray-500 dark:text-gray-400">Total Students</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                        <Star className="w-6 h-6 text-yellow-400 fill-current" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{instructor.reviews || 0}</p>
                        <p className="text-gray-500 dark:text-gray-400">Reviews</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <h5 className="text-xl font-semibold mb-4 dark:text-white">More Courses by {instructor.name}</h5>
                <div className="grid md:grid-cols-3 gap-6">
                    {instructor.courses && instructor.courses.length > 0 ? (
                        instructor.courses.map((course) => (
                            <div key={course._id} className="group">
                                <div className="relative overflow-hidden rounded-lg">
                                    <img
                                        src={course.thumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f'}
                                        alt={course.title}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                                    />
                                </div>
                                <h4 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">{course.title}</h4>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">No other courses yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Instructor;