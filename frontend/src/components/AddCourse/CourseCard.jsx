import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Layout } from 'lucide-react';

const CourseCard = ({
    title,
    image,
    level,
    description,
    rating,
    duration,
    lectures,
    isFavorite,
    _id,
    ...rest
}) => {
    const [favorite, setFavorite] = useState(isFavorite);

    return (
        <Link to={`/client/course/${_id}`} className="group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <img src={image} alt={title} className="w-full h-48 object-cover" />
                <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm px-3 py-1 rounded-full ${level === 'All level' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' : 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                            }`}>
                            {level}
                        </span>
                        <button
                            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
                            onClick={(e) => {
                                e.preventDefault();
                                setFavorite(!favorite);
                            }}
                        >
                            <Heart className={`w-5 h-5 ${favorite ? 'fill-current text-red-500' : ''}`} />
                        </button>
                    </div>

                    <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 dark:text-gray-400 line-clamp-2">{description}</p>

                    <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{rating}/5.0</span>
                    </div>

                    <hr className="my-3 border-gray-200 dark:border-gray-700" />

                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                            <Clock className="w-4 h-4 text-red-500 mr-1" />
                            {duration}
                        </span>
                        <span className="flex items-center">
                            <Layout className="w-4 h-4 text-orange-500 mr-1" />
                            {lectures} lectures
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
