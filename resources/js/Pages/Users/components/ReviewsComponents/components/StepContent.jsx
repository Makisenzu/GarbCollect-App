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
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      padding: '8px 4px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      boxShadow: state.isFocused ? '0 0 0 2px #3b82f6' : 'none',
      borderColor: state.isFocused ? '#3b82f6' : '#cbd5e1',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#94a3b8'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#1e293b',
      padding: '8px 12px',
      '&:active': {
        backgroundColor: '#3b82f6',
        color: 'white'
      }
    }),
    menu: (base) => ({
      ...base,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8'
    })
  };

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
              <label htmlFor="barangay" className="block text-sm font-medium text-slate-700 mb-2">
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
              <label htmlFor="purok" className="block text-sm font-medium text-slate-700 mb-2">
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
                <p className="text-sm text-slate-500 mt-1">Please select a barangay first</p>
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