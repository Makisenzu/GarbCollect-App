import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapboxSetup = ({ mapboxKey, isMobile }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const [cssLoaded, setCssLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [customStyleLoaded, setCustomStyleLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

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
        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: true
      });

      map.current.on('load', () => {
        setMapInitialized(true);
        setCustomStyleLoaded(true);
        console.log('Map loaded and initialized');
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map: ' + e.error?.message);
      });

      map.current.on('idle', () => {
        // Map is ready and tiles are loaded
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

  return {
    mapContainer,
    map,
    cssLoaded,
    mapInitialized,
    customStyleLoaded,
    mapError
  };
};