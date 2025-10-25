import { useState, useRef, useCallback } from 'react';

export const useRouteCalculation = (mapboxKey, isOnline) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [aiOptimizedRoute, setAiOptimizedRoute] = useState(null);
  const offlineRouteCache = useRef(new Map());

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

  const calculateRoute = useCallback(async (fromPos, toSite, options = {}) => {
    if (!fromPos || !toSite || !mapboxKey) return null;

    try {
      const coordinatesString = `${fromPos[0]},${fromPos[1]};${parseFloat(toSite.longitude)},${parseFloat(toSite.latitude)}`;
      
      const cacheKey = `route_${coordinatesString}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached route (offline mode)');
        setRouteCoordinates(cachedRoute.route);
        setRouteInfo({
          ...cachedRoute.info,
          isCached: true,
          recalculated: options.recalculated || false
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
        
        const routeData = {
          route: route.geometry.coordinates,
          info: {
            duration: durationMinutes,
            formattedDuration: formatDuration(durationMinutes),
            distance: (route.distance / 1000).toFixed(1),
            toSite: toSite.site_name,
            recalculated: options.recalculated || false
          }
        };

        setRouteCoordinates(route.geometry.coordinates);
        setRouteInfo(routeData.info);

        cacheRoute(cacheKey, routeData);
        
        return routeData;
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      createStraightLineRoute(fromPos, toSite, options);
    }
    
    return null;
  }, [mapboxKey, isOnline, formatDuration, getCachedRoute, cacheRoute]);

  const createStraightLineRoute = useCallback((fromPos, toSite, options = {}) => {
    if (!fromPos || !toSite) return;

    const straightLineCoords = [
      fromPos,
      [parseFloat(toSite.longitude), parseFloat(toSite.latitude)]
    ];
    
    setRouteCoordinates(straightLineCoords);
    
    const distance = calculateDistance(
      fromPos[1], fromPos[0],
      parseFloat(toSite.latitude), parseFloat(toSite.longitude)
    );
    
    const estimatedDuration = Math.round(distance * 2);
    
    setRouteInfo({
      duration: estimatedDuration,
      formattedDuration: formatDuration(estimatedDuration),
      distance: distance.toFixed(1),
      toSite: toSite.site_name,
      isFallback: true,
      recalculated: options.recalculated || false
    });
  }, [calculateDistance, formatDuration]);

  const analyzeAndOptimizeRouteFromStation = useCallback(async (station, sites) => {
    if (!station || sites.length === 0) return null;

    try {
      const optimizedOrder = optimizeSiteOrderFromStation(station, sites);
      
      const allCoordinates = [
        [parseFloat(station.longitude), parseFloat(station.latitude)],
        ...optimizedOrder.map(site => [parseFloat(site.longitude), parseFloat(site.latitude)])
      ];

      const coordinatesString = allCoordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      
      const cacheKey = `optimized_route_${coordinatesString}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
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
          nearestSite: optimizedOrder[0],
          optimizedOrder: optimizedOrder,
          route: optimalRoute.geometry.coordinates,
          duration: durationMinutes,
          formattedDuration: formatDuration(durationMinutes),
          distance: (optimalRoute.distance / 1000).toFixed(1),
          isCached: false
        };

        setAiOptimizedRoute(aiResult);
        cacheRoute(cacheKey, aiResult);
        
        return aiResult;
      }
    } catch (error) {
      console.error('AI route analysis failed:', error);
    }
    return null;
  }, [mapboxKey, isOnline, formatDuration, getCachedRoute, cacheRoute]);

  const optimizeSiteOrderFromStation = useCallback((station, sites) => {
    if (!station || sites.length === 0) return sites;

    const sitesWithDistances = sites.map(site => {
      const distance = calculateDistance(
        parseFloat(station.latitude), parseFloat(station.longitude),
        parseFloat(site.latitude), parseFloat(site.longitude)
      );
      return { ...site, distance };
    });

    sitesWithDistances.sort((a, b) => a.distance - b.distance);
    return sitesWithDistances;
  }, [calculateDistance]);

  return {
    routeCoordinates,
    routeInfo,
    aiOptimizedRoute,
    calculateRoute,
    createStraightLineRoute,
    analyzeAndOptimizeRouteFromStation,
    optimizeSiteOrderFromStation,
    setRouteCoordinates,
    setRouteInfo,
    setAiOptimizedRoute,
    formatDuration,
    calculateDistance
  };
};