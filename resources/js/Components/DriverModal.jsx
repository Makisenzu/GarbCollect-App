import React, { useState, useEffect, useMemo } from 'react';
import ClientPagination from '@/Components/ClientPagination';
import { CircleLoader, RingLoader } from 'react-spinners';
import FormModal from '@/Components/FormModal';
import { router } from '@inertiajs/react';
import { showAlert, confirmDialog } from '@/SweetAlert';
import { getAvatarUrl } from '@/Utils/imageHelpers';

const DriverModal = ({ driver, schedules, show, onClose, isLoadingSchedules = false }) => {
  if (!show || !driver) return null;
  
  // Debug: Log schedules to check barangay data
  useEffect(() => {
    if (show && schedules) {
      console.log('Schedules data:', schedules);
      console.log('First schedule barangay:', schedules[0]?.barangay);
    }
  }, [show, schedules]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isSchedulesLoading, setIsSchedulesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDriverEditModal, setShowDriverEditModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({});
  const [driverFormData, setDriverFormData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [driverProcessing, setDriverProcessing] = useState(false);
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

  // Sort and group schedules by month and date
  const { sortedAndGroupedSchedules, monthlySchedules } = useMemo(() => {
    const driverSchedules = schedules.filter(schedule => 
      schedule.driver_id === driver.id
    );

    // Sort schedules by date (earliest first) and then by time
    const sortedSchedules = [...driverSchedules].sort((a, b) => {
      const dateA = new Date(a.collection_date);
      const dateB = new Date(b.collection_date);
      
      // First compare by date
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      // If same date, compare by time
      const timeA = a.collection_time || '00:00';
      const timeB = b.collection_time || '00:00';
      return timeA.localeCompare(timeB);
    });

    // Group schedules by month-year for display purposes
    const groupedByMonth = sortedSchedules.reduce((acc, schedule) => {
      const date = new Date(schedule.collection_date);
      const monthYear = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(schedule);
      return acc;
    }, {});

    // Convert to array format for easier rendering
    const monthlySchedulesArray = Object.entries(groupedByMonth).map(([monthYear, schedules]) => ({
      monthYear,
      schedules
    }));

    // Sort months chronologically (earliest first)
    monthlySchedulesArray.sort((a, b) => {
      const dateA = new Date(a.monthYear);
      const dateB = new Date(b.monthYear);
      return dateA.getTime() - dateB.getTime();
    });

    return {
      sortedAndGroupedSchedules: sortedSchedules,
      monthlySchedules: monthlySchedulesArray
    };
  }, [schedules, driver.id]);

  const totalPages = Math.ceil(sortedAndGroupedSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSchedules = sortedAndGroupedSchedules.slice(startIndex, startIndex + itemsPerPage);

  // Flatten monthly schedules for single table display
  const flattenedSchedulesWithMonths = useMemo(() => {
    const result = [];
    
    monthlySchedules.forEach(({ monthYear, schedules }) => {
      // Add month header
      result.push({ type: 'month-header', monthYear });
      // Add schedules for this month
      schedules.forEach(schedule => {
        result.push({ type: 'schedule', schedule });
      });
    });

    return result;
  }, [monthlySchedules]);

  // Get paginated items (including month headers)
  const paginatedItems = useMemo(() => {
    const allItems = flattenedSchedulesWithMonths;
    return allItems.slice(startIndex, startIndex + itemsPerPage);
  }, [flattenedSchedulesWithMonths, startIndex, itemsPerPage]);

  const scheduleFields = [
    {
      name: 'collection_date',
      label: 'Collection Date',
      type: 'date',
      required: true,
    },
    {
      name: 'collection_time',
      label: 'Collection Time',
      type: 'time',
      required: true,
    },
    {
      name: 'notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      rows: 3
    }
  ];

  const driverFields = [
    {
      name: 'status',
      label: 'Driver Status',
      type: 'select',
      required: true,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
        { value: 'onduty', label: 'On Duty' },
        { value: 'resigned', label: 'Resigned' }
      ]
    },
    {
      name: 'license_number',
      label: 'License Number',
      type: 'text',
      required: true,
      placeholder: 'Enter license number'
    }
  ];

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

  const getBarangayName = (schedule) => {
    if (!schedule) return 'N/A';
    
    // Try multiple ways to get barangay name
    if (schedule.barangay?.baranggay_name) {
      return schedule.barangay.baranggay_name;
    }
    if (schedule.baranggay_name) {
      return schedule.baranggay_name;
    }
    
    console.log('Could not find barangay name for schedule:', schedule);
    return 'N/A';
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    
    const editData = {
      collection_date: schedule.collection_date ? new Date(schedule.collection_date).toISOString().split('T')[0] : '',
      collection_time: schedule.collection_time || '',
      notes: schedule.notes || ''
    };
    
    setFormData(editData);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (formData) => {
    setProcessing(true);
    
    try {
      await router.patch(`/admin/driver/schedule/${editingSchedule.id}`, formData, {
        preserveScroll: true,
        onSuccess: () => {
          showAlert('success', 'Schedule updated successfully');
          setShowEditModal(false);
          setEditingSchedule(null);
          setFormData({});
          router.reload();
        },
        onError: (errors) => {
          console.log('Edit errors:', errors);
          showAlert('error', 'Failed to update schedule');
        },
        onFinish: () => {
          setProcessing(false);
        }
      });
    } catch (error) {
      console.error('Edit submission error:', error);
      setProcessing(false);
    }
  };

  const handleDriverEdit = () => {
    const editData = {
      status: driver.status || '',
      license_number: driver.license_number || ''
    };
    
    setDriverFormData(editData);
    setShowDriverEditModal(true);
  };

  const handleDriverEditSubmit = async (formData) => {
    setDriverProcessing(true);
    
    try {
      await router.patch(`/admin/drivers/${driver.id}`, formData, {
        preserveScroll: true,
        onSuccess: () => {
          showAlert('success', 'Driver updated successfully');
          setShowDriverEditModal(false);
          setDriverFormData({});
          router.reload();
        },
        onError: (errors) => {
          console.log('Driver edit errors:', errors);
          showAlert('error', 'Failed to update driver');
        },
        onFinish: () => {
          setDriverProcessing(false);
        }
      });
    } catch (error) {
      console.error('Driver edit submission error:', error);
      setDriverProcessing(false);
    }
  };

  const handleRemove = async (schedule) => {
    const confirmed = await confirmDialog(
      'Delete Schedule',
      `Are you sure you want to delete this schedule for ${schedule.barangay?.baranggay_name || schedule.baranggay_name || 'this barangay'}?`,
      'Delete'
    );

    if (confirmed) {
      router.delete(`/admin/driver/schedule/${schedule.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          showAlert('success', 'Schedule deleted successfully');
          router.reload();
        },
        onError: () => {
          showAlert('error', 'Failed to delete schedule');
        }
      });
    }
  };

  return (
    <>
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
                      src={getAvatarUrl(driver.user)} 
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
                <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    {driver.user?.name} {driver.user?.lastname}
                    <div className="relative group flex-shrink-0">
                      <span 
                        className={`w-2 h-2 rounded-full block
                          ${driver.status === 'onduty' ? 'bg-green-500' : 
                            driver.status === 'inactive' ? 'bg-red-500' : 
                            driver.status === 'pending' ? 'bg-yellow-500' : 
                            driver.status === 'active' ? 'bg-blue-500' : 
                            'bg-gray-500'}`}
                      >
                      </span>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                        {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </h3>
                  <p className="text-gray-600">{driver.user?.email}</p>
                </div>
                  <button
                    onClick={handleDriverEdit}
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    title="Edit Driver"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Driver
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">License Number</p>
                    <p className="font-medium">{driver.license_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{driver.user.phone_num || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Employment Date</p>
                    <p className="font-medium">{formatDate(driver.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium capitalize">{driver.status}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Scheduled Collection</h4>
                {!isSchedulesLoading && sortedAndGroupedSchedules.length > 0 && (
                  <span className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedAndGroupedSchedules.length)} of {sortedAndGroupedSchedules.length} schedules
                  </span>
                )}
              </div>
              
              {isSchedulesLoading || isLoadingSchedules ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <RingLoader 
                    color="#00de08" 
                    size={50}
                    loading={true}
                  />
                  <p className="mt-2 text-gray-600">Loading schedules...</p>
                </div>
              ) : sortedAndGroupedSchedules.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Barangay
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
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedItems.map((item, index) => {
                          if (item.type === 'month-header') {
                            return (
                              <tr key={`month-${item.monthYear}`} className="bg-gray-50">
                                <td colSpan="7" className="px-6 py-3">
                                  <h5 className="font-semibold text-gray-900 text-sm">
                                    {item.monthYear}
                                  </h5>
                                </td>
                              </tr>
                            );
                          } else {
                            const schedule = item.schedule;
                            return (
                              <tr key={schedule.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {formatDate(schedule.collection_date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {getBarangayName(schedule)}
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
                                    schedule.status === 'failed' ? 'bg-red-100 text-red-800' : 
                                    schedule.status === 'progress' ? 'bg-yellow-100 text-yellow-800' :
                                    schedule.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                    {schedule.status?.charAt(0)?.toUpperCase() + schedule.status?.slice(1)?.replace('_', ' ') || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                  {schedule.notes || 'None'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleEdit(schedule)}
                                      className="text-blue-600 hover:text-blue-900 transition-colors"
                                      title="Edit Schedule"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>

                                    <button
                                      onClick={() => handleRemove(schedule)}
                                      className="text-red-600 hover:text-red-900 transition-colors"
                                      title="Remove Schedule"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        })}
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

      <FormModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingSchedule(null);
          setFormData({});
        }}
        title="Edit Schedule"
        initialData={editingSchedule}
        onSubmit={handleEditSubmit}
        fields={scheduleFields}
        submitText={processing ? 'Updating...' : 'Update Schedule'}
        processing={processing}
        formData={formData}
        onFormChange={setFormData}
      />

      <FormModal
        show={showDriverEditModal}
        onClose={() => {
          setShowDriverEditModal(false);
          setDriverFormData({});
        }}
        title="Edit Driver"
        initialData={driver}
        onSubmit={handleDriverEditSubmit}
        fields={driverFields}
        submitText={driverProcessing ? 'Updating...' : 'Update Driver'}
        processing={driverProcessing}
        formData={driverFormData}
        onFormChange={setDriverFormData}
      />
    </>
  );
};

export default DriverModal;