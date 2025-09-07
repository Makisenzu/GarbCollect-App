import React from 'react';
import { router } from '@inertiajs/react';

const Pagination = ({ links }) => {
  if (links.length <= 3) return null;

  const previous = links[0];
  const next = links[links.length - 1];
  const items = links.slice(1, -1);
  const currentPage = items.find(item => item.active)?.label;

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex sm:hidden items-center justify-between w-full">
        <button
          onClick={() => previous.url && router.visit(previous.url, { preserveState: true })}
          className={`px-3 py-2 text-sm rounded-md ${
            !previous.url 
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
          }`}
          disabled={!previous.url}
        >
          ← Prev
        </button>

        <span className="text-sm text-gray-600">
          Page {currentPage}
        </span>

        <button
          onClick={() => next.url && router.visit(next.url, { preserveState: true })}
          className={`px-3 py-2 text-sm rounded-md ${
            !next.url 
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
          }`}
          disabled={!next.url}
        >
          Next →
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Page {currentPage} of {items.length}
          </p>
        </div>
        
        <nav className="flex space-x-2">
          <button
            onClick={() => previous.url && router.visit(previous.url, { preserveState: true })}
            className={`px-3 py-1 text-sm rounded-md ${
              !previous.url 
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
            disabled={!previous.url}
          >
            Previous
          </button>

          {items.map((link, index) => (
            <button
              key={index}
              onClick={() => router.visit(link.url, { preserveState: true })}
              className={`px-3 py-1 text-sm rounded-md ${
                link.active
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </button>
          ))}

          <button
            onClick={() => next.url && router.visit(next.url, { preserveState: true })}
            className={`px-3 py-1 text-sm rounded-md ${
              !next.url 
                ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
            disabled={!next.url}
          >
            Next
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;