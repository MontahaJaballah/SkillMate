// src/views/Unauthorized.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white dark:bg-gray-800 shadow-md rounded-lg text-center">
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
                    Unauthorized Access
                </h1>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                    You do not have permission to access this page.
                </p>
                <Link
                    to="/login"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
                >
                    Return to Login
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;