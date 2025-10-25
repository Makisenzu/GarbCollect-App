import { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useMapboxSetup } from './hooks/useMapboxSetup';
import { useLocationTracking } from './hooks/useLocationTracking';
import { useRouteCalculation } from './hooks/useRouteCalculation';
import { useSiteManagement } from './hooks/useSiteManagement';
import { useMapLayers } from './hooks/useMapLayers';

export const useTaskMap = ({ mapboxKey, scheduleId, onTaskComplete }) => {
  const mapContainer = useRef(null);
  
  // UI
  const [uiState, setUiState] = useState({
    isMobile: false,
    isOnline: navigator.onLine,
    showAIPanel: false,
    showControls: true,
    isTaskActive: false
  });

  // Custom Hooks
  const { map, mapInitialized, customStyleLoaded, mapError } = 
    useMapboxSetup(mapboxKey, mapContainer, uiState.isMobile);
  
  const { siteLocations, stationLocation, activeSchedule, optimizedSiteOrder, completedSites, currentSiteIndex, loading, markSiteAsCompleted, getNextUncompletedSiteIndex } = 
    useSiteManagement(scheduleId);
  
  const { currentLocation, locationAccuracy, lastLocationUpdate, startTracking, stopTracking, setCurrentLocation } = 
    useLocationTracking(scheduleId, activeSchedule, uiState.isTaskActive);
  
  const { routeCoordinates, routeInfo, aiOptimizedRoute, calculateRoute, createStraightLineRoute, analyzeAndOptimizeRouteFromStation, setRouteCoordinates, setRouteInfo } = 
    useRouteCalculation(mapboxKey, uiState.isOnline);
  
  const { 
    clearSiteMarkers, 
    clearUserLocationLayers, 
    clearRouteLayers,
    addSiteMarkers, 
    updateCurrentLocationMarker, 
    updateUserLocationSource, 
    animatePulse,
    addRouteLayer,
    fitMapToRouteAndDriver
  } = useMapLayers(map, uiState.isMobile);

  // Effects
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setUiState(prev => ({ ...prev, isMobile: mobile }));
      if (mobile) {
        setUiState(prev => ({ ...prev, showAIPanel: false, showControls: true }));
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleOnline = () => setUiState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setUiState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (mapInitialized && customStyleLoaded && siteLocations.length > 0) {
      addSiteMarkers(siteLocations, stationLocation, optimizedSiteOrder, activeSchedule, completedSites, currentSiteIndex);
      
      if (routeCoordinates.length > 0) {
        setTimeout(() => {
          addRouteLayer(routeCoordinates, routeInfo, activeSchedule, uiState.isMobile);
        }, 300);
      }
    }
  }, [mapInitialized, customStyleLoaded, siteLocations, routeCoordinates, optimizedSiteOrder, completedSites, currentSiteIndex]);

  useEffect(() => {
    if (currentLocation && optimizedSiteOrder.length > 0 && mapInitialized) {
      const nextSiteIndex = getNextUncompletedSiteIndex();
      if (nextSiteIndex !== -1) {
        const nextSite = optimizedSiteOrder[nextSiteIndex];
        calculateRoute(currentLocation, nextSite, { recalculated: false });
      }
    }
  }, [currentLocation, optimizedSiteOrder, mapInitialized, getNextUncompletedSiteIndex]);

  // Core Functions
  const smoothUpdateUserLocation = useCallback((lat, lng) => {
    if (!map.current) return;

    const coordinates = [lng, lat];
    
    updateUserLocationSource(lng, lat);
    updateCurrentLocationMarker(coordinates);
    animatePulse();

    // Recalculate route if needed
    const shouldRecalc = shouldRecalculateRoute(coordinates);
    if (shouldRecalc) {
      const nextSiteIndex = getNextUncompletedSiteIndex();
      if (nextSiteIndex !== -1) {
        const nextSite = optimizedSiteOrder[nextSiteIndex];
        calculateRoute(coordinates, nextSite, { recalculated: true });
      }
    }

    // Auto-follow
    if (uiState.isTaskActive && map.current && !map.current.hasUserInteracted?.()) {
      map.current.flyTo({
        center: coordinates,
        zoom: uiState.isMobile ? 16 : 15,
        speed: 0.8,
        curve: 1,
        essential: true,
        duration: 1000
      });
    }
  }, [map, uiState.isTaskActive, uiState.isMobile, updateUserLocationSource, updateCurrentLocationMarker, animatePulse, getNextUncompletedSiteIndex, optimizedSiteOrder, calculateRoute]);

  const shouldRecalculateRoute = useCallback((currentPos) => {
    if (!currentLocation || !routeCoordinates.length || routeCoordinates.length < 2) {
      return true;
    }
    
    const distanceToRouteStart = calculateDistance(
      currentPos[1], currentPos[0],
      routeCoordinates[0][1], routeCoordinates[0][0]
    );
    
    return distanceToRouteStart > 0.2;
  }, [currentLocation, routeCoordinates]);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const checkSiteProximity = useCallback((currentPos, sites) => {
    if (!currentPos || sites.length === 0) return;

    const [longitude, latitude] = currentPos;

    sites.forEach((site) => {
      if (completedSites.has(site.id)) return;

      const siteLongitude = parseFloat(site.longitude);
      const siteLatitude = parseFloat(site.latitude);
      
      const distance = calculateDistance(
        latitude,
        longitude,
        siteLatitude,
        siteLongitude
      );

      if (distance < 0.05) {
        markSiteAsCompleted(site);
      }
    });
  }, [completedSites, calculateDistance, markSiteAsCompleted]);

  const startTaskAndBroadcast = useCallback(async () => {
    if (!scheduleId) {
      console.error('Cannot start task: missing schedule ID');
      return;
    }

    try {
      const response = await axios.post('/schedule/start', {
        schedule_id: scheduleId,
        barangay_id: activeSchedule?.barangay_id || 'unknown'
      });

      if (response.data.success) {
        setUiState(prev => ({ ...prev, isTaskActive: true }));
        if (response.data.data) {
          // Update active schedule if needed
        }
        startTracking();
      }
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  }, [scheduleId, activeSchedule, startTracking]);

  const completeTaskAndBroadcast = useCallback(async () => {
    if (!scheduleId) {
      console.error('Cannot complete task: missing schedule ID');
      return;
    }

    try {
      const response = await axios.post('/schedule/complete', {
        schedule_id: scheduleId
      });

      if (response.data.success) {
        setUiState(prev => ({ ...prev, isTaskActive: false }));
        stopTracking();
        onTaskComplete?.();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  }, [scheduleId, stopTracking, onTaskComplete]);

  const getAIOptimizedRoute = useCallback(() => {
    if (!stationLocation) {
      alert('No station found. Please check site configuration.');
      return;
    }
    
    if (siteLocations.length === 0) {
      alert('No sites available for optimization.');
      return;
    }
    
    analyzeAndOptimizeRouteFromStation(stationLocation, siteLocations);
  }, [stationLocation, siteLocations, analyzeAndOptimizeRouteFromStation]);

  const updateLocationManually = useCallback((latitude, longitude) => {
    const currentPos = [longitude, latitude];
    setCurrentLocation(currentPos);
    smoothUpdateUserLocation(latitude, longitude);
  }, [setCurrentLocation, smoothUpdateUserLocation]);

  const updateSiteMarkers = useCallback(() => {
    addSiteMarkers(siteLocations, stationLocation, optimizedSiteOrder, activeSchedule, completedSites, currentSiteIndex);
  }, [addSiteMarkers, siteLocations, stationLocation, optimizedSiteOrder, activeSchedule, completedSites, currentSiteIndex]);

  // Public API
  return {
    // Refs
    mapContainer,
    
    // State
    ...uiState,
    mapInitialized,
    customStyleLoaded,
    mapError,
    siteLocations,
    stationLocation,
    activeSchedule,
    routeCoordinates,
    currentLocation,
    routeInfo,
    aiOptimizedRoute,
    loading,
    optimizedSiteOrder,
    completedSites,
    currentSiteIndex,
    locationAccuracy,
    lastLocationUpdate,

    // Methods
    startTaskAndBroadcast,
    completeTaskAndBroadcast,
    markSiteAsCompleted,
    getAIOptimizedRoute,
    updateLocationManually,
    updateSiteMarkers,
    setUiState: (updates) => setUiState(prev => ({ ...prev, ...updates })),
    smoothUpdateUserLocation,
    checkSiteProximity,
    addRouteLayer: () => addRouteLayer(routeCoordinates, routeInfo, activeSchedule, uiState.isMobile),
    fitMapToRoute: () => fitMapToRouteAndDriver(routeCoordinates, currentLocation, optimizedSiteOrder, currentSiteIndex, uiState.isMobile)
  };
};