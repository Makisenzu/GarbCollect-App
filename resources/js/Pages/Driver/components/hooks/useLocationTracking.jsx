import { useRef, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useLocationTracking = (scheduleId, activeSchedule, isTaskActive) => {
  const locationWatcherRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);

  const sendLocationToReverb = useCallback(async (latitude, longitude, accuracy = null) => {
    if (!scheduleId) {
      console.error('No schedule ID available');
      return;
    }

    try {
      const barangayId = activeSchedule?.barangay_id || 'unknown';

      await axios.post('/driver/location/update', {
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
        schedule_id: scheduleId,
        barangay_id: barangayId,
      });
    } catch (error) {
      console.error('Failed to broadcast location:', error);
    }
  }, [scheduleId, activeSchedule]);

  const handleLocationError = useCallback((error) => {
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
        break;
      default:
        errorMessage += 'Unknown location error.';
        break;
    }
    
    console.warn(errorMessage);
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    stopTracking();

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    console.log('Starting real-time location tracking...');

    locationWatcherRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const currentPos = [longitude, latitude];
        
        try {
          await sendLocationToReverb(latitude, longitude, accuracy);
        } catch (error) {
          console.error('Failed to send location to Reverb:', error);
        }
        
        setCurrentLocation(currentPos);
        setLocationAccuracy(accuracy);
        setLastLocationUpdate(new Date());
      },
      (error) => {
        console.error('Error in real-time location tracking:', error);
        handleLocationError(error);
      },
      options
    );
  }, [sendLocationToReverb, handleLocationError]);

  const stopTracking = useCallback(() => {
    if (locationWatcherRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatcherRef.current);
      locationWatcherRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    currentLocation,
    locationAccuracy,
    lastLocationUpdate,
    startTracking,
    stopTracking,
    setCurrentLocation
  };
};