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
    { value: 'all', label: 'All Drivers', color: 'gray' },
    { value: 'on duty', label: 'On Duty', color: 'green' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'active', label: 'Active', color: 'blue' },
  ];

  const selectedOption = filterOptions.find(option => option.value === activeFilter);

  const handleOptionClick = (value) => {
    setActiveFilter(value);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="flex items-center bg-white border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MdFilterList className="mr-2"/>
        <span className="text-sm font-medium">Filter</span>
        <svg 
          className={`h-4 w-4 ml-1 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-blue-50 transition-colors ${
                activeFilter === option.value ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleOptionClick(option.value)}
            >
              <div className="flex items-center">
                {/* <div className={`w-3 h-3 rounded-full bg-${option.color}-500 mr-3`}></div> */}
                <span className="text-sm font-medium">{option.label}</span>
              </div>
              {activeFilter === option.value && (
                <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
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