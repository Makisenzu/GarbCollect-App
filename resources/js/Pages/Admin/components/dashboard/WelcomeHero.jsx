import React from "react";

const CalendarWidget = () => {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentDate.getMonth(), 1).getDay();
    
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const isCurrentDay = day === currentDay;
      days.push(
        <div 
          key={day} 
          className={`h-8 w-8 flex items-center justify-center rounded-full ${
            isCurrentDay 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </div>
      );
    }
  
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">{currentMonth} {currentYear}</h3>
          <div className="flex space-x-2">
            <button className="p-1 rounded hover:bg-gray-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="p-1 rounded hover:bg-gray-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
};

export function WelcomeHero() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 shadow-lg">
                <div className="p-8 text-white relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-2">
                                Welcome Back, Admin!
                            </h1>
                            <p className="text-blue-100 mb-6 text-sm">
                                Monitor and manage your waste collection operations efficiently
                            </p>
                            
                            <div className="flex gap-3">
                                <button className="flex items-center px-4 py-2 text-sm bg-white/20 text-white border border-white/30 rounded-md hover:bg-white/30 backdrop-blur-sm transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    View Tasks
                                </button>
                                <button className="flex items-center px-4 py-2 text-sm border border-white/30 text-white rounded-md hover:bg-white/10 transition-colors">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    Settings
                                </button>
                            </div>
                        </div>
                        
                        <div className="hidden lg:block relative">
                            <div className="w-32 h-32 relative">
                                <div className="absolute inset-0 transform rotate-12 scale-110">
                                    <div className="w-16 h-16 bg-white/20 rounded-lg transform rotate-45 translate-x-4 translate-y-4"></div>
                                    <div className="w-12 h-12 bg-white/30 rounded-lg transform -rotate-12 translate-x-8 translate-y-2"></div>
                                    <div className="w-10 h-10 bg-white/15 rounded-lg transform rotate-6 translate-x-2 translate-y-8"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-4 left-4 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                </div>
            </div>
            
            <div className="lg:col-span-1">
                <CalendarWidget />
            </div>
        </div>
    );
}