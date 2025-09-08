import React from 'react';

const ClientPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex sm:hidden items-center justify-between w-full">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-2 text-sm rounded-md ${
            currentPage === 1
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          ← Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 text-sm rounded-md ${
            currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Next →
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </p>
        </div>
        
        <nav className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 text-sm rounded-md ${
              currentPage === 1
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            Previous
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 text-sm rounded-md ${
                page === currentPage
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 text-sm rounded-md ${
              currentPage === totalPages
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ClientPagination;