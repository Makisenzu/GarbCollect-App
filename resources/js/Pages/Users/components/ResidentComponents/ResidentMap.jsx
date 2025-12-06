import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { IoRefresh, IoWarning, IoNavigate, IoList } from "react-icons/io5";
import axios from 'axios';
import { PiTrashSimpleDuotone } from "react-icons/pi";
import { BsTruck } from "react-icons/bs";
import { IoHome, IoCheckmarkDone } from "react-icons/io5";
import GarbageTruckSpinner from '@/Components/GarbageTruckSpinner';

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

const ResidentMap = ({ mapboxKey, barangayId, scheduleId, isFullscreen = false }) => {
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

  // Spinner state - ONLY GarbageTruckSpinner
  const [showSpinner, setShowSpinner] = useState(false);
  const [spinnerMessage, setSpinnerMessage] = useState('Loading map data...');

  const showLoadingSpinner = (message = 'Loading map data...') => {
    setSpinnerMessage(message);
    setShowSpinner(true);
  };

  const hideLoadingSpinner = () => {
    setShowSpinner(false);
  };

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

  const [lastUserInteraction, setLastUserInteraction] = useState(Date.now());
  const hasUserInteractedWithMap = () => {
    return Date.now() - lastUserInteraction < 30000;
  };

  // Responsive design state
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    if (!map.current) return;
  
    const interactionEvents = ['mousedown', 'touchstart', 'wheel', 'movestart', 'dragstart'];
    
    const handleUserInteraction = () => {
      setLastUserInteraction(Date.now());
    };
  
    interactionEvents.forEach(event => {
      map.current.on(event, handleUserInteraction);
    });
  
    return () => {
      interactionEvents.forEach(event => {
        if (map.current) {
          map.current.off(event, handleUserInteraction);
        }
      });
    };
  }, [map.current]);

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
    const checkCSSLoaded = () => {
      const mapboxCSS = document.querySelector('link[href*="mapbox-gl.css"]');
      if (mapboxCSS && mapboxCSS.sheet) {
        console.log('Mapbox CSS already loaded');
        setCssLoaded(true);
        return true;
      }
      return false;
    };

    if (checkCSSLoaded()) {
      return;
    }

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    
    let loadTimeout;
    
    const onLoad = () => {
      clearTimeout(loadTimeout);
      console.log('Mapbox CSS loaded successfully');
      setCssLoaded(true);
    };
    
    const onError = () => {
      clearTimeout(loadTimeout);
      console.warn('Mapbox CSS failed to load, continuing anyway');
      setCssLoaded(true);
    };
    
    link.onload = onLoad;
    link.onerror = onError;
    
    document.head.appendChild(link);
    
    loadTimeout = setTimeout(() => {
      console.warn('Mapbox CSS load timeout, continuing anyway');
      setCssLoaded(true);
    }, 5000);

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

  const calculateOptimalRoute = async (sites, station, includeDriverRoute = false) => {
    if (!mapboxKey || sites.length < 1) return;

    setRouteLoading(true);
    showLoadingSpinner('Calculating optimal route...');
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

      // Filter out finished/completed sites from route calculation
      const unfinishedSites = validSites.filter(site => 
        site.type === 'station' || 
        (site.status !== 'finished' && site.status !== 'completed')
      );

      const optimizedSites = station 
        ? optimizeSiteOrderFromStation(station, unfinishedSites.filter(site => site.type !== 'station'))
        : unfinishedSites.filter(site => site.type !== 'station');

      setOptimizedSiteOrder(optimizedSites);
      if (optimizedSites.length > 0) {
        setNearestSite(optimizedSites[0]);
      }

      if (includeDriverRoute && driverLocation && optimizedSites.length > 0) {
        // Calculate complete sequential route from driver through ALL sites
        const allCoordinates = [
          `${driverLocation[0].toFixed(6)},${driverLocation[1].toFixed(6)}`,
          ...optimizedSites.map(site => 
            `${parseFloat(site.longitude).toFixed(6)},${parseFloat(site.latitude).toFixed(6)}`
          )
        ];

        try {
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${allCoordinates.join(';')}?` +
            `access_token=${mapboxKey}` +
            `&geometries=geojson` +
            `&overview=full` +
            `&steps=true` +
            `&alternatives=false` +
            `&continue_straight=false` +
            `&roundabout_exits=true`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.routes && data.routes.length > 0) {
              const route = data.routes[0];
              const durationMinutes = Math.round(route.duration / 60);
              const distanceKm = (route.distance / 1000).toFixed(1);

              setRouteCoordinates(route.geometry.coordinates);
              setRouteInfo({
                duration: durationMinutes,
                formattedDuration: formatDuration(durationMinutes),
                distance: distanceKm,
                targetSite: optimizedSites[0].site_name,
                isRealTime: true,
                totalStops: optimizedSites.length
              });
              
              console.log(`Complete sequential route calculated from driver through ${optimizedSites.length} sites`);
              
              if (map.current && mapInitialized) {
                addRouteLayer();
              }
              return;
            }
          }
        } catch (error) {
          console.error('Error calculating driver sequential route:', error);
          // Fall through to station-based route
        }
      }
      
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
      hideLoadingSpinner();
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

  const updateRealTimeRoute = async () => {
    if (!realTimeRouteEnabled || !driverLocation || !optimizedSiteOrder.length) {
      return;
    }

    if (lastDriverLocationRef.current) {
      const [prevLon, prevLat] = lastDriverLocationRef.current;
      const [currentLon, currentLat] = driverLocation;
      const distanceMoved = calculateDistance(prevLat, prevLon, currentLat, currentLon) * 1000;
      
      if (distanceMoved < 50) {
        return;
      }
    }

    lastDriverLocationRef.current = driverLocation;

    console.log('Updating complete sequential route from driver location through all sites');
    
    try {
      // Calculate complete sequential route from driver through ALL sites
      const allCoordinates = [
        `${driverLocation[0].toFixed(6)},${driverLocation[1].toFixed(6)}`,
        ...optimizedSiteOrder.map(site => 
          `${parseFloat(site.longitude).toFixed(6)},${parseFloat(site.latitude).toFixed(6)}`
        )
      ];

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${allCoordinates.join(';')}?` +
        `access_token=${mapboxKey}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false` +
        `&continue_straight=false` +
        `&roundabout_exits=true`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const durationMinutes = Math.round(route.duration / 60);
          const distanceKm = (route.distance / 1000).toFixed(1);

          setRouteCoordinates(route.geometry.coordinates);
          setRouteInfo(prev => ({
            ...prev,
            duration: durationMinutes,
            formattedDuration: formatDuration(durationMinutes),
            distance: distanceKm,
            targetSite: optimizedSiteOrder[0].site_name,
            isRealTime: true,
            totalStops: optimizedSiteOrder.length,
            lastUpdated: new Date().toLocaleTimeString()
          }));
          
          console.log(`Sequential route updated: Driver through ${optimizedSiteOrder.length} sites (${distanceKm}km, ${durationMinutes}min)`);
          
          if (map.current && mapInitialized) {
            addRouteLayer();
          }
        }
      }
    } catch (error) {
      console.error('Error updating real-time route:', error);
    }
  };

  const startRealTimeRouteUpdates = () => {
    if (routeUpdateIntervalRef.current) {
      clearInterval(routeUpdateIntervalRef.current);
    }

    routeUpdateIntervalRef.current = setInterval(() => {
      if (realTimeRouteEnabled && driverLocation && optimizedSiteOrder.length > 0) {
        updateRealTimeRoute();
      }
    }, 2000);

    console.log('Started real-time route updates');
  };

  const stopRealTimeRouteUpdates = () => {
    if (routeUpdateIntervalRef.current) {
      clearInterval(routeUpdateIntervalRef.current);
      routeUpdateIntervalRef.current = null;
    }
    console.log('Stopped real-time route updates');
  };

  const toggleRealTimeRouting = () => {
    const newState = !realTimeRouteEnabled;
    setRealTimeRouteEnabled(newState);
    
    if (newState) {
      startRealTimeRouteUpdates();
    } else {
      stopRealTimeRouteUpdates();
    }
  };

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

    routeCoordinates.forEach(coord => {
      bounds.extend(coord);
    });

    if (stationLocation) {
      bounds.extend([parseFloat(stationLocation.longitude), parseFloat(stationLocation.latitude)]);
    }
    
    siteLocations.forEach(site => {
      if (site.longitude && site.latitude) {
        bounds.extend([parseFloat(site.longitude), parseFloat(site.latitude)]);
      }
    });

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
      showLoadingSpinner('Initializing map...');

      try {
        mapboxgl.accessToken = mapboxKey;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
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

          if (realTimeRouteEnabled) {
            startRealTimeRouteUpdates();
          }

          hideLoadingSpinner();
        };

        const handleMapError = (e) => {
          console.error('Map error:', e);
          setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
          setMapInitialized(true);
          hideLoadingSpinner();
        };

        map.current.once('load', handleMapLoad);
        map.current.on('error', handleMapError);

        const timeoutId = setTimeout(() => {
          if (!mapInitialized) {
            console.warn('Map load timeout - continuing anyway');
            setMapInitialized(true);
            hideLoadingSpinner();
          }
        }, 10000);

        return () => clearTimeout(timeoutId);

      } catch (error) {
        console.error('Error creating map:', error);
        setMapError(`Failed to create map: ${error.message}`);
        setMapInitialized(true);
        hideLoadingSpinner();
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

  useEffect(() => {
    if (siteLocations.length > 0 && stationLocation && mapboxKey && mapInitialized) {
      console.log('All data available, calculating optimal route...');
      calculateOptimalRoute(siteLocations, stationLocation, realTimeRouteEnabled);
    }
  }, [siteLocations, stationLocation, mapboxKey, mapInitialized]);

  useEffect(() => {
    if (realTimeRouteEnabled && driverLocation && optimizedSiteOrder.length > 0) {
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
    if (mapInitialized && siteLocations.length > 0) {
      console.log('Force updating site markers due to state change');
      updateSiteMarkers(siteLocations);
    }
  }, [mapInitialized, siteLocations, isMobile, realTimeRouteEnabled, nearestSite]);

  useEffect(() => {
    if (mapInitialized && driverLocation) {
      console.log('Force updating driver marker');
      updateDriverMarker(driverLocation, {});
    }
  }, [mapInitialized, driverLocation, isMobile]);

  useEffect(() => {
    if (!barangayId) return;
  
    const initializeRealtime = async () => {
      try {
        console.log('Initializing Reverb connection for real-time location updates...');
        
        initEcho();
        const echo = getEcho();
        
        if (!echo) {
          throw new Error('Echo not initialized');
        }
  
        echo.channel(`driver-locations.${barangayId}`)
          .listen('DriverLocationUpdated', (e) => {
            console.log('Real-time driver location update received:', e);
            setConnectionStatus('connected');
            updateDriverLocation(e);
          });
  
        echo.channel(`schedule-updates.${barangayId}`)
          .listen('ScheduleStatusUpdated', (e) => {
            console.log('Schedule update received:', e);
            updateScheduleData(e.schedule);
          });

        // Listen for site completion events
        echo.channel(`site-completion.${barangayId}`)
          .listen('SiteCompletionUpdated', (e) => {
            console.log('🎯 REALTIME: Site completion event received:', {
              barangay_id: barangayId,
              event_data: e,
              site_id: e.site_id || e.siteId,
              status: e.status,
              site_name: e.site_name || e.siteName,
              completed_sites: e.completed_sites,
              total_sites: e.total_sites
            });
            handleSiteCompletion(e);
            
            // Refresh site data from server to ensure consistency
            refreshSitesFromServer();
          });
  
        setConnectionStatus('connected');
        await loadInitialData();
  
        startPollingBackup();
  
      } catch (error) {
        console.error('Realtime connection failed:', error);
        setConnectionStatus('disconnected');
        startPollingBackup();
      }
    };
  
    const startPollingBackup = () => {
      const pollInterval = setInterval(() => {
        pollDriverLocation();
      }, 10000);
  
      return () => clearInterval(pollInterval);
    };
  
    const pollDriverLocation = async () => {
      try {
        if (scheduleId) {
          const response = await axios.get(`/schedule/${scheduleId}/driver-location`);
          if (response.data.success && response.data.data) {
            updateDriverLocation(response.data.data);
          }
        }
      } catch (error) {
        console.error('Error polling driver location:', error);
      }
    };
  
    initializeRealtime();
  
    return () => {
      const echo = getEcho();
      if (echo) {
        echo.leave(`driver-locations.${barangayId}`);
        echo.leave(`schedule-updates.${barangayId}`);
        echo.leave(`site-completion.${barangayId}`);
      }
    };
  }, [barangayId, scheduleId]);

  const refreshSitesFromServer = async () => {
    try {
      console.log('🔄 Refreshing sites from server after completion event...');
      
      if (!currentSchedule || !currentSchedule.id) {
        console.warn('No current schedule available to refresh sites');
        return;
      }
      
      const sitesResponse = await axios.get(`/schedule/${currentSchedule.id}/sites`);
      
      if (sitesResponse.data.success) {
        const sites = sitesResponse.data.data;
        console.log('✅ Sites refreshed from server:', sites.map(s => ({
          id: s.id,
          name: s.site_name,
          status: s.status
        })));
        
        setSiteLocations(sites);
        
        // Recalculate route with fresh data
        const station = findStation(sites);
        if (station && mapInitialized) {
          setTimeout(() => {
            console.log('🔄 Recalculating route with refreshed data');
            calculateOptimalRoute(sites, station, realTimeRouteEnabled && driverLocation);
          }, 200);
        }
      }
    } catch (error) {
      console.error('Error refreshing sites from server:', error);
    }
  };

  // Test function - expose to window for debugging
  useEffect(() => {
    window.testSiteCompletion = (siteId) => {
      console.log('🧪 TEST: Manually triggering site completion for site ID:', siteId);
      handleSiteCompletion({
        site_id: siteId,
        status: 'finished',
        completed_at: new Date().toISOString(),
        site_name: 'Test Site'
      });
    };
    
    window.refreshResidentMap = () => {
      console.log('🧪 TEST: Manually refreshing resident map');
      refreshSitesFromServer();
    };
  }, [siteLocations, currentSchedule]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      showLoadingSpinner('Loading collection sites...');
      
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
      hideLoadingSpinner();
    } catch (error) {
      console.error('Error loading initial data:', error);
      hideLoadingSpinner();
    } finally {
      setLoading(false);
    }
  };

  const updateDriverLocation = (locationData) => {
    if (!locationData.longitude || !locationData.latitude) {
      console.warn('Invalid location data received:', locationData);
      return;
    }
    
    const newLocation = [parseFloat(locationData.longitude), parseFloat(locationData.latitude)];
    
    console.log('Updating driver location on map:', newLocation);
    
    setDriverLocation(newLocation);
    
    if (mapInitialized && map.current) {
      updateDriverMarker(newLocation, locationData);
      
      if (!hasUserInteractedWithMap()) {
        map.current.flyTo({
          center: newLocation,
          zoom: isMobile ? 16 : 15,
          duration: 2000,
          essential: true,
          offset: [0, isMobile ? -100 : 0]
        });
      }
      
      if (realTimeRouteEnabled) {
        updateRealTimeRoute();
      }
    }
  };

  const handleSiteCompletion = (completionData) => {
    console.log('🎯 PROCESSING site completion:', {
      received_data: completionData,
      site_id_variants: {
        site_id: completionData.site_id,
        siteId: completionData.siteId
      },
      current_sites_count: siteLocations.length
    });
    
    // Update site locations to mark as completed - this will trigger the useEffect
    setSiteLocations(prevSites => {
      console.log('📋 Current sites before update:', prevSites.map(s => ({
        id: s.id,
        name: s.site_name,
        status: s.status
      })));
      
      const updatedSites = prevSites.map(site => {
        if (site.id === completionData.site_id || site.id === completionData.siteId) {
          console.log(`✅ MARKING site ${site.site_name} (ID: ${site.id}) as FINISHED`);
          return {
            ...site,
            status: 'finished',
            collectionStatus: 'finished',
            completed_at: completionData.completed_at || new Date().toISOString()
          };
        }
        return site;
      });
      
      console.log('📋 Sites after update:', updatedSites.map(s => ({
        id: s.id,
        name: s.site_name,
        status: s.status
      })));
      
      return updatedSites;
    });
    
    // Optionally refresh from server for consistency
    setTimeout(() => {
      console.log('🔄 Refreshing sites from server');
      refreshSitesFromServer();
    }, 1000);
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
    
    const locationAge = locationData.timestamp ? 
      (new Date() - new Date(locationData.timestamp)) / 1000 : 0;
    
    const isFresh = locationAge < 30;
    
    markerElement.innerHTML = `
      <div class="relative">
        <div class="${markerSize} bg-blue-600 border-3 border-white rounded-full shadow-lg flex items-center justify-center relative z-10">
          <svg class="${iconSize} text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
            <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
          </svg>
          ${!isFresh ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
          ` : ''}
        </div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
        ${locationData.accuracy ? `
          <div class="absolute inset-0 border-2 border-blue-300 rounded-full opacity-50" 
               style="transform: scale(${Math.min(locationData.accuracy / 10, 3)})"></div>
        ` : ''}
      </div>
    `;
  
    try {
      const newMarker = new mapboxgl.Marker({
        element: markerElement,
        draggable: false
      })
      .setLngLat(coordinates)
      .addTo(map.current);

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: `custom-popup ${isMobile ? 'max-w-xs' : 'max-w-sm'}`
      }).setHTML(`
        <div class="text-sm ${isMobile ? 'p-2' : 'p-3'}">
          <div class="font-semibold text-gray-900 ${isMobile ? 'text-base' : ''}">🚗 Driver Location</div>
          <div class="text-xs text-gray-500 mt-1">
            ${locationData.timestamp ? `Updated: ${new Date(locationData.timestamp).toLocaleTimeString()}` : 'Live'}
          </div>
          ${locationData.accuracy ? `
            <div class="text-xs text-gray-500 mt-1">
              Accuracy: ±${Math.round(locationData.accuracy)} meters
            </div>
          ` : ''}
          ${!isFresh ? `
            <div class="text-xs text-yellow-600 mt-1 font-medium">
              ⚠️ Location data may be delayed
            </div>
          ` : ''}
        </div>
      `);
  
      newMarker.setPopup(popup);
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
        
        const isCompleted = site.status === 'completed' || site.status === 'finished' || site.collectionStatus === 'finished';
        const isCurrent = site.status === 'in_progress';
        const isStation = site.type === 'station';
        const purokName = site.purok_name || site.site_name || 'Site';
        const isTargetSite = realTimeRouteEnabled && nearestSite && nearestSite.id === site.id && !isCompleted;
        
        // Debug logging for completion status
        if (isCompleted) {
          console.log(`✓ Rendering completed site: ${site.site_name} (ID: ${site.id})`);
        }
        
        const getMarkerColor = () => {
          if (isStation) return '#DC2626';
          if (isCompleted) return '#10B981';
          if (isTargetSite) return '#10B981';
          return '#6B7280';
        };

        const getMarkerIcon = () => {
          if (isStation) {
            return `
              <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            `;
          } else if (isCompleted) {
            return `
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            `;
          } else {
            return `
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            `;
          }
        };

        const markerSize = isMobile ? 'w-14 h-14' : 'w-12 h-12';
        const iconSize = isMobile ? 'w-7 h-7' : 'w-6 h-6';
        const stationIconSize = isMobile ? 'w-8 h-8' : 'w-7 h-7';
        
        // Get sequence number from optimized site order
        const sequenceNumber = optimizedSiteOrder.findIndex(s => s.id === site.id) + 1;
        const hasSequence = sequenceNumber > 0;
        
        markerElement.innerHTML = `
          <div class="relative ${isCurrent || isTargetSite ? 'animate-pulse' : ''}">
            ${hasSequence && !isStation ? `
              <div class="absolute -top-2 -right-2 ${isCompleted ? 'bg-green-600' : 'bg-blue-500'} text-white rounded-full ${isMobile ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-xs'} flex items-center justify-center font-bold shadow-lg border-2 border-white z-20">
                ${isCompleted ? '✓' : sequenceNumber}
              </div>
            ` : ''}
            ${isStation ? `
              <div class="${markerSize} rounded-full bg-white shadow-2xl border-4 border-red-600 flex items-center justify-center">
                <div class="${stationIconSize} text-red-600">
                  ${getMarkerIcon()}
                </div>
              </div>
            ` : `
              <div class="${markerSize} rounded-full border-3 border-white flex items-center justify-center shadow-lg" 
                    style="background-color: ${getMarkerColor()}; ${isCompleted ? 'opacity: 0.7;' : ''}">
                <div class="${iconSize} text-white">
                  ${getMarkerIcon()}
                </div>
              </div>
            `}
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

  const refreshRoute = async () => {
    if (siteLocations.length > 0 && stationLocation) {
      showLoadingSpinner('Refreshing route...'); 
      await calculateOptimalRoute(siteLocations, stationLocation, realTimeRouteEnabled);
    }
  };

  const refreshIcons = () => {
    console.log('Manually refreshing icons');
    if (siteLocations.length > 0) {
      updateSiteMarkers(siteLocations);
    }
    if (driverLocation) {
      updateDriverMarker(driverLocation, {});
    }
  };

  const toggleRouteInfo = () => {
    setShowRouteInfo(!showRouteInfo);
  };

  const getMapHeight = () => {
    if (isFullscreen) {
      return '100%'; // Full height in fullscreen mode
    }
    if (windowSize.width < 640) {
      return '400px';
    } else if (windowSize.width < 768) {
      return '500px';
    } else {
      return '600px';
    }
  };

  useEffect(() => {
    console.log('Current state:', {
      cssLoaded,
      mapInitialized,
      containerReady,
      siteLocationsCount: siteLocations.length,
      siteMarkersCount: siteMarkers.length,
      driverLocation: !!driverLocation
    });
  }, [cssLoaded, mapInitialized, containerReady, siteLocations, siteMarkers, driverLocation]);

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

  return (
    <div className={`${isFullscreen ? 'w-full h-full' : 'w-full'} bg-white ${isFullscreen ? '' : 'rounded-lg border border-gray-200'} overflow-hidden`}>
      {/* ONLY GarbageTruckSpinner remains */}
      <GarbageTruckSpinner 
        isLoading={showSpinner}
        message={spinnerMessage}
        size={isMobile ? "medium" : "large"}
        variant="default"
      />

      {/* Map Container */}
      <div className={`relative w-full ${isFullscreen ? 'h-full' : ''}`} style={{ height: isFullscreen ? '100%' : getMapHeight() }}>
        {/* REMOVED: The loading spinner div that was here */}
        
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0"
        />
        
        {mapInitialized && (
          <>
            {/* Enhanced Legend - Responsive and Fullscreen Optimized */}
            <div className={`absolute ${
              isMobile 
                ? 'bottom-2 left-2' 
                : isFullscreen 
                  ? 'bottom-4 left-4' 
                  : 'bottom-4 left-4'
            } bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 ${
              isMobile ? 'p-2' : 'p-3'
            } z-10 ${
              isMobile ? 'min-w-40 max-w-48' : isFullscreen ? 'min-w-52' : 'min-w-48'
            }`}>
              <div className={`font-semibold ${isMobile ? 'text-xs' : 'text-sm'} text-gray-900 ${isMobile ? 'mb-2' : 'mb-3'} flex items-center justify-between`}>
                <span>Legend</span>
                {isFullscreen && !isMobile && (
                  <span className="text-xs font-normal text-gray-500">Live Tracking</span>
                )}
              </div>
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

            {/* Enhanced Control Buttons - Responsive and Fullscreen Optimized */}
            <div className={`absolute ${
              isMobile 
                ? 'top-2 right-2' 
                : isFullscreen 
                  ? 'top-4 right-4' 
                  : 'top-4 right-4'
            } flex ${isFullscreen && !isMobile ? 'flex-row gap-2' : 'flex-col gap-2'} z-10`}>


              {/* <button
                onClick={toggleRealTimeRouting}
                className={`${
                  isFullscreen && !realTimeRouteEnabled ? 'bg-white/95 backdrop-blur-sm' : ''
                } rounded-lg shadow-lg border transition-colors flex items-center justify-center ${
                  isMobile ? 'p-2' : 'p-3'
                } ${
                  realTimeRouteEnabled 
                    ? 'bg-green-500 border-green-600 hover:bg-green-600 text-white' 
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
                title={realTimeRouteEnabled ? 'Disable real-time routing' : 'Enable real-time routing'}
              >
                <div className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ${realTimeRouteEnabled ? 'animate-pulse' : ''}`}></div>
              </button> */}

              <button
                onClick={refreshRoute}
                disabled={routeLoading}
                className={`${
                  isFullscreen ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
                } rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center ${
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

              <button
                onClick={toggleRouteInfo}
                className={`${
                  isFullscreen ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
                } rounded-lg shadow-lg border ${
                  showRouteInfo ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                } hover:bg-gray-50 transition-colors flex items-center justify-center ${
                  isMobile ? 'p-2' : 'p-3'
                }`}
                title={showRouteInfo ? 'Hide route info' : 'Show route info'}
              >
                <IoList className={`${showRouteInfo ? 'text-blue-600' : 'text-gray-700'} ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>

              <button
                onClick={fitMapToRoute}
                className={`${
                  isFullscreen ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'
                } rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center ${
                  isMobile ? 'p-2' : 'p-3'
                }`}
                title="Fit to route"
              >
                <IoNavigate className={`text-gray-700 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>
            </div>

            {/* Connection Status - Responsive and Fullscreen Optimized */}
            <div className={`absolute ${
              isMobile 
                ? 'top-2 left-2' 
                : isFullscreen 
                  ? 'top-4 left-4' 
                  : 'top-4 left-4'
            } bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 ${
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

            {/* Enhanced Route Information Panel - Responsive and Fullscreen Optimized */}
            {routeInfo && showRouteInfo && (
              <div className={`absolute ${
                isMobile 
                  ? 'top-12 left-2 right-2' 
                  : isFullscreen 
                    ? 'top-4 left-1/2 transform -translate-x-1/2' 
                    : 'top-16 left-4'
              } bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 ${
                isMobile ? 'p-3' : 'p-4'
              } z-10 ${
                isMobile 
                  ? '' 
                  : isFullscreen 
                    ? 'min-w-80 max-w-md' 
                    : 'min-w-64'
              }`}>
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