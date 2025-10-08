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
  const [nearestSite, setNearestSite] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);

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

  useEffect(() => {
    const fetchScheduleAndSites = async () => {
      if (!scheduleId) return;
      
      setLoading(true);
      try {
        const scheduleResponse = await axios.get(`/schedules/${scheduleId}`);
        if (scheduleResponse.data.success && scheduleResponse.data.data) {
          const schedule = scheduleResponse.data.data;
          setActiveSchedule(schedule);

          const sitesResponse = await axios.get(`/barangay/${schedule.barangay_id}/sites?status=active`);
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
                const optimizedOrder = optimizeSiteOrderFromStation(station, regularSites);
                setOptimizedSiteOrder(optimizedOrder);
                setNearestSite(optimizedOrder[0]);
              }
            }
            
            setSiteLocations(regularSites);
            
            if (regularSites.length >= 1) {
              await calculateOptimalRoute(regularSites, schedule.barangay_id, station);
            }
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
      });

      map.current.on('load', () => {
        setMapInitialized(true);
        setCustomStyleLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map: ' + e.error?.message);
      });

      map.current.on('idle', () => {
      });

    } catch (error) {
      console.error('Error creating map:', error);
      setMapError('Failed to initialize map: ' + error.message);
    }

    return () => {
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
  }, [mapInitialized, customStyleLoaded, siteLocations, routeCoordinates, optimizedSiteOrder]);

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
      setNearestSite(nearest);

      const allCoordinates = [
        [parseFloat(station.longitude), parseFloat(station.latitude)],
        ...optimizedOrder.map(site => [parseFloat(site.longitude), parseFloat(site.latitude)])
      ];

      const coordinatesString = allCoordinates.map(coord => `${coord[0]},${coord[1]}`).join(';');

      const routeResponse = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${coordinatesString}?` +
        `access_token=${mapboxKey}&geometries=geojson&overview=full&steps=true`
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

        setAiOptimizedRoute(aiResult);
        
        if (isMobile) {
          setShowAIPanel(true);
        }
        
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
        `access_token=${mapboxKey}` +
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
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      const fallbackRoute = sites.map(site => 
        [parseFloat(site.longitude), parseFloat(site.latitude)]
      );
      setRouteCoordinates(fallbackRoute);
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
          
          const existingMarker = document.querySelector('.current-location-marker');
          if (existingMarker) existingMarker.remove();
          
          addCurrentLocationMarker(currentPos);

          if (stationLocation && siteLocations.length > 0) {
            const aiResult = await analyzeAndOptimizeRouteFromStation(stationLocation, siteLocations);
            
            if (aiResult) {
              setRouteCoordinates(aiResult.route);
              setRouteInfo({
                duration: aiResult.duration,
                distance: aiResult.distance
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
          
          let errorMessage = 'Unable to get your location. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out. Try moving to an area with better signal.';
              break;
            default:
              errorMessage += 'An unknown error occurred.';
              break;
          }
          
          alert(errorMessage);
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
    
    const isNearest = nearestSite && nearestSite.id === siteData.id;
    const isStation = siteData.type === 'station';
    const markerSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
    const imageSize = isMobile ? 'w-10 h-10' : 'w-8 h-8';
  
    const markerElement = document.createElement('div');
    markerElement.className = 'custom-image-marker';
    
    let sequenceBadge = '';
    if (activeSchedule) {
      const badgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
      const badgeColor = isStation ? 'bg-red-500' : 'bg-blue-500';
      sequenceBadge = `
        <div class="absolute -top-2 -right-2 ${badgeColor} text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white z-20">
          ${isStation ? '🏠' : sequence}
        </div>
      `;
    }
  
    markerElement.innerHTML = `
      <div class="relative">
        ${sequenceBadge}
        <div class="${markerSize} rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white relative ${isNearest && !isStation ? 'ring-4 ring-green-500 ring-opacity-70' : ''}" 
             style="border-color: ${borderColor};">
          ${isNearest && !isStation ? `
            <div class="absolute -inset-3 rounded-full border-4 border-green-500 border-opacity-70 animate-pulse pointer-events-none z-10"></div>
          ` : ''}
          <img src="${can}" 
               alt="${siteData.site_name}" 
               class="${imageSize} object-cover rounded-full z-0"
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

  const addCurrentLocationMarker = (coordinates) => {
    const existingMarker = document.querySelector('.current-location-marker');
    if (existingMarker) existingMarker.remove();

    const markerElement = document.createElement('div');
    markerElement.className = 'current-location-marker';
    const markerSize = isMobile ? 'w-8 h-8' : 'w-6 h-6';
    markerElement.innerHTML = `
      <div class="relative">
        <div class="${markerSize} bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
      </div>
    `;

    new mapboxgl.Marker({
      element: markerElement,
      draggable: false
    })
    .setLngLat(coordinates)
    .addTo(map.current);
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
    nearestSite,
    isMobile,
    showAIPanel,
    showControls,
    optimizedSiteOrder,

    formatDuration,
    getCurrentLocation,
    getAIOptimizedRoute,
    setShowAIPanel,
    setShowControls
  };
};