import React, { useState, useEffect } from "react";
import { Star, MessageCircle, User, Trash2 } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import Pagination from '@/Components/Pagination';
import Swal from 'sweetalert2';

export default function Reviews() {
    const { reviews, average_rating, flash } = usePage().props;
    const [deletingReviewId, setDeletingReviewId] = useState(null);

    const reviewsData = reviews.data || reviews;
    const paginationLinks = reviews.links || null;

    // Show flash messages
    useEffect(() => {
        if (flash?.success) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: flash.success,
                confirmButtonColor: '#10b981',
                timer: 2000,
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-3 rounded-xl'
                }
            });
        }
        if (flash?.error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: flash.error,
                confirmButtonColor: '#ef4444',
                customClass: {
                    popup: 'rounded-2xl',
                    confirmButton: 'px-6 py-3 rounded-xl'
                }
            });
        }
    }, [flash]);

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

    const handleDeleteReview = async (reviewId, reviewerName) => {
        const result = await Swal.fire({
            title: 'Delete Review?',
            html: `
                <p class="text-gray-700 mb-2">Are you sure you want to delete this review?</p>
                <p class="text-sm text-gray-600">Reviewer: <strong>${reviewerName}</strong></p>
                <p class="text-sm text-red-600 mt-3">This action cannot be undone!</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'rounded-2xl',
                confirmButton: 'px-6 py-3 rounded-xl',
                cancelButton: 'px-6 py-3 rounded-xl'
            }
        });

        if (result.isConfirmed) {
            setDeletingReviewId(reviewId);
            
            router.delete(`/admin/reviews/${reviewId}`, {
                preserveScroll: true,
                onFinish: () => {
                    setDeletingReviewId(null);
                }
            });
        }
    };

    if (!reviewsData || reviewsData.length === 0) {
        return (
            <div className="mt-6 md:mt-12 space-y-4 md:space-y-6 px-2 md:px-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Reviews & Feedback</h2>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5">Community feedback and ratings</p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200">
                    <div className="p-3 md:p-4 bg-gray-100 rounded-full mb-3 md:mb-4">
                        <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-900 text-base md:text-lg font-semibold">No reviews yet</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">Be the first to share your feedback</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6 md:mt-12 space-y-4 md:space-y-6 px-2 md:px-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Reviews & Feedback</h2>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5">Community feedback and ratings</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-gradient-to-br from-amber-50 to-orange-50 px-4 md:px-6 py-2 md:py-3 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-1">
                        {renderStars(Math.round(average_rating))}
                    </div>
                    <div className="border-l border-amber-300 pl-3">
                        <span className="text-xl md:text-2xl font-bold text-gray-900">
                            {average_rating.toFixed(1)}
                        </span>
                        <span className="text-xs md:text-sm text-gray-600 ml-1">/ 5</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {reviewsData.map((review) => (
                    <div 
                        key={review.id} 
                        className="bg-white rounded-xl border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
                    >
                        <div className="p-4 md:p-6">
                            <div className="flex items-start justify-between mb-3 md:mb-4">
                                <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">{review.fullname}</h4>
                                        <p className="text-xs md:text-sm text-gray-600 truncate">{review.category?.category_name || 'Resident'}</p>
                                        <p className="text-xs md:text-sm text-blue-600 truncate">{review.barangay}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end flex-shrink-0 ml-2 md:ml-3">
                                    <div className="flex items-center gap-0.5 md:gap-1 mb-1">
                                        {renderStars(review.rate)}
                                    </div>
                                    <span className="text-xs md:text-sm font-semibold text-gray-900">
                                        {review.rate.toFixed(1)}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3 md:mb-4">
                                <p className="text-gray-700 text-xs md:text-sm leading-relaxed line-clamp-3">{review.review_content}</p>
                            </div>
                            
                            {review.additional_comments && (
                                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Additional Comments</p>
                                    <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                                        {review.additional_comments}
                                    </p>
                                </div>
                            )}

                            {review.replies && (
                                <div className="mb-3 md:mb-4 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-xs font-medium text-blue-900 mb-1">Official Response</p>
                                    <p className="text-xs md:text-sm text-blue-800 line-clamp-2">
                                        {review.replies.reply_content}
                                    </p>
                                    <p className="text-xs text-blue-600 mt-2">
                                        {formatDate(review.replies.created_at)}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-3 md:pt-4 border-t border-gray-100">
                                <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button 
                                        onClick={() => handleDeleteReview(review.id, review.fullname)}
                                        disabled={deletingReviewId === review.id}
                                        className="flex items-center gap-1 md:gap-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="hidden sm:inline">{deletingReviewId === review.id ? 'Deleting...' : 'Delete'}</span>
                                    </button>
                                    {/* <button className="flex items-center gap-1 md:gap-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all">
                                        <MessageCircle className="h-3 w-3 md:h-4 md:w-4" />
                                        <span className="hidden sm:inline">{review.replies ? 'View Reply' : 'Reply'}</span>
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {paginationLinks && <Pagination links={paginationLinks} />}
        </div>
    );
}