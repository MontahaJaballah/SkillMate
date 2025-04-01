import React from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';

const Reviews = ({ course }) => {
    if (!course) return null;

    const calculateRatingDistribution = () => {
        const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
        };

        course.ratings.forEach(rating => {
            const roundedRating = Math.floor(rating.score);
            if (roundedRating >= 1 && roundedRating <= 5) {
                distribution[roundedRating] += 1;
            }
        });

        const totalRatings = course.ratings.length;
        return Object.entries(distribution).map(([rating, count]) => ({
            rating: parseInt(rating),
            count,
            percentage: totalRatings > 0 ? (count / totalRatings) * 100 : 0
        }));
    };

    const renderStars = (score) => {
        const stars = [];
        const fullStars = Math.floor(score);
        const hasHalfStar = score - fullStars > 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />);
        }

        if (hasHalfStar) {
            stars.push(
                <Star key={fullStars} className="w-4 h-4 text-yellow-400 fill-current" strokeWidth={0.5} />
            );
        }

        return stars;
    };

    return (
        <div className="container mx-auto px-4">
            <div className="space-y-8">
                {/* Rating Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                        <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                            {course.averageRating ? course.averageRating.toFixed(1) : '0.0'}
                        </h2>
                        <div className="flex justify-center mb-2">
                            {renderStars(course.averageRating || 0)}
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">
                            Based on {course.ratings.length} reviews
                        </p>
                    </div>

                    <div className="space-y-2">
                        {calculateRatingDistribution().map(({ rating, percentage }) => (
                            <div key={rating} className="flex items-center gap-4">
                                <div className="w-full max-w-[200px]">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                        <div
                                            className="h-2 bg-yellow-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex">
                                    {renderStars(rating)}
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">
                                    {percentage.toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    {course.ratings.map((review, index) => (
                        <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                            <div className="flex items-start gap-4">
                                <img
                                    src={review.user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e'}
                                    alt={review.user?.name || 'Anonymous'}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {review.user?.name || 'Anonymous User'}
                                        </h3>
                                        <div className="flex">
                                            {renderStars(review.score || 0)}
                                        </div>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                            {(review.score || 0).toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-gray-600 dark:text-gray-300">{review.comment}</p>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                        {review.helpful && (
                                            <>
                                                <ThumbsUp className="w-4 h-4 text-green-500" />
                                                <span>Helpful</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* No reviews message */}
                    {course.ratings.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">No reviews yet</p>
                        </div>
                    )}
                </div>

                {/* Review Form */}
                <div>
                    <h5 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Leave a Review</h5>
                    <form className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                        <select className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
                            <option>★★★★★ (5/5)</option>
                            <option>★★★★☆ (4/5)</option>
                            <option>★★★☆☆ (3/5)</option>
                            <option>★★☆☆☆ (2/5)</option>
                            <option>★☆☆☆☆ (1/5)</option>
                        </select>
                        <textarea
                            placeholder="Your review"
                            rows={3}
                            className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
                        ></textarea>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
                        >
                            Post Review
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reviews;