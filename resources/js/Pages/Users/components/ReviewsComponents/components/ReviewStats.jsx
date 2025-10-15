import { Star } from 'lucide-react';
import StarRating from './StarRating';

const ReviewStats = ({ averageRating, ratingDistribution, reviewsCount }) => (
  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
    <div className="text-center mb-4 md:mb-6">
      <div className="text-3xl md:text-5xl font-bold text-slate-800 mb-2">{averageRating}</div>
      <StarRating rating={Math.round(parseFloat(averageRating))} readonly />
      <div className="text-sm text-slate-500 mt-2">
        Based on {reviewsCount} reviews
      </div>
    </div>

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
);

export default ReviewStats;