import { useRef, useState, useCallback } from 'react';

export const useRouteCalculation = ({ mapboxKey, isOnline, isMobile, activeSchedule }) => {
  const offlineRouteCache = useRef(new Map());
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [aiOptimizedRoute, setAiOptimizedRoute] = useState(null);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);
  const [nearestSiteToStation, setNearestSiteToStation] = useState(null);

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

  const formatDuration = useCallback((minutes) => {
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
  }, []);

  const formatDurationForAI = useCallback((minutes) => {
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
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const cacheRoute = useCallback((key, routeData) => {
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
  }, []);

  const getCachedRoute = useCallback((key) => {
    const memoryCache = offlineRouteCache.current.get(key);
    if (memoryCache && (Date.now() - memoryCache.timestamp) < memoryCache.ttl) {
      return memoryCache.data;
    }

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
  }, []);

  const findNearestSiteToStation = useCallback((station, sites) => {
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
  }, [calculateDistance]);

  const optimizeSiteOrderFromStation = useCallback((station, sites) => {
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
  }, [calculateDistance]);

  const analyzeTrafficConditions = useCallback((route) => {
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
  }, []);

  const generateRecommendation = useCallback((route, nearestSite, durationMinutes, totalStops) => {
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
  }, [analyzeTrafficConditions, formatDurationForAI]);

  const getSuggestedAction = useCallback((duration, traffic) => {
    if (duration > 120) return 'Consider alternative routes';
    if (traffic === 'heavy') return 'Leave early to avoid peak hours';
    if (duration < 15) return 'Proceed directly from station';
    return 'Normal driving conditions';
  }, []);

  const analyzeAndOptimizeRouteFromStation = useCallback(async (station, sites) => {
    if (!station || sites.length === 0) return null;

    try {
      const optimizedOrder = optimizeSiteOrderFromStation(station, sites);
      
      const nearest = optimizedOrder[0];

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
  }, [mapboxKey, isOnline, optimizeSiteOrderFromStation, getCachedRoute, cacheRoute, formatDuration, analyzeTrafficConditions, generateRecommendation]);

  const calculateRouteToNextSite = useCallback(async (currentPos, nextSite) => {
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
      }
    } catch (error) {
      console.error('Error calculating route to next site:', error);
    }
  }, [mapboxKey, formatDuration]);

  const calculateRouteToNearestSiteFromStation = useCallback(async (currentPos, nearestSiteToStation) => {
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
      }
    }
    return null;
  }, [mapboxKey, isOnline, formatDuration, getCachedRoute, cacheRoute]);

  const addRouteLayer = useCallback(() => {
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
      
      const actualRouteColor = routeInfo?.recalculated ? '#FF6B35' : routeColor;

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
          'line-color': actualRouteColor,
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
          'line-color': actualRouteColor,
          'line-width': lineWidth,
          'line-opacity': 0.9
        }
      });

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

    } catch (error) {
      console.error('Error adding route layer:', error);
      
      setTimeout(() => {
        addRouteLayer();
      }, 500);
    }
  }, [map, routeCoordinates, routeInfo, isMobile, activeSchedule, barangayColors]);

  return {
    routeCoordinates,
    routeInfo,
    aiOptimizedRoute,
    optimizedSiteOrder,
    nearestSiteToStation,
    
    setRouteCoordinates,
    setRouteInfo,
    setAiOptimizedRoute,
    setOptimizedSiteOrder,
    setNearestSiteToStation,
    
    formatDuration,
    calculateDistance,
    findNearestSiteToStation,
    optimizeSiteOrderFromStation,
    analyzeAndOptimizeRouteFromStation,
    calculateRouteToNextSite,
    calculateRouteToNearestSiteFromStation,
    addRouteLayer,
    cacheRoute,
    getCachedRoute
  };
};