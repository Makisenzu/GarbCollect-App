import React from 'react';
import DriverCard from './DriverCard';

const DriverList = ({ drivers = [], schedules = [],activeFilter = all }) => {
  const filteredDrivers = activeFilter === 'all' 
    ? drivers 
    : drivers.filter(driver => driver && driver.status === activeFilter);

    if (!drivers || drivers.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No drivers found</p>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map(driver => {
          const driverSchedule = schedules.find(
            s => s.driver_id === driver.id
          );
  
          return (
            driver && (
<DriverCard 
  key={driver.id} 
  driver={driver} 
  schedule={schedules.filter(s => s.driver_id === driver.id)} 
  isActive={driver.status === 'onduty' || driver.status === 'active'}
/>

            )
          );
        })}
      </div>
    );
};

export default DriverList;