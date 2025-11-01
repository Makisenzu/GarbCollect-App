import { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { GiControlTower } from "react-icons/gi";
import can from "@/images/can.png";

export const useMapLayers = ({ 
  map, 
  isMobile, 
  activeSchedule, 
  completedSites, 
  optimizedSiteOrder, 
  currentSiteIndex, 
  nearestSiteToStation,
  routeCoordinates,
  routeInfo,
  currentLocation,
  isTaskActive,
  siteLocations,
  stationLocation
}) => {
  const siteMarkersRef = useRef([]);
  const currentLocationMarkerRef = useRef(null);
  const userLocationSourceRef = useRef(null);
  const userLocationLayerRef = useRef(null);
  const animationFrameRef = useRef(null);

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
  const fitMapToRouteAndDriver = (getNextUncompletedSiteIndex, optimizedSiteOrder) => {
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

  const updateSiteMarkers = () => {
    clearSiteMarkers();
    addSiteMarkers();
  };

  return {
    // Refs
    siteMarkersRef,
    currentLocationMarkerRef,
    userLocationSourceRef,
    userLocationLayerRef,
    animationFrameRef,
    
    // Methods
    smoothUpdateUserLocation,
    updateUserLocationSource,
    animatePulse,
    fitMapToRouteAndDriver,
    fitMapToRoute,
    clearUserLocationLayers,
    updateCurrentLocationMarker,
    addRouteLayer,
    addSiteMarkers,
    clearSiteMarkers,
    updateSiteMarkers,
    addMarker,
    createImageMarker,
    createStationIcon,
  };
};