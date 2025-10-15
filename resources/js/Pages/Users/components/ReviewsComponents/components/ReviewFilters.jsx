import { Filter, SortAsc, Sliders } from 'lucide-react';

const ReviewFilters = ({ activeFilter, sortBy, onFilterChange, onSortChange }) => (
  <>
    {/* Filters */}
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 md:p-8 shadow-2xl shadow-black/30">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl">
          <Filter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Filter Reviews</h3>
          <p className="text-slate-400 text-sm">Refine by rating</p>
        </div>
      </div>
      
      {/* Rating Filter */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-4">Rating</label>
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
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-white border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  : 'text-slate-400 hover:bg-slate-700/50 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  activeFilter === filter.value 
                    ? 'bg-emerald-400 scale-125' 
                    : 'bg-slate-600 group-hover:bg-emerald-400'
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
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 md:p-8 shadow-2xl shadow-black/30">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
          <SortAsc className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-lg">Sort By</h3>
          <p className="text-slate-400 text-sm">Arrange reviews</p>
        </div>
      </div>
      
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full px-4 py-3 bg-slate-700/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white text-sm transition-all duration-300 appearance-none cursor-pointer"
      >
        <option value="newest" className="bg-slate-800">Newest First</option>
        <option value="oldest" className="bg-slate-800">Oldest First</option>
        <option value="highest" className="bg-slate-800">Highest Rated</option>
        <option value="lowest" className="bg-slate-800">Lowest Rated</option>
      </select>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">Currently showing:</span>
          <span className="text-emerald-400 font-semibold">
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