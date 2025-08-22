import React from 'react';

const DriverFilter = ({ activeFilter, setActiveFilter }) => {
  return (
    <div className="flex space-x-2 mb-4">
      <button 
        className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        onClick={() => setActiveFilter('all')}
      >
        All Drivers
      </button>
      <button 
        className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'on duty' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        onClick={() => setActiveFilter('on duty')}
      >
        On Duty
      </button>
      <button 
        className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'active' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
        onClick={() => setActiveFilter('active')}
      >
        Active
      </button>
    </div>
  );
};

export default DriverFilter;