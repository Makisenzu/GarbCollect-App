import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export const useMapboxSetup = (mapboxKey, mapContainer, isMobile) => {
  const map = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [customStyleLoaded, setCustomStyleLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    const loadMapboxCSS = () => {
      return new Promise((resolve) => {
        if (document.querySelector('link[href*="mapbox-gl.css"]')) {
          resolve();
          return;
        }

        const link = document.createElement('link');
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
        link.rel = 'stylesheet';
        link.onload = resolve;
        link.onerror = resolve; // Continue even if CSS fails
        document.head.appendChild(link);
      });
    };

    const initializeMap = async () => {
      if (!mapboxKey || map.current || !mapContainer.current) return;

      await loadMapboxCSS();

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

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        map.current.on('load', () => {
          setMapInitialized(true);
          setCustomStyleLoaded(true);
        });

        map.current.on('error', (e) => {
          console.error('Map error:', e);
          setMapError('Failed to load map: ' + e.error?.message);
        });

      } catch (error) {
        console.error('Error creating map:', error);
        setMapError('Failed to initialize map: ' + error.message);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
        setCustomStyleLoaded(false);
      }
    };
  }, [mapboxKey, mapContainer, isMobile]);

  return { 
    map, 
    mapInitialized, 
    customStyleLoaded, 
    mapError,
    setMapInitialized,
    setCustomStyleLoaded 
  };
};