import React from 'react';
import DriverCard from './DriverCard';

const DriverList = ({ drivers, schedules = [], activeFilter = 'all' }) => {
  let driversArray = [];
  
  if (Array.isArray(drivers)) {
    driversArray = drivers;
  } else if (drivers && drivers.data && Array.isArray(drivers.data)) {
    driversArray = drivers.data;
  }
  
  const filteredDrivers = activeFilter === 'all' 
    ? driversArray 
    : driversArray.filter(driver => driver && driver.status === activeFilter);

  if (filteredDrivers.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {driversArray.length === 0 ? 'No drivers found' : 'No drivers match the selected filter'}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {driversArray.length === 0 ? 'Get started by adding a new driver.' : 'Try selecting a different filter.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredDrivers.map(driver => (
        <DriverCard 
          key={driver.id} 
          driver={driver} 
          schedule={schedules.filter(s => s.driver_id === driver.id)} 
          isActive={driver.status === 'onduty' || driver.status === 'active'}
        />
      ))}
    </div>
  );
};

export default DriverList;