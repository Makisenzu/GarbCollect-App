import { useReview } from './useReview';
import { Head, Link } from '@inertiajs/react';
import StarRating from './components/StarRating';
import StepContent from './components/StepContent';
import ReviewCard from './components/ReviewCard';
import ReviewStats from './components/ReviewStats';
import ReviewFilters from './components/ReviewFilters';
import Pagination from '@/Components/Pagination';
import { Plus, ChevronRight, Star, ArrowLeft, Sparkles, Recycle, Users, MessageCircle, Menu, X, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

const ReviewDashboard = ({ 
    reviews: initialReviews, 
    reviews_count, 
    total_reviews_count,
    average_rating, 
    rating_distribution 
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    
    const {
        reviews,
        allReviews,
        categories,
        barangays,
        newReview,
        currentStep,
        activeFilter,
        sortBy,
        availablePuroks,
        steps,
        loading,
        submitting,
        error,
        submitResult,
        setNewReview,
        setCurrentStep,
        setActiveFilter,
        setSortBy,
        handleSubmitReview,
        nextStep,
        prevStep,
        handleHelpful,
        isStepValid,

        pagination,
        goToPage,
        nextPage,
        prevPage,
        setItemsPerPage,
        clearSubmitResult
    } = useReview(initialReviews);

    // Use backend-calculated statistics from ALL reviews
    const averageRating = average_rating || '0.0';
    
    // Transform rating distribution for the component
    const ratingDistribution = rating_distribution ? [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: rating_distribution[stars] || 0,
        percentage: rating_distribution[stars] ? (rating_distribution[stars] / total_reviews_count) * 100 : 0
    })) : [5, 4, 3, 2, 1].map(stars => ({
        stars,
        count: 0,
        percentage: 0
    }));

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1280);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (loading) {
        return (
            <div className="relative text-white py-20 md:py-32 px-4 min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background matching Hero */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-emerald-800/80 to-blue-900/90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>
                
                {/* Animated elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-60 h-60 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="text-center relative z-10">
                    <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-b-2 border-green-300 mx-auto mb-4 md:mb-6"></div>
                    <p className="text-white/80 text-lg md:text-xl">Loading community data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="relative text-white py-20 md:py-32 px-4 min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background matching Hero */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-emerald-800/80 to-blue-900/90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>

                <div className="text-center max-w-md w-full px-4 relative z-10">
                    <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-6 md:p-8 mb-6">
                        <p className="text-lg md:text-xl font-semibold text-white mb-2">Error loading community data</p>
                        <p className="text-red-200 text-sm md:text-base">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 md:px-8 md:py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/25 text-base md:text-lg"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
      <>
            <Head title={'Community Reviews'} />
              <div className="relative text-white min-h-screen py-6 md:py-12 px-3 sm:px-4 md:px-6 overflow-hidden">
            {/* Background matching Hero */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-emerald-800/80 to-blue-900/90"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30"></div>
            
            {/* Animated background elements matching Hero */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating particles */}
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/30 rounded-full animate-float1"></div>
                <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-green-300/40 rounded-full animate-float2"></div>
                <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-blue-300/30 rounded-full animate-float3"></div>
                <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-yellow-300/50 rounded-full animate-float4"></div>
                
                {/* Animated background shapes */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-green-400/10 rounded-full blur-3xl animate-pulseSlow"></div>
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulseSlow delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-emerald-300/5 rounded-full blur-2xl animate-pulseSlow delay-500"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Mobile Menu Button */}
                <div className="xl:hidden flex justify-between items-center mb-6">
                <Link
          href="/"
          className="absolute top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
          title="Back to Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Header with Back Button */}
                <div className="mb-8 md:mb-12 lg:mb-16">
                    <div className="hidden xl:block">
                    <Link
          href="/"
          className="absolute top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
          title="Back to Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
                    </div>
                    
                    <div className="text-center relative">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-4 md:mb-6">
                            Community
                            <span className="block text-green-300 mt-1 md:mt-2">Reviews</span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl md:max-w-3xl mx-auto leading-relaxed px-2">
                            Share your experience and help us improve waste management in{' '}
                            <span className="text-green-300 font-semibold">San Francisco, Agusan del Sur</span>
                        </p>
                    </div>
                </div>

                {/* Submission Result Message */}
                {submitResult && (
                    <div className={`mb-6 p-4 rounded-2xl border ${
                        submitResult.success 
                            ? 'bg-green-500/20 border-green-400/30 text-green-300' 
                            : 'bg-red-500/20 border-red-400/30 text-red-300'
                    } backdrop-blur-sm`}>
                        <div className="flex items-center justify-between">
                            <p className="font-medium">{submitResult.message}</p>
                            <button
                                onClick={clearSubmitResult}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col xl:flex-row gap-6 md:gap-8 lg:gap-12">
                    {/* Mobile Sidebar Overlay */}
                    {isMobileMenuOpen && (
                        <div className="xl:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
                            <div className="absolute top-0 right-0 h-full w-80 max-w-full bg-slate-900/95 backdrop-blur-xl border-l border-white/20 overflow-y-auto">
                                <div className="p-6 space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-white">Filters & Stats</h3>
                                        <button
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <ReviewStats 
                                        averageRating={averageRating}
                                        ratingDistribution={ratingDistribution}
                                        reviewsCount={allReviews.length}
                                        totalReviewsCount={total_reviews_count}
                                    />
                                    <ReviewFilters 
                                        activeFilter={activeFilter}
                                        sortBy={sortBy}
                                        onFilterChange={(filter) => {
                                            setActiveFilter(filter);
                                            setCurrentPage(1);
                                        }}
                                        onSortChange={(sort) => {
                                            setSortBy(sort);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Sidebar - Stats and Filters */}
                    <div className="hidden xl:block xl:w-1/4 space-y-6 lg:space-y-8">
                        <ReviewStats 
                            averageRating={averageRating}
                            ratingDistribution={ratingDistribution}
                            reviewsCount={allReviews.length}
                            totalReviewsCount={total_reviews_count}
                        />
                        
                        <ReviewFilters 
                            activeFilter={activeFilter}
                            sortBy={sortBy}
                            onFilterChange={(filter) => {
                                setActiveFilter(filter);
                                setCurrentPage(1);
                            }}
                            onSortChange={(sort) => {
                                setSortBy(sort);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Mobile Stats Summary */}
                    <div className="xl:hidden mb-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4">
                            <div className="flex items-center justify-between">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{averageRating}</div>
                                    <div className="text-sm text-white/60">Avg Rating ({total_reviews_count} total)</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-300">{allReviews.length}</div>
                                    <div className="text-sm text-white/60">Approved Reviews</div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-colors text-sm font-medium"
                                >
                                    Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="xl:w-3/4">
                        {/* Premium Review Form Card */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/20 p-4 sm:p-6 md:p-8 lg:p-10 mb-8 md:mb-10 shadow-2xl shadow-black/30">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 lg:mb-10 gap-4">
                                <div className="flex items-center space-x-3 md:space-x-4">
                                    <div className="p-2 md:p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl md:rounded-2xl shadow-lg shadow-green-500/25">
                                        <MessageCircle className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Share Your Experience</h3>
                                        <p className="text-white/70 text-sm md:text-base">Help us serve you better</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20">
                                    <Recycle className="w-4 h-4 md:w-5 md:h-5 text-green-300" />
                                    <span className="text-xs md:text-sm text-white/80">Step</span>
                                    <span className="text-white font-bold text-base md:text-lg">{currentStep}</span>
                                    <span className="text-white/60">of</span>
                                    <span className="text-white font-bold text-base md:text-lg">{steps.length}</span>
                                </div>
                            </div>

                            {/* Fixed Progress Steps */}
                            <div className="mb-6 md:mb-8 lg:mb-10">
                                <div className="flex items-center justify-between relative px-2 sm:px-4">
                                    {/* Progress line container */}
                                    <div className="absolute top-4 sm:top-5 md:top-6 lg:top-7 left-0 right-0 flex items-center px-8 sm:px-10 md:px-12 lg:px-14 -z-10">
                                        {/* Background line (full width) */}
                                        <div className="absolute top-1/2 left-8 sm:left-10 md:left-12 lg:left-14 right-8 sm:right-10 md:right-12 lg:right-14 h-1.5 bg-white/20 rounded-full"></div>
                                        
                                        {/* Progress line (dynamic width based on current step) */}
                                        <div 
                                            className="absolute top-1/2 left-8 sm:left-10 md:left-12 lg:left-14 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-in-out"
                                            style={{ 
                                                width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 2rem)`,
                                                maxWidth: 'calc(100% - 4rem)'
                                            }}
                                        />
                                    </div>
                                    
                                    {steps.map((step) => (
                                        <div key={`step-${step.number}`} className="flex flex-col items-center flex-1 z-10">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 font-bold transition-all duration-500 transform ${
                                                currentStep >= step.number
                                                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-transparent text-white scale-110 shadow-lg shadow-green-500/25'
                                                    : 'border-white/30 text-white/50 bg-white/10'
                                            } ${currentStep === step.number ? 'ring-2 sm:ring-4 ring-green-500/30' : ''}`}>
                                                {currentStep > step.number ? (
                                                    <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 bg-white rounded-full flex items-center justify-center">
                                                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"></div>
                                                    </div>
                                                ) : (
                                                    step.number
                                                )}
                                            </div>
                                            <div className="mt-2 sm:mt-3 md:mt-4 text-center">
                                                <div className={`text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 ${
                                                    currentStep >= step.number ? 'text-white' : 'text-white/60'
                                                }`}>
                                                    {step.title}
                                                </div>
                                                <div className="text-xs text-white/50 mt-1 hidden sm:block">
                                                    {step.description}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Step Content */}
                            <form onSubmit={handleSubmitReview}>
                                <div className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-[500px] py-4 md:py-6">
                                    <StepContent 
                                        currentStep={currentStep}
                                        newReview={newReview}
                                        categories={categories}
                                        barangays={barangays}
                                        availablePuroks={availablePuroks}
                                        onUpdateReview={setNewReview}
                                    />
                                </div>

                                {/* Responsive Navigation Buttons */}
                                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-0 pt-6 md:pt-8 mt-6 md:mt-8 border-t border-white/20">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                        className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 border border-white/30 rounded-xl md:rounded-2xl font-semibold text-white/80 hover:text-white hover:border-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-3 hover:bg-white/10 order-2 sm:order-1"
                                    >
                                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                                        <span className="text-sm md:text-base lg:text-lg">Previous</span>
                                    </button>

                                    {currentStep < steps.length ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!isStepValid()}
                                            className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl md:rounded-2xl font-semibold hover:from-green-400 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg shadow-green-500/25 order-1 sm:order-2"
                                        >
                                            <span className="text-sm md:text-base lg:text-lg">Continue</span>
                                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={!isStepValid() || submitting}
                                            className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl md:rounded-2xl font-semibold hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 sm:space-x-3 shadow-lg shadow-green-500/25 order-1 sm:order-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
                                                    <span className="text-sm md:text-base lg:text-lg">Submitting...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                                                    <span className="text-sm md:text-base lg:text-lg">Submit Review</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Reviews List Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3 md:space-x-4">
                                <div className="p-2 md:p-3 bg-white/10 backdrop-blur-sm rounded-xl md:rounded-2xl border border-white/20">
                                    <Users className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-green-300" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                                        Community Feedback
                                    </h2>
                                    <p className="text-white/60 text-sm md:text-base lg:text-lg">
                                        Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalReviews} approved reviews
                                        {total_reviews_count > allReviews.length && (
                                            <span className="block text-white/40 text-xs mt-1">
                                                (Based on {total_reviews_count} total submissions)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Reviews List */}
                        <div className="space-y-4 md:space-y-6 mb-6">
                            {reviews.length > 0 ? (
                                reviews.map((review) => (
                                    <ReviewCard 
                                        key={`review-${review.id}-${review.created_at}`}
                                        review={review} 
                                        onHelpful={handleHelpful} 
                                    />
                                ))
                            ) : (
                                <div className="text-center py-12 md:py-16 lg:py-20 xl:py-24 bg-white/10 backdrop-blur-sm rounded-2xl md:rounded-3xl border border-white/20">
                                    <div className="text-white/30 mb-4 md:mb-6">
                                        <Star className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto" />
                                    </div>
                                    <h3 className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold text-white mb-3 md:mb-4">
                                        No reviews yet
                                    </h3>
                                    <p className="text-white/60 text-base md:text-lg lg:text-xl max-w-md mx-auto px-4">
                                        {activeFilter !== 'all'
                                            ? 'No reviews match your current filters. Try adjusting your criteria.' 
                                            : 'Be the first to share your experience with the community!'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Custom Pagination Component */}
                        {pagination.totalPages > 1 && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 md:p-6">
                                <div className="flex items-center justify-between">
                                    {/* Mobile pagination */}
                                    <div className="flex sm:hidden items-center justify-between w-full">
                                        <button
                                            onClick={prevPage}
                                            disabled={pagination.currentPage === 1}
                                            className={`px-4 py-2 rounded-xl flex items-center space-x-2 ${
                                                pagination.currentPage === 1
                                                    ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/40' 
                                                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer'
                                            } transition-all duration-300`}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span>Prev</span>
                                        </button>

                                        <span className="text-white/80 text-sm">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </span>

                                        <button
                                            onClick={nextPage}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className={`px-4 py-2 rounded-xl flex items-center space-x-2 ${
                                                pagination.currentPage === pagination.totalPages
                                                    ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/40' 
                                                    : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer'
                                            } transition-all duration-300`}
                                        >
                                            <span>Next</span>
                                            <ChevronRightIcon className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Desktop pagination */}
                                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-white/80 text-sm">
                                                Showing <span className="font-semibold">{pagination.startIndex}-{pagination.endIndex}</span> of{' '}
                                                <span className="font-semibold">{pagination.totalReviews}</span> approved reviews
                                            </p>
                                        </div>
                                        
                                        <nav className="flex space-x-2">
                                            <button
                                                onClick={prevPage}
                                                disabled={pagination.currentPage === 1}
                                                className={`px-4 py-2 rounded-xl flex items-center space-x-2 ${
                                                    pagination.currentPage === 1
                                                        ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/40' 
                                                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer'
                                                } transition-all duration-300`}
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                <span>Previous</span>
                                            </button>

                                            {/* Page numbers */}
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={`page-${page}`}
                                                    onClick={() => goToPage(page)}
                                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                                        pagination.currentPage === page
                                                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                                                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}

                                            <button
                                                onClick={nextPage}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className={`px-4 py-2 rounded-xl flex items-center space-x-2 ${
                                                    pagination.currentPage === pagination.totalPages
                                                        ? 'opacity-50 cursor-not-allowed bg-white/5 text-white/40' 
                                                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 cursor-pointer'
                                                } transition-all duration-300`}
                                            >
                                                <span>Next</span>
                                                <ChevronRightIcon className="w-4 h-4" />
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes float1 {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
                }
                @keyframes float2 {
                0%, 100% { transform: translateY(0px) translateX(0px); }
                50% { transform: translateY(-15px) translateX(10px); }
                }
                @keyframes float3 {
                0%, 100% { transform: translateY(0px) scale(1); }
                50% { transform: translateY(-25px) scale(1.1); }
                }
                @keyframes float4 {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-10px) rotate(90deg); }
                }
                @keyframes pulseSlow {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 0.8; }
                }
                .animate-float1 { animation: float1 6s ease-in-out infinite; }
                .animate-float2 { animation: float2 8s ease-in-out infinite; }
                .animate-float3 { animation: float3 10s ease-in-out infinite; }
                .animate-float4 { animation: float4 7s ease-in-out infinite; }
                .animate-pulseSlow { animation: pulseSlow 4s ease-in-out infinite; }
            `}</style>
        </div>
      </>
    );
};

export default ReviewDashboard;