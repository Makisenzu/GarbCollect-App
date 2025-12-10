import Select from 'react-select';
import StarRating from './StarRating';

const StepContent = ({ 
  currentStep, 
  newReview, 
  categories, 
  barangays,
  availablePuroks, 
  onUpdateReview 
}) => {
  // Premium styles for react-select matching the white background
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '12px 8px',
      border: '2px solid #d1d5db',
      borderRadius: '12px',
      backgroundColor: 'white',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(52, 211, 153, 0.3)' : 'none',
      borderColor: state.isFocused ? '#34d399' : '#d1d5db',
      color: '#111827',
      '&:hover': {
        borderColor: state.isFocused ? '#34d399' : '#9ca3af'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'rgba(52, 211, 153, 0.9)' 
        : state.isFocused 
        ? 'rgba(52, 211, 153, 0.1)' 
        : 'white',
      color: state.isSelected ? 'white' : '#111827',
      padding: '12px 16px',
      borderBottom: '1px solid #f3f4f6',
      '&:active': {
        backgroundColor: 'rgba(52, 211, 153, 0.9)',
        color: 'white'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#6b7280'
    }),
    singleValue: (base) => ({
      ...base,
      color: '#111827'
    }),
    input: (base) => ({
      ...base,
      color: '#111827'
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: '#d1d5db'
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#34d399' : '#6b7280',
      '&:hover': {
        color: '#34d399'
      }
    })
  };

  switch (currentStep) {
    case 1:
      return (
        <div className="text-center space-y-8">
          <div className="mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">How would you rate our service?</h3>
            <p className="text-gray-900 text-lg">Select a rating from 1 to 5 stars</p>
          </div>
          
          <div className="flex justify-center mb-8">
            <StarRating 
              rating={newReview.rate}
              onRate={(rate) => onUpdateReview({ ...newReview, rate })}
              size="xl"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="text-center">
                <div className={`text-sm font-semibold transition-all duration-300 ${
                  star === newReview.rate 
                    ? 'text-yellow-500 scale-110' 
                    : 'text-gray-900'
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
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Personal Information</h3>
            <p className="text-gray-900 text-lg">Tell us a bit about yourself (optional)</p>
          </div>

          <div>
            <label htmlFor="fullname" className="block text-sm font-medium text-gray-900 mb-3">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              value={newReview.fullname}
              onChange={(e) => onUpdateReview({ ...newReview, fullname: e.target.value })}
              className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-base placeholder-gray-500 transition-all duration-300"
              placeholder="Enter your full name (optional)"
            />
            <p className="text-sm text-gray-900 mt-2">This will be displayed with your review</p>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Service Details</h3>
            <p className="text-gray-900 text-lg">Where and what service did you receive?</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-900 mb-3">
                Service Category *
              </label>
              <Select
                id="category_id"
                options={categories.map(category => ({
                  value: category.id,
                  label: category.category_name
                }))}
                value={categories.find(cat => cat.id === parseInt(newReview.category_id)) ? {
                  value: newReview.category_id,
                  label: categories.find(cat => cat.id === parseInt(newReview.category_id))?.category_name
                } : null}
                onChange={(selectedOption) => onUpdateReview({ 
                  ...newReview, 
                  category_id: selectedOption?.value || '' 
                })}
                placeholder="Select a service category"
                styles={selectStyles}
                isSearchable
                required
              />
            </div>

            <div>
              <label htmlFor="barangay" className="block text-sm font-medium text-gray-900 mb-3">
                Select Barangay *
              </label>
              <Select
                id="barangay"
                options={barangays.map(barangay => ({
                  value: barangay.name,
                  label: barangay.name
                }))}
                value={newReview.barangay ? {
                  value: newReview.barangay,
                  label: newReview.barangay
                } : null}
                onChange={(selectedOption) => onUpdateReview({ 
                  ...newReview, 
                  barangay: selectedOption?.value || '',
                  purok: '' // Reset purok when barangay changes
                })}
                placeholder="Select your barangay"
                styles={selectStyles}
                isSearchable
                required
              />
            </div>

            <div>
              <label htmlFor="purok" className="block text-sm font-medium text-gray-900 mb-3">
                Select Purok *
              </label>
              <Select
                id="purok"
                options={availablePuroks.map(purok => ({
                  value: purok.name,
                  label: purok.name
                }))}
                value={newReview.purok ? {
                  value: newReview.purok,
                  label: newReview.purok
                } : null}
                onChange={(selectedOption) => onUpdateReview({ 
                  ...newReview, 
                  purok: selectedOption?.value || '' 
                })}
                placeholder="Select your purok"
                styles={selectStyles}
                isSearchable
                isDisabled={!newReview.barangay}
                required
              />
              {!newReview.barangay && (
                <p className="text-sm text-emerald-600 mt-2 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  Please select a barangay first
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case 4:
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Share Your Experience</h3>
            <p className="text-gray-900 text-lg">Tell us about your experience with the service</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="review_content" className="block text-sm font-medium text-gray-900 mb-3">
                Review Content *
              </label>
              <textarea
                id="review_content"
                rows="5"
                value={newReview.review_content}
                onChange={(e) => onUpdateReview({ ...newReview, review_content: e.target.value })}
                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-base placeholder-gray-500 resize-none transition-all duration-300"
                placeholder="Describe your experience with the waste management service..."
                required
              />
            </div>

            <div>
              <label htmlFor="additional_comments" className="block text-sm font-medium text-gray-900 mb-3">
                Additional Comments/Suggestions
              </label>
              <textarea
                id="additional_comments"
                rows="4"
                value={newReview.additional_comments}
                onChange={(e) => onUpdateReview({ ...newReview, additional_comments: e.target.value })}
                className="w-full px-4 py-4 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 text-base placeholder-gray-500 resize-none transition-all duration-300"
                placeholder="Any suggestions for improvement or additional feedback..."
              />
              <p className="text-sm text-gray-900 mt-2">Optional: Share ideas for service improvement</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6 mt-8">
            <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
              Review Summary
            </h4>
            <div className="space-y-3 text-sm text-gray-900">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Rating:</span>
                <span className="font-semibold text-gray-900 flex items-center">
                  {newReview.rate} 
                  <span className="text-yellow-500 ml-1">★</span>
                  <span className="text-gray-400 mx-1">/</span>
                  5
                </span>
              </div>
              {newReview.fullname && (
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span>Name:</span>
                  <span className="font-semibold text-gray-900">{newReview.fullname}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span>Category:</span>
                <span className="font-semibold text-gray-900">
                  {categories.find(c => c.id === parseInt(newReview.category_id))?.category_name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Location:</span>
                <span className="font-semibold text-gray-900 text-right">
                  {newReview.barangay && newReview.purok 
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

export default StepContent;