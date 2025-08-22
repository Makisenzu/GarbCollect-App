import React from 'react';

const DriverCard = ({ driver, isActive }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 ${isActive ? 'border-green-500' : 'border-gray-300'}`}>
      <div className="flex items-center mb-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
          {driver.initials}
        </div>
        <div>
          <h3 className="font-semibold">{driver.name} {isActive ? <span className="text-green-600 text-sm">active</span> : <span className="text-gray-500 text-sm">off duty</span>}</h3>
        </div>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p>{driver.email}</p>
        <p>{driver.phone}</p>
        <p>{driver.barangay}</p>
        <p>{driver.schedule}</p>
      </div>
      <div className="mt-4 pt-2 border-t border-gray-100">
        <h4 className="font-medium text-sm mb-1">Schedule</h4>
        <p className="text-sm text-gray-600">{driver.barangay}</p>
      </div>
    </div>
  );
};

export default DriverCard;