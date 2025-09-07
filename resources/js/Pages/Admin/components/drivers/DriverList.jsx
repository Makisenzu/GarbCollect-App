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
      <div className="text-center py-8">
        <p className="text-gray-500">
          {driversArray.length === 0 ? 'No drivers found' : 'No drivers match the selected filter'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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