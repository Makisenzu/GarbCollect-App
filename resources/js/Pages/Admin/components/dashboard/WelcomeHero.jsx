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
        
        const hasFailed = schedules.some(s => s.status === 'FAILED');
        const hasCompleted = schedules.some(s => s.status === 'completed');
        const hasActive = schedules.some(s => s.status === 'active' || s.status === 'pending');
        
        if (hasFailed) return 'bg-red-50 text-red-700 border border-red-200';
        if (hasCompleted) return 'bg-green-50 text-green-700 border border-green-200';
        if (hasActive) return 'bg-blue-50 text-blue-700 border border-blue-200';
        
        return '';
    };

    const getStatusDot = (schedules) => {
        if (!schedules || schedules.length === 0) return null;
        
        const hasFailed = schedules.some(s => s.status === 'FAILED');
        const hasCompleted = schedules.some(s => s.status === 'completed');
        const hasActive = schedules.some(s => s.status === 'active' || s.status === 'pending');
        
        if (hasFailed) return 'bg-red-500';
        if (hasCompleted) return 'bg-green-500';
        if (hasActive) return 'bg-blue-500';
        
        return null;
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
        days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isCurrentDay = day === currentDay && displayMonth === currentMonth && displayYear === currentYear;
        const daySchedules = schedulesByDate[day] || [];
        const dayColor = getDayColor(daySchedules);
        const statusDot = getStatusDot(daySchedules);
        
        days.push(
            <div 
                key={day} 
                className={`h-10 flex flex-col items-center justify-center rounded-md cursor-pointer transition-all ${
                    isCurrentDay 
                        ? 'bg-gray-900 text-white font-semibold' 
                        : dayColor || 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                <span className="text-sm">
                    {day}
                </span>
                {statusDot && !isCurrentDay && (
                    <div className={`w-1 h-1 rounded-full ${statusDot} mt-0.5`}></div>
                )}
            </div>
        );
    }

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-semibold text-gray-900">
                    {monthNames[displayMonth]} {displayYear}
                </h3>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={goToToday}
                        className="text-xs px-2 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => navigateMonth('prev')}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => navigateMonth('next')}
                        className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-xs font-semibold text-gray-500">
                        {day}
                    </div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
                {days}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="text-gray-600">Active</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span className="text-gray-600">Failed</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export function WelcomeHero({ schedules }) {
    const currentHour = new Date().getHours();
    const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{greeting}</p>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome back, Admin
                        </h1>
                        <p className="text-sm text-gray-600 mb-6">
                            Here's what's happening with your waste collection operations today.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-900 rounded-md hover:bg-gray-800 transition-colors">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Generate Reports
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Today's Collections</p>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600">8</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Completed</p>
                        <p className="text-2xl font-bold text-green-600">16</p>
                    </div>
                </div>
            </div>
            
            <div className="lg:col-span-1">
                <CalendarWidget schedules={schedules} />
            </div>
        </div>
    );
}