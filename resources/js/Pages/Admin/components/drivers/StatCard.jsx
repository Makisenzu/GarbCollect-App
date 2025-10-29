import React from 'react';

const StatCard = ({ title, value, description }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
};

export default StatCard;