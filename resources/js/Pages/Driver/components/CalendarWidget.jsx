import React, { useState } from "react";

const CalendarWidget = ({ schedules }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const currentDay = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const displayMonth = currentDate.getMonth();
    const displayYear = currentDate.getFullYear();

    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
    
    const schedulesByDate = {};
    if (schedules && Array.isArray(schedules)) {
        schedules.forEach(schedule => {
            const scheduleDate = new Date(schedule.collection_date);
            if (scheduleDate.getMonth() === displayMonth && scheduleDate.getFullYear() === displayYear) {
                const day = scheduleDate.getDate();
                if (!schedulesByDate[day]) {
                    schedulesByDate[day] = [];
                }
                schedulesByDate[day].push(schedule);
            }
        });
    }

    const getDayColor = (schedules) => {
        if (!schedules || schedules.length === 0) return '';
        
        const hasFailed = schedules.some(s => s.status === 'FAILED' || s.status === 'failed');
        const hasCompleted = schedules.some(s => s.status === 'completed');
        const hasActive = schedules.some(s => s.status === 'active' || s.status === 'pending' || s.status === 'progress');
        const hasPending = schedules.some(s => s.status === 'progress');
        
        if (hasFailed) return 'bg-red-100 border border-red-300';
        if (hasCompleted) return 'bg-green-100 border border-green-300';
        if (hasPending) return 'bg-yellow-100 border border-yellow-300';
        if (hasActive) return 'bg-blue-100 border border-blue-300';
        
        return '';
    };

    const getStatusDot = (schedules) => {
        if (!schedules || schedules.length === 0) return null;
        
        const hasFailed = schedules.some(s => s.status === 'FAILED' || s.status === 'failed');
        const hasCompleted = schedules.some(s => s.status === 'completed');
        const hasActive = schedules.some(s => s.status === 'active' || s.status === 'pending' || s.status === 'progress');
        const hasPending = schedules.some(s => s.status === 'progress');
        
        if (hasFailed) return 'bg-red-500';
        if (hasCompleted) return 'bg-green-500';
        if (hasPending) return 'bg-yellow-500';
        if (hasActive) return 'bg-blue-500';
        
        return 'bg-gray-400';
    };

    const navigateMonth = (direction) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            if (direction === 'next') {
                newDate.setMonth(newDate.getMonth() + 1);
            } else {
                newDate.setMonth(newDate.getMonth() - 1);
            }
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const days = [];
  
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 sm:h-12 aspect-square"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isCurrentDay = day === currentDay && displayMonth === currentMonth && displayYear === currentYear;
        const daySchedules = schedulesByDate[day] || [];
        const dayColor = getDayColor(daySchedules);
        const statusDot = getStatusDot(daySchedules);
        
        days.push(
            <div 
                key={day} 
                className={`h-10 sm:h-12 aspect-ratio flex flex-col items-center justify-start p-1 rounded relative border-2 ${
                    isCurrentDay 
                        ? 'border-pink-500 text-blue-600 font-semibold' 
                        : dayColor || 'border-transparent text-gray-700 hover:bg-gray-100'
                }`}
            >
                <span className={`text-xs ${isCurrentDay ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>
                    {day}
                </span>
                {statusDot && (
                    <div className="flex justify-center mt-0.5 sm:mt-1">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${statusDot}`}></div>
                    </div>
                )}
            </div>
        );
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={() => navigateMonth('prev')}
                    className="p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                        {monthNames[displayMonth]} {displayYear}
                    </h3>
                    <button 
                        onClick={goToToday}
                        className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                        Today
                    </button>
                </div>
                
                <button 
                    onClick={() => navigateMonth('next')}
                    className="p-1 sm:p-2 rounded hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1 sm:py-2">
                        {day}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {days}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-600 mb-2">Schedule Status:</div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Active</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>Pending</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Failed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarWidget;