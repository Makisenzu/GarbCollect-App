import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { IoRefresh, IoWarning } from "react-icons/io5";
import axios from 'axios';

import { initEcho, getEcho } from '@/echo'; 

const ResidentMap = ({ mapboxKey, barangayId, scheduleId }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [cssLoaded, setCssLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverMarker, setDriverMarker] = useState(null);
  const [siteLocations, setSiteLocations] = useState([]);
  const [siteMarkers, setSiteMarkers] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [mapError, setMapError] = useState(null);
  const [containerReady, setContainerReady] = useState(false);

  useEffect(() => {
    if (mapboxKey) {
      console.log('Setting Mapbox access token');
      mapboxgl.accessToken = mapboxKey;
    }
  }, [mapboxKey]);

  useEffect(() => {
    const checkContainer = () => {
      if (mapContainer.current) {
        console.log('Map container is ready in DOM');
        setContainerReady(true);
      } else {
        console.log('Waiting for map container...');
        setTimeout(checkContainer, 100);
      }
    };

    checkContainer();
  }, []);

  useEffect(() => {
    const existingLink = document.querySelector('link[href*="mapbox-gl.css"]');
    if (existingLink) {
      setCssLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    
    link.onload = () => {
      console.log('Mapbox CSS loaded');
      setCssLoaded(true);
    };
    
    link.onerror = () => {
      console.error('Failed to load Mapbox CSS');
      setCssLoaded(true);
    };
    
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const initializeMap = () => {
      if (!mapContainer.current) return;
      if (map.current) return;
      if (!mapboxKey) {
        setMapError('Mapbox key is missing.');
        return;
      }

      console.log('Starting map initialization...');

      try {
        mapboxgl.accessToken = mapboxKey;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v10',
          center: [125.948498, 8.483022],
          zoom: 10,
          attributionControl: false,
          failIfMajorPerformanceCaveat: false
        });

        const handleMapLoad = () => {
          console.log('Map loaded successfully!');
          setMapInitialized(true);
          setMapError(null);
          
          if (siteLocations.length > 0) {
            updateSiteMarkers(siteLocations);
          }
          
          if (driverLocation) {
            updateDriverMarker(driverLocation, {});
          }
        };

        const handleMapError = (e) => {
          console.error('Map error:', e);
          setMapError(`Map error: ${e.error?.message || 'Unknown error'}`);
          setMapInitialized(true);
        };

        map.current.once('load', handleMapLoad);
        map.current.on('error', handleMapError);

        const timeoutId = setTimeout(() => {
          if (!mapInitialized) {
            console.warn('Map load timeout - continuing anyway');
            setMapInitialized(true);
          }
        }, 8000);

        return () => clearTimeout(timeoutId);

      } catch (error) {
        console.error('Error creating map:', error);
        setMapError(`Failed to create map: ${error.message}`);
        setMapInitialized(true);
      }
    };

    if (cssLoaded && mapboxKey && containerReady) {
      initializeMap();
    }

    return () => {
      if (map.current) {
        console.log('Cleaning up map');
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, [cssLoaded, mapboxKey, containerReady]);

  useEffect(() => {
    if (mapInitialized && map.current && siteLocations.length > 0) {
      updateSiteMarkers(siteLocations);
    }
  }, [mapInitialized, siteLocations]);

  useEffect(() => {
    if (mapInitialized && map.current && driverLocation) {
      updateDriverMarker(driverLocation, {});
    }
  }, [mapInitialized, driverLocation]);

  useEffect(() => {
    if (!barangayId) return;

    const initializeRealtime = async () => {
      try {
        console.log('Initializing Reverb connection...');
        
        initEcho();
        const echo = getEcho();
        
        if (!echo) {
          throw new Error('Echo not initialized');
        }

        echo.channel(`driver-locations.${barangayId}`)
          .listen('DriverLocationUpdated', (e) => {
            console.log('Driver location update received:', e);
            setConnectionStatus('connected');
            updateDriverLocation(e);
          });

        echo.channel(`schedule-updates.${barangayId}`)
          .listen('ScheduleStatusUpdated', (e) => {
            console.log('Schedule update received:', e);
            updateScheduleData(e.schedule);
          });

        setConnectionStatus('connected');
        await loadInitialData();

      } catch (error) {
        console.error('Realtime connection failed:', error);
        setConnectionStatus('disconnected');
        startPolling();
      }
    };

    initializeRealtime();

    return () => {
      const echo = getEcho();
      if (echo) {
        echo.leave(`driver-locations.${barangayId}`);
        echo.leave(`schedule-updates.${barangayId}`);
      }
    };
  }, [barangayId, scheduleId]);

  const startPolling = () => {
    const pollInterval = setInterval(() => {
      loadInitialData();
    }, 10000);

    return () => clearInterval(pollInterval);
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const scheduleResponse = await axios.get(`/barangay/${barangayId}/current-schedule`);
      
      if (scheduleResponse.data.success) {
        const schedule = scheduleResponse.data.data;
        setCurrentSchedule(schedule);
        
        if (schedule.id) {
          const sitesResponse = await axios.get(`/schedule/${schedule.id}/sites`);
          
          if (sitesResponse.data.success) {
            const sites = sitesResponse.data.data;
            setSiteLocations(sites);
          }
        }
        
        if (scheduleId) {
          const locationResponse = await axios.get(`/schedule/${scheduleId}/driver-location`);
          
          if (locationResponse.data.success && locationResponse.data.data) {
            updateDriverLocation(locationResponse.data.data);
          }
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDriverLocation = (locationData) => {
    if (!locationData.longitude || !locationData.latitude) {
      return;
    }
    
    const newLocation = [parseFloat(locationData.longitude), parseFloat(locationData.latitude)];
    setDriverLocation(newLocation);
    
    if (mapInitialized && map.current) {
      updateDriverMarker(newLocation, locationData);
      
      map.current.flyTo({
        center: newLocation,
        zoom: 15,
        duration: 1000
      });
    }
  };

  const updateDriverMarker = (coordinates, locationData) => {
    if (!map.current || !mapInitialized) {
      return;
    }

    if (driverMarker) {
      driverMarker.remove();
    }

    const markerElement = document.createElement('div');
    markerElement.className = 'driver-location-marker';
    markerElement.innerHTML = `
      <div class="relative">
        <div class="w-10 h-10 bg-gray-900 border-3 border-white rounded-full shadow-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
          </svg>
        </div>
        <div class="absolute inset-0 bg-gray-700 rounded-full animate-ping opacity-50"></div>
      </div>
    `;

    try {
      const newMarker = new mapboxgl.Marker({
        element: markerElement,
        draggable: false
      })
      .setLngLat(coordinates)
      .addTo(map.current);

      setDriverMarker(newMarker);
    } catch (error) {
      console.error('Error creating driver marker:', error);
    }
  };

  const updateScheduleData = (scheduleData) => {
    setCurrentSchedule(scheduleData);
  };

  const updateSiteMarkers = (sites) => {
    if (!map.current || !mapInitialized) {
      return;
    }

    siteMarkers.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
    
    const newMarkers = sites.map((site, index) => {
      if (!site.longitude || !site.latitude) {
        return null;
      }

      try {
        const markerElement = document.createElement('div');
        markerElement.className = 'site-marker';
        
        const isCompleted = site.status === 'completed';
        const isCurrent = site.status === 'in_progress';
        const isStation = site.type === 'station';
        const purokName = site.purok_name || site.site_name || 'Site';
        
        const getMarkerColor = () => {
          if (isStation) return '#DC2626';
          if (isCompleted) return '#10B981';
          return '#6B7280';
        };

        const getMarkerIcon = () => {
          if (isStation) return `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />`;
          if (isCompleted) return `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />`;
          return `<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />`;
        };
        
        markerElement.innerHTML = `
          <div class="relative ${isCurrent ? 'animate-pulse' : ''}">
            <div class="w-10 h-10 rounded-full border-3 border-white flex items-center justify-center shadow-lg" style="background-color: ${getMarkerColor()}; ${isCompleted ? 'opacity: 0.7;' : ''}">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${getMarkerIcon()}
              </svg>
            </div>
            ${isCurrent ? `<div class="absolute inset-0 rounded-full border-3 border-yellow-500 animate-ping"></div>` : ''}
          </div>
        `;

        const coordinates = [parseFloat(site.longitude), parseFloat(site.latitude)];

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: 'custom-popup'
        }).setHTML(`
          <div class="text-sm">
            <div class="font-semibold text-gray-900">${purokName}</div>
            <div class="text-xs text-gray-500 mt-1">
              ${isStation ? 'Collection Station' : isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
            </div>
          </div>
        `);

        const marker = new mapboxgl.Marker({
          element: markerElement,
          draggable: false
        })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current);

        return marker;
      } catch (error) {
        console.error('Error creating marker:', error);
        return null;
      }
    }).filter(marker => marker !== null);

    setSiteMarkers(newMarkers);
  };

  const getCompletedSites = () => {
    return siteLocations.filter(site => site.status === 'completed').length;
  };

  if (mapError) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <IoWarning className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-sm text-gray-600 mb-4">{mapError}</p>
          <p className="text-xs text-gray-500">The interface will continue with limited functionality</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Map Container */}
      <div className="relative w-full h-[600px]">
        {!mapInitialized && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-20">
            <div className="text-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Initializing map...</p>
              <p className="text-xs text-gray-500 mt-2">
                {!containerReady ? 'Setting up container...' : 
                 !cssLoaded ? 'Loading styles...' : 
                 !mapboxKey ? 'Waiting for API key...' : 
                 'Loading Mapbox...'}
              </p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainer} 
          className="w-full h-full absolute inset-0"
        />
        
        {mapInitialized && (
          <>
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10 min-w-48">
              <div className="font-semibold text-sm text-gray-900 mb-3">Map Legend</div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0 relative">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
                    </svg>
                    <div className="absolute inset-0 bg-gray-700 rounded-full animate-ping opacity-30"></div>
                  </div>
                  <span className="text-sm text-gray-700">Driver Location</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Collection Station</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Pending Collection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">Completed</span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            {/* <button
              onClick={loadInitialData}
              className="absolute top-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors z-10"
              title="Refresh data"
            >
              <IoRefresh className="w-5 h-5 text-gray-700" />
            </button> */}

            {/* Connection Status */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2 z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-500' : 
                  connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                } ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
                <span className="text-xs font-medium text-gray-700 capitalize">
                  {connectionStatus}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResidentMap;