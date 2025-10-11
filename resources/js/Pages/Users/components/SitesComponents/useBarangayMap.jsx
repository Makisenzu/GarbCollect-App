import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Select from 'react-select';
import axios from 'axios';
import can from "@/images/can.png";

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

  // Route-related states from useTaskMap
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);
  const [nearestSite, setNearestSite] = useState(null);
  const [stationLocation, setStationLocation] = useState(null);

  const [barangays, setBarangays] = useState([]);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  const options = barangays.map(barangay => ({
    value: barangay.id,
    label: barangay.baranggay_name
  }));

  // Route calculation functions from useTaskMap
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

  const calculateOptimalRoute = async (sites, barangayId, station) => {
    if (!mapboxToken || sites.length < 1) return;

    try {
      const optimizedSites = station 
        ? optimizeSiteOrderFromStation(station, sites)
        : sites;

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
        `access_token=${mapboxToken}` +
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

    // Remove existing route layers
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

      const barangayName = selectedBarangay ? 
        barangays.find(b => b.id === selectedBarangay)?.baranggay_name || 'San Francisco' : 
        'San Francisco';
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
    if (!map.current || routeCoordinates.length === 0 || activeSites.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    
    if (stationLocation) {
      bounds.extend([parseFloat(stationLocation.longitude), parseFloat(stationLocation.latitude)]);
    }
    
    activeSites.forEach(site => {
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

    // Find station and separate it from regular sites
    const station = sites.find(site => site.type === 'station');
    const regularSites = sites.filter(site => site.type !== 'station');
    
    // Optimize site order for sequencing
    const optimizedSites = station ? optimizeSiteOrderFromStation(station, regularSites) : regularSites;
    setOptimizedSiteOrder(optimizedSites);

    // Add station marker first (sequence 0)
    if (station && station.latitude && station.longitude) {
      const stationEl = document.createElement('div');
      stationEl.className = 'custom-marker animate-pulse';
      const stationBadgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
      stationEl.innerHTML = `
        <div class="hover:scale-110 transition-transform duration-200 cursor-pointer relative">
          <div class="bg-white rounded-full p-2 shadow-lg border-2 border-red-500">
            <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-bold">🏠</span>
            </div>
          </div>
          <div class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full ${stationBadgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white">
            0
          </div>
        </div>
      `;

      const stationMarker = new mapboxgl.Marker({
        element: stationEl,
        anchor: 'bottom'
      })
        .setLngLat([parseFloat(station.longitude), parseFloat(station.latitude)])
        .addTo(map.current);

      markersRef.current.push(stationMarker);

      stationEl.addEventListener('click', () => {
        stationMarker.togglePopup();
      });
    }

    // Add regular site markers with sequence numbers
    optimizedSites.forEach((site, index) => {
      if (site.latitude && site.longitude) {
        const sequenceNumber = index + 1;
        const isNearest = nearestSite && nearestSite.id === site.id;
        const barangayName = site.purok?.baranggay?.baranggay_name;
        const borderColor = barangayColors[barangayName] || barangayColors['_default'];
        
        const badgeSize = isMobile ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
        const markerSize = isMobile ? 'w-12 h-12' : 'w-10 h-10';
        const imageSize = isMobile ? 'w-10 h-10' : 'w-8 h-8';

        const el = document.createElement('div');
        el.className = 'custom-marker animate-pulse';
        el.innerHTML = `
          <div class="hover:scale-110 transition-transform duration-200 cursor-pointer relative">
            <div class="${markerSize} rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white relative ${
              isNearest ? 'ring-4 ring-green-500 ring-opacity-70' : ''
            }" style="border-color: ${borderColor};">
              ${isNearest ? `
                <div class="absolute -inset-3 rounded-full border-4 border-green-500 border-opacity-70 animate-pulse pointer-events-none z-10"></div>
              ` : ''}
              <img src="${can}" 
                   alt="${site.site_name}" 
                   class="${imageSize} object-cover rounded-full z-0"
                   onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'${imageSize} rounded-full flex items-center justify-center text-white text-xs font-bold bg-white\\' style=\\'border: 2px solid ${borderColor}; color: ${borderColor}\\'>${site.site_name?.charAt(0) || 'S'}</div>'">
            </div>
            <div class="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full ${badgeSize} flex items-center justify-center font-bold shadow-lg border-2 border-white">
              ${sequenceNumber}
            </div>
          </div>
        `;

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom'
        })
          .setLngLat([parseFloat(site.longitude), parseFloat(site.latitude)])
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
      setRouteCoordinates([]);
      setRouteInfo(null);
      return;
    }

    setLoadingSites(true);
    try {
      const response = await axios.get(`/barangay/getSites/${barangayId}`);
      if (response.data.success) {
        const sites = response.data.data || [];
        setActiveSites(sites);
        console.log('Active sites:', sites);
        
        // Find station if exists
        const station = sites.find(site => site.type === 'station');
        if (station) {
          setStationLocation(station);
        }
        
        // Add markers to map
        addMarkersToMap(sites);
        
        // Calculate optimal route
        if (sites.length >= 1) {
          await calculateOptimalRoute(sites, barangayId, station);
        }
      } else {
        console.error('Failed to fetch sites:', response.data.message);
        setActiveSites([]);
        clearMarkers();
        setRouteCoordinates([]);
        setRouteInfo(null);
      }
    } catch (error) {
      console.error('Error fetching active sites:', error);
      setActiveSites([]);
      clearMarkers();
      setRouteCoordinates([]);
      setRouteInfo(null);
    } finally {
      setLoadingSites(false);
    }
  };

  // Add route layer when route coordinates change
  useEffect(() => {
    if (map.current && routeCoordinates.length > 0) {
      addRouteLayer();
    }
  }, [routeCoordinates]);

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
      setRouteCoordinates([]);
      setRouteInfo(null);
    }
  };

  // Render sites info panel
  const renderSitesInfo = () => {
    if (!selectedBarangay) return null;

    return (
      <div className={`
        absolute z-40 bg-white rounded-lg shadow-xl border border-gray-200
        max-h-64 overflow-y-auto
        ${isMobile ? 
          'bottom-4 left-4 right-4' : 
          'top-20 right-4 w-80'
        }
      `}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              Active Sites {activeSites.length > 0 && `(${activeSites.length})`}
            </h3>
            {loadingSites && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          
          {/* Route Information */}
          {routeInfo && (
            <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
              <div className="text-xs text-blue-800">
                <div><strong>Route:</strong> {routeInfo.formattedDuration} • {routeInfo.distance} km</div>
                {nearestSite && (
                  <div><strong>Nearest:</strong> {nearestSite.site_name}</div>
                )}
              </div>
            </div>
          )}
          
          {loadingSites ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading sites...</p>
            </div>
          ) : activeSites.length > 0 ? (
            <div className="space-y-2">
              {activeSites.map((site) => (
                <div 
                  key={site.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (site.latitude && site.longitude) {
                      map.current.flyTo({
                        center: [parseFloat(site.longitude), parseFloat(site.latitude)],
                        zoom: 15,
                        essential: true
                      });
                      
                      const marker = markersRef.current.find(m => 
                        m.getLngLat().lng === parseFloat(site.longitude) && 
                        m.getLngLat().lat === parseFloat(site.latitude)
                      );
                      if (marker) {
                        marker.togglePopup();
                      }
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {site.site_name}
                      </h4>
                      <div className="text-xs text-gray-600 mt-1">
                        Barangay: {site.purok?.baranggay?.baranggay_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Purok: {site.purok?.purok_name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600">
                        Type: <span className="capitalize">{site.type}</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  {site.latitude && site.longitude && (
                    <div className="text-xs text-gray-500 mt-2">
                      📍 {site.latitude}, {site.longitude}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-gray-400 text-4xl mb-2">🏢</div>
              <p className="text-gray-500 text-sm">No active sites found</p>
              <p className="text-gray-400 text-xs mt-1">for this barangay</p>
            </div>
          )}
        </div>
      </div>
    );
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
    renderSitesInfo,
    fetchActiveSites,
    // Route-related exports
    routeCoordinates,
    routeInfo,
    optimizedSiteOrder,
    nearestSite,
    stationLocation,
    formatDuration
  };
};

export default useBarangayMap;