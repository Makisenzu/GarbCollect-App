import { Star, Filter, SortAsc, Plus, User, Calendar, MapPin, MessageCircle, ChevronRight } from 'lucide-react';
import { useReview } from './useReview';

const StarRating = ({ rating, onRate, onHover, size = 'md', readonly = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`${sizeClasses[size]} transition-all duration-200 ${
            star <= (onHover || rating)
              ? 'text-yellow-400 fill-yellow-400 transform scale-110'
              : 'text-gray-300 fill-gray-300 hover:text-yellow-300 hover:fill-yellow-300'
          } ${onRate && !readonly ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
          onClick={() => !readonly && onRate?.(star)}
          onMouseEnter={() => !readonly && onHover?.(star)}
          onMouseLeave={() => !readonly && onHover?.(0)}
          disabled={readonly}
        >
          <Star className="w-full h-full" />
        </button>
      ))}
    </div>
  );
};

const StepContent = ({ 
  currentStep, 
  newReview, 
  categories, 
  availablePuroks, 
  availableSites, 
  onUpdateReview 
}) => {
  switch (currentStep) {
    case 1:
      return (
        <div className="text-center space-y-6">
          <div className="mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">How would you rate our service?</h3>
            <p className="text-slate-600">Select a rating from 1 to 5 stars</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <StarRating 
              rating={newReview.rate}
              onRate={(rate) => onUpdateReview({ ...newReview, rate })}
              size="lg"
            />
          </div>

          <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="text-center">
                <div className={`text-xs font-medium ${
                  star === newReview.rate ? 'text-yellow-600' : 'text-slate-500'
                }`}>
                  {star} {star === 1 ? 'Star' : 'Stars'}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Personal Information</h3>
            <p className="text-slate-600">Tell us a bit about yourself (optional)</p>
          </div>

          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-slate-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              value={newReview.fullname}
              onChange={(e) => onUpdateReview({ ...newReview, fullname: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Enter your full name (optional)"
            />
            <p className="text-sm text-slate-500 mt-1">This will be displayed with your review</p>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Service Details</h3>
            <p className="text-slate-600">Where and what service did you receive?</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-2">
                Service Category *
              </label>
              <select
                id="category_id"
                value={newReview.category_id}
                onChange={(e) => onUpdateReview({ ...newReview, category_id: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                required
              >
                <option value="">Select a service category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="barangay" className="block text-sm font-medium text-slate-700 mb-2">
                Select Barangay *
              </label>
              <select
                id="barangay"
                value={newReview.barangay}
                onChange={(e) => onUpdateReview({ ...newReview, barangay: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                required
              >
                <option value="">Select your barangay</option>
                {categories.barangays?.map(barangay => (
                  <option key={barangay.id} value={barangay.name}>
                    {barangay.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="purok" className="block text-sm font-medium text-slate-700 mb-2">
                Select Purok *
              </label>
              <select
                id="purok"
                value={newReview.purok}
                onChange={(e) => onUpdateReview({ ...newReview, purok: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                disabled={!newReview.barangay}
                required
              >
                <option value="">Select your purok</option>
                {availablePuroks.map(purok => (
                  <option key={purok.id} value={purok.name}>
                    {purok.name}
                  </option>
                ))}
              </select>
              {!newReview.barangay && (
                <p className="text-sm text-slate-500 mt-1">Please select a barangay first</p>
              )}
            </div>

            <div>
              <label htmlFor="site" className="block text-sm font-medium text-slate-700 mb-2">
                Select Collection Site *
              </label>
              <select
                id="site"
                value={newReview.site}
                onChange={(e) => onUpdateReview({ ...newReview, site: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                disabled={!newReview.purok}
                required
              >
                <option value="">Select collection site</option>
                {availableSites.map((site, index) => (
                  <option key={index} value={site}>
                    {site}
                  </option>
                ))}
              </select>
              {!newReview.purok && (
                <p className="text-sm text-slate-500 mt-1">Please select a purok first</p>
              )}
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">Share Your Experience</h3>
            <p className="text-slate-600">Tell us about your experience with the service</p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="review_content" className="block text-sm font-medium text-slate-700 mb-2">
                Review Content *
              </label>
              <textarea
                id="review_content"
                rows="4"
                value={newReview.review_content}
                onChange={(e) => onUpdateReview({ ...newReview, review_content: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Describe your experience with the waste management service..."
                required
              />
            </div>

            <div>
              <label htmlFor="additional_comments" className="block text-sm font-medium text-slate-700 mb-2">
                Additional Comments/Suggestions
              </label>
              <textarea
                id="additional_comments"
                rows="3"
                value={newReview.additional_comments}
                onChange={(e) => onUpdateReview({ ...newReview, additional_comments: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Any suggestions for improvement or additional feedback..."
              />
              <p className="text-sm text-slate-500 mt-1">Optional: Share ideas for service improvement</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-slate-800 mb-3">Review Summary</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Rating:</span>
                <span className="font-medium">{newReview.rate} / 5 stars</span>
              </div>
              {newReview.fullname && (
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{newReview.fullname}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Category:</span>
                <span className="font-medium">
                  {categories.find(c => c.id === parseInt(newReview.category_id))?.category_name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span className="font-medium">
                  {newReview.barangay && newReview.purok && newReview.site 
                    ? `${newReview.barangay}, ${newReview.purok}`
                    : 'Not selected'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const ReviewCard = ({ review, onHelpful }) => (
  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-800 text-sm md:text-base">
              {review.fullname}
            </h4>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-500">
              <Calendar className="w-3 h-3 md:w-4 md:h-4" />
              <span>{new Date(review.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <MapPin className="w-3 h-3 md:w-4 md:h-4" />
            <span>{review.barangay}, {review.purok}</span>
          </div>
        </div>
      </div>
      <div className="sm:self-start">
        <StarRating rating={review.rate} readonly size="sm" />
      </div>
    </div>

    {/* Category and Site Badges */}
    <div className="mb-4 flex flex-wrap gap-2">
      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
        {review.category.category_name}
      </span>
      <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-medium">
        {review.site_name}
      </span>
    </div>

    {/* Review Content */}
    <div className="mb-4">
      <p className="text-slate-700 leading-relaxed text-sm md:text-base">{review.review_content}</p>
    </div>

    {/* Additional Comments */}
    {review.additional_comments && (
      <div className="mb-4 p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h5 className="font-semibold text-slate-800 mb-2 text-xs md:text-sm">Additional Suggestions:</h5>
        <p className="text-slate-600 text-xs md:text-sm">{review.additional_comments}</p>
      </div>
    )}

    {/* Reply Section */}
    {review.replies && (
      <div className="mb-4 p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start space-x-2 md:space-x-3">
          <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
              <span className="font-semibold text-slate-800 text-xs md:text-sm">Admin Response</span>
              <span className="text-xs text-slate-500">
                {new Date(review.replies.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-slate-700 text-xs md:text-sm">{review.replies.reply_content}</p>
          </div>
        </div>
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-100">
      <button
        onClick={() => onHelpful(review.id)}
        className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors text-xs md:text-sm"
      >
        <span className="font-medium">Helpful?</span>
      </button>
    </div>
  </div>
);

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
    availableSites,
    averageRating,
    ratingDistribution,
    steps,
    setNewReview,
    setCurrentStep,
    setHoverRating,
    setActiveFilter,
    setSortBy,
    handleSubmitReview,
    nextStep,
    prevStep,
    handleHelpful,
    isStepValid
  } = useReview();

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
            {/* Rating Summary */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
              <div className="text-center mb-4 md:mb-6">
                <div className="text-3xl md:text-5xl font-bold text-slate-800 mb-2">{averageRating}</div>
                <StarRating rating={Math.round(parseFloat(averageRating))} readonly />
                <div className="text-sm text-slate-500 mt-2">
                  Based on {reviews.length} reviews
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2 md:space-y-3">
                {ratingDistribution.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 w-12 md:w-16">
                      <span className="text-xs md:text-sm text-slate-600">{stars}</span>
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs md:text-sm text-slate-500 w-6 md:w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
              <h3 className="font-semibold text-slate-800 mb-3 md:mb-4 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Filter Reviews
              </h3>
              
              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <div className="space-y-1">
                  {[
                    { value: 'all', label: 'All Ratings' },
                    { value: '5', label: '5 Stars' },
                    { value: '4', label: '4 Stars' },
                    { value: '3', label: '3 Stars' },
                    { value: '2', label: '2 Stars' },
                    { value: '1', label: '1 Star' }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setActiveFilter(filter.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        activeFilter === filter.value
                          ? 'bg-blue-50 text-blue-600 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
              <h3 className="font-semibold text-slate-800 mb-3 md:mb-4 flex items-center">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort By
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
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
                    availablePuroks={availablePuroks}
                    availableSites={availableSites}
                    onUpdateReview={setNewReview}
                    onHoverRating={setHoverRating}
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