import { useRef, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import { GiControlTower } from "react-icons/gi";
import { IoLocation, IoCar, IoTime, IoCheckmarkCircle } from "react-icons/io5";

export const useResidentMap = ({ mapboxKey, barangayId }) => {
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
  const [loading, setLoading] = useState(false);

  // Initialize Reverb connection for real-time updates
  useEffect(() => {
    if (!barangayId) return;

    // Initialize Echo
    window.Echo = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
      wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
      wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
      forceTLS: false,
      enabledTransports: ['ws', 'wss'],
    });

    // Listen for driver location updates
    window.Echo.channel(`driver-locations.${barangayId}`)
      .listen('DriverLocationUpdated', (e) => {
        updateDriverLocation(e);
      });

    // Listen for schedule status updates
    window.Echo.channel(`schedule-updates.${barangayId}`)
      .listen('ScheduleStatusUpdated', (e) => {
        updateScheduleStatus(e);
      });

    // Listen for site completion updates
    window.Echo.channel(`site-completion.${barangayId}`)
      .listen('SiteCompletionUpdated', (e) => {
        handleSiteCompletion(e);
      });

    return () => {
      if (window.Echo) {
        window.Echo.leave(`driver-locations.${barangayId}`);
        window.Echo.leave(`schedule-updates.${barangayId}`);
        window.Echo.leave(`site-completion.${barangayId}`);
      }
    };
  }, [barangayId]);

  const updateDriverLocation = (locationData) => {
    const newLocation = [locationData.longitude, locationData.latitude];
    setDriverLocation(newLocation);
    
    // Update or create driver marker
    updateDriverMarker(newLocation, locationData);
    
    // Auto-center map on driver if it's their first location
    if (map.current && !map.current.hasUserInteracted()) {
      map.current.flyTo({
        center: newLocation,
        zoom: 15,
        duration: 1000
      });
    }
  };

  const updateDriverMarker = (coordinates, locationData) => {
    if (!map.current) return;

    // Remove existing marker
    if (driverMarker) {
      driverMarker.remove();
    }

    const markerElement = document.createElement('div');
    markerElement.className = 'driver-location-marker';
    markerElement.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-lg z-50 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Driver • ${locationData.accuracy ? `Acc: ${Math.round(locationData.accuracy)}m` : 'Live'}
        </div>
      </div>
    `;

    const newMarker = new mapboxgl.Marker({
      element: markerElement,
      draggable: false
    })
    .setLngLat(coordinates)
    .addTo(map.current);

    setDriverMarker(newMarker);
  };

  const updateScheduleStatus = (scheduleData) => {
    setCurrentSchedule(scheduleData.schedule);
    
    // If schedule includes sites, update them
    if (scheduleData.schedule.sites) {
      setSiteLocations(scheduleData.schedule.sites);
      updateSiteMarkers(scheduleData.schedule.sites);
    }
  };

  const handleSiteCompletion = (data) => {
    
    // Update site locations state with completion status
    setSiteLocations(prevSites => {
      return prevSites.map(site => {
        if (site.id === data.site_id) {
          return {
            ...site,
            status: 'finished',
            completed_at: data.completed_at
          };
        }
        return site;
      });
    });

    // Re-render markers with updated status
    updateSiteMarkers(siteLocations.map(site => {
      if (site.id === data.site_id) {
        return {
          ...site,
          status: 'finished',
          completed_at: data.completed_at
        };
      }
      return site;
    }));
  };

  const updateSiteMarkers = (sites) => {
    // Clear existing site markers
    siteMarkers.forEach(marker => marker.remove());
    
    const newMarkers = sites.map(site => {
      if (!site.longitude || !site.latitude) return null;

      const markerElement = document.createElement('div');
      markerElement.className = 'site-marker';
      
      const isCompleted = site.status === 'finished';
      const isCurrent = site.status === 'in_progress';
      
      markerElement.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white ${
            isCurrent ? 'ring-4 ring-yellow-500 ring-opacity-70' : ''
          } ${isCompleted ? 'opacity-50 grayscale' : ''}" 
               style="border-color: ${isCompleted ? '#10B981' : '#EF4444'};">
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold ${isCompleted ? 'text-green-600' : 'text-red-600'}">
                ${isCompleted ? '✓' : '🗑️'}
              </span>
            </div>
          </div>
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            ${site.site_name} ${isCompleted ? '• Completed' : isCurrent ? '• Current' : ''}
          </div>
        </div>
      `;

      return new mapboxgl.Marker({
        element: markerElement,
        draggable: false
      })
      .setLngLat([parseFloat(site.longitude), parseFloat(site.latitude)])
      .addTo(map.current);
    }).filter(marker => marker !== null);

    setSiteMarkers(newMarkers);
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (!barangayId) return;
      
      setLoading(true);
      try {
        // Load current schedule for barangay
        const scheduleResponse = await axios.get(`/barangay/${barangayId}/current-schedule`);
        if (scheduleResponse.data.success) {
          setCurrentSchedule(scheduleResponse.data.data);
          
          // Load sites for this schedule
          if (scheduleResponse.data.data.id) {
            const sitesResponse = await axios.get(`/schedule/${scheduleResponse.data.data.id}/sites`);
            if (sitesResponse.data.success) {
              setSiteLocations(sitesResponse.data.data);
            }
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [barangayId]);

  // Map initialization
  useEffect(() => {
    const loadMapboxCSS = () => {
      const link = document.createElement('link');
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      link.onload = () => setCssLoaded(true);
      document.head.appendChild(link);
    };

    loadMapboxCSS();
  }, []);

  useEffect(() => {
    if (!cssLoaded || !mapboxKey || map.current || !mapContainer.current) return;

    try {
      mapboxgl.accessToken = mapboxKey;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [125.94849837776422, 8.483022468128098],
        zoom: 12,
        attributionControl: false
      });

      map.current.on('load', () => {
        setMapInitialized(true);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
      });

    } catch (error) {
      console.error('Error creating map:', error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxKey, cssLoaded]);

  // Fit map to show all sites and driver when data changes
  useEffect(() => {
    if (!map.current || !mapInitialized || siteLocations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    
    // Extend bounds to include all sites
    siteLocations.forEach(site => {
      if (site.longitude && site.latitude) {
        bounds.extend([parseFloat(site.longitude), parseFloat(site.latitude)]);
      }
    });
    
    // Extend bounds to include driver location if available
    if (driverLocation) {
      bounds.extend(driverLocation);
    }

    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  }, [mapInitialized, siteLocations, driverLocation]);

  return {
    mapContainer,
    currentSchedule,
    driverLocation,
    siteLocations,
    loading,
    isOnline,
    mapInitialized
  };
};