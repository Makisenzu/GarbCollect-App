import React from 'react';
import DriverCard from './DriverCard';

const DriverList = ({ drivers, activeFilter }) => {
  const filteredDrivers = activeFilter === 'all' 
    ? drivers 
    : drivers.filter(driver => driver.status === activeFilter);

  return (
    <div className="space-y-6">
      {filteredDrivers.map(driver => (
        <DriverCard 
          key={driver.id} 
          driver={driver} 
          isActive={driver.status === 'on duty' || driver.status === 'active'}
        />
      ))}
    </div>
  );
};

export default DriverList;