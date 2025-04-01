import React from 'react';

const Header = () => {
    return (
        <div className="relative bg-primary-600 dark:bg-primary-700 text-white py-16">
            <div className="max-w-5xl mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Submit a new Course</h1>
                <p className="text-gray-200 dark:text-gray-400">
                    Read our{' '}
                    <a href="#" className="underline hover:text-white">
                        "Before you create a course"
                    </a>{' '}
                    article before submitting!
                </p>
            </div>
        </div>
    );
};

export default Header;