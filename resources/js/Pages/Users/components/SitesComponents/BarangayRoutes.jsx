import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import useBarangayMap from './useBarangayMap';

const BarangayRoutes = ({ mapboxToken }) => {
  const { 
    mapContainer, 
    loading, 
    error, 
    renderBarangaySelect,
    renderSitesInfo,
    selectedBarangay,
    activeSites,
    loadingSites,
    routeInfo,
    nearestSite
  } = useBarangayMap(mapboxToken);
  
  const [formData, setFormData] = useState({
    barangay_id: ''
  });

  const setData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Map Error</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors duration-200"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title={'San Francisco Map'} />

      <div className="w-full h-screen relative bg-gray-100">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        
        <Link
          href="/"
          className="absolute top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
          title="Back to Dashboard"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>

        {/* Barangay Select Container - Responsive */}
        <div className="absolute top-4 md:left-20 left-4 right-4 md:right-auto z-40 bg-white rounded-lg shadow-lg p-3 md:p-4 md:min-w-64 max-w-md">
          <label htmlFor="barangay_id" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            Select Barangay
          </label>
          {renderBarangaySelect(formData, setData)}
          
          {/* Selection Info */}
          {selectedBarangay && (
            <div className="mt-2 md:mt-3 space-y-2">
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs text-blue-800">
                  {loadingSites ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                      Loading sites...
                    </span>
                  ) : (
                    `${activeSites.length} site${activeSites.length !== 1 ? 's' : ''}`
                  )}
                </div>
              </div>
              
              {/* Route Information */}
              {routeInfo && (
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <div className="text-xs text-green-800 space-y-1">
                    <div className="font-semibold">Route Information:</div>
                    <div><strong>Duration:</strong> {routeInfo.formattedDuration}</div>
                    <div><strong>Distance:</strong> {routeInfo.distance} km</div>
                    {nearestSite && (
                      <div><strong>Nearest Site:</strong> {nearestSite.purok?.purok_name}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0"
        />
      </div>
    </>
  );
};

export default BarangayRoutes;