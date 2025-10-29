// File: Resident.jsx (Resident Map Tracking Component)
import { useRef, useEffect } from 'react';
import { useResidentMap } from './useResidentMap';
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle,
  Truck,
  Activity,
  TrendingUp
} from 'lucide-react';

const Resident = ({ mapboxKey, barangayId }) => {
  const {
    mapContainer,
    currentSchedule,
    driverLocation,
    siteLocations,
    loading,
    isOnline,
    mapInitialized
  } = useResidentMap({ mapboxKey, barangayId });

  const getScheduleStatus = (schedule) => {
    if (!schedule) return { text: 'No schedule', color: 'text-gray-600', bg: 'bg-gray-100' };
    
    const statusConfig = {
      in_progress: { text: 'Collection in Progress', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
      completed: { text: 'Collection Completed', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
      scheduled: { text: 'Scheduled', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
      default: { text: 'Pending', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
    };
    
    return statusConfig[schedule.status] || statusConfig.default;
  };

  const getCompletedSites = () => {
    return siteLocations.filter(site => site.status === 'completed').length;
  };

  const getProgressPercentage = () => {
    if (siteLocations.length === 0) return 0;
    return Math.round((getCompletedSites() / siteLocations.length) * 100);
  };

  if (loading) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading collection map</p>
          <p className="text-sm text-gray-500 mt-1">Preparing tracking data...</p>
        </div>
      </div>
    );
  }

  const status = getScheduleStatus(currentSchedule);

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Live Collection Tracker
              </h2>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Barangay {barangayId}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {!isOnline && (
              <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-lg border border-amber-200">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Offline Mode</span>
              </div>
            )}
            
            {currentSchedule && (
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold border ${status.bg} ${status.color} ${status.border}`}>
                {status.text}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Info Cards */}
        {currentSchedule && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Scheduled Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {currentSchedule.scheduled_date ? 
                      new Date(currentSchedule.scheduled_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 
                      'Not scheduled'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Activity className={`w-5 h-5 ${driverLocation ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Driver Status</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {driverLocation ? 'En Route' : 'Not Tracking'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Progress</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {getCompletedSites()} / {siteLocations.length} Sites
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative w-full h-96 md:h-[500px]">
        {!mapInitialized && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium text-gray-700">Initializing map</p>
              <p className="text-xs text-gray-500 mt-1">Please wait...</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0"
        />
        
        {/* Enhanced Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-bold text-gray-900">Map Legend</p>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-blue-600 rounded-full shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Driver Location</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Collection Site</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              <span className="text-xs font-medium text-gray-700">Completed Site</span>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        {isOnline && (
          <button className="absolute top-4 right-4 bg-white hover:bg-gray-50 p-3 rounded-xl shadow-lg border border-gray-200 transition-all hover:shadow-xl">
            <RefreshCw className="w-5 h-5 text-gray-700" />
          </button>
        )}
      </div>

      {/* Enhanced Progress Bar */}
      {siteLocations.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-900">Collection Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{getProgressPercentage()}%</span>
              <span className="text-sm text-gray-500">complete</span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-inner"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>{getCompletedSites()} sites completed</span>
            <span>{siteLocations.length - getCompletedSites()} remaining</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resident;