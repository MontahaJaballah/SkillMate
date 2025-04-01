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

        if (!course.ratings || !Array.isArray(course.ratings)) {
            return Object.entries(distribution).map(([rating]) => ({
                rating: parseInt(rating),
                count: 0,
                percentage: 0
            }));
        }

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

    const totalRatings = course.ratings && Array.isArray(course.ratings) ? course.ratings.length : 0;

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
                            Based on {totalRatings} reviews
                        </p>
                    </div>

                    <div className="space-y-2">
                        {calculateRatingDistribution().map(({ rating, percentage }) => (
                            <div key={rating} className="flex items-center gap-4">
                                <div className="w-12 text-sm text-gray-600 dark:text-gray-400">{rating} star</div>
                                <div className="flex-1">
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                                        <div
                                            className="h-2 bg-yellow-400 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="w-12 text-sm text-right text-gray-600 dark:text-gray-400">
                                    {percentage.toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Student Reviews</h3>
                    {(!course.ratings || !Array.isArray(course.ratings) || course.ratings.length === 0) ? (
                        <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review this course!</p>
                    ) : (
                        course.ratings.map((review, index) => (
                            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={review.user?.avatar || "https://ui-avatars.com/api/?name=Anonymous"}
                                            alt={review.user?.name || "Anonymous"}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {review.user?.name || "Anonymous"}
                                            </h4>
                                            <div className="flex items-center gap-1">
                                                {renderStars(review.score || 0)}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(review.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                        <ThumbsUp className="w-4 h-4" />
                                        <span>{review.helpful || 0}</span>
                                    </button>
                                    <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                                        <ThumbsDown className="w-4 h-4" />
                                        <span>{review.notHelpful || 0}</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reviews;