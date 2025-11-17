import { useRef, useState } from 'react';

export const useRouteCalculations = ({ 
  mapboxKey, 
  isOnline, 
  activeSchedule, 
  optimizedSiteOrder, 
  completedSites, 
  siteLocations,
  currentLocation,
  routeCoordinates,
  routeInfo,
  map,
  isMobile,
  addRouteLayer
}) => {
  const offlineRouteCache = useRef(new Map());
  
  const [routeCoordinatesState, setRouteCoordinatesState] = useState([]);
  const [routeInfoState, setRouteInfoState] = useState(null);
  const [aiOptimizedRoute, setAiOptimizedRoute] = useState(null);
  const [allSiteRoutes, setAllSiteRoutes] = useState([]);

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
    
    setRouteCoordinatesState(straightLineCoords);
    
    const distance = calculateDistance(
      currentPos[1], currentPos[0],
      parseFloat(nextSite.latitude), parseFloat(nextSite.longitude)
    );
    
    const estimatedDuration = Math.round(distance * 2); // Rough estimate: 2 min per km
    
    setRouteInfoState({
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
        setRouteCoordinatesState(cachedRoute.route);
        setRouteInfoState({
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

        setRouteCoordinatesState(route.geometry.coordinates);
        setRouteInfoState({
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
    if (!currentLocation || !routeCoordinatesState.length || routeCoordinatesState.length < 2) {
      return true; // No existing route, always recalculate
    }
    
    // Calculate distance from current position to the start of the current route
    const distanceToRouteStart = calculateDistance(
      currentPos[1], currentPos[0],
      routeCoordinatesState[0][1], routeCoordinatesState[0][0]
    );
    
    // ALWAYS recalculate if we have completed sites and the route isn't already recalculated
    // OR if driver is significantly off-route
    const hasCompletedSites = completedSites.size > 0;
    const isOffRoute = distanceToRouteStart > 0.2; // 200 meters
    const isNotRecalculated = !routeInfoState?.recalculated;
    
    const shouldRecalc = isOffRoute || (hasCompletedSites && isNotRecalculated);
    
    if (shouldRecalc) {
      console.log(`Recalculating route - Off route: ${isOffRoute}, Completed sites: ${completedSites.size}, Already recalculated: ${routeInfoState?.recalculated}`);
    }
    
    return shouldRecalc;
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

  // NEW: Calculate routes from driver/station to ALL sites individually
  const calculateRoutesToAllSites = async (startLocation, sites) => {
    if (!startLocation || sites.length === 0) return null;

    try {
      console.log(`Calculating individual routes from driver to ${sites.length} sites...`);
      
      const routePromises = sites.map(async (site, index) => {
        const coordinatesString = `${startLocation[0]},${startLocation[1]};${parseFloat(site.longitude)},${parseFloat(site.latitude)}`;
        
        const cacheKey = `individual_route_${startLocation[0]}_${startLocation[1]}_to_site_${site.id}`;
        const cachedRoute = getCachedRoute(cacheKey);
        
        if (cachedRoute && !isOnline) {
          return {
            siteId: site.id,
            siteName: site.site_name,
            coordinates: cachedRoute.route,
            duration: cachedRoute.duration,
            distance: cachedRoute.distance,
            sequence: index + 1
          };
        }

        try {
          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?` +
            `access_token=${mapboxKey}&geometries=geojson&overview=full`
          );

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const durationMinutes = Math.round(route.duration / 60);
            const distanceKm = (route.distance / 1000).toFixed(1);
            
            const routeData = {
              siteId: site.id,
              siteName: site.site_name,
              coordinates: route.geometry.coordinates,
              duration: durationMinutes,
              distance: distanceKm,
              sequence: index + 1
            };

            // Cache the route
            cacheRoute(cacheKey, {
              route: route.geometry.coordinates,
              duration: durationMinutes,
              distance: distanceKm
            });

            return routeData;
          }
        } catch (error) {
          console.error(`Error calculating route to ${site.site_name}:`, error);
          // Fallback: create straight line
          return {
            siteId: site.id,
            siteName: site.site_name,
            coordinates: [
              startLocation,
              [parseFloat(site.longitude), parseFloat(site.latitude)]
            ],
            duration: Math.round(calculateDistance(
              startLocation[1], startLocation[0],
              parseFloat(site.latitude), parseFloat(site.longitude)
            ) * 2),
            distance: calculateDistance(
              startLocation[1], startLocation[0],
              parseFloat(site.latitude), parseFloat(site.longitude)
            ).toFixed(1),
            sequence: index + 1,
            isFallback: true
          };
        }
        
        return null;
      });

      const allRoutes = await Promise.all(routePromises);
      const validRoutes = allRoutes.filter(route => route !== null);
      
      console.log(`Successfully calculated ${validRoutes.length} routes to all sites`);
      
      return validRoutes;

    } catch (error) {
      console.error('Error calculating routes to all sites:', error);
      return null;
    }
  };

  // NEW: Calculate sequential route from current location through ALL sites
  const analyzeAndOptimizeRouteFromCurrentLocation = async (currentLocation, sites) => {
    if (!currentLocation || sites.length === 0) return null;

    try {
      console.log(`Calculating sequential route from current position through ${sites.length} sites...`);
      
      // Optimize site order starting from current location
      const optimizedOrder = optimizeSiteOrderFromLocation(currentLocation, sites);
      
      const nearest = optimizedOrder[0];

      // Create coordinate string: current location -> site1 -> site2 -> ... -> siteN
      const allCoordinates = [
        currentLocation, // Start from driver's current position
        ...optimizedOrder.map(site => [parseFloat(site.longitude), parseFloat(site.latitude)])
      ];

      const coordinatesString = allCoordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');
      
      const cacheKey = `route_from_current_${coordinatesString}`;
      const cachedRoute = getCachedRoute(cacheKey);
      
      if (cachedRoute && !isOnline) {
        console.log('Using cached route (offline mode)');
        const aiResult = {
          ...cachedRoute,
          isCached: true
        };
        setAiOptimizedRoute(aiResult);
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
          currentLocation: currentLocation,
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
        
        console.log(`Sequential route calculated: Current position → ${optimizedOrder.map(s => s.site_name).join(' → ')}`);
        
        return aiResult;
      }
    } catch (error) {
      console.error('Sequential route calculation from current location failed:', error);
      
      // Fallback: try to get cached route
      const fallbackKey = `route_from_current_${currentLocation[0]}_${currentLocation[1]}`;
      const cachedRoute = getCachedRoute(fallbackKey);
      if (cachedRoute) {
        console.log('Using cached route as fallback');
        setAiOptimizedRoute({ ...cachedRoute, isCached: true });
        return cachedRoute;
      }
    }
    return null;
  };

  // NEW: Optimize site order starting from current location (not station)
  const optimizeSiteOrderFromLocation = (location, sites) => {
    if (!location || sites.length === 0) return sites;

    const remainingSites = [...sites];
    const optimizedOrder = [];
    
    // Calculate distances from current location to all sites
    const sitesWithDistances = remainingSites.map(site => {
      const distance = calculateDistance(
        location[1], location[0], // lat, lng from current location
        parseFloat(site.latitude), parseFloat(site.longitude)
      );
      return {
        ...site,
        distance,
        coordinates: [parseFloat(site.longitude), parseFloat(site.latitude)]
      };
    });

    // Sort by distance from current location
    sitesWithDistances.sort((a, b) => a.distance - b.distance);

    // Start with nearest site to current location
    const nearestSite = sitesWithDistances[0];
    optimizedOrder.push(nearestSite);
    
    const remaining = sitesWithDistances.slice(1);
    
    let currentSite = nearestSite;
    
    // Use nearest neighbor algorithm for remaining sites
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
        setRouteCoordinatesState(cachedRoute.route);
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
          // setShowAIPanel(true); - This will be handled in main hook
        }
        
        return aiResult;
      }
    } catch (error) {
      console.error('AI route analysis from station failed:', error);
      
      const fallbackRoute = getCachedRoute(`route_station_${station.id}`);
      if (fallbackRoute) {
        console.log('Using cached route as fallback');
        setAiOptimizedRoute({ ...fallbackRoute, isCached: true });
        setRouteCoordinatesState(fallbackRoute.route);
        return fallbackRoute;
      }
    }
    return null;
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
        
        setRouteCoordinatesState(route.geometry.coordinates);
        setRouteInfoState({
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
        setRouteCoordinatesState(cachedRoute.route);
        setRouteInfoState({
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

        setRouteCoordinatesState(route.geometry.coordinates);
        setRouteInfoState({
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
        setRouteCoordinatesState(cachedRoute.route);
        setRouteInfoState({
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

  const calculateOptimalRoute = async (sites, station) => {
    if (!mapboxKey || sites.length < 1) return;

    try {
      const optimizedSites = station 
        ? optimizeSiteOrderFromStation(station, sites)
        : optimizeSiteOrder(sites);

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
        setRouteCoordinatesState(cachedRoute.route);
        setRouteInfoState({
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
        
        setRouteCoordinatesState(fastestRoute.geometry.coordinates);
        setRouteInfoState({
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
        setRouteCoordinatesState(cachedRoute.route);
        setRouteInfoState({
          duration: cachedRoute.duration,
          formattedDuration: formatDuration(cachedRoute.duration),
          distance: cachedRoute.distance,
          toSite: cachedRoute.toSite
        });
      } else {
        const fallbackRoute = sites.map(site => 
          [parseFloat(site.longitude), parseFloat(site.latitude)]
        );
        setRouteCoordinatesState(fallbackRoute);
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

  return {
    // State
    routeCoordinates: routeCoordinatesState,
    routeInfo: routeInfoState,
    aiOptimizedRoute,
    allSiteRoutes,
    
    // Setters
    setRouteCoordinates: setRouteCoordinatesState,
    setRouteInfo: setRouteInfoState,
    setAiOptimizedRoute,
    setAllSiteRoutes,
    
    // Methods
    calculateDistance,
    formatDuration,
    formatDurationForAI,
    cacheRoute,
    getCachedRoute,
    getNextUncompletedSiteIndex,
    areAllSitesCompleted,
    createStraightLineRoute,
    recalculateRouteFromCurrentPosition,
    shouldRecalculateRoute,
    analyzeTrafficConditions,
    generateRecommendation,
    optimizeSiteOrderFromStation,
    optimizeSiteOrder,
    optimizeSiteOrderFromLocation,
    analyzeAndOptimizeRouteFromStation,
    analyzeAndOptimizeRouteFromCurrentLocation,
    calculateRouteToNextSite,
    calculateRouteToNearestSiteFromStation,
    calculateOptimalRoute,
    calculateRoutesToAllSites,
  };
};