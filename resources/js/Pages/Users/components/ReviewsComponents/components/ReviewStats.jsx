import { Star, TrendingUp, Users, Award } from 'lucide-react';
import StarRating from './StarRating';

const ReviewStats = ({ averageRating, ratingDistribution, reviewsCount }) => (
  <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 p-6 md:p-8 shadow-2xl">
    <div className="text-center mb-6 md:mb-8">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-lg shadow-emerald-500/25">
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">{averageRating}</div>
          <StarRating rating={Math.round(parseFloat(averageRating))} readonly size="md" />
        </div>
      </div>
      <div className="text-gray-700 text-sm flex items-center justify-center space-x-4">
        <div className="flex items-center space-x-1">
          <Users className="w-4 h-4" />
          <span>Based on {reviewsCount} reviews</span>
        </div>
        {parseFloat(averageRating) >= 4 && (
          <div className="flex items-center space-x-1 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>Excellent</span>
          </div>
        )}
      </div>
    </div>

    {/* Enhanced Rating Distribution */}
    <div className="space-y-4">
      {ratingDistribution.map(({ stars, count, percentage }) => (
        <div key={stars} className="flex items-center space-x-3 group">
          <div className="flex items-center space-x-2 w-16">
            <span className="text-sm font-semibold text-gray-900">{stars}</span>
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out group-hover:from-emerald-400 group-hover:to-cyan-400"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-900 w-8 text-right">
            {count}
          </span>
        </div>
      ))}
    </div>

    {/* Quick Stats */}
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <div className="text-lg font-bold text-gray-900">{reviewsCount}</div>
          <div className="text-xs text-gray-700">Total Reviews</div>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
          <div className="text-lg font-bold text-emerald-600">
            {ratingDistribution.find(r => r.stars === 5)?.count || 0}
          </div>
          <div className="text-xs text-gray-700">5-Star Reviews</div>
        </div>
      </div>
    </div>
  </div>
);

export default ReviewStats;