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
          {/* <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search drivers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-56 text-sm"
            />
          </div> */}
          
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