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

    // Remove route layers (including completed segments)
    ['route', 'route-glow', 'route-direction', 'route-recalculated', 'route-completed', 'route-completed-glow'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    // Remove all-site route layers (find all layers starting with 'route-to-site-')
    const layers = map.current.getStyle().layers;
    layers.forEach(layer => {
      if (layer.id.startsWith('route-to-site-')) {
        if (map.current.getLayer(layer.id)) {
          map.current.removeLayer(layer.id);
        }
      }
    });

    // Remove sources
    if (map.current.getSource('driver-location')) {
      map.current.removeSource('driver-location');
    }
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    if (map.current.getSource('route-completed')) {
      map.current.removeSource('route-completed');
    }

    // Remove all-site route sources
    const sources = Object.keys(map.current.getStyle().sources);
    sources.forEach(sourceId => {
      if (sourceId.startsWith('route-to-site-')) {
        if (map.current.getSource(sourceId)) {
          map.current.removeSource(sourceId);
        }
      }
    });

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

  // NEW: Enhanced route layer that shows recalculation status and completed segments
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
    ['route', 'route-glow', 'route-direction', 'route-recalculated', 'route-completed', 'route-completed-glow'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });
    
    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
    if (map.current.getSource('route-completed')) {
      map.current.removeSource('route-completed');
    }

    try {
      console.log('Adding route layer to map with coordinates:', routeCoordinates.length);
      
      const barangayName = activeSchedule?.barangay_name || 'San Francisco';
      const routeColor = barangayColors[barangayName] || barangayColors['_default'];
      
      // Use different color for recalculated routes
      const actualRouteColor = routeInfo?.recalculated ? '#FF6B35' : routeColor; // Orange for recalculated

      const lineWidth = isMobile ? 6 : 5;
      const glowWidth = isMobile ? 14 : 12;

      // Calculate completed portion of route based on optimized site order and completed sites
      let completedRouteCoordinates = [];
      let remainingRouteCoordinates = routeCoordinates;

      if (optimizedSiteOrder.length > 0 && completedSites.size > 0) {
        // Find the index of the last completed site in route coordinates
        let lastCompletedSiteIndex = -1;
        
        for (let i = optimizedSiteOrder.length - 1; i >= 0; i--) {
          if (completedSites.has(optimizedSiteOrder[i].id)) {
            lastCompletedSiteIndex = i;
            break;
          }
        }

        if (lastCompletedSiteIndex >= 0) {
          // Calculate approximate split point in route coordinates
          const totalSites = optimizedSiteOrder.length;
          const splitRatio = (lastCompletedSiteIndex + 1) / totalSites;
          const splitIndex = Math.floor(routeCoordinates.length * splitRatio);
          
          completedRouteCoordinates = routeCoordinates.slice(0, splitIndex);
          remainingRouteCoordinates = routeCoordinates.slice(splitIndex);
          
          console.log(`Route split: ${completedRouteCoordinates.length} completed, ${remainingRouteCoordinates.length} remaining`);
        }
      }

      // Add completed route segment (if any)
      if (completedRouteCoordinates.length > 1) {
        map.current.addSource('route-completed', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              completed: true
            },
            geometry: {
              type: 'LineString',
              coordinates: completedRouteCoordinates
            }
          }
        });

        // Completed route glow
        map.current.addLayer({
          id: 'route-completed-glow',
          type: 'line',
          source: 'route-completed',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10B981', // Green for completed
            'line-width': glowWidth,
            'line-opacity': 0.3,
            'line-blur': 8
          }
        });

        // Completed route main line
        map.current.addLayer({
          id: 'route-completed',
          type: 'line',
          source: 'route-completed',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#10B981', // Green for completed
            'line-width': lineWidth,
            'line-opacity': 0.7,
            'line-dasharray': [2, 2] // Dashed to show it's completed
          }
        });
      }

      // Add remaining route segment
      if (remainingRouteCoordinates.length > 1) {
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              recalculated: routeInfo?.recalculated || false,
              remaining: true
            },
            geometry: {
              type: 'LineString',
              coordinates: remainingRouteCoordinates
            }
          }
        });

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

  // NEW: Add multiple route layers for all sites
  const addAllSiteRoutesLayers = (allRoutes) => {
    if (!map.current || !allRoutes || allRoutes.length === 0) {
      console.log('Cannot add all site routes - missing map or routes');
      return;
    }

    if (!map.current.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting...');
      map.current.once('styledata', () => {
        setTimeout(() => addAllSiteRoutesLayers(allRoutes), 100);
      });
      return;
    }

    try {
      console.log(`Adding ${allRoutes.length} individual route layers to map`);

      // Clear any existing all-site route layers
      allRoutes.forEach((route, index) => {
        const layerId = `route-to-site-${route.siteId}`;
        const glowLayerId = `route-to-site-${route.siteId}-glow`;
        const directionLayerId = `route-to-site-${route.siteId}-direction`;
        
        [layerId, glowLayerId, directionLayerId].forEach(id => {
          if (map.current.getLayer(id)) {
            map.current.removeLayer(id);
          }
        });
        
        if (map.current.getSource(layerId)) {
          map.current.removeSource(layerId);
        }
      });

      const barangayName = activeSchedule?.barangay_name || 'San Francisco';
      const baseRouteColor = barangayColors[barangayName] || barangayColors['_default'];

      // Add each route as a separate layer
      allRoutes.forEach((route, index) => {
        const sourceId = `route-to-site-${route.siteId}`;
        const layerId = `route-to-site-${route.siteId}`;
        const glowLayerId = `route-to-site-${route.siteId}-glow`;
        const directionLayerId = `route-to-site-${route.siteId}-direction`;

        // Add source for this route
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              siteId: route.siteId,
              siteName: route.siteName,
              sequence: route.sequence,
              distance: route.distance,
              duration: route.duration
            },
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates
            }
          }
        });

        // Calculate color based on sequence (gradient effect)
        const opacity = 0.3 + (index / allRoutes.length) * 0.4; // Varying opacity
        const lineWidth = isMobile ? 4 : 3;
        const glowWidth = isMobile ? 10 : 8;

        // Route glow layer
        map.current.addLayer({
          id: glowLayerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': baseRouteColor,
            'line-width': glowWidth,
            'line-opacity': opacity * 0.3,
            'line-blur': 6
          }
        });

        // Main route layer
        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': baseRouteColor,
            'line-width': lineWidth,
            'line-opacity': opacity,
            'line-dasharray': route.isFallback ? [2, 2] : [1]
          }
        });

        // Direction arrows
        map.current.addLayer({
          id: directionLayerId,
          type: 'symbol',
          source: sourceId,
          layout: {
            'symbol-placement': 'line',
            'text-field': '▶',
            'text-size': isMobile ? 10 : 8,
            'symbol-spacing': 120
          },
          paint: {
            'text-color': baseRouteColor,
            'text-opacity': opacity * 0.8
          }
        });
      });

      console.log(`Successfully added ${allRoutes.length} route layers`);

      // Fit map to show all routes
      setTimeout(() => {
        fitMapToAllRoutes(allRoutes);
      }, 200);

    } catch (error) {
      console.error('Error adding all site route layers:', error);
    }
  };

  // NEW: Fit map to show all routes
  const fitMapToAllRoutes = (allRoutes) => {
    if (!map.current || !allRoutes || allRoutes.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    
    // Include all route coordinates
    allRoutes.forEach(route => {
      route.coordinates.forEach(coord => {
        bounds.extend(coord);
      });
    });
    
    // Include driver's current position
    if (currentLocation) {
      bounds.extend(currentLocation);
    }

    const padding = isMobile ? 40 : 80;

    try {
      map.current.fitBounds(bounds, {
        padding: padding,
        duration: 1000,
        essential: true,
        maxZoom: isMobile ? 15 : 14
      });
    } catch (error) {
      console.error('Error fitting map to all routes:', error);
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
      const badgeSize = isMobile ? 'w-8 h-8 text-sm' : 'w-7 h-7 text-xs';
      let badgeColor = 'bg-blue-500';
      let badgeContent = sequence;
      
      if (isCompleted) {
        badgeColor = 'bg-green-600';
        badgeContent = '<span class="text-lg">✓</span>';
      } else if (isCurrent) {
        badgeColor = 'bg-yellow-500 animate-pulse';
        badgeContent = sequence;
      } else if (isStation) {
        badgeColor = 'bg-red-500';
        badgeContent = '🏠';
      }
      
      sequenceBadge = `
        <div class="absolute -top-2 -right-2 ${badgeColor} text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white z-20">
          ${badgeContent}
        </div>
      `;
    }
  
    // Enhanced completed visual feedback
    const opacityClass = isCompleted ? 'opacity-60' : 'opacity-100';
    const completedClass = isCompleted ? 'grayscale brightness-110' : '';
    const completedBorder = isCompleted ? 'border-green-600' : '';
    const currentClass = isCurrent && !isCompleted ? 'ring-4 ring-yellow-500 ring-opacity-70' : '';
    const nearestClass = isNearestToStation && !isCompleted && !isCurrent ? 'ring-4 ring-green-500 ring-opacity-70' : '';
    
    // Add completion celebration effect
    const completionEffect = isCompleted ? `
      <div class="absolute inset-0 rounded-full bg-green-500 bg-opacity-20 animate-ping pointer-events-none z-0"></div>
    ` : '';
  
    markerElement.innerHTML = `
      <div class="relative ${opacityClass}">
        ${sequenceBadge}
        ${completionEffect}
        <div class="${markerSize} rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white relative ${currentClass} ${nearestClass} ${completedClass} ${completedBorder}" 
             style="border-color: ${isCompleted ? '#16A34A' : borderColor}; border-width: ${isCompleted ? '3px' : '2px'};">
          ${isCurrent && !isCompleted ? `
            <div class="absolute -inset-3 rounded-full border-4 border-yellow-500 border-opacity-70 animate-pulse pointer-events-none z-10"></div>
          ` : ''}
          ${isNearestToStation && !isCompleted && !isCurrent ? `
            <div class="absolute -inset-3 rounded-full border-4 border-green-500 border-opacity-70 animate-pulse pointer-events-none z-10"></div>
          ` : ''}
          ${isCompleted ? `
            <div class="absolute inset-0 bg-green-600 bg-opacity-30 rounded-full z-5 flex items-center justify-center">
              <span class="text-2xl text-green-700">✓</span>
            </div>
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
    addAllSiteRoutesLayers,
    fitMapToAllRoutes,
  };
};