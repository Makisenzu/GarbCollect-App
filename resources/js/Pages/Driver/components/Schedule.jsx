import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Play, Eye, AlertCircle, X } from 'lucide-react';

export default function Schedule({ drivers, barangays, schedules, onStartTask, mapboxKey }) {
    const [timePeriod, setTimePeriod] = useState('today');
    const [filteredSchedules, setFilteredSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const assignedBarangay = drivers.length > 0 ? drivers[0]?.barangay : null;
    const assignedBarangayId = assignedBarangay?.id || (schedules.length > 0 ? schedules[0]?.barangay_id : null);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const isScheduleToday = (schedule) => {
        if (!schedule.collection_date) return false;
        try {
            const scheduleDate = new Date(schedule.collection_date);
            const today = new Date();
            return scheduleDate.toDateString() === today.toDateString();
        } catch (error) {
            return false;
        }
    };

    const isTimeToStart = (schedule) => {
        if (!schedule.collection_date || !schedule.collection_time) return false;
        try {
            const now = currentTime;
            const scheduleDate = new Date(schedule.collection_date);
            const [hours, minutes] = schedule.collection_time.split(':').map(Number);
            const scheduleDateTime = new Date(scheduleDate);
            scheduleDateTime.setHours(hours, minutes, 0, 0);
            return now >= scheduleDateTime;
        } catch (error) {
            return false;
        }
    };

    const getTimeDifference = (schedule) => {
        if (!schedule.collection_date || !schedule.collection_time) return 'Invalid';
        try {
            const scheduleDate = new Date(schedule.collection_date);
            const [hours, minutes] = schedule.collection_time.split(':').map(Number);
            scheduleDate.setHours(hours, minutes, 0, 0);
            const now = currentTime;
            const diffMs = scheduleDate.getTime() - now.getTime();
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMinutes / 60);
            const diffDays = Math.floor(diffHours / 24);
            
            if (diffMinutes < 0) {
                return isScheduleToday(schedule) ? 'Now' : 'Past';
            } else if (diffMinutes === 0) {
                return 'Now';
            } else if (diffMinutes < 60) {
                return `${diffMinutes}m`;
            } else if (diffHours < 24) {
                return `${diffHours}h ${diffMinutes % 60}m`;
            } else if (diffDays === 1) {
                return 'Tomorrow';
            } else {
                return `${diffDays}d`;
            }
        } catch (error) {
            return 'Error';
        }
    };

    useEffect(() => {
        if (!assignedBarangayId) {
            setFilteredSchedules([]);
            return;
        }

        setLoading(true);
        let filtered = schedules.filter(schedule => schedule.barangay_id == assignedBarangayId);
        const now = currentTime;
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (timePeriod) {
            case 'today':
                filtered = filtered.filter(schedule => {
                    const scheduleDate = new Date(schedule.collection_date);
                    return scheduleDate.toDateString() === today.toDateString();
                });
                break;
            case 'week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                filtered = filtered.filter(schedule => {
                    const scheduleDate = new Date(schedule.collection_date);
                    return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
                });
                break;
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                filtered = filtered.filter(schedule => {
                    const scheduleDate = new Date(schedule.collection_date);
                    return scheduleDate >= startOfMonth && scheduleDate <= endOfMonth;
                });
                break;
        }

        setFilteredSchedules(filtered);
        setLoading(false);
    }, [assignedBarangayId, timePeriod, schedules, currentTime]);

    const canStartSchedule = (schedule) => {
        const isToday = isScheduleToday(schedule);
        const isTimeValid = isTimeToStart(schedule);
        const isStatusValid = schedule.status === 'active' || schedule.status === 'pending' || schedule.status === 'in_progress' || schedule.status === 'progress';
        return isToday && isTimeValid && isStatusValid;
    };

    const handleFinishTask = async (schedule) => {
        if (!confirm('Are you sure you want to finish this task? This will open the completion report modal.')) {
            return;
        }

        try {
            // Trigger the completion report modal
            // This will be handled by the parent component
            if (window.showCompletionReportModal) {
                window.showCompletionReportModal(schedule.id);
            } else {
                alert('Please complete all sites first before finishing the task.');
            }
        } catch (error) {
            console.error('Error finishing task:', error);
            alert('Failed to finish task. Please try again.');
        }
    };

    const handleShowDetails = (schedule) => {
        setSelectedSchedule(schedule);
        setShowDetailsModal(true);
    };

    const handleCloseDetails = () => {
        setShowDetailsModal(false);
        setSelectedSchedule(null);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (error) {
            return 'Invalid';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        try {
            const [hours, minutes] = timeString.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
        } catch (error) {
            return timeString;
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            in_progress: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'In Progress' },
            active: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Active' },
            inactive: { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Inactive' },
            completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
            done: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Done' },
            failed: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' },
            pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' }
        };
        
        const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const ScheduleCard = ({ schedule }) => {
        const isToday = isScheduleToday(schedule);
        const canStart = canStartSchedule(schedule);
        const timeDiff = getTimeDifference(schedule);
        
        return (
            <div className={`bg-white rounded-xl border hover:shadow-lg transition-all duration-200 overflow-hidden ${
                isToday ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-white' : 'border-gray-200'
            }`}>
                <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-900">
                                    {formatDate(schedule.collection_date)}
                                </span>
                                {isToday && (
                                    <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full font-medium">
                                        Today
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{formatTime(schedule.collection_time)}</span>
                                {!canStart && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                                        {timeDiff}
                                    </span>
                                )}
                            </div>
                        </div>
                        {getStatusBadge(schedule.status)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => canStart && onStartTask(schedule)}
                            disabled={!canStart}
                            className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                canStart
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-sm hover:shadow-md'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            }`}
                        >
                            <Play className="w-4 h-4" />
                            <span className="hidden sm:inline">{canStart ? 'Start Task' : 'Not Available'}</span>
                            <span className="sm:hidden">{canStart ? 'Start' : 'N/A'}</span>
                        </button>
                        {schedule.status === 'in_progress' && (
                            <button 
                                onClick={() => handleFinishTask(schedule)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg text-sm font-medium hover:from-orange-700 hover:to-orange-800 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                Finish
                            </button>
                        )}
                        <button 
                            onClick={() => handleShowDetails(schedule)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 bg-white border border-blue-300 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                        >
                            <Eye className="w-4 h-4" />
                            Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const timePeriodButtons = [
        { value: 'today', label: 'Today' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Collection Schedules</h2>
                    <p className="text-sm text-gray-600">Manage your waste collection tasks</p>
                </div>
                
                <div className="flex gap-2">
                    {timePeriodButtons.map((button) => (
                        <button
                            key={button.value}
                            onClick={() => setTimePeriod(button.value)}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                timePeriod === button.value
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {button.label}
                        </button>
                    ))}
                </div>

                {!assignedBarangayId ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No Assigned Barangay</h3>
                        <p className="text-sm text-gray-500">You haven't been assigned to any barangay yet</p>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : filteredSchedules.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 mb-1">No Schedules Found</h3>
                        <p className="text-sm text-gray-500">No collection tasks for this period</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSchedules.map((schedule) => (
                            <ScheduleCard key={schedule.id} schedule={schedule} />
                        ))}
                    </div>
                )}
            </div>

            {/* Schedule Details Modal */}
            {showDetailsModal && selectedSchedule && (
                <ScheduleDetailsModal 
                    schedule={selectedSchedule}
                    onClose={handleCloseDetails}
                    barangays={barangays}
                />
            )}
        </div>
    );
}

// Schedule Details Modal Component
const ScheduleDetailsModal = ({ schedule, onClose, barangays }) => {
    // Use the barangay relationship from the schedule object
    const barangayName = schedule.barangay?.baranggay_name || 'N/A';
    
    // Get sites count from collections relationship
    const sitesCount = schedule.collections?.length || 0;
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        try {
            const [hours, minutes] = timeString.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const hours12 = hours % 12 || 12;
            return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
        } catch (error) {
            return timeString;
        }
    };

    const getStatusText = (status) => {
        if (status === 'in_progress' || status === 'progress') return 'In Progress';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'completed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'in_progress':
            case 'progress':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'active':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 px-8 py-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Schedule Details</h2>
                            <p className="text-slate-300 text-sm mt-1.5 font-medium">Collection Schedule Information</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-lg transition-all duration-200"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500"></div>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="space-y-6">
                        {/* Barangay */}
                        <div className="group">
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Barangay
                            </label>
                            <div className="text-xl font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                {barangayName}
                            </div>
                        </div>

                        {/* Date & Time Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Collection Date */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Collection Date
                                </label>
                                <div className="text-sm font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                    {formatDate(schedule.collection_date)}
                                </div>
                            </div>

                            {/* Collection Time */}
                            <div className="group">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Collection Time
                                </label>
                                <div className="text-sm font-semibold text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                                    {formatTime(schedule.collection_time)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-5 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 active:bg-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};