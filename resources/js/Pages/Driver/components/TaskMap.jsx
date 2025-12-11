import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GiControlTower } from "react-icons/gi";
import { IoClose, IoCheckmark, IoNavigate, IoSparkles, IoChevronDown, IoChevronUp, IoRefresh, IoPlay, IoStop, IoCodeSlash } from "react-icons/io5";
import axios from 'axios';
import can from "@/images/can.png";
import { useTaskMap } from './useTaskMap';
import CompletionReportModal from './CompletionReportModal';
import { getSiteDisplayName } from '@/Utils/siteHelpers';
import 'mapbox-gl/dist/mapbox-gl.css';

const TaskMap = forwardRef(({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel, autoGetLocation = false }, ref) => {
  const {
    mapContainer,
    siteMarkersRef,

    cssLoaded,
    siteLocations,
    stationLocation,
    mapInitialized,
    activeSchedule,
    routeCoordinates,
    loading,
    currentLocation,
    routeInfo,
    mapError,
    customStyleLoaded,
    aiOptimizedRoute,
    nearestSiteToStation,
    isMobile,
    showAIPanel,
    showControls,
    optimizedSiteOrder,
    isOnline,
    offlineMode,
    locationAccuracy,
    lastLocationUpdate,
    completedSites,
    currentSiteIndex,
    isTaskActive,
    isFakeLocationActive,
    showCompletionModal,
    setShowCompletionModal,
    
    formatDuration,
    getCurrentLocation,
    getAIOptimizedRoute,
    setShowAIPanel,
    setShowControls,
    startRealtimeLocationTracking,
    stopRealtimeLocationTracking,
    updateLocationManually,
    resetCompletedSites,
    markSiteAsCompleted,
    
    startTaskAndBroadcast,
    completeTaskAndBroadcast,
    sendLocationToReverb,

    // Fake location testing functions
    startFakeLocationTest,
    stopFakeLocationTest,
    sendTestLocation,
    simulateRouteFollowing,
  } = useTaskMap({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel });

  useImperativeHandle(ref, () => ({
    getCurrentLocation: () => {
      getCurrentLocation();
    },
    fitMapToRoute: () => {

    },
    startRealtimeLocationTracking: () => {
      startRealtimeLocationTracking();
    },
    stopRealtimeLocationTracking: () => {
      stopRealtimeLocationTracking();
    },
    updateLocationManually: (lat, lng) => {
      updateLocationManually(lat, lng);
    },
    resetCompletedSites: () => {
      resetCompletedSites();
    },
    markSiteAsCompleted: (siteId) => {
      const site = siteLocations.find(s => s.id === siteId);
      if (site) markSiteAsCompleted(site);
    },
    // NEW: Reverb methods
    startTaskAndBroadcast: () => {
      startTaskAndBroadcast();
    },
    completeTaskAndBroadcast: () => {
      completeTaskAndBroadcast();
    },
    // Fake location testing methods
    startFakeLocationTest: () => {
      startFakeLocationTest();
    },
    stopFakeLocationTest: () => {
      stopFakeLocationTest();
    },
    sendTestLocation: (lat, lng) => {
      sendTestLocation(lat, lng);
    },
    simulateRouteFollowing: () => {
      simulateRouteFollowing();
    }
  }));

  useEffect(() => {
    if (autoGetLocation && !currentLocation && !loading && mapInitialized) {
      getCurrentLocation();
    }
  }, [autoGetLocation, currentLocation, loading, mapInitialized]);

  // NEW: Handle task completion with broadcast
  const handleTaskComplete = () => {
    completeTaskAndBroadcast();
  };

  // NEW: Handle task start with broadcast
  const handleTaskStart = () => {
    startTaskAndBroadcast();
  };

  return (
    <div className="relative w-full h-full bg-white">
      {loading && <LoadingOverlay />}
      {!cssLoaded && !mapError && <MapLoadingOverlay />}
      
      {/* Offline Mode Banner */}
      {offlineMode && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-black px-4 py-2 z-50 flex items-center justify-center gap-2 shadow-lg">
          <IoClose className="w-5 h-5" />
          <span className="font-semibold text-sm">Offline Mode - Using cached map data</span>
        </div>
      )}

      {isMobile && (
        <MobileHeader 
          showControls={showControls}
          setShowControls={setShowControls}
          siteLocations={siteLocations}
          currentLocation={currentLocation}
          completedSites={completedSites}
          currentSiteIndex={currentSiteIndex}
          optimizedSiteOrder={optimizedSiteOrder}
          isTaskActive={isTaskActive}
          isFakeLocationActive={isFakeLocationActive}
        />
      )}

      {aiOptimizedRoute && (
        <AIOptimizationPanel 
          aiOptimizedRoute={aiOptimizedRoute}
          isMobile={isMobile}
          showAIPanel={showAIPanel}
          setShowAIPanel={setShowAIPanel}
          completedSites={completedSites}
          currentSiteIndex={currentSiteIndex}
          optimizedSiteOrder={optimizedSiteOrder}
        />
      )}

      <ControlButtons 
        isMobile={isMobile}
        showControls={showControls}
        getAIOptimizedRoute={getAIOptimizedRoute}
        getCurrentLocation={getCurrentLocation}
        onTaskComplete={handleTaskComplete}
        onTaskCancel={onTaskCancel}
        onTaskStart={handleTaskStart}
        scheduleId={scheduleId}
        currentLocation={currentLocation}
        completedSites={completedSites}
        resetCompletedSites={resetCompletedSites}
        activeSchedule={activeSchedule}
        isTaskActive={isTaskActive}
      />

      {/* Fake Location Test Panel - Only show in development */}
      {process.env.NODE_ENV === 'development' && (
        <FakeLocationTestPanel 
          startFakeLocationTest={startFakeLocationTest}
          stopFakeLocationTest={stopFakeLocationTest}
          sendTestLocation={sendTestLocation}
          simulateRouteFollowing={simulateRouteFollowing}
          isFakeLocationActive={isFakeLocationActive}
          isMobile={isMobile}
          routeCoordinates={routeCoordinates}
        />
      )}

      {activeSchedule && (
        <ScheduleInfoPanel 
          activeSchedule={activeSchedule}
          siteLocations={siteLocations}
          routeInfo={routeInfo}
          isMobile={isMobile}
          aiOptimizedRoute={aiOptimizedRoute}
          setShowAIPanel={setShowAIPanel}
          completedSites={completedSites}
          currentSiteIndex={currentSiteIndex}
          optimizedSiteOrder={optimizedSiteOrder}
          isTaskActive={isTaskActive}
          isFakeLocationActive={isFakeLocationActive}
        />
      )}
      
      <div 
        ref={mapContainer} 
        className="w-full h-full absolute inset-0"
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px'
        }}
      />

      {/* Completion Report Modal */}
      <CompletionReportModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        scheduleId={scheduleId}
        scheduleName={activeSchedule?.barangay_name || 'Collection Schedule'}
        onSubmitSuccess={() => {
          setShowCompletionModal(false);
          if (onTaskComplete) {
            onTaskComplete(null, true);
          }
        }}
      />
    </div>
  );
});

const LoadingOverlay = () => (
  <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-sm text-gray-600 font-medium">AI analyzing optimal route...</p>
      <p className="text-xs text-gray-500 mt-1">Finding fastest path to nearest site</p>
    </div>
  </div>
);

const ErrorOverlay = ({ error }) => (
  <div className="absolute inset-0 bg-white flex items-center justify-center z-50 p-4">
    <div className="text-center p-6 bg-white rounded-lg shadow-xl max-w-sm">
      <div className="text-red-500 text-lg font-semibold mb-2">Map Error</div>
      <div className="text-gray-600 mb-4 text-sm">{error}</div>
      <button 
        onClick={() => window.location.reload()}
        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
      >
        Retry
      </button>
    </div>
  </div>
);

const MapLoadingOverlay = () => (
  <div className="absolute inset-0 bg-white flex items-center justify-center z-40">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
      <p className="text-sm text-gray-600 font-medium">Loading map...</p>
    </div>
  </div>
);

const MobileHeader = ({ 
  showControls, 
  setShowControls, 
  siteLocations, 
  currentLocation, 
  completedSites,
  currentSiteIndex,
  optimizedSiteOrder,
  isTaskActive,
  isFakeLocationActive
}) => (
  <div className="absolute top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowControls(!showControls)}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          {showControls ? <IoChevronUp className="w-5 h-5" /> : <IoChevronDown className="w-5 h-5" />}
        </button>
        <div>
          <h1 className="font-semibold text-gray-900 text-sm">Collection Route</h1>
          <p className="text-xs text-gray-600">
            {completedSites.size}/{siteLocations.length} sites completed
          </p>
          {currentSiteIndex < optimizedSiteOrder.length && (
            <p className="text-xs text-blue-600 font-medium">
              Next: {getSiteDisplayName(optimizedSiteOrder[currentSiteIndex])}
            </p>
          )}
          {isTaskActive && (
            <p className="text-xs text-green-600 font-medium">
              🔴 Live - Broadcasting to residents
            </p>
          )}
          {isFakeLocationActive && (
            <p className="text-xs text-purple-600 font-medium">
              🧪 Fake Location Test Active
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {currentLocation && (
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        )}
        {completedSites.size > 0 && (
          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {completedSites.size} done
          </div>
        )}
        {isFakeLocationActive && (
          <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            Testing
          </div>
        )}
      </div>
    </div>
  </div>
);

const AIOptimizationPanel = ({ 
  aiOptimizedRoute, 
  isMobile, 
  showAIPanel, 
  setShowAIPanel,
  completedSites,
  currentSiteIndex,
  optimizedSiteOrder
}) => {
  if (isMobile) {
    return (
      <div className={`absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
        showAIPanel ? 'transform translate-y-0' : 'transform translate-y-full'
      }`}>
        <MobileAIPanel 
          aiOptimizedRoute={aiOptimizedRoute} 
          setShowAIPanel={setShowAIPanel}
          completedSites={completedSites}
          currentSiteIndex={currentSiteIndex}
          optimizedSiteOrder={optimizedSiteOrder}
        />
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-20 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
      <DesktopAIPanel 
        aiOptimizedRoute={aiOptimizedRoute}
        completedSites={completedSites}
        currentSiteIndex={currentSiteIndex}
        optimizedSiteOrder={optimizedSiteOrder}
      />
    </div>
  );
};

const MobileAIPanel = ({ aiOptimizedRoute, setShowAIPanel, completedSites, currentSiteIndex, optimizedSiteOrder }) => (
  <>
    <div className="flex justify-center pt-3 pb-2">
      <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
    </div>
    <button
      onClick={() => setShowAIPanel(false)}
      className="absolute top-3 right-4 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
    >
      <IoClose className="w-4 h-4 text-gray-600" />
    </button>

    <div className="p-4 max-h-64 overflow-y-auto">
      <AIPanelContent 
        aiOptimizedRoute={aiOptimizedRoute}
        completedSites={completedSites}
        currentSiteIndex={currentSiteIndex}
        optimizedSiteOrder={optimizedSiteOrder}
      />
    </div>
  </>
);

const DesktopAIPanel = ({ aiOptimizedRoute, completedSites, currentSiteIndex, optimizedSiteOrder }) => (
  <>
    <div className="flex items-center gap-2 mb-3">
      <IoSparkles className="w-5 h-5 text-green-600" />
      <h3 className="font-semibold text-green-800">AI Route Optimized</h3>
      {completedSites.size > 0 && (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          {completedSites.size} completed
        </span>
      )}
    </div>
    <AIPanelContent 
      aiOptimizedRoute={aiOptimizedRoute}
      completedSites={completedSites}
      currentSiteIndex={currentSiteIndex}
      optimizedSiteOrder={optimizedSiteOrder}
    />
  </>
);

const AIPanelContent = ({ aiOptimizedRoute, completedSites, currentSiteIndex, optimizedSiteOrder }) => (
  <>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Current Target:</span>
        <span className="font-semibold">
          {getSiteDisplayName(optimizedSiteOrder[currentSiteIndex]) || getSiteDisplayName(aiOptimizedRoute.nearestSite)}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Progress:</span>
        <span className="font-semibold">
          {completedSites.size}/{optimizedSiteOrder.length} sites
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Distance:</span>
        <span className="font-semibold">{aiOptimizedRoute.distance} km</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Est. Time:</span>
        <span className="font-semibold">{aiOptimizedRoute.formattedDuration}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Traffic:</span>
        <span className={`font-semibold ${
          aiOptimizedRoute.trafficConditions.conditions === 'heavy' ? 'text-red-600' :
          aiOptimizedRoute.trafficConditions.conditions === 'moderate' ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {aiOptimizedRoute.trafficConditions.conditions}
        </span>
      </div>
    </div>
    
    <div className="mt-3 p-2 bg-white rounded border">
      <p className="text-xs text-gray-700">
        {aiOptimizedRoute.recommendation.text}
      </p>
      <p className="text-xs text-blue-600 mt-1">
        💡 {aiOptimizedRoute.recommendation.suggestedAction}
      </p>
      {completedSites.size > 0 && (
        <p className="text-xs text-green-600 mt-2 font-medium">
          ✅ {completedSites.size} site(s) completed
        </p>
      )}
    </div>
  </>
);

const ControlButtons = ({ 
  isMobile, 
  showControls, 
  getAIOptimizedRoute, 
  getCurrentLocation, 
  onTaskComplete, 
  onTaskCancel, 
  onTaskStart,
  scheduleId, 
  currentLocation,
  completedSites,
  resetCompletedSites,
  activeSchedule,
  isTaskActive
}) => (
  <div className={`absolute ${isMobile ? 'top-16' : 'top-4'} right-4 z-10 flex flex-col gap-3 transition-all duration-300 ${
    isMobile && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
  }`}>
    {/* NEW: Start Task Button */}
    {/* {activeSchedule && !isTaskActive && (
      <ControlButton 
        onClick={onTaskStart}
        icon={<IoPlay className="w-6 h-6" />}
        label="Start Task"
        className="bg-green-500 hover:bg-green-600 text-white"
        showLabel={!isMobile}
      />
    )} */}

    {/* <ControlButton 
      onClick={getAIOptimizedRoute}
      icon={<IoSparkles className="w-6 h-6" />}
      label="AI Route"
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      showLabel={!isMobile}
    /> */}
    
    {/* <ControlButton 
      onClick={getCurrentLocation}
      icon={<IoNavigate className="w-6 h-6 text-blue-600" />}
      label="Location"
      className="bg-white hover:bg-gray-50"
      showLabel={!isMobile}
      indicator={currentLocation}
    /> */}

    {/* {completedSites.size > 0 && (
      <ControlButton 
        onClick={resetCompletedSites}
        icon={<IoRefresh className="w-6 h-6" />}
        label="Reset"
        className="bg-orange-500 hover:bg-orange-600 text-white"
        showLabel={!isMobile}
      />
    )} */}
    
    {/* <ControlButton 
      onClick={onTaskComplete}
      icon={<IoCheckmark className="w-6 h-6" />}
      label="Complete"
      className="bg-green-500 hover:bg-green-600 text-white"
      showLabel={!isMobile}
    /> */}
    
    {/* <ControlButton 
      onClick={onTaskCancel}
      icon={<IoClose className="w-6 h-6" />}
      label="Cancel"
      className="bg-red-500 hover:bg-red-600 text-white"
      showLabel={!isMobile}
    /> */}
  </div>
);

const ControlButton = ({ onClick, icon, label, className, showLabel, indicator }) => (
  <div className="flex flex-col items-center">
    <button
      onClick={onClick}
      className={`p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
    >
      {icon}
    </button>
    {showLabel && <span className="text-xs text-gray-600 mt-1">{label}</span>}
    {indicator && !showLabel && (
      <div className="w-2 h-2 bg-green-500 rounded-full mt-1 animate-pulse"></div>
    )}
  </div>
);

// NEW: Fake Location Test Panel Component
const FakeLocationTestPanel = ({ 
  startFakeLocationTest, 
  stopFakeLocationTest, 
  sendTestLocation,
  simulateRouteFollowing,
  isFakeLocationActive,
  isMobile,
  routeCoordinates
}) => {
  const [testLat, setTestLat] = useState('8.502');
  const [testLng, setTestLng] = useState('126.015');
  const [isOpen, setIsOpen] = useState(false);

  const handleSendTestLocation = () => {
    const lat = parseFloat(testLat);
    const lng = parseFloat(testLng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      sendTestLocation(lat, lng);
    } else {
      alert('Please enter valid coordinates');
    }
  };

  if (isMobile) {
    return (
      <div className="fixed bottom-20 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-3 rounded-full shadow-lg ${
            isFakeLocationActive 
              ? 'bg-purple-600 text-white' 
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          <IoCodeSlash className="w-6 h-6" />
        </button>

        {isOpen && (
          <div className="absolute bottom-12 left-0 bg-white p-4 rounded-lg shadow-xl border min-w-64">
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <IoCodeSlash className="w-4 h-4 text-purple-500" />
              🧪 Location Test
            </h3>
            
            <div className="space-y-2 mb-3">
              <input
                type="text"
                value={testLat}
                onChange={(e) => setTestLat(e.target.value)}
                placeholder="Latitude"
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                value={testLng}
                onChange={(e) => setTestLng(e.target.value)}
                placeholder="Longitude"
                className="w-full p-2 border rounded text-sm"
              />
              <button
                onClick={handleSendTestLocation}
                className="w-full bg-blue-500 text-white py-2 rounded text-sm"
              >
                Send Test Location
              </button>
            </div>

            <div className="flex gap-2">
              {!isFakeLocationActive ? (
                <>
                  <button
                    onClick={() => startFakeLocationTest(5000)}
                    className="flex-1 bg-green-500 text-white py-2 rounded text-sm flex items-center justify-center gap-1"
                  >
                    <IoPlay className="w-4 h-4" />
                    Start Sim
                  </button>
                  {routeCoordinates.length > 0 && (
                    <button
                      onClick={() => simulateRouteFollowing(3000)}
                      className="flex-1 bg-indigo-500 text-white py-2 rounded text-sm flex items-center justify-center gap-1"
                    >
                      <IoNavigate className="w-4 h-4" />
                      Follow Route
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={stopFakeLocationTest}
                  className="flex-1 bg-red-500 text-white py-2 rounded text-sm flex items-center justify-center gap-1"
                >
                  <IoStop className="w-4 h-4" />
                  Stop Sim
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-4 z-30 bg-white p-4 rounded-lg shadow-lg border min-w-64">
      <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
        <IoCodeSlash className="w-5 h-5 text-purple-500" />
        🧪 Location Test Panel
      </h3>
      
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={testLat}
              onChange={(e) => setTestLat(e.target.value)}
              placeholder="Latitude"
              className="flex-1 p-2 border rounded text-sm"
            />
            <input
              type="text"
              value={testLng}
              onChange={(e) => setTestLng(e.target.value)}
              placeholder="Longitude"
              className="flex-1 p-2 border rounded text-sm"
            />
          </div>
          <button
            onClick={handleSendTestLocation}
            className="w-full bg-blue-500 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
          >
            <IoNavigate className="w-4 h-4" />
            Send Test Location
          </button>
        </div>

        <div className="border-t pt-3">
          <div className="flex gap-2 mb-2">
            {!isFakeLocationActive ? (
              <button
                onClick={() => startFakeLocationTest(5000)}
                className="flex-1 bg-green-500 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
              >
                <IoPlay className="w-4 h-4" />
                Start Simulation
              </button>
            ) : (
              <button
                onClick={stopFakeLocationTest}
                className="flex-1 bg-red-500 text-white py-2 rounded text-sm flex items-center justify-center gap-2"
              >
                <IoStop className="w-4 h-4" />
                Stop Simulation
              </button>
            )}
          </div>
          
          {routeCoordinates.length > 0 && (
            <button
              onClick={() => simulateRouteFollowing(3000)}
              className="w-full bg-indigo-500 text-white py-2 rounded text-sm flex items-center justify-center gap-2 mb-2"
            >
              <IoNavigate className="w-4 h-4" />
              Follow Route Path
            </button>
          )}
          
          {isFakeLocationActive && (
            <p className="text-xs text-purple-600 mt-2 text-center">
              🔴 Simulation Active - Testing real-time updates
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const ScheduleInfoPanel = ({ 
  activeSchedule, 
  siteLocations, 
  routeInfo, 
  isMobile, 
  aiOptimizedRoute, 
  setShowAIPanel,
  completedSites,
  currentSiteIndex,
  optimizedSiteOrder,
  isTaskActive,
  isFakeLocationActive
}) => (
  <div className={`absolute ${isMobile ? 'bottom-20 left-4 right-4' : 'bottom-4 left-4'} z-10 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg ${
    isMobile ? 'max-w-full' : 'max-w-xs'
  }`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">
          <span className="text-blue-600 font-bold">{siteLocations.length}</span> sites to collect
        </div>
        {completedSites.size > 0 && (
          <div className="text-xs text-green-600 font-medium">
            {completedSites.size} completed • {siteLocations.length - completedSites.size} remaining
          </div>
        )}
        {currentSiteIndex < optimizedSiteOrder.length && (
          <div className="text-xs text-blue-600">
            Current: {getSiteDisplayName(optimizedSiteOrder[currentSiteIndex])}
          </div>
        )}
        {isTaskActive && (
          <div className="text-xs text-green-600 font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live - Residents can see your location
          </div>
        )}
        {isFakeLocationActive && (
          <div className="text-xs text-purple-600 font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            Testing Mode - Fake locations active
          </div>
        )}
      </div>
      {routeInfo && (
        <div className="text-right">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{routeInfo.formattedDuration}</span> • 
            <span className="font-medium"> {routeInfo.distance} km</span>
          </div>
          {routeInfo.toSite && (
            <div className="text-xs text-gray-500">
              To: {routeInfo.toSite}
            </div>
          )}
          {routeInfo.recalculated && (
            <div className="text-xs text-orange-600 font-medium">
              Route Recalculated
            </div>
          )}
          {isMobile && aiOptimizedRoute && (
            <button
              onClick={() => setShowAIPanel(true)}
              className="text-xs text-blue-600 font-medium mt-1"
            >
              View AI Route
            </button>
          )}
        </div>
      )}
    </div>

    {completedSites.size > 0 && (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSites.size / siteLocations.length) * 100}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1 text-center">
          {Math.round((completedSites.size / siteLocations.length) * 100)}% complete
        </div>
      </div>
    )}
  </div>
);

export default TaskMap;