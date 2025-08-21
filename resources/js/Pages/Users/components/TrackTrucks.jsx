// components/TrackTrucks.jsx
import React from 'react';

const TrackTrucks = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300">
      <h3 className="text-xl font-bold text-green-700 mb-4">Track Trucks</h3>
      <p className="text-gray-600 mb-4">
        See real-time locations of collection trucks and estimated arrival times for your area.
      </p>
      <button className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300">
        Track Now
      </button>
    </div>
  );
};

export default TrackTrucks;