import React from "react";
import { Star, MessageCircle, User } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';

export default function Reviews() {
    const { reviews, average_rating } = usePage().props;

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
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <Star 
                key={star} 
                className={`h-4 w-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
            />
        ));
    };

    if (!reviewsData || reviewsData.length === 0) {
        return (
            <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h2>
                        <p className="text-sm text-gray-600 mt-0.5">Community feedback and ratings</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <MessageCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 text-lg font-semibold">No reviews yet</p>
                    <p className="text-gray-500 text-sm mt-2">Be the first to share your feedback</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Reviews & Feedback</h2>
                        <p className="text-sm text-gray-600 mt-0.5">Community feedback and ratings</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-3 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-1">
                        {renderStars(Math.round(average_rating))}
                    </div>
                    <div className="border-l border-amber-300 pl-3">
                        <span className="text-2xl font-bold text-gray-900">
                            {average_rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">/ 5</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviewsData.map((review) => (
                    <div 
                        key={review.id} 
                        className="bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3 flex-1">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{review.fullname}</h4>
                                        <p className="text-sm text-gray-600 truncate">{review.category?.category_name || 'Resident'}</p>
                                        <p className="text-sm text-blue-600 truncate">{review.barangay}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-3">
                                    <div className="flex items-center gap-1 mb-1">
                                        {renderStars(review.rate)}
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {review.rate.toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">{review.review_content}</p>
                            </div>
                            
                            {review.additional_comments && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Additional Comments</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {review.additional_comments}
                                    </p>
                                </div>
                            )}

                            {review.replies && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs font-medium text-blue-900 mb-1">Official Response</p>
                                    <p className="text-sm text-blue-800 line-clamp-2">
                                        {review.replies.reply_content}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-2">
                                        {formatDate(review.replies.created_at)}
                                    </p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                                <button className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                                    <MessageCircle className="h-4 w-4" />
                                    {review.replies ? 'View Reply' : 'Reply'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {paginationLinks && <Pagination links={paginationLinks} />}
        </div>
    );
}