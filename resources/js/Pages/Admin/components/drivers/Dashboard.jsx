import React, { useEffect, useState } from 'react';
import Header from '@/Pages/Admin/components/drivers/Header';
import DriverFilter from '@/Pages/Admin/components/drivers/DriverFilter';
import DriverList from '@/Pages/Admin/components/drivers/DriverList';
import StatCard from '@/Pages/Admin/components/drivers/StatCard';
import Pagination from '@/Components/Pagination';
import FormModal from '@/Components/FormModal';
import ScheduleTable from './ScheduleTable';
import { MdOutlineDateRange, MdSearch } from "react-icons/md";
import { showAlert, confirmDialog } from '@/SweetAlert'
import { usePage, useForm, router } from '@inertiajs/react';

const Dashboard = () => {
  const { drivers, schedules, users, stats, barangays } = usePage().props;
  
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [showAddDriverModal, setShowAddDriverModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeTab, setActiveTab] = useState('drivers');

  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: '',
    license_number: '',
    status: 'active',
    current_latitude: null,
    current_longitude: null
  });

  const driverFields = [
    {
      name: 'user_id',
      label: 'Applicant',
      type: 'select',
      required: true,
      options: users && users.length > 0 
        ? users.map(user => ({
            value: user.id,
            label: `${user.name || ''} ${user.lastname || ''} - ${user.email || ''}`
          }))
        : [],
    },
    {
      name: 'license_number',
      label: 'License Number',
      type: 'text',
      required: true,
      placeholder: 'Enter license number'
    },
    {
      name: 'assigned_barangay',
      label: 'Assigned Barangay',
      type: 'select',
      required: true,
      options: barangays && barangays.length > 0 
        ? barangays.map(barangay => ({
            value: barangay.id,
            label: barangay.baranggay_name
          }))
        : [{ value: '', label: 'No barangays available' }],
      placeholder: 'Select a barangay'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: "active", label: 'Active' },
        { value: "inactive", label: 'Inactive' },
        { value: "pending", label: 'Pending' },
        { value: "onduty", label: 'On Duty' },
        { value: "resigned", label: 'Resigned' }
      ]
    }
  ];

  const handleAddDriverSubmit = (formData) => {
    post('/admin/Driver/add', {
      data: formData,
      preserveScroll: true,
      onSuccess: (page) => {
        console.log('Success response:', page);
        showAlert('success', 'Added Successfully')
        setShowAddDriverModal(false);
        reset();
        router.reload();
      },
      onError: (errors) => {
        console.log('Errors:', errors);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {stats && Array.isArray(stats) && stats.map((stat, index) => (
            <StatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
            />
          ))}
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('drivers')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'drivers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Drivers Management
              </button>
              <button
                onClick={() => setActiveTab('schedules')}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Collection Schedules
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'drivers' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Active Drivers</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage driver schedules and assignments</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
                <div className="flex items-center gap-2 flex-wrap">
                  <button 
                    onClick={() => setShowAddDriverModal(true)} 
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 sm:px-4 rounded-md transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="hidden sm:inline">Add Driver</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                  
                  <div className="flex-shrink-0">
                    <DriverFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
                  </div>
                </div>
              </div>
            </div>

            <DriverList 
              drivers={drivers} 
              schedules={schedules} 
              activeFilter={activeFilter} 
              searchQuery={searchQuery}
            />
            
            {drivers && drivers.links && (
              <div className="mt-4 sm:mt-6">
                <Pagination links={drivers.links} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedules' && (
          <ScheduleTable 
            drivers={drivers.data || drivers} 
            barangays={barangays} 
            schedules={schedules}
          />
        )}

        <FormModal
          show={showAddDriverModal}
          onClose={() => setShowAddDriverModal(false)}
          title="Add New Driver"
          fields={driverFields}
          onSubmit={handleAddDriverSubmit}
          submitText={processing ? 'Adding...' : 'Add Driver'}
          processing={processing}
          errors={errors}
          formData={data}
          onFormChange={setData}
        />
      </div>
    </div>
  );
};

export default Dashboard;