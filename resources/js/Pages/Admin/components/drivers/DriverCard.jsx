import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import DriverModal from '@/Components/DriverModal';
import { showAlert, confirmDialog } from '@/SweetAlert';
import { router } from '@inertiajs/react';

const DriverCard = ({ driver, schedule, isActive }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const [barangays, setBarangays] = useState([]);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [openBarangayModal, setOpenBarangayModal] = useState(false);

  const [formData, setFormData] = useState({});
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchBarangayData = async () => {
      setBarangayLoading(true);
      try {
        const response = await axios.get(`/admin/getBarangay/1`);
        setBarangays(response.data.barangay_data || []);
      } catch (error) {
        console.error('Error fetching barangays: ', error);
      } finally {
        setBarangayLoading(false);
      }
    };
    fetchBarangayData();
  }, []);

  const now = new Date();
  const formattedDate = now.toISOString().split("T")[0];
  const formattedTime = now.toTimeString().slice(0, 5);

  const barangayFields = [
    {
      name: "driver_id",
      type: "hidden",
      value: driver.id,
      disabled: true,
    },
    {
      name: "barangay_id",
      label: "Barangay",
      type: "select",
      required: true,
      options:
        barangays && barangays.length > 0
          ? barangays.map((barangay) => ({
              value: barangay.id,
              label: barangay.baranggay_name,
            }))
          : [],
    },
    {
      name: "collection_date",
      label: "Date",
      type: "date",
      value: formattedDate,
      min: formattedDate,
      required: true,
    },
    {
      name: "collection_time",
      label: "Time",
      type: "time",
      value: formattedTime,
      required: true,
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      required: true,
      value: "active",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "In-active" },
      ],
    },
    {
      name: "notes",
      label: "Additional note",
      type: "text",
      required: false,
    },
  ];

  const handleFormSubmit = async (data) => {
    setProcessing(true);
    try {
      await axios.post(`/admin/driver/assign`, data);
      showAlert('success', 'Driver assigned');
      router.reload({ only: ['drivers', 'schedules'] });
      setOpenBarangayModal(false);
    } catch (error) {
      console.error('Failed to assign barangay:', error);
      if (error.response) {
        if (error.response.data.errors) {
          const firstError = Object.values(error.response.data.errors)[0][0];
          showAlert('error', firstError);
        } else if (error.response.data.message) {
          showAlert('error', error.response.data.message);
        } else {
          showAlert('error', 'Something went wrong');
        }
      } else {
        showAlert('error', error.message || 'Network error');
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteDriver = async (driverId) => {
    const confirmed = await confirmDialog(
      'Are you sure?',
      'This action will permanently remove the driver. This cannot be undone.'
    );
  
    if(!confirmed) return;
  
    try {
      const response = await axios.delete(`/delete/driver/${driverId}`);
      
      if (response.data.success) {
        showAlert('success', response.data.message);
        router.reload({ only: ['drivers', 'stats', 'users'] });
      } else {
        showAlert('error', response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        showAlert('error', error.response.data.message);
      } else if (error.response?.data?.message) {
        showAlert('error', error.response.data.message);
      } else {
        showAlert('error', 'Failed to remove driver');
      }
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusColor = () => {
    if (!isActive) {
      return 'bg-gray-500';
    }
    
    switch (driver.status) {
      case 'on duty':
      case 'onduty':
        return 'bg-green-500';
      case 'active':
        return 'bg-blue-500';
      case 'inactive':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'resigned':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    if (!isActive) {
      return 'Off Duty';
    }
    
    switch (driver.status) {
      case 'on duty':
      case 'onduty':
        return 'On Duty';
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      case 'resigned':
        return 'Resigned';
      default:
        return driver.status ? 
          driver.status.charAt(0).toUpperCase() + driver.status.slice(1) : 
          'Unknown';
    }
  };

  const statusText = getStatusText();
  const statusColor = getStatusColor();

  const getInitialsFromName = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  const hasSchedule = schedule && schedule.some(
    (s) => s.driver_id === driver.id
  );
  
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {driver.user.picture ? (
              <img
                src={`/storage/profile-pictures/${driver.user.picture}`}
                alt={driver.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitialsFromName(driver.user.name, driver.user.lastname)}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {driver.user.name} {driver.user.lastname}
                <span 
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`}
                  title={statusText}
                >
                </span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">{driver.user.email}</p>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
                <ul className="py-1 text-sm text-gray-700">
                  <li>
                    <button
                      onClick={() => setShowDriverModal(true)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      View Details
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleDeleteDriver(driver.id)}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Remove
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setOpenBarangayModal(true)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
          >
            {hasSchedule ? "Set another schedule" : "Schedule"}
          </button>
        </div>
      </div>

      <FormModal
        show={openBarangayModal}
        onClose={() => setOpenBarangayModal(false)}
        title={`Assign Schedule to ${driver.user.name}`}
        fields={barangayFields}
        initialData={{ driver_id: driver.id }}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleFormSubmit}
        submitText="Assign"
        processing={processing}
      />
      
      <DriverModal 
        driver={driver}
        schedules={schedule}
        show={showDriverModal}
        onClose={() => setShowDriverModal(false)}
      />
    </>
  );
};

export default DriverCard;