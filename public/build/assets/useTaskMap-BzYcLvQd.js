import{r}from"./app-BKte-XQA.js";import{useLocationTracking as M}from"./useLocationTracking-D8gVtghM.js";import{useMapboxSetup as E}from"./useMapboxSetup-DLX6aW9m.js";import{useMapLayers as U}from"./useMapLayers-GarP5CWL.js";import{useRouteCalculations as F}from"./useRouteCalculations-Cts2tn2V.js";import{useSiteManagement as D}from"./useSiteManagement--CPT1DSY.js";import"./mapbox-gl-DLY2XY4C.js";import"./index-DAg5LBQ8.js";import"./iconBase-DxYAxspi.js";import"./can-3MqaZyCZ.js";const j=({mapboxKey:S,scheduleId:m,onTaskComplete:f,onTaskCancel:w})=>{const[l,k]=r.useState(!1),[R,g]=r.useState(!1),[T,h]=r.useState(!0),[y,v]=r.useState(navigator.onLine),[x,b]=r.useState(!1),n=E({mapboxKey:S,isMobile:l}),i=F({mapboxKey:S,isOnline:y,activeSchedule:null,optimizedSiteOrder:[],completedSites:new Set,siteLocations:[],currentLocation:null,routeCoordinates:[],routeInfo:null,map:n.map,isMobile:l,addRouteLayer:()=>{}}),t=D({scheduleId:m,onTaskComplete:(o,e=!1)=>{e&&b(!0),f&&f(o,e)},onTaskCancel:w,calculateDistance:i.calculateDistance,showCompletionNotification:o=>{console.log(`✅ Site completed: ${o}`);try{const e=new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLaiTUIGGe77OmfTgwOUKbk8LdjHQU2kdby0HwqBSp3x/DdkUELEl+06OyqVRUKRp7g8r5wIgU0h9H004IzBh1tv+/mnEkODlat6O+xXBkIP5Xa8sV0KgUrgc7y2YszCBdnvOzpnk4MDU+m5O+5ZBwGNpHX8s98Kgcrc8fv3ZJCCxFftOjuq1YUDD6f4fK/cCMGNYfR89OCMwYcbb/v5JxKDg5VrOjusVwZCj6U2vLGdSoGK4HO8tmLMwgXZ7vs6J5PDA1Ppubw...");e.volume=.4,e.play().catch(()=>{})}catch{}if(l){const e=document.createElement("div");e.className="fixed top-20 left-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl z-[9999] transform transition-all duration-500",e.style.animation="slideInDown 0.5s ease-out",e.innerHTML=`
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
        `,document.head.appendChild(e)}},updateSiteMarkers:()=>{},recalculateRouteFromCurrentPosition:i.recalculateRouteFromCurrentPosition,currentLocation:null}),s=U({map:n.map,isMobile:l,activeSchedule:t.activeSchedule,completedSites:t.completedSites,optimizedSiteOrder:t.optimizedSiteOrder,currentSiteIndex:t.currentSiteIndex,nearestSiteToStation:t.nearestSiteToStation,routeCoordinates:i.routeCoordinates,routeInfo:i.routeInfo,currentLocation:null,isTaskActive:t.isTaskActive,siteLocations:t.siteLocations,stationLocation:t.stationLocation}),a=M({scheduleId:m,activeSchedule:t.activeSchedule,siteLocations:t.siteLocations,completedSites:t.completedSites,optimizedSiteOrder:t.optimizedSiteOrder,currentSiteIndex:t.currentSiteIndex,isTaskActive:t.isTaskActive,onTaskComplete:f,map:n.map,isMobile:l,currentLocation:null,routeCoordinates:i.routeCoordinates,routeInfo:i.routeInfo,smoothUpdateUserLocation:s.smoothUpdateUserLocation,checkSiteProximity:t.checkSiteProximity,recalculateRouteFromCurrentPosition:i.recalculateRouteFromCurrentPosition,shouldRecalculateRoute:i.shouldRecalculateRoute,updateUserLocationSource:s.updateUserLocationSource,animatePulse:s.animatePulse,clearUserLocationLayers:s.clearUserLocationLayers,updateCurrentLocationMarker:s.updateCurrentLocationMarker,handleLocationError:o=>{let e="Location tracking error: ";switch(o.code){case o.PERMISSION_DENIED:e+="Location access denied. Please enable location permissions.";break;case o.POSITION_UNAVAILABLE:e+="Location unavailable. Using last known position.";break;case o.TIMEOUT:e+="Location request timeout. Retrying...",setTimeout(a.startRealtimeLocationTracking,5e3);break;default:e+="Unknown location error.";break}console.warn(e)},sendLocationToReverb:async(o,e,d=null)=>{var p;if(!m){console.error("No schedule ID available");return}try{const c=((p=t.activeSchedule)==null?void 0:p.barangay_id)||"unknown";(await axios.post("/driver/location/update",{latitude:o,longitude:e,accuracy:d,schedule_id:m,barangay_id:c,timestamp:new Date().toISOString()})).data.success&&console.log("Location successfully sent to backend")}catch(c){throw console.error("Failed to send location to backend:",c),c}}});r.useEffect(()=>{const o=()=>{const e=window.innerWidth<768;k(e),e&&(g(!1),h(!0))};return o(),window.addEventListener("resize",o),()=>window.removeEventListener("resize",o)},[]),r.useEffect(()=>{const o=()=>{v(!0),console.log("Connection restored")},e=()=>{v(!1),console.log("Connection lost - switching to offline mode")};return window.addEventListener("online",o),window.addEventListener("offline",e),()=>{window.removeEventListener("online",o),window.removeEventListener("offline",e)}},[]),r.useEffect(()=>{const o=n.initializeMap(()=>{a.startRealtimeLocationTracking()});return()=>{a.stopRealtimeLocationTracking(),a.stopFakeLocationTest(),s.clearUserLocationLayers(),o&&o()}},[n.cssLoaded]),r.useEffect(()=>{n.mapInitialized&&n.customStyleLoaded&&t.siteLocations.length>0&&(s.clearSiteMarkers(),s.addSiteMarkers(),i.routeCoordinates.length>0&&setTimeout(()=>{s.addRouteLayer()},300))},[n.mapInitialized,n.customStyleLoaded,t.siteLocations,i.routeCoordinates,t.optimizedSiteOrder,t.nearestSiteToStation,t.completedSites]),r.useEffect(()=>{a.currentLocation&&t.siteLocations.length>0&&n.mapInitialized&&(console.log("All data available, calculating sequential route through all sites"),(async()=>{const e=await i.analyzeAndOptimizeRouteFromCurrentLocation(a.currentLocation,t.siteLocations);e&&(i.setRouteCoordinates(e.route),i.setRouteInfo({duration:e.duration,distance:e.distance,formattedDuration:e.formattedDuration}),setTimeout(()=>{n.map.current&&e.route.length>0&&s.addRouteLayer()},300))})())},[a.currentLocation,t.siteLocations,n.mapInitialized]);const A=()=>{navigator.geolocation?(t.setLoading(!0),navigator.geolocation.getCurrentPosition(async o=>{var L;const{latitude:e,longitude:d,accuracy:p}=o.coords,c=[d,e];if(a.setCurrentLocation(c),a.setLocationAccuracy(p),a.setLastLocationUpdate(new Date),s.smoothUpdateUserLocation(e,d),t.siteLocations.length>0){const u=await i.analyzeAndOptimizeRouteFromCurrentLocation(c,t.siteLocations);u&&(i.setRouteCoordinates(u.route),i.setRouteInfo({duration:u.duration,distance:u.distance,formattedDuration:u.formattedDuration,toSite:(L=u.nearestSite)==null?void 0:L.site_name}),setTimeout(()=>{n.map.current&&u.route.length>0&&s.addRouteLayer()},500))}n.map.current&&n.map.current.flyTo({center:c,zoom:l?15:14,essential:!0,duration:1500}),t.setLoading(!1)},o=>{console.error("Error getting location:",o),t.setLoading(!1),a.handleLocationError(o)},{enableHighAccuracy:!0,timeout:3e4,maximumAge:0})):alert("Geolocation is not supported by your browser.")},C=()=>{if(!t.stationLocation){alert("No station found. Please check site configuration.");return}if(t.siteLocations.length===0){alert("No sites available for optimization.");return}i.analyzeAndOptimizeRouteFromStation(t.stationLocation,t.siteLocations)},I=(o,e)=>{const d=[e,o];a.setCurrentLocation(d),s.smoothUpdateUserLocation(o,e),t.nearestSiteToStation&&i.calculateRouteToNearestSiteFromStation(d,t.nearestSiteToStation)},z=()=>{s.fitMapToRouteAndDriver(i.getNextUncompletedSiteIndex,t.optimizedSiteOrder)},O=()=>{s.fitMapToRoute()};return{mapContainer:n.mapContainer,siteMarkersRef:s.siteMarkersRef,cssLoaded:n.cssLoaded,siteLocations:t.siteLocations,stationLocation:t.stationLocation,mapInitialized:n.mapInitialized,activeSchedule:t.activeSchedule,routeCoordinates:i.routeCoordinates,loading:t.loading,currentLocation:a.currentLocation,routeInfo:i.routeInfo,mapError:n.mapError,customStyleLoaded:n.customStyleLoaded,aiOptimizedRoute:i.aiOptimizedRoute,nearestSiteToStation:t.nearestSiteToStation,isMobile:l,showAIPanel:R,showControls:T,optimizedSiteOrder:t.optimizedSiteOrder,isOnline:y,locationAccuracy:a.locationAccuracy,lastLocationUpdate:a.lastLocationUpdate,completedSites:t.completedSites,currentSiteIndex:t.currentSiteIndex,isTaskActive:t.isTaskActive,isFakeLocationActive:a.isFakeLocationActive,allSiteRoutes:i.allSiteRoutes,showCompletionModal:x,setShowCompletionModal:b,formatDuration:i.formatDuration,getCurrentLocation:A,getAIOptimizedRoute:C,setShowAIPanel:g,setShowControls:h,startRealtimeLocationTracking:a.startRealtimeLocationTracking,stopRealtimeLocationTracking:a.stopRealtimeLocationTracking,updateLocationManually:I,resetCompletedSites:t.resetCompletedSites,markSiteAsCompleted:t.markSiteAsCompleted,startTaskAndBroadcast:t.startTaskAndBroadcast,completeTaskAndBroadcast:t.completeTaskAndBroadcast,sendLocationToReverb:a.sendLocationToReverb,startFakeLocationTest:a.startFakeLocationTest,stopFakeLocationTest:a.stopFakeLocationTest,sendTestLocation:a.sendTestLocation,simulateRouteFollowing:a.simulateRouteFollowing,fitMapToRouteAndDriver:z,fitMapToRoute:O,updateSiteMarkers:s.updateSiteMarkers,addRouteLayer:s.addRouteLayer,calculateRouteToNextSite:i.calculateRouteToNextSite,calculateOptimalRoute:i.calculateOptimalRoute,optimizeSiteOrder:i.optimizeSiteOrder,analyzeAndOptimizeRouteFromStation:i.analyzeAndOptimizeRouteFromStation}};export{j as useTaskMap};
