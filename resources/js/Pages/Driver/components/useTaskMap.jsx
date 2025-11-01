import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { GiControlTower } from "react-icons/gi";
import can from "@/images/can.png";

export const useTaskMap = ({ mapboxKey, scheduleId, onTaskComplete, onTaskCancel }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const siteMarkersRef = useRef([]);
  const locationWatcherRef = useRef(null);
  const currentLocationMarkerRef = useRef(null);
  const offlineRouteCache = useRef(new Map());
  
  // Add these new refs for real-time tracking
  const userLocationSourceRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Fake location testing refs
  const fakeLocationIntervalRef = useRef(null);
  const [isFakeLocationActive, setIsFakeLocationActive] = useState(false);

  const [cssLoaded, setCssLoaded] = useState(false);
  const [siteLocations, setSiteLocations] = useState([]);
  const [stationLocation, setStationLocation] = useState(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [customStyleLoaded, setCustomStyleLoaded] = useState(false);
  const [aiOptimizedRoute, setAiOptimizedRoute] = useState(null);
  const [nearestSiteToStation, setNearestSiteToStation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [completedSites, setCompletedSites] = useState(new Set());
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0);
  const [isTaskActive, setIsTaskActive] = useState(false);

  const barangayColors = {
    'Alegria': '#FF5733',
    'Barangay 1': '#33FF57',
    'Barangay 2': '#3357FF',
    'Barangay 3': '#F033FF',
    'Barangay 4': '#FF33F0',
    'Barangay 5': '#33FFF0',
    'Bayugan 2': '#8A2BE2',
    'Bitan-agan': '#A52A2A',
    'Borbon': '#DEB887',
    'Buenasuerte': '#5F9EA0',
    'Caimpugan': '#7FFF00',
    'Das-agan': '#D2691E',
    'Ebro': '#FF7F50',
    'Hubang': '#6495ED',
    'Karaus': '#DC143C',
    'Ladgadan': '#00FFFF',
    'Lapinigan': '#00008B',
    'Lucac': '#008B8B',
    'Mate': '#B8860B',
    'New Visayas': '#006400',
    'Ormaca': '#8B008B',
    'Pasta': '#556B2F',
    'Pisa-an': '#FF8C00',
    'Rizal': '#9932CC',
    'San Isidro': '#8FBC8F',
    'Santa Ana': '#483D8B',
    'Tagapua': '#2F4F4F',
    'San Francisco': '#FFE659',
    '_default': '#4F262A'
  };

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

  // ==================== EXISTING FUNCTIONS ====================

  // NEW: Get the next uncompleted site index
  const getNextUncompletedSiteIndex = () => {
    for (let i = 0; i < optimizedSiteOrder.length; i++) {
      if (!completedSites.has(optimizedSiteOrder[i].id)) {
        return i;
      }
    }
    return -1; // All sites completed
  };

  // NEW: Check if all sites are completed
  const areAllSitesCompleted = () => {
    return completedSites.size === siteLocations.length;
  };

  // NEW: Create straight line route as fallback
  const createStraightLineRoute = (currentPos, nextSite) => {
    if (!currentPos || !nextSite) return;
    
    const straightLineCoords = [
      currentPos,
      [parseFloat(nextSite.longitude), parseFloat(nextSite.latitude)]
    ];
    
    setRouteCoordinates(straightLineCoords);
    
    const distance = calculateDistance(
      currentPos[1], currentPos[0],
      parseFloat(nextSite.latitude), parseFloat(nextSite.longitude)
    );
    
    const estimatedDuration = Math.round(distance * 2); // Rough estimate: 2 min per km
    
    setRouteInfo({
      duration: estimatedDuration,
      formattedDuration: formatDuration(estimatedDuration),
      distance: distance.toFixed(1),
      toSite: nextSite.site_name,
      isFallback: true,
      recalculated: true
    });
    
    setTimeout(() => {
      if (map.current) {
        addRouteLayer();
      }
    }, 300);
  };

  // NEW: Recalculate route from current position to next target site
  const recalculateRouteFromCurrentPosition = async (currentPos) => {
    if (!currentPos || !optimizedSiteOrder.length) return;
    
    // Get the current target site (next uncompleted site)
    const nextSiteIndex = getNextUncompletedSiteIndex();
    if (nextSiteIndex === -1) {
      console.log('All sites completed, no route to recalculate');
      return;
    }
    
    const nextSite = optimizedSiteOrder[nextSiteIndex];
    
    console.log(`Recalculating route from current position to: ${nextSite.site_name}`);
    
    try {
      const coordinatesString = `${currentPos[0]},${currentPos[1]};${parseFloat(nextSite.longitude)},${parseFloat(nextSite.latitude)}`;
      
      const cacheKey = `current_to_site_${nextSite.id}_${Date.now()}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      // Use cached route if available and offline
      if (cachedRoute && !isOnline) {
        console.log('Using cached route (offline mode)');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: nextSite.site_name,
          recalculated: true
        });
        
        setTimeout(() => {
          if (map.current) {
            addRouteLayer();
          }
        }, 100);
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?` +
        `access_token=${mapboxKey}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationMinutes = Math.round(route.duration / 60);
        
        const routeInfo = {
          route: route.geometry.coordinates,
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (route.distance / 1000).toFixed(1),
          toSite: nextSite.site_name
        };

        setRouteCoordinates(route.geometry.coordinates);
        setRouteInfo({
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (route.distance / 1000).toFixed(1),
          toSite: nextSite.site_name,
          recalculated: true
        });

        // Cache the new route
        cacheRoute(cacheKey, routeInfo);
        
        console.log(`Route recalculated: Current position → ${nextSite.site_name}`);
        
        // Update the route layer
        setTimeout(() => {
          if (map.current && route.geometry.coordinates.length > 0) {
            addRouteLayer();
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error recalculating route from current position:', error);
      
      // Fallback: create straight line route
      createStraightLineRoute(currentPos, nextSite);
    }
  };

  // NEW: Check if we should recalculate the route
  const shouldRecalculateRoute = (currentPos) => {
    if (!currentLocation || !routeCoordinates.length || routeCoordinates.length < 2) {
      return true; // No existing route, always recalculate
    }
    
    // Calculate distance from current position to the start of the current route
    const distanceToRouteStart = calculateDistance(
      currentPos[1], currentPos[0],
      routeCoordinates[0][1], routeCoordinates[0][0]
    );
    
    // ALWAYS recalculate if we have completed sites and the route isn't already recalculated
    // OR if driver is significantly off-route
    const hasCompletedSites = completedSites.size > 0;
    const isOffRoute = distanceToRouteStart > 0.2; // 200 meters
    const isNotRecalculated = !routeInfo?.recalculated;
    
    const shouldRecalc = isOffRoute || (hasCompletedSites && isNotRecalculated);
    
    if (shouldRecalc) {
      console.log(`Recalculating route - Off route: ${isOffRoute}, Completed sites: ${completedSites.size}, Already recalculated: ${routeInfo?.recalculated}`);
    }
    
    return shouldRecalc;
  };

  // NEW: Enhanced smooth location update with route recalculation
  const smoothUpdateUserLocation = (lat, lng) => {
    if (!map.current) return;

    const coordinates = [lng, lat];
    
    // Update the GeoJSON source for smooth transitions
    updateUserLocationSource(lng, lat);

    // Also update the marker position
    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.setLngLat(coordinates);
    }

    // Check if we should recalculate the route
    if (shouldRecalculateRoute(coordinates)) {
      recalculateRouteFromCurrentPosition(coordinates);
    }

    // Smoothly move the map to follow user when tracking is active
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
  };

  // NEW: Update user location source for smooth animations
  const updateUserLocationSource = (lng, lat) => {
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

    // Check if source already exists
    if (!map.current.getSource('driver-location')) {
      map.current.addSource('driver-location', {
        type: 'geojson',
        data: geojson
      });

      // Add layer for the driver location
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

      // Add pulsing effect layer
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
      // Smoothly update the existing source
      const source = map.current.getSource('driver-location');
      if (source) {
        source.setData(geojson);
      }
    }

    // Animate the pulse effect
    animatePulse();
  };

  // NEW: Pulse animation for driver location
  const animatePulse = () => {
    if (!map.current || !map.current.getLayer('driver-location-pulse')) return;

    // Cancel any existing animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startTime = Date.now();
    const duration = 2000; // 2 seconds per pulse

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;

      // Update circle radius based on progress
      const pulseRadius = 8 + (progress * 17); // 8 to 25

      map.current.setPaintProperty('driver-location-pulse', 'circle-radius', pulseRadius);
      map.current.setPaintProperty('driver-location-pulse', 'circle-opacity', 0.4 * (1 - progress));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // NEW: Enhanced fit function that includes driver position
  const fitMapToRouteAndDriver = () => {
    if (!map.current || routeCoordinates.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    
    // Include all route coordinates
    routeCoordinates.forEach(coord => {
      bounds.extend(coord);
    });
    
    // Include driver's current position
    if (currentLocation) {
      bounds.extend(currentLocation);
    }
    
    // Include next target site
    const nextSiteIndex = getNextUncompletedSiteIndex();
    if (nextSiteIndex !== -1 && optimizedSiteOrder[nextSiteIndex]) {
      const nextSite = optimizedSiteOrder[nextSiteIndex];
      bounds.extend([parseFloat(nextSite.longitude), parseFloat(nextSite.latitude)]);
    }

    const padding = isMobile ? 40 : 80;

    try {
      map.current.fitBounds(bounds, {
        padding: padding,
        duration: 1000,
        essential: true,
        maxZoom: isMobile ? 16 : 15
      });
    } catch (error) {
      console.error('Error fitting map to bounds:', error);
    }
  };

  // NEW: Clear real-time location layers
  const clearUserLocationLayers = () => {
    if (!map.current) return;

    // Remove driver location layers
    ['driver-location-layer', 'driver-location-pulse'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    // Remove route layers
    ['route', 'route-glow', 'route-direction', 'route-recalculated'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    // Remove sources
    if (map.current.getSource('driver-location')) {
      map.current.removeSource('driver-location');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    userLocationSourceRef.current = null;
    userLocationLayerRef.current = null;
    
    // Stop animation
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

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
        timestamp: new Date().toISOString(),
      });
  
      if (response.data.success) {
        console.log('Location successfully sent to backend');
      }
    } catch (error) {
      console.error('Failed to send location to backend:', error);
      throw error; // Re-throw to handle in calling function
    }
  };

  const startTaskAndBroadcast = async () => {
    if (!scheduleId) {
      console.error('Cannot start task: missing schedule ID');
      return;
    }
  
    try {
      const barangayId = activeSchedule?.barangay_id || 'unknown';
  
      const response = await axios.post('/schedule/start', {
        schedule_id: scheduleId,
        barangay_id: barangayId
      });
  
      if (response.data.success) {
        console.log('Task started and broadcasted to residents');
        setIsTaskActive(true);
        
        if (response.data.data) {
          setActiveSchedule(prev => ({
            ...prev,
            ...response.data.data,
            status: 'in_progress'
          }));
        }
        
        startRealtimeLocationTracking();
      }
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const completeTaskAndBroadcast = async () => {
    if (!scheduleId) {
      console.error('Cannot complete task: missing schedule ID');
      return;
    }

    try {
      const response = await axios.post('/schedule/complete', {
        schedule_id: scheduleId
      });

      if (response.data.success) {
        console.log('Task completed and broadcasted to residents');
        setIsTaskActive(false);
        stopRealtimeLocationTracking();
        
        if (onTaskComplete) {
          onTaskComplete();
        }
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
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
        
        setCurrentLocation(currentPos);
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

  const updateCurrentLocationMarker = (coordinates) => {
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
  };

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

  const checkSiteProximity = (currentPos, sites) => {
    if (!currentPos || sites.length === 0) return false;
  
    const [longitude, latitude] = currentPos;
    const PROXIMITY_THRESHOLD = 0.05;
    let siteReached = false;
  
    sites.forEach((site, index) => {
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
        markSiteAsCompleted(site, index);
        siteReached = true;
      }
    });
  
    return siteReached;
  };

  // FIXED: Updated markSiteAsCompleted function to immediately recalculate route for both real and fake locations
  const markSiteAsCompleted = (site, index) => {
    console.log(`Site reached: ${site.site_name}`);
    
    // Add site to completed set
    setCompletedSites(prev => {
      const newCompleted = new Set(prev).add(site.id);
      
      // Check if all sites are completed
      if (newCompleted.size === siteLocations.length) {
        console.log('🎉 All sites completed! Task finished.');
        if (onTaskComplete) {
          onTaskComplete(site);
        }
      } else {
        console.log(`Progress: ${newCompleted.size}/${siteLocations.length} sites completed`);
      }
      
      return newCompleted;
    });
    
    // Update current site index and IMMEDIATELY recalculate route to next site
    if (optimizedSiteOrder.length > 0) {
      const currentIndex = optimizedSiteOrder.findIndex(s => s.id === site.id);
      if (currentIndex !== -1 && currentIndex < optimizedSiteOrder.length - 1) {
        const nextSiteIndex = currentIndex + 1;
        setCurrentSiteIndex(nextSiteIndex);
        
        const nextSite = optimizedSiteOrder[nextSiteIndex];
        console.log(`Moving to next site: ${nextSite.site_name}`);
        
        // IMMEDIATELY recalculate route when a site is completed
        // For both real AND fake locations
        if (currentLocation) {
          console.log('Immediately recalculating route from current location to next site');
          recalculateRouteFromCurrentPosition(currentLocation);
        } else {
          console.log('No current location available for immediate route recalculation');
        }
      } else if (currentIndex === optimizedSiteOrder.length - 1) {
        console.log('🏁 Last site reached!');
        setCurrentSiteIndex(currentIndex);
      }
    }
    
    // Update markers to reflect completion status
    updateSiteMarkers();
    
    // Show completion notification for individual site
    showCompletionNotification(site.site_name);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${mins}min`;
      }
    }
  };

  const calculateRouteToNextSite = async (currentPos, nextSite) => {
    if (!currentPos || !nextSite || !mapboxKey) return;

    try {
      const coordinatesString = `${currentPos[0]},${currentPos[1]};${parseFloat(nextSite.longitude)},${parseFloat(nextSite.latitude)}`;
      
      console.log(`Calculating route to next site: ${nextSite.site_name}`);
      
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?` +
        `access_token=${mapboxKey}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationMinutes = Math.round(route.duration / 60);
        
        setRouteCoordinates(route.geometry.coordinates);
        setRouteInfo({
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (route.distance / 1000).toFixed(1),
          toSite: nextSite.site_name
        });

        setTimeout(() => {
          if (map.current && route.geometry.coordinates.length > 0) {
            addRouteLayer();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error calculating route to next site:', error);
    }
  };

  const showCompletionNotification = (siteName) => {
    console.log(`Site completed: ${siteName}`);
    
    if (isMobile) {
      // Show mobile-friendly notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-center';
      notification.innerHTML = `
        <div class="font-semibold">✅ ${siteName} Completed!</div>
        <div class="text-sm opacity-90">Progress: ${completedSites.size + 1}/${siteLocations.length} sites</div>
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
        <div class="text-xs opacity-90">${completedSites.size + 1}/${siteLocations.length} sites</div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }
  };

  const updateSiteMarkers = () => {
    clearSiteMarkers();
    addSiteMarkers();
  };

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
                    setCurrentLocation([longitude, latitude]);
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

  // Cache management for offline use
  const cacheRoute = (key, routeData) => {
    const cacheEntry = {
      data: routeData,
      timestamp: Date.now(),
      ttl: 24 * 60 * 60 * 1000 
    };
    offlineRouteCache.current.set(key, cacheEntry);
    
    try {
      const cache = JSON.parse(localStorage.getItem('routeCache') || '{}');
      cache[key] = cacheEntry;
      localStorage.setItem('routeCache', JSON.stringify(cache));
    } catch (e) {
      console.warn('Failed to cache route in localStorage:', e);
    }
  };

  const getCachedRoute = (key) => {
    // Try memory cache first
    const memoryCache = offlineRouteCache.current.get(key);
    if (memoryCache && (Date.now() - memoryCache.timestamp) < memoryCache.ttl) {
      return memoryCache.data;
    }

    // Try localStorage cache
    try {
      const cache = JSON.parse(localStorage.getItem('routeCache') || '{}');
      const storedCache = cache[key];
      if (storedCache && (Date.now() - storedCache.timestamp) < storedCache.ttl) {
        offlineRouteCache.current.set(key, storedCache);
        return storedCache.data;
      }
    } catch (e) {
      console.warn('Failed to read route from cache:', e);
    }

    return null;
  };

  const formatDurationForAI = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
      }
    }
  };

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

  useEffect(() => {
    const loadMapboxCSS = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      link.onload = () => {
        setCssLoaded(true);
      };
      link.onerror = () => {
        console.error('Failed to load Mapbox CSS');
        setMapError('Failed to load map styles');
      };
      
      document.head.appendChild(link);

      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    };

    loadMapboxCSS();
  }, []);

  // Find the site that is nearest to the station
  const findNearestSiteToStation = (station, sites) => {
    if (!station || sites.length === 0) return null;

    let nearestSite = null;
    let minDistance = Infinity;

    sites.forEach(site => {
      if (site.longitude && site.latitude) {
        const distance = calculateDistance(
          parseFloat(station.latitude), parseFloat(station.longitude),
          parseFloat(site.latitude), parseFloat(site.longitude)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestSite = site;
        }
      }
    });

    return nearestSite;
  };

  // Calculate route from current location to the site nearest to station
  const calculateRouteToNearestSiteFromStation = async (currentPos, nearestSiteToStation) => {
    if (!currentPos || !nearestSiteToStation || !mapboxKey) {
      console.log('Missing data for route calculation:', {
        currentPos, 
        nearestSiteToStation, 
        mapboxKey: !!mapboxKey
      });
      return;
    }

    try {
      const coordinatesString = `${currentPos[0]},${currentPos[1]};${parseFloat(nearestSiteToStation.longitude)},${parseFloat(nearestSiteToStation.latitude)}`;
      
      console.log('Calculating route from current location to nearest site from station:', coordinatesString);
      
      const cacheKey = `current_to_nearest_from_station_${coordinatesString}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached route to nearest site from station (offline mode)');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: nearestSiteToStation.site_name
        });
        
        setTimeout(() => {
          if (map.current) {
            addRouteLayer();
          }
        }, 100);
        
        return cachedRoute;
      }

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?` +
        `access_token=${mapboxKey}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationMinutes = Math.round(route.duration / 60);
        
        const routeInfo = {
          route: route.geometry.coordinates,
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (route.distance / 1000).toFixed(1),
          toSite: nearestSiteToStation.site_name
        };

        setRouteCoordinates(route.geometry.coordinates);
        setRouteInfo({
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (route.distance / 1000).toFixed(1),
          toSite: nearestSiteToStation.site_name
        });

        cacheRoute(cacheKey, routeInfo);
        
        console.log(`Route calculated: Your location → ${nearestSiteToStation.site_name} (nearest to station)`);
        
        setTimeout(() => {
          if (map.current && route.geometry.coordinates.length > 0) {
            addRouteLayer();
          }
        }, 500);

        return routeInfo;
      }
    } catch (error) {
      console.error('Error calculating route to nearest site from station:', error);
      
      const fallbackKey = `current_to_nearest_from_station_${nearestSiteToStation.id}`;
      const cachedRoute = getCachedRoute(fallbackKey);
      
      if (cachedRoute) {
        console.log('Using cached route as fallback');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: nearestSiteToStation.site_name
        });
        
        setTimeout(() => {
          if (map.current) {
            addRouteLayer();
          }
        }, 100);
      }
    }
    return null;
  };

  // Effect to trigger route calculation when all data is available
  useEffect(() => {
    if (currentLocation && nearestSiteToStation && mapInitialized) {
      console.log('All data available, calculating route automatically');
      calculateRouteToNearestSiteFromStation(currentLocation, nearestSiteToStation);
    }
  }, [currentLocation, nearestSiteToStation, mapInitialized]);

  useEffect(() => {
    const fetchScheduleAndSites = async () => {
      if (!scheduleId) {
        console.warn('No schedule ID provided');
        return;
      }
      
      setLoading(true);
      try {
        let scheduleData = null;
        
        // Try to fetch schedule details
        try {
          const scheduleResponse = await axios.get(`/schedules/${scheduleId}`);
          if (scheduleResponse.data.success && scheduleResponse.data.data) {
            scheduleData = scheduleResponse.data.data;
            setActiveSchedule(scheduleData);
            console.log('Schedule data loaded:', scheduleData);
          } else {
            console.warn('No schedule data received from API');
          }
        } catch (scheduleError) {
          console.warn('Could not fetch schedule details:', scheduleError);
          // Create a minimal schedule object if API fails
          scheduleData = {
            id: scheduleId,
            barangay_id: 'unknown',
            status: 'pending'
          };
          setActiveSchedule(scheduleData);
        }
  
        // Then fetch sites if we have a valid barangay_id
        if (scheduleData?.barangay_id && scheduleData.barangay_id !== 'unknown') {
          try {
            const sitesResponse = await axios.get(`/barangay/${scheduleData.barangay_id}/sites?status=active`);
            if (sitesResponse.data.success) {
              const activeSites = sitesResponse.data.data;
              console.log('Sites loaded:', activeSites.length);
              
              const station = activeSites.find(site => site.type === 'station');
              const regularSites = activeSites.filter(site => site.type !== 'station');
              
              if (station) {
                setStationLocation({
                  ...station,
                  coordinates: [parseFloat(station.longitude), parseFloat(station.latitude)]
                });
                
                if (regularSites.length > 0) {
                  const nearestToStation = findNearestSiteToStation(station, regularSites);
                  setNearestSiteToStation(nearestToStation);
                  console.log('Nearest site to station found:', nearestToStation?.site_name);
                  
                  const optimizedOrder = optimizeSiteOrderFromStation(station, regularSites);
                  setOptimizedSiteOrder(optimizedOrder);
                  setCurrentSiteIndex(0);
                }
              }
              
              setSiteLocations(regularSites);
            }
          } catch (sitesError) {
            console.error('Error fetching sites:', sitesError);
          }
        } else {
          console.warn('No valid barangay_id available to fetch sites');
        }
  
      } catch (error) {
        console.error('Error in schedule and sites setup: ', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScheduleAndSites();
  }, [scheduleId]);

  useEffect(() => {
    if (!cssLoaded || !mapboxKey || map.current || !mapContainer.current) {
      return;
    }

    try {
      mapboxgl.accessToken = mapboxKey;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
        center: [125.94849837776422, 8.483022468128098],
        zoom: isMobile ? 11 : 10.5,
        attributionControl: false,
        interactive: true,
        scrollZoom: true,
        dragPan: true,
        dragRotate: false,
        keyboard: false,
        doubleClickZoom: !isMobile,
        touchZoomRotate: true,
        touchPitch: false,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: true
      });

      map.current.on('load', () => {
        setMapInitialized(true);
        setCustomStyleLoaded(true);
        console.log('Map loaded and initialized');
        
        startRealtimeLocationTracking();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map: ' + e.error?.message);
        
        if (isOnline) {
          console.warn('Map loading failed but continuing in limited mode');
        }
      });

      map.current.on('idle', () => {
        // Map is ready and tiles are loaded
      });

    } catch (error) {
      console.error('Error creating map:', error);
      setMapError('Failed to initialize map: ' + error.message);
    }

    return () => {
      stopRealtimeLocationTracking();
      stopFakeLocationTest(); // Stop fake location when component unmounts
      clearUserLocationLayers();
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
        setCustomStyleLoaded(false);
      }
    };
  }, [mapboxKey, cssLoaded, isMobile]);

  useEffect(() => {
    if (mapInitialized && customStyleLoaded && siteLocations.length > 0) {
      clearSiteMarkers();
      addSiteMarkers();
      
      if (routeCoordinates.length > 0) {
        setTimeout(() => {
          addRouteLayer();
        }, 300);
      }
    }
  }, [mapInitialized, customStyleLoaded, siteLocations, routeCoordinates, optimizedSiteOrder, nearestSiteToStation, completedSites]);

  const optimizeSiteOrderFromStation = (station, sites) => {
    if (!station || sites.length === 0) return sites;

    const remainingSites = [...sites];
    const optimizedOrder = [];
    
    const sitesWithDistances = remainingSites.map(site => {
      const distance = calculateDistance(
        parseFloat(station.latitude), parseFloat(station.longitude),
        parseFloat(site.latitude), parseFloat(site.longitude)
      );
      return {
        ...site,
        distance,
        coordinates: [parseFloat(site.longitude), parseFloat(site.latitude)]
      };
    });

    sitesWithDistances.sort((a, b) => a.distance - b.distance);

    const nearestSite = sitesWithDistances[0];
    optimizedOrder.push(nearestSite);
    
    const remaining = sitesWithDistances.slice(1);
    
    let currentSite = nearestSite;
    
    while (remaining.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const distance = calculateDistance(
          parseFloat(currentSite.latitude), parseFloat(currentSite.longitude),
          parseFloat(remaining[i].latitude), parseFloat(remaining[i].longitude)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      if (nearestIndex !== -1) {
        currentSite = remaining[nearestIndex];
        optimizedOrder.push(currentSite);
        remaining.splice(nearestIndex, 1);
      }
    }

    return optimizedOrder;
  };

  const analyzeAndOptimizeRouteFromStation = async (station, sites) => {
    if (!station || sites.length === 0) return null;

    try {
      const optimizedOrder = optimizeSiteOrderFromStation(station, sites);
      setOptimizedSiteOrder(optimizedOrder);
      
      const nearest = optimizedOrder[0];
      setNearestSiteToStation(nearest);

      const allCoordinates = [
        [parseFloat(station.longitude), parseFloat(station.latitude)],
        ...optimizedOrder.map(site => [parseFloat(site.longitude), parseFloat(site.latitude)])
      ];

      const coordinatesString = allCoordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      
      const cacheKey = `route_${coordinatesString}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached route (offline mode)');
        const aiResult = {
          ...cachedRoute,
          isCached: true
        };
        setAiOptimizedRoute(aiResult);
        setRouteCoordinates(cachedRoute.route);
        return aiResult;
      }

      const routeResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${coordinatesString}?` +
        `access_token=${mapboxKey}&geometries=geojson&overview=full&steps=true`
      );

      if (!routeResponse.ok) {
        throw new Error(`HTTP ${routeResponse.status}: ${routeResponse.statusText}`);
      }

      const routeData = await routeResponse.json();

      if (routeData.routes && routeData.routes.length > 0) {
        const optimalRoute = routeData.routes[0];
        const durationMinutes = Math.round(optimalRoute.duration / 60);
        
        const aiResult = {
          station: station,
          nearestSite: nearest,
          optimizedOrder: optimizedOrder,
          route: optimalRoute.geometry.coordinates,
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (optimalRoute.distance / 1000).toFixed(1),
          trafficConditions: analyzeTrafficConditions(optimalRoute),
          recommendation: generateRecommendation(optimalRoute, nearest, durationMinutes, optimizedOrder.length),
          isCached: false
        };

        setAiOptimizedRoute(aiResult);
        
        cacheRoute(cacheKey, aiResult);
        
        if (isMobile) {
          setShowAIPanel(true);
        }
        
        return aiResult;
      }
    } catch (error) {
      console.error('AI route analysis from station failed:', error);
      
      const fallbackRoute = getCachedRoute(`route_station_${station.id}`);
      if (fallbackRoute) {
        console.log('Using cached route as fallback');
        setAiOptimizedRoute({ ...fallbackRoute, isCached: true });
        setRouteCoordinates(fallbackRoute.route);
        return fallbackRoute;
      }
    }
    return null;
  };

  const analyzeTrafficConditions = (route) => {
    const duration = route.duration / 60;
    const distance = route.distance / 1000;
    const avgSpeed = distance / (duration / 60);
    
    let conditions = 'good';
    let congestionLevel = 'low';
    
    if (avgSpeed < 20) {
      conditions = 'heavy';
      congestionLevel = 'high';
    } else if (avgSpeed < 40) {
      conditions = 'moderate';
      congestionLevel = 'medium';
    }
    
    return {
      conditions,
      congestionLevel,
      averageSpeed: avgSpeed.toFixed(1),
      estimatedDelay: avgSpeed < 40 ? '5-15 minutes' : '0-5 minutes'
    };
  };

  const generateRecommendation = (route, nearestSite, durationMinutes, totalStops) => {
    const traffic = analyzeTrafficConditions(route);
    const formattedDuration = formatDurationForAI(durationMinutes);
    
    let recommendation = '';
    let urgency = 'low';
    
    if (durationMinutes < 10) {
      recommendation = `Start from station. You'll reach ${nearestSite.site_name} in ${formattedDuration}. Total ${totalStops} stops.`;
      urgency = 'low';
    } else if (durationMinutes < 60) {
      recommendation = `Start from station. Head to ${nearestSite.site_name} - ${formattedDuration} away. ${totalStops} stops total. ${traffic.conditions === 'heavy' ? 'Heavy traffic expected.' : 'Good road conditions.'}`;
      urgency = 'medium';
    } else {
      recommendation = `Start from station. Long route to ${nearestSite.site_name} (${formattedDuration}). ${totalStops} stops. Consider taking breaks. ${traffic.conditions === 'heavy' ? 'Significant delays expected.' : ''}`;
      urgency = 'high';
    }
    
    return {
      text: recommendation,
      urgency,
      suggestedAction: getSuggestedAction(durationMinutes, traffic.conditions)
    };
  };

  const getSuggestedAction = (duration, traffic) => {
    if (duration > 120) return 'Consider alternative routes';
    if (traffic === 'heavy') return 'Leave early to avoid peak hours';
    if (duration < 15) return 'Proceed directly from station';
    return 'Normal driving conditions';
  };

  const calculateOptimalRoute = async (sites, barangayId, station) => {
    if (!mapboxKey || sites.length < 1) return;

    try {
      const optimizedSites = station 
        ? optimizeSiteOrderFromStation(station, sites)
        : optimizeSiteOrder(sites);

      setOptimizedSiteOrder(optimizedSites);
      if (optimizedSites.length > 0) {
        setNearestSiteToStation(optimizedSites[0]);
      }
      
      const coordinates = station 
        ? [
            `${station.longitude},${station.latitude}`,
            ...optimizedSites.map(site => `${parseFloat(site.longitude)},${parseFloat(site.latitude)}`)
          ].join(';')
        : optimizedSites.map(site => `${parseFloat(site.longitude)},${parseFloat(site.latitude)}`).join(';');

      const cacheKey = `route_${coordinates}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached route data (offline mode)');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: cachedRoute.toSite
        });
        return;
      }

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
        `access_token=${mapboxKey}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false` +
        `&continue_straight=false`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const fastestRoute = data.routes.reduce((fastest, current) => 
          current.duration < fastest.duration ? current : fastest
        );
        const durationMinutes = Math.round(fastestRoute.duration / 60);
        
        setRouteCoordinates(fastestRoute.geometry.coordinates);
        setRouteInfo({
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (fastestRoute.distance / 1000).toFixed(1),
          toSite: optimizedSites[0]?.site_name
        });

        cacheRoute(cacheKey, {
          route: fastestRoute.geometry.coordinates,
          duration: durationMinutes,
          distance: (fastestRoute.distance / 1000).toFixed(1),
          toSite: optimizedSites[0]?.site_name
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      
      const fallbackKey = `route_${sites.map(s => `${s.longitude},${s.latitude}`).join(';')}`;
      const cachedRoute = getCachedRoute(fallbackKey);
      
      if (cachedRoute) {
        console.log('Using cached route as fallback');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: cachedRoute.toSite
        });
      } else {
        const fallbackRoute = sites.map(site => 
          [parseFloat(site.longitude), parseFloat(site.latitude)]
        );
        setRouteCoordinates(fallbackRoute);
      }
    }
  };

  const optimizeSiteOrder = (sites) => {
    if (sites.length <= 2) return sites;
    
    const visited = new Set();
    const optimized = [];
    
    let currentSite = sites[0];
    optimized.push(currentSite);
    visited.add(0);

    while (optimized.length < sites.length) {
      let nearestIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < sites.length; i++) {
        if (!visited.has(i)) {
          const distance = calculateDistance(
            parseFloat(currentSite.latitude), parseFloat(currentSite.longitude),
            parseFloat(sites[i].latitude), parseFloat(sites[i].longitude)
          );
          
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
          }
        }
      }

      if (nearestIndex !== -1) {
        currentSite = sites[nearestIndex];
        optimized.push(currentSite);
        visited.add(nearestIndex);
      }
    }

    return optimized;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const currentPos = [longitude, latitude];
          
          setCurrentLocation(currentPos);
          setLocationAccuracy(accuracy);
          setLastLocationUpdate(new Date());
          
          // Use smooth update instead of basic marker
          smoothUpdateUserLocation(latitude, longitude);

          if (stationLocation && siteLocations.length > 0) {
            const aiResult = await analyzeAndOptimizeRouteFromStation(stationLocation, siteLocations);
            
            if (aiResult) {
              setRouteCoordinates(aiResult.route);
              setRouteInfo({
                duration: aiResult.duration,
                distance: aiResult.distance,
                toSite: aiResult.nearestSite?.site_name
              });
              
              setTimeout(() => {
                if (map.current && aiResult.route.length > 0) {
                  addRouteLayer();
                }
              }, 500);
            }
          }
          
          if (map.current) {
            map.current.flyTo({
              center: currentPos,
              zoom: isMobile ? 15 : 14,
              essential: true,
              duration: 1500
            });
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
          handleLocationError(error);
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
    if (!stationLocation) {
      alert('No station found. Please check site configuration.');
      return;
    }
    
    if (siteLocations.length === 0) {
      alert('No sites available for optimization.');
      return;
    }
    
    analyzeAndOptimizeRouteFromStation(stationLocation, siteLocations);
  };

  // NEW: Enhanced route layer that shows recalculation status
  const addRouteLayer = () => {
    if (!map.current || routeCoordinates.length === 0) {
      console.log('Cannot add route layer - missing map or route coordinates');
      return;
    }

    if (!map.current.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting...');
      map.current.once('styledata', () => {
        setTimeout(addRouteLayer, 100);
      });
      return;
    }

    // Clear existing route layers
    ['route', 'route-glow', 'route-direction', 'route-recalculated'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    try {
      console.log('Adding route layer to map with coordinates:', routeCoordinates.length);
      
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            recalculated: routeInfo?.recalculated || false
          },
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      const barangayName = activeSchedule?.barangay_name || 'San Francisco';
      const routeColor = barangayColors[barangayName] || barangayColors['_default'];
      
      // Use different color for recalculated routes
      const actualRouteColor = routeInfo?.recalculated ? '#FF6B35' : routeColor; // Orange for recalculated

      const lineWidth = isMobile ? 6 : 5;
      const glowWidth = isMobile ? 14 : 12;

      // Route glow layer
      map.current.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': actualRouteColor,
          'line-width': glowWidth,
          'line-opacity': 0.4,
          'line-blur': 8
        }
      });

      // Main route layer
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': actualRouteColor,
          'line-width': lineWidth,
          'line-opacity': 0.9
        }
      });

      // Direction arrows
      map.current.addLayer({
        id: 'route-direction',
        type: 'symbol',
        source: 'route',
        layout: {
          'symbol-placement': 'line',
          'text-field': '▶',
          'text-size': isMobile ? 14 : 12,
          'symbol-spacing': 100
        },
        paint: {
          'text-color': actualRouteColor
        }
      });

      // Special layer for recalculated routes
      if (routeInfo?.recalculated) {
        map.current.addLayer({
          id: 'route-recalculated',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF6B35',
            'line-width': lineWidth - 1,
            'line-dasharray': [2, 2],
            'line-opacity': 0.7
          }
        });
      }

      console.log('Route layer added successfully');

      // Fit map to show both route and driver
      setTimeout(() => {
        fitMapToRouteAndDriver();
      }, 200);

    } catch (error) {
      console.error('Error adding route layer:', error);
      
      setTimeout(() => {
        addRouteLayer();
      }, 500);
    }
  };

  const fitMapToRoute = () => {
    if (!map.current || routeCoordinates.length === 0 || siteLocations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    
    if (stationLocation) {
      bounds.extend([parseFloat(stationLocation.longitude), parseFloat(stationLocation.latitude)]);
    }
    
    siteLocations.forEach(site => {
      if (site.longitude && site.latitude) {
        bounds.extend([parseFloat(site.longitude), parseFloat(site.latitude)]);
      }
    });

    routeCoordinates.forEach(coord => {
      bounds.extend(coord);
    });

    if (currentLocation) {
      bounds.extend(currentLocation);
    }

    const padding = isMobile ? 20 : 50;

    try {
      map.current.fitBounds(bounds, {
        padding: padding,
        duration: 1000,
        essential: true,
        maxZoom: isMobile ? 16 : 15
      });
    } catch (error) {
      console.error('Error fitting map to bounds:', error);
    }
  };

  const addSiteMarkers = () => {
    clearSiteMarkers();

    if (stationLocation) {
      const stationMarker = addMarker(
        [parseFloat(stationLocation.longitude), parseFloat(stationLocation.latitude)],
        'station',
        stationLocation.site_name,
        stationLocation,
        0 
      );
      siteMarkersRef.current.push(stationMarker);
    }
    
    const sitesToDisplay = optimizedSiteOrder.length > 0 ? optimizedSiteOrder : siteLocations;
    
    sitesToDisplay.forEach((site, index) => {
      if (site.longitude && site.latitude) {
        const marker = addMarker(
          [parseFloat(site.longitude), parseFloat(site.latitude)],
          'site',
          site.site_name,
          site,
          index + 1
        );
        siteMarkersRef.current.push(marker);
      }
    });
  };

  const clearSiteMarkers = () => {
    siteMarkersRef.current.forEach(marker => {
      if (marker._root) {
        setTimeout(() => marker._root.unmount(), 0);
      }
      marker.remove();
    });
    siteMarkersRef.current = [];
  };

  const createImageMarker = (siteData, sequence) => {
    const barangayName = siteData?.purok?.baranggay?.baranggay_name;
    const borderColor = barangayColors[barangayName] || barangayColors['_default'];
    
    const isNearestToStation = nearestSiteToStation && nearestSiteToStation.id === siteData.id;
    const isStation = siteData.type === 'station';
    const isCompleted = completedSites.has(siteData.id);
    const isCurrent = optimizedSiteOrder[currentSiteIndex]?.id === siteData.id;
    
    const markerSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
    const imageSize = isMobile ? 'w-10 h-10' : 'w-8 h-8';
  
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-image-marker';
    
    let sequenceBadge = '';
    if (activeSchedule) {
      const badgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
      let badgeColor = 'bg-blue-500';
      
      if (isCompleted) {
        badgeColor = 'bg-green-500';
      } else if (isCurrent) {
        badgeColor = 'bg-yellow-500';
      } else if (isStation) {
        badgeColor = 'bg-red-500';
      }
      
      sequenceBadge = `
        <div class="absolute -top-2 -right-2 ${badgeColor} text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white z-20">
          ${isStation ? '🏠' : (isCompleted ? '✓' : sequence)}
        </div>
      `;
    }
  
    const opacityClass = isCompleted ? 'opacity-50' : 'opacity-100';
    const completedClass = isCompleted ? 'grayscale' : '';
    const currentClass = isCurrent && !isCompleted ? 'ring-4 ring-yellow-500 ring-opacity-70' : '';
    const nearestClass = isNearestToStation && !isCompleted && !isCurrent ? 'ring-4 ring-green-500 ring-opacity-70' : '';
  
    markerElement.innerHTML = `
      <div class="relative ${opacityClass}">
        ${sequenceBadge}
        <div class="${markerSize} rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white relative ${currentClass} ${nearestClass} ${completedClass}" 
             style="border-color: ${borderColor};">
          ${isCurrent && !isCompleted ? `
            <div class="absolute -inset-3 rounded-full border-4 border-yellow-500 border-opacity-70 animate-pulse pointer-events-none z-10"></div>
          ` : ''}
          ${isNearestToStation && !isCompleted && !isCurrent ? `
            <div class="absolute -inset-3 rounded-full border-4 border-green-500 border-opacity-70 animate-pulse pointer-events-none z-10"></div>
          ` : ''}
          <img src="${can}" 
               alt="${siteData.site_name}" 
               class="${imageSize} object-cover rounded-full z-0 ${completedClass}"
               onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'${imageSize} rounded-full flex items-center justify-center text-white text-xs font-bold bg-white\\' style=\\'border: 2px solid ${borderColor}; color: ${borderColor}\\'>${siteData.site_name?.charAt(0) || 'S'}</div>'">
        </div>
      </div>
    `;
  
    return markerElement;
  };

  const addMarker = (coordinates, type = 'manual', title = '', siteData = null, sequence = 0) => {
    let markerElement;
    let root = null;
    
    if (type === 'manual') {
      markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
    } else if (siteData?.type === 'station') {
      const stationIcon = createStationIcon(sequence);
      markerElement = stationIcon.element;
      root = stationIcon.root;
    } else {
      markerElement = createImageMarker(siteData, sequence);
    }

    const marker = new mapboxgl.Marker({
      element: markerElement,
      draggable: false
    })
    .setLngLat(coordinates)
    .addTo(map.current);

    if (root) {
      marker._root = root;
    }

    return marker;
  };

  const createStationIcon = (sequence) => {
    const el = document.createElement('div');
    el.className = 'custom-marker relative';
    
    let sequenceBadge = '';
    if (activeSchedule) {
      const badgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
      sequenceBadge = `
        <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white">
          🏠
        </div>
      `;
    }

    el.innerHTML = sequenceBadge;
    const root = createRoot(el);
    root.render(<GiControlTower size={isMobile ? 36 : 30} color={'#4F262A'} />);
    return { element: el, root };
  };

  // Manual location update for testing/fallback
  const updateLocationManually = (latitude, longitude) => {
    const currentPos = [longitude, latitude];
    setCurrentLocation(currentPos);
    smoothUpdateUserLocation(latitude, longitude);
    
    if (nearestSiteToStation) {
      calculateRouteToNearestSiteFromStation(currentPos, nearestSiteToStation);
    }
  };

  // NEW: Reset completed sites (useful for testing)
  const resetCompletedSites = () => {
    setCompletedSites(new Set());
    setCurrentSiteIndex(0);
    updateSiteMarkers();
  };

  return {
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
    locationAccuracy,
    lastLocationUpdate,
    completedSites,
    currentSiteIndex,
    isTaskActive,
    isFakeLocationActive,

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

    startFakeLocationTest,
    stopFakeLocationTest,
    sendTestLocation,
    simulateRouteFollowing,
  };
};