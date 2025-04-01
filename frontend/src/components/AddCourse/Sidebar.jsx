import React from 'react';

const categories = [
    { name: 'All', count: 0 }, // This will be updated dynamically
    { name: 'IT and Programming', count: 0 },
    { name: 'Music and Instruments', count: 0 },
    { name: 'Chess Mastery', count: 0 },
    { name: 'Fitness and Training', count: 0 },
    { name: 'Rubik\'s Cube', count: 0 },
];

const Sidebar = ({
    selectedCategories = [],
    setSelectedCategories,
    selectedPriceLevel = 'all',
    setSelectedPriceLevel,
    selectedSkillLevel = 'all',
    setSelectedSkillLevel,
    courses = []
}) => {
    const handleCategoryChange = (category) => {
        if (category === 'All') {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(prev => {
                if (prev.includes(category)) {
                    return prev.filter(c => c !== category);
                } else {
                    return [...prev, category];
                }
            });
        }
    };

    // Update category counts based on courses
    const categoryCounts = categories.reduce((acc, cat) => {
        if (cat.name === 'All') return acc;

        const count = courses.filter(course =>
            course.skill && course.skill.categorie === cat.name
        ).length;

        acc[cat.name] = count;
        return acc;
    }, {});

    // Update the categories array with actual counts
    const updatedCategories = categories.map(cat => ({
        ...cat,
        count: cat.name === 'All'
            ? courses.length
            : categoryCounts[cat.name] || 0
    }));

    return (
        <div className="lg:w-1/4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 mb-6">
                <h4 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Category</h4>
                <div className="space-y-3">
                    {updatedCategories.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-gray-300 dark:border-gray-700 text-indigo-600 dark:text-indigo-400"
                                    checked={category.name === 'All'
                                        ? selectedCategories.length === 0
                                        : selectedCategories.includes(category.name)}
                                    onChange={() => handleCategoryChange(category.name)}
                                />
                                <span className="ml-2 text-gray-900 dark:text-white">{category.name}</span>
                            </label>
                            <span className="text-sm text-gray-500 dark:text-gray-400">({category.count})</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6 mb-6">
                <h4 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Price Level</h4>
                <div className="flex gap-2">
                    {['all', 'free', 'paid'].map((level) => (
                        <button
                            key={level}
                            className={`px-4 py-2 rounded-lg ${selectedPriceLevel === level
                                ? 'bg-indigo-600 text-white dark:bg-indigo-400'
                                : 'bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-700 dark:hover:bg-indigo-900 dark:text-white dark:hover:text-indigo-400'
                                }`}
                            onClick={() => setSelectedPriceLevel(level)}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-none p-6">
                <h4 className="text-xl font-semibold mb-4 text-indigo-600 dark:text-indigo-400">Skill Level</h4>
                <div className="flex flex-wrap gap-2">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((level) => (
                        <button
                            key={level}
                            className={`px-4 py-2 rounded-lg ${selectedSkillLevel === level
                                ? 'bg-indigo-600 text-white dark:bg-indigo-400'
                                : 'bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-gray-700 dark:hover:bg-indigo-900 dark:text-white dark:hover:text-indigo-400'
                                }`}
                            onClick={() => setSelectedSkillLevel(level)}
                        >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
