import React, { useState, useRef, useEffect } from 'react';
import { MdFilterList } from "react-icons/md";

const DriverFilter = ({ activeFilter, setActiveFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Drivers' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'onduty', label: 'On Duty' },
    { value: 'resigned', label: 'Resigned' },
  ];

  const selectedOption = filterOptions.find(option => option.value === activeFilter);

  const handleOptionClick = (value) => {
    setActiveFilter(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MdFilterList className="mr-2 h-4 w-4"/>
        <span>Filter: {selectedOption?.label}</span>
        <svg 
          className={`h-4 w-4 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 right-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-sm hover:bg-gray-50 transition-colors ${
                activeFilter === option.value ? 'bg-gray-50' : ''
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              <span className="font-medium text-gray-900">{option.label}</span>
              {activeFilter === option.value && (
                <svg className="h-4 w-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DriverFilter;