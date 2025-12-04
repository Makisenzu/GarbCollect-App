import React, { useState, useEffect } from 'react';

const ReportModal = ({ show, onClose, schedule }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  
  if (!show) return null;

  const hasReports = schedule?.reports && schedule.reports.length > 0;
  
  // Get all pictures from all reports (each report can have multiple pictures)
  const allPictures = hasReports 
    ? schedule.reports
        .filter(r => r.report_picture)
        .flatMap(r => {
          // Handle both array and string formats
          if (Array.isArray(r.report_picture)) {
            return r.report_picture;
          } else if (typeof r.report_picture === 'string') {
            try {
              const parsed = JSON.parse(r.report_picture);
              return Array.isArray(parsed) ? parsed : [r.report_picture];
            } catch {
              return [r.report_picture];
            }
          }
          return [];
        })
    : [];
  
  const uniquePictures = [...new Set(allPictures)];

  return (
    <>
      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Full size preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Collection Report</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {schedule?.barangay?.baranggay_name} - {new Date(schedule?.collection_date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!hasReports ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Report Submitted</h3>
                <p className="mt-1 text-sm text-gray-500">This collection has not been reported yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Report Images */}
                {uniquePictures.length > 0 ? (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Collection Photos ({uniquePictures.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {uniquePictures.map((picture, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={`/storage/${picture}`}
                            alt={`Collection photo ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer transition-transform hover:scale-105"
                            onClick={() => setSelectedImage(`/storage/${picture}`)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                          <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                            Photo {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-500">No photos submitted</p>
                  </div>
                )}

              {/* Garbage Collection Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Waste Collection Summary</h4>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">
                          Garbage Type
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-900 uppercase">
                          Kilograms
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {schedule.reports.map((report, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {report.garbage?.garbage_type || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {parseFloat(report.kilograms).toFixed(2)} kg
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          Total
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {schedule.reports
                            .reduce((sum, report) => sum + parseFloat(report.kilograms || 0), 0)
                            .toFixed(2)} kg
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Notes */}
              {schedule.reports.some(r => r.additional_notes) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Notes</h4>
                  <div className="space-y-2">
                    {schedule.reports
                      .filter(r => r.additional_notes)
                      .map((report, index) => (
                        <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{report.additional_notes}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

const ScheduleTable = ({ drivers, barangays, schedules }) => {
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [timePeriod, setTimePeriod] = useState('today');
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const handleViewReport = (schedule) => {
    setSelectedSchedule(schedule);
    setShowReportModal(true);
  };

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
      <ReportModal 
        show={showReportModal} 
        onClose={() => setShowReportModal(false)} 
        schedule={selectedSchedule} 
      />
      
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
                    <th scope="col" className="px-6 py-3 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider bg-gray-50">
                      Actions
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
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {schedule.status === 'completed' ? (
                          <button
                            onClick={() => handleViewReport(schedule)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            View Report
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
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