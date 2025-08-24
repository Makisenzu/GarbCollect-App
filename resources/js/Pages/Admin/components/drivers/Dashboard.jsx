import React, { useState, useEffect } from 'react';
import Header from '@/Pages/Admin/components/drivers/Header';
import DriverFilter from '@/Pages/Admin/components/drivers/DriverFilter';
import DriverList from '@/Pages/Admin/components/drivers/DriverList';
import StatCard from '@/Pages/Admin/components/drivers/StatCard';
import FormModal from '@/Components/FormModal';
import { stats } from '@/Pages/Admin/components/drivers/driverdata';
import { showAlert, confirmDialog } from '@/SweetAlert';
import axios from 'axios';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [addDriverProcessing, setAddDriverProcessing] = useState(false);

  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
      fetchUsers();
      fetchDrivers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await axios.get('/getUsers');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      showAlert('error', 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDrivers = async () => {
    setLoadingDrivers(true);
    try {
       const response = await axios.get('/getDrivers');
       setDrivers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch drivers');
      showAlert('error', 'Faied to load drivers');
    } finally {
      setLoadingDrivers(false);
    }
  }

  const driverFields = [
    {
      name: 'user_id',
      label: 'Applicant',
      type: 'select',
      required: true,
      options: users.map(user => ({
        value: user.id,
        label: `${user.name} ${user.lastname}
               - ${user.email}`
      })),
    },
    {
      name: 'license_number',
      label: 'License Number',
      type: 'text',
      required: true,
      placeholder: 'Enter license number'
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

  const handleAddDriverSubmit = async (formData) => {
    setAddDriverProcessing(true);
    try {
      const payload = {
        ...formData,
      };

      const response = await axios.post('/admin/Driver/add', payload);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Add failed');
      }
      showAlert('success', "Driver added successfully");
      setShowAddDriverModal(false);
    } catch (error) {
      console.error('Error adding driver', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add driver';
      showAlert('error', errorMessage);
    } finally {
      setAddDriverProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              change={stat.change}
            />
          ))}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Active Drivers</h2>
              <p className="text-sm text-gray-600 mt-1">Manage driver schedules and barangay assignments</p>
            </div>
            
            <div className="flex items-center mt-3 sm:mt-0 space-x-2">
            <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search drivers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-56 text-sm"
            />
          </div>
              <button 
                onClick={() => setShowAddDriverModal(true)} 
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Driver
              </button>
              <DriverFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </div>
          </div>

          <DriverList drivers={drivers} activeFilter={activeFilter} />
        </div>

          <FormModal
            show={showAddDriverModal}
            onClose={() => setShowAddDriverModal(false)}
            title="Add New Driver"
            fields={driverFields}
            onSubmit={handleAddDriverSubmit}
            submitText={addDriverProcessing ? 'Adding...' : 'Add Driver'}
            processing={addDriverProcessing || loadingUsers}
          />
      </div>
    </div>
  );
};

export default Dashboard;