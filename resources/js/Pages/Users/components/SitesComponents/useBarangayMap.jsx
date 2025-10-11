import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Select from 'react-select';
import axios from 'axios';

//barangay colors
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

//file hook
const useBarangayMap = (mapboxToken) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState('');
  const [activeSites, setActiveSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const markersRef = useRef([]);

  const [barangays, setBarangays] = useState([]);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const options = barangays.map(barangay => ({
    value: barangay.id,
    label: barangay.baranggay_name
  }));

  //mobile responsiveness
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
  
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  //fetch barangays
  useEffect(() => {
    const fetchBarangays = async () => {
      setLoadingBarangays(true);
      try {
          const response = await axios.get(`/getBarangay`);
          setBarangays(response.data.barangay_data || []);
      } catch (error) {
          console.error('Error fetching barangays:', error);
      } finally {
          setLoadingBarangays(false);
      }
    };
    fetchBarangays();
  }, []);

  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  const addMarkersToMap = (sites) => {
    if (!map.current || !sites.length) return;

    clearMarkers();

    sites.forEach((site) => {
      if (site.latitude && site.longitude) {
        const el = document.createElement('div');
        el.className = 'animate-pulse';
        el.innerHTML = `
          <div class="bg-blue-500 text-white p-2 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform duration-200 cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `;

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([parseFloat(site.longitude), parseFloat(site.latitude)])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-3 max-w-xs">
                  <h3 class="font-bold text-lg text-gray-800">${site.site_name}</h3>
                  <div class="mt-2 space-y-1 text-sm">
                    <p class="text-gray-600"><strong>Barangay:</strong> ${site.purok?.baranggay?.baranggay_name || 'N/A'}</p>
                    <p class="text-gray-600"><strong>Purok:</strong> ${site.purok?.purok_name || 'N/A'}</p>
                    <p class="text-gray-600"><strong>Type:</strong> ${site.type || 'N/A'}</p>
                    <p class="text-gray-600"><strong>Status:</strong> 
                      <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-1">
                        ${site.status || 'Active'}
                      </span>
                    </p>
                    ${site.additional_notes ? `
                      <p class="text-gray-600"><strong>Notes:</strong> ${site.additional_notes}</p>
                    ` : ''}
                    <p class="text-gray-600"><strong>Coordinates:</strong> ${site.latitude}, ${site.longitude}</p>
                  </div>
                </div>
              `)
          )
          .addTo(map.current);

        markersRef.current.push(marker);

        el.addEventListener('click', () => {
          marker.togglePopup();
        });
      }
    });

    // Fit map bounds to show all markers
    if (sites.length > 0 && sites.some(site => site.latitude && site.longitude)) {
      const bounds = new mapboxgl.LngLatBounds();
      
      sites.forEach(site => {
        if (site.latitude && site.longitude) {
          bounds.extend([parseFloat(site.longitude), parseFloat(site.latitude)]);
        }
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: 1000
      });
    }
  };

  // Function to fetch active sites for selected barangay
  const fetchActiveSites = async (barangayId) => {
    if (!barangayId) {
      setActiveSites([]);
      clearMarkers();
      return;
    }

    setLoadingSites(true);
    try {
      const response = await axios.get(`/barangay/getSites/${barangayId}`);
      if (response.data.success) {
        const sites = response.data.data || [];
        setActiveSites(sites);
        console.log('Active sites:', sites);
        addMarkersToMap(sites);
      } else {
        console.error('Failed to fetch sites:', response.data.message);
        setActiveSites([]);
        clearMarkers();
      }
    } catch (error) {
      console.error('Error fetching active sites:', error);
      setActiveSites([]);
      clearMarkers();
    } finally {
      setLoadingSites(false);
    }
  };

  //mapbox 
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
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);


  //selecting barangay
  const handleBarangaySelect = async (selectedOption) => {
    const selectedValue = selectedOption?.value || '';
    const selectedBarangayName = selectedOption?.label || 'None';
    
    console.log('Selected Barangay ID:', selectedValue);
    console.log('Selected Barangay Name:', selectedBarangayName);
    
    setSelectedBarangay(selectedValue);
    
    if (selectedValue) {
      await fetchActiveSites(selectedValue);
    } else {
      setActiveSites([]);
      clearMarkers();
    }
  };


  //display select modal
  const renderBarangaySelect = (data, setData) => (
    <Select
      id="barangay_id"
      name="barangay_id"
      value={options.find(option => option.value === data.barangay_id) || null}
      onChange={(selectedOption) => {
        const selectedValue = selectedOption?.value || '';
        handleBarangaySelect(selectedOption);
        setData('barangay_id', selectedValue);
      }}
      options={options}
      placeholder={loadingBarangays ? "Loading barangays..." : "Select Barangay"}
      isDisabled={loadingBarangays}
      required
      maxMenuHeight={150}
      className="text-sm"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: '#d1d5db',
          minHeight: '42px',
          fontSize: '14px',
          '&:hover': { borderColor: '#d1d5db' },
          '&:focus': { borderColor: '#6366f1', boxShadow: '0 0 0 1px #6366f1' }
        })
      }}
    />
  );


  return {
    mapContainer,
    map,
    mapLoaded,
    loading,
    error,
    barangays,
    loadingBarangays,
    activeSites,
    loadingSites,
    selectedBarangay,
    options,
    renderBarangaySelect,
    fetchActiveSites
  };
};

export default useBarangayMap;