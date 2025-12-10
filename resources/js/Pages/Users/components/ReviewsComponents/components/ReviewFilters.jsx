import { Filter, SortAsc, Sliders } from 'lucide-react';

const ReviewFilters = ({ activeFilter, sortBy, onFilterChange, onSortChange }) => (
  <>
    {/* Filters */}
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 p-6 md:p-8 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Filter Reviews</h3>
          <p className="text-gray-600 text-sm">Refine by rating</p>
        </div>
      </div>
      
      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-4">Rating</label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Ratings', emoji: '⭐' },
            { value: '5', label: '5 Stars', emoji: '⭐⭐⭐⭐⭐' },
            { value: '4', label: '4 Stars', emoji: '⭐⭐⭐⭐' },
            { value: '3', label: '3 Stars', emoji: '⭐⭐⭐' },
            { value: '2', label: '2 Stars', emoji: '⭐⭐' },
            { value: '1', label: '1 Star', emoji: '⭐' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-between group ${
                activeFilter === filter.value
                  ? 'bg-emerald-50 text-gray-900 border border-emerald-300 shadow-lg'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeFilter === filter.value 
                    ? 'bg-emerald-500 scale-125' 
                    : 'bg-gray-300 group-hover:bg-emerald-400'
                }`}></div>
                <span className="font-medium">{filter.label}</span>
              </div>
              <span className="text-sm opacity-70">{filter.emoji}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* Sort */}
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200 p-6 md:p-8 shadow-2xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
          <SortAsc className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Sort By</h3>
          <p className="text-gray-600 text-sm">Arrange reviews</p>
        </div>
      </div>
      
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-sm transition-all duration-300 appearance-none cursor-pointer"
      >
        <option value="newest" className="bg-white">Newest First</option>
        <option value="oldest" className="bg-white">Oldest First</option>
        <option value="highest" className="bg-white">Highest Rated</option>
        <option value="lowest" className="bg-white">Lowest Rated</option>
      </select>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-700">Currently showing:</span>
          <span className="text-emerald-600 font-semibold">
            {sortBy === 'newest' && 'Newest'}
            {sortBy === 'oldest' && 'Oldest'}
            {sortBy === 'highest' && 'Highest Rated'}
            {sortBy === 'lowest' && 'Lowest Rated'}
          </span>
        </div>
      </div>
    </div>
  </>
);

export default ReviewFilters;