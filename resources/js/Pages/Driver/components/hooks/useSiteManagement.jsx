import { useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';
import { getSiteDisplayName } from '@/Utils/siteHelpers';

export const useSiteManagement = ({ 
  scheduleId, 
  onTaskComplete, 
  onTaskCancel,
  calculateDistance,
  showCompletionNotification,
  updateSiteMarkers,
  recalculateRouteFromCurrentPosition,
  currentLocation
}) => {
  const [siteLocations, setSiteLocations] = useState([]);
  const [stationLocation, setStationLocation] = useState(null);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [nearestSiteToStation, setNearestSiteToStation] = useState(null);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);
  const [completedSites, setCompletedSites] = useState(new Set());
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0);
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const findNearestSiteToStation = (station, sites) => {
    if (!station || sites.length === 0) return null;

    let nearestSite = null;
    let minDistance = Infinity;

    sites.forEach(site => {
      if (site.longitude && site.latitude) {
        const distance = calculateDistance(
          parseFloat(station.latitude), parseFloat(station.longitude),
          parseFloat(site.latitude), parseFloat(site.longitude)
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          nearestSite = site;
        }
      }
    });

    return nearestSite;
  };

  const checkSiteProximity = (currentPos, sites) => {
    if (!currentPos || sites.length === 0) return false;
  
    const [longitude, latitude] = currentPos;
    const PROXIMITY_THRESHOLD = 0.05; // ~50 meters
    let siteReached = false;
  
    sites.forEach((site, index) => {
      if (completedSites.has(site.id)) return;
  
      const siteLongitude = parseFloat(site.longitude);
      const siteLatitude = parseFloat(site.latitude);
      
      const distance = calculateDistance(
        latitude,
        longitude,
        siteLatitude,
        siteLongitude
      );
  
      // Log proximity check for debugging
      if (distance < 0.1) { // Log when within 100m
        console.log(`📍 Proximity check: ${site.site_name} - Distance: ${(distance * 1000).toFixed(0)}m (threshold: ${(PROXIMITY_THRESHOLD * 1000).toFixed(0)}m)`);
      }

      if (distance < PROXIMITY_THRESHOLD) {
        console.log(`🎯 SITE REACHED! ${site.site_name} - Distance: ${(distance * 1000).toFixed(0)}m`);
        markSiteAsCompleted(site, index);
        siteReached = true;
      }
    });
  
    return siteReached;
  };

  const generateAccessTokenAndRedirect = async () => {
    try {
        console.log('Generating access token for schedule:', scheduleId);
        
        const response = await axios.post('/generate-report-token', {
            schedule_id: scheduleId
        });

        if (response.data.success && response.data.access_token) {
            console.log('Access token generated, redirecting to report form');
            
            router.visit(`/driver/report/${scheduleId}?token=${response.data.access_token}`);
        } else {
            console.error('Failed to generate access token:', response.data.message);
            alert('Failed to generate report access. Please contact support.');
        }
    } catch (error) {
        console.error('Error generating access token:', error);
        alert('Error generating report access. Please try again.');
    }
  };

  const initializeCollectionQueue = async () => {
    try {
      if (!siteLocations.length) {
        console.log('No sites available to initialize collection queue');
        return;
      }

      const siteIds = siteLocations.map(site => site.id);
      console.log('Initializing collection queue with sites:', siteIds);

      const response = await axios.post('/initialize', {
        schedule_id: scheduleId,
        site_id: siteIds
      });
      
      if (response.data.success) {
        console.log('Collection queue initialized with', response.data.total_sites, 'sites');
      } else {
        console.error('Failed to initialize collection queue:', response.data.message);
      }
    } catch (error) {
      console.error('Error initializing collection queue:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const markSiteAsCompleted = async (site, index) => {
    console.log(`Site reached: ${site.site_name}`);
    
    try {
      const response = await axios.post('/mark-completed', {
        schedule_id: scheduleId,
        site_id: site.id
      });

      if (response.data.success) {
        console.log('Site marked as completed in database:', site.site_name);
        
        // Update completed sites set
        setCompletedSites(prev => {
          const newCompleted = new Set(prev);
          newCompleted.add(site.id);
          console.log('Updated completed sites:', Array.from(newCompleted));
          return newCompleted;
        });
        
        // Update site locations with completion status
        setSiteLocations(prev => prev.map(s => {
          if (s.id === site.id) {
            return {
              ...s,
              collectionStatus: 'finished',
              status: 'finished',
              completed_at: new Date().toISOString()
            };
          }
          return s;
        }));
        
        // Check for all completed
        if (response.data.all_completed) {
          console.log('🎉 All sites completed! Show completion report modal.');
          
          if (onTaskComplete) {
            onTaskComplete(site, true); // Pass true to indicate all completed
          }
        } else {
          console.log(`Progress: ${response.data.completed_sites}/${response.data.total_sites} sites completed`);
        }
        
        // Handle next site navigation
        if (optimizedSiteOrder.length > 0) {
          const currentIndex = optimizedSiteOrder.findIndex(s => s.id === site.id);
          if (currentIndex !== -1 && currentIndex < optimizedSiteOrder.length - 1) {
            const nextSiteIndex = currentIndex + 1;
            setCurrentSiteIndex(nextSiteIndex);
            
            const nextSite = optimizedSiteOrder[nextSiteIndex];
            console.log(`Moving to next site: ${nextSite.site_name}`);
            
            if (currentLocation) {
              console.log('Immediately recalculating route from current location to next site');
              recalculateRouteFromCurrentPosition(currentLocation);
            }
          } else if (currentIndex === optimizedSiteOrder.length - 1) {
            console.log('🏁 Last site reached!');
            setCurrentSiteIndex(currentIndex);
          }
        }
        
        // Update markers to show completion
        updateSiteMarkers();
        showCompletionNotification(getSiteDisplayName(site));
      }
    } catch (error) {
      console.error('Error marking site as completed:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const startTaskAndBroadcast = async () => {
    if (!scheduleId) {
      console.error('Cannot start task: missing schedule ID');
      return;
    }
  
    try {
      const barangayId = activeSchedule?.barangay_id || 'unknown';
  
      const response = await axios.post('/schedule/start', {
        schedule_id: scheduleId,
        barangay_id: barangayId
      });
  
      if (response.data.success) {
        console.log('Task started and broadcasted to residents');
        setIsTaskActive(true);

        if (siteLocations.length > 0) {
          await initializeCollectionQueue();
        }
        
        if (response.data.data) {
          setActiveSchedule(prev => ({
            ...prev,
            ...response.data.data,
            status: 'in_progress'
          }));
        }
      }
    } catch (error) {
      console.error('Failed to start task:', error);
    }
  };

  const completeTaskAndBroadcast = async () => {
    if (!scheduleId) {
      console.error('Cannot complete task: missing schedule ID');
      return;
    }

    try {
      const response = await axios.post('/schedule/complete', {
        schedule_id: scheduleId
      });

      if (response.data.success) {
        console.log('Task completed and broadcasted to residents');
        setIsTaskActive(false);
        
        if (onTaskComplete) {
          onTaskComplete();
        }
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const resetCompletedSites = () => {
    setCompletedSites(new Set());
    setCurrentSiteIndex(0);
    updateSiteMarkers();
  };

  const fetchScheduleAndSites = async () => {
    if (!scheduleId) {
      console.warn('No schedule ID provided');
      return;
    }
    
    setLoading(true);
    try {
      let scheduleData = null;
      
      try {
        const scheduleResponse = await axios.get(`/schedules/${scheduleId}`);
        if (scheduleResponse.data.success && scheduleResponse.data.data) {
          scheduleData = scheduleResponse.data.data;
          setActiveSchedule(scheduleData);
          console.log('Schedule data loaded:', scheduleData);
        } else {
          console.warn('No schedule data received from API');
        }
      } catch (scheduleError) {
        console.warn('Could not fetch schedule details:', scheduleError);
        scheduleData = {
          id: scheduleId,
          barangay_id: 'unknown',
          status: 'pending'
        };
        setActiveSchedule(scheduleData);
      }
  
      if (scheduleData?.barangay_id && scheduleData.barangay_id !== 'unknown') {
        try {
          const sitesResponse = await axios.get(`/barangay/${scheduleData.barangay_id}/sites?status=active`);
          if (sitesResponse.data.success) {
            const activeSites = sitesResponse.data.data;
            console.log('Sites loaded:', activeSites.length);
            
            // Fetch collection queue progress to get completion status
            try {
              const progressResponse = await axios.get(`/progress/${scheduleId}`);
              if (progressResponse.data.success) {
                const queueData = progressResponse.data.progress;
                const completedSiteIds = new Set(
                  queueData
                    .filter(q => q.status === 'finished')
                    .map(q => q.site_id)
                );
                
                console.log('Collection queue loaded, completed sites:', completedSiteIds.size);
                setCompletedSites(completedSiteIds);
                
                // Merge completion status with site data
                const sitesWithStatus = activeSites.map(site => ({
                  ...site,
                  collectionStatus: queueData.find(q => q.site_id === site.id)?.status || 'unfinished'
                }));
                
                const station = sitesWithStatus.find(site => site.type === 'station');
                const regularSites = sitesWithStatus.filter(site => site.type !== 'station');
                
                if (station) {
                  setStationLocation({
                    ...station,
                    coordinates: [parseFloat(station.longitude), parseFloat(station.latitude)]
                  });
                  
                  if (regularSites.length > 0) {
                    const nearestToStation = findNearestSiteToStation(station, regularSites);
                    setNearestSiteToStation(nearestToStation);
                    console.log('Nearest site to station found:', nearestToStation?.site_name);
                    
                    const optimizedOrder = optimizeSiteOrderFromStation(station, regularSites);
                    setOptimizedSiteOrder(optimizedOrder);
                    setCurrentSiteIndex(0);
                  }
                }
                
                // Only include regular sites (exclude station) in siteLocations for collection queue
                setSiteLocations(regularSites);
              }
            } catch (progressError) {
              console.warn('Could not fetch collection queue progress, using default statuses');
              
              const station = activeSites.find(site => site.type === 'station');
              const regularSites = activeSites.filter(site => site.type !== 'station');
              
              if (station) {
                setStationLocation({
                  ...station,
                  coordinates: [parseFloat(station.longitude), parseFloat(station.latitude)]
                });
                
                if (regularSites.length > 0) {
                  const nearestToStation = findNearestSiteToStation(station, regularSites);
                  setNearestSiteToStation(nearestToStation);
                  console.log('Nearest site to station found:', nearestToStation?.site_name);
                  
                  const optimizedOrder = optimizeSiteOrderFromStation(station, regularSites);
                  setOptimizedSiteOrder(optimizedOrder);
                  setCurrentSiteIndex(0);
                }
              }
              
              // Only include regular sites (exclude station) in siteLocations for collection queue
              setSiteLocations(regularSites);
            }
          }
        } catch (sitesError) {
          console.error('Error fetching sites:', sitesError);
        }
      } else {
        console.warn('No valid barangay_id available to fetch sites');
      }

    } catch (error) {
      console.error('Error in schedule and sites setup: ', error);
    } finally {
      setLoading(false);
    }
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

  useEffect(() => {
    fetchScheduleAndSites();
  }, [scheduleId]);

  useEffect(() => {
    if (siteLocations.length > 0 && scheduleId) {
      console.log('Sites loaded, initializing collection queue...');
      initializeCollectionQueue();
    }
  }, [siteLocations, scheduleId]);

  // Listen for site completion updates from other sources (e.g., admin updates)
  useEffect(() => {
    if (!activeSchedule?.barangay_id || !scheduleId) return;

    console.log('Setting up site completion listener for barangay:', activeSchedule.barangay_id);

    const channelName = `site-completion.${activeSchedule.barangay_id}`;
    const scheduleChannelName = `site-completion-schedule.${scheduleId}`;

    window.Echo.channel(channelName)
      .listen('SiteCompletionUpdated', (e) => {
        console.log('Site completion update received:', e);
        
        if (e.schedule_id === scheduleId) {
          // Update completed sites
          setCompletedSites(prev => {
            const newSet = new Set(prev);
            newSet.add(e.site_id);
            console.log('Site completion broadcast received, updated completed sites:', Array.from(newSet));
            return newSet;
          });
          
          // Update site locations with completion status
          setSiteLocations(prev => prev.map(site => {
            if (site.id === e.site_id) {
              return {
                ...site,
                collectionStatus: 'finished',
                status: 'finished',
                completed_at: e.completed_at
              };
            }
            return site;
          }));
          
          // Update markers
          updateSiteMarkers();
        }
      });

    window.Echo.channel(scheduleChannelName)
      .listen('SiteCompletionUpdated', (e) => {
        console.log('Schedule-specific site completion update:', e);
        
        // Update completed sites
        setCompletedSites(prev => {
          const newSet = new Set(prev);
          newSet.add(e.site_id);
          return newSet;
        });
        
        // Update site locations
        setSiteLocations(prev => prev.map(site => {
          if (site.id === e.site_id) {
            return {
              ...site,
              collectionStatus: 'finished',
              status: 'finished',
              completed_at: e.completed_at
            };
          }
          return site;
        }));
        
        updateSiteMarkers();
      });

    return () => {
      if (window.Echo) {
        window.Echo.leave(channelName);
        window.Echo.leave(scheduleChannelName);
        console.log('Left site completion channels');
      }
    };
  }, [activeSchedule?.barangay_id, scheduleId]);

  return {
    siteLocations,
    stationLocation,
    activeSchedule,
    nearestSiteToStation,
    optimizedSiteOrder,
    completedSites,
    currentSiteIndex,
    isTaskActive,
    loading,
    setSiteLocations,
    setStationLocation,
    setActiveSchedule,
    setNearestSiteToStation,
    setOptimizedSiteOrder,
    setCompletedSites,
    setCurrentSiteIndex,
    setIsTaskActive,
    setLoading,
    findNearestSiteToStation,
    checkSiteProximity,
    markSiteAsCompleted,
    startTaskAndBroadcast,
    completeTaskAndBroadcast,
    resetCompletedSites,
    fetchScheduleAndSites,
    optimizeSiteOrderFromStation,
  };
};