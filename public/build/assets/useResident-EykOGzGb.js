import{r as s,a as b}from"./app-B7J0SWTz.js";import{a as l}from"./mapbox-gl-BWmm1S5w.js";var u={};const O=({mapboxKey:f,barangayId:a})=>{const p=s.useRef(null),n=s.useRef(null),[v,S]=s.useState(!1),[m,L]=s.useState(!1),[k,h]=s.useState(null),[i,M]=s.useState(null),[w,_]=s.useState(null),[d,g]=s.useState([]),[y,C]=s.useState([]),[R,U]=s.useState(!0),[T,E]=s.useState(!1);s.useEffect(()=>{if(a)return window.Echo=new Echo({broadcaster:"reverb",key:u.NEXT_PUBLIC_REVERB_APP_KEY,wsHost:u.NEXT_PUBLIC_REVERB_HOST,wsPort:u.NEXT_PUBLIC_REVERB_PORT,wssPort:u.NEXT_PUBLIC_REVERB_PORT,forceTLS:!1,enabledTransports:["ws","wss"]}),window.Echo.channel(`driver-locations.${a}`).listen("DriverLocationUpdated",e=>{console.log("Driver location update received:",e),$(e)}),window.Echo.channel(`schedule-updates.${a}`).listen("ScheduleStatusUpdated",e=>{console.log("Schedule update received:",e),P(e)}),()=>{window.Echo&&(window.Echo.leave(`driver-locations.${a}`),window.Echo.leave(`schedule-updates.${a}`))}},[a]);const $=e=>{const t=[e.longitude,e.latitude];M(t),B(t,e),n.current&&!n.current.hasUserInteracted()&&n.current.flyTo({center:t,zoom:15,duration:1e3})},B=(e,t)=>{if(!n.current)return;w&&w.remove();const r=document.createElement("div");r.className="driver-location-marker",r.innerHTML=`
      <div class="relative">
        <div class="w-8 h-8 bg-blue-600 border-2 border-white rounded-full shadow-lg z-50 flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping"></div>
        <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Driver • ${t.accuracy?`Acc: ${Math.round(t.accuracy)}m`:"Live"}
        </div>
      </div>
    `;const o=new l.Marker({element:r,draggable:!1}).setLngLat(e).addTo(n.current);_(o)},P=e=>{h(e.schedule),e.schedule.sites&&(g(e.schedule.sites),z(e.schedule.sites))},z=e=>{y.forEach(r=>r.remove());const t=e.map(r=>{if(!r.longitude||!r.latitude)return null;const o=document.createElement("div");o.className="site-marker";const c=r.status==="completed",x=r.status==="in_progress";return o.innerHTML=`
        <div class="relative">
          <div class="w-10 h-10 rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white ${x?"ring-4 ring-yellow-500 ring-opacity-70":""} ${c?"opacity-50 grayscale":""}" 
               style="border-color: ${c?"#10B981":"#EF4444"};">
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold ${c?"text-green-600":"text-red-600"}">
                ${c?"✓":"🗑️"}
              </span>
            </div>
          </div>
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            ${r.site_name} ${c?"• Completed":x?"• Current":""}
          </div>
        </div>
      `,new l.Marker({element:o,draggable:!1}).setLngLat([parseFloat(r.longitude),parseFloat(r.latitude)]).addTo(n.current)}).filter(r=>r!==null);C(t)};return s.useEffect(()=>{(async()=>{if(a){E(!0);try{const t=await b.get(`/barangay/${a}/current-schedule`);if(t.data.success&&(h(t.data.data),t.data.data.id)){const r=await b.get(`/schedule/${t.data.data.id}/sites`);r.data.success&&g(r.data.data)}}catch(t){console.error("Error loading initial data:",t)}finally{E(!1)}}})()},[a]),s.useEffect(()=>{(()=>{const t=document.createElement("link");t.href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css",t.rel="stylesheet",t.onload=()=>S(!0),document.head.appendChild(t)})()},[]),s.useEffect(()=>{if(!(!v||!f||n.current||!p.current)){try{l.accessToken=f,n.current=new l.Map({container:p.current,style:"mapbox://styles/mapbox/light-v11",center:[125.94849837776422,8.483022468128098],zoom:12,attributionControl:!1}),n.current.on("load",()=>{L(!0),console.log("Resident map loaded")}),n.current.on("error",e=>{console.error("Map error:",e)})}catch(e){console.error("Error creating map:",e)}return()=>{n.current&&(n.current.remove(),n.current=null)}}},[f,v]),s.useEffect(()=>{if(!n.current||!m||d.length===0)return;const e=new l.LngLatBounds;d.forEach(t=>{t.longitude&&t.latitude&&e.extend([parseFloat(t.longitude),parseFloat(t.latitude)])}),i&&e.extend(i),e.isEmpty()||n.current.fitBounds(e,{padding:50,duration:1e3})},[m,d,i]),{mapContainer:p,currentSchedule:k,driverLocation:i,siteLocations:d,loading:T,isOnline:R,mapInitialized:m}};export{O as useResidentMap};
