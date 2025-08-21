// components/CollectionSchedules.jsx
import React from 'react';

const CollectionSchedules = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
      <h3 className="text-xl font-bold text-green-700 mb-4">Collection Schedules</h3>
      <p className="text-gray-600 mb-4">
        View your garbage collection schedule and get reminders for pickup days. Never miss a collection again.
      </p>
      <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300">
        View Schedule
      </button>
    </div>
  );
};

export default CollectionSchedules;