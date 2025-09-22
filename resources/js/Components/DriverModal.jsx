import React, { useState, useEffect } from 'react';
import ClientPagination from '@/Components/ClientPagination';
import { CircleLoader } from 'react-spinners';

const DriverModal = ({ driver, schedules, show, onClose, isLoadingSchedules = false }) => {
  if (!show || !driver) return null;
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const itemsPerPage = 5;

  useEffect(() => {
    if (show) {
      setIsSchedulesLoading(true);
      const timer = setTimeout(() => {
        setIsSchedulesLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [show, schedules]);

  const driverSchedules = schedules.filter(schedule => 
    schedule.driver_id === driver.id
  );

  const totalPages = Math.ceil(driverSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = driverSchedules.slice(startIndex, startIndex + itemsPerPage);

  const getInitialsFromName = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return 'N/A';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      
      const period = hours >= 12 ? 'PM' : 'AM';
      
      const hours12 = hours % 12 || 12;
      
      return `${hours12}:${minutes.toString().padStart(2, '0')}${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Driver Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {driver.user.picture ? (
                  <img 
                    src={`/storage/profile-pictures/${driver.user.picture}`} 
                    alt={`${driver.user.name} ${driver.user.lastname}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 text-gray-400 flex items-center justify-center text-2xl font-bold">
                    {getInitialsFromName(driver.user.name, driver.user.lastname)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-gray-900">
                {driver.user?.name} {driver.user?.lastname}
              </h3>
              <p className="text-gray-600 mb-4">{driver.user?.email}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">License Number</p>
                  <p className="font-medium">{driver.license_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${driver.status === 'active' ? 'bg-green-100 text-green-800' : 
                    driver.status === 'inactive' ? 'bg-red-100 text-red-800' : 
                    driver.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    driver.status === 'onduty' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                    {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{driver.user.phone_num || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employment Date</p>
                  <p className="font-medium">{formatDate(driver.created_at)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Scheduled Collection</h4>
              {!isSchedulesLoading && driverSchedules.length > 0 && (
                <span className="text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, driverSchedules.length)} of {driverSchedules.length} schedules
                </span>
              )}
            </div>
            
            {isSchedulesLoading || isLoadingSchedules ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CircleLoader color="#00de08" size={20} loading={true} />
                <p className="mt-2 text-gray-600">Loading schedules...</p>
              </div>
            ) : driverSchedules.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Barangay
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Collection Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedSchedules.map((schedule) => (
                        <tr key={schedule.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {schedule.barangay?.baranggay_name || schedule.baranggay_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(schedule.collection_date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatTimeTo12Hour(schedule.collection_time)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {schedule.finished_time ? formatTimeTo12Hour(schedule.finished_time) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                              ${schedule.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              schedule.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'}`}>
                              {schedule.status?.charAt(0)?.toUpperCase() + schedule.status?.slice(1) || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {schedule.notes || 'None'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <ClientPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <p className="text-gray-500">No barangay schedules found for this driver.</p>
            )}
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverModal;