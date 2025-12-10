import { User, Calendar, MapPin, MessageCircle, ThumbsUp } from 'lucide-react';
import StarRating from './StarRating';

const ReviewCard = ({ review, onHelpful }) => (
  <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 p-6 md:p-8 hover:border-gray-300 transition-all duration-500 hover:shadow-2xl group">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
          <User className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors duration-300">
              {review.fullname}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-900">
              <Calendar className="w-4 h-4" />
              <span>{new Date(review.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-900">
            <MapPin className="w-4 h-4" />
            <span>{review.barangay}, {review.purok}</span>
          </div>
        </div>
      </div>
      <div className="sm:self-start">
        <StarRating rating={review.rate} readonly size="md" />
      </div>
    </div>

    {/* Category and Site Badges */}
    <div className="mb-6 flex flex-wrap gap-3">
      <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-2 rounded-full font-semibold border border-emerald-200">
        {review.category.category_name}
      </span>
    </div>

    {/* Review Content */}
    <div className="mb-6">
      <p className="text-gray-900 leading-relaxed text-base md:text-lg">{review.review_content}</p>
    </div>

    {/* Additional Comments */}
    {review.additional_comments && (
      <div className="mb-6 p-4 md:p-5 bg-blue-50 rounded-2xl border border-blue-200">
        <h5 className="font-semibold text-blue-700 mb-3 text-sm md:text-base flex items-center">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
          Additional Suggestions:
        </h5>
        <p className="text-gray-900 text-sm md:text-base leading-relaxed">{review.additional_comments}</p>
      </div>
    )}

    {/* Reply Section */}
    {review.replies && (
      <div className="mb-6 p-4 md:p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
        <div className="flex items-start space-x-3 md:space-x-4">
          <div className="p-2 bg-emerald-100 rounded-xl border border-emerald-300">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <span className="font-bold text-emerald-700 text-sm md:text-base">Admin Response</span>
              <span className="text-xs text-emerald-600">
                {new Date(review.replies.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <p className="text-gray-900 text-sm md:text-base leading-relaxed">{review.replies.reply_content}</p>
          </div>
        </div>
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-gray-200">
      <button
        onClick={() => onHelpful(review.id)}
        className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-all duration-300 group/helpful"
      >
        <div className="p-2 bg-gray-100 rounded-lg group-hover/helpful:bg-emerald-50 transition-colors duration-300">
          <ThumbsUp className="w-4 h-4 group-hover/helpful:scale-110 transition-transform duration-300" />
        </div>
        <span className="font-medium text-sm">Found this helpful?</span>
      </button>
      
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
        review.rate >= 4 
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
          : review.rate >= 3 
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
          : 'bg-red-100 text-red-700 border border-red-300'
      }`}>
        {review.rate >= 4 ? 'Excellent' : review.rate >= 3 ? 'Good' : 'Needs Improvement'}
      </div>
    </div>
  </div>
);

export default ReviewCard;