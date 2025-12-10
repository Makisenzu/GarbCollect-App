import { useEffect, useState } from 'react';
import { useLocationTracking } from './hooks/useLocationTracking';
import { useMapboxSetup } from './hooks/useMapboxSetup';
import { useMapLayers } from './hooks/useMapLayers';
import { useRouteCalculations } from './hooks/useRouteCalculations';
import { useSiteManagement } from './hooks/useSiteManagement';
import { getSiteDisplayName } from '@/Utils/siteHelpers';

export const useTaskMap = ({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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

  // Handle task completion with modal
  const handleTaskComplete = (site, allCompleted = false) => {
    if (allCompleted) {
      setShowCompletionModal(true);
    }
    
    if (onTaskComplete) {
      onTaskComplete(site, allCompleted);
    }
  };

  const siteManagement = useSiteManagement({ 
    scheduleId, 
    onTaskComplete: handleTaskComplete, 
    onTaskCancel,
    calculateDistance: routeCalculations.calculateDistance,
    showCompletionNotification: (siteName) => {
      // Show enhanced completion notification
      console.log(`✅ Site completed: ${siteName}`);
      
      // Play success sound
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLaiTUIGGe77OmfTgwOUKbk8LdjHQU2kdby0HwqBSp3x/DdkUELEl+06OyqVRUKRp7g8r5wIgU0h9H004IzBh1tv+/mnEkODlat6O+xXBkIP5Xa8sV0KgUrgc7y2YszCBdnvOzpnk4MDU+m5O+5ZBwGNpHX8s98Kgcrc8fv3ZJCCxFftOjuq1YUDD6f4fK/cCMGNYfR89OCMwYcbb/v5JxKDg5VrOjusVwZCj6U2vLGdSoGK4HO8tmLMwgXZ7vs6J5PDA1Ppubw...');
        audio.volume = 0.4;
        audio.play().catch(() => {});
      } catch (e) {
        // Ignore audio errors
      }
      
      if (isMobile) {
        // Enhanced mobile notification with dismiss button
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl z-[9999] transform transition-all duration-500';
        notification.style.animation = 'slideInDown 0.5s ease-out';
        notification.innerHTML = `
          <div class="flex items-start gap-3">
            <div class="text-5xl animate-bounce">✅</div>
            <div class="flex-1 text-left">
              <div class="font-bold text-xl mb-1">${siteName} FINISHED!</div>
              <div class="text-sm opacity-90 mb-2">Collection completed successfully</div>
              <div class="text-xs opacity-80 bg-white bg-opacity-20 px-2 py-1 rounded inline-block">
                Progress: ${siteManagement.completedSites.size + 1}/${siteManagement.siteLocations.length} sites (${Math.round(((siteManagement.completedSites.size + 1) / siteManagement.siteLocations.length) * 100)}%)
              </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-75 hover:opacity-100 text-3xl font-bold leading-none mt-1">×</button>
          </div>
          <div class="mt-3 h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full transition-all duration-1000 animate-pulse" style="width: ${((siteManagement.completedSites.size + 1) / siteManagement.siteLocations.length) * 100}%"></div>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-dismiss after 6 seconds (longer than before)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 500);
          }
        }, 6000);
      } else {
        // Enhanced desktop notification with better visibility
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl z-[9999] min-w-[400px] transform transition-all duration-500';
        notification.style.animation = 'slideInRight 0.5s ease-out, bounceScale 0.3s ease-in-out 0.5s';
        notification.innerHTML = `
          <div class="flex items-start gap-4">
            <div class="text-6xl animate-bounce">✅</div>
            <div class="flex-1">
              <div class="font-bold text-2xl mb-2">${siteName} FINISHED!</div>
              <div class="text-sm opacity-90 mb-3">Collection site has been marked as completed</div>
              <div class="flex items-center gap-2 text-sm mb-3">
                <span class="font-semibold bg-white bg-opacity-20 px-3 py-1 rounded">${siteManagement.completedSites.size + 1}/${siteManagement.siteLocations.length} sites</span>
                <span class="opacity-75">•</span>
                <span class="font-semibold">${Math.round(((siteManagement.completedSites.size + 1) / siteManagement.siteLocations.length) * 100)}% complete</span>
              </div>
              <div class="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div class="h-full bg-white rounded-full transition-all duration-1000 animate-pulse" style="width: ${((siteManagement.completedSites.size + 1) / siteManagement.siteLocations.length) * 100}%"></div>
              </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-75 hover:opacity-100 text-3xl font-bold leading-none transition-opacity">×</button>
          </div>
        `;
        document.body.appendChild(notification);
        
        // Auto-dismiss after 7 seconds (longer than before)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
              if (document.body.contains(notification)) {
                document.body.removeChild(notification);
              }
            }, 500);
          }
        }, 7000);
      }
      
      // Add CSS animations if not already added
      if (!document.getElementById('completion-animations')) {
        const style = document.createElement('style');
        style.id = 'completion-animations';
        style.textContent = `
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideInDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          @keyframes bounceScale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `;
        document.head.appendChild(style);
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
          
          // Check if any sites were auto-completed by the backend
          if (response.data.sites_completed && response.data.sites_completed.length > 0) {
            console.log('🎯 Backend auto-completed sites:', response.data.sites_completed);
            
            // Update local state for each completed site
            response.data.sites_completed.forEach(completedSite => {
              console.log(`✅ Site auto-completed: ${completedSite.site_name} (${completedSite.distance}km)`);
              
              // The broadcast event will handle updating the UI
              // But we can also update local state immediately for faster feedback
              siteManagement.setCompletedSites(prev => {
                const newSet = new Set(prev);
                newSet.add(completedSite.site_id);
                return newSet;
              });
            });
            
            // Update site markers to reflect completion
            mapLayers.updateSiteMarkers();
          }
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

  // Route calculation when location and sites are available
  useEffect(() => {
    if (locationTracking.currentLocation && 
        siteManagement.siteLocations.length > 0 && 
        mapboxSetup.mapInitialized) {
      console.log('All data available, calculating sequential route through all sites');
      
      // Calculate ONE route through ALL sites in sequence
      const calculateSequentialRoute = async () => {
        const aiResult = await routeCalculations.analyzeAndOptimizeRouteFromCurrentLocation(
          locationTracking.currentLocation,
          siteManagement.siteLocations
        );
        
        if (aiResult) {
          routeCalculations.setRouteCoordinates(aiResult.route);
          routeCalculations.setRouteInfo({
            duration: aiResult.duration,
            distance: aiResult.distance,
            formattedDuration: aiResult.formattedDuration
          });
          
          setTimeout(() => {
            if (mapboxSetup.map.current && aiResult.route.length > 0) {
              mapLayers.addRouteLayer();
            }
          }, 300);
        }
      };
      
      calculateSequentialRoute();
    }
  }, [locationTracking.currentLocation, siteManagement.siteLocations, mapboxSetup.mapInitialized]);

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

          if (siteManagement.siteLocations.length > 0) {
            // Calculate ONE sequential route from current position through ALL sites
            const aiResult = await routeCalculations.analyzeAndOptimizeRouteFromCurrentLocation(
              currentPos,
              siteManagement.siteLocations
            );
            
            if (aiResult) {
              routeCalculations.setRouteCoordinates(aiResult.route);
              routeCalculations.setRouteInfo({
                duration: aiResult.duration,
                distance: aiResult.distance,
                formattedDuration: aiResult.formattedDuration,
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
    allSiteRoutes: routeCalculations.allSiteRoutes,
    showCompletionModal,
    setShowCompletionModal,

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