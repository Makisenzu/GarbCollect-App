import { useRef, useState } from 'react';
import axios from 'axios';

export const useLocationTracking = ({ 
  scheduleId, 
  activeSchedule, 
  siteLocations, 
  completedSites, 
  optimizedSiteOrder,
  currentSiteIndex,
  isTaskActive,
  onTaskComplete,
  map,
  isMobile,
  currentLocation,
  routeCoordinates,
  routeInfo,
  smoothUpdateUserLocation,
  checkSiteProximity,
  recalculateRouteFromCurrentPosition,
  shouldRecalculateRoute,
  updateUserLocationSource,
  animatePulse,
  clearUserLocationLayers,
  updateCurrentLocationMarker,
  handleLocationError,
  sendLocationToReverb
}) => {
  const locationWatcherRef = useRef(null);
  const fakeLocationIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const userLocationSourceRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  
  const [isFakeLocationActive, setIsFakeLocationActive] = useState(false);
  const [currentLocationState, setCurrentLocationState] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);

  // ==================== FAKE LOCATION TESTING FUNCTIONS ====================

  const startFakeLocationTest = (updateInterval = 5000) => {
    if (isFakeLocationActive) {
      console.log('Fake location test already running');
      return;
    }

    console.log('🚀 Starting fake location test');
    setIsFakeLocationActive(true);

    const testCoordinates = [
      { lat: 8.4830, lng: 125.9485, name: "Start Point" },
      { lat: 8.4900, lng: 125.9550, name: "Point A" },
      { lat: 8.4950, lng: 125.9600, name: "Point B" },
      { lat: 8.5000, lng: 125.9650, name: "Point C" },
      { lat: 8.5050, lng: 125.9700, name: "Point D" },
    ];

    let currentIndex = 0;

    fakeLocationIntervalRef.current = setInterval(async () => {
      const location = testCoordinates[currentIndex];
      
      try {
        console.log(`📍 Sending fake location: ${location.lat}, ${location.lng} (${location.name})`);
        
        // Send to Reverb
        await sendLocationToReverb(location.lat, location.lng, 10);
        
        // Update local state with smooth animation
        smoothUpdateUserLocation(location.lat, location.lng);
        
        // Check site proximity and recalculate if needed
        if (siteLocations.length > 0) {
          const siteReached = checkSiteProximity([location.lng, location.lat], siteLocations);
          if (siteReached) {
            console.log('Site completed in fake location test, recalculating route');
            // Use current fake location for recalculation
            recalculateRouteFromCurrentPosition([location.lng, location.lat]);
          } else if (shouldRecalculateRoute([location.lng, location.lat])) {
            recalculateRouteFromCurrentPosition([location.lng, location.lat]);
          }
        }
        
        console.log(`✅ Fake location sent: ${location.name}`);
        
        // Move to next point
        currentIndex = (currentIndex + 1) % testCoordinates.length;
        
      } catch (error) {
        console.error('❌ Failed to send fake location:', error);
      }
    }, updateInterval);
  };

  const stopFakeLocationTest = () => {
    if (fakeLocationIntervalRef.current) {
      clearInterval(fakeLocationIntervalRef.current);
      fakeLocationIntervalRef.current = null;
      setIsFakeLocationActive(false);
      console.log('🛑 Fake location test stopped');
    }
  };

  const sendTestLocation = async (lat, lng) => {
    try {
      console.log(`📍 Sending test location: ${lat}, ${lng}`);
      await sendLocationToReverb(lat, lng, 10);
      smoothUpdateUserLocation(lat, lng);
      console.log('✅ Test location sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send test location:', error);
      return false;
    }
  };

  const simulateRouteFollowing = async (updateInterval = 3000) => {
    if (!routeCoordinates || routeCoordinates.length === 0) {
      console.error('No route coordinates available for simulation');
      return;
    }

    if (isFakeLocationActive) {
      console.log('Fake location simulation already running');
      return;
    }

    console.log('🛣️ Starting route following simulation');
    setIsFakeLocationActive(true);

    let currentIndex = 0;

    fakeLocationIntervalRef.current = setInterval(async () => {
      if (currentIndex >= routeCoordinates.length) {
        console.log('🏁 Route simulation completed');
        stopFakeLocationTest();
        return;
      }

      const [lng, lat] = routeCoordinates[currentIndex];
      
      try {
        console.log(`📍 Route point ${currentIndex + 1}/${routeCoordinates.length}: ${lat}, ${lng}`);
        
        await sendLocationToReverb(lat, lng, 5);
        smoothUpdateUserLocation(lat, lng);
        
        // Enhanced site proximity check that triggers route recalculation
        if (siteLocations.length > 0) {
          const siteReached = checkSiteProximity([lng, lat], siteLocations);
          // If a site was reached and completed, force immediate route recalculation
          if (siteReached) {
            console.log('Site completed during simulation, forcing immediate route recalculation');
            // Use the current fake location for recalculation
            setTimeout(() => {
              recalculateRouteFromCurrentPosition([lng, lat]);
            }, 100);
          }
        }
        
        currentIndex++;
        
      } catch (error) {
        console.error('❌ Failed to send route location:', error);
      }
    }, updateInterval);

    return fakeLocationIntervalRef.current;
  };

  // NEW: Updated startRealtimeLocationTracking to use the enhanced system
  const startRealtimeLocationTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }
  
    stopRealtimeLocationTracking();
  
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // Reduced timeout for faster updates
      maximumAge: 0
    };
  
    console.log('Starting continuous real-time location tracking...');
  
    let lastSentTime = 0;
    const MIN_UPDATE_INTERVAL = 5000; // Send updates every 5 seconds minimum
  
    locationWatcherRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const currentPos = [longitude, latitude];
        const currentTime = Date.now();
        
        // Throttle updates to prevent excessive API calls
        if (currentTime - lastSentTime < MIN_UPDATE_INTERVAL) {
          return;
        }
  
        console.log('Sending location update to backend:', {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy
        });
        
        try {
          await sendLocationToReverb(latitude, longitude, accuracy);
          lastSentTime = currentTime;
        } catch (error) {
          console.error('Failed to send location to backend:', error);
        }
        
        setCurrentLocationState(currentPos);
        setLocationAccuracy(accuracy);
        setLastLocationUpdate(new Date());
        
        // Enhanced smooth update with route recalculation
        smoothUpdateUserLocation(latitude, longitude);
        
        // Auto-complete sites when close
        if (siteLocations.length > 0) {
          checkSiteProximity(currentPos, siteLocations);
        }
      },
      (error) => {
        console.error('Error in real-time location tracking:', error);
        handleLocationError(error);
      },
      options
    );
  
    // Add user interaction tracking for map following
    if (map.current) {
      map.current.hasUserInteracted = () => false;
      map.current.on('movestart', () => {
        map.current.hasUserInteracted = () => true;
      });
    }
  };

  const stopRealtimeLocationTracking = () => {
    if (locationWatcherRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatcherRef.current);
      locationWatcherRef.current = null;
    }
    clearUserLocationLayers();
  };

  const startRealtimeLocationSharing = async (scheduleId) => {
    if (!navigator.geolocation) {
        console.error('Geolocation not supported');
        return;
    }

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
                // Send location to server
                const response = await axios.post('/driver/location/update', {
                    latitude: latitude,
                    longitude: longitude,
                    schedule_id: scheduleId
                });

                if (response.data.success) {
                    console.log('Location updated and broadcasted');
                    
                    // Update local state with smooth animation
                    setCurrentLocationState([longitude, latitude]);
                    smoothUpdateUserLocation(latitude, longitude);
                    
                    // Check site proximity
                    if (siteLocations.length > 0) {
                        checkSiteProximity([longitude, latitude], siteLocations);
                    }
                }
            } catch (error) {
                console.error('Failed to update location:', error);
            }
        },
        (error) => {
            console.error('Location tracking error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );

    return watchId;
  };

  return {
    // Refs
    locationWatcherRef,
    fakeLocationIntervalRef,
    animationFrameRef,
    currentLocationMarkerRef,
    userLocationSourceRef,
    userLocationLayerRef,
    
    // State
    isFakeLocationActive,
    currentLocation: currentLocationState,
    locationAccuracy,
    lastLocationUpdate,
    
    // Setters
    setCurrentLocation: setCurrentLocationState,
    setLocationAccuracy,
    setLastLocationUpdate,
    setIsFakeLocationActive,
    
    // Methods
    startFakeLocationTest,
    stopFakeLocationTest,
    sendTestLocation,
    simulateRouteFollowing,
    startRealtimeLocationTracking,
    stopRealtimeLocationTracking,
    startRealtimeLocationSharing,
    sendLocationToReverb,
    handleLocationError,
    updateCurrentLocationMarker,
    updateUserLocationSource,
    animatePulse,
    clearUserLocationLayers,
  };
};