import{r as p,c as b,j as g,a as q}from"./app-hBFkVOqz.js";import{a as d}from"./mapbox-gl-74b6tMDi.js";import{G as I}from"./index-4QbVD9he.js";import{C as G}from"./index-C8igijZH.js";import{G as O}from"./index-EMQY79m8.js";import{c as V}from"./can-3MqaZyCZ.js";import"./iconBase-DjK8tALs.js";function K({mapboxKey:m,onLocationSelect:v,refreshTrigger:F,onEditSite:w,onDeleteSite:k}){const f=p.useRef(null),o=p.useRef(null),u=p.useRef(null),x=p.useRef([]),[E,A]=p.useState(!1),[y,j]=p.useState([]),[L,C]=p.useState(!1),M={type:"FeatureCollection",features:[{type:"Feature",properties:{id:1,barangay:"San Francisco"},geometry:{type:"Polygon",coordinates:[[[125.99912782475212,8.575510286263182],[126.00025443311193,8.571458743014418],[126.02485768210255,8.565939354188075],[126.04450490232114,8.466818846605392],[126.1103129490703,8.46664901562528],[126.06009804976281,8.415887696221361],[126.07054556119789,8.402939305491458],[126.02793797928399,8.40460170458961],[126.02527178904438,8.408548502194648],[126.02427353120135,8.409252626098564],[126.02385934340657,8.40926067897989],[126.0212174711134,8.407984558278983],[126.02055643141244,8.408178587487853],[126.01856794991,8.409294302964668],[126.01662892223891,8.4046902116812],[126.01474001557193,8.406036008364552],[126.01358506617925,8.404625448531675],[126.00952801076892,8.405454403475574],[126.00777831277611,8.404925515942836],[126.00658549599319,8.403966025428687],[126.00485033177199,8.403227717091895],[126.00509998136846,8.401577514556351],[126.00574801766186,8.400888351042127],[125.97641093552602,8.391757550629634],[125.97390880231916,8.39080800207968],[125.97081543981409,8.39161874461628],[125.96745822964954,8.39014796167777],[125.96303628490449,8.389036768089781],[125.95862571497344,8.38720153395198],[125.96318041276902,8.371729751905093],[125.95503341347933,8.369405592514127],[125.95860757814717,8.355388169154793],[125.92791631975041,8.347929528410077],[125.89113139787435,8.393374892862454],[125.88334005008488,8.417552308867386],[125.79651821810683,8.548921445742934],[125.93730538303595,8.548744057251142],[125.9349976967647,8.577733038602531],[125.99912782475212,8.575510286263182]]]}}]},B={Alegria:"#FF5733","Barangay 1":"#33FF57","Barangay 2":"#3357FF","Barangay 3":"#F033FF","Barangay 4":"#FF33F0","Barangay 5":"#33FFF0","Bayugan 2":"#8A2BE2","Bitan-agan":"#A52A2A",Borbon:"#DEB887",Buenasuerte:"#5F9EA0",Caimpugan:"#7FFF00","Das-agan":"#D2691E",Ebro:"#FF7F50",Hubang:"#6495ED",Karaus:"#DC143C",Ladgadan:"#00FFFF",Lapinigan:"#00008B",Lucac:"#008B8B",Mate:"#B8860B","New Visayas":"#006400",Ormaca:"#8B008B",Pasta:"#556B2F","Pisa-an":"#FF8C00",Rizal:"#9932CC","San Isidro":"#8FBC8F","Santa Ana":"#483D8B",Tagapua:"#2F4F4F","San Francisco":"#FFE659",_default:"#4F262A"};p.useEffect(()=>{const e=document.createElement("link");e.href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css",e.rel="stylesheet",document.head.appendChild(e);const t=document.createElement("style");return t.textContent=`
            .mapboxgl-popup {
                max-width: 95vw !important;
                z-index: 9999 !important;
            }
            .mapboxgl-popup-content {
                padding: 0 !important;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
                border-radius: 8px !important;
                min-width: 280px !important;
            }
            .mapboxgl-popup-close-button {
                width: 32px !important;
                height: 32px !important;
                font-size: 24px !important;
                line-height: 32px !important;
                padding: 0 !important;
                color: #6b7280 !important;
                background: white !important;
                border-radius: 50% !important;
                right: 8px !important;
                top: 8px !important;
                transition: all 0.2s !important;
                z-index: 10000 !important;
            }
            .mapboxgl-popup-close-button:hover {
                background: #f3f4f6 !important;
                color: #1f2937 !important;
            }
            .mapboxgl-popup-anchor-top .mapboxgl-popup-tip,
            .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip,
            .mapboxgl-popup-anchor-left .mapboxgl-popup-tip,
            .mapboxgl-popup-anchor-right .mapboxgl-popup-tip {
                border-color: white !important;
            }
            @media (max-width: 640px) {
                .mapboxgl-popup-content {
                    min-width: 260px !important;
                    max-width: calc(100vw - 40px) !important;
                }
                .site-popup-container > div {
                    width: 100% !important;
                }
            }
            @media (max-width: 400px) {
                .mapboxgl-popup-content {
                    min-width: 240px !important;
                    max-width: calc(100vw - 30px) !important;
                }
            }
        `,document.head.appendChild(t),A(!0),()=>{document.head.removeChild(e),document.head.removeChild(t)}},[]),p.useEffect(()=>{(async()=>{try{const t=await q.get("/municipality/barangay/purok/sites");t.data.success&&j(t.data.data)}catch(t){console.error("Error fetching locations: ",t)}})()},[F]),p.useEffect(()=>{if(!(!E||!m||o.current||!f.current))return d.accessToken=m,o.current=new d.Map({container:f.current,style:"mapbox://styles/makisenpai/cm9mo7odu006c01qsc3931nj7",center:[125.94849837776422,8.483022468128098],attributionControl:!1,zoom:10.5}),o.current.on("load",()=>{C(!0),S(M)}),o.current.on("click",async e=>{var a;const{lng:t,lat:i}=e.lngLat;u.current&&(u.current.remove(),u.current=null);const r=document.createElement("div");r.className="custom-marker";const n=b.createRoot(r);n.render(g.jsx(G,{size:30,color:"#FC2622"})),u.current=new d.Marker({element:r,draggable:!1}).setLngLat([t,i]).addTo(o.current),u.current._root=n;try{const l=await(await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${t},${i}.json?access_token=${m}&country=PH&types=region,district,locality,neighborhood,place`)).json(),c={coordinates:{lng:t,lat:i},full_address:((a=l.features[0])==null?void 0:a.place_name)||"",...T(l)};v&&v(c)}catch(s){console.error("Geocoding error:",s)}}),()=>{o.current&&(o.current.remove(),o.current=null),C(!1)}},[m,E,F]),p.useEffect(()=>{L&&y.length>0&&_()},[L,y]);const S=e=>{o.current&&(o.current.getLayer("polygons-fill")&&o.current.removeLayer("polygons-fill"),o.current.getLayer("polygons-outline")&&o.current.removeLayer("polygons-outline"),o.current.getSource("polygons")&&o.current.removeSource("polygons"),o.current.addSource("polygons",{type:"geojson",data:e}),o.current.addLayer({id:"polygons-fill",type:"fill",source:"polygons",paint:{"fill-color":["match",["get","barangay"],"San Francisco","#FFE659","#4F262A"],"fill-opacity":.5}}),o.current.addLayer({id:"polygons-outline",type:"line",source:"polygons",paint:{"line-color":"#000","line-width":2}}),o.current.on("mouseenter","polygons-fill",()=>{o.current.getCanvas().style.cursor="pointer"}),o.current.on("mouseleave","polygons-fill",()=>{o.current.getCanvas().style.cursor=""}))},_=()=>{P(),y.forEach(e=>{if(e.longitude&&e.latitude){const t=$([parseFloat(e.longitude),parseFloat(e.latitude)],"site",e.site_name,e);x.current.push(t)}})},P=()=>{x.current.forEach(e=>{e._root&&setTimeout(()=>e._root.unmount(),0),e.remove()}),x.current=[]},N=e=>{var i,r,n;const t=document.createElement("div");return t.className="site-popup-container",t.innerHTML=`
            <div class="bg-white rounded-lg overflow-hidden w-full">
                <div class="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200">
                    <p class="text-xs sm:text-sm text-gray-700 font-medium">${((r=(i=e.purok)==null?void 0:i.baranggay)==null?void 0:r.baranggay_name)||"N/A"} • ${((n=e.purok)==null?void 0:n.purok_name)||"N/A"}</p>
                </div>
                <div class="px-4 sm:px-5 py-3 sm:py-4">
                    <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button id="edit-site-btn" class="w-full flex-1 bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-700 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                            Edit
                        </button>
                        <button id="delete-site-btn" class="w-full flex-1 bg-white border border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-700 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `,setTimeout(()=>{const a=t.querySelector("#edit-site-btn"),s=t.querySelector("#delete-site-btn");a&&a.addEventListener("click",l=>{l.stopPropagation(),document.querySelectorAll(".mapboxgl-popup").forEach(c=>c.remove()),w&&w(e)}),s&&s.addEventListener("click",l=>{l.stopPropagation(),document.querySelectorAll(".mapboxgl-popup").forEach(c=>c.remove()),k&&k(e)})},0),t},z=e=>{var n,a,s;const t=(a=(n=e==null?void 0:e.purok)==null?void 0:n.baranggay)==null?void 0:a.baranggay_name,i=B[t]||B._default,r=document.createElement("div");return r.className="custom-image-marker",r.style.cursor="pointer",r.innerHTML=`
            <div class="relative" style="pointer-events: none;">
                <div class="w-10 h-10 rounded-full border-10 flex items-center justify-center overflow-hidden" 
                     style="border-color: ${i}; background-color: ${i}20; pointer-events: none;">
                    <img src="${V}" 
                         alt="${e.site_name}" 
                         class="w-8 h-8 object-cover rounded-full"
                         style="pointer-events: none;"
                         onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold\\' style=\\'background-color: ${i}; pointer-events: none;\\'>${((s=e.site_name)==null?void 0:s.charAt(0))||"S"}</div>'">
                </div>
            </div>
        `,r},R=()=>{const e=document.createElement("div");e.className="custom-marker";const t=b.createRoot(e);return t.render(g.jsx(O,{size:30,color:"#4F262A"})),{element:e,root:t}},$=(e,t="manual",i="",r=null)=>{let n,a=null;if(t==="manual")n=document.createElement("div"),n.className="custom-marker",a=b.createRoot(n),a.render(g.jsx(I,{size:15,color:"#FC2622"}));else if((r==null?void 0:r.type)==="station"){const l=R();n=l.element,a=l.root}else n=z(r);const s=new d.Marker({element:n,draggable:!1}).setLngLat(e);if(t==="site"&&r){const l=new d.Popup({offset:25,closeButton:!0,maxWidth:"350px",closeOnClick:!0});n.onclick=function(c){c.stopPropagation(),document.querySelectorAll(".mapboxgl-popup").forEach(H=>H.remove());const h=N(r);l.setDOMContent(h).setLngLat(e).addTo(o.current)}}return s.addTo(o.current),t==="manual"&&(u.current=s),a&&(s._root=a),s},T=e=>{var s,l;const t=e.features;let i="",r="";const n=t.find(c=>c.place_type.includes("locality")||c.place_type.includes("place")||c.context&&c.context.some(h=>h.id.includes("locality")));n&&(i=n.text||((l=(s=n.context)==null?void 0:s.find(c=>c.id.includes("locality")))==null?void 0:l.text)||"");const a=t.find(c=>c.place_type.includes("neighborhood"));return a&&(r=a.text),{barangay:i||"Not specified",purok:r||"Not specified"}};return g.jsx("div",{ref:f,className:"w-full h-full rounded-lg"})}export{K as default};
