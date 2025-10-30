import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { IoRefresh, IoWarning, IoNavigate, IoList } from "react-icons/io5";
import axios from 'axios';

import { initEcho, getEcho } from '@/echo'; 

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

const ResidentMap = ({ mapboxKey, barangayId, scheduleId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [cssLoaded, setCssLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverMarker, setDriverMarker] = useState(null);
  const [siteLocations, setSiteLocations] = useState([]);
  const [siteMarkers, setSiteMarkers] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [mapError, setMapError] = useState(null);
  const [containerReady, setContainerReady] = useState(false);

  // Enhanced Route-related state
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);
  const [nearestSite, setNearestSite] = useState(null);
  const [stationLocation, setStationLocation] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [realTimeRouteEnabled, setRealTimeRouteEnabled] = useState(true);

  // Refs for intervals and real-time tracking
  const routeUpdateIntervalRef = useRef(null);
  const lastDriverLocationRef = useRef(null);

  // Responsive design state
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  // Check mobile and window size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
      
      if (mobile) {
        setShowRouteInfo(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (mapboxKey) {
      console.log('Setting Mapbox access token');
      mapboxgl.accessToken = mapboxKey;
    }
  }, [mapboxKey]);

  useEffect(() => {
    const checkContainer = () => {
      if (mapContainer.current) {
        console.log('Map container is ready in DOM');
        setContainerReady(true);
      } else {
        console.log('Waiting for map container...');
        setTimeout(checkContainer, 100);
      }
    };

    checkContainer();
  }, []);

  useEffect(() => {
    const existingLink = document.querySelector('link[href*="mapbox-gl.css"]');
    if (existingLink) {
      setCssLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    
    link.onload = () => {
      console.log('Mapbox CSS loaded');
      setCssLoaded(true);
    };
    
    link.onerror = () => {
      console.error('Failed to load Mapbox CSS');
      setCssLoaded(true);
    };
    
    document.head.appendChild(link);
  }, []);

  // Route calculation functions
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

  // NEW: Calculate route from driver's current location to first site
  const calculateDriverToSiteRoute = async (driverCoords, targetSite) => {
    if (!mapboxKey || !driverCoords || !targetSite) {
      console.log('Missing data for driver route calculation');
      return null;
    }

    try {
      const coordinatesString = 
        `${driverCoords[0]},${driverCoords[1]};` +
        `${parseFloat(targetSite.longitude).toFixed(6)},${parseFloat(targetSite.latitude).toFixed(6)}`;

      console.log('Calculating driver route to site:', coordinatesString);

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?` +
        `access_token=${mapboxKey}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        if (route.geometry && route.geometry.coordinates) {
          const durationMinutes = Math.round(route.duration / 60);
          const distanceKm = (route.distance / 1000).toFixed(1);
          
          console.log(`Driver route calculated: ${durationMinutes}min, ${distanceKm}km`);

          return {
            coordinates: route.geometry.coordinates,
            duration: durationMinutes,
            distance: distanceKm,
            targetSite: targetSite.site_name,
            isRealTime: true
          };
        }
      }
    } catch (error) {
      console.error('Error calculating driver route:', error);
    }

    return null;
  };

  // NEW: Enhanced route calculation with driver integration
  const calculateOptimalRoute = async (sites, station, includeDriverRoute = false) => {
    if (!mapboxKey || sites.length < 1) return;

    setRouteLoading(true);
    setRouteError(null);

    try {
      const validSites = sites.filter(site => 
        site.latitude && site.longitude && 
        !isNaN(parseFloat(site.latitude)) && !isNaN(parseFloat(site.longitude))
      );

      if (validSites.length < 1) {
        console.warn('No valid sites with coordinates found');
        setRouteError('No valid sites with coordinates found');
        return;
      }

      const optimizedSites = station 
        ? optimizeSiteOrderFromStation(station, validSites.filter(site => site.type !== 'station'))
        : validSites;

      setOptimizedSiteOrder(optimizedSites);
      if (optimizedSites.length > 0) {
        setNearestSite(optimizedSites[0]);
      }

      // If we have driver location and real-time routing is enabled, calculate from driver to first site
      if (includeDriverRoute && driverLocation && optimizedSites.length > 0) {
        const driverRoute = await calculateDriverToSiteRoute(driverLocation, optimizedSites[0]);
        
        if (driverRoute) {
          setRouteCoordinates(driverRoute.coordinates);
          setRouteInfo({
            duration: driverRoute.duration,
            formattedDuration: formatDuration(driverRoute.duration),
            distance: driverRoute.distance,
            targetSite: driverRoute.targetSite,
            isRealTime: true,
            totalStops: optimizedSites.length
          });
          
          console.log('Using real-time driver route');
          
          if (map.current && mapInitialized) {
            addRouteLayer();
          }
          return;
        }
      }
      
      // Fallback to original station-based route calculation
      let coordinates = [];
      
      if (station) {
        coordinates = [
          `${parseFloat(station.longitude).toFixed(6)},${parseFloat(station.latitude).toFixed(6)}`,
          ...optimizedSites.map(site => 
            `${parseFloat(site.longitude).toFixed(6)},${parseFloat(site.latitude).toFixed(6)}`
          )
        ];
      } else {
        coordinates = optimizedSites.map(site => 
          `${parseFloat(site.longitude).toFixed(6)},${parseFloat(site.latitude).toFixed(6)}`
        );
      }

      const isMultiWaypoint = coordinates.length > 2;
      
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates.join(';')}?` +
        `access_token=${mapboxKey}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false` +
        `&continue_straight=false` +
        (isMultiWaypoint ? `&roundabout_exits=true` : '')
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        if (route.geometry && route.geometry.coordinates) {
          const durationMinutes = Math.round(route.duration / 60);
          const distanceKm = (route.distance / 1000).toFixed(1);
          
          setRouteCoordinates(route.geometry.coordinates);
          setRouteInfo({
            duration: durationMinutes,
            formattedDuration: formatDuration(durationMinutes),
            distance: distanceKm,
            rawData: route,
            totalStops: optimizedSites.length,
            isRealTime: false
          });
          
          console.log(`Station route calculated: ${durationMinutes}min, ${distanceKm}km`);
          
          if (map.current && mapInitialized) {
            addRouteLayer();
          }
        } else {
          throw new Error('Invalid route geometry received');
        }
      } else {
        throw new Error(data.message || 'No routes found');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setRouteError(`Route calculation failed: ${error.message}`);
      
      // Fallback to straight line route
      const validSites = sites.filter(site => 
        site.latitude && site.longitude && 
        !isNaN(parseFloat(site.latitude)) && !isNaN(parseFloat(site.longitude))
      );
      
      if (validSites.length > 0) {
        const fallbackRoute = validSites.map(site => 
          [parseFloat(site.longitude), parseFloat(site.latitude)]
        );
        setRouteCoordinates(fallbackRoute);
        setRouteInfo({
          duration: Math.round(calculateRouteDistance(fallbackRoute) * 2), 
          formattedDuration: 'Estimated',
          distance: calculateRouteDistance(fallbackRoute).toFixed(1),
          isFallback: true,
          totalStops: validSites.length,
          isRealTime: false
        });
        
        if (map.current && mapInitialized) {
          addRouteLayer();
        }
      }
    } finally {
      setRouteLoading(false);
    }
  };

  const calculateRouteDistance = (coordinates) => {
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const [lon1, lat1] = coordinates[i-1];
      const [lon2, lat2] = coordinates[i];
      totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
    }
    return totalDistance;
  };

  // NEW: Real-time route update function
  const updateRealTimeRoute = async () => {
    if (!realTimeRouteEnabled || !driverLocation || !optimizedSiteOrder.length) {
      return;
    }

    // Check if driver has moved significantly (more than 50 meters)
    if (lastDriverLocationRef.current) {
      const [prevLon, prevLat] = lastDriverLocationRef.current;
      const [currentLon, currentLat] = driverLocation;
      const distanceMoved = calculateDistance(prevLat, prevLon, currentLat, currentLon) * 1000; // Convert to meters
      
      // Only update route if driver moved more than 50 meters
      if (distanceMoved < 50) {
        return;
      }
    }

    lastDriverLocationRef.current = driverLocation;

    console.log('Updating real-time route from driver location');
    
    try {
      const driverRoute = await calculateDriverToSiteRoute(driverLocation, optimizedSiteOrder[0]);
      
      if (driverRoute) {
        setRouteCoordinates(driverRoute.coordinates);
        setRouteInfo(prev => ({
          ...prev,
          duration: driverRoute.duration,
          formattedDuration: formatDuration(driverRoute.duration),
          distance: driverRoute.distance,
          targetSite: driverRoute.targetSite,
          isRealTime: true,
          lastUpdated: new Date().toLocaleTimeString()
        }));
        
        if (map.current && mapInitialized) {
          addRouteLayer();
        }
      }
    } catch (error) {
      console.error('Error updating real-time route:', error);
    }
  };

  // NEW: Start real-time route updates
  const startRealTimeRouteUpdates = () => {
    if (routeUpdateIntervalRef.current) {
      clearInterval(routeUpdateIntervalRef.current);
    }

    routeUpdateIntervalRef.current = setInterval(() => {
      if (realTimeRouteEnabled && driverLocation && optimizedSiteOrder.length > 0) {
        updateRealTimeRoute();
      }
    }, 2000); // Update every 2 seconds

    console.log('Started real-time route updates');
  };

  // NEW: Stop real-time route updates
  const stopRealTimeRouteUpdates = () => {
    if (routeUpdateIntervalRef.current) {
      clearInterval(routeUpdateIntervalRef.current);
      routeUpdateIntervalRef.current = null;
    }
    console.log('Stopped real-time route updates');
  };

  // NEW: Toggle real-time routing
  const toggleRealTimeRouting = () => {
    const newState = !realTimeRouteEnabled;
    setRealTimeRouteEnabled(newState);
    
    if (newState) {
      startRealTimeRouteUpdates();
    } else {
      stopRealTimeRouteUpdates();
    }
  };

  // Enhanced route layer
  const addRouteLayer = () => {
    if (!map.current || routeCoordinates.length === 0) {
      return;
    }
  
    if (!map.current.isStyleLoaded()) {
      map.current.once('styledata', () => {
        setTimeout(addRouteLayer, 100);
      });
      return;
    }

    // Clear all existing route layers and sources
    [
      'route', 'route-glow', 'route-direction', 
      'route-start', 'route-end', 'route-waypoints',
      'driver-route', 'driver-route-glow'
    ].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    if (map.current.getSource('driver-route')) {
      map.current.removeSource('driver-route');
    }
  
    [
      'route-start-marker', 'route-end-marker', 'route-waypoints-marker'
    ].forEach(sourceId => {
      if (map.current.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }
    });
  
    try {
      const routeSourceId = routeInfo?.isRealTime ? 'driver-route' : 'route';
      const routeLayerId = routeInfo?.isRealTime ? 'driver-route' : 'route';
      const glowLayerId = routeInfo?.isRealTime ? 'driver-route-glow' : 'route-glow';

      map.current.addSource(routeSourceId, {
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
  
      const barangayName = currentSchedule?.barangay_name || 'San Francisco';
      const routeColor = routeInfo?.isRealTime ? '#10B981' : (barangayColors[barangayName] || barangayColors['_default']);
  
      const lineWidth = isMobile ? 6 : 5;
      const glowWidth = isMobile ? 14 : 12;

      // Route glow layer
      map.current.addLayer({
        id: glowLayerId,
        type: 'line',
        source: routeSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': routeColor,
          'line-width': glowWidth,
          'line-opacity': routeInfo?.isRealTime ? 0.4 : 0.3,
          'line-blur': 10
        }
      });

      // Main route layer
      map.current.addLayer({
        id: routeLayerId,
        type: 'line',
        source: routeSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': routeColor,
          'line-width': lineWidth,
          'line-opacity': 0.9,
          'line-dasharray': routeInfo?.isRealTime ? [2, 1] : [1, 0]
        }
      });

      // Direction arrows
      map.current.addLayer({
        id: 'route-direction',
        type: 'symbol',
        source: routeSourceId,
        layout: {
          'symbol-placement': 'line',
          'text-field': '▶',
          'text-size': isMobile ? 14 : 12,
          'symbol-spacing': 100
        },
        paint: {
          'text-color': routeColor
        }
      });
  
      // Add waypoints (station and sites)
      const waypoints = [];

      if (stationLocation && stationLocation.latitude && stationLocation.longitude && !routeInfo?.isRealTime) {
        waypoints.push({
          coordinates: [parseFloat(stationLocation.longitude), parseFloat(stationLocation.latitude)],
          type: 'station',
          sequence: 0
        });
      }

      optimizedSiteOrder.forEach((site, index) => {
        if (site.latitude && site.longitude) {
          waypoints.push({
            coordinates: [parseFloat(site.longitude), parseFloat(site.latitude)],
            type: 'site',
            sequence: index + 1,
            isTarget: routeInfo?.isRealTime && index === 0
          });
        }
      });
  
      if (waypoints.length > 0) {
        map.current.addSource('route-waypoints-marker', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: waypoints.map((waypoint, index) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: waypoint.coordinates
              },
              properties: {
                description: waypoint.type === 'station' ? 'Station' : 
                           waypoint.isTarget ? `Target: ${waypoint.sequence}` : `Site ${waypoint.sequence}`,
                type: waypoint.type,
                sequence: waypoint.sequence,
                isTarget: waypoint.isTarget
              }
            }))
          }
        });
  
        map.current.addLayer({
          id: 'route-waypoints',
          type: 'circle',
          source: 'route-waypoints-marker',
          paint: {
            'circle-radius': [
              'case',
              ['==', ['get', 'type'], 'station'], isMobile ? 10 : 8,
              ['==', ['get', 'isTarget'], true], isMobile ? 12 : 10,
              isMobile ? 8 : 6 
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'type'], 'station'], '#dc2626',
              ['==', ['get', 'isTarget'], true], '#10B981',
              '#3b82f6'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      }
  
      // Add start and end markers (only for non-real-time routes)
      if (!routeInfo?.isRealTime && routeCoordinates.length >= 2) {
        map.current.addSource('route-start-marker', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: routeCoordinates[0]
            },
            properties: {
              description: 'Start'
            }
          }
        });
  
        map.current.addSource('route-end-marker', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: routeCoordinates[routeCoordinates.length - 1]
            },
            properties: {
              description: 'End'
            }
          }
        });
  
        map.current.addLayer({
          id: 'route-start',
          type: 'circle',
          source: 'route-start-marker',
          paint: {
            'circle-radius': isMobile ? 8 : 6,
            'circle-color': '#22c55e',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
  
        map.current.addLayer({
          id: 'route-end',
          type: 'circle',
          source: 'route-end-marker',
          paint: {
            'circle-radius': isMobile ? 8 : 6,
            'circle-color': '#ef4444',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        });
      }
  
      // Fit map to show the entire route
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

    // Include all route coordinates
    routeCoordinates.forEach(coord => {
      bounds.extend(coord);
    });

    // Include station
    if (stationLocation) {
      bounds.extend([parseFloat(stationLocation.longitude), parseFloat(stationLocation.latitude)]);
    }
    
    // Include all site locations
    siteLocations.forEach(site => {
      if (site.longitude && site.latitude) {
        bounds.extend([parseFloat(site.longitude), parseFloat(site.latitude)]);
      }
    });

    // Include driver location if available
    if (driverLocation) {
      bounds.extend(driverLocation);
    }

    const padding = isMobile ? 40 : 80;

    try {
      map.current.fitBounds(bounds, {
        padding: padding,
        duration: 1500,
        essential: true,
        maxZoom: isMobile ? 16 : 15,
        offset: [0, isMobile ? -50 : 0]
      });
    } catch (error) {
      console.error('Error fitting map to bounds:', error);
    }
  };

  // Find station in sites
  const findStation = (sites) => {
    return sites.find(site => site.type === 'station') || null;
  };

  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainer.current) return;
      if (map.current) return;
      if (!mapboxKey) {
        setMapError('Mapbox key is missing.');
        return;
      }

      console.log('Starting map initialization...');

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
          preserveDrawingBuffer: true
        });

        const handleMapLoad = () => {
          console.log('Map loaded successfully!');
          setMapInitialized(true);
          setMapError(null);
          
          if (siteLocations.length > 0) {
            updateSiteMarkers(siteLocations);
          }
          
          if (driverLocation) {
            updateDriverMarker(driverLocation, {});
          }

          if (routeCoordinates.length > 0) {
            setTimeout(() => {
              addRouteLayer();
            }, 500);
          }

          // Start real-time route updates if enabled
          if (realTimeRouteEnabled) {
            startRealTimeRouteUpdates();
          }
        };

        const handleMapError = (e) => {
          console.error('Map error:', e);
          setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
          setMapInitialized(true);
        };

        map.current.once('load', handleMapLoad);
        map.current.on('error', handleMapError);

        const timeoutId = setTimeout(() => {
          if (!mapInitialized) {
            console.warn('Map load timeout - continuing anyway');
            setMapInitialized(true);
          }
        }, 10000);

        return () => clearTimeout(timeoutId);

      } catch (error) {
        console.error('Error creating map:', error);
        setMapError(`Failed to create map: ${error.message}`);
        setMapInitialized(true);
      }
    };

    if (cssLoaded && mapboxKey && containerReady) {
      initializeMap();
    }

    return () => {
      stopRealTimeRouteUpdates();
      if (map.current) {
        console.log('Cleaning up map');
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, [cssLoaded, mapboxKey, containerReady, isMobile]);

  // Enhanced route calculation when data is available
  useEffect(() => {
    if (siteLocations.length > 0 && stationLocation && mapboxKey && mapInitialized) {
      console.log('All data available, calculating optimal route...');
      // Calculate route with driver integration if real-time routing is enabled
      calculateOptimalRoute(siteLocations, stationLocation, realTimeRouteEnabled);
    }
  }, [siteLocations, stationLocation, mapboxKey, mapInitialized]);

  // NEW: Update real-time route when driver location changes significantly
  useEffect(() => {
    if (realTimeRouteEnabled && driverLocation && optimizedSiteOrder.length > 0) {
      // Debounced route update when driver moves
      const timeoutId = setTimeout(() => {
        updateRealTimeRoute();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [driverLocation, realTimeRouteEnabled]);

  useEffect(() => {
    if (map.current && routeCoordinates.length > 0 && mapInitialized) {
      addRouteLayer();
    }
  }, [routeCoordinates, mapInitialized]);

  useEffect(() => {
    if (!barangayId) return;

    const initializeRealtime = async () => {
      try {
        console.log('Initializing Reverb connection...');
        
        initEcho();
        const echo = getEcho();
        
        if (!echo) {
          throw new Error('Echo not initialized');
        }

        echo.channel(`driver-locations.${barangayId}`)
          .listen('DriverLocationUpdated', (e) => {
            console.log('Driver location update received:', e);
            setConnectionStatus('connected');
            updateDriverLocation(e);
          });

        echo.channel(`schedule-updates.${barangayId}`)
          .listen('ScheduleStatusUpdated', (e) => {
            console.log('Schedule update received:', e);
            updateScheduleData(e.schedule);
          });

        setConnectionStatus('connected');
        await loadInitialData();

      } catch (error) {
        console.error('Realtime connection failed:', error);
        setConnectionStatus('disconnected');
        startPolling();
      }
    };

    initializeRealtime();

    return () => {
      const echo = getEcho();
      if (echo) {
        echo.leave(`driver-locations.${barangayId}`);
        echo.leave(`schedule-updates.${barangayId}`);
      }
    };
  }, [barangayId, scheduleId]);

  const startPolling = () => {
    const pollInterval = setInterval(() => {
      loadInitialData();
    }, 10000);

    return () => clearInterval(pollInterval);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const scheduleResponse = await axios.get(`/barangay/${barangayId}/current-schedule`);
      
      if (scheduleResponse.data.success) {
        const schedule = scheduleResponse.data.data;
        setCurrentSchedule(schedule);
        
        if (schedule.id) {
          const sitesResponse = await axios.get(`/schedule/${schedule.id}/sites`);
          
          if (sitesResponse.data.success) {
            const sites = sitesResponse.data.data;
            setSiteLocations(sites);
            
            const station = findStation(sites);
            if (station) {
              setStationLocation(station);
              console.log('Station found:', station.site_name);
            }
          }
        }
        
        if (scheduleId) {
          const locationResponse = await axios.get(`/schedule/${scheduleId}/driver-location`);
          
          if (locationResponse.data.success && locationResponse.data.data) {
            updateDriverLocation(locationResponse.data.data);
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDriverLocation = (locationData) => {
    if (!locationData.longitude || !locationData.latitude) {
      return;
    }
    
    const newLocation = [parseFloat(locationData.longitude), parseFloat(locationData.latitude)];
    setDriverLocation(newLocation);
    
    if (mapInitialized && map.current) {
      updateDriverMarker(newLocation, locationData);
      
      // Smooth fly to driver location
      map.current.flyTo({
        center: newLocation,
        zoom: isMobile ? 16 : 15,
        duration: 1500,
        essential: true
      });
    }
  };

  const updateDriverMarker = (coordinates, locationData) => {
    if (!map.current || !mapInitialized) {
      return;
    }

    if (driverMarker) {
      driverMarker.remove();
    }

    const markerSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
    const iconSize = isMobile ? 'w-6 h-6' : 'w-5 h-5';

    const markerElement = document.createElement('div');
    markerElement.className = 'driver-location-marker';
    markerElement.innerHTML = `
      <div class="relative">
        <div class="${markerSize} bg-blue-600 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
          <svg class="${iconSize} text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
          </svg>
        </div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
      </div>
    `;

    try {
      const newMarker = new mapboxgl.Marker({
        element: markerElement,
        draggable: false
      })
      .setLngLat(coordinates)
      .addTo(map.current);

      setDriverMarker(newMarker);
    } catch (error) {
      console.error('Error creating driver marker:', error);
    }
  };

  const updateScheduleData = (scheduleData) => {
    setCurrentSchedule(scheduleData);
  };

  const updateSiteMarkers = (sites) => {
    if (!map.current || !mapInitialized) {
      return;
    }

    siteMarkers.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
    
    const newMarkers = sites.map((site, index) => {
      if (!site.longitude || !site.latitude) {
        return null;
      }

      try {
        const markerElement = document.createElement('div');
        markerElement.className = 'site-marker';
        
        const isCompleted = site.status === 'completed';
        const isCurrent = site.status === 'in_progress';
        const isStation = site.type === 'station';
        const purokName = site.purok_name || site.site_name || 'Site';
        const isTargetSite = realTimeRouteEnabled && nearestSite && nearestSite.id === site.id;
        
        const getMarkerColor = () => {
          if (isStation) return '#DC2626';
          if (isCompleted) return '#10B981';
          if (isTargetSite) return '#10B981';
          return '#6B7280';
        };

        const getMarkerIcon = () => {
          if (isStation) return `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`;
          if (isCompleted) return `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />`;
          return `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />`;
        };

        const markerSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
        const iconSize = isMobile ? 'w-6 h-6' : 'w-5 h-5';
        
        markerElement.innerHTML = `
          <div class="relative ${isCurrent || isTargetSite ? 'animate-pulse' : ''}">
            <div class="${markerSize} rounded-full border-3 border-white flex items-center justify-center shadow-lg" style="background-color: ${getMarkerColor()}; ${isCompleted ? 'opacity: 0.7;' : ''}">
              <svg class="${iconSize} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${getMarkerIcon()}
              </svg>
            </div>
            ${isCurrent ? `<div class="absolute inset-0 rounded-full border-3 border-yellow-500 animate-ping"></div>` : ''}
            ${isTargetSite && !isCurrent ? `<div class="absolute inset-0 rounded-full border-3 border-green-500 animate-ping"></div>` : ''}
          </div>
        `;

        const coordinates = [parseFloat(site.longitude), parseFloat(site.latitude)];

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: `custom-popup ${isMobile ? 'max-w-xs' : 'max-w-sm'}`
        }).setHTML(`
          <div class="text-sm ${isMobile ? 'p-2' : 'p-3'}">
            <div class="font-semibold text-gray-900 ${isMobile ? 'text-base' : ''}">${purokName}</div>
            <div class="text-xs text-gray-500 mt-1">
              ${isStation ? 'Collection Station' : isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
            </div>
            ${isTargetSite && realTimeRouteEnabled && (
              '<div class="text-xs text-green-600 mt-1 font-medium">🎯 Current Target</div>'
            )}
            ${nearestSite && nearestSite.id === site.id && !isTargetSite && (
              '<div class="text-xs text-green-600 mt-1 font-medium">📍 Nearest Site</div>'
            )}
          </div>
        `);

        const marker = new mapboxgl.Marker({
          element: markerElement,
          draggable: false
        })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current);

        return marker;
      } catch (error) {
        console.error('Error creating marker:', error);
        return null;
      }
    }).filter(marker => marker !== null);

    setSiteMarkers(newMarkers);
  };

  // Enhanced route refresh
  const refreshRoute = async () => {
    if (siteLocations.length > 0 && stationLocation) {
      await calculateOptimalRoute(siteLocations, stationLocation, realTimeRouteEnabled);
    }
  };

  // Toggle route info panel
  const toggleRouteInfo = () => {
    setShowRouteInfo(!showRouteInfo);
  };

  // Responsive height calculation
  const getMapHeight = () => {
    if (windowSize.width < 640) { // sm breakpoint
      return '400px';
    } else if (windowSize.width < 768) { // md breakpoint
      return '500px';
    } else {
      return '600px';
    }
  };

  if (mapError) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <IoWarning className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-sm text-gray-600 mb-4">{mapError}</p>
          <p className="text-xs text-gray-500">The interface will continue with limited functionality</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Container */}
      <div className="relative w-full" style={{ height: getMapHeight() }}>
        {!mapInitialized && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-20">
            <div className="text-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Initializing map...</p>
              <p className="text-xs text-gray-500 mt-2">
                {!containerReady ? 'Setting up container...' : 
                 !cssLoaded ? 'Loading styles...' : 
                 !mapboxKey ? 'Waiting for API key...' : 
                 'Loading Mapbox...'}
              </p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0"
        />
        
        {mapInitialized && (
          <>
            {/* Enhanced Legend - Responsive */}
            <div className={`absolute ${isMobile ? 'bottom-2 left-2' : 'bottom-4 left-4'} bg-white rounded-lg shadow-lg border border-gray-200 ${isMobile ? 'p-2' : 'p-3'} z-10 ${isMobile ? 'min-w-40' : 'min-w-48'}`}>
              <div className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} text-gray-900 ${isMobile ? 'mb-2' : 'mb-3'}`}>Legend</div>
              <div className={`space-y-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <span className="text-gray-700">Driver</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Station</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700">Completed</span>
                </div>
                {realTimeRouteEnabled && nearestSite && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 relative">
                      <div className="absolute inset-0 rounded-full border-2 border-white animate-ping"></div>
                    </div>
                    <span className="text-gray-700">Target Site</span>
                  </div>
                )}
                {/* Route legend */}
                {routeInfo && (
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                    <div className="w-4 h-1 rounded-full flex-shrink-0" style={{
                      backgroundColor: routeInfo.isRealTime ? '#10B981' : (barangayColors[currentSchedule?.barangay_name] || barangayColors['_default'])
                    }}></div>
                    <span className="text-gray-700">
                      {routeInfo.isRealTime ? 'Live Route' : 'Planned Route'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Control Buttons - Responsive */}
            <div className={`absolute ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} flex flex-col gap-2 z-10`}>
              {/* Real-time Route Toggle */}
              <button
                onClick={toggleRealTimeRouting}
                className={`rounded-lg shadow-lg border transition-colors flex items-center justify-center ${
                  isMobile ? 'p-2' : 'p-3'
                } ${
                  realTimeRouteEnabled 
                    ? 'bg-green-500 border-green-600 hover:bg-green-600 text-white' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
                title={realTimeRouteEnabled ? 'Disable real-time routing' : 'Enable real-time routing'}
              >
                <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${realTimeRouteEnabled ? 'animate-pulse' : ''}`}>
                  {realTimeRouteEnabled ? '🎯' : '📍'}
                </div>
              </button>

              {/* Refresh Route Button */}
              <button
                onClick={refreshRoute}
                disabled={routeLoading}
                className={`bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center ${
                  isMobile ? 'p-2' : 'p-3'
                } ${routeLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh route"
              >
                {routeLoading ? (
                  <div className={`animate-spin rounded-full border-b-2 border-gray-700 ${
                    isMobile ? 'w-4 h-4' : 'w-5 h-5'
                  }`}></div>
                ) : (
                  <IoRefresh className={`text-gray-700 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                )}
              </button>

              {/* Toggle Route Info Button */}
              <button
                onClick={toggleRouteInfo}
                className={`bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center ${
                  isMobile ? 'p-2' : 'p-3'
                }`}
                title={showRouteInfo ? 'Hide route info' : 'Show route info'}
              >
                <IoList className={`text-gray-700 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>

              {/* Fit to Route Button */}
              <button
                onClick={fitMapToRoute}
                className={`bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center ${
                  isMobile ? 'p-2' : 'p-3'
                }`}
                title="Fit to route"
              >
                <IoNavigate className={`text-gray-700 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>
            </div>

            {/* Connection Status - Responsive */}
            <div className={`absolute ${isMobile ? 'top-2 left-2' : 'top-4 left-4'} bg-white rounded-lg shadow-lg border border-gray-200 ${
              isMobile ? 'px-2 py-1' : 'px-3 py-2'
            } z-10`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                } ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
                <span className={`font-medium text-gray-700 capitalize ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  {connectionStatus}
                </span>
              </div>
            </div>

            {/* Enhanced Route Information Panel - Responsive */}
            {routeInfo && showRouteInfo && (
              <div className={`absolute ${
                isMobile ? 
                  'top-12 left-2 right-2' : 
                  'top-16 left-4'
              } bg-white rounded-lg shadow-lg border border-gray-200 ${
                isMobile ? 'p-3' : 'p-4'
              } z-10 ${isMobile ? '' : 'min-w-64'}`}>
                <div className={`font-semibold text-gray-900 ${
                  isMobile ? 'text-sm mb-2' : 'text-base mb-3'
                } flex items-center justify-between`}>
                  <span>
                    {routeInfo.isRealTime ? 'Live Route' : 'Planned Route'}
                  </span>
                  <div className="flex gap-1">
                    {routeInfo.isRealTime && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Live
                      </span>
                    )}
                    {routeInfo.isFallback && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Estimated</span>
                    )}
                  </div>
                </div>
                
                <div className={`space-y-2 ${
                  isMobile ? 'text-xs' : 'text-sm'
                } text-gray-600`}>
                  <div className="flex justify-between items-center">
                    <span>Estimated Time:</span>
                    <span className="font-semibold text-blue-600">{routeInfo.formattedDuration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Distance:</span>
                    <span className="font-semibold">{routeInfo.distance} km</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Stops:</span>
                    <span className="font-semibold">{routeInfo.totalStops} sites</span>
                  </div>
                  {routeInfo.targetSite && (
                    <div className="flex justify-between items-center">
                      <span>Target Site:</span>
                      <span className="font-semibold text-green-600">{routeInfo.targetSite}</span>
                    </div>
                  )}
                  {nearestSite && !routeInfo.targetSite && (
                    <div className="flex justify-between items-center">
                      <span>Nearest Site:</span>
                      <span className="font-semibold text-green-600">{nearestSite.site_name}</span>
                    </div>
                  )}
                  {routeInfo.lastUpdated && (
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Last Updated:</span>
                      <span>{routeInfo.lastUpdated}</span>
                    </div>
                  )}
                </div>

                {routeError && (
                  <div className={`mt-2 p-2 bg-red-50 border border-red-200 rounded ${
                    isMobile ? 'text-xs' : 'text-sm'
                  } text-red-600`}>
                    {routeError}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ResidentMap;