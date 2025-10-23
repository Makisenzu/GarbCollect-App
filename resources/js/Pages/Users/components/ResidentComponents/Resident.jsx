import { useRef, useEffect } from 'react';
import { useResidentMap } from './useResidentMap';
import { IoCar, IoTime, IoCheckmarkCircle, IoRefresh, IoWarning } from "react-icons/io5";

const Resident = ({ mapboxKey, barangayId }) => {
  const {
    mapContainer,
    currentSchedule,
    driverLocation,
    siteLocations,
    loading,
    isOnline,
    mapInitialized
  } = useResident({ mapboxKey, barangayId });

  const getScheduleStatus = (schedule) => {
    if (!schedule) return 'No schedule';
    
    switch (schedule.status) {
      case 'in_progress':
        return { text: 'Collection in Progress', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'completed':
        return { text: 'Collection Completed', color: 'text-green-600', bg: 'bg-green-100' };
      case 'scheduled':
        return { text: 'Scheduled', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { text: 'Pending', color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getCompletedSites = () => {
    return siteLocations.filter(site => site.status === 'completed').length;
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600">Loading collection map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with schedule info */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Waste Collection Tracker
            </h2>
            <p className="text-sm text-gray-600">
              Real-time tracking for Barangay {barangayId}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {!isOnline && (
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <IoWarning className="w-4 h-4" />
                <span>Offline Mode</span>
              </div>
            )}
            
            {currentSchedule && (
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                getScheduleStatus(currentSchedule).bg
              } ${getScheduleStatus(currentSchedule).color}`}>
                {getScheduleStatus(currentSchedule).text}
              </div>
            )}
          </div>
        </div>

        {/* Schedule details */}
        {currentSchedule && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <IoTime className="w-4 h-4 text-gray-400" />
              <span>
                {currentSchedule.scheduled_date ? 
                  new Date(currentSchedule.scheduled_date).toLocaleDateString() : 
                  'Not scheduled'
                }
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <IoCar className="w-4 h-4 text-gray-400" />
              <span>
                {driverLocation ? 'Driver En Route' : 'Driver Not Tracking'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <IoCheckmarkCircle className="w-4 h-4 text-gray-400" />
              <span>
                {getCompletedSites()} of {siteLocations.length} sites completed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="relative w-full h-96 md:h-[500px]">
        {!mapInitialized && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0"
        />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Driver Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
              <span>Collection Site</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              <span>Completed Site</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {siteLocations.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Collection Progress</span>
            <span className="font-medium">
              {getCompletedSites()}/{siteLocations.length} sites
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(getCompletedSites() / siteLocations.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resident;