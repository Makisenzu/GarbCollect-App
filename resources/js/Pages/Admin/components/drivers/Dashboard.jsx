import React, { useState } from 'react';
import Header from '@/Pages/Admin/components/drivers/Header';
import DriverFilter from '@/Pages/Admin/components/drivers/DriverFilter';
import DriverList from '@/Pages/Admin/components/drivers/DriverList';
import StatCard from '@/Pages/Admin/components/drivers/StatCard';
import { drivers, stats } from '@/Pages/Admin/components/drivers/driverdata';
import { showAlert,  confirmDialog } from '@/SweetAlert'
import axios from 'axios';


const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [addDriverProcessing, setAddDriverProcessing] = useState(false);

  const handleAddDriverSubmit = async (formData) => {
    setAddDriverProcessing(true);
    try {
      const payload = {
        ...formData
      };

      const response = await axios.post('/link', payload);
      if(response.data.success) {
        showAlert('success', "added successfully");
        setShowAddDriverModal(false);
      } else {
        throw new Error(response.data.message || 'Add failed');
      }
    } catch (error) {
      console.error('Error adding driver', error);
      throw error;
    } finally {
      setAddDriverProcessing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        {/* Stats cards row */}
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
      <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
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
      </div>
    </div>
  );
};

export default Dashboard;