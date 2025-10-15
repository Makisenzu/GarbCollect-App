import { User, Calendar, MapPin, MessageCircle, ThumbsUp } from 'lucide-react';
import StarRating from './StarRating';

const ReviewCard = ({ review, onHelpful }) => (
  <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 md:p-8 hover:border-slate-600/70 transition-all duration-500 hover:shadow-2xl hover:shadow-black/30 group">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
          <User className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h4 className="font-bold text-white text-lg group-hover:text-emerald-200 transition-colors duration-300">
              {review.fullname}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(review.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-slate-500">
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
      <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-2 rounded-full font-semibold border border-emerald-500/30 backdrop-blur-sm">
        {review.category.category_name}
      </span>
    </div>

    {/* Review Content */}
    <div className="mb-6">
      <p className="text-slate-200 leading-relaxed text-base md:text-lg">{review.review_content}</p>
    </div>

    {/* Additional Comments */}
    {review.additional_comments && (
      <div className="mb-6 p-4 md:p-5 bg-slate-700/30 backdrop-blur-sm rounded-2xl border border-slate-600/50">
        <h5 className="font-semibold text-emerald-300 mb-3 text-sm md:text-base flex items-center">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
          Additional Suggestions:
        </h5>
        <p className="text-slate-300 text-sm md:text-base leading-relaxed">{review.additional_comments}</p>
      </div>
    )}

    {/* Reply Section */}
    {review.replies && (
      <div className="mb-6 p-4 md:p-5 bg-emerald-500/10 backdrop-blur-sm rounded-2xl border border-emerald-500/20">
        <div className="flex items-start space-x-3 md:space-x-4">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <span className="font-bold text-emerald-300 text-sm md:text-base">Admin Response</span>
              <span className="text-xs text-emerald-500/70">
                {new Date(review.replies.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">{review.replies.reply_content}</p>
          </div>
        </div>
      </div>
    )}

    {/* Action Buttons */}
    <div className="flex items-center justify-between pt-4 md:pt-5 border-t border-slate-700/50">
      <button
        onClick={() => onHelpful(review.id)}
        className="flex items-center space-x-2 text-slate-400 hover:text-emerald-400 transition-all duration-300 group/helpful"
      >
        <div className="p-2 bg-slate-700/50 rounded-lg group-hover/helpful:bg-emerald-500/20 transition-colors duration-300">
          <ThumbsUp className="w-4 h-4 group-hover/helpful:scale-110 transition-transform duration-300" />
        </div>
        <span className="font-medium text-sm">Found this helpful?</span>
      </button>
      
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
        review.rate >= 4 
          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
          : review.rate >= 3 
          ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
          : 'bg-red-500/20 text-red-300 border border-red-500/30'
      }`}>
        {review.rate >= 4 ? 'Excellent' : review.rate >= 3 ? 'Good' : 'Needs Improvement'}
      </div>
    </div>
  </div>
);

export default ReviewCard;