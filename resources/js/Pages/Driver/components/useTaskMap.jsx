import { useEffect, useState } from 'react';
import { useLocationTracking } from './hooks/useLocationTracking';
import { useMapboxSetup } from './hooks/useMapboxSetup';
import { useMapLayers } from './hooks/useMapLayers';
import { useRouteCalculations } from './hooks/useRouteCalculations';
import { useSiteManagement } from './hooks/useSiteManagement';

export const useTaskMap = ({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize all custom hooks
  const mapboxSetup = useMapboxSetup({ mapboxKey, isMobile });
  
  const routeCalculations = useRouteCalculations({ 
    mapboxKey, 
    isOnline, 
    activeSchedule: null, // Will be set from siteManagement
    optimizedSiteOrder: [], // Will be set from siteManagement
    completedSites: new Set(), // Will be set from siteManagement
    siteLocations: [], // Will be set from siteManagement
    currentLocation: null, // Will be set from locationTracking
    routeCoordinates: [], // Will be set from routeCalculations
    routeInfo: null, // Will be set from routeCalculations
    map: mapboxSetup.map,
    isMobile,
    addRouteLayer: () => {} // Will be set from mapLayers
  });

  const siteManagement = useSiteManagement({ 
    scheduleId, 
    onTaskComplete, 
    onTaskCancel,
    calculateDistance: routeCalculations.calculateDistance,
    showCompletionNotification: (siteName) => {
      // Show completion notification logic from original hook
      console.log(`Site completed: ${siteName}`);
      
      if (isMobile) {
        // Show mobile-friendly notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-center';
        notification.innerHTML = `
          <div class="font-semibold">✅ ${siteName} Completed!</div>
          <div class="text-sm opacity-90">Progress: ${siteManagement.completedSites.size + 1}/${siteManagement.siteLocations.length} sites</div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      } else {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
          <div class="font-semibold">✅ ${siteName}</div>
          <div class="text-xs opacity-90">${siteManagement.completedSites.size + 1}/${siteManagement.siteLocations.length} sites</div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      }
    },
    updateSiteMarkers: () => {}, // Will be set from mapLayers
    recalculateRouteFromCurrentPosition: routeCalculations.recalculateRouteFromCurrentPosition,
    currentLocation: null // Will be set from locationTracking
  });

  const mapLayers = useMapLayers({ 
    map: mapboxSetup.map, 
    isMobile, 
    activeSchedule: siteManagement.activeSchedule,
    completedSites: siteManagement.completedSites,
    optimizedSiteOrder: siteManagement.optimizedSiteOrder,
    currentSiteIndex: siteManagement.currentSiteIndex,
    nearestSiteToStation: siteManagement.nearestSiteToStation,
    routeCoordinates: routeCalculations.routeCoordinates,
    routeInfo: routeCalculations.routeInfo,
    currentLocation: null, // Will be set from locationTracking
    isTaskActive: siteManagement.isTaskActive,
    siteLocations: siteManagement.siteLocations,
    stationLocation: siteManagement.stationLocation
  });

  const locationTracking = useLocationTracking({
    scheduleId,
    activeSchedule: siteManagement.activeSchedule,
    siteLocations: siteManagement.siteLocations,
    completedSites: siteManagement.completedSites,
    optimizedSiteOrder: siteManagement.optimizedSiteOrder,
    currentSiteIndex: siteManagement.currentSiteIndex,
    isTaskActive: siteManagement.isTaskActive,
    onTaskComplete,
    map: mapboxSetup.map,
    isMobile,
    currentLocation: null, // Will be set from locationTracking
    routeCoordinates: routeCalculations.routeCoordinates,
    routeInfo: routeCalculations.routeInfo,
    smoothUpdateUserLocation: mapLayers.smoothUpdateUserLocation,
    checkSiteProximity: siteManagement.checkSiteProximity,
    recalculateRouteFromCurrentPosition: routeCalculations.recalculateRouteFromCurrentPosition,
    shouldRecalculateRoute: routeCalculations.shouldRecalculateRoute,
    updateUserLocationSource: mapLayers.updateUserLocationSource,
    animatePulse: mapLayers.animatePulse,
    clearUserLocationLayers: mapLayers.clearUserLocationLayers,
    updateCurrentLocationMarker: mapLayers.updateCurrentLocationMarker,
    handleLocationError: (error) => {
      let errorMessage = 'Location tracking error: ';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += 'Location unavailable. Using last known position.';
          break;
        case error.TIMEOUT:
          errorMessage += 'Location request timeout. Retrying...';
          setTimeout(locationTracking.startRealtimeLocationTracking, 5000);
          break;
        default:
          errorMessage += 'Unknown location error.';
          break;
      }
      
      console.warn(errorMessage);
    },
    sendLocationToReverb: async (latitude, longitude, accuracy = null) => {
      if (!scheduleId) {
        console.error('No schedule ID available');
        return;
      }
    
      try {
        const barangayId = siteManagement.activeSchedule?.barangay_id || 'unknown';
    
        const response = await axios.post('/driver/location/update', {
          latitude: latitude,
          longitude: longitude,
          accuracy: accuracy,
          schedule_id: scheduleId,
          barangay_id: barangayId,
          timestamp: new Date().toISOString(),
        });
    
        if (response.data.success) {
          console.log('Location successfully sent to backend');
        }
      } catch (error) {
        console.error('Failed to send location to backend:', error);
        throw error;
      }
    }
  });

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowAIPanel(false);
        setShowControls(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Connection lost - switching to offline mode');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Map initialization
  useEffect(() => {
    const cleanup = mapboxSetup.initializeMap(() => {
      locationTracking.startRealtimeLocationTracking();
    });

    return () => {
      locationTracking.stopRealtimeLocationTracking();
      locationTracking.stopFakeLocationTest();
      mapLayers.clearUserLocationLayers();
      if (cleanup) cleanup();
    };
  }, [mapboxSetup.cssLoaded]);

  // Update map layers when data changes
  useEffect(() => {
    if (mapboxSetup.mapInitialized && 
        mapboxSetup.customStyleLoaded && 
        siteManagement.siteLocations.length > 0) {
      
      mapLayers.clearSiteMarkers();
      mapLayers.addSiteMarkers();
      
      if (routeCalculations.routeCoordinates.length > 0) {
        setTimeout(() => {
          mapLayers.addRouteLayer();
        }, 300);
      }
    }
  }, [
    mapboxSetup.mapInitialized, 
    mapboxSetup.customStyleLoaded, 
    siteManagement.siteLocations, 
    routeCalculations.routeCoordinates, 
    siteManagement.optimizedSiteOrder, 
    siteManagement.nearestSiteToStation, 
    siteManagement.completedSites
  ]);

  // Route calculation when location and nearest site are available
  useEffect(() => {
    if (locationTracking.currentLocation && 
        siteManagement.nearestSiteToStation && 
        mapboxSetup.mapInitialized) {
      console.log('All data available, calculating route automatically');
      routeCalculations.calculateRouteToNearestSiteFromStation(
        locationTracking.currentLocation, 
        siteManagement.nearestSiteToStation
      );
    }
  }, [locationTracking.currentLocation, siteManagement.nearestSiteToStation, mapboxSetup.mapInitialized]);

  // Combined methods from original hook
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      siteManagement.setLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const currentPos = [longitude, latitude];
          
          locationTracking.setCurrentLocation(currentPos);
          locationTracking.setLocationAccuracy(accuracy);
          locationTracking.setLastLocationUpdate(new Date());
          
          // Use smooth update instead of basic marker
          mapLayers.smoothUpdateUserLocation(latitude, longitude);

          if (siteManagement.stationLocation && siteManagement.siteLocations.length > 0) {
            const aiResult = await routeCalculations.analyzeAndOptimizeRouteFromStation(
              siteManagement.stationLocation, 
              siteManagement.siteLocations
            );
            
            if (aiResult) {
              routeCalculations.setRouteCoordinates(aiResult.route);
              routeCalculations.setRouteInfo({
                duration: aiResult.duration,
                distance: aiResult.distance,
                toSite: aiResult.nearestSite?.site_name
              });
              
              setTimeout(() => {
                if (mapboxSetup.map.current && aiResult.route.length > 0) {
                  mapLayers.addRouteLayer();
                }
              }, 500);
            }
          }
          
          if (mapboxSetup.map.current) {
            mapboxSetup.map.current.flyTo({
              center: currentPos,
              zoom: isMobile ? 15 : 14,
              essential: true,
              duration: 1500
            });
          }
          
          siteManagement.setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          siteManagement.setLoading(false);
          locationTracking.handleLocationError(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const getAIOptimizedRoute = () => {
    if (!siteManagement.stationLocation) {
      alert('No station found. Please check site configuration.');
      return;
    }
    
    if (siteManagement.siteLocations.length === 0) {
      alert('No sites available for optimization.');
      return;
    }
    
    routeCalculations.analyzeAndOptimizeRouteFromStation(
      siteManagement.stationLocation, 
      siteManagement.siteLocations
    );
  };

  // Manual location update for testing/fallback
  const updateLocationManually = (latitude, longitude) => {
    const currentPos = [longitude, latitude];
    locationTracking.setCurrentLocation(currentPos);
    mapLayers.smoothUpdateUserLocation(latitude, longitude);
    
    if (siteManagement.nearestSiteToStation) {
      routeCalculations.calculateRouteToNearestSiteFromStation(currentPos, siteManagement.nearestSiteToStation);
    }
  };

  const fitMapToRouteAndDriver = () => {
    mapLayers.fitMapToRouteAndDriver(
      routeCalculations.getNextUncompletedSiteIndex,
      siteManagement.optimizedSiteOrder
    );
  };

  const fitMapToRoute = () => {
    mapLayers.fitMapToRoute();
  };

  return {
    // Refs
    mapContainer: mapboxSetup.mapContainer,
    siteMarkersRef: mapLayers.siteMarkersRef,
    
    // State
    cssLoaded: mapboxSetup.cssLoaded,
    siteLocations: siteManagement.siteLocations,
    stationLocation: siteManagement.stationLocation,
    mapInitialized: mapboxSetup.mapInitialized,
    activeSchedule: siteManagement.activeSchedule,
    routeCoordinates: routeCalculations.routeCoordinates,
    loading: siteManagement.loading,
    currentLocation: locationTracking.currentLocation,
    routeInfo: routeCalculations.routeInfo,
    mapError: mapboxSetup.mapError,
    customStyleLoaded: mapboxSetup.customStyleLoaded,
    aiOptimizedRoute: routeCalculations.aiOptimizedRoute,
    nearestSiteToStation: siteManagement.nearestSiteToStation,
    isMobile,
    showAIPanel,
    showControls,
    optimizedSiteOrder: siteManagement.optimizedSiteOrder,
    isOnline,
    locationAccuracy: locationTracking.locationAccuracy,
    lastLocationUpdate: locationTracking.lastLocationUpdate,
    completedSites: siteManagement.completedSites,
    currentSiteIndex: siteManagement.currentSiteIndex,
    isTaskActive: siteManagement.isTaskActive,
    isFakeLocationActive: locationTracking.isFakeLocationActive,

    // Methods
    formatDuration: routeCalculations.formatDuration,
    getCurrentLocation,
    getAIOptimizedRoute,
    setShowAIPanel,
    setShowControls,
    startRealtimeLocationTracking: locationTracking.startRealtimeLocationTracking,
    stopRealtimeLocationTracking: locationTracking.stopRealtimeLocationTracking,
    updateLocationManually,
    resetCompletedSites: siteManagement.resetCompletedSites,
    markSiteAsCompleted: siteManagement.markSiteAsCompleted,
    startTaskAndBroadcast: siteManagement.startTaskAndBroadcast,
    completeTaskAndBroadcast: siteManagement.completeTaskAndBroadcast,
    sendLocationToReverb: locationTracking.sendLocationToReverb,

    // Fake location methods
    startFakeLocationTest: locationTracking.startFakeLocationTest,
    stopFakeLocationTest: locationTracking.stopFakeLocationTest,
    sendTestLocation: locationTracking.sendTestLocation,
    simulateRouteFollowing: locationTracking.simulateRouteFollowing,

    // Map methods
    fitMapToRouteAndDriver,
    fitMapToRoute,
    
    // Additional methods
    updateSiteMarkers: mapLayers.updateSiteMarkers,
    addRouteLayer: mapLayers.addRouteLayer,
    calculateRouteToNextSite: routeCalculations.calculateRouteToNextSite,
    calculateOptimalRoute: routeCalculations.calculateOptimalRoute,
    optimizeSiteOrder: routeCalculations.optimizeSiteOrder,
    analyzeAndOptimizeRouteFromStation: routeCalculations.analyzeAndOptimizeRouteFromStation,
  };
};