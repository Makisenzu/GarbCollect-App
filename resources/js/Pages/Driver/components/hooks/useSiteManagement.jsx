import { useState, useEffect } from 'react';
import axios from 'axios';

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

  // Find the site that is nearest to the station
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
    const PROXIMITY_THRESHOLD = 0.05;
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
  
      if (distance < 0.05) {
        markSiteAsCompleted(site, index);
        siteReached = true;
      }
    });
  
    return siteReached;
  };

  // FIXED: Updated markSiteAsCompleted function to immediately recalculate route for both real and fake locations
  const markSiteAsCompleted = (site, index) => {
    console.log(`Site reached: ${site.site_name}`);
    
    // Add site to completed set
    setCompletedSites(prev => {
      const newCompleted = new Set(prev).add(site.id);
      
      // Check if all sites are completed
      if (newCompleted.size === siteLocations.length) {
        console.log('🎉 All sites completed! Task finished.');
        if (onTaskComplete) {
          onTaskComplete(site);
        }
      } else {
        console.log(`Progress: ${newCompleted.size}/${siteLocations.length} sites completed`);
      }
      
      return newCompleted;
    });
    
    // Update current site index and IMMEDIATELY recalculate route to next site
    if (optimizedSiteOrder.length > 0) {
      const currentIndex = optimizedSiteOrder.findIndex(s => s.id === site.id);
      if (currentIndex !== -1 && currentIndex < optimizedSiteOrder.length - 1) {
        const nextSiteIndex = currentIndex + 1;
        setCurrentSiteIndex(nextSiteIndex);
        
        const nextSite = optimizedSiteOrder[nextSiteIndex];
        console.log(`Moving to next site: ${nextSite.site_name}`);
        
        // IMMEDIATELY recalculate route when a site is completed
        // For both real AND fake locations
        if (currentLocation) {
          console.log('Immediately recalculating route from current location to next site');
          recalculateRouteFromCurrentPosition(currentLocation);
        } else {
          console.log('No current location available for immediate route recalculation');
        }
      } else if (currentIndex === optimizedSiteOrder.length - 1) {
        console.log('🏁 Last site reached!');
        setCurrentSiteIndex(currentIndex);
      }
    }
    
    // Update markers to reflect completion status
    updateSiteMarkers();
    
    // Show completion notification for individual site
    showCompletionNotification(site.site_name);
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

  // NEW: Reset completed sites (useful for testing)
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
      
      // Try to fetch schedule details
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
        // Create a minimal schedule object if API fails
        scheduleData = {
          id: scheduleId,
          barangay_id: 'unknown',
          status: 'pending'
        };
        setActiveSchedule(scheduleData);
      }
  
      // Then fetch sites if we have a valid barangay_id
      if (scheduleData?.barangay_id && scheduleData.barangay_id !== 'unknown') {
        try {
          const sitesResponse = await axios.get(`/barangay/${scheduleData.barangay_id}/sites?status=active`);
          if (sitesResponse.data.success) {
            const activeSites = sitesResponse.data.data;
            console.log('Sites loaded:', activeSites.length);
            
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
            
            setSiteLocations(regularSites);
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

  return {
    // State
    siteLocations,
    stationLocation,
    activeSchedule,
    nearestSiteToStation,
    optimizedSiteOrder,
    completedSites,
    currentSiteIndex,
    isTaskActive,
    loading,
    
    // Setters
    setSiteLocations,
    setStationLocation,
    setActiveSchedule,
    setNearestSiteToStation,
    setOptimizedSiteOrder,
    setCompletedSites,
    setCurrentSiteIndex,
    setIsTaskActive,
    setLoading,
    
    // Methods
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