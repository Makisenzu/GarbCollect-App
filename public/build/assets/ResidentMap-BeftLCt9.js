import{j as e,r as c,i as Qe,g as ye,a as J}from"./app-Dq1yuLGv.js";import{a as L}from"./mapbox-gl-Dcx644xO.js";import{h as Ye,i as Ke,j as et,g as tt}from"./index-ChVC3_KP.js";import"./iconBase-D2mkTBiS.js";const at=({isLoading:v=!1,size:S="medium",message:E="Collecting garbage..."})=>{if(!v)return null;const b={small:"w-16 h-16",medium:"w-24 h-24",large:"w-32 h-32",xlarge:"w-48 h-48"},T={small:"text-xs",medium:"text-sm",large:"text-base",xlarge:"text-lg"};return e.jsxs("div",{className:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",children:[e.jsxs("div",{className:"bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center",children:[e.jsxs("div",{className:`relative ${b[S]} mb-4`,children:[e.jsx("div",{className:"absolute bottom-0 left-0 right-0 h-2 bg-gray-600 rounded-full"}),e.jsx("div",{className:"absolute bottom-3 left-4 w-3 h-4 bg-gray-400 rounded-sm",children:e.jsx("div",{className:"absolute -top-1 left-0.5 w-2 h-1 bg-gray-500 rounded-sm"})}),e.jsx("div",{className:"absolute bottom-3 left-8 w-3 h-5 bg-gray-400 rounded-sm",children:e.jsx("div",{className:"absolute -top-1 left-0.5 w-2 h-1 bg-gray-500 rounded-sm"})}),e.jsx("div",{className:"absolute bottom-3 left-12 w-3 h-4 bg-gray-400 rounded-sm",children:e.jsx("div",{className:"absolute -top-1 left-0.5 w-2 h-1 bg-gray-500 rounded-sm"})}),e.jsx("div",{className:"absolute bottom-2 left-0 animate-collect-garbage",children:e.jsxs("div",{className:"relative",children:[e.jsxs("div",{className:"w-6 h-4 bg-green-600 rounded-t-sm",children:[e.jsx("div",{className:"absolute top-0.5 left-1 w-3 h-1.5 bg-blue-300 rounded-sm"}),e.jsx("div",{className:"absolute bottom-0 left-1 w-1 h-0.5 bg-yellow-300 rounded-full"})]}),e.jsx("div",{className:"absolute left-6 top-1 w-8 h-3 bg-green-700 rounded-sm",children:e.jsx("div",{className:"absolute top-0.5 left-1 w-6 h-2 bg-gray-800 rounded",children:e.jsx("div",{className:"absolute -top-1 left-0 right-0 h-1 bg-gray-700 rounded-t animate-garbage-fill"})})}),e.jsx("div",{className:"absolute -bottom-1 left-1 w-2 h-2 bg-black rounded-full",children:e.jsx("div",{className:"absolute inset-0.5 w-1 h-1 bg-gray-600 rounded-full"})}),e.jsx("div",{className:"absolute -bottom-1 left-5 w-2 h-2 bg-black rounded-full",children:e.jsx("div",{className:"absolute inset-0.5 w-1 h-1 bg-gray-600 rounded-full"})}),e.jsx("div",{className:"absolute -bottom-1 left-11 w-2 h-2 bg-black rounded-full",children:e.jsx("div",{className:"absolute inset-0.5 w-1 h-1 bg-gray-600 rounded-full"})})]})}),e.jsx("div",{className:"absolute bottom-3 left-16 w-4 h-1 bg-gray-400 rounded-full animate-dust-cloud opacity-0"})]}),e.jsx("div",{className:`text-center ${T[S]} text-gray-700 font-semibold`,children:E}),e.jsxs("div",{className:"flex space-x-1 mt-2",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full animate-bounce",style:{animationDelay:"0ms"}}),e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full animate-bounce",style:{animationDelay:"150ms"}}),e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full animate-bounce",style:{animationDelay:"300ms"}})]})]}),e.jsx("style",{jsx:!0,children:`
        @keyframes collect-garbage {
          0% {
            transform: translateX(-20px);
          }
          20% {
            transform: translateX(40px);
          }
          40% {
            transform: translateX(80px);
          }
          60% {
            transform: translateX(120px);
          }
          80% {
            transform: translateX(160px);
          }
          100% {
            transform: translateX(200px);
          }
        }
        
        @keyframes garbage-fill {
          0%, 20% {
            height: 0px;
            opacity: 0;
          }
          25% {
            height: 1px;
            opacity: 1;
          }
          40% {
            height: 2px;
            opacity: 1;
          }
          60% {
            height: 3px;
            opacity: 1;
          }
          80% {
            height: 4px;
            opacity: 1;
          }
          100% {
            height: 4px;
            opacity: 0;
          }
        }
        
        @keyframes dust-cloud {
          0%, 60% {
            opacity: 0;
            transform: scale(0.5);
          }
          70% {
            opacity: 0.8;
            transform: scale(1);
          }
          80% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          90% {
            opacity: 0.4;
            transform: scale(1.4);
          }
          100% {
            opacity: 0;
            transform: scale(1.6);
          }
        }
        
        .animate-collect-garbage {
          animation: collect-garbage 4s ease-in-out infinite;
        }
        
        .animate-garbage-fill {
          animation: garbage-fill 4s ease-in-out infinite;
        }
        
        .animate-dust-cloud {
          animation: dust-cloud 4s ease-in-out infinite;
        }
      `})]})},Q={Alegria:"#FF5733","Barangay 1":"#33FF57","Barangay 2":"#3357FF","Barangay 3":"#F033FF","Barangay 4":"#FF33F0","Barangay 5":"#33FFF0","Bayugan 2":"#8A2BE2","Bitan-agan":"#A52A2A",Borbon:"#DEB887",Buenasuerte:"#5F9EA0",Caimpugan:"#7FFF00","Das-agan":"#D2691E",Ebro:"#FF7F50",Hubang:"#6495ED",Karaus:"#DC143C",Ladgadan:"#00FFFF",Lapinigan:"#00008B",Lucac:"#008B8B",Mate:"#B8860B","New Visayas":"#006400",Ormaca:"#8B008B",Pasta:"#556B2F","Pisa-an":"#FF8C00",Rizal:"#9932CC","San Isidro":"#8FBC8F","Santa Ana":"#483D8B",Tagapua:"#2F4F4F","San Francisco":"#FFE659",_default:"#4F262A"},mt=({mapboxKey:v,barangayId:S,scheduleId:E,isFullscreen:b=!1})=>{const T=c.useRef(null),i=c.useRef(null),[_,U]=c.useState(!1),[h,z]=c.useState(!1),[C,ie]=c.useState(null),[f,we]=c.useState(null),[le,je]=c.useState(null),[y,ce]=c.useState([]),[Y,Se]=c.useState([]),[rt,st]=c.useState(!0),[ot,de]=c.useState(!0),[P,K]=c.useState("connecting"),[ue,I]=c.useState(null),[H,Ne]=c.useState(!1),[$e,me]=c.useState(!1),[ke,Fe]=c.useState("Loading map data..."),O=(a="Loading map data...")=>{Fe(a),me(!0)},R=()=>{me(!1)},[N,q]=c.useState([]),[d,G]=c.useState(null),[k,Me]=c.useState([]),[F,Le]=c.useState(null),[w,Ee]=c.useState(null),[o,Re]=c.useState(!1),[A,ge]=c.useState(!0),[ee,pe]=c.useState(!1),[fe,te]=c.useState(null),[j,nt]=c.useState(!0),B=c.useRef(null),ae=c.useRef(null),[Te,Ce]=c.useState(Date.now()),Be=()=>Date.now()-Te<3e4,[he,ze]=c.useState({width:typeof window<"u"?window.innerWidth:1200,height:typeof window<"u"?window.innerHeight:800});c.useEffect(()=>{if(!i.current)return;const a=["mousedown","touchstart","wheel","movestart","dragstart"],r=()=>{Ce(Date.now())};return a.forEach(t=>{i.current.on(t,r)}),()=>{a.forEach(t=>{i.current&&i.current.off(t,r)})}},[i.current]),c.useEffect(()=>{const a=()=>{const r=window.innerWidth<768;Re(r),ze({width:window.innerWidth,height:window.innerHeight}),r&&ge(!1)};return a(),window.addEventListener("resize",a),()=>window.removeEventListener("resize",a)},[]),c.useEffect(()=>{v&&(console.log("Setting Mapbox access token"),L.accessToken=v)},[v]),c.useEffect(()=>{const a=()=>{T.current?(console.log("Map container is ready in DOM"),Ne(!0)):(console.log("Waiting for map container..."),setTimeout(a,100))};a()},[]),c.useEffect(()=>{if((()=>{const l=document.querySelector('link[href*="mapbox-gl.css"]');return l&&l.sheet?(console.log("Mapbox CSS already loaded"),U(!0),!0):!1})())return;const r=document.createElement("link");r.href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css",r.rel="stylesheet",r.type="text/css";let t;const n=()=>{clearTimeout(t),console.log("Mapbox CSS loaded successfully"),U(!0)},s=()=>{clearTimeout(t),console.warn("Mapbox CSS failed to load, continuing anyway"),U(!0)};r.onload=n,r.onerror=s,document.head.appendChild(r),t=setTimeout(()=>{console.warn("Mapbox CSS load timeout, continuing anyway"),U(!0)},5e3)},[]);const re=a=>{if(a<60)return`${a} min`;{const r=Math.floor(a/60),t=a%60;return t===0?`${r}h`:`${r}h ${t}min`}},X=(a,r,t,n)=>{const l=(t-a)*Math.PI/180,m=(n-r)*Math.PI/180,p=Math.sin(l/2)*Math.sin(l/2)+Math.cos(a*Math.PI/180)*Math.cos(t*Math.PI/180)*Math.sin(m/2)*Math.sin(m/2);return 6371*(2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p)))},Ae=(a,r)=>{if(!a||r.length===0)return r;const t=[...r],n=[],s=t.map(g=>{const u=X(parseFloat(a.latitude),parseFloat(a.longitude),parseFloat(g.latitude),parseFloat(g.longitude));return{...g,distance:u,coordinates:[parseFloat(g.longitude),parseFloat(g.latitude)]}});s.sort((g,u)=>g.distance-u.distance);const l=s[0];n.push(l);const m=s.slice(1);let p=l;for(;m.length>0;){let g=-1,u=1/0;for(let x=0;x<m.length;x++){const $=X(parseFloat(p.latitude),parseFloat(p.longitude),parseFloat(m[x].latitude),parseFloat(m[x].longitude));$<u&&(u=$,g=x)}g!==-1&&(p=m[g],n.push(p),m.splice(g,1))}return n},xe=async(a,r,t=!1)=>{if(!(!v||a.length<1)){pe(!0),O("Calculating optimal route..."),te(null);try{const n=a.filter(u=>u.latitude&&u.longitude&&!isNaN(parseFloat(u.latitude))&&!isNaN(parseFloat(u.longitude)));if(n.length<1){console.warn("No valid sites with coordinates found"),te("No valid sites with coordinates found");return}const s=r?Ae(r,n.filter(u=>u.type!=="station")):n;if(Me(s),s.length>0&&Le(s[0]),t&&f&&s.length>0){const u=[`${f[0].toFixed(6)},${f[1].toFixed(6)}`,...s.map(x=>`${parseFloat(x.longitude).toFixed(6)},${parseFloat(x.latitude).toFixed(6)}`)];try{const x=await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${u.join(";")}?access_token=${v}&geometries=geojson&overview=full&steps=true&alternatives=false&continue_straight=false&roundabout_exits=true`);if(x.ok){const $=await x.json();if($.routes&&$.routes.length>0){const D=$.routes[0],Z=Math.round(D.duration/60),W=(D.distance/1e3).toFixed(1);q(D.geometry.coordinates),G({duration:Z,formattedDuration:re(Z),distance:W,targetSite:s[0].site_name,isRealTime:!0,totalStops:s.length}),console.log(`Complete sequential route calculated from driver through ${s.length} sites`),i.current&&h&&M();return}}}catch(x){console.error("Error calculating driver sequential route:",x)}}let l=[];r?l=[`${parseFloat(r.longitude).toFixed(6)},${parseFloat(r.latitude).toFixed(6)}`,...s.map(u=>`${parseFloat(u.longitude).toFixed(6)},${parseFloat(u.latitude).toFixed(6)}`)]:l=s.map(u=>`${parseFloat(u.longitude).toFixed(6)},${parseFloat(u.latitude).toFixed(6)}`);const m=l.length>2,p=await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${l.join(";")}?access_token=${v}&geometries=geojson&overview=full&steps=true&alternatives=false&continue_straight=false`+(m?"&roundabout_exits=true":""));if(!p.ok)throw new Error(`HTTP error! status: ${p.status}`);const g=await p.json();if(g.routes&&g.routes.length>0){const u=g.routes[0];if(u.geometry&&u.geometry.coordinates){const x=Math.round(u.duration/60),$=(u.distance/1e3).toFixed(1);q(u.geometry.coordinates),G({duration:x,formattedDuration:re(x),distance:$,rawData:u,totalStops:s.length,isRealTime:!1}),console.log(`Station route calculated: ${x}min, ${$}km`),i.current&&h&&M()}else throw new Error("Invalid route geometry received")}else throw new Error(g.message||"No routes found")}catch(n){console.error("Error calculating route:",n),te(`Route calculation failed: ${n.message}`);const s=a.filter(l=>l.latitude&&l.longitude&&!isNaN(parseFloat(l.latitude))&&!isNaN(parseFloat(l.longitude)));if(s.length>0){const l=s.map(m=>[parseFloat(m.longitude),parseFloat(m.latitude)]);q(l),G({duration:Math.round(be(l)*2),formattedDuration:"Estimated",distance:be(l).toFixed(1),isFallback:!0,totalStops:s.length,isRealTime:!1}),i.current&&h&&M()}}finally{pe(!1),R()}}},be=a=>{let r=0;for(let t=1;t<a.length;t++){const[n,s]=a[t-1],[l,m]=a[t];r+=X(s,n,m,l)}return r},V=async()=>{if(!(!j||!f||!k.length)){if(ae.current){const[a,r]=ae.current,[t,n]=f;if(X(r,a,n,t)*1e3<50)return}ae.current=f,console.log("Updating complete sequential route from driver location through all sites");try{const a=[`${f[0].toFixed(6)},${f[1].toFixed(6)}`,...k.map(t=>`${parseFloat(t.longitude).toFixed(6)},${parseFloat(t.latitude).toFixed(6)}`)],r=await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${a.join(";")}?access_token=${v}&geometries=geojson&overview=full&steps=true&alternatives=false&continue_straight=false&roundabout_exits=true`);if(r.ok){const t=await r.json();if(t.routes&&t.routes.length>0){const n=t.routes[0],s=Math.round(n.duration/60),l=(n.distance/1e3).toFixed(1);q(n.geometry.coordinates),G(m=>({...m,duration:s,formattedDuration:re(s),distance:l,targetSite:k[0].site_name,isRealTime:!0,totalStops:k.length,lastUpdated:new Date().toLocaleTimeString()})),console.log(`Sequential route updated: Driver through ${k.length} sites (${l}km, ${s}min)`),i.current&&h&&M()}}}catch(a){console.error("Error updating real-time route:",a)}}},De=()=>{B.current&&clearInterval(B.current),B.current=setInterval(()=>{j&&f&&k.length>0&&V()},2e3),console.log("Started real-time route updates")},_e=()=>{B.current&&(clearInterval(B.current),B.current=null),console.log("Stopped real-time route updates")},M=()=>{if(!(!i.current||N.length===0)){if(!i.current.isStyleLoaded()){i.current.once("styledata",()=>{setTimeout(M,100)});return}["route","route-glow","route-direction","route-start","route-end","route-waypoints","driver-route","driver-route-glow"].forEach(a=>{i.current.getLayer(a)&&i.current.removeLayer(a)}),i.current.getSource("route")&&i.current.removeSource("route"),i.current.getSource("driver-route")&&i.current.removeSource("driver-route"),["route-start-marker","route-end-marker","route-waypoints-marker"].forEach(a=>{i.current.getSource(a)&&i.current.removeSource(a)});try{const a=d!=null&&d.isRealTime?"driver-route":"route",r=d!=null&&d.isRealTime?"driver-route":"route",t=d!=null&&d.isRealTime?"driver-route-glow":"route-glow";i.current.addSource(a,{type:"geojson",data:{type:"Feature",properties:{},geometry:{type:"LineString",coordinates:N}}});const n=(C==null?void 0:C.barangay_name)||"San Francisco",s=d!=null&&d.isRealTime?"#10B981":Q[n]||Q._default,l=o?6:5,m=o?14:12;i.current.addLayer({id:t,type:"line",source:a,layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":s,"line-width":m,"line-opacity":d!=null&&d.isRealTime?.4:.3,"line-blur":10}}),i.current.addLayer({id:r,type:"line",source:a,layout:{"line-join":"round","line-cap":"round"},paint:{"line-color":s,"line-width":l,"line-opacity":.9,"line-dasharray":d!=null&&d.isRealTime?[2,1]:[1,0]}}),i.current.addLayer({id:"route-direction",type:"symbol",source:a,layout:{"symbol-placement":"line","text-field":"▶","text-size":o?14:12,"symbol-spacing":100},paint:{"text-color":s}});const p=[];w&&w.latitude&&w.longitude&&!(d!=null&&d.isRealTime)&&p.push({coordinates:[parseFloat(w.longitude),parseFloat(w.latitude)],type:"station",sequence:0}),k.forEach((g,u)=>{g.latitude&&g.longitude&&p.push({coordinates:[parseFloat(g.longitude),parseFloat(g.latitude)],type:"site",sequence:u+1,isTarget:(d==null?void 0:d.isRealTime)&&u===0})}),p.length>0&&(i.current.addSource("route-waypoints-marker",{type:"geojson",data:{type:"FeatureCollection",features:p.map((g,u)=>({type:"Feature",geometry:{type:"Point",coordinates:g.coordinates},properties:{description:g.type==="station"?"Station":g.isTarget?`Target: ${g.sequence}`:`Site ${g.sequence}`,type:g.type,sequence:g.sequence,isTarget:g.isTarget}}))}}),i.current.addLayer({id:"route-waypoints",type:"circle",source:"route-waypoints-marker",paint:{"circle-radius":["case",["==",["get","type"],"station"],o?10:8,["==",["get","isTarget"],!0],o?12:10,o?8:6],"circle-color":["case",["==",["get","type"],"station"],"#dc2626",["==",["get","isTarget"],!0],"#10B981","#3b82f6"],"circle-stroke-width":2,"circle-stroke-color":"#ffffff"}})),!(d!=null&&d.isRealTime)&&N.length>=2&&(i.current.addSource("route-start-marker",{type:"geojson",data:{type:"Feature",geometry:{type:"Point",coordinates:N[0]},properties:{description:"Start"}}}),i.current.addSource("route-end-marker",{type:"geojson",data:{type:"Feature",geometry:{type:"Point",coordinates:N[N.length-1]},properties:{description:"End"}}}),i.current.addLayer({id:"route-start",type:"circle",source:"route-start-marker",paint:{"circle-radius":o?8:6,"circle-color":"#22c55e","circle-stroke-width":2,"circle-stroke-color":"#ffffff"}}),i.current.addLayer({id:"route-end",type:"circle",source:"route-end-marker",paint:{"circle-radius":o?8:6,"circle-color":"#ef4444","circle-stroke-width":2,"circle-stroke-color":"#ffffff"}})),setTimeout(()=>{ve()},200)}catch(a){console.error("Error adding route layer:",a),setTimeout(()=>{M()},500)}}},ve=()=>{if(!i.current||N.length===0||y.length===0)return;const a=new L.LngLatBounds;N.forEach(t=>{a.extend(t)}),w&&a.extend([parseFloat(w.longitude),parseFloat(w.latitude)]),y.forEach(t=>{t.longitude&&t.latitude&&a.extend([parseFloat(t.longitude),parseFloat(t.latitude)])}),f&&a.extend(f);const r=o?40:80;try{i.current.fitBounds(a,{padding:r,duration:1500,essential:!0,maxZoom:o?16:15,offset:[0,o?-50:0]})}catch(t){console.error("Error fitting map to bounds:",t)}},Ue=a=>a.find(r=>r.type==="station")||null;c.useEffect(()=>(_&&v&&H&&(()=>{if(T.current&&!i.current){if(!v){I("Mapbox key is missing.");return}console.log("Starting map initialization..."),O("Initializing map...");try{L.accessToken=v,i.current=new L.Map({container:T.current,style:"mapbox://styles/mapbox/streets-v12",center:[125.94849837776422,8.483022468128098],zoom:o?11:10.5,attributionControl:!1,interactive:!0,scrollZoom:!0,dragPan:!0,dragRotate:!1,keyboard:!1,doubleClickZoom:!o,touchZoomRotate:!0,touchPitch:!1,failIfMajorPerformanceCaveat:!1,preserveDrawingBuffer:!0});const r=()=>{console.log("Map loaded successfully!"),z(!0),I(null),y.length>0&&ne(y),f&&oe(f,{}),N.length>0&&setTimeout(()=>{M()},500),j&&De(),R()},t=s=>{var l;console.error("Map error:",s),I(`Map error: ${((l=s.error)==null?void 0:l.message)||"Unknown error"}`),z(!0),R()};i.current.once("load",r),i.current.on("error",t);const n=setTimeout(()=>{h||(console.warn("Map load timeout - continuing anyway"),z(!0),R())},1e4);return()=>clearTimeout(n)}catch(r){console.error("Error creating map:",r),I(`Failed to create map: ${r.message}`),z(!0),R()}}})(),()=>{_e(),i.current&&(console.log("Cleaning up map"),i.current.remove(),i.current=null,z(!1))}),[_,v,H,o]),c.useEffect(()=>{y.length>0&&w&&v&&h&&(console.log("All data available, calculating optimal route..."),xe(y,w,j))},[y,w,v,h]),c.useEffect(()=>{if(j&&f&&k.length>0){const a=setTimeout(()=>{V()},1e3);return()=>clearTimeout(a)}},[f,j]),c.useEffect(()=>{i.current&&N.length>0&&h&&M()},[N,h]),c.useEffect(()=>{h&&y.length>0&&(console.log("Force updating site markers due to state change"),ne(y))},[h,y,o,j,F]),c.useEffect(()=>{h&&f&&(console.log("Force updating driver marker"),oe(f,{}))},[h,f,o]),c.useEffect(()=>{if(!S)return;const a=async()=>{try{console.log("Initializing Reverb connection for real-time location updates..."),Qe();const n=ye();if(!n)throw new Error("Echo not initialized");n.channel(`driver-locations.${S}`).listen("DriverLocationUpdated",s=>{console.log("Real-time driver location update received:",s),K("connected"),se(s)}),n.channel(`schedule-updates.${S}`).listen("ScheduleStatusUpdated",s=>{console.log("Schedule update received:",s),Oe(s.schedule)}),n.channel(`site-completion.${S}`).listen("SiteCompletionUpdated",s=>{console.log("Site completion received:",s),Ie(s)}),K("connected"),await Pe(),r()}catch(n){console.error("Realtime connection failed:",n),K("disconnected"),r()}},r=()=>{const n=setInterval(()=>{t()},1e4);return()=>clearInterval(n)},t=async()=>{try{if(E){const n=await J.get(`/schedule/${E}/driver-location`);n.data.success&&n.data.data&&se(n.data.data)}}catch(n){console.error("Error polling driver location:",n)}};return a(),()=>{const n=ye();n&&(n.leave(`driver-locations.${S}`),n.leave(`schedule-updates.${S}`),n.leave(`site-completion.${S}`))}},[S,E]);const Pe=async()=>{try{de(!0),O("Loading collection sites...");const a=await J.get(`/barangay/${S}/current-schedule`);if(a.data.success){const r=a.data.data;if(ie(r),r.id){const t=await J.get(`/schedule/${r.id}/sites`);if(t.data.success){const n=t.data.data;ce(n);const s=Ue(n);s&&(Ee(s),console.log("Station found:",s.site_name))}}if(E){const t=await J.get(`/schedule/${E}/driver-location`);t.data.success&&t.data.data&&se(t.data.data)}}R()}catch(a){console.error("Error loading initial data:",a),R()}finally{de(!1)}},se=a=>{if(!a.longitude||!a.latitude){console.warn("Invalid location data received:",a);return}const r=[parseFloat(a.longitude),parseFloat(a.latitude)];console.log("Updating driver location on map:",r),we(r),h&&i.current&&(oe(r,a),Be()||i.current.flyTo({center:r,zoom:o?16:15,duration:2e3,essential:!0,offset:[0,o?-100:0]}),j&&V())},Ie=a=>{console.log("🎯 Handling site completion:",a),ce(r=>r.map(t=>t.id===a.site_id||t.id===a.siteId?(console.log(`✅ Marking site ${t.site_name} as completed`),{...t,status:"completed",collectionStatus:"finished",completed_at:a.completed_at||new Date().toISOString()}):t)),He(a.site_name||"Collection Site",a),h&&setTimeout(()=>{const r=y.map(t=>t.id===a.site_id||t.id===a.siteId?{...t,status:"completed",collectionStatus:"finished",completed_at:a.completed_at||new Date().toISOString()}:t);ne(r),j&&f&&V()},100)},He=(a,r)=>{const t=document.createElement("div");t.className="fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-5 rounded-xl shadow-2xl z-[9999] min-w-[320px] max-w-[420px] transform transition-all duration-500",t.style.animation="slideInRight 0.5s ease-out";const n=r.completed_sites||0,s=r.total_sites||0,l=s>0?Math.round(n/s*100):0;t.innerHTML=`
      <div class="flex items-start gap-3">
        <div class="text-5xl animate-bounce">✅</div>
        <div class="flex-1">
          <div class="font-bold text-xl mb-1">${a} Collected!</div>
          <div class="text-sm opacity-90 mb-2">Driver has completed this collection point</div>
          <div class="flex items-center gap-2 text-sm mb-2">
            <span class="font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">${n}/${s} sites</span>
            <span class="opacity-75">•</span>
            <span class="font-semibold">${l}% complete</span>
          </div>
          <div class="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div class="h-full bg-white rounded-full transition-all duration-1000 animate-pulse" style="width: ${l}%"></div>
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white opacity-75 hover:opacity-100 text-3xl font-bold leading-none transition-opacity">×</button>
      </div>
    `,document.body.appendChild(t);try{const m=new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVqzn77BdGAg+ltryxnMpBSuBzvLaiTUIGGe77OmfTgwOUKbk8LdjHQU2kdby0HwqBSp3x/DdkUELEl+06OyqVRUKRp7g8r5wIgU0h9H004IzBh1tv+/mnEkODlat6O+xXBkIP5Xa8sV0KgUrgc7y2YszCBdnvOzpnk4MDU+m5O+5ZBwGNpHX8s98Kgcrc8fv3ZJCCxFftOjuq1YUDD6f4fK/cCMGNYfR89OCMwYcbb/v5JxKDg5VrOjusVwZCj6U2vLGdSoGK4HO8tmLMwgXZ7vs6J5PDA1Ppubw...");m.volume=.3,m.play().catch(()=>{})}catch{}if(setTimeout(()=>{document.body.contains(t)&&(t.style.opacity="0",t.style.transform="translateX(100%)",setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},300))},6e3),!document.getElementById("resident-completion-animations")){const m=document.createElement("style");m.id="resident-completion-animations",m.textContent=`
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
      `,document.head.appendChild(m)}},oe=(a,r)=>{if(!i.current||!h)return;le&&le.remove();const t=o?"w-12 h-12":"w-10 h-10",n=o?"w-6 h-6":"w-5 h-5",s=document.createElement("div");s.className="driver-location-marker";const m=(r.timestamp?(new Date-new Date(r.timestamp))/1e3:0)<30;s.innerHTML=`
      <div class="relative">
        <div class="${t} bg-blue-600 border-3 border-white rounded-full shadow-lg flex items-center justify-center relative z-10">
          <svg class="${n} text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/>
            <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
          </svg>
          ${m?"":`
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border border-white"></div>
          `}
        </div>
        <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
        ${r.accuracy?`
          <div class="absolute inset-0 border-2 border-blue-300 rounded-full opacity-50" 
               style="transform: scale(${Math.min(r.accuracy/10,3)})"></div>
        `:""}
      </div>
    `;try{const p=new L.Marker({element:s,draggable:!1}).setLngLat(a).addTo(i.current),g=new L.Popup({offset:25,closeButton:!1,className:`custom-popup ${o?"max-w-xs":"max-w-sm"}`}).setHTML(`
        <div class="text-sm ${o?"p-2":"p-3"}">
          <div class="font-semibold text-gray-900 ${o?"text-base":""}">🚗 Driver Location</div>
          <div class="text-xs text-gray-500 mt-1">
            ${r.timestamp?`Updated: ${new Date(r.timestamp).toLocaleTimeString()}`:"Live"}
          </div>
          ${r.accuracy?`
            <div class="text-xs text-gray-500 mt-1">
              Accuracy: ±${Math.round(r.accuracy)} meters
            </div>
          `:""}
          ${m?"":`
            <div class="text-xs text-yellow-600 mt-1 font-medium">
              ⚠️ Location data may be delayed
            </div>
          `}
        </div>
      `);p.setPopup(g),je(p)}catch(p){console.error("Error creating driver marker:",p)}},Oe=a=>{ie(a)},ne=a=>{if(!i.current||!h)return;Y.forEach(t=>{t&&t.remove&&t.remove()});const r=a.map((t,n)=>{if(!t.longitude||!t.latitude)return null;try{const s=document.createElement("div");s.className="site-marker";const l=t.status==="completed"||t.collectionStatus==="finished",m=t.status==="in_progress",p=t.type==="station",g=t.purok_name||t.site_name||"Site",u=j&&F&&F.id===t.id&&!l;l&&console.log(`✓ Rendering completed site: ${t.site_name} (ID: ${t.id})`);const x=()=>p?"#DC2626":l||u?"#10B981":"#6B7280",$=()=>p?`
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            `:l?`
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            `:`
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            `,D=o?"w-12 h-12":"w-10 h-10",Z=o?"w-6 h-6":"w-5 h-5",W=k.findIndex(Je=>Je.id===t.id)+1,Ve=W>0;s.innerHTML=`
          <div class="relative ${m||u?"animate-pulse":""}">
            ${Ve&&!p?`
              <div class="absolute -top-2 -right-2 ${l?"bg-green-600":"bg-blue-500"} text-white rounded-full ${o?"w-7 h-7 text-sm":"w-6 h-6 text-xs"} flex items-center justify-center font-bold shadow-lg border-2 border-white z-20">
                ${l?"✓":W}
              </div>
            `:""}
            <div class="${D} rounded-full border-3 border-white flex items-center justify-center shadow-lg" 
                  style="background-color: ${x()}; ${l?"opacity: 0.7;":""}">
              <div class="${Z} text-white">
                ${$()}
              </div>
            </div>
            ${m?'<div class="absolute inset-0 rounded-full border-3 border-yellow-500 animate-ping"></div>':""}
            ${u&&!m?'<div class="absolute inset-0 rounded-full border-3 border-green-500 animate-ping"></div>':""}
          </div>
        `;const Ze=[parseFloat(t.longitude),parseFloat(t.latitude)],We=new L.Popup({offset:25,closeButton:!1,className:`custom-popup ${o?"max-w-xs":"max-w-sm"}`}).setHTML(`
          <div class="text-sm ${o?"p-2":"p-3"}">
            <div class="font-semibold text-gray-900 ${o?"text-base":""}">${g}</div>
            <div class="text-xs text-gray-500 mt-1">
              ${p?"Collection Station":l?"Completed":m?"In Progress":"Pending"}
            </div>
            ${u&&j&&'<div class="text-xs text-green-600 mt-1 font-medium">🎯 Current Target</div>'}
            ${F&&F.id===t.id&&!u&&'<div class="text-xs text-green-600 mt-1 font-medium">📍 Nearest Site</div>'}
          </div>
        `);return new L.Marker({element:s,draggable:!1}).setLngLat(Ze).setPopup(We).addTo(i.current)}catch(s){return console.error("Error creating marker:",s),null}}).filter(t=>t!==null);Se(r)},qe=async()=>{y.length>0&&w&&(O("Refreshing route..."),await xe(y,w,j))},Ge=()=>{ge(!A)},Xe=()=>b?"100%":he.width<640?"400px":he.width<768?"500px":"600px";return c.useEffect(()=>{console.log("Current state:",{cssLoaded:_,mapInitialized:h,containerReady:H,siteLocationsCount:y.length,siteMarkersCount:Y.length,driverLocation:!!f})},[_,h,H,y,Y,f]),ue?e.jsx("div",{className:"w-full h-96 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center",children:e.jsxs("div",{className:"text-center p-6",children:[e.jsx(Ye,{className:"w-12 h-12 text-red-600 mx-auto mb-4"}),e.jsx("h3",{className:"text-base font-semibold text-gray-900 mb-2",children:"Map Loading Error"}),e.jsx("p",{className:"text-sm text-gray-600 mb-4",children:ue}),e.jsx("p",{className:"text-xs text-gray-500",children:"The interface will continue with limited functionality"})]})}):e.jsxs("div",{className:`${b?"w-full h-full":"w-full"} bg-white ${b?"":"rounded-lg border border-gray-200"} overflow-hidden`,children:[e.jsx(at,{isLoading:$e,message:ke,size:o?"medium":"large",variant:"default"}),e.jsxs("div",{className:`relative w-full ${b?"h-full":""}`,style:{height:b?"100%":Xe()},children:[e.jsx("div",{ref:T,className:"w-full h-full absolute inset-0"}),h&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:`absolute ${o?"bottom-2 left-2":"bottom-4 left-4"} bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 ${o?"p-2":"p-3"} z-10 ${o?"min-w-40 max-w-48":b?"min-w-52":"min-w-48"}`,children:[e.jsxs("div",{className:`font-semibold ${o?"text-xs":"text-sm"} text-gray-900 ${o?"mb-2":"mb-3"} flex items-center justify-between`,children:[e.jsx("span",{children:"Legend"}),b&&!o&&e.jsx("span",{className:"text-xs font-normal text-gray-500",children:"Live Tracking"})]}),e.jsxs("div",{className:`space-y-1 ${o?"text-xs":"text-sm"}`,children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 relative",children:e.jsx("div",{className:"absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"})}),e.jsx("span",{className:"text-gray-700",children:"Driver"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 bg-red-600 rounded-full flex-shrink-0"}),e.jsx("span",{className:"text-gray-700",children:"Station"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 bg-gray-500 rounded-full flex-shrink-0"}),e.jsx("span",{className:"text-gray-700",children:"Pending"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 bg-green-600 rounded-full flex-shrink-0"}),e.jsx("span",{className:"text-gray-700",children:"Completed"})]}),j&&F&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-4 h-4 bg-green-500 rounded-full flex-shrink-0 relative",children:e.jsx("div",{className:"absolute inset-0 rounded-full border-2 border-white animate-ping"})}),e.jsx("span",{className:"text-gray-700",children:"Target Site"})]}),d&&e.jsxs("div",{className:"flex items-center gap-2 pt-1 border-t border-gray-200",children:[e.jsx("div",{className:"w-4 h-1 rounded-full flex-shrink-0",style:{backgroundColor:d.isRealTime?"#10B981":Q[C==null?void 0:C.barangay_name]||Q._default}}),e.jsx("span",{className:"text-gray-700",children:d.isRealTime?"Live Route":"Planned Route"})]})]})]}),e.jsxs("div",{className:`absolute ${o?"top-2 right-2":"top-4 right-4"} flex ${b&&!o?"flex-row gap-2":"flex-col gap-2"} z-10`,children:[e.jsx("button",{onClick:qe,disabled:ee,className:`${b?"bg-white/95 backdrop-blur-sm":"bg-white"} rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center ${o?"p-2":"p-3"} ${ee?"opacity-50 cursor-not-allowed":""}`,title:"Refresh route",children:ee?e.jsx("div",{className:`animate-spin rounded-full border-b-2 border-gray-700 ${o?"w-4 h-4":"w-5 h-5"}`}):e.jsx(Ke,{className:`text-gray-700 ${o?"w-4 h-4":"w-5 h-5"}`})}),e.jsx("button",{onClick:Ge,className:`${b?"bg-white/95 backdrop-blur-sm":"bg-white"} rounded-lg shadow-lg border ${A?"border-blue-500 bg-blue-50":"border-gray-200"} hover:bg-gray-50 transition-colors flex items-center justify-center ${o?"p-2":"p-3"}`,title:A?"Hide route info":"Show route info",children:e.jsx(et,{className:`${A?"text-blue-600":"text-gray-700"} ${o?"w-4 h-4":"w-5 h-5"}`})}),e.jsx("button",{onClick:ve,className:`${b?"bg-white/95 backdrop-blur-sm":"bg-white"} rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center ${o?"p-2":"p-3"}`,title:"Fit to route",children:e.jsx(tt,{className:`text-gray-700 ${o?"w-4 h-4":"w-5 h-5"}`})})]}),e.jsx("div",{className:`absolute ${o?"top-2 left-2":"top-4 left-4"} bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 ${o?"px-2 py-1":"px-3 py-2"} z-10`,children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:`w-2 h-2 rounded-full ${P==="connected"?"bg-green-500":P==="connecting"?"bg-yellow-500":"bg-red-500"} ${P==="connected"?"animate-pulse":""}`}),e.jsx("span",{className:`font-medium text-gray-700 capitalize ${o?"text-xs":"text-sm"}`,children:P})]})}),d&&A&&e.jsxs("div",{className:`absolute ${o?"top-12 left-2 right-2":b?"top-4 left-1/2 transform -translate-x-1/2":"top-16 left-4"} bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 ${o?"p-3":"p-4"} z-10 ${o?"":b?"min-w-80 max-w-md":"min-w-64"}`,children:[e.jsxs("div",{className:`font-semibold text-gray-900 ${o?"text-sm mb-2":"text-base mb-3"} flex items-center justify-between`,children:[e.jsx("span",{children:d.isRealTime?"Live Route":"Planned Route"}),e.jsxs("div",{className:"flex gap-1",children:[d.isRealTime&&e.jsxs("span",{className:"text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1",children:[e.jsx("div",{className:"w-2 h-2 bg-green-500 rounded-full animate-pulse"}),"Live"]}),d.isFallback&&e.jsx("span",{className:"text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded",children:"Estimated"})]})]}),e.jsxs("div",{className:`space-y-2 ${o?"text-xs":"text-sm"} text-gray-600`,children:[e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Estimated Time:"}),e.jsx("span",{className:"font-semibold text-blue-600",children:d.formattedDuration})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Distance:"}),e.jsxs("span",{className:"font-semibold",children:[d.distance," km"]})]}),e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Total Stops:"}),e.jsxs("span",{className:"font-semibold",children:[d.totalStops," sites"]})]}),d.targetSite&&e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Target Site:"}),e.jsx("span",{className:"font-semibold text-green-600",children:d.targetSite})]}),F&&!d.targetSite&&e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{children:"Nearest Site:"}),e.jsx("span",{className:"font-semibold text-green-600",children:F.site_name})]}),d.lastUpdated&&e.jsxs("div",{className:"flex justify-between items-center text-xs text-gray-500",children:[e.jsx("span",{children:"Last Updated:"}),e.jsx("span",{children:d.lastUpdated})]})]}),fe&&e.jsx("div",{className:`mt-2 p-2 bg-red-50 border border-red-200 rounded ${o?"text-xs":"text-sm"} text-red-600`,children:fe})]})]})]})]})};export{mt as default};
