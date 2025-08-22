import React from 'react';

const StatCard = ({ title, value, description, change }) => {
  const changeColor = change.includes('+') ? 'text-green-600' : change.includes('-') ? 'text-red-600' : 'text-gray-600';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-600 mb-1">{description}</p>
      <p className={`text-xs ${changeColor}`}>{change}</p>
    </div>
  );
};

export default StatCard;