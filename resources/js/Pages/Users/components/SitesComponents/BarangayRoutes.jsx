import { useRef, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const BarangayRoutes = ({ mapboxToken }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Map Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head title={'San Francisco Map'} />

      <div className="w-full h-screen relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <Link
            href="/"
            className="absolute top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border border-gray-200"
            title="Back to Dashboard"
            >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        </Link>

        <div 
          ref={mapContainer} 
          className="w-full h-full"
        />
      </div>
    </>
  );
};

export default BarangayRoutes;