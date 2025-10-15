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
  // Premium styles for react-select matching the Hero theme
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '12px 8px',
      border: '2px solid #374151',
      borderRadius: '12px',
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(12px)',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(52, 211, 153, 0.3)' : 'none',
      borderColor: state.isFocused ? '#34d399' : '#374151',
      color: 'white',
      '&:hover': {
        borderColor: state.isFocused ? '#34d399' : '#4b5563'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'rgba(52, 211, 153, 0.8)' 
        : state.isFocused 
        ? 'rgba(52, 211, 153, 0.2)' 
        : 'rgba(30, 41, 59, 0.9)',
      color: state.isSelected ? 'white' : '#e5e7eb',
      padding: '12px 16px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      '&:active': {
        backgroundColor: 'rgba(52, 211, 153, 0.9)',
        color: 'white'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '12px',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#9ca3af'
    }),
    singleValue: (base) => ({
      ...base,
      color: 'white'
    }),
    input: (base) => ({
      ...base,
      color: 'white'
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: '#4b5563'
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      color: state.isFocused ? '#34d399' : '#9ca3af',
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
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">How would you rate our service?</h3>
            <p className="text-slate-400 text-white text-lg">Select a rating from 1 to 5 stars</p>
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
                    ? 'text-yellow-400 scale-110' 
                    : 'text-slate-500'
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
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Personal Information</h3>
            <p className="text-slate-400 text-white text-lg">Tell us a bit about yourself (optional)</p>
          </div>

          <div>
            <label htmlFor="fullname" className="block text-white text-sm font-medium text-white text-slate-300 mb-3">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              value={newReview.fullname}
              onChange={(e) => onUpdateReview({ ...newReview, fullname: e.target.value })}
              className="w-full px-4 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white text-base placeholder-slate-500 transition-all duration-300"
              placeholder="Enter your full name (optional)"
            />
            <p className="text-sm text-slate-500 text-white mt-2">This will be displayed with your review</p>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Service Details</h3>
            <p className="text-slate-400 text-lg text-white">Where and what service did you receive?</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-slate-300 mb-3">
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
              <label htmlFor="barangay" className="block text-sm font-medium text-slate-300 mb-3">
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
              <label htmlFor="purok" className="block text-sm font-medium text-slate-300 mb-3">
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
                <p className="text-sm text-emerald-400 mt-2 flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
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
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Share Your Experience</h3>
            <p className="text-slate-400 text-lg text-white">Tell us about your experience with the service</p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="review_content" className="block text-white text-sm font-medium text-slate-300 mb-3">
                Review Content *
              </label>
              <textarea
                id="review_content"
                rows="5"
                value={newReview.review_content}
                onChange={(e) => onUpdateReview({ ...newReview, review_content: e.target.value })}
                className="w-full px-4 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white text-base placeholder-slate-500 resize-none transition-all duration-300"
                placeholder="Describe your experience with the waste management service..."
                required
              />
            </div>

            <div>
              <label htmlFor="additional_comments" className="block text-sm font-medium text-slate-300 mb-3">
                Additional Comments/Suggestions
              </label>
              <textarea
                id="additional_comments"
                rows="4"
                value={newReview.additional_comments}
                onChange={(e) => onUpdateReview({ ...newReview, additional_comments: e.target.value })}
                className="w-full px-4 py-4 bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-white text-base placeholder-slate-500 resize-none transition-all duration-300"
                placeholder="Any suggestions for improvement or additional feedback..."
              />
              <p className="text-sm text-slate-500 mt-2 text-white">Optional: Share ideas for service improvement</p>
            </div>
          </div>

          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mt-8">
            <h4 className="font-bold text-white text-lg mb-4 flex items-center">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></span>
              Review Summary
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span>Rating:</span>
                <span className="font-semibold text-white flex items-center">
                  {newReview.rate} 
                  <span className="text-yellow-400 ml-1">★</span>
                  <span className="text-slate-500 mx-1">/</span>
                  5
                </span>
              </div>
              {newReview.fullname && (
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span>Name:</span>
                  <span className="font-semibold text-white">{newReview.fullname}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                <span>Category:</span>
                <span className="font-semibold text-white">
                  {categories.find(c => c.id === parseInt(newReview.category_id))?.category_name || 'Not selected'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Location:</span>
                <span className="font-semibold text-white text-right">
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