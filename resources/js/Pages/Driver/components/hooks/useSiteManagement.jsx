import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useSiteManagement = (scheduleId) => {
  const [siteLocations, setSiteLocations] = useState([]);
  const [stationLocation, setStationLocation] = useState(null);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [optimizedSiteOrder, setOptimizedSiteOrder] = useState([]);
  const [completedSites, setCompletedSites] = useState(new Set());
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const findNearestSiteToStation = useCallback((station, sites) => {
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
  }, [calculateDistance]);

  const optimizeSiteOrderFromStation = useCallback((station, sites) => {
    if (!station || sites.length === 0) return sites;

    const sitesWithDistances = sites.map(site => {
      const distance = calculateDistance(
        parseFloat(station.latitude), parseFloat(station.longitude),
        parseFloat(site.latitude), parseFloat(site.longitude)
      );
      return { ...site, distance };
    });

    sitesWithDistances.sort((a, b) => a.distance - b.distance);
    return sitesWithDistances;
  }, [calculateDistance]);

  const fetchScheduleAndSites = useCallback(async () => {
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
        } else {
          console.warn('No schedule data received from API');
          scheduleData = {
            id: scheduleId,
            barangay_id: 'unknown',
            status: 'pending'
          };
          setActiveSchedule(scheduleData);
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
            
            const station = activeSites.find(site => site.type === 'station');
            const regularSites = activeSites.filter(site => site.type !== 'station');
            
            if (station) {
              setStationLocation({
                ...station,
                coordinates: [parseFloat(station.longitude), parseFloat(station.latitude)]
              });
              
              if (regularSites.length > 0) {
                const nearestToStation = findNearestSiteToStation(station, regularSites);
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
  }, [scheduleId, findNearestSiteToStation, optimizeSiteOrderFromStation]);

  const markSiteAsCompleted = useCallback((site) => {
    setCompletedSites(prev => new Set(prev).add(site.id));
    
    if (optimizedSiteOrder.length > 0) {
      const currentIndex = optimizedSiteOrder.findIndex(s => s.id === site.id);
      if (currentIndex !== -1 && currentIndex < optimizedSiteOrder.length - 1) {
        setCurrentSiteIndex(currentIndex + 1);
      }
    }
  }, [optimizedSiteOrder]);

  const resetCompletedSites = useCallback(() => {
    setCompletedSites(new Set());
    setCurrentSiteIndex(0);
  }, []);

  const getNextUncompletedSiteIndex = useCallback(() => {
    for (let i = 0; i < optimizedSiteOrder.length; i++) {
      if (!completedSites.has(optimizedSiteOrder[i].id)) {
        return i;
      }
    }
    return -1;
  }, [optimizedSiteOrder, completedSites]);

  useEffect(() => {
    fetchScheduleAndSites();
  }, [fetchScheduleAndSites]);

  return {
    siteLocations,
    stationLocation,
    activeSchedule,
    optimizedSiteOrder,
    completedSites,
    currentSiteIndex,
    loading,
    markSiteAsCompleted,
    resetCompletedSites,
    getNextUncompletedSiteIndex,
    setOptimizedSiteOrder,
    setSiteLocations,
    setStationLocation,
    setActiveSchedule,
    calculateDistance,
    optimizeSiteOrderFromStation
  };
};