import { User, Calendar, MapPin, MessageCircle } from 'lucide-react';
import StarRating from './StarRating';

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

    <div className="mb-4 flex flex-wrap gap-2">
      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
        {review.category.category_name}
      </span>
      <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-medium">
        {review.site_name}
      </span>
    </div>

    <div className="mb-4">
      <p className="text-slate-700 leading-relaxed text-sm md:text-base">{review.review_content}</p>
    </div>

    {review.additional_comments && (
      <div className="mb-4 p-3 md:p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h5 className="font-semibold text-slate-800 mb-2 text-xs md:text-sm">Additional Suggestions:</h5>
        <p className="text-slate-600 text-xs md:text-sm">{review.additional_comments}</p>
      </div>
    )}

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

export default ReviewCard;