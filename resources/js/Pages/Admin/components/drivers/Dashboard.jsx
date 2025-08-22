import React, { useState } from 'react';
import Header from '@/Pages/Admin/components/drivers/Header';
import DriverFilter from '@/Pages/Admin/components/drivers/DriverFilter';
import DriverList from '@/Pages/Admin/components/drivers/DriverList';
import StatCard from '@/Pages/Admin/components/drivers/StatCard';
import { drivers, stats } from '@/Pages/Admin/components/drivers/driverdata';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                change={stat.change}
              />
            ))}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Active Drivers</h2>
              
              <DriverFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
              <DriverList drivers={drivers} activeFilter={activeFilter} />
            </div>
          </div>
          
          <div className="space-y-6">
            {/* {stats.map((stat, index) => (
              <StatCard 
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                change={stat.change}
              />
            ))} */}
            
           {/* <div className="bg-white rounded-lg shadow-md p-6">
              <h3 h3 className="font-semibold mb-4">2 On-Duty Filter</h3>
              <div className="space-y-4">
                {drivers.filter(driver => driver.status === 'active' || driver.status === 'on duty').map(driver => (
                  <div key={driver.id} className="flex items-start">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">
                      {driver.initials}
                    </div>
                    <div>
                      <h4 className="font-medium">{driver.name} <span className="text-green-600 text-sm">{driver.status}</span></h4>
                      <p className="text-sm text-gray-600">{driver.email}</p>
                      <p className="text-sm text-gray-600">{driver.phone}</p>
                      <p className="text-sm text-gray-600">{driver.barangay}</p>
                      <p className="text-sm text-gray-600">{driver.schedule}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;