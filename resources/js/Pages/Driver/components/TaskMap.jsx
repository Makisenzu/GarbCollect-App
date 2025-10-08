import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GiControlTower } from "react-icons/gi";
import { IoClose, IoCheckmark, IoNavigate, IoSparkles, IoChevronDown, IoChevronUp } from "react-icons/io5";
import axios from 'axios';
import can from "@/images/can.png";
import { useTaskMap } from './useTaskMap';

const TaskMap = forwardRef(({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel, autoGetLocation = false }, ref) => {
  const {
    mapContainer,
    siteMarkersRef,

    cssLoaded,
    siteLocations,
    mapInitialized,
    activeSchedule,
    routeCoordinates,
    loading,
    currentLocation,
    routeInfo,
    mapError,
    customStyleLoaded,
    aiOptimizedRoute,
    nearestSite,
    isMobile,
    showAIPanel,
    showControls,
    
    formatDuration,
    getCurrentLocation,
    getAIOptimizedRoute,
    setShowAIPanel,
    setShowControls
  } = useTaskMap({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel });

  useImperativeHandle(ref, () => ({
    getCurrentLocation: () => {
      getCurrentLocation();
    },
    fitMapToRoute: () => {
      console.log('Fit map to route function called');
    }
  }));

  useEffect(() => {
    if (autoGetLocation && !currentLocation && !loading && mapInitialized) {
      console.log('Auto-getting location on component mount');
      getCurrentLocation();
    }
  }, [autoGetLocation, currentLocation, loading, mapInitialized]);

  return (
    <div className="relative w-full h-full bg-white">
      {loading && <LoadingOverlay />}
      {mapError && <ErrorOverlay error={mapError} />}
      {!cssLoaded && !mapError && <MapLoadingOverlay />}

      {isMobile && (
        <MobileHeader 
          showControls={showControls}
          setShowControls={setShowControls}
          siteLocations={siteLocations}
          currentLocation={currentLocation}
        />
      )}

      {aiOptimizedRoute && (
        <AIOptimizationPanel 
          aiOptimizedRoute={aiOptimizedRoute}
          isMobile={isMobile}
          showAIPanel={showAIPanel}
          setShowAIPanel={setShowAIPanel}
        />
      )}

      <ControlButtons 
        isMobile={isMobile}
        showControls={showControls}
        getAIOptimizedRoute={getAIOptimizedRoute}
        getCurrentLocation={getCurrentLocation}
        onTaskComplete={onTaskComplete}
        onTaskCancel={onTaskCancel}
        scheduleId={scheduleId}
        currentLocation={currentLocation}
      />

      {activeSchedule && (
        <ScheduleInfoPanel 
          activeSchedule={activeSchedule}
          siteLocations={siteLocations}
          routeInfo={routeInfo}
          isMobile={isMobile}
          aiOptimizedRoute={aiOptimizedRoute}
          setShowAIPanel={setShowAIPanel}
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

const MobileHeader = ({ showControls, setShowControls, siteLocations, currentLocation }) => (
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
          <p className="text-xs text-gray-600">{siteLocations.length} sites to collect</p>
        </div>
      </div>
      {currentLocation && (
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </div>
  </div>
);

const AIOptimizationPanel = ({ aiOptimizedRoute, isMobile, showAIPanel, setShowAIPanel }) => {
  if (isMobile) {
    return (
      <div className={`absolute bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 rounded-t-2xl shadow-2xl transition-transform duration-300 ${
        showAIPanel ? 'transform translate-y-0' : 'transform translate-y-full'
      }`}>
        <MobileAIPanel aiOptimizedRoute={aiOptimizedRoute} setShowAIPanel={setShowAIPanel} />
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-4 z-20 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
      <DesktopAIPanel aiOptimizedRoute={aiOptimizedRoute} />
    </div>
  );
};

const MobileAIPanel = ({ aiOptimizedRoute, setShowAIPanel }) => (
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
      <AIPanelContent aiOptimizedRoute={aiOptimizedRoute} />
    </div>
  </>
);

const DesktopAIPanel = ({ aiOptimizedRoute }) => (
  <>
    <div className="flex items-center gap-2 mb-3">
      <IoSparkles className="w-5 h-5 text-green-600" />
      <h3 className="font-semibold text-green-800">AI Route Optimized</h3>
    </div>
    <AIPanelContent aiOptimizedRoute={aiOptimizedRoute} />
  </>
);

const AIPanelContent = ({ aiOptimizedRoute }) => (
  <>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Nearest Site:</span>
        <span className="font-semibold">{aiOptimizedRoute.nearestSite.site_name}</span>
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
  scheduleId, 
  currentLocation 
}) => (
  <div className={`absolute ${isMobile ? 'top-16' : 'top-4'} right-4 z-10 flex flex-col gap-3 transition-all duration-300 ${
    isMobile && !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
  }`}>
    <ControlButton 
      onClick={getAIOptimizedRoute}
      icon={<IoSparkles className="w-6 h-6" />}
      label="AI Route"
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      showLabel={!isMobile}
    />
    
    <ControlButton 
      onClick={getCurrentLocation}
      icon={<IoNavigate className="w-6 h-6 text-blue-600" />}
      label="Location"
      className="bg-white hover:bg-gray-50"
      showLabel={!isMobile}
      indicator={currentLocation}
    />
    
    <ControlButton 
      onClick={() => onTaskComplete && onTaskComplete({ scheduleId })}
      icon={<IoCheckmark className="w-6 h-6" />}
      label="Complete"
      className="bg-green-500 hover:bg-green-600 text-white"
      showLabel={!isMobile}
    />
    
    <ControlButton 
      onClick={onTaskCancel}
      icon={<IoClose className="w-6 h-6" />}
      label="Cancel"
      className="bg-red-500 hover:bg-red-600 text-white"
      showLabel={!isMobile}
    />
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

const ScheduleInfoPanel = ({ activeSchedule, siteLocations, routeInfo, isMobile, aiOptimizedRoute, setShowAIPanel }) => (
  <div className={`absolute ${isMobile ? 'bottom-20 left-4 right-4' : 'bottom-4 left-4'} z-10 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg ${
    isMobile ? 'max-w-full' : 'max-w-xs'
  }`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-gray-900">
          <span className="text-blue-600 font-bold">{siteLocations.length}</span> sites to collect
        </div>
      </div>
      {routeInfo && (
        <div className="text-right">
          <div className="text-xs text-gray-600">
            <span className="font-medium">{routeInfo.formattedDuration}</span> • 
            <span className="font-medium"> {routeInfo.distance} km</span>
          </div>
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
  </div>
);

export default TaskMap;