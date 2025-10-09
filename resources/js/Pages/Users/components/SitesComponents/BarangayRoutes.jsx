import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { IoClose, IoSearch, IoNavigate, IoSparkles, IoLocation, IoTime, IoStatsChart, IoMenu } from "react-icons/io5";
import { useBarangayMap } from './useBarangayMap';

const BarangayRoutes = ({ mapboxToken }) => {
  const {
    mapContainer,
    mapLoaded,
    loading,
    barangayLoading,
    sitesLoading,
    error,
    barangays,
    selectedBarangay,
    isMobile,
    activeSchedule,
    sites,
    routeInfo,
    aiOptimizedRoute,
    nearestSite,
    currentLocation,
    handleBarangayChange,
    getCurrentLocation,
    formatDuration,
  } = useBarangayMap(mapboxToken);

  const [showBarangayModal, setShowBarangayModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleBarangayChangeWithUI = async (barangayId) => {
    setShowAIPanel(false);
    if (isMobile) {
      setShowBarangayModal(false);
    }
    await handleBarangayChange(barangayId);
  };

  // Close panels when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showControls && !event.target.closest('.controls-container')) {
        setShowControls(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showControls]);

  // Minimal Header Info
  const renderHeaderInfo = () => {
    if (!selectedBarangay) return null;

    const selectedBarangayData = barangays.find(b => b.id == selectedBarangay);
    
    return (
      <div className={`absolute top-4 left-4 right-4 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 ${
        isMobile ? 'mx-4' : 'max-w-sm'
      }`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 text-lg mb-1">
                {selectedBarangayData?.baranggay_name}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <IoLocation className="w-4 h-4" />
                  {sitesLoading ? '...' : `${sites.length} sites`}
                </span>
                {routeInfo && (
                  <span className="flex items-center gap-1">
                    <IoTime className="w-4 h-4" />
                    {routeInfo.formattedDuration}
                  </span>
                )}
              </div>
            </div>
            {aiOptimizedRoute && (
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full text-white transition-colors ml-2"
              >
                <IoSparkles className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {activeSchedule.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <IoTime className="w-3 h-3" />
                Collection: {activeSchedule[0]?.collection_time || 'No schedule'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Minimal AI Panel
  const renderAIPanel = () => {
    if (!aiOptimizedRoute || !showAIPanel) return null;

    return (
      <div className={`absolute z-40 bg-white rounded-2xl shadow-xl border border-gray-200 ${
        isMobile ? 
          'bottom-4 left-4 right-4 max-h-80 overflow-y-auto' : 
          'top-32 left-4 w-72 max-h-80 overflow-y-auto'
      }`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white">
                <IoSparkles className="w-3 h-3" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Optimized Route</h3>
                <p className="text-gray-500 text-xs">AI-powered path</p>
              </div>
            </div>
            <button
              onClick={() => setShowAIPanel(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IoClose className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Duration</p>
              <p className="font-semibold text-gray-900">{aiOptimizedRoute.formattedDuration}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-1">Distance</p>
              <p className="font-semibold text-gray-900">{aiOptimizedRoute.distance} km</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs text-blue-800 font-medium mb-1">💡 Recommendation</p>
            <p className="text-sm text-blue-900 leading-tight">
              {aiOptimizedRoute.recommendation.text}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-2">Route Summary</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">First Stop:</span>
                <span className="font-medium text-gray-900">{aiOptimizedRoute.nearestSite.site_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Stops:</span>
                <span className="font-medium text-gray-900">{aiOptimizedRoute.optimizedOrder.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Desktop Controls - Minimal
  const renderDesktopControls = () => {
    if (isMobile) return null;

    return (
      <div className="absolute top-4 right-4 z-30 controls-container">
        {/* Main Control Button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-xl shadow-lg border border-gray-200 transition-all duration-200"
        >
          <IoMenu className="w-5 h-5" />
        </button>

        {/* Controls Panel */}
        {showControls && (
          <div className="absolute top-14 right-0 bg-white rounded-xl shadow-xl border border-gray-200 w-64">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Route Controls</h3>
            </div>
            
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Barangay
                </label>
                <select
                  value={selectedBarangay}
                  onChange={(e) => handleBarangayChangeWithUI(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={barangayLoading}
                >
                  <option value="">Choose barangay...</option>
                  {barangays.map(barangay => (
                    <option key={barangay.id} value={barangay.id}>
                      {barangay.baranggay_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={getCurrentLocation}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <IoNavigate className="w-4 h-4" />
                My Location
              </button>

              {selectedBarangay && sitesLoading && (
                <div className="text-center py-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-1">Loading routes...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Mobile Controls - Minimal
  const renderMobileControls = () => {
    if (!isMobile) return null;

    return (
      <div className="absolute bottom-4 right-4 z-40 flex flex-col space-y-3">
        {/* Barangay Selector */}
        <button
          onClick={() => setShowBarangayModal(true)}
          className="bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-full shadow-lg border border-gray-200 transition-all duration-200"
        >
          <IoSearch className="w-5 h-5" />
        </button>

        {/* Location Button */}
        <button
          onClick={getCurrentLocation}
          className="bg-white hover:bg-gray-50 text-gray-700 p-4 rounded-full shadow-lg border border-gray-200 transition-all duration-200"
        >
          <IoNavigate className="w-5 h-5" />
        </button>
      </div>
    );
  };

  // Mobile Modal - Minimal
  const renderBarangayModal = () => {
    if (!isMobile || !showBarangayModal) return null;

    return (
      <>
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setShowBarangayModal(false)}
        />
        
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-hidden">
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="px-5 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Select Barangay</h3>
              <button
                onClick={() => setShowBarangayModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <IoClose className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto">
            <div className="mb-4">
              <select
                value={selectedBarangay}
                onChange={(e) => handleBarangayChangeWithUI(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={barangayLoading}
              >
                <option value="">Choose a barangay...</option>
                {barangays.map(barangay => (
                  <option key={barangay.id} value={barangay.id}>
                    {barangay.baranggay_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedBarangay && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    <IoLocation className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {barangays.find(b => b.id == selectedBarangay)?.baranggay_name}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {sitesLoading ? 'Loading sites...' : `${sites.length} collection sites`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowBarangayModal(false)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl text-base font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </>
    );
  };

  // Error State - Minimal
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-sm mx-4 border border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <IoClose className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Map Error</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title="Waste Collection Routes" />

      <div className="w-full h-screen relative bg-gray-50">
        {/* Loading Overlay - Only shows when loading, doesn't block map container */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 text-sm mt-3">Loading map...</p>
            </div>
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/"
          className={`absolute z-40 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-lg border border-gray-200 flex items-center space-x-2 transition-colors ${
            isMobile ? 'top-4 left-4' : 'top-4 left-4'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </Link>

        {renderHeaderInfo()}
        {renderAIPanel()}
        {renderDesktopControls()}
        {renderMobileControls()}
        {renderBarangayModal()}

        {/* Map Container - ALWAYS VISIBLE */}
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0"
        />
      </div>
    </>
  );
};

export default BarangayRoutes;