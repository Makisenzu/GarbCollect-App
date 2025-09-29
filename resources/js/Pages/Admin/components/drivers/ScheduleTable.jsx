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
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      active: { color: 'bg-blue-100 text-blue-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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

  const getDriverStatus = (driverId) => {
    const driver = drivers.find(d => d.id == driverId);
    return driver ? driver.status : 'unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Collection Schedules</h2>
          <p className="text-sm text-gray-600 mt-1">View schedules by barangay</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-64">
            <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">
              Select Barangay
            </label>
            <select
              id="barangay"
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">Choose a barangay</option>
              {barangays.map(barangay => (
                <option key={barangay.id} value={barangay.id}>
                  {barangay.baranggay_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <div className="flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setTimePeriod('today')}
                className={`relative inline-flex items-center px-3 py-2 rounded-l-md border text-sm font-medium ${
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
                className={`relative inline-flex items-center px-3 py-2 border-t border-b text-sm font-medium ${
                  timePeriod === 'week'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setTimePeriod('month')}
                className={`relative inline-flex items-center px-3 py-2 rounded-r-md border text-sm font-medium ${
                  timePeriod === 'month'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>
      </div>

      {!selectedBarangay ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No barangay selected</h3>
          <p className="mt-1 text-sm text-gray-500">Select a barangay to view collection schedules.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schedules found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No collection schedules found for {getBarangayName(selectedBarangay)} in the selected time period.
          </p>
        </div>
      ) : (
        <>
          {/* <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Barangay:</span>
                <span className="ml-2 text-blue-700">{getBarangayName(selectedBarangay)}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Time Period:</span>
                <span className="ml-2 text-blue-700 capitalize">{timePeriod.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Total Schedules:</span>
                <span className="ml-2 text-blue-700">{filteredSchedules.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-900">Unique Drivers:</span>
                <span className="ml-2 text-blue-700">
                  {new Set(filteredSchedules.map(s => s.driver_id)).size}
                </span>
              </div>
            </div>
          </div> */}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Status
                  </th> */}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Collection Time
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getDriverName(schedule.driver_id)}
                      </div>
                      <div className="text-sm text-gray-500">
                        License: {schedule.driver?.license_number || 'N/A'}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getDriverStatus(schedule.driver_id) === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : getDriverStatus(schedule.driver_id) === 'inactive'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getDriverStatus(schedule.driver_id)}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(schedule.collection_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(schedule.collection_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={schedule.notes}>
                        {schedule.notes || 'None'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <div>
              Showing {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''}
            </div>
            <div>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ScheduleTable;