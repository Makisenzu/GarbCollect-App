import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget({ schedules }) {
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
        const hasCompleted = schedules.some(s => s.status === 'completed' || s.status === 'done');
        const hasPending = schedules.some(s => s.status === 'progress' || s.status === 'pending');
        const hasActive = schedules.some(s => s.status === 'active');
        
        if (hasFailed) return 'bg-red-50 border-red-200';
        if (hasCompleted) return 'bg-green-50 border-green-200';
        if (hasPending) return 'bg-amber-50 border-amber-200';
        if (hasActive) return 'bg-blue-50 border-blue-200';
        
        return '';
    };

    const getStatusDot = (schedules) => {
        if (!schedules || schedules.length === 0) return null;
        
        const hasFailed = schedules.some(s => s.status === 'FAILED' || s.status === 'failed');
        const hasCompleted = schedules.some(s => s.status === 'completed' || s.status === 'done');
        const hasPending = schedules.some(s => s.status === 'progress' || s.status === 'pending');
        const hasActive = schedules.some(s => s.status === 'active');
        
        if (hasFailed) return 'bg-red-500';
        if (hasCompleted) return 'bg-green-500';
        if (hasPending) return 'bg-amber-500';
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
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
    for (let i = 0; i < adjustedFirstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-12 aspect-square"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const isCurrentDay = day === currentDay && displayMonth === currentMonth && displayYear === currentYear;
        const daySchedules = schedulesByDate[day] || [];
        const dayColor = getDayColor(daySchedules);
        const statusDot = getStatusDot(daySchedules);
        
        days.push(
            <div 
                key={day} 
                className={`h-12 flex flex-col items-center justify-center p-1 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    isCurrentDay 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : dayColor || 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <span className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-700'}`}>
                    {day}
                </span>
                {statusDot && (
                    <div className="flex justify-center mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></div>
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
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <button 
                        onClick={() => navigateMonth('prev')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    <div className="flex flex-col items-center">
                        <h3 className="font-bold text-gray-900 text-lg">
                            {monthNames[displayMonth]} {displayYear}
                        </h3>
                        <button 
                            onClick={goToToday}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1 transition-colors"
                        >
                            Go to Today
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => navigateMonth('next')}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                            {day}
                        </div>
                    ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                    {days}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-700 mb-3">Schedule Status</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600">Active</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-gray-600">Pending</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-gray-600">Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-gray-600">Failed</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}