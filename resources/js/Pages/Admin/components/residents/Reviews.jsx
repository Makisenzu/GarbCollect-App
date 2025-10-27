import React from "react";
import { Star, MessageCircle, User } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function Reviews() {
    const { reviews, average_rating } = usePage().props;

    // Extract pagination data from reviews if it's paginated
    const reviewsData = reviews.data || reviews;
    const paginationLinks = reviews.links || null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffTime / (1000 * 60));

        if (diffMinutes < 60) {
            return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <Star 
                key={star} 
                className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
            />
        ));
    };

    if (!reviewsData || reviewsData.length === 0) {
        return (
            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
                    <MessageCircle className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 text-lg">No reviews yet</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to leave a review</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Reviews</h2>
                </div>
                <div className="flex items-center">
                    <div className="flex items-center mr-2">
                        {renderStars(Math.round(average_rating))}
                    </div>
                    <span className="text-lg font-semibold text-gray-800">
                        {average_rating.toFixed(1)}/5
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviewsData.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <User className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800">{review.fullname}</h4>
                                    <p className="text-sm text-gray-600">{review.category?.category_name || 'Resident'}</p>
                                    <p className="text-sm text-blue-600">{review.barangay}</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center mb-1">
                                    {renderStars(review.rate)}
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                    {review.rate.toFixed(1)}/5
                                </span>
                            </div>
                        </div>

                        <p className="text-gray-700 mb-4">{review.review_content}</p>
                        
                        {review.additional_comments && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold">Additional Comments:</span> {review.additional_comments}
                                </p>
                            </div>
                        )}

                        {review.replies && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-800">
                                    <span className="font-semibold">Response:</span> {review.replies.reply_content}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {formatDate(review.replies.created_at)}
                                </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                            <button className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                {review.replies ? 'View Reply' : 'Reply'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {paginationLinks && <Pagination links={paginationLinks} />}
        </div>
    );
}