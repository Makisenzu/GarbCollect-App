import { useRef, useEffect, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';

const BarangayRoutes = ({ mapboxToken }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [error, setError] = useState(null);
  const [barangays, setBarangays] = useState([]);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showBarangayModal, setShowBarangayModal] = useState(false);
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [showMagnifyingDropdown, setShowMagnifyingDropdown] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const handleBarangayChange = (barangayId) => {
    setSelectedBarangay(barangayId);
    if (isMobile) {
      setShowBarangayModal(false);
    }
    if (!isMobile) {
      setShowMagnifyingDropdown(false);
    }
    console.log('Selected barangay:', barangayId);
  };

  const toggleMagnifyingGlass = () => {
    setIsMagnifying(!isMagnifying);
    setShowMagnifyingDropdown(false);
    
    if (map.current) {
      if (!isMagnifying) {
        map.current.scrollZoom.enable();
        map.current.dragPan.enable();
        console.log('Magnifying glass enabled');
      } else {
        console.log('Magnifying glass disabled');
      }
    }
  };

  const handleMagnifyingButtonClick = () => {
    if (!isMobile) {
      setShowMagnifyingDropdown(!showMagnifyingDropdown);
    } else {
      toggleMagnifyingGlass();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMagnifyingDropdown && !event.target.closest('.magnifying-dropdown')) {
        setShowMagnifyingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMagnifyingDropdown]);

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
          className={`absolute top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-800 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-200 hover:shadow-xl border border-gray-200 ${
            isMobile ? 'text-sm px-3 py-2' : ''
          }`}
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10 19l-7-7m0 0l7-7m-7 7h18" 
            />
          </svg>
          <span className={`font-medium ${isMobile ? 'hidden sm:inline' : ''}`}>
          </span>
        </Link>


        {isMobile && (
          <>
            {selectedBarangay && (
              <div className="absolute top-20 left-4 z-40 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
                <p className="text-sm font-medium">
                  {barangays.find(b => b.id == selectedBarangay)?.baranggay_name}
                </p>
              </div>
            )}
          </>
        )}

        {!isMobile && (
            <div className="absolute top-36 right-2 z-30 flex flex-col space-y-2 magnifying-dropdown">
<button
  onClick={handleMagnifyingButtonClick}
  className={`bg-white hover:bg-gray-50 text-gray-800 p-2 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl border ${
    isMagnifying ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
  }`}
  title="Select Barangay"
>
  <svg 
    className="w-4 h-4" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
    />
    {isMagnifying && (
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
        className="text-red-500"
      />
    )}
  </svg>
</button>

            {showMagnifyingDropdown && (
              <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 min-w-64 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Select Barangay</h3>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Choose Barangay
                  </label>
                  <select
                    value={selectedBarangay}
                    onChange={(e) => handleBarangayChange(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    disabled={barangayLoading}
                  >
                    <option value="">Select a barangay</option>
                    {barangays.map(barangay => (
                      <option key={barangay.id} value={barangay.id}>
                        {barangay.baranggay_name}
                      </option>
                    ))}
                  </select>
                  {barangayLoading && (
                    <p className="text-xs text-gray-500 mt-1">Loading barangays...</p>
                  )}
                </div>

                {selectedBarangay && (
                  <div className="p-2 bg-blue-50 rounded mb-2">
                    <p className="text-xs text-blue-700">
                      Selected: {barangays.find(b => b.id == selectedBarangay)?.baranggay_name}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowMagnifyingDropdown(false)}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            )}

            {isMagnifying && !showMagnifyingDropdown && (
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded text-center">
                Magnifying Active
              </div>
            )}
          </div>
        )}

        {isMobile && (
          <button
            onClick={() => setShowBarangayModal(true)}
            className={`absolute bottom-4 right-4 z-40 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl border ${
              isMagnifying ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            title={isMagnifying ? 'Disable Magnifying Glass' : 'Enable Magnifying Glass'}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
              {isMagnifying && (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                  className="text-red-500"
                />
              )}
            </svg>
          </button>
        )}

        {isMobile && showBarangayModal && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setShowBarangayModal(false)}
            />
            
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Select Barangay</h3>
                  <button
                    onClick={() => setShowBarangayModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Barangay
                  </label>
                  <select
                    value={selectedBarangay}
                    onChange={(e) => handleBarangayChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                    disabled={barangayLoading}
                  >
                    <option value="">Select a barangay</option>
                    {barangays.map(barangay => (
                      <option key={barangay.id} value={barangay.id}>
                        {barangay.baranggay_name}
                      </option>
                    ))}
                  </select>
                  {barangayLoading && (
                    <p className="text-sm text-gray-500 mt-2">Loading barangays...</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => setShowBarangayModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowBarangayModal(false)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        <div 
          ref={mapContainer} 
          className="w-full h-full"
        />
      </div>
    </>
  );
};

export default BarangayRoutes;