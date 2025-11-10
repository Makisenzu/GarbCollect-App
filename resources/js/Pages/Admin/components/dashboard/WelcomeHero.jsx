import React, { useState } from "react";
import axios from "axios";

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
    const [isGenerating, setIsGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [reportConfig, setReportConfig] = useState({
        type: 'all',
        start_date: '',
        end_date: ''
    });

    const convertToCSV = (data) => {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header];
                if (value === null || value === undefined) return '';
                const stringValue = String(value);
                return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
            }).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\n');
    };

    const downloadCSV = (csv, filename) => {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateReport = async () => {
        setIsGenerating(true);
        
        try {
            const response = await axios.post('/admin/generate-report', reportConfig);
            
            if (response.data.success) {
                const csv = convertToCSV(response.data.data);
                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `GarbCollect_Report_${reportConfig.type}_${timestamp}.csv`;
                
                downloadCSV(csv, filename);
                
                alert(`Report generated successfully!\n\nSummary:\n- Total Schedules: ${response.data.summary.total_schedules}\n- Total Sacks: ${response.data.summary.total_sacks}\n- Completed: ${response.data.summary.completed}\n- Active: ${response.data.summary.active}\n- Failed: ${response.data.summary.failed}`);
                
                setShowModal(false);
                setReportConfig({ type: 'all', start_date: '', end_date: '' });
            }
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <>
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Collection Report</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Type
                                </label>
                                <select
                                    value={reportConfig.type}
                                    onChange={(e) => setReportConfig({...reportConfig, type: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                                >
                                    <option value="all">All Collections</option>
                                    <option value="completed">Completed Only</option>
                                    <option value="active">Active Only</option>
                                    <option value="FAILED">Failed Only</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={reportConfig.start_date}
                                    onChange={(e) => setReportConfig({...reportConfig, start_date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={reportConfig.end_date}
                                    onChange={(e) => setReportConfig({...reportConfig, end_date: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-900 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download Report
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setReportConfig({ type: 'all', start_date: '', end_date: '' });
                                }}
                                disabled={isGenerating}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        
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
                            <button 
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-gray-900 rounded-md hover:bg-gray-800 transition-colors"
                            >
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
        </>
    );
}