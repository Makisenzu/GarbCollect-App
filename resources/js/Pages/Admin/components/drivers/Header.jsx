import React from 'react';
import { MdOutlinePeopleOutline } from "react-icons/md";

const Header = () => {
  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Driver Management</h1>
          {/* <p className="text-gray-600 mt-1">Manage garbage collection drivers and their assignments...</p> */}
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <button className="flex items-center text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          {/* <button className="flex items-center text-gray-700 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
            <MdOutlinePeopleOutline className="mr-2 " size={15}/>
            Applicants
          </button> */}
          
          <button className="flex items-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-2 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Import
          </button>
        </div>
      </div>
      
      <div className="w-20 h-1 bg-blue-500 mt-4"></div>
    </header>
  );
};

export default Header;