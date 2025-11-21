import{r as s,a as b}from"./app-DLSmQTXx.js";import{a as c}from"./mapbox-gl-C6ti8z5N.js";var u={};const O=({mapboxKey:p,barangayId:n})=>{const f=s.useRef(null),o=s.useRef(null),[v,L]=s.useState(!1),[m,_]=s.useState(!1),[k,w]=s.useState(null),[d,M]=s.useState(null),[g,C]=s.useState(null),[a,h]=s.useState([]),[$,R]=s.useState([]),[T,N]=s.useState(!0),[y,E]=s.useState(!1);s.useEffect(()=>{if(n)return window.Echo=new Echo({broadcaster:"reverb",key:u.NEXT_PUBLIC_REVERB_APP_KEY,wsHost:u.NEXT_PUBLIC_REVERB_HOST,wsPort:u.NEXT_PUBLIC_REVERB_PORT,wssPort:u.NEXT_PUBLIC_REVERB_PORT,forceTLS:!1,enabledTransports:["ws","wss"]}),window.Echo.channel(`driver-locations.${n}`).listen("DriverLocationUpdated",e=>{console.log("Driver location update received:",e),B(e)}),window.Echo.channel(`schedule-updates.${n}`).listen("ScheduleStatusUpdated",e=>{console.log("Schedule update received:",e),U(e)}),window.Echo.channel(`site-completion.${n}`).listen("SiteCompletionUpdated",e=>{console.log("Site completion update received:",e),z(e)}),()=>{window.Echo&&(window.Echo.leave(`driver-locations.${n}`),window.Echo.leave(`schedule-updates.${n}`),window.Echo.leave(`site-completion.${n}`))}},[n]);const B=e=>{const t=[e.longitude,e.latitude];M(t),P(t,e),o.current&&!o.current.hasUserInteracted()&&o.current.flyTo({center:t,zoom:15,duration:1e3})},P=(e,t)=>{if(!o.current)return;g&&g.remove();const r=document.createElement("div");r.className="driver-location-marker",r.innerHTML=`
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
    `;const i=new c.Marker({element:r,draggable:!1}).setLngLat(e).addTo(o.current);C(i)},U=e=>{w(e.schedule),e.schedule.sites&&(h(e.schedule.sites),x(e.schedule.sites))},z=e=>{console.log("Handling site completion:",e),h(t=>t.map(r=>r.id===e.site_id?{...r,status:"finished",completed_at:e.completed_at}:r)),x(a.map(t=>t.id===e.site_id?{...t,status:"finished",completed_at:e.completed_at}:t))},x=e=>{$.forEach(r=>r.remove());const t=e.map(r=>{if(!r.longitude||!r.latitude)return null;const i=document.createElement("div");i.className="site-marker";const l=r.status==="finished",S=r.status==="in_progress";return i.innerHTML=`
        <div class="relative">
          <div class="w-10 h-10 rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white ${S?"ring-4 ring-yellow-500 ring-opacity-70":""} ${l?"opacity-50 grayscale":""}" 
               style="border-color: ${l?"#10B981":"#EF4444"};">
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold ${l?"text-green-600":"text-red-600"}">
                ${l?"✓":"🗑️"}
              </span>
            </div>
          </div>
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            ${r.site_name} ${l?"• Completed":S?"• Current":""}
          </div>
        </div>
      `,new c.Marker({element:i,draggable:!1}).setLngLat([parseFloat(r.longitude),parseFloat(r.latitude)]).addTo(o.current)}).filter(r=>r!==null);R(t)};return s.useEffect(()=>{(async()=>{if(n){E(!0);try{const t=await b.get(`/barangay/${n}/current-schedule`);if(t.data.success&&(w(t.data.data),t.data.data.id)){const r=await b.get(`/schedule/${t.data.data.id}/sites`);r.data.success&&h(r.data.data)}}catch(t){console.error("Error loading initial data:",t)}finally{E(!1)}}})()},[n]),s.useEffect(()=>{(()=>{const t=document.createElement("link");t.href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css",t.rel="stylesheet",t.onload=()=>L(!0),document.head.appendChild(t)})()},[]),s.useEffect(()=>{if(!(!v||!p||o.current||!f.current)){try{c.accessToken=p,o.current=new c.Map({container:f.current,style:"mapbox://styles/mapbox/light-v11",center:[125.94849837776422,8.483022468128098],zoom:12,attributionControl:!1}),o.current.on("load",()=>{_(!0),console.log("Resident map loaded")}),o.current.on("error",e=>{console.error("Map error:",e)})}catch(e){console.error("Error creating map:",e)}return()=>{o.current&&(o.current.remove(),o.current=null)}}},[p,v]),s.useEffect(()=>{if(!o.current||!m||a.length===0)return;const e=new c.LngLatBounds;a.forEach(t=>{t.longitude&&t.latitude&&e.extend([parseFloat(t.longitude),parseFloat(t.latitude)])}),d&&e.extend(d),e.isEmpty()||o.current.fitBounds(e,{padding:50,duration:1e3})},[m,a,d]),{mapContainer:f,currentSchedule:k,driverLocation:d,siteLocations:a,loading:y,isOnline:T,mapInitialized:m}};export{O as useResidentMap};
