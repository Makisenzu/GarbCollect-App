import React, { useState, useEffect, useRef } from 'react';
import TaskMap from './TaskMap';

const Schedule = ({ drivers, barangays, schedules, onStartTask, mapboxKey }) => {
  const [timePeriod, setTimePeriod] = useState('today');
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showTaskMap, setShowTaskMap] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const taskMapRef = useRef(null);

  const assignedBarangay = drivers.length > 0 ? drivers[0]?.barangay : null;
  const assignedBarangayId = assignedBarangay?.id || (schedules.length > 0 ? schedules[0]?.barangay_id : null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const isScheduleToday = (schedule) => {
    if (!schedule.collection_date) {
      return false;
    }

    try {
      const scheduleDate = new Date(schedule.collection_date);
      const today = new Date();
      
      return scheduleDate.toDateString() === today.toDateString();
    } catch (error) {
      console.error('Error checking schedule date:', error);
      return false;
    }
  };

  const isTimeToStart = (schedule) => {
    if (!schedule.collection_date || !schedule.collection_time) {
      return false;
    }

    try {
      const now = currentTime;
      const scheduleDate = new Date(schedule.collection_date);
      const [hours, minutes] = schedule.collection_time.split(':').map(Number);
      
      const scheduleDateTime = new Date(scheduleDate);
      scheduleDateTime.setHours(hours, minutes, 0, 0);
      
      return now >= scheduleDateTime;
    } catch (error) {
      console.error('Error checking schedule time:', error);
      return false;
    }
  };

  const getTimeDifference = (schedule) => {
    if (!schedule.collection_date || !schedule.collection_time) {
      return 'Invalid schedule';
    }

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
        if (isScheduleToday(schedule)) {
          return 'Today';
        }
        return 'Past due';
      } else if (diffMinutes === 0) {
        return 'Now';
      } else if (diffMinutes < 60) {
        return `in ${diffMinutes} min`;
      } else if (diffHours < 24) {
        const remainingMinutes = diffMinutes % 60;
        return `in ${diffHours}h ${remainingMinutes}m`;
      } else if (diffDays === 1) {
        return 'Tomorrow';
      } else {
        return scheduleDate.toLocaleDateString('en-US', { weekday: 'long' });
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
    
    let filtered = schedules.filter(schedule => 
      schedule.barangay_id == assignedBarangayId
    );

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
        
      default:
        break;
    }

    setFilteredSchedules(filtered);
    setLoading(false);
  }, [assignedBarangayId, timePeriod, schedules, currentTime]);

  const handleStartCollection = (schedule) => {
    if (!canStartSchedule(schedule)) {
      console.log('Cannot start schedule - time condition not met:', schedule);
      return;
    }
    
    console.log('Starting collection for:', schedule);
    setSelectedSchedule(schedule);
    setShowTaskMap(true);
    
    if (onStartTask) {
      onStartTask(schedule);
    }

    setTimeout(() => {
      if (taskMapRef.current) {
        console.log('Auto-getting location via ref');
        taskMapRef.current.getCurrentLocation();
      }
    }, 1000);
  };

  const canStartSchedule = (schedule) => {
    const isToday = isScheduleToday(schedule);
    const isTimeValid = isTimeToStart(schedule);
    const isStatusValid = schedule.status === 'active' || schedule.status === 'pending' || schedule.status === 'progress';
    
    return isToday && isTimeValid && isStatusValid;
  };

  const handleCloseTaskMap = () => {
    setShowTaskMap(false);
    setSelectedSchedule(null);
  };

  const handleTaskComplete = (completedData) => {
    console.log('Task completed:', completedData);
    setShowTaskMap(false);
    setSelectedSchedule(null);
  };

  const handleTaskCancel = () => {
    console.log('Task cancelled');
    setShowTaskMap(false);
    setSelectedSchedule(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
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
      return `${hours12}:${minutes.toString().padStart(2, '0')}${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      progress: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      active: { color: 'bg-blue-100 text-blue-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (schedule) => {
    console.log('Viewing details for:', schedule);
  };

  const getStartButtonProps = (schedule) => {
    const canStart = canStartSchedule(schedule);
    const isToday = isScheduleToday(schedule);
    const timeDiff = getTimeDifference(schedule);
    
    if (canStart) {
      return {
        disabled: false,
        className: 'bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors w-full',
        text: 'Start Task',
        tooltip: 'Click to start collection task'
      };
    } else {
      let disabledText = 'Start Task';
      let tooltipText = '';
      
      if (!isToday) {
        disabledText = timeDiff;
        tooltipText = `Available on ${formatDate(schedule.collection_date)}`;
      } else if (!isTimeToStart(schedule)) {
        disabledText = timeDiff;
        tooltipText = `Available at ${formatTime(schedule.collection_time)}`;
      } else if (schedule.status !== 'active' && schedule.status !== 'pending' && schedule.status !== 'progress') {
        disabledText = 'Not Available';
        tooltipText = 'Schedule status does not allow starting';
      } else {
        disabledText = 'Not Available';
        tooltipText = 'Cannot start at this time';
      }
      
      return {
        disabled: true,
        className: 'bg-gray-400 text-white px-3 py-2 rounded text-sm font-medium cursor-not-allowed w-full',
        text: disabledText,
        tooltip: tooltipText
      };
    }
  };

  const ScheduleCard = ({ schedule }) => {
    const startButtonProps = getStartButtonProps(schedule);
    const isToday = isScheduleToday(schedule);
    
    return (
      <div className={`bg-white border rounded-lg p-4 mb-4 ${isToday ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">{formatDate(schedule.collection_date)}</span>
              {isToday && (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Today</span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-gray-600">{formatTime(schedule.collection_time)}</span>
              {!isToday && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  {getTimeDifference(schedule)}
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge(schedule.status)}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => handleStartCollection(schedule)}
            disabled={startButtonProps.disabled}
            className={startButtonProps.className}
            title={startButtonProps.tooltip}
          >
            {startButtonProps.text}
          </button>
          <button
            onClick={() => handleViewDetails(schedule)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex-1"
          >
            Details
          </button>
        </div>
      </div>
    );
  };

  if (showTaskMap && selectedSchedule) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Collection Task - {formatDate(selectedSchedule.collection_date)}
          </h2>
          <button
            onClick={handleCloseTaskMap}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            Back to Schedules
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Date:</strong> {formatDate(selectedSchedule.collection_date)}
            </div>
            <div>
              <strong>Time:</strong> {formatTime(selectedSchedule.collection_time)}
            </div>
            <div>
              <strong>Driver:</strong> {selectedSchedule.driver?.user?.name || 'N/A'}
            </div>
          </div>
        </div>

        <div className="h-96 rounded-lg overflow-hidden">
          <TaskMap
            ref={taskMapRef}
            mapboxKey={mapboxKey}
            scheduleId={selectedSchedule.id}
            onTaskComplete={handleTaskComplete}
            onTaskCancel={handleTaskCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Collection Schedules</h2>  
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <div className="flex rounded-lg shadow-sm w-full">
            <button
              type="button"
              onClick={() => setTimePeriod('today')}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-l-lg border text-sm font-medium ${
                timePeriod === 'today'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimePeriod('week')}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 border-t border-b text-sm font-medium ${
                timePeriod === 'week'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimePeriod('month')}
              className={`flex-1 inline-flex items-center justify-center px-3 py-2 rounded-r-lg border text-sm font-medium ${
                timePeriod === 'month'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {!assignedBarangayId ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No assigned barangay</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any assigned barangay yet.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No schedules found in this period.
          </p>
        </div>
      ) : (
        <>
          <div className="block sm:hidden">
            {filteredSchedules.map((schedule) => (
              <ScheduleCard key={schedule.id} schedule={schedule} />
            ))}
          </div>

          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => {
                    const startButtonProps = getStartButtonProps(schedule);
                    const isToday = isScheduleToday(schedule);
                    
                    return (
                      <tr key={schedule.id} className={`hover:bg-gray-50 ${isToday ? 'bg-green-50' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {formatDate(schedule.collection_date)}
                            {isToday && (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Today</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {formatTime(schedule.collection_time)}
                            {!isToday && (
                              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                {getTimeDifference(schedule)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {getStatusBadge(schedule.status)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartCollection(schedule)}
                              disabled={startButtonProps.disabled}
                              className={startButtonProps.className}
                              title={startButtonProps.tooltip}
                            >
                              {startButtonProps.text}
                            </button>
                            <button
                              onClick={() => handleViewDetails(schedule)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-500 gap-2">
            <div>
              Showing {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Today's schedule</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Schedule;