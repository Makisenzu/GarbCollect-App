import{r}from"./app-BMd61d6g.js";import{useLocationTracking as U}from"./useLocationTracking-NkBi8vZv.js";import{useMapboxSetup as F}from"./useMapboxSetup-Dkve6Ntc.js";import{useMapLayers as D}from"./useMapLayers-BxQVZrL-.js";import{useRouteCalculations as B}from"./useRouteCalculations-DAMKd5QG.js";import{u as P}from"./useSiteManagement-BkcUHzOV.js";import"./mapbox-gl-vEg7wxRF.js";import"./index-ByOiO4h3.js";import"./iconBase-CxoyT6YB.js";import"./can-3MqaZyCZ.js";const J=({mapboxKey:S,scheduleId:p,onTaskComplete:L,onTaskCancel:k})=>{const[d,R]=r.useState(!1),[T,h]=r.useState(!1),[x,g]=r.useState(!0),[y,v]=r.useState(navigator.onLine),[A,b]=r.useState(!1),i=F({mapboxKey:S,isMobile:d}),a=B({mapboxKey:S,isOnline:y,activeSchedule:null,optimizedSiteOrder:[],completedSites:new Set,siteLocations:[],currentLocation:null,routeCoordinates:[],routeInfo:null,map:i.map,isMobile:d,addRouteLayer:()=>{}}),t=P({scheduleId:p,onTaskComplete:(o,e=!1)=>{e&&b(!0),L&&L(o,e)},onTaskCancel:k,calculateDistance:a.calculateDistance,showCompletionNotification:o=>{try{const e=new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLaiTUIGGe77OmfTgwOUKbk8LdjHQU2kdby0HwqBSp3x/DdkUELEl+06OyqVRUKRp7g8r5wIgU0h9H004IzBh1tv+/mnEkODlat6O+xXBkIP5Xa8sV0KgUrgc7y2YszCBdnvOzpnk4MDU+m5O+5ZBwGNpHX8s98Kgcrc8fv3ZJCCxFftOjuq1YUDD6f4fK/cCMGNYfR89OCMwYcbb/v5JxKDg5VrOjusVwZCj6U2vLGdSoGK4HO8tmLMwgXZ7vs6J5PDA1Ppubw...");e.volume=.4,e.play().catch(()=>{})}catch{}if(d){const e=document.createElement("div");e.className="fixed top-20 left-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl z-[9999] transform transition-all duration-500",e.style.animation="slideInDown 0.5s ease-out",e.innerHTML=`
          <div class="flex items-start gap-3">
            <div class="text-5xl animate-bounce">✅</div>
            <div class="flex-1 text-left">
              <div class="font-bold text-xl mb-1">${o} FINISHED!</div>
              <div class="text-sm opacity-90 mb-2">Collection completed successfully</div>
              <div class="text-xs opacity-80 bg-white bg-opacity-20 px-2 py-1 rounded inline-block">
                Progress: ${t.completedSites.size+1}/${t.siteLocations.length} sites (${Math.round((t.completedSites.size+1)/t.siteLocations.length*100)}%)
              </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-75 hover:opacity-100 text-3xl font-bold leading-none mt-1">×</button>
          </div>
          <div class="mt-3 h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full transition-all duration-1000 animate-pulse" style="width: ${(t.completedSites.size+1)/t.siteLocations.length*100}%"></div>
          </div>
        `,document.body.appendChild(e),setTimeout(()=>{document.body.contains(e)&&(e.style.opacity="0",e.style.transform="translateY(-20px)",setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e)},500))},6e3)}else{const e=document.createElement("div");e.className="fixed top-4 right-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl z-[9999] min-w-[400px] transform transition-all duration-500",e.style.animation="slideInRight 0.5s ease-out, bounceScale 0.3s ease-in-out 0.5s",e.innerHTML=`
          <div class="flex items-start gap-4">
            <div class="text-6xl animate-bounce">✅</div>
            <div class="flex-1">
              <div class="font-bold text-2xl mb-2">${o} FINISHED!</div>
              <div class="text-sm opacity-90 mb-3">Collection site has been marked as completed</div>
              <div class="flex items-center gap-2 text-sm mb-3">
                <span class="font-semibold bg-white bg-opacity-20 px-3 py-1 rounded">${t.completedSites.size+1}/${t.siteLocations.length} sites</span>
                <span class="opacity-75">•</span>
                <span class="font-semibold">${Math.round((t.completedSites.size+1)/t.siteLocations.length*100)}% complete</span>
              </div>
              <div class="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
                <div class="h-full bg-white rounded-full transition-all duration-1000 animate-pulse" style="width: ${(t.completedSites.size+1)/t.siteLocations.length*100}%"></div>
              </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-75 hover:opacity-100 text-3xl font-bold leading-none transition-opacity">×</button>
          </div>
        `,document.body.appendChild(e),setTimeout(()=>{document.body.contains(e)&&(e.style.opacity="0",e.style.transform="translateX(100%)",setTimeout(()=>{document.body.contains(e)&&document.body.removeChild(e)},500))},7e3)}if(!document.getElementById("completion-animations")){const e=document.createElement("style");e.id="completion-animations",e.textContent=`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideInDown {
            from {
              transform: translateY(-100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }
          @keyframes bounceScale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }
        `,document.head.appendChild(e)}},updateSiteMarkers:()=>{},recalculateRouteFromCurrentPosition:a.recalculateRouteFromCurrentPosition,currentLocation:null}),s=D({map:i.map,isMobile:d,activeSchedule:t.activeSchedule,completedSites:t.completedSites,optimizedSiteOrder:t.optimizedSiteOrder,currentSiteIndex:t.currentSiteIndex,nearestSiteToStation:t.nearestSiteToStation,routeCoordinates:a.routeCoordinates,routeInfo:a.routeInfo,currentLocation:null,isTaskActive:t.isTaskActive,siteLocations:t.siteLocations,stationLocation:t.stationLocation}),n=U({scheduleId:p,activeSchedule:t.activeSchedule,siteLocations:t.siteLocations,completedSites:t.completedSites,optimizedSiteOrder:t.optimizedSiteOrder,currentSiteIndex:t.currentSiteIndex,isTaskActive:t.isTaskActive,onTaskComplete:L,map:i.map,isMobile:d,currentLocation:null,routeCoordinates:a.routeCoordinates,routeInfo:a.routeInfo,smoothUpdateUserLocation:s.smoothUpdateUserLocation,checkSiteProximity:t.checkSiteProximity,recalculateRouteFromCurrentPosition:a.recalculateRouteFromCurrentPosition,shouldRecalculateRoute:a.shouldRecalculateRoute,updateUserLocationSource:s.updateUserLocationSource,animatePulse:s.animatePulse,clearUserLocationLayers:s.clearUserLocationLayers,updateCurrentLocationMarker:s.updateCurrentLocationMarker,handleLocationError:o=>{let e="Location tracking error: ";switch(o.code){case o.PERMISSION_DENIED:e+="Location access denied. Please enable location permissions.";break;case o.POSITION_UNAVAILABLE:e+="Location unavailable. Using last known position.";break;case o.TIMEOUT:e+="Location request timeout. Retrying...",setTimeout(n.startRealtimeLocationTracking,5e3);break;default:e+="Unknown location error.";break}console.warn(e)},sendLocationToReverb:async(o,e,u=null)=>{var f;if(!p){console.error("No schedule ID available");return}try{const l=((f=t.activeSchedule)==null?void 0:f.barangay_id)||"unknown",m=await axios.post("/driver/location/update",{latitude:o,longitude:e,accuracy:u,schedule_id:p,barangay_id:l,timestamp:new Date().toISOString()});m.data.success&&m.data.sites_completed&&m.data.sites_completed.length>0&&(m.data.sites_completed.forEach(c=>{t.setCompletedSites(E=>{const w=new Set(E);return w.add(c.site_id),w})}),s.updateSiteMarkers())}catch(l){throw console.error("Failed to send location to backend:",l),l}}});r.useEffect(()=>{const o=()=>{const e=window.innerWidth<768;R(e),e&&(h(!1),g(!0))};return o(),window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),r.useEffect(()=>{const o=()=>{v(!0),i.setOfflineMode(!1)},e=()=>{v(!1),i.setOfflineMode(!0),i.setMapError(null)};return window.addEventListener("online",o),window.addEventListener("offline",e),()=>{window.removeEventListener("online",o),window.removeEventListener("offline",e)}},[i]),r.useEffect(()=>{const o=i.initializeMap(()=>{n.startRealtimeLocationTracking()});return()=>{n.stopRealtimeLocationTracking(),n.stopFakeLocationTest(),s.clearUserLocationLayers(),o&&o()}},[i.cssLoaded]),r.useEffect(()=>{i.mapInitialized&&i.customStyleLoaded&&t.siteLocations.length>0&&(s.clearSiteMarkers(),s.addSiteMarkers(),a.routeCoordinates.length>0&&setTimeout(()=>{s.addRouteLayer()},300))},[i.mapInitialized,i.customStyleLoaded,t.siteLocations,a.routeCoordinates,t.optimizedSiteOrder,t.nearestSiteToStation,t.completedSites]),r.useEffect(()=>{n.currentLocation&&t.siteLocations.length>0&&i.mapInitialized&&(async()=>{const e=await a.analyzeAndOptimizeRouteFromCurrentLocation(n.currentLocation,t.siteLocations);e&&(a.setRouteCoordinates(e.route),a.setRouteInfo({duration:e.duration,distance:e.distance,formattedDuration:e.formattedDuration}),setTimeout(()=>{i.map.current&&e.route.length>0&&s.addRouteLayer()},300))})()},[n.currentLocation,t.siteLocations,i.mapInitialized]);const C=()=>{navigator.geolocation?(t.setLoading(!0),navigator.geolocation.getCurrentPosition(async o=>{var m;const{latitude:e,longitude:u,accuracy:f}=o.coords,l=[u,e];if(n.setCurrentLocation(l),n.setLocationAccuracy(f),n.setLastLocationUpdate(new Date),s.smoothUpdateUserLocation(e,u),t.siteLocations.length>0){const c=await a.analyzeAndOptimizeRouteFromCurrentLocation(l,t.siteLocations);c&&(a.setRouteCoordinates(c.route),a.setRouteInfo({duration:c.duration,distance:c.distance,formattedDuration:c.formattedDuration,toSite:(m=c.nearestSite)==null?void 0:m.site_name}),setTimeout(()=>{i.map.current&&c.route.length>0&&s.addRouteLayer()},500))}i.map.current&&i.map.current.flyTo({center:l,zoom:d?15:14,essential:!0,duration:1500}),t.setLoading(!1)},o=>{console.error("Error getting location:",o),t.setLoading(!1),n.handleLocationError(o)},{enableHighAccuracy:!0,timeout:3e4,maximumAge:0})):alert("Geolocation is not supported by your browser.")},I=()=>{if(!t.stationLocation){alert("No station found. Please check site configuration.");return}if(t.siteLocations.length===0){alert("No sites available for optimization.");return}a.analyzeAndOptimizeRouteFromStation(t.stationLocation,t.siteLocations)},z=(o,e)=>{const u=[e,o];n.setCurrentLocation(u),s.smoothUpdateUserLocation(o,e),t.nearestSiteToStation&&a.calculateRouteToNearestSiteFromStation(u,t.nearestSiteToStation)},M=()=>{s.fitMapToRouteAndDriver(a.getNextUncompletedSiteIndex,t.optimizedSiteOrder)},O=()=>{s.fitMapToRoute()};return{mapContainer:i.mapContainer,siteMarkersRef:s.siteMarkersRef,cssLoaded:i.cssLoaded,siteLocations:t.siteLocations,stationLocation:t.stationLocation,mapInitialized:i.mapInitialized,activeSchedule:t.activeSchedule,routeCoordinates:a.routeCoordinates,loading:t.loading,currentLocation:n.currentLocation,routeInfo:a.routeInfo,mapError:i.mapError,customStyleLoaded:i.customStyleLoaded,aiOptimizedRoute:a.aiOptimizedRoute,nearestSiteToStation:t.nearestSiteToStation,isMobile:d,showAIPanel:T,showControls:x,optimizedSiteOrder:t.optimizedSiteOrder,isOnline:y,offlineMode:i.offlineMode,locationAccuracy:n.locationAccuracy,lastLocationUpdate:n.lastLocationUpdate,completedSites:t.completedSites,currentSiteIndex:t.currentSiteIndex,isTaskActive:t.isTaskActive,isFakeLocationActive:n.isFakeLocationActive,allSiteRoutes:a.allSiteRoutes,showCompletionModal:A,setShowCompletionModal:b,formatDuration:a.formatDuration,getCurrentLocation:C,getAIOptimizedRoute:I,setShowAIPanel:h,setShowControls:g,startRealtimeLocationTracking:n.startRealtimeLocationTracking,stopRealtimeLocationTracking:n.stopRealtimeLocationTracking,updateLocationManually:z,resetCompletedSites:t.resetCompletedSites,markSiteAsCompleted:t.markSiteAsCompleted,startTaskAndBroadcast:t.startTaskAndBroadcast,completeTaskAndBroadcast:t.completeTaskAndBroadcast,sendLocationToReverb:n.sendLocationToReverb,startFakeLocationTest:n.startFakeLocationTest,stopFakeLocationTest:n.stopFakeLocationTest,sendTestLocation:n.sendTestLocation,simulateRouteFollowing:n.simulateRouteFollowing,fitMapToRouteAndDriver:M,fitMapToRoute:O,updateSiteMarkers:s.updateSiteMarkers,addRouteLayer:s.addRouteLayer,calculateRouteToNextSite:a.calculateRouteToNextSite,calculateOptimalRoute:a.calculateOptimalRoute,optimizeSiteOrder:a.optimizeSiteOrder,analyzeAndOptimizeRouteFromStation:a.analyzeAndOptimizeRouteFromStation}};export{J as useTaskMap};
