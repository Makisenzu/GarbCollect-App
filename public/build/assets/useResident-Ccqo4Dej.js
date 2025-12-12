import{r as s,a as S}from"./app-BOwIOK84.js";import{a as l}from"./mapbox-gl-CcLdEyCe.js";var u={};const j=({mapboxKey:f,barangayId:o})=>{const p=s.useRef(null),n=s.useRef(null),[w,L]=s.useState(!1),[m,_]=s.useState(!1),[k,v]=s.useState(null),[d,M]=s.useState(null),[E,C]=s.useState(null),[a,h]=s.useState([]),[$,R]=s.useState([]),[T,N]=s.useState(!0),[y,g]=s.useState(!1);s.useEffect(()=>{if(o)return window.Echo=new Echo({broadcaster:"reverb",key:u.NEXT_PUBLIC_REVERB_APP_KEY,wsHost:u.NEXT_PUBLIC_REVERB_HOST,wsPort:u.NEXT_PUBLIC_REVERB_PORT,wssPort:u.NEXT_PUBLIC_REVERB_PORT,forceTLS:!1,enabledTransports:["ws","wss"]}),window.Echo.channel(`driver-locations.${o}`).listen("DriverLocationUpdated",e=>{B(e)}),window.Echo.channel(`schedule-updates.${o}`).listen("ScheduleStatusUpdated",e=>{U(e)}),window.Echo.channel(`site-completion.${o}`).listen("SiteCompletionUpdated",e=>{z(e)}),()=>{window.Echo&&(window.Echo.leave(`driver-locations.${o}`),window.Echo.leave(`schedule-updates.${o}`),window.Echo.leave(`site-completion.${o}`))}},[o]);const B=e=>{const t=[e.longitude,e.latitude];M(t),P(t,e),n.current&&!n.current.hasUserInteracted()&&n.current.flyTo({center:t,zoom:15,duration:1e3})},P=(e,t)=>{if(!n.current)return;E&&E.remove();const r=document.createElement("div");r.className="driver-location-marker",r.innerHTML=`
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
    `;const i=new l.Marker({element:r,draggable:!1}).setLngLat(e).addTo(n.current);C(i)},U=e=>{v(e.schedule),e.schedule.sites&&(h(e.schedule.sites),x(e.schedule.sites))},z=e=>{h(t=>t.map(r=>r.id===e.site_id?{...r,status:"finished",completed_at:e.completed_at}:r)),x(a.map(t=>t.id===e.site_id?{...t,status:"finished",completed_at:e.completed_at}:t))},x=e=>{$.forEach(r=>r.remove());const t=e.map(r=>{if(!r.longitude||!r.latitude)return null;const i=document.createElement("div");i.className="site-marker";const c=r.status==="finished",b=r.status==="in_progress";return i.innerHTML=`
        <div class="relative">
          <div class="w-10 h-10 rounded-full border-3 flex items-center justify-center overflow-hidden shadow-lg bg-white ${b?"ring-4 ring-yellow-500 ring-opacity-70":""} ${c?"opacity-50 grayscale":""}" 
               style="border-color: ${c?"#10B981":"#EF4444"};">
            <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold ${c?"text-green-600":"text-red-600"}">
                ${c?"✓":"🗑️"}
              </span>
            </div>
          </div>
          <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            ${r.site_name} ${c?"• Completed":b?"• Current":""}
          </div>
        </div>
      `,new l.Marker({element:i,draggable:!1}).setLngLat([parseFloat(r.longitude),parseFloat(r.latitude)]).addTo(n.current)}).filter(r=>r!==null);R(t)};return s.useEffect(()=>{(async()=>{if(o){g(!0);try{const t=await S.get(`/barangay/${o}/current-schedule`);if(t.data.success&&(v(t.data.data),t.data.data.id)){const r=await S.get(`/schedule/${t.data.data.id}/sites`);r.data.success&&h(r.data.data)}}catch(t){console.error("Error loading initial data:",t)}finally{g(!1)}}})()},[o]),s.useEffect(()=>{(()=>{const t=document.createElement("link");t.href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css",t.rel="stylesheet",t.onload=()=>L(!0),document.head.appendChild(t)})()},[]),s.useEffect(()=>{if(!(!w||!f||n.current||!p.current)){try{l.accessToken=f,n.current=new l.Map({container:p.current,style:"mapbox://styles/mapbox/light-v11",center:[125.94849837776422,8.483022468128098],zoom:12,attributionControl:!1}),n.current.on("load",()=>{_(!0)}),n.current.on("error",e=>{console.error("Map error:",e)})}catch(e){console.error("Error creating map:",e)}return()=>{n.current&&(n.current.remove(),n.current=null)}}},[f,w]),s.useEffect(()=>{if(!n.current||!m||a.length===0)return;const e=new l.LngLatBounds;a.forEach(t=>{t.longitude&&t.latitude&&e.extend([parseFloat(t.longitude),parseFloat(t.latitude)])}),d&&e.extend(d),e.isEmpty()||n.current.fitBounds(e,{padding:50,duration:1e3})},[m,a,d]),{mapContainer:p,currentSchedule:k,driverLocation:d,siteLocations:a,loading:y,isOnline:T,mapInitialized:m}};export{j as useResidentMap};
