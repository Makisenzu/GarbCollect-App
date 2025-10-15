import { Filter, SortAsc } from 'lucide-react';

const ReviewFilters = ({ activeFilter, sortBy, onFilterChange, onSortChange }) => (
  <>
    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h3 className="font-semibold text-slate-800 mb-3 md:mb-4 flex items-center">
        <Filter className="w-4 h-4 mr-2" />
        Filter Reviews
      </h3>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
        <div className="space-y-1">
          {[
            { value: 'all', label: 'All Ratings' },
            { value: '5', label: '5 Stars' },
            { value: '4', label: '4 Stars' },
            { value: '3', label: '3 Stars' },
            { value: '2', label: '2 Stars' },
            { value: '1', label: '1 Star' }
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => onFilterChange(filter.value)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                activeFilter === filter.value
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6">
      <h3 className="font-semibold text-slate-800 mb-3 md:mb-4 flex items-center">
        <SortAsc className="w-4 h-4 mr-2" />
        Sort By
      </h3>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="highest">Highest Rated</option>
        <option value="lowest">Lowest Rated</option>
      </select>
    </div>
  </>
);

export default ReviewFilters;