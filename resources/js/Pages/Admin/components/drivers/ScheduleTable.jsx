import React, { useState, useEffect } from 'react';

const ScheduleTable = ({ drivers, barangays, schedules }) => {
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [timePeriod, setTimePeriod] = useState('today');
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedBarangay) {
      setFilteredSchedules([]);
      return;
    }

    setLoading(true);
    
    let filtered = schedules.filter(schedule => 
      schedule.barangay_id == selectedBarangay
    );

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timePeriod) {
      case 'today':
        filtered = filtered.filter(schedule => {
          const scheduleDate = new Date(schedule.collection_date);
          const scheduleDateOnly = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate());
          return scheduleDateOnly.getTime() === today.getTime();
        });
        break;
        
      case 'week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        filtered = filtered.filter(schedule => {
          const scheduleDate = new Date(schedule.collection_date);
          return scheduleDate >= startOfWeek && scheduleDate <= endOfWeek;
        });
        break;
        
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        
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
  }, [selectedBarangay, timePeriod, schedules]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
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
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      return timeString;
    }
  };

  const getDriverName = (driverId) => {
    const schedule = schedules.find(s => s.driver_id == driverId);
    if (schedule && schedule.driver && schedule.driver.user) {
      return `${schedule.driver.user.name} ${schedule.driver.user.lastname}`;
    }
    
    const driver = drivers.find(d => d.id == driverId);
    if (driver && driver.user) {
      return `${driver.user.name} ${driver.user.lastname}`;
    }
    
    return 'Unknown Driver';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      progress: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Pending' },
      active: { color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Active' },
      inactive: { color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Inactive' },
      completed: { color: 'bg-green-50 text-green-700 border-green-200', label: 'Completed' },
      failed: { color: 'bg-red-50 text-red-700 border-red-200', label: 'Failed' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-50 text-gray-700 border-gray-200', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getBarangayName = (barangayId) => {
    const schedule = schedules.find(s => s.barangay_id == barangayId);
    if (schedule && schedule.barangay) {
      return schedule.barangay.baranggay_name;
    }
    
    const barangay = barangays.find(b => b.id == barangayId);
    return barangay ? barangay.baranggay_name : 'Unknown Barangay';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Collection Schedules</h2>
            <p className="text-sm text-gray-500 mt-0.5">View and manage collection schedules by barangay</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-64">
              <select
                id="barangay"
                value={selectedBarangay}
                onChange={(e) => setSelectedBarangay(e.target.value)}
                className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900"
              >
                <option value="">Select barangay</option>
                {barangays.map(barangay => (
                  <option key={barangay.id} value={barangay.id}>
                    {barangay.baranggay_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setTimePeriod('today')}
                className={`px-4 py-2 text-xs font-medium border ${
                  timePeriod === 'today'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-l-md transition-colors`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimePeriod('week')}
                className={`px-4 py-2 text-xs font-medium border-t border-b ${
                  timePeriod === 'week'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } transition-colors`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setTimePeriod('month')}
                className={`px-4 py-2 text-xs font-medium border ${
                  timePeriod === 'month'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } rounded-r-md transition-colors`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {!selectedBarangay ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No barangay selected</h3>
            <p className="mt-1 text-sm text-gray-500">Select a barangay above to view collection schedules</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No collection schedules found for {getBarangayName(selectedBarangay)} in the selected time period
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider bg-gray-50">
                      Driver
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider bg-gray-50">
                      Collection Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider bg-gray-50">
                      Collection Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider bg-gray-50">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider bg-gray-50">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getDriverName(schedule.driver_id)}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          License: {schedule.driver?.license_number || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(schedule.collection_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(schedule.collection_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(schedule.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={schedule.notes}>
                          {schedule.notes || '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
              <div>
                Showing <span className="font-medium text-gray-900">{filteredSchedules.length}</span> schedule{filteredSchedules.length !== 1 ? 's' : ''}
              </div>
              <div>
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleTable;