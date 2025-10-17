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

  // Cache management for offline use
  const cacheRoute = (key, routeData) => {
    const cacheEntry = {
      data: routeData,
      timestamp: Date.now(),
      ttl: 24 * 60 * 60 * 1000 // 24 hours
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

  // OPTIMIZED: Improved site proximity check with dynamic threshold
  const checkSiteProximity = (currentPos, sites) => {
    if (!currentPos || sites.length === 0) return;
  
    const [longitude, latitude] = currentPos;
    // Dynamic threshold based on location accuracy
    const PROXIMITY_THRESHOLD = locationAccuracy && locationAccuracy > 50 ? 0.08 : 0.05;
  
    sites.forEach((site, index) => {
      if (completedSites.has(site.id)) return;
  
      const siteLongitude = parseFloat(site.longitude);
      const siteLatitude = parseFloat(site.latitude);
      
      const distance = calculateHaversineDistance(
        latitude,
        longitude,
        siteLatitude,
        siteLongitude
      );

      // If within threshold, mark as completed
      if (distance < PROXIMITY_THRESHOLD) {
        markSiteAsCompleted(site, index);
      }
    });
  };

  // OPTIMIZED: Improved site completion with better route recalculation
  const markSiteAsCompleted = (site, index) => {
    console.log(`🎉 Site reached: ${site.site_name}`);
    
    setCompletedSites(prev => new Set(prev).add(site.id));
    
    // Update current site index for next site in sequence
    if (optimizedSiteOrder.length > 0) {
      const currentIndex = optimizedSiteOrder.findIndex(s => s.id === site.id);
      if (currentIndex !== -1) {
        setCurrentSiteIndex(currentIndex + 1);
        
        // Recalculate optimized route with remaining sites
        const remainingSites = optimizedSiteOrder.slice(currentSiteIndex + 1);
        if (remainingSites.length > 0 && currentLocation) {
          recalculateOptimizedRoute(currentLocation, remainingSites);
        } else {
          // No more sites, clear the route
          setRouteCoordinates([]);
          setRouteInfo(null);
        }
      }
    }
    
    updateSiteMarkers();
    
    if (onTaskComplete) {
      onTaskComplete(site);
    }
    
    showCompletionNotification(site.site_name);
  };

  // NEW: Recalculate optimized route with remaining sites
  const recalculateOptimizedRoute = async (currentPos, remainingSites) => {
    if (!currentPos || remainingSites.length === 0) return;
    
    try {
      // Re-optimize the remaining sites for fastest route
      const reoptimizedOrder = await optimizeRouteWithTSP(currentPos, remainingSites);
      
      if (reoptimizedOrder.length > 0) {
        const fullRoute = await calculateFullRouteFromCurrentLocation(currentPos, reoptimizedOrder);
        
        if (fullRoute) {
          setRouteCoordinates(fullRoute.route);
          setRouteInfo({
            duration: fullRoute.duration,
            formattedDuration: formatDuration(fullRoute.duration),
            distance: fullRoute.distance,
            totalSites: fullRoute.totalSites,
            toSite: reoptimizedOrder[0]?.site_name,
            isFullRoute: true
          });
          
          // Update the optimized order
          setOptimizedSiteOrder(prev => {
            const completed = prev.slice(0, currentSiteIndex + 1);
            return [...completed, ...reoptimizedOrder];
          });
          
          setTimeout(() => {
            if (map.current && fullRoute.route.length > 0) {
              addRouteLayer();
            }
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error recalculating optimized route:', error);
      // Fallback to simple sequential route
      calculateFullRouteFromCurrentLocation(currentPos, remainingSites)
        .then(fullRoute => {
          if (fullRoute) {
            setRouteCoordinates(fullRoute.route);
            setRouteInfo({
              duration: fullRoute.duration,
              formattedDuration: formatDuration(fullRoute.duration),
              distance: fullRoute.distance,
              totalSites: fullRoute.totalSites,
              toSite: remainingSites[0]?.site_name,
              isFullRoute: true
            });
          }
        });
    }
  };

  // OPTIMIZED: Improved route calculation with better error handling
  const calculateRouteToNextSite = async (currentPos, nextSite) => {
    if (!currentPos || !nextSite || !mapboxKey) return;

    try {
      const coordinatesString = `${currentPos[0]},${currentPos[1]};${parseFloat(nextSite.longitude)},${parseFloat(nextSite.latitude)}`;
      
      console.log(`Calculating route to next site: ${nextSite.site_name}`);
      
      const cacheKey = `route_to_next_${coordinatesString}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached route to next site (offline mode)');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: nextSite.site_name
        });
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
          toSite: nextSite.site_name
        };

        setRouteCoordinates(route.geometry.coordinates);
        setRouteInfo(routeInfo);

        cacheRoute(cacheKey, routeInfo);
        
        setTimeout(() => {
          if (map.current && route.geometry.coordinates.length > 0) {
            addRouteLayer();
          }
        }, 500);

        return routeInfo;
      }
    } catch (error) {
      console.error('Error calculating route to next site:', error);
      
      // Fallback to cached route
      const fallbackKey = `route_to_site_${nextSite.id}`;
      const cachedRoute = getCachedRoute(fallbackKey);
      
      if (cachedRoute) {
        console.log('Using cached route as fallback');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: nextSite.site_name
        });
      }
    }
    return null;
  };

  // OPTIMIZED: Improved nearest site calculation
  const calculateRouteToNearestSiteFromStation = async (currentPos, nearestSiteToStation) => {
    if (!currentPos || !nearestSiteToStation || !mapboxKey) {
      console.log('Missing data for route calculation');
      return;
    }

    return await calculateRouteToNextSite(currentPos, nearestSiteToStation);
  };

  // NEW: Show completion notification
  const showCompletionNotification = (siteName) => {
    console.log(`🎉 Site completed: ${siteName}`);
    
    if (isMobile) {
      // Use browser notification if available
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`✅ Site Completed`, {
          body: `${siteName} completed!`,
          icon: can
        });
      } else {
        alert(`✅ Site completed: ${siteName}`);
      }
    } else {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
      notification.innerHTML = `✅ ${siteName} completed!`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 3000);
    }
  };

  // NEW: Update site markers with completion status
  const updateSiteMarkers = () => {
    clearSiteMarkers();
    addSiteMarkers();
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

  // OPTIMIZED: Improved nearest site calculation with multiple factors
  const findNearestSiteToStation = (station, sites) => {
    if (!station || sites.length === 0) return null;

    let nearestSite = null;
    let minDistance = Infinity;

    sites.forEach(site => {
      if (site.longitude && site.latitude) {
        const distance = calculateHaversineDistance(
          parseFloat(station.latitude), parseFloat(station.longitude),
          parseFloat(site.latitude), parseFloat(site.longitude)
        );
        
        // Consider site priority/type if available
        const priority = site.priority || 1;
        const adjustedDistance = distance * priority;
        
        if (adjustedDistance < minDistance) {
          minDistance = adjustedDistance;
          nearestSite = site;
        }
      }
    });

    return nearestSite;
  };

  // OPTIMIZED: Improved full route calculation with better optimization
  const calculateFullRouteFromCurrentLocation = async (currentPos, optimizedSites) => {
    if (!currentPos || !optimizedSites.length || !mapboxKey) return null;
  
    try {
      // Create coordinates string: current location -> site1 -> site2 -> ... -> siteN
      const allCoordinates = [
        `${currentPos[0]},${currentPos[1]}`,
        ...optimizedSites.map(site => `${parseFloat(site.longitude)},${parseFloat(site.latitude)}`)
      ].join(';');
  
      console.log('Calculating full optimized route through all sites:', optimizedSites.length, 'sites');

      const cacheKey = `full_optimized_route_${allCoordinates}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached full route (offline mode)');
        return cachedRoute;
      }

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${allCoordinates}?` +
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
          totalSites: optimizedSites.length,
          siteOrder: optimizedSites.map(site => site.site_name),
          isFullRoute: true
        };

        cacheRoute(cacheKey, routeInfo);
        console.log(`Full optimized route calculated: ${optimizedSites.length} sites, ${durationMinutes} minutes`);
        
        return routeInfo;
      }
    } catch (error) {
      console.error('Error calculating full optimized route:', error);
      
      // Fallback to cached route
      const fallbackKey = `full_route_${optimizedSites.map(s => s.id).join('_')}`;
      const cachedRoute = getCachedRoute(fallbackKey);
      
      if (cachedRoute) {
        console.log('Using cached full route as fallback');
        return cachedRoute;
      }
    }
    return null;
  };

  // OPTIMIZED: Effect to trigger optimized route calculation
  useEffect(() => {
    if (currentLocation && nearestSiteToStation && mapInitialized) {
      console.log('All data available, calculating OPTIMIZED route automatically');
      
      // Use optimized route calculation
      if (optimizedSiteOrder.length > 0) {
        const remainingSites = optimizedSiteOrder.filter(site => !completedSites.has(site.id));
        
        if (remainingSites.length > 0) {
          calculateFullRouteFromCurrentLocation(currentLocation, remainingSites)
            .then(fullRoute => {
              if (fullRoute) {
                setRouteCoordinates(fullRoute.route);
                setRouteInfo({
                  duration: fullRoute.duration,
                  formattedDuration: formatDuration(fullRoute.duration),
                  distance: fullRoute.distance,
                  totalSites: fullRoute.totalSites,
                  toSite: remainingSites[0]?.site_name,
                  isFullRoute: true
                });
                
                setTimeout(() => {
                  if (map.current && fullRoute.route.length > 0) {
                    addRouteLayer();
                  }
                }, 500);
              }
            });
        }
      } else {
        // Fallback to nearest site calculation if no optimized order
        calculateRouteToNearestSiteFromStation(currentLocation, nearestSiteToStation);
      }
    }
  }, [currentLocation, nearestSiteToStation, mapInitialized]);

  // OPTIMIZED: Improved data fetching with better error handling
  useEffect(() => {
    const fetchScheduleAndSites = async () => {
      if (!scheduleId) return;
      
      setLoading(true);
      try {
        const [scheduleResponse, sitesResponse] = await Promise.all([
          axios.get(`/schedules/${scheduleId}`),
          axios.get(`/barangay/${scheduleId}/sites?status=active`)
        ]);

        if (scheduleResponse.data.success && scheduleResponse.data.data) {
          const schedule = scheduleResponse.data.data;
          setActiveSchedule(schedule);

          if (sitesResponse.data.success) {
            const activeSites = sitesResponse.data.data;
            
            const station = activeSites.find(site => site.type === 'station');
            const regularSites = activeSites.filter(site => site.type !== 'station');
            
            if (station) {
              setStationLocation({
                ...station,
                coordinates: [parseFloat(station.longitude), parseFloat(station.latitude)]
              });
              
              if (regularSites.length > 0) {
                // Use TSP algorithm for optimal route
                const optimizedOrder = await optimizeRouteWithTSP(station, regularSites);
                setOptimizedSiteOrder(optimizedOrder);
                
                const nearestToStation = optimizedOrder[0];
                setNearestSiteToStation(nearestToStation);
                setCurrentSiteIndex(0);
                
                console.log('Optimized site order calculated:', optimizedOrder.map(s => s.site_name));
              }
            }
            
            setSiteLocations(regularSites);
          }
        }
      } catch (error) {
        console.error('Error fetching schedule and sites: ', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchScheduleAndSites();
  }, [scheduleId]);

  // OPTIMIZED: Map initialization with better performance
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
        scrollZoom: !isMobile,
        dragPan: true,
        dragRotate: false,
        keyboard: false,
        doubleClickZoom: !isMobile,
        touchZoomRotate: true,
        touchPitch: false,
        cooperativeGestures: isMobile,
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: true,
        optimizeForTerrain: true,
        maxTileCacheSize: 50
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
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
        setCustomStyleLoaded(false);
      }
    };
  }, [mapboxKey, cssLoaded, isMobile]);

  // OPTIMIZED: Real-time location tracking with better accuracy
  const startRealtimeLocationTracking = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return;
    }

    stopRealtimeLocationTracking();

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000
    };

    console.log('Starting optimized real-time location tracking...');

    locationWatcherRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const currentPos = [longitude, latitude];
        
        console.log('Location updated with accuracy:', accuracy, 'meters');
        setCurrentLocation(currentPos);
        setLocationAccuracy(accuracy);
        setLastLocationUpdate(new Date());
        
        updateCurrentLocationMarker(currentPos);
        
        if (siteLocations.length > 0) {
          checkSiteProximity(currentPos, siteLocations);
        }
        
        if (!map.current?.hasUserInteracted()) {
          map.current?.flyTo({
            center: currentPos,
            zoom: isMobile ? 16 : 15,
            essential: true,
            duration: 800
          });
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
  };

  const stopRealtimeLocationTracking = () => {
    if (locationWatcherRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatcherRef.current);
      locationWatcherRef.current = null;
    }
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
        setTimeout(startRealtimeLocationTracking, 3000);
        break;
      default:
        errorMessage += 'Unknown location error.';
        break;
    }
    
    console.warn(errorMessage);
  };

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

  // NEW: Advanced TSP algorithm for optimal route optimization
  const optimizeRouteWithTSP = async (startPoint, sites) => {
    if (!sites || sites.length === 0) return sites;
    
    // If few sites, use simple nearest neighbor
    if (sites.length <= 10) {
      return optimizeWithNearestNeighbor(startPoint, sites);
    }
    
    // For more sites, use more sophisticated algorithm
    return optimizeWithGeneticAlgorithm(startPoint, sites);
  };

  // OPTIMIZED: Nearest neighbor algorithm with improvements
  const optimizeWithNearestNeighbor = (startPoint, sites) => {
    if (sites.length === 0) return [];
    
    const remainingSites = [...sites];
    const optimizedOrder = [];
    
    let currentPoint = startPoint;
    
    while (remainingSites.length > 0) {
      let nearestIndex = -1;
      let minDistance = Infinity;

      for (let i = 0; i < remainingSites.length; i++) {
        const site = remainingSites[i];
        const distance = calculateHaversineDistance(
          parseFloat(currentPoint.latitude), parseFloat(currentPoint.longitude),
          parseFloat(site.latitude), parseFloat(site.longitude)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = i;
        }
      }

      if (nearestIndex !== -1) {
        const nearestSite = remainingSites[nearestIndex];
        optimizedOrder.push(nearestSite);
        currentPoint = nearestSite;
        remainingSites.splice(nearestIndex, 1);
      }
    }

    console.log('Nearest neighbor optimization completed:', optimizedOrder.length, 'sites');
    return optimizedOrder;
  };

  // NEW: Genetic algorithm for better optimization with many sites
  const optimizeWithGeneticAlgorithm = (startPoint, sites) => {
    const populationSize = 50;
    const generations = 100;
    const mutationRate = 0.1;
    
    // Create initial population
    let population = [];
    for (let i = 0; i < populationSize; i++) {
      const shuffled = [...sites].sort(() => Math.random() - 0.5);
      population.push(shuffled);
    }
    
    // Evolve population
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate fitness
      const fitness = population.map(route => 
        1 / calculateTotalRouteDistance(startPoint, route)
      );
      
      // Create new population
      const newPopulation = [];
      for (let i = 0; i < populationSize; i++) {
        // Selection
        const parent1 = selectParent(population, fitness);
        const parent2 = selectParent(population, fitness);
        
        // Crossover
        let child = crossover(parent1, parent2);
        
        // Mutation
        if (Math.random() < mutationRate) {
          child = mutate(child);
        }
        
        newPopulation.push(child);
      }
      
      population = newPopulation;
    }
    
    // Find best route
    const bestRoute = population.reduce((best, current) => {
      const bestDistance = calculateTotalRouteDistance(startPoint, best);
      const currentDistance = calculateTotalRouteDistance(startPoint, current);
      return currentDistance < bestDistance ? current : best;
    });
    
    console.log('Genetic algorithm optimization completed:', bestRoute.length, 'sites');
    return bestRoute;
  };

  const selectParent = (population, fitness) => {
    const totalFitness = fitness.reduce((sum, f) => sum + f, 0);
    let random = Math.random() * totalFitness;
    
    for (let i = 0; i < population.length; i++) {
      random -= fitness[i];
      if (random <= 0) {
        return population[i];
      }
    }
    
    return population[0];
  };

  const crossover = (parent1, parent2) => {
    const start = Math.floor(Math.random() * parent1.length);
    const end = Math.floor(Math.random() * (parent1.length - start)) + start;
    
    const child = parent1.slice(start, end);
    
    for (const site of parent2) {
      if (!child.includes(site)) {
        child.push(site);
      }
    }
    
    return child;
  };

  const mutate = (route) => {
    const newRoute = [...route];
    const i = Math.floor(Math.random() * newRoute.length);
    const j = Math.floor(Math.random() * newRoute.length);
    
    [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
    return newRoute;
  };

  const calculateTotalRouteDistance = (startPoint, route) => {
    if (route.length === 0) return 0;
    
    let totalDistance = calculateHaversineDistance(
      parseFloat(startPoint.latitude), parseFloat(startPoint.longitude),
      parseFloat(route[0].latitude), parseFloat(route[0].longitude)
    );
    
    for (let i = 1; i < route.length; i++) {
      totalDistance += calculateHaversineDistance(
        parseFloat(route[i-1].latitude), parseFloat(route[i-1].longitude),
        parseFloat(route[i].latitude), parseFloat(route[i].longitude)
      );
    }
    
    return totalDistance;
  };

  // OPTIMIZED: Improved Haversine distance calculation
  const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // OPTIMIZED: Route analysis with better optimization
  const analyzeAndOptimizeRouteFromStation = async (station, sites) => {
    if (!station || sites.length === 0) return null;
  
    try {
      const optimizedOrder = await optimizeRouteWithTSP(station, sites);
      setOptimizedSiteOrder(optimizedOrder);
      
      const nearest = optimizedOrder[0];
      setNearestSiteToStation(nearest);
  
      // Calculate optimized route from current location
      if (currentLocation) {
        const fullRoute = await calculateFullRouteFromCurrentLocation(currentLocation, optimizedOrder);
        
        if (fullRoute) {
          const aiResult = {
            station: station,
            nearestSite: nearest,
            optimizedOrder: optimizedOrder,
            route: fullRoute.route,
            duration: fullRoute.duration,
            formattedDuration: formatDuration(fullRoute.duration),
            distance: fullRoute.distance,
            totalSites: fullRoute.totalSites,
            trafficConditions: analyzeTrafficConditions({ duration: fullRoute.duration * 60, distance: fullRoute.distance * 1000 }),
            recommendation: generateRecommendation({ duration: fullRoute.duration * 60, distance: fullRoute.distance * 1000 }, nearest, fullRoute.duration, optimizedOrder.length),
            isCached: false,
            isFullRoute: true,
            optimizationMethod: optimizedOrder.length > 10 ? 'Genetic Algorithm' : 'Nearest Neighbor'
          };
  
          setAiOptimizedRoute(aiResult);
          setRouteCoordinates(fullRoute.route);
          setRouteInfo({
            duration: fullRoute.duration,
            formattedDuration: formatDuration(fullRoute.duration),
            distance: fullRoute.distance,
            totalSites: fullRoute.totalSites,
            toSite: nearest.site_name,
            isFullRoute: true
          });
          
          cacheRoute(`optimized_route_${optimizedOrder.map(s => s.id).join('_')}`, fullRoute);
          
          if (isMobile) {
            setShowAIPanel(true);
          }
          
          return aiResult;
        }
      }
  
      // Fallback to station-based route
      const allCoordinates = [
        [parseFloat(station.longitude), parseFloat(station.latitude)],
        ...optimizedOrder.map(site => [parseFloat(site.longitude), parseFloat(site.latitude)])
      ];
  
      const coordinatesString = allCoordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      
      const cacheKey = `optimized_route_${coordinatesString}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached optimized route (offline mode)');
        const aiResult = {
          ...cachedRoute,
          isCached: true,
          isFullRoute: true,
          optimizationMethod: 'Cached'
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
          totalSites: optimizedOrder.length,
          trafficConditions: analyzeTrafficConditions(optimalRoute),
          recommendation: generateRecommendation(optimalRoute, nearest, durationMinutes, optimizedOrder.length),
          isCached: false,
          isFullRoute: true,
          optimizationMethod: optimizedOrder.length > 10 ? 'Genetic Algorithm' : 'Nearest Neighbor'
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
        setAiOptimizedRoute({ ...fallbackRoute, isCached: true, isFullRoute: true, optimizationMethod: 'Cached Fallback' });
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
      recommendation = `Optimized route ready! Start from station. You'll reach ${nearestSite.site_name} in ${formattedDuration}. Total ${totalStops} stops with optimal sequencing.`;
      urgency = 'low';
    } else if (durationMinutes < 60) {
      recommendation = `Optimized route calculated. Head to ${nearestSite.site_name} - ${formattedDuration} away. ${totalStops} stops total with fastest sequence. ${traffic.conditions === 'heavy' ? 'Heavy traffic expected.' : 'Good road conditions.'}`;
      urgency = 'medium';
    } else {
      recommendation = `Optimized long route ready. Start from station to ${nearestSite.site_name} (${formattedDuration}). ${totalStops} stops with optimal order. ${traffic.conditions === 'heavy' ? 'Significant delays expected.' : ''}`;
      urgency = 'high';
    }
    
    return {
      text: recommendation,
      urgency,
      suggestedAction: getSuggestedAction(durationMinutes, traffic.conditions)
    };
  };

  const getSuggestedAction = (duration, traffic) => {
    if (duration > 120) return 'Consider breaking route into segments';
    if (traffic === 'heavy') return 'Leave early to avoid peak hours';
    if (duration < 15) return 'Proceed with optimized route';
    return 'Follow the optimized sequence for fastest collection';
  };

  // OPTIMIZED: Improved current location with route optimization
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
          
          updateCurrentLocationMarker(currentPos);
  
          // Calculate optimized route through all sites
          if (optimizedSiteOrder.length > 0) {
            const remainingSites = optimizedSiteOrder.filter(site => !completedSites.has(site.id));
            
            if (remainingSites.length > 0) {
              const fullRoute = await calculateFullRouteFromCurrentLocation(currentPos, remainingSites);
              
              if (fullRoute) {
                setRouteCoordinates(fullRoute.route);
                setRouteInfo({
                  duration: fullRoute.duration,
                  formattedDuration: formatDuration(fullRoute.duration),
                  distance: fullRoute.distance,
                  totalSites: fullRoute.totalSites,
                  toSite: remainingSites[0]?.site_name,
                  isFullRoute: true
                });
                
                setTimeout(() => {
                  if (map.current && fullRoute.route.length > 0) {
                    addRouteLayer();
                  }
                }, 500);
              }
            }
          }
          
          if (map.current) {
            map.current.flyTo({
              center: currentPos,
              zoom: isMobile ? 15 : 14,
              essential: true,
              duration: 1200
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
          timeout: 15000,
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

  // OPTIMIZED: Route layer with better performance
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

    ['route', 'route-glow', 'route-direction'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    try {
      console.log('Adding optimized route layer to map with coordinates:', routeCoordinates.length);
      
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }
      });

      const barangayName = activeSchedule?.barangay_name || 'San Francisco';
      const routeColor = barangayColors[barangayName] || barangayColors['_default'];

      const lineWidth = isMobile ? 6 : 5;
      const glowWidth = isMobile ? 14 : 12;

      map.current.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': routeColor,
          'line-width': glowWidth,
          'line-opacity': 0.4,
          'line-blur': 8
        }
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': routeColor,
          'line-width': lineWidth,
          'line-opacity': 0.9
        }
      });

      console.log('Optimized route layer added successfully');

      setTimeout(() => {
        fitMapToRoute();
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
        duration: 800,
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
    updateCurrentLocationMarker(currentPos);
    
    if (nearestSiteToStation) {
      calculateRouteToNearestSiteFromStation(currentPos, nearestSiteToStation);
    }
  };

  // Reset completed sites (useful for testing)
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
  };
};