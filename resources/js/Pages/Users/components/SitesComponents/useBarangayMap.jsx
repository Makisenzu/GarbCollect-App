import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import can from "@/images/can.png";

export const useBarangayMap = (mapboxToken) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [activeSchedule, setActiveSchedule] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [sites, setSites] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [aiOptimizedRoute, setAiOptimizedRoute] = useState(null);
  const [nearestSite, setNearestSite] = useState(null);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);
  const [stationLocation, setStationLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Barangay colors for routes
  const barangayColors = {
    'Alegria': '#FF6B6B',
    'Barangay 1': '#4ECDC4',
    'Barangay 2': '#45B7D1',
    'Barangay 3': '#96CEB4',
    'Barangay 4': '#FFEAA7',
    'Barangay 5': '#DDA0DD',
    'Bayugan 2': '#98D8C8',
    'Bitan-agan': '#F7DC6F',
    'Borbon': '#BB8FCE',
    'Buenasuerte': '#85C1E9',
    'Caimpugan': '#F8C471',
    'Das-agan': '#82E0AA',
    'Ebro': '#F1948A',
    'Hubang': '#85C1E9',
    'Karaus': '#D7BDE2',
    'Ladgadan': '#76D7C4',
    'Lapinigan': '#F9E79F',
    'Lucac': '#AED6F1',
    'Mate': '#FAD7A0',
    'New Visayas': '#ABEBC6',
    'Ormaca': '#E8DAEF',
    'Pasta': '#FDEBD0',
    'Pisa-an': '#F5B7B1',
    'Rizal': '#D2B4DE',
    'San Isidro': '#A9DFBF',
    'Santa Ana': '#C39BD3',
    'Tagapua': '#AED6F1',
    'San Francisco': '#F7DC6F',
    '_default': '#4F262A'
  };

  // Utility functions
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

  // Calculate distance between two coordinates
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

  // Clear all map data
  const clearMapData = () => {
    clearMarkers();
    clearRouteLayers();
    setNearestSite(null);
    setOptimizedSiteOrder([]);
    setStationLocation(null);
    setSites([]);
    setActiveSchedule([]);
    setUpcomingSchedules([]);
  };

  // Optimize site order using nearest neighbor algorithm
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

  // Optimize site order from station
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

  // Calculate optimal route using Mapbox Directions API
  const calculateOptimalRoute = async (sites, barangayId, station = null) => {
    if (!mapboxToken || sites.length < 1) return;

    try {
      const optimizedSites = station 
        ? optimizeSiteOrderFromStation(station, sites)
        : optimizeSiteOrder(sites);

      setOptimizedSiteOrder(optimizedSites);
      if (optimizedSites.length > 0) {
        setNearestSite(optimizedSites[0]);
      }
      
      const coordinates = station 
        ? [
            `${station.longitude},${station.latitude}`,
            ...optimizedSites.map(site => `${parseFloat(site.longitude)},${parseFloat(site.latitude)}`)
          ].join(';')
        : optimizedSites.map(site => `${parseFloat(site.longitude)},${parseFloat(site.latitude)}`).join(';');

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?` +
        `access_token=${mapboxToken}` +
        `&geometries=geojson` +
        `&overview=full` +
        `&steps=true` +
        `&alternatives=false` +
        `&continue_straight=false`
      );

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
          distance: (fastestRoute.distance / 1000).toFixed(1)
        });

        // Add AI analysis
        if (station) {
          const aiResult = await analyzeAndOptimizeRouteFromStation(station, sites);
          setAiOptimizedRoute(aiResult);
        }
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      const fallbackRoute = sites.map(site => 
        [parseFloat(site.longitude), parseFloat(site.latitude)]
      );
      setRouteCoordinates(fallbackRoute);
    }
  };

  // AI Route Analysis from Station
  const analyzeAndOptimizeRouteFromStation = async (station, sites) => {
    if (!station || sites.length === 0) return null;

    try {
      const optimizedOrder = optimizeSiteOrderFromStation(station, sites);
      
      const nearest = optimizedOrder[0];
      setNearestSite(nearest);

      const allCoordinates = [
        [parseFloat(station.longitude), parseFloat(station.latitude)],
        ...optimizedOrder.map(site => [parseFloat(site.longitude), parseFloat(site.latitude)])
      ];

      const coordinatesString = allCoordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');

      const routeResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${coordinatesString}?` +
        `access_token=${mapboxToken}&geometries=geojson&overview=full&steps=true`
      );

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
          recommendation: generateRecommendation(optimalRoute, nearest, durationMinutes, optimizedOrder.length)
        };

        return aiResult;
      }
    } catch (error) {
      console.error('AI route analysis from station failed:', error);
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
    
    if (durationMinutes < 10) {
      recommendation = `Start from station. You'll reach ${nearestSite.site_name} in ${formattedDuration}. Total ${totalStops} stops.`;
    } else if (durationMinutes < 60) {
      recommendation = `Start from station. Head to ${nearestSite.site_name} - ${formattedDuration} away. ${totalStops} stops total. ${traffic.conditions === 'heavy' ? 'Heavy traffic expected.' : 'Good road conditions.'}`;
    } else {
      recommendation = `Start from station. Long route to ${nearestSite.site_name} (${formattedDuration}). ${totalStops} stops. Consider taking breaks. ${traffic.conditions === 'heavy' ? 'Significant delays expected.' : ''}`;
    }
    
    return {
      text: recommendation,
      suggestedAction: getSuggestedAction(durationMinutes, traffic.conditions)
    };
  };

  const getSuggestedAction = (duration, traffic) => {
    if (duration > 120) return 'Consider alternative routes';
    if (traffic === 'heavy') return 'Leave early to avoid peak hours';
    if (duration < 15) return 'Proceed directly from station';
    return 'Normal driving conditions';
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Fetch schedules for a barangay
  const fetchSchedules = async (barangayId) => {
    try {
      const response = await axios.get(`/barangay/schedule/${barangayId}`);
      if (response.data.success) {
        const allSchedules = response.data.barangaySchedule || [];
        
        // Separate today's schedule and upcoming schedules
        const today = getTodayDate();
        const todaySchedule = allSchedules.filter(schedule => schedule.collection_date === today);
        const upcoming = allSchedules.filter(schedule => schedule.collection_date > today);
        
        setActiveSchedule(todaySchedule);
        setUpcomingSchedules(upcoming);
        
        return { todaySchedule, upcomingSchedules: upcoming };
      }
      return { todaySchedule: [], upcomingSchedules: [] };
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return { todaySchedule: [], upcomingSchedules: [] };
    }
  };

  // Fetch sites for a specific schedule
  const fetchSitesForSchedule = async (barangayId, scheduleId = null) => {
    try {
      setSitesLoading(true);
      
      let url = `/barangay/getSites/${barangayId}`;
      if (scheduleId) {
        url += `?schedule_id=${scheduleId}`;
      }
      
      const sitesResponse = await axios.get(url);
      
      if (sitesResponse.data.success) {
        const sitesData = sitesResponse.data.data;
        setSites(sitesData);
        
        // Separate station from regular sites
        const station = sitesData.find(site => site.type === 'station');
        const regularSites = sitesData.filter(site => site.type !== 'station');
        
        if (station) {
          setStationLocation(station);
        }
        
        // Calculate optimal route only if there are regular sites
        if (regularSites.length > 0) {
          calculateOptimalRoute(regularSites, barangayId, station)
            .then(() => {
              console.log('Route calculation completed');
            })
            .catch(error => {
              console.error('Route calculation failed:', error);
            });
        }
        
        // Display sites immediately
        displaySitesOnMap(sitesData);
      } else {
        console.error('Failed to fetch sites:', sitesResponse.data.message);
        setSites([]);
        clearMarkers();
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      setError('Failed to load sites data');
      setSites([]);
      clearMarkers();
    } finally {
      setSitesLoading(false);
    }
  };

  // Fetch sites with schedule check
  const fetchSites = async (barangayId, scheduleId = null) => {
    // First fetch schedules to know what's available
    const { todaySchedule } = await fetchSchedules(barangayId);
    
    // If no schedule specified and there's a schedule today, use today's schedule
    if (!scheduleId && todaySchedule.length > 0) {
      // Use the first schedule for today (you might want to handle multiple schedules differently)
      await fetchSitesForSchedule(barangayId, todaySchedule[0]?.id);
    } else if (scheduleId) {
      // Use the specified schedule
      await fetchSitesForSchedule(barangayId, scheduleId);
    } else {
      // No schedule for today and no specific schedule requested
      console.log('No schedule found for today');
      setSites([]);
      setActiveSchedule([]);
      clearMarkers();
      clearRouteLayers();
    }
  };

  // Helper function to clear route layers
  const clearRouteLayers = () => {
    if (!map.current) return;
    
    ['route', 'route-glow', 'route-direction'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    
    setRouteCoordinates([]);
    setRouteInfo(null);
    setAiOptimizedRoute(null);
  };

  // Display sites on map with optimized order
  const displaySitesOnMap = (sitesData) => {
    if (!map.current || !mapLoaded) return;

    clearMarkers();

    const newMarkers = [];

    // Display station first
    const station = sitesData.find(site => site.type === 'station');
    if (station) {
      const stationMarker = addMarker(
        [parseFloat(station.longitude), parseFloat(station.latitude)],
        'station',
        station.site_name,
        station,
        0
      );
      newMarkers.push(stationMarker);
    }

    // Display sites in optimized order
    const sitesToDisplay = optimizedSiteOrder.length > 0 ? optimizedSiteOrder : 
                          sitesData.filter(site => site.type !== 'station');
    
    sitesToDisplay.forEach((site, index) => {
      if (site.longitude && site.latitude) {
        const marker = addMarker(
          [parseFloat(site.longitude), parseFloat(site.latitude)],
          'site',
          site.site_name,
          site,
          index + 1
        );
        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Fit map to show all sites
    if (sitesData.length > 0 && sitesData.some(site => site.latitude && site.longitude)) {
      const bounds = new mapboxgl.LngLatBounds();
      
      sitesData.forEach(site => {
        if (site.latitude && site.longitude) {
          bounds.extend([parseFloat(site.longitude), parseFloat(site.latitude)]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: isMobile ? 80 : 50,
        maxZoom: 15,
        duration: 1000
      });
    }

    // Add route layer if we have coordinates
    if (routeCoordinates.length > 0) {
      addRouteLayer();
    }
  };

  // Add route layer to map
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

    // Remove existing route layers
    ['route', 'route-glow', 'route-direction'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }

    try {
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

      const selectedBarangayData = barangays.find(b => b.id == selectedBarangay);
      const barangayName = selectedBarangayData?.baranggay_name || 'San Francisco';
      const routeColor = barangayColors[barangayName] || barangayColors['_default'];

      const lineWidth = isMobile ? 6 : 5;
      const glowWidth = isMobile ? 14 : 12;

      // Add route glow
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
          'line-opacity': 0.3,
          'line-blur': 10
        }
      });

      // Add main route line
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

    } catch (error) {
      console.error('Error adding route layer:', error);
    }
  };

  // Fixed createImageMarker function
  const createImageMarker = (siteData, sequence) => {
    const selectedBarangayData = barangays.find(b => b.id == selectedBarangay);
    const borderColor = barangayColors[selectedBarangayData?.baranggay_name] || barangayColors['_default'];
    
    const isNearest = nearestSite && nearestSite.id === siteData.id;
    const isStation = siteData.type === 'station';
    
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-image-marker';
    
    // Set fixed dimensions to prevent floating
    const markerSize = isMobile ? 56 : 48;
    const imageSize = isMobile ? 48 : 40;
    const badgeSize = isMobile ? 32 : 28;

    // Create main container
    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = `${markerSize}px`;
    container.style.height = `${markerSize}px`;
    container.style.transition = 'transform 0.3s ease';
    
    // Create sequence badge if needed
    if (sequence > 0 || isStation) {
      const badge = document.createElement('div');
      badge.style.position = 'absolute';
      badge.style.top = '-12px';
      badge.style.right = '-12px';
      badge.style.width = `${badgeSize}px`;
      badge.style.height = `${badgeSize}px`;
      badge.style.backgroundColor = isStation ? '#EF4444' : '#3B82F6';
      badge.style.color = 'white';
      badge.style.borderRadius = '50%';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = isMobile ? '12px' : '11px';
      badge.style.border = '2px solid white';
      badge.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      badge.style.zIndex = '20';
      badge.style.transition = 'transform 0.2s ease';
      
      badge.textContent = isStation ? '🏠' : sequence;
      
      // Add hover effect
      badge.addEventListener('mouseenter', () => {
        badge.style.transform = 'scale(1.1)';
      });
      badge.addEventListener('mouseleave', () => {
        badge.style.transform = 'scale(1)';
      });
      
      container.appendChild(badge);
    }

    // Create main marker circle
    const circle = document.createElement('div');
    circle.style.width = '100%';
    circle.style.height = '100%';
    circle.style.borderRadius = '50%';
    circle.style.border = `4px solid ${borderColor}`;
    circle.style.display = 'flex';
    circle.style.alignItems = 'center';
    circle.style.justifyContent = 'center';
    circle.style.overflow = 'hidden';
    circle.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    circle.style.backgroundColor = 'white';
    circle.style.position = 'relative';

    // Add special effects for nearest site and station
    if (isNearest && !isStation) {
      circle.style.boxShadow = `0 0 0 4px rgba(34, 197, 94, 0.7)`;
      circle.style.animation = 'pulse 2s infinite';
    } else if (isStation) {
      circle.style.boxShadow = `0 0 0 4px rgba(239, 68, 68, 0.5)`;
    }

    // Create image element
    const img = document.createElement('img');
    img.src = can;
    img.alt = siteData.site_name || 'Collection site';
    img.style.width = `${imageSize}px`;
    img.style.height = `${imageSize}px`;
    img.style.borderRadius = '50%';
    img.style.objectFit = 'cover';
    img.style.transition = 'transform 0.2s ease';

    // Fallback for broken images
    img.onerror = () => {
      img.style.display = 'none';
      const fallback = document.createElement('div');
      fallback.style.width = `${imageSize}px`;
      fallback.style.height = `${imageSize}px`;
      fallback.style.borderRadius = '50%';
      fallback.style.display = 'flex';
      fallback.style.alignItems = 'center';
      fallback.style.justifyContent = 'center';
      fallback.style.color = 'white';
      fallback.style.fontWeight = 'bold';
      fallback.style.fontSize = isMobile ? '14px' : '12px';
      fallback.style.background = 'linear-gradient(135deg, #3B82F6, #8B5CF6)';
      fallback.style.border = `3px solid ${borderColor}`;
      fallback.textContent = (siteData.site_name?.charAt(0) || 'S').toUpperCase();
      circle.appendChild(fallback);
    };

    circle.appendChild(img);
    container.appendChild(circle);

    // Add hover effects
    container.addEventListener('mouseenter', () => {
      container.style.transform = 'scale(1.1)';
      img.style.transform = 'scale(1.1)';
    });
    
    container.addEventListener('mouseleave', () => {
      container.style.transform = 'scale(1)';
      img.style.transform = 'scale(1)';
    });

    markerElement.appendChild(container);
    return markerElement;
  };

  // Fixed createStationIcon function
  const createStationIcon = (sequence) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.position = 'relative';
    el.style.width = '48px';
    el.style.height = '48px';

    // Create sequence badge for station
    if (sequence === 0) {
      const badgeSize = isMobile ? 32 : 28;
      const badge = document.createElement('div');
      badge.style.position = 'absolute';
      badge.style.top = '-12px';
      badge.style.right = '-12px';
      badge.style.width = `${badgeSize}px`;
      badge.style.height = `${badgeSize}px`;
      badge.style.backgroundColor = '#EF4444';
      badge.style.color = 'white';
      badge.style.borderRadius = '50%';
      badge.style.display = 'flex';
      badge.style.alignItems = 'center';
      badge.style.justifyContent = 'center';
      badge.style.fontWeight = 'bold';
      badge.style.fontSize = isMobile ? '12px' : '11px';
      badge.style.border = '2px solid white';
      badge.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      badge.style.transition = 'transform 0.2s ease';
      badge.textContent = '🏠';
      
      badge.addEventListener('mouseenter', () => {
        badge.style.transform = 'scale(1.1)';
      });
      badge.addEventListener('mouseleave', () => {
        badge.style.transform = 'scale(1)';
      });
      
      el.appendChild(badge);
    }

    // Create station icon
    const icon = document.createElement('div');
    icon.style.transition = 'transform 0.3s ease';
    icon.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="#DC2626">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    `;
    
    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.1)';
    });
    
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1)';
    });

    el.appendChild(icon);
    return el;
  };

  const addMarker = (coordinates, type = 'site', title = '', siteData = null, sequence = 0) => {
    let markerElement;
    
    if (siteData?.type === 'station') {
      markerElement = createStationIcon(sequence);
    } else {
      markerElement = createImageMarker(siteData, sequence);
    }

    const marker = new mapboxgl.Marker({
      element: markerElement,
      draggable: false
    })
    .setLngLat(coordinates)
    .addTo(map.current);

    // Add popup with site info
    if (siteData) {
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'custom-popup'
      })
        .setHTML(`
          <div class="p-4 min-w-64 bg-white rounded-xl shadow-2xl border border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                ${siteData.type === 'station' ? '🏠' : sequence || 'S'}
              </div>
              <div>
                <h3 class="font-bold text-gray-900 text-lg">${siteData.site_name || 'Unnamed Site'}</h3>
                <p class="text-sm text-gray-600 flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  ${siteData.type || 'Collection Site'}
                </p>
              </div>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                <span class="text-gray-700 font-medium">Status</span>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  ${siteData.status || 'Active'}
                </span>
              </div>
              ${siteData.notes ? `
                <div class="bg-blue-50 rounded-lg p-3">
                  <p class="text-blue-800 text-sm flex items-start gap-2">
                    <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span>${siteData.notes}</span>
                  </p>
                </div>
              ` : ''}
              ${sequence > 0 ? `
                <div class="flex items-center justify-between py-2 px-3 bg-purple-50 rounded-lg">
                  <span class="text-gray-700 font-medium">Route Order</span>
                  <span class="font-bold text-purple-600">${sequence}</span>
                </div>
              ` : ''}
            </div>
          </div>
        `);

      marker.setPopup(popup);
    }

    return marker;
  };

  const clearMarkers = () => {
    markers.forEach(marker => marker.remove());
    setMarkers([]);
  };

  // Fixed current location marker
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const currentPos = [longitude, latitude];
          setCurrentLocation(currentPos);
          
          // Remove existing current location marker
          const existingMarker = document.querySelector('.current-location-marker');
          if (existingMarker) {
            const marker = markers.find(m => m.getElement().classList.contains('current-location-marker'));
            if (marker) marker.remove();
          }

          // Create current location marker with proper styling
          const markerElement = document.createElement('div');
          markerElement.className = 'current-location-marker';
          
          const container = document.createElement('div');
          container.style.position = 'relative';
          container.style.width = '32px';
          container.style.height = '32px';
          
          const dot = document.createElement('div');
          dot.style.width = '100%';
          dot.style.height = '100%';
          dot.style.backgroundColor = '#2563EB';
          dot.style.border = '3px solid white';
          dot.style.borderRadius = '50%';
          dot.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3)';
          
          const pulse = document.createElement('div');
          pulse.style.position = 'absolute';
          pulse.style.top = '0';
          pulse.style.left = '0';
          pulse.style.width = '100%';
          pulse.style.height = '100%';
          pulse.style.backgroundColor = '#60A5FA';
          pulse.style.borderRadius = '50%';
          pulse.style.animation = 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite';
          
          container.appendChild(dot);
          container.appendChild(pulse);
          markerElement.appendChild(container);

          const marker = new mapboxgl.Marker({
            element: markerElement,
            draggable: false
          })
          .setLngLat(currentPos)
          .addTo(map.current);

          // Update markers state
          setMarkers(prev => [...prev.filter(m => !m.getElement().classList.contains('current-location-marker')), marker]);

          // Center map on current location
          map.current.flyTo({
            center: currentPos,
            zoom: 15,
            duration: 1500
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Add CSS animations for the markers
  useEffect(() => {
    // Inject custom styles for animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      @keyframes ping {
        0% { transform: scale(1); opacity: 1; }
        75%, 100% { transform: scale(2); opacity: 0; }
      }
      .custom-image-marker {
        cursor: pointer;
      }
      .current-location-marker {
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Ensure route gets drawn when routeCoordinates updates
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    if (routeCoordinates && routeCoordinates.length > 0) {
      addRouteLayer();
    } else {
      try {
        if (map.current.getLayer('route')) map.current.removeLayer('route');
        if (map.current.getLayer('route-glow')) map.current.removeLayer('route-glow');
        if (map.current.getSource('route')) map.current.removeSource('route');
      } catch (e) {
        // ignore
      }
    }
  }, [routeCoordinates, mapLoaded]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch barangays
  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        setBarangayLoading(true);
        const response = await axios.get('/getBarangay');
        if (response.data.success) {
          setBarangays(response.data.barangay_data);
        } else {
          console.error('Failed to fetch barangays:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
        setError('Failed to load barangay data');
      } finally {
        setBarangayLoading(false);
      }
    };

    fetchBarangays();
  }, []);

  // Map initialization
  useEffect(() => {
    if (!mapboxToken) {
      setError('Mapbox API key is missing');
      setLoading(false);
      return;
    }

    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
        center: [125.94849837776422, 8.483022468128098],
        zoom: 11,
        attributionControl: false,
        interactive: true,
        scrollZoom: true,
        dragPan: true,
        dragRotate: false,
        keyboard: true,
        doubleClickZoom: true,
        touchZoomRotate: true,
        touchPitch: true,
        cooperativeGestures: false
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setMapLoaded(true);
        setLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map: ' + e.error?.message);
        setLoading(false);
      });

    } catch (error) {
      console.error('Error creating map:', error);
      setError('Failed to initialize map: ' + error.message);
      setLoading(false);
    }

    return () => {
      clearMapData();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Handle barangay change
  const handleBarangayChange = async (barangayId, scheduleId = null) => {
    console.log('Changing barangay to:', barangayId, 'with schedule:', scheduleId);
    
    // Clear all previous data first
    clearMapData();
    
    // Update selected barangay immediately
    setSelectedBarangay(barangayId);
    
    if (barangayId) {
      // Reset loading states
      setSitesLoading(true);
      
      // Fetch sites with optional schedule
      try {
        await fetchSites(barangayId, scheduleId);
      } catch (error) {
        console.error('Error loading barangay data:', error);
        setError('Failed to load barangay data');
      } finally {
        setSitesLoading(false);
      }
    } else {
      // If no barangay selected, clear everything
      setSites([]);
      setActiveSchedule([]);
      setUpcomingSchedules([]);
      setRouteInfo(null);
      setAiOptimizedRoute(null);
    }
  };

  return {
    // Refs
    mapContainer,
    
    // State
    mapLoaded,
    loading,
    barangayLoading,
    sitesLoading,
    error,
    barangays,
    selectedBarangay,
    isMobile,
    activeSchedule,
    upcomingSchedules,
    sites,
    routeInfo,
    aiOptimizedRoute,
    nearestSite,
    currentLocation,
    
    // Functions
    handleBarangayChange,
    getCurrentLocation,
    clearMapData,
    formatDuration,
    barangayColors
  };
};