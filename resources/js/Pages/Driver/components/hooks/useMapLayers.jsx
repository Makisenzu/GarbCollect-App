import { useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl'; // ADD THIS IMPORT
import { GiControlTower } from "react-icons/gi";
import can from "@/images/can.png";

const BARANGAY_COLORS = {
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

export const useMapLayers = (map, isMobile) => {
  const siteMarkersRef = useRef([]);
  const currentLocationMarkerRef = useRef(null);
  const userLocationSourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  const clearSiteMarkers = useCallback(() => {
    siteMarkersRef.current.forEach(marker => {
      if (marker._root) {
        setTimeout(() => marker._root.unmount(), 0);
      }
      marker.remove();
    });
    siteMarkersRef.current = [];
  }, []);

  const clearUserLocationLayers = useCallback(() => {
    if (!map.current) return;

    ['driver-location-layer', 'driver-location-pulse'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    if (map.current.getSource('driver-location')) {
      map.current.removeSource('driver-location');
    }

    userLocationSourceRef.current = null;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [map]);

  const clearRouteLayers = useCallback(() => {
    if (!map.current) return;

    ['route', 'route-glow', 'route-direction', 'route-recalculated'].forEach(layerId => {
      if (map.current.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
    });

    if (map.current.getSource('route')) {
      map.current.removeSource('route');
    }
  }, [map]);

  const createImageMarker = useCallback((siteData, sequence, activeSchedule, completedSites, currentSiteIndex, optimizedSiteOrder) => {
    const barangayName = siteData?.purok?.baranggay?.baranggay_name;
    const borderColor = BARANGAY_COLORS[barangayName] || BARANGAY_COLORS['_default'];
    
    const isNearestToStation = false;
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
  }, [isMobile]);

  const createStationIcon = useCallback((sequence, isMobile) => {
    const el = document.createElement('div');
    el.className = 'custom-marker relative';
    
    let sequenceBadge = '';
    const badgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
    sequenceBadge = `
      <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white">
        🏠
      </div>
    `;

    el.innerHTML = sequenceBadge;
    const root = createRoot(el);
    root.render(<GiControlTower size={isMobile ? 36 : 30} color={'#4F262A'} />);
    return { element: el, root };
  }, []);

  const addMarker = useCallback((coordinates, type = 'manual', title = '', siteData = null, sequence = 0, activeSchedule, completedSites, currentSiteIndex, optimizedSiteOrder) => {
    if (!map.current) return null;

    let markerElement;
    let root = null;
    
    if (type === 'manual') {
      markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
    } else if (siteData?.type === 'station') {
      const stationIcon = createStationIcon(sequence, isMobile);
      markerElement = stationIcon.element;
      root = stationIcon.root;
    } else {
      markerElement = createImageMarker(siteData, sequence, activeSchedule, completedSites, currentSiteIndex, optimizedSiteOrder);
    }

    const marker = new mapboxgl.Marker({ // FIXED: mapboxgl is now imported
      element: markerElement,
      draggable: false
    })
    .setLngLat(coordinates)
    .addTo(map.current);

    if (root) {
      marker._root = root;
    }

    return marker;
  }, [map, isMobile, createImageMarker, createStationIcon]);

  const addSiteMarkers = useCallback((siteLocations, stationLocation, optimizedSiteOrder, activeSchedule, completedSites, currentSiteIndex) => {
    if (!map.current) return;

    clearSiteMarkers();

    if (stationLocation) {
      const stationMarker = addMarker(
        [parseFloat(stationLocation.longitude), parseFloat(stationLocation.latitude)],
        'station',
        stationLocation.site_name,
        stationLocation,
        0,
        activeSchedule,
        completedSites,
        currentSiteIndex,
        optimizedSiteOrder
      );
      if (stationMarker) siteMarkersRef.current.push(stationMarker);
    }
    
    const sitesToDisplay = optimizedSiteOrder.length > 0 ? optimizedSiteOrder : siteLocations;
    
    sitesToDisplay.forEach((site, index) => {
      if (site.longitude && site.latitude) {
        const marker = addMarker(
          [parseFloat(site.longitude), parseFloat(site.latitude)],
          'site',
          site.site_name,
          site,
          index + 1,
          activeSchedule,
          completedSites,
          currentSiteIndex,
          optimizedSiteOrder
        );
        if (marker) siteMarkersRef.current.push(marker);
      }
    });
  }, [map, clearSiteMarkers, addMarker]);

  const updateCurrentLocationMarker = useCallback((coordinates) => {
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

    currentLocationMarkerRef.current = new mapboxgl.Marker({ // FIXED: mapboxgl is now imported
      element: markerElement,
      draggable: false
    })
    .setLngLat(coordinates)
    .addTo(map.current);
  }, [map, isMobile]);

  const updateUserLocationSource = useCallback((lng, lat) => {
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

    if (!map.current.getSource('driver-location')) {
      map.current.addSource('driver-location', {
        type: 'geojson',
        data: geojson
      });

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
    } else {
      const source = map.current.getSource('driver-location');
      if (source) {
        source.setData(geojson);
      }
    }
  }, [map]);

  const animatePulse = useCallback(() => {
    if (!map.current || !map.current.getLayer('driver-location-pulse')) return;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const startTime = Date.now();
    const duration = 2000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;

      const pulseRadius = 8 + (progress * 17);
      map.current.setPaintProperty('driver-location-pulse', 'circle-radius', pulseRadius);
      map.current.setPaintProperty('driver-location-pulse', 'circle-opacity', 0.4 * (1 - progress));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [map]);

  const addRouteLayer = useCallback((routeCoordinates, routeInfo, activeSchedule, isMobile) => {
    if (!map.current || routeCoordinates.length === 0) return;

    if (!map.current.isStyleLoaded()) {
      map.current.once('styledata', () => {
        setTimeout(() => addRouteLayer(routeCoordinates, routeInfo, activeSchedule, isMobile), 100);
      });
      return;
    }

    clearRouteLayers();

    try {
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
      const routeColor = BARANGAY_COLORS[barangayName] || BARANGAY_COLORS['_default'];
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

    } catch (error) {
      console.error('Error adding route layer:', error);
    }
  }, [map, clearRouteLayers]);

  const fitMapToRouteAndDriver = useCallback((routeCoordinates, currentLocation, optimizedSiteOrder, currentSiteIndex, isMobile) => {
    if (!map.current || routeCoordinates.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds(); // FIXED: mapboxgl is now imported
    
    routeCoordinates.forEach(coord => {
      bounds.extend(coord);
    });
    
    if (currentLocation) {
      bounds.extend(currentLocation);
    }
    
    if (optimizedSiteOrder[currentSiteIndex]) {
      const nextSite = optimizedSiteOrder[currentSiteIndex];
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
  }, [map]);

  return {
    siteMarkersRef,
    currentLocationMarkerRef,
    clearSiteMarkers,
    clearUserLocationLayers,
    clearRouteLayers,
    addSiteMarkers,
    updateCurrentLocationMarker,
    updateUserLocationSource,
    animatePulse,
    addRouteLayer,
    fitMapToRouteAndDriver
  };
};