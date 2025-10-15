import { useReview } from './useReview';
import StarRating from './components/StarRating';
import StepContent from './components/StepContent';
import ReviewCard from './components/ReviewCard';
import ReviewStats from './components/ReviewStats';
import ReviewFilters from './components/ReviewFilters';
import { Plus, ChevronRight, Star } from 'lucide-react';

const ReviewDashboard = () => {
  const {
    reviews,
    categories,
    barangays,
    newReview,
    currentStep,
    activeFilter,
    sortBy,
    availablePuroks,
    averageRating,
    ratingDistribution,
    steps,
    loading,
    error,
    setNewReview,
    setCurrentStep,
    setActiveFilter,
    setSortBy,
    handleSubmitReview,
    nextStep,
    prevStep,
    handleHelpful,
    isStepValid
  } = useReview();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading barangay data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 text-red-600 p-4 rounded-lg mb-4">
            <p>Error loading barangay data: {error}</p>
          </div>
          <p className="text-slate-600">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-slate-800 mb-3 md:mb-4">Waste Management Reviews</h1>
          <p className="text-base md:text-lg text-slate-600">Share your experience with our garbage collection services</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {/* Sidebar - Stats and Filters */}
          <div className="lg:w-1/4 space-y-4 md:space-y-6">
            <ReviewStats 
              averageRating={averageRating}
              ratingDistribution={ratingDistribution}
              reviewsCount={reviews.length}
            />
            
            <ReviewFilters 
              activeFilter={activeFilter}
              sortBy={sortBy}
              onFilterChange={setActiveFilter}
              onSortChange={setSortBy}
            />
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Write Review Card with Multi-step Form */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6 md:mb-8">
              <h3 className="font-semibold text-slate-800 mb-4 md:mb-6 flex items-center text-lg md:text-xl">
                <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Submit New Review
              </h3>

              {/* Progress Steps */}
              <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-between relative">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 font-semibold transition-all duration-200 ${
                        currentStep >= step.number
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 text-slate-400 bg-white'
                      }`}>
                        {step.number}
                      </div>
                      <div className="mt-2 text-center">
                        <div className={`text-xs font-medium ${
                          currentStep >= step.number ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 hidden sm:block">
                          {step.description}
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={`absolute top-4 md:top-5 left-1/2 w-full h-0.5 -z-10 ${
                          currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'
                        }`} style={{ left: `${(index * 33) + 16.5}%` }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Content */}
              <form onSubmit={handleSubmitReview}>
                <div className="min-h-[300px] md:min-h-[400px] py-4">
                  <StepContent 
                    currentStep={currentStep}
                    newReview={newReview}
                    categories={categories}
                    barangays={barangays}
                    availablePuroks={availablePuroks}
                    onUpdateReview={setNewReview}
                  />
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 md:pt-6 mt-4 md:mt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-4 py-2 md:px-6 md:py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                  >
                    Previous
                  </button>

                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm md:text-base"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!isStepValid()}
                      className="px-4 py-2 md:px-6 md:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                    >
                      Submit Review
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-4 md:space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onHelpful={handleHelpful} 
                  />
                ))
              ) : (
                <div className="text-center py-8 md:py-12">
                  <div className="text-slate-400 mb-4">
                    <Star className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-slate-600 mb-2">
                    No reviews found
                  </h3>
                  <p className="text-slate-500 text-sm md:text-base">
                    {activeFilter !== 'all'
                      ? 'Try changing your filters to see more reviews.' 
                      : 'No reviews have been submitted yet.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboard;