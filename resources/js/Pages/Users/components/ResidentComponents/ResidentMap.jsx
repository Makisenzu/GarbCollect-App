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
      console.log('🔑 Setting Mapbox access token');
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

  // Map initialization
  useEffect(() => {
    const initializeMap = () => {
      console.log('🔍 Map initialization prerequisites:', {
        cssLoaded,
        mapboxKey: !!mapboxKey,
        containerReady,
        mapContainer: !!mapContainer.current,
        mapCurrent: !!map.current
      });

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
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [125.948498, 8.483022],
          zoom: 10,
          attributionControl: false,
          failIfMajorPerformanceCaveat: false
        });

        console.log('🗺️ Map instance created');

        const handleMapLoad = () => {
          console.log('Map loaded successfully!');
          setMapInitialized(true);
          setMapError(null);
          
          // Update markers when map loads if we already have data
          if (siteLocations.length > 0) {
            console.log('Updating site markers after map load');
            updateSiteMarkers(siteLocations);
          }
          
          if (driverLocation) {
            console.log('Updating driver marker after map load');
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
      console.log('Rendering site markers:', siteLocations.length);
      updateSiteMarkers(siteLocations);
    }
  }, [mapInitialized, siteLocations]);

  useEffect(() => {
    if (mapInitialized && map.current && driverLocation) {
      console.log('Rendering driver marker');
      updateDriverMarker(driverLocation, {});
    }
  }, [mapInitialized, driverLocation]);

  useEffect(() => {
    console.log('Current state:', {
      cssLoaded,
      mapboxKey: !!mapboxKey,
      containerReady,
      mapInitialized,
      mapContainer: !!mapContainer.current,
      mapCurrent: !!map.current,
      mapError,
      siteLocationsCount: siteLocations.length,
      driverLocation: !!driverLocation
    });
  }, [cssLoaded, mapboxKey, containerReady, mapInitialized, mapError, siteLocations, driverLocation]);

  // Initialize Reverb connection
  useEffect(() => {
    if (!barangayId) return;

    const initializeRealtime = async () => {
      try {
        console.log('🔌 Initializing Reverb connection...');
        
        initEcho();
        const echo = getEcho();
        
        if (!echo) {
          throw new Error('Echo not initialized');
        }

        console.log('Setting up Reverb listeners for barangay:', barangayId);

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
        console.log('Reverb listeners set up successfully');
        
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
      console.log('Loading initial data...');
      
      // Load schedule data
      const scheduleResponse = await axios.get(`/barangay/${barangayId}/current-schedule`);
      console.log('Schedule response:', scheduleResponse.data);
      
      if (scheduleResponse.data.success) {
        const schedule = scheduleResponse.data.data;
        setCurrentSchedule(schedule);
        
        // Load sites for this schedule
        if (schedule.id) {
          const sitesResponse = await axios.get(`/schedule/${schedule.id}/sites`);
          console.log('Sites response:', sitesResponse.data);
          
          if (sitesResponse.data.success) {
            const sites = sitesResponse.data.data;
            console.log('Setting site locations:', sites.length);
            setSiteLocations(sites);
          }
        }
        
        // Load current driver location if available
        if (scheduleId) {
          const locationResponse = await axios.get(`/schedule/${scheduleId}/driver-location`);
          console.log('Driver location response:', locationResponse.data);
          
          if (locationResponse.data.success && locationResponse.data.data) {
            console.log('Setting driver location from API');
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
      console.log('Invalid driver location data:', locationData);
      return;
    }
    
    const newLocation = [parseFloat(locationData.longitude), parseFloat(locationData.latitude)];
    console.log('Updating driver location to:', newLocation);
    setDriverLocation(newLocation);
    
    if (mapInitialized && map.current) {
      console.log('Immediately updating driver marker');
      updateDriverMarker(newLocation, locationData);
      
      // Auto-center on driver
      map.current.flyTo({
        center: newLocation,
        zoom: 15,
        duration: 1000
      });
    }
  };

  const updateDriverMarker = (coordinates, locationData) => {
    if (!map.current || !mapInitialized) {
      console.log('Skipping driver marker update - map not ready');
      return;
    }

    console.log('Creating driver marker at:', coordinates);

    // Remove existing marker
    if (driverMarker) {
      console.log('🗑️ Removing existing driver marker');
      driverMarker.remove();
    }

    const markerElement = document.createElement('div');
    markerElement.className = 'driver-location-marker';
    markerElement.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 md:w-10 md:h-10 bg-blue-600 border-2 md:border-3 border-white rounded-full shadow-lg z-50 flex items-center justify-center">
          <svg class="w-3 h-3 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg border border-blue-300">
          <div class="font-semibold text-xs">Driver</div>
        </div>
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
      console.log('Driver marker created successfully');
    } catch (error) {
      console.error('Error creating driver marker:', error);
    }
  };

  const updateScheduleData = (scheduleData) => {
    console.log('📅 Updating schedule data:', scheduleData);
    setCurrentSchedule(scheduleData);
  };

  const updateSiteMarkers = (sites) => {
    if (!map.current || !mapInitialized) {
      console.log('⏳ Skipping site markers update - map not ready');
      return;
    }

    console.log('🗺️ Updating site markers for', sites.length, 'sites');

    // Clear existing markers
    siteMarkers.forEach(marker => {
      if (marker && marker.remove) {
        marker.remove();
      }
    });
    
    const newMarkers = sites.map((site, index) => {
      if (!site.longitude || !site.latitude) {
        console.log('Skipping site with missing coordinates:', site.purok_name || site.site_name);
        return null;
      }

      try {
        const markerElement = document.createElement('div');
        markerElement.className = 'site-marker';
        
        const isCompleted = site.status === 'completed';
        const isCurrent = site.status === 'in_progress';
        const isStation = site.type === 'station';
        const purokName = site.purok_name || 'Purok';
        
        markerElement.innerHTML = `
          <div class="relative">
            <div class="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 md:border-4 flex items-center justify-center overflow-hidden shadow-lg bg-white ${
              isCurrent ? 'ring-2 md:ring-4 ring-yellow-500 ring-opacity-70 animate-pulse' : ''
            } ${isCompleted ? 'opacity-60 grayscale' : ''}" 
                 style="border-color: ${isStation ? '#EF4444' : isCompleted ? '#10B981' : '#6B7280'};">
              <div class="w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center ${
                isStation ? 'bg-red-50' : isCompleted ? 'bg-green-50' : 'bg-gray-50'
              }">
                <span class="text-xs md:text-sm font-bold ${
                  isStation ? 'text-red-600' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-600'
                }">
                  ${isStation ? '🏠' : isCompleted ? '✓' : '🗑️'}
                </span>
              </div>
            </div>
            <div class="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-24 md:max-w-32 truncate shadow-lg">
              ${purokName}${isCompleted ? ' • Done' : isCurrent ? ' • Now' : isStation ? ' • Station' : ''}
            </div>
          </div>
        `;

        const coordinates = [parseFloat(site.longitude), parseFloat(site.latitude)];
        console.log(`Creating marker ${index + 1} for ${purokName} at:`, coordinates);

        const marker = new mapboxgl.Marker({
          element: markerElement,
          draggable: false
        })
        .setLngLat(coordinates)
        .addTo(map.current);

        return marker;
      } catch (error) {
        console.error('Error creating marker for purok:', site.purok_name, error);
        return null;
      }
    }).filter(marker => marker !== null);

    setSiteMarkers(newMarkers);
    console.log('Site markers updated successfully:', newMarkers.length, 'markers created');
  };

  const getCompletedSites = () => {
    return siteLocations.filter(site => site.status === 'completed').length;
  };

  if (mapError) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <IoWarning className="w-12 h-12 md:w-16 md:h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">Map Loading Error</h3>
          <p className="text-sm md:text-base text-gray-600 mb-4">{mapError}</p>
          <p className="text-xs md:text-sm text-gray-500">The interface will continue with limited functionality.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-64 md:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-sm md:text-base text-gray-600">Loading real-time map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header Section - Responsive */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-center sm:text-left">
            <h2 className="text-lg md:text-xl font-bold">Live Collection Tracking</h2>
            <p className="text-blue-100 text-xs md:text-sm">
              Barangay {barangayId} • {mapInitialized ? 'Map Ready' : 'Initializing...'}
            </p>
          </div>
          
          <div className="flex items-center justify-center sm:justify-end gap-3 md:gap-4">
            <div className={`flex items-center gap-2 text-xs md:text-sm ${
              connectionStatus === 'connected' ? 'text-green-300' : 
              connectionStatus === 'connecting' ? 'text-yellow-300' : 'text-red-300'
            }`}>
              <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
              <span className="capitalize">{connectionStatus}</span>
            </div>
            
            {driverLocation && (
              <div className="flex items-center gap-1 text-green-300 text-xs md:text-sm">
                <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
                </svg>
                <span className="hidden sm:inline">Driver Active</span>
                <span className="sm:hidden">Driver</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section - Responsive Grid */}
      <div className="bg-gray-50 border-b border-gray-200 p-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-sm">
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-gray-800">{siteLocations.length}</div>
            <div className="text-gray-600 text-xs">Total Puroks</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-green-600">{getCompletedSites()}</div>
            <div className="text-gray-600 text-xs">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-blue-600">{siteLocations.length - getCompletedSites()}</div>
            <div className="text-gray-600 text-xs">Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {driverLocation ? 'Yes' : 'No'}
            </div>
            <div className="text-gray-600 text-xs">Driver Tracking</div>
          </div>
        </div>
      </div>

      {/* Map Container - Responsive Height */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
        {!mapInitialized && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-20">
            <div className="text-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
              <p className="text-xs text-gray-500 mt-1">
                {!containerReady ? 'Setting up container...' : 
                 !cssLoaded ? 'Loading styles...' : 
                 !mapboxKey ? 'Waiting for API key...' : 
                 'Initializing Mapbox...'}
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
            {/* Legend - Responsive Positioning & Size */}
            <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-white rounded-lg shadow-lg p-2 md:p-4 text-xs md:text-sm border border-gray-200 z-10 max-w-40 md:max-w-none">
              <div className="font-semibold mb-1 md:mb-2 text-gray-800 text-xs md:text-sm">Legend</div>
              <div className="space-y-1 md:space-y-2">
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-600 rounded-full relative flex-shrink-0">
                    <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-gray-700 text-xs md:text-sm">Driver</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full border-1 md:border-2 border-white flex-shrink-0"></div>
                  <span className="text-gray-700 text-xs md:text-sm">Station</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-500 rounded-full border-1 md:border-2 border-white flex-shrink-0"></div>
                  <span className="text-gray-700 text-xs md:text-sm">Pending</span>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-1 md:border-2 border-white flex-shrink-0"></div>
                  <span className="text-gray-700 text-xs md:text-sm">Completed</span>
                </div>
              </div>
            </div>

            {/* Refresh Button - Responsive Positioning & Size */}
            <button
              onClick={loadInitialData}
              className="absolute top-2 right-2 md:top-4 md:right-4 bg-white rounded-lg shadow-lg p-2 md:p-3 hover:bg-gray-50 transition-colors border border-gray-200 z-10"
              title="Refresh data"
            >
              <IoRefresh className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
            </button>
          </>
        )}
      </div>

      {/* Progress Section - Responsive */}
      {siteLocations.length > 0 && (
        <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm mb-2">
            <span className="text-gray-700 font-medium text-center sm:text-left">Collection Progress</span>
            <span className="font-semibold text-gray-800 text-center sm:text-right">
              {getCompletedSites()}/{siteLocations.length} puroks
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 md:h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ 
                width: `${(getCompletedSites() / siteLocations.length) * 100}%` 
              }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            {Math.round((getCompletedSites() / siteLocations.length) * 100)}% complete
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentMap;