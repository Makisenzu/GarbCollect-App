import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapboxSetup = ({ mapboxKey, isMobile }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const [cssLoaded, setCssLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [customStyleLoaded, setCustomStyleLoaded] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);

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

  const initializeMap = (onMapLoad) => {
    if (!cssLoaded || !mapboxKey || map.current || !mapContainer.current) {
      return;
    }

    try {
      mapboxgl.accessToken = mapboxKey;
      
      const isOnline = navigator.onLine;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7',
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
        preserveDrawingBuffer: true,
        // Offline mode optimizations
        maxTileCacheSize: 50,
        refreshExpiredTiles: isOnline,
        transformRequest: (url, resourceType) => {
          // In offline mode, allow loading from cache
          if (!isOnline && resourceType === 'Tile') {
            return {
              url: url,
              headers: { 'Cache-Control': 'max-age=86400' }
            };
          }
          return { url };
        }
      });

      map.current.on('load', () => {
        setMapInitialized(true);
        setCustomStyleLoaded(true);
        console.log('Map loaded and initialized');
        
        if (onMapLoad) {
          onMapLoad();
        }
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        
        // If offline, suppress the error and continue
        if (!navigator.onLine) {
          console.warn('Map error suppressed - continuing in offline mode');
          setOfflineMode(true);
          setMapError(null);
          // Still mark as initialized so UI can continue
          if (!mapInitialized) {
            setMapInitialized(true);
            setCustomStyleLoaded(true);
          }
          return;
        }
        
        // Only show error if we're online and it's a real problem
        setMapError('Failed to load map: ' + e.error?.message);
      });
      
      // Suppress Mapbox tile errors in offline mode
      map.current.on('dataloading', (e) => {
        if (!navigator.onLine) {
          e.preventDefault?.();
        }
      });
      
      map.current.on('sourcedataloading', (e) => {
        if (!navigator.onLine) {
          e.preventDefault?.();
        }
      });

      map.current.on('idle', () => {
        // Map is ready and tiles are loaded
      });

    } catch (error) {
      console.error('Error creating map:', error);
      
      // If offline, suppress the error
      if (!navigator.onLine) {
        console.warn('Map initialization error suppressed - offline mode');
        setOfflineMode(true);
        setMapError(null);
        setMapInitialized(true);
      } else {
        setMapError('Failed to initialize map: ' + error.message);
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
        setCustomStyleLoaded(false);
      }
    };
  };

  return {
    // Refs
    mapContainer,
    map,
    
    // State
    cssLoaded,
    mapInitialized,
    mapError,
    customStyleLoaded,
    offlineMode,
    
    // Setters
    setMapInitialized,
    setCustomStyleLoaded,
    setMapError,
    setOfflineMode,
    
    // Methods
    initializeMap,
  };
};