import React from 'react';
import DriverCard from './DriverCard';

const DriverList = ({ drivers, activeFilter }) => {
  const filteredDrivers = activeFilter === 'all' 
    ? drivers 
    : drivers.filter(driver => driver.status === activeFilter);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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