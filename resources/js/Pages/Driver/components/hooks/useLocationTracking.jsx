import { useRef, useState, useCallback } from 'react';
import axios from 'axios';

export const useLocationTracking = ({ 
  map, 
  scheduleId, 
  activeSchedule, 
  isTaskActive, 
  isMobile,
  siteLocations,
  completedSites,
  optimizedSiteOrder,
  onTaskComplete 
}) => {
  const locationWatcherRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const userLocationSourceRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);

  const sendLocationToReverb = async (latitude, longitude, accuracy = null) => {
    if (!scheduleId) {
      console.error('No schedule ID available');
      return;
    }
  
    try {
      const barangayId = activeSchedule?.barangay_id || 'unknown';
  
      const response = await axios.post('/driver/location/update', {
        latitude: latitude,
        longitude: longitude,
        accuracy: accuracy,
        schedule_id: scheduleId,
        barangay_id: barangayId,
      });
  
      if (response.data.success) {
        console.log('Location broadcasted via Reverb');
      }
    } catch (error) {
      console.error('Failed to broadcast location:', error);
    }
  };

  const updateUserLocationSource = useCallback((lng, lat) => {
    if (!map.current) return;

    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            description: 'Driver current location'
          }
        }
      ]
    };

    if (!map.current.getSource('driver-location')) {
      map.current.addSource('driver-location', {
        type: 'geojson',
        data: geojson
      });

      map.current.addLayer({
        id: 'driver-location-layer',
        type: 'circle',
        source: 'driver-location',
        paint: {
          'circle-radius': 8,
          'circle-color': '#2563eb',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      map.current.addLayer({
        id: 'driver-location-pulse',
        type: 'circle',
        source: 'driver-location',
        paint: {
          'circle-radius': {
            'base': 8,
            'stops': [
              [0, 8],
              [20, 25]
            ]
          },
          'circle-color': '#2563eb',
          'circle-opacity': {
            'base': 0.4,
            'stops': [
              [0, 0.4],
              [1, 0]
            ]
          },
          'circle-stroke-width': 1,
          'circle-stroke-color': '#2563eb'
        }
      });

      userLocationSourceRef.current = map.current.getSource('driver-location');
      userLocationLayerRef.current = 'driver-location-layer';
    } else {
      const source = map.current.getSource('driver-location');
      if (source) {
        source.setData(geojson);
      }
    }

    animatePulse();
  }, [map]);

  const animatePulse = useCallback(() => {
    if (!map.current || !map.current.getLayer('driver-location-pulse')) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startTime = Date.now();
    const duration = 2000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;

      const pulseRadius = 8 + (progress * 17);
      map.current.setPaintProperty('driver-location-pulse', 'circle-radius', pulseRadius);
      map.current.setPaintProperty('driver-location-pulse', 'circle-opacity', 0.4 * (1 - progress));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [map]);

  const smoothUpdateUserLocation = useCallback((lat, lng) => {
    if (!map.current) return;

    const coordinates = [lng, lat];
    
    updateUserLocationSource(lng, lat);

    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setLngLat(coordinates);
    }

    if (isTaskActive && map.current && !map.current.hasUserInteracted()) {
      map.current.flyTo({
        center: coordinates,
        zoom: isMobile ? 16 : 15,
        speed: 0.8,
        curve: 1,
        essential: true,
        duration: 1000
      });
    }
  }, [map, isTaskActive, isMobile, updateUserLocationSource]);

  const startRealtimeLocationTracking = useCallback(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }
  
    stopRealtimeLocationTracking();
  
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
  
    console.log('Starting real-time location tracking with dynamic route updates...');
  
    locationWatcherRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const currentPos = [longitude, latitude];
        
        console.log('Location updated:', {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy
        });
        
        try {
          await sendLocationToReverb(latitude, longitude, accuracy);
        } catch (error) {
          console.error('Failed to send location to Reverb:', error);
        }
        
        setCurrentLocation(currentPos);
        setLocationAccuracy(accuracy);
        setLastLocationUpdate(new Date());
        
        smoothUpdateUserLocation(latitude, longitude);
        
        if (siteLocations.length > 0) {
          // checkSiteProximity would be called here from parent hook
        }
      },
      (error) => {
        console.error('Error in real-time location tracking:', error);
        handleLocationError(error);
      },
      options
    );
  
    if (map.current) {
      map.current.hasUserInteracted = () => false;
      map.current.on('movestart', () => {
        map.current.hasUserInteracted = () => true;
      });
    }
  }, [map, scheduleId, activeSchedule, siteLocations, smoothUpdateUserLocation]);

  const stopRealtimeLocationTracking = useCallback(() => {
    if (locationWatcherRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatcherRef.current);
      locationWatcherRef.current = null;
    }
    clearUserLocationLayers();
  }, []);

  const clearUserLocationLayers = useCallback(() => {
    if (!map.current) return;

    ['driver-location-layer', 'driver-location-pulse'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    if (map.current.getSource('driver-location')) {
      map.current.removeSource('driver-location');
    }

    userLocationSourceRef.current = null;
    userLocationLayerRef.current = null;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [map]);

  const handleLocationError = (error) => {
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
        setTimeout(startRealtimeLocationTracking, 5000);
        break;
      default:
        errorMessage += 'Unknown location error.';
        break;
    }
    
    console.warn(errorMessage);
  };

  const updateCurrentLocationMarker = useCallback((coordinates) => {
    if (!map.current) return;

    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.remove();
    }

    const markerElement = document.createElement('div');
    markerElement.className = 'current-location-marker';
    const markerSize = isMobile ? 'w-8 h-8' : 'w-6 h-6';
    markerElement.innerHTML = `
      <div class="relative">
        <div class="${markerSize} bg-blue-600 border-2 border-white rounded-full shadow-lg z-50"></div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
      </div>
    `;

    currentLocationMarkerRef.current = new mapboxgl.Marker({
      element: markerElement,
      draggable: false
    })
    .setLngLat(coordinates)
    .addTo(map.current);
  }, [map, isMobile]);

  const updateLocationManually = useCallback((latitude, longitude) => {
    const currentPos = [longitude, latitude];
    setCurrentLocation(currentPos);
    smoothUpdateUserLocation(latitude, longitude);
  }, [smoothUpdateUserLocation]);

  return {
    currentLocation,
    locationAccuracy,
    lastLocationUpdate,
    currentLocationMarkerRef,
    
    startRealtimeLocationTracking,
    stopRealtimeLocationTracking,
    updateLocationManually,
    smoothUpdateUserLocation,
    updateCurrentLocationMarker,
    sendLocationToReverb,
    clearUserLocationLayers
  };
};