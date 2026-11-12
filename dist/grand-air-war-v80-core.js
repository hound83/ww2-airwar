/* Grand Air War v7.7 — European campaigns, official-source datasets, and linked analysis.
   This UI never estimates unsupported monthly force inventories or geographically locates command-wide losses as individual battle casualties. */
(function(){
"use strict";
const D=window.GrandAirWarV77Campaigns,G=window.GrandAirWarV77Groups,V=window.AirWarV74Data,
 P=window.AirWarV73Data,A=window.AirWarV71Data,B=window.AirWarV72Data,Legacy=window.LuftData;
if(!D||!G||!V||!P||!A||!B||!Legacy)return;
const $=id=>document.getElementById(id),esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=x=>x===null||x===undefined?"Unavailable":Number(x).toLocaleString("en-US");
const MN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const LMIN=1936*12+6,LMAX=1945*12+4;
const monthIdx=m=>Number(m.slice(0,4))*12+Number(m.slice(5,7))-1-LMIN;
const atIdx=i=>{const t=LMIN+Math.max(0,Math.min(LMAX-LMIN,i));return Math.floor(t/12)+"-"+String(t%12+1).padStart(2,"0");};
const mLabel=m=>MN[Number(m.slice(5,7))-1]+" "+m.slice(0,4);
const countPhrase=(n,singular,plural)=>n+" "+(n===1?singular:plural);
const sourceLink=(id,label)=>D.sources[id]?'<a target="_blank" rel="noopener noreferrer" href="'+esc(D.sources[id].url)+'">'+esc(label||D.sources[id].title)+" ↗</a>":"";
const lossRows=[...A.monthlyReturns,...B.monthlyReturns].map(x=>({...x,period:(()=>{const z=Legacy.at(x.i);return z.y+"-"+String(z.m+1).padStart(2,"0");})()})).sort((a,b)=>a.i-b.i||a.theater.localeCompare(b.theater));
const sourceIndex={...A.sourceIndex,...B.sourceIndex};
const groupRows=G.rows.map(r=>Object.fromEntries(G.columns.map((c,i)=>[c,r[i]])));
const state={month:"1944-06",theater:"all",search:"",all:true,selected:"normandy",selectedChapter:null,lastDossierId:null,selectedMoment:null,map:null,mapMarkers:null,play:null,lossCommand:"Western Front",lossOutcome:"destroyed",lossWindow:"all",lossMonth:"1944-06",forceSeries:"usaaf",forceArea:"ETO",forceMetric:"totalCombatGroups",forceSelected:"1944-06"};
const themes={west:"Western Front",reich:"Reich / strategic bombing",east:"Eastern Front",med:"Mediterranean / Italy",north:"Northern Europe"};
// Spain is grouped with the West for filtering, but it is not the WWII Western Front.
const campaignRegion=c=>c.id==="spain"?"Spanish Civil War / Spain":themes[c.theater];
const active=c=>c.start<=state.month&&c.end>=state.month;
// The search field promises battles/missions, not only the 20 catalogue titles.
// Include researched phase names and dated operations, without treating the
// free-text search as a license to merge numerical reporting populations.
const searchable=c=>[c.name,c.objective,c.turningPoint,c.consequence,c.participants.join(" "),
 ...(c.story?.introduction||[]),c.story?.question||"",
 ...(c.chapters||[]).flatMap(ch=>[ch.title,ch.location,ch.situation,ch.airRole,ch.change,ch.limits,...(ch.story||[]),ch.axis||""]),
 ...c.moments.flatMap(e=>[e.title,e.place,e.summary||"",e.airAction||"",e.opposingView||"",e.units||"",e.outcome||""])].join(" ").toLowerCase();
const textMatch=(haystack,term)=>term.length<=3?haystack.split(/[^a-z0-9]+/).includes(term):haystack.includes(term);
const matches=c=>(state.theater==="all"||c.theater===state.theater)&&(!state.search.trim()||textMatch(searchable(c),state.search.toLowerCase().trim()));
const matching=()=>D.campaigns.filter(matches);
const visibleOnMap=()=>matching().filter(c=>state.all||active(c));
function cancelPlay(){if(state.play!==null){clearInterval(state.play);state.play=null;}$("play-time").textContent="▶ Play";}
function updateMonth(month){
 window.AtlasNormandyOperations?.onNavigate();
 if(monthIdx(month)<0||monthIdx(month)>LMAX-LMIN)return;
 state.month=month;
 // Scrubbing and playback never silently replace the campaign a reader selected.
 update();
}
function pickCampaign(id,fly=true){
 window.AtlasNormandyOperations?.onNavigate();
 const c=D.campaigns.find(x=>x.id===id);if(!c)return;cancelPlay();
 const changed=state.selected!==id;
 if(state.search&&!matches(c))state.search="";
 state.selected=id;
 state.selectedChapter=null;
 state.selectedMoment=null;
 if(!active(c))state.month=c.start;
 if(state.theater!=="all"&&state.theater!==c.theater)state.theater="all";
 update();
 if(changed)$("moment-list").scrollTop=0;
 const list=$('campaign-list'),row=list.querySelector?.('[data-campaign="'+id+'"]');
 // Only scroll the chronology's own viewport. Do not jump the entire page
 // away from the map when a marker or dated event selects a campaign.
 if(row?.getBoundingClientRect&&list.getBoundingClientRect){
  const viewport=list.getBoundingClientRect(),target=row.getBoundingClientRect();
  if(target.top<viewport.top)list.scrollTop-=viewport.top-target.top;
  else if(target.bottom>viewport.bottom)list.scrollTop+=target.bottom-viewport.bottom;
 }
 if(fly&&state.map){const z=state.map.getZoom();state.map.flyTo([c.focus.lat,c.focus.lng],Math.max(6,Math.min(9,z)),{duration:.6});}
}
function selectMoment(cId,date,lat,lng,title){
 pickCampaign(cId,false);
 if(date&&date.slice(0,7)!==state.month)updateMonth(date.slice(0,7));
 const c=D.campaigns.find(x=>x.id===cId);
 state.selectedChapter=c?.chapters?.find(ch=>ch.start<=date&&date<=ch.end)?.id||null;
 state.selectedMoment=date+"|"+title;
 renderMoments();
 if(state.map)state.map.flyTo([lat,lng],Math.max(7,Math.min(10,state.map.getZoom())),{duration:.6});
}
function selectChapter(id,fit=true){
 window.AtlasNormandyOperations?.onNavigate();
 const c=D.campaigns.find(x=>x.id===state.selected),ch=c?.chapters?.find(x=>x.id===id);
 if(c?.story&&ch){cancelPlay();state.month=ch.start.slice(0,7);renderTime();}
 state.selectedChapter=id;
 state.selectedMoment=null;
 renderMoments();
 $("moment-list").scrollTop=0;
 const points=c?.moments.filter(e=>ch?.start<=e.date&&e.date<=ch?.end)||[];
 if(fit&&c?.story&&points.length&&state.map?.flyToBounds&&window.L){
  state.map.flyToBounds(window.L.latLngBounds(points.map(e=>[e.lat,e.lng])).pad(.6),{maxZoom:8,duration:.5});
 }
 drawMap();
}
function makeIcon(text,kind,selected,inactive=false){
 return window.L.divIcon({
  className:"gaw-icon",
  html:'<span class="'+(kind==="cluster"?"war-cluster":"war-pin")+(selected?" selected":"")+(inactive?" inactive":"")+'">'+esc(text)+'</span>',
  iconSize:kind==="cluster"?[37,37]:[29,29],
  iconAnchor:kind==="cluster"?[18,18]:[14,14]
 });
}
// Clip the *physical land polygons* to the European chart before passing them to
// Leaflet. Rendering a whole-world land ring in a small projected chart draws
// enormous polygon edges through the viewport on zoom/pan in some browsers.
function clipRing(ring){
 let vertices=ring.map(p=>[p[0],p[1]]);
 // Generous geography margin keeps all clipping edges *outside* the displayed
 // European theatre, even at the initial most-zoomed-out map view.
 const edges=[
  {inside:p=>p[0]>=-50,intersect:(a,b)=>[-50,a[1]+(-50-a[0])*(b[1]-a[1])/(b[0]-a[0])]},
  {inside:p=>p[0]<=100,intersect:(a,b)=>[100,a[1]+(100-a[0])*(b[1]-a[1])/(b[0]-a[0])]},
  {inside:p=>p[1]>=0,intersect:(a,b)=>[a[0]+(0-a[1])*(b[0]-a[0])/(b[1]-a[1]),0]},
  {inside:p=>p[1]<=83,intersect:(a,b)=>[a[0]+(83-a[1])*(b[0]-a[0])/(b[1]-a[1]),83]}
 ];
 for(const edge of edges){
  if(!vertices.length)break;
  const output=[];let before=vertices[vertices.length-1];
  for(const current of vertices){
   const prevInside=edge.inside(before),currInside=edge.inside(current);
   if(currInside!==prevInside)output.push(edge.intersect(before,current));
   if(currInside)output.push(current);
   before=current;
  }
  vertices=output;
 }
 if(vertices.length<3)return null;
 const first=vertices[0],last=vertices[vertices.length-1];
 if(first[0]!==last[0]||first[1]!==last[1])vertices.push([...first]);
 return vertices.length>=4?vertices:null;
}
function splitDateLine(ring){
 // Natural Earth land includes rings crossing ±180° near the Bering Strait.
 // In planar Leaflet coordinates a -180 to +180 edge becomes a line *through
 // Europe*, and simple bbox clipping makes it a huge horizontal land stripe.
 // Close each dateline-side portion at its OWN ±180 boundary first.
 const points=ring.slice();
 if(points.length>1&&points[0][0]===points[points.length-1][0]&&points[0][1]===points[points.length-1][1])points.pop();
 const cuts=[];
 for(let i=0;i<points.length;i++)if(Math.abs(points[i][0]-points[(i+points.length-1)%points.length][0])>180)cuts.push(i);
 if(cuts.length<2)return [ring];
 return cuts.map((start,index)=>{
  const stop=cuts[(index+1)%cuts.length],part=[];
  for(let i=start;i!==stop;i=(i+1)%points.length)part.push(points[i]);
  const west=part[0][0]<0,edge=west?-180:180;
  part.push([edge,part[part.length-1][1]],[edge,part[0][1]],[...part[0]]);
  return part;
 });
}
function insideRing(point,ring){
 let contained=false;
 for(let i=0,j=ring.length-1;i<ring.length;j=i++){
  const a=ring[i],b=ring[j];
  if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])contained=!contained;
 }
 return contained;
}
function europeanLand(geo){
 // topojson.feature() returns a FeatureCollection when the named TopoJSON
 // object is a GeometryCollection (world-atlas land-50m uses that form).
 const features=geo.type==="FeatureCollection"?geo.features:[geo];
 const polys=features.flatMap(feature=>{
  const geometry=feature.geometry||feature;
  return geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
 });
 const local=polys.flatMap(poly=>{
  const exterior=splitDateLine(poly[0]);
  return exterior.map(segment=>{
   const outer=clipRing(segment);
   if(!outer)return null;
   // Retain legitimate lake holes (e.g. the Caspian), assigned to the part
   // of a once-dateline-spanning landmass that actually contains each hole.
   const holes=poly.slice(1).filter(h=>insideRing(h[0],segment)).map(clipRing).filter(Boolean);
   return [outer,...holes];
  }).filter(Boolean);
 });
 return {type:"Feature",properties:{},geometry:{type:"MultiPolygon",coordinates:local}};
}
function setupMap(){
 if(!window.L){$("map-fallback").hidden=false;$("campaign-map").dataset.landStatus="unavailable";return;}
 try{
  const L=window.L;
  // The coastline has thousands of vertices across 357 clipped polygons.
  // Keep it on the SVG renderer: Canvas silently rendered only a tiny land
  // fragment after map moves on some Chromium/Leaflet combinations.
  state.map=L.map("campaign-map",{zoomControl:false,minZoom:3,maxZoom:12,maxBounds:[[20,-50],[80,100]],scrollWheelZoom:true,touchZoom:true,keyboard:true,preferCanvas:false,worldCopyJump:false,attributionControl:false});
  // Keep physical land below graticules and operational paths across renderers.
  const landPane=state.map.createPane?.("historical-land");
  if(landPane){landPane.style.zIndex="250";landPane.style.pointerEvents="none";}
  L.control.zoom({position:"topright"}).addTo(state.map);
  L.control.attribution({prefix:false}).addAttribution('Natural Earth / world-atlas 1:50m, public domain').addTo(state.map);
  const grid=L.layerGroup().addTo(state.map);
  for(let lon=-20;lon<=60;lon+=10){L.polyline([[32,lon],[73,lon]],{color:"#c6bda0",weight:.55,opacity:.27,interactive:false,dashArray:"3 6"}).addTo(grid);}
  for(let lat=35;lat<=70;lat+=5){L.polyline([[lat,-22],[lat,59]],{color:"#c6bda0",weight:.55,opacity:.22,interactive:false,dashArray:"3 6"}).addTo(grid);}
  state.mapMarkers=L.layerGroup().addTo(state.map);
  state.map.fitBounds(L.latLngBounds(D.campaigns.map(c=>[c.focus.lat,c.focus.lng])).pad(.23),{maxZoom:5,animate:false});
  state.map.on("zoomend moveend",drawMap);
  // Window resize alone misses container changes caused by layout or scaling.
  if(window.ResizeObserver){
   const observer=new window.ResizeObserver(()=>state.map.invalidateSize({pan:false}));
   observer.observe($("campaign-map"));
  }
  // 50m physical LAND TopoJSON. No modern administrative lines, cities or roads.
  // External CORS download is required. Failure leaves campaign markers available.
  if(window.fetch&&window.topojson){
   window.fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json")
    .then(resp=>{if(!resp.ok)throw Error("coastline dataset HTTP "+resp.status);return resp.json();})
    .then(world=>{
     if(!world.objects||!world.objects.land)throw Error("Unexpected land topology");
     const geo=europeanLand(window.topojson.feature(world,world.objects.land));
     if(!geo.geometry.coordinates.length)throw Error("European coastline geometry is empty");
     // A single MultiPolygon Feature produces ONE Leaflet Path, even when it
     // contains hundreds of independent islands. Canvas/SVG then paint the
     // entire set as one complex object, making visibility checks misleading
     // and redraws unreliable. Give each clipped land polygon its own Path.
     const landFeatures={type:"FeatureCollection",features:geo.geometry.coordinates.map(coordinates=>({
      type:"Feature",properties:{},geometry:{type:"Polygon",coordinates}
     }))};
     state.landLayer=L.geoJSON(landFeatures,{style:{color:"#586357",weight:.95,opacity:.96,fillColor:"#aaa991",fillOpacity:.97},interactive:false,pane:"historical-land",renderer:L.svg({pane:"historical-land"})});
     state.landLayer.addTo(state.map);
     if(state.landLayer.bringToBack)state.landLayer.bringToBack();
     grid.eachLayer(layer=>{if(layer.bringToFront)layer.bringToFront();});
     state.mapMarkers.eachLayer(layer=>{if(layer.bringToFront)layer.bringToFront();});
     $("map-fallback").hidden=true;
     $("campaign-map").dataset.landStatus="loaded";
    }).catch(err=>{$("map-fallback").textContent="Historical coastline unavailable: "+err.message+". Numbered campaigns and research dossiers still work; modern borders will not be shown.";$("map-fallback").hidden=false;$("campaign-map").dataset.landStatus="unavailable";});
  }else{
   $("map-fallback").textContent="Coastline library unavailable. Campaign pins still work, without modern political borders.";
   $("map-fallback").hidden=false;
   $("campaign-map").dataset.landStatus="unavailable";
  }
 }catch(err){$("map-fallback").textContent="Historical map unavailable: "+err.message;$("map-fallback").hidden=false;$("campaign-map").dataset.landStatus="unavailable";}
}
function drawMap(){
 if(!state.mapMarkers||!state.map)return;
 state.mapMarkers.clearLayers();
 if(window.AtlasNormandyOperations?.draw(state))return;
 const L=window.L,cs=visibleOnMap();
 const selectedCampaign=D.campaigns.find(c=>c.id===state.selected);
 const chosenPhase=selectedCampaign?.chapters?.find(ch=>ch.id===state.selectedChapter);
 // At local scale, devote the chart to this chapter's historical episodes.
 // A Europe-wide cluster placed over Normandy concealed those smaller points.
 // Zooming out restores the normal twenty-campaign navigator.
 const chapterMode=!!(selectedCampaign?.story&&chosenPhase&&state.map.getZoom()>=6);
 const episodes=chapterMode?selectedCampaign.moments.filter(e=>chosenPhase.start<=e.date&&e.date<=chosenPhase.end):[];
 if(chapterMode){
  $("map-heading").textContent="Normandy · "+episodes.length+" chapter episodes mapped";
  $("map-legend").textContent="Gold points = approximate episode locations; numbers group nearby events (click to choose). Zoom out to see other campaigns.";
  $("map-source-note").textContent="Locations are indicative, not aircraft tracks · Natural Earth coastlines, no modern borders";
 }else{
  $("map-heading").textContent=cs.length+" mapped · "+matching().filter(active).length+" active in "+mLabel(state.month);
  $("map-legend").innerHTML='<i class="marker-swatch campaign"></i> Numbered pins = campaign IDs; larger circles = cluster counts (click to choose)';
  $("map-source-note").textContent="Gold = active month · muted = other periods · Natural Earth coastlines, no modern borders";
 }
 // Only geographic CAMPAIGN centres here; German command losses are NOT map points.
 const pins=chapterMode?[]:cs.map(c=>({c,lat:c.focus.lat,lng:c.focus.lng,index:D.campaigns.findIndex(x=>x.id===c.id)+1}));
 const threshold=state.map.getZoom()>=9?0:state.map.getZoom()>=7?28:43;
 const groups=[];
 for(const p of pins){
  const xy=state.map.latLngToContainerPoint([p.lat,p.lng]);
  let chosen=null,closest=Infinity;
  if(threshold)for(const g of groups){
   const centre=g.map(q=>state.map.latLngToContainerPoint([q.lat,q.lng])).reduce((sum,v)=>({x:sum.x+v.x,y:sum.y+v.y}),{x:0,y:0});
   const dist=Math.hypot(xy.x-centre.x/g.length,xy.y-centre.y/g.length);
   if(dist<threshold&&dist<closest){chosen=g;closest=dist;}
  }
  if(chosen)chosen.push(p);else groups.push([p]);
 }
 for(const group of groups){
  const p=group[0],multi=group.length>1;
  const lat=group.reduce((x,q)=>x+q.lat,0)/group.length,lng=group.reduce((x,q)=>x+q.lng,0)/group.length;
  const selected=group.some(q=>state.selected===q.c.id);
  const icon=makeIcon(multi?group.length:String(p.index),multi?"cluster":"campaign",selected,!multi&&!active(p.c));
  const mk=L.marker([lat,lng],{icon,keyboard:true,title:multi?group.length+" campaigns nearby, zoom for details":p.c.name,zIndexOffset:selected?500:0});
  if(multi){
   const items=group.map(q=>'<button type="button" aria-current="'+(q.c.id===state.selected?"true":"false")+'" data-map-campaign="'+esc(q.c.id)+'">'+q.index+' · '+esc(q.c.name)+(q.c.id===state.selected?" · SELECTED":"")+'</button>').join("");
   mk.bindPopup('<div class="cluster-choices"><strong>'+group.length+' campaigns here</strong><p>Choose one directly, or zoom in to separate the markers.</p>'+items+'<button type="button" data-map-zoom>Zoom into group</button></div>',{maxWidth:280});
   mk.on("popupopen",e=>{
    const root=e.popup.getElement();
    root.querySelectorAll("[data-map-campaign]").forEach(b=>b.addEventListener("click",()=>{state.map.closePopup();pickCampaign(b.dataset.mapCampaign,true);}));
    root.querySelector("[data-map-zoom]")?.addEventListener("click",()=>{
     const bounds=L.latLngBounds(group.map(q=>[q.lat,q.lng]));
     state.map.closePopup();state.map.flyToBounds(bounds.pad(1),{maxZoom:Math.min(11,state.map.getZoom()+2)});
    });
   });
   mk.bindTooltip(group.map(q=>q.index+" · "+q.c.name).join(" / "),{direction:"top",opacity:.95});
  }else{
   mk.on("click",()=>pickCampaign(p.c.id,true));
   mk.bindTooltip(p.index+" · "+p.c.name+" · "+p.c.start+"–"+p.c.end,{direction:"top",opacity:.95});
  }
  state.mapMarkers.addLayer(mk);
 }
 // At local zoom, Normandy's selected chapter becomes a map-readable story.
 // Points denote approximate operational areas, not WWII fronts, sorties or loss sites.
 if(chapterMode){
  const clusters=[];
  for(const episode of episodes){
   const xy=state.map.latLngToContainerPoint([episode.lat,episode.lng]);
   const group=clusters.find(g=>{const p=state.map.latLngToContainerPoint([g[0].lat,g[0].lng]);return Math.hypot(xy.x-p.x,xy.y-p.y)<31;});
   if(group)group.push(episode);else clusters.push([episode]);
  }
  for(const group of clusters){
   const focused=group.some(e=>state.selectedMoment===e.date+"|"+e.title);
   const icon=L.divIcon({className:"gaw-icon",html:'<span class="story-map-point'+(focused?' selected':'')+'">'+(group.length>1?group.length:'●')+'</span>',iconSize:[24,24],iconAnchor:[12,12]});
   const mk=L.marker([group[0].lat,group[0].lng],{icon,keyboard:true,title:group.length>1?group.length+" campaign episodes":group[0].title,zIndexOffset:focused?1100:800});
   if(group.length===1){const e=group[0];mk.on("click",()=>selectMoment(selectedCampaign.id,e.date,e.lat,e.lng,e.title));mk.bindTooltip(e.date+" · "+e.title);}
   else{
    mk.bindPopup('<div class="cluster-choices"><strong>'+group.length+' nearby historical episodes</strong>'+group.map(e=>'<button type="button" data-story-date="'+esc(e.date)+'" data-story-title="'+esc(e.title)+'">'+esc(e.date+' · '+e.title)+'</button>').join("")+'</div>',{maxWidth:310});
    mk.on("popupopen",ev=>ev.popup.getElement().querySelectorAll("[data-story-date]").forEach(b=>b.addEventListener("click",()=>{
     const e=group.find(x=>x.date===b.dataset.storyDate&&x.title===b.dataset.storyTitle);
     if(e){state.map.closePopup();selectMoment(selectedCampaign.id,e.date,e.lat,e.lng,e.title);}
    })));
   }
   state.mapMarkers.addLayer(mk);
  }
 }
}
function renderTime(){
 $("date-slider").value=String(monthIdx(state.month));$("date-display").textContent=mLabel(state.month);
 $("prev-month").disabled=monthIdx(state.month)===0;$("next-month").disabled=monthIdx(state.month)===LMAX-LMIN;
 $("theater-select").value=state.theater;$("campaign-search").value=state.search;$("all-campaigns").checked=state.all;
 $("coverage-label").textContent=visibleOnMap().length+" shown of "+matching().length+" matching · "+matching().filter(active).length+" active";
 $("map-heading").textContent=visibleOnMap().length+" mapped · "+matching().filter(active).length+" active in "+mLabel(state.month);
}

const evidenceGroups = [
 {id:"aircraft-losses", title:"Aircraft losses", measures:["losses","losses-subset","writeoffs"]},
 {id:"personnel-casualties", title:"Personnel casualties", measures:["casualties"]},
 {id:"sorties", title:"Sorties", measures:["sorties","sorties-subset"]},
 {id:"aircraft-damage", title:"Aircraft damage", measures:["damage"]},
 {id:"victory-claims", title:"Victory claims", measures:["claims","enemy-claims"]},
 {id:"other", title:"Other operational figures", measures:[]}
];

function groupEvidence(facts) {
 const groups = evidenceGroups.map(group => ({...group, facts:[]}));
 for (const fact of facts) {
  const measure = fact.measure || (/\bsorties\b/i.test(fact.unit) ? "sorties" : "");
  const group = groups.find(candidate => candidate.measures.includes(measure)) || groups.at(-1);
  group.facts.push(fact);
 }
 return groups.filter(group => group.facts.length);
}

function renderCampaignFact(fact) {
 const prefix = /lower[- ]bound/.test(fact.type || "") ? "&gt; " : fact.type?.includes("approximate") ? "≈ " : "";
 return '<article class="fact"><b>'+prefix+fmt(fact.value)+'</b>'+
  '<span class="fact-unit">'+esc(fact.unit)+'</span><p>'+esc(fact.label)+'</p>'+
  '<small>'+esc(fact.scope)+' · '+esc(fact.period || fact.date)+' · '+esc(fact.type)+'</small>'+
  sourceLink(fact.sourceId,"Inspect this figure's source")+'</article>';
}

function renderCampaignEvidence(facts) {
 return groupEvidence(facts).map(group =>
  '<section class="campaign-evidence-group" data-evidence-group="'+group.id+'"><h4>'+group.title+'</h4><div class="fact-grid">'+
  group.facts.map(renderCampaignFact).join("")+'</div></section>'
 ).join("");
}

/* A cross-side audit is visible for EVERY campaign and EVERY dated event.
   It never infers reciprocal aircraft losses from claims, differing windows or unknown unit coverage. */
function directEventFacts(c,date){
 return (c.facts||[]).filter(f=>f.date===date && /^\d{4}-\d{2}-\d{2}$/.test(f.date) && !f.period);
}
function bilateralEvidenceState(c,date){
 const own=directEventFacts(c,date).filter(f=>f.measure==="losses"&&f.side&&!(f.type||"").includes("claims"));
 const sides=new Set(own.map(f=>f.side==="Germany"||f.side==="Italy"?"Axis":f.side==="Soviet"?"Soviet":f.side));
 const pair=(sides.has("Allies")&&sides.has("Axis"))||(sides.has("Soviet")&&sides.has("Axis"));
 const claim=c.opponentReturnSeries?.days?.find(x=>x.date===date);
 return {own,pair,claim,dayFacts:directEventFacts(c,date)};
}
function renderBilateralCoverage(c){
 const dateChecks=c.moments.map(e=>bilateralEvidenceState(c,e.date));
 const paired=dateChecks.filter(x=>x.pair).length;
 const claims=dateChecks.filter(x=>!x.pair&&x.claim).length;
 const oneSided=dateChecks.filter(x=>!x.pair&&!x.claim&&x.dayFacts.length).length;
 const uncovered=dateChecks.length-paired-claims-oneSided;
 const sourceReview=c.comparisons?.length||0;
 return '<section class="bilateral-overview" data-bilateral-campaign="'+esc(c.id)+'">'+
 '<h3>Opposing forces & losses · evidence coverage</h3>'+
 '<p><strong>'+paired+'</strong> event(s) with both sides’ same-day loss records · <strong>'+claims+'</strong> claim-versus-record event(s) · <strong>'+oneSided+'</strong> with date-specific figures from incomplete populations · <strong>'+uncovered+'</strong> needing event-level numbers.</p>'+
 '<p class="comparison-caution">Even when both sides appear on the same date, their geographical coverage, aircraft classes and loss definitions may differ. No aircraft exchange ratio is computed automatically. '+(sourceReview?'Additional campaign-level comparison studies: '+sourceReview+'.':'No audited campaign-level reciprocal comparison table yet.')+'</p>'+
 '</section>';
}
function renderEventBilateralEvidence(c,date){
 const {own,pair,claim,dayFacts}=bilateralEvidenceState(c,date);
 const claimRows=claim?renderBritainClaimReview(c,date):"";
 const estimate=window.AtlasClaimLosses?.renderEventEstimate(c.id,date,dayFacts)||"";
 const groups=groupEvidence(dayFacts);
 const rows=evidence=>evidence.flatMap(group=>group.facts).map(f=>'<li data-evidence-side="'+esc(f.side||"unclassified")+'"><strong>'+fmt(f.value)+' '+esc(f.unit)+'</strong> · '+esc(f.label)+' <small>('+esc(f.side||"side not independently classified")+'; '+esc(f.type||"unspecified")+')</small> '+sourceLink(f.sourceId,"Source")+'</li>').join("");
 const list=evidence=>evidence.length?'<ul>'+rows(evidence)+'</ul>':"";
 const recordedLosses=estimate?groups.filter(group=>group.id==="aircraft-losses"):groups;
 const laterFigures=estimate?groups.filter(group=>group.id!=="aircraft-losses"):[];
 const intro=pair?"Both sides have a dated own-loss observation; definitions still need to be checked before comparison.":
 claim?"Wartime victory claims can be contrasted with German records; this is NOT a two-sided own-loss comparison.":
 estimate?"The dated Soviet figures and a working estimate for two Bobruisk-based German groups cover different populations.":
 dayFacts.length?"Some same-date figures exist, but a matching, independently attributable opponent loss ledger is not available for this event.":
 "No verified opposing-force aircraft losses or operational-strength figures are scoped to this EXACT event date. Campaign totals are not automatically assigned to this day.";
 return '<section class="event-bilateral" data-bilateral-status="'+(pair?"paired-own-losses":claim?"claim-versus-record":dayFacts.length?"partial":"no-matched-data")+'"><h4>Both sides: strength, losses and evidence gaps</h4><p>'+esc(intro)+'</p>'+list(recordedLosses)+estimate+list(laterFigures)+claimRows+'</section>';
}

function destroyedPer100(claims,destroyed) {
 return claims>0?String(Math.round(100*destroyed/claims)):"Unavailable";
}

function septemberEstimateCheck(series) {
 const target=series.days.find(row=>row.date==="1940-09-15");
 if(!target)return "";
 const peers=series.days.filter(row=>
  row.date>="1940-09-07"&&row.date<="1940-09-30"&&row.date!==target.date&&
  row.sourceId===target.sourceId&&row.rafClaim>0
 );
 if(peers.length<2)return "";
 const estimates=peers.map(row=>target.rafClaim*row.germanDestroyed/row.rafClaim);
 const low=Math.floor(Math.min(...estimates)),high=Math.ceil(Math.max(...estimates));
 const peerDates=peers.map(row=>row.date).join(" and ");
 return '<p class="claim-estimate-check"><strong>Test estimate for 15 September: '+low+'–'+high+' aircraft destroyed.</strong> '+
  'Applying the observed ratios on '+esc(peerDates)+' to the '+fmt(target.rafClaim)+' claims gives this range. '+
  'The published return records '+fmt(target.germanDestroyed)+'. This held-out check tests the method on a known day. '+
  'A reliable estimate for a missing day needs more comparable observations.</p>';
}

function renderBritainClaimReview(c,date) {
 const series=c.opponentReturnSeries;
 const row=series?.days.find(row=>row.date===date);
 if(!row)return "";
 return '<section class="event-review-claim" aria-label="Claims and recorded losses">'+
  '<strong>'+destroyedPer100(row.rafClaim,row.germanDestroyed)+' German aircraft recorded destroyed per 100 RAF claims</strong>'+
  '<span>The published comparison for '+esc(date)+' lists '+fmt(row.germanDestroyed)+' destroyed, '+fmt(row.germanDamaged)+' damaged and '+fmt(row.rafClaim)+' claims of destruction. The ratio compares the day’s totals.</span>'+
  (date==="1940-09-15"?septemberEstimateCheck(series):"")+
  sourceLink(row.sourceId,"1947 Parliamentary comparison")+'</section>';
}

function renderBritainOpponentReturns(c){
 const s=c.opponentReturnSeries;if(!s)return "";
 const head='<tr><th scope="col">Window</th><th scope="col">German destroyed</th><th scope="col">German damaged</th><th scope="col">RAF claims of destruction</th><th scope="col">Destroyed per 100 claims</th></tr>';
 const cells=row=>'<td>'+fmt(row.germanDestroyed)+'</td><td>'+fmt(row.germanDamaged)+'</td><td>'+fmt(row.rafClaim)+'</td><td>'+destroyedPer100(row.rafClaim,row.germanDestroyed)+'</td>';
 const periods=s.periods.map(x=>'<tr><th scope="row">'+esc(x.start)+'–'+esc(x.end)+'</th>'+cells(x)+'</tr>').join("");
 const days=s.days.map(x=>'<tr><th scope="row">'+esc(x.date)+'</th>'+cells(x)+'</tr>').join("");
 return '<section class="opponent-returns" data-opponent-returns="britain"><h4>RAF claims versus original German loss returns · 1940</h4>'+
 '<p>Five reporting periods and seven selected days from a 1947 Parliamentary comparison. Days are INCLUDED in the periods, never additional losses.</p>'+
 '<div class="operational-table-scroll"><table><thead>'+head+'</thead><tbody>'+periods+'</tbody></table></div>'+
 '<h4>Seven separately documented battle days</h4><div class="operational-table-scroll"><table><thead>'+head+'</thead><tbody>'+days+'</tbody></table></div>'+
 '<p class="comparison-caution">'+esc(s.explanation)+'</p>'+septemberEstimateCheck(s)+sourceLink(s.sourceId,"Read full Hansard archival table")+'</section>';
}

function renderCampaignComparisons(c){
 const blocks=[];
 const byId=new Map((c.facts||[]).filter(f=>f.id).map(f=>[f.id,f]));
 for(const comp of c.comparisons||[]){
  const entries=(comp.rows||[]).map(row=>{
   const f=(row.factId&&byId.get(row.factId))||(row.factLabel&&c.facts.find(x=>x.label===row.factLabel));
   if(!f)return '<div class="comparison-cell comparison-unknown">Source observation unavailable; no substitute zero.</div>';
   const prefix=/lower[- ]bound/.test(f.type||"")? "&gt; ":f.type?.includes("approximate")?"≈ ":"";
   return '<article class="comparison-cell" data-evidence-id="'+esc(f.id||f.label)+'"><span class="comparison-side">'+esc(row.side)+'</span><strong>'+prefix+fmt(f.value)+'</strong><small>'+esc(f.unit)+' · '+esc(f.date)+'</small>'+sourceLink(f.sourceId,"View original reporting source")+'</article>';
  }).join("");
  blocks.push('<section class="comparison-section" data-comparison-quality="'+esc(comp.quality||"caution")+'"><h4>'+esc(comp.title)+'</h4><p class="comparison-metric">'+esc(comp.measure)+'</p><div class="comparison-grid">'+entries+'</div><p class="comparison-caution">'+esc(comp.caution)+'</p></section>');
 }
 const series=c.operationalSeries;
 if(series&&Array.isArray(series.rows)){
  const lines=series.rows.map(row=>'<tr><th scope="row">'+esc(row.date)+'</th><td>'+fmt(row.german)+'</td><td>'+fmt(row.italian)+'</td><td>'+fmt(row.german+row.italian)+'</td></tr>').join("");
  blocks.push('<section class="operational-series" data-series="german-italian-aircraft"><h4>'+esc(series.title)+'</h4><p class="comparison-metric">'+esc(series.metric)+'</p><div class="operational-table-scroll"><table><thead><tr><th scope="col">Date</th><th scope="col">German</th><th scope="col">Italian</th><th scope="col">Same-day total</th></tr></thead><tbody>'+lines+'</tbody></table></div><p class="comparison-caution">'+esc(series.description)+'</p>'+sourceLink(series.sourceId,"Inspect historical table")+'</section>');
 }
 if(c.opponentReturnSeries)blocks.push(renderBritainOpponentReturns(c));
 if(c.id==="schweinfurt"){
  const returnFacts=c.facts.filter(f=>f.date==="1943-10-14"&&f.sourceId==="nationalWWIISchweinfurt");
  const loss=returnFacts.find(f=>f.measure==="losses"),claim=returnFacts.find(f=>f.measure==="claims");
  if(loss&&claim)blocks.push('<section class="comparison-section"><h4>Claims and recorded losses on 14 October 1943</h4>'+
   '<p>'+fmt(loss.value)+' German fighters destroyed per '+fmt(claim.value)+' U.S. bomber-gunner claims, or '+destroyedPer100(claim.value,loss.value)+' per 100 claims. This comparison uses the museum’s published totals for the Schweinfurt raid. The German records report write-offs and damage separately.</p>'+
   sourceLink(loss.sourceId,"Read the museum’s source comparison")+'</section>');
 }
 return blocks.length?'<div class="campaign-comparisons"><h3>Operational strength & losses · inspect before comparing</h3><p class="comparison-intro">Only matching dates, units and accounting definitions may be compared directly. A snapshot is not a sortie; a claim is not a confirmed loss.</p>'+blocks.join("")+'</div>':"";
}
function renderDossier(){
 const c=D.campaigns.find(x=>x.id===state.selected);
 if(state.lastDossierId!==state.selected){$("campaign-dossier").scrollTop=0;state.lastDossierId=state.selected;}
 if(!c){
  $("dossier-meta").textContent="NO CAMPAIGN MATCHES THE FILTERS";
  $("dossier-title").textContent="Adjust your search or region";
  $("dossier-facts-heading").textContent="No matching campaign evidence";
  ["dossier-dates","dossier-aim","dossier-turn","dossier-outcome","dossier-uncertainty"].forEach(id=>$(id).textContent="");
  ["dossier-forces","dossier-facts","dossier-sources","dossier-link-detail"].forEach(id=>$(id).innerHTML="");
  $("dossier-research-context").textContent="No historical observations are assigned to an empty selection.";
  return;
 }
 $("dossier-meta").textContent="BATTLE DOSSIER · "+campaignRegion(c)+(active(c)?" · ACTIVE":" · OTHER PERIOD");
 $("dossier-title").textContent=c.name;
 $("dossier-facts-heading").textContent=c.facts.length?"Campaign evidence · "+countPhrase(c.facts.length,"sourced figure","sourced figures"):"Numerical evidence · not yet audited";
 $("dossier-dates").textContent=mLabel(c.start)+" — "+mLabel(c.end)+" · approximate focus: "+c.focus.lat.toFixed(1)+"°, "+c.focus.lng.toFixed(1)+"°";
 $("dossier-aim").textContent=c.objective;$("dossier-turn").textContent=c.turningPoint;$("dossier-outcome").textContent=c.consequence;
 $("dossier-forces").innerHTML=c.participants.map(x=>'<span class="force-chip">'+esc(x)+'</span>').join("");
 $("dossier-facts").innerHTML=(c.facts.length?renderCampaignEvidence(c.facts):'<div class="no-evidence">No campaign-local numerical observation has been source-audited here. This does <strong>not</strong> mean there were zero aircraft, sorties or losses. The dossier still includes '+countPhrase(c.moments.length,"dated event","dated events")+' and '+countPhrase(c.sources.length,"linked research source","linked research sources")+'.</div>')+renderBilateralCoverage(c)+renderCampaignComparisons(c);
 $("dossier-uncertainty").textContent=c.uncertaintyNote||"Campaign evidence coverage is incomplete. Reported counts are limited to the specific source populations and periods shown, not comparable totals for every belligerent.";
 $("dossier-sources").innerHTML=c.sources.map(id=>sourceLink(id)).join("");
 const norm=c.id==="normandy",lossScope=norm?"normandy-campaign":c.id==="britain"?"britain-campaign":"";
 const links=norm?['<a href="./grand-air-war-v76.html">Explore the dated Normandy airfield notebook ↗</a>']:[];
 if(norm)links.push('<a href="./operations-1944.html?preset=d-day">D-Day air operations timeline</a>');
 if(c.id==="bigweek")links.push('<a href="./operations-1944.html?preset=big-week">Big Week mission and loss records</a>');
 if(lossScope)links.push('<a href="?loss-scope='+lossScope+'#claim-loss-calculator" data-claim-scope="'+lossScope+'">Compare campaign claims and losses</a>');
 $("dossier-link-detail").innerHTML=links.length?'<div class="dossier-links">'+links.join("")+'</div>':'';
 $("dossier-link-detail").querySelector?.('[data-claim-scope]')?.addEventListener('click',event=>{
  if(window.AtlasClaimLosses?.openCalculator(lossScope))event.preventDefault();
 });
 // Never offer unverified theater- or command-wide numbers as a battle-specific action.
 $("dossier-research-context").textContent="Campaign dossier: "+countPhrase(c.facts.length,"source-scoped numeric observation","source-scoped numeric observations")+" and "+countPhrase(c.moments.length,"dated event","dated events")+". The independent research laboratory is not this battle's loss ledger.";
}

function renderCampaignList(){
 const rows=matching().sort((a,b)=>a.start.localeCompare(b.start)||D.campaigns.indexOf(a)-D.campaigns.indexOf(b));
 $("campaign-count").textContent=rows.filter(active).length+" active of "+rows.length;
 $("campaign-list").innerHTML=rows.length?rows.map(c=>'<button type="button" data-campaign="'+esc(c.id)+'" aria-current="'+(c.id===state.selected?'true':'false')+'" class="record '+(c.id===state.selected?"selected ":"")+(active(c)?"":"muted")+'"><span><strong>'+(D.campaigns.findIndex(x=>x.id===c.id)+1)+'. '+esc(c.name)+(c.id===state.selected?" · SELECTED":"")+'</strong><small>'+esc(campaignRegion(c))+' · '+countPhrase((c.chapters||[]).length,"phase","phases")+' · '+countPhrase(c.moments.filter(e=>e.summary).length,c.story?"researched episode":"researched event",c.story?"researched episodes":"researched events")+' · '+countPhrase(c.facts.length,"source-scoped figure","source-scoped figures")+'</small></span><span class="date-tag">'+esc(c.start.slice(0,4))+(active(c)?" · ACTIVE":"")+'</span></button>').join(""):'<div class="empty">No matching campaigns. Try another theater or search term.</div>';
 $("campaign-list").querySelectorAll("[data-campaign]").forEach(b=>b.addEventListener("click",()=>pickCampaign(b.dataset.campaign)));
}
function renderMoments(){
 const c=D.campaigns.find(x=>x.id===state.selected&&matches(x));
 const all=(c?.moments||[]).map(e=>({...e,cid:c.id})).sort((a,b)=>a.date.localeCompare(b.date));
 const chapters=c?.chapters||[];
 if(!chapters.some(ch=>ch.id===state.selectedChapter))state.selectedChapter=chapters[0]?.id||null;
 const chosenChapter=chapters.find(ch=>ch.id===state.selectedChapter);
 const scoped=chosenChapter?all.filter(e=>chosenChapter.start<=e.date&&e.date<=chosenChapter.end):all;
 const researched=all.filter(e=>e.summary).length;
 const storyHost=$("campaign-story");
 const story=c?.story;
 $("guide-intro").textContent=story?"Follow the connected chapters, then inspect the dated operations. Choosing a Normandy chapter aligns the map month and shows its approximate episode locations; the time slider remains available for independent exploration.":"First follow the operational phases. See how the ground situation and the air war changed, then open individual dated evidence. The monthly map controls are a separate time filter.";
 $("campaigns").classList?.toggle("benchmark-story-mode",Boolean(story));
 storyHost.hidden=!story;
 if(story){storyHost.innerHTML='<span class="eyebrow">NORMANDY 1944 · HISTORICAL STORY</span><h3>'+esc(story.question)+'</h3>'+story.introduction.map(p=>'<p>'+esc(p)+'</p>').join("")+'<div class="story-credentials"><strong>'+chapters.length+' chapters · '+researched+' researched episodes</strong><span>Official Allied, Canadian and German-source histories; uncertainty kept visible</span><a href="'+esc(story.notebook)+'">Explore the 16-scene forward-airfield notebook ↗</a></div>';}
 else storyHost.innerHTML='';
 $("moment-count").textContent=c?(chapters.length?countPhrase(chapters.length,story?"chapter":"phase",story?"chapters":"phases")+" · ":"")+countPhrase(researched,story?"episode":"researched event",story?"episodes":"researched events")+(story?" ("+all.filter(e=>e.dating==="period-anchor").length+" period anchors)":"")+(all.length-researched?" · "+countPhrase(all.length-researched,"calendar marker","calendar markers"):""):"No campaign selected";
 $("chapter-coverage").textContent=chapters.length?"Source-backed historical progression":"Phase breakdown not yet source-audited";
 $("chapter-list").innerHTML=!c?'<div class="empty">Select a campaign above to read its progression.</div>':chapters.length?chapters.map((ch,i)=>{
  const inPhase=all.filter(e=>ch.start<=e.date&&e.date<=ch.end),n=inPhase.filter(e=>e.summary).length,markers=inPhase.length-n,selected=ch.id===state.selectedChapter;
  return '<button type="button" class="chapter-card'+(selected?' selected':'')+'" aria-pressed="'+selected+'" data-chapter="'+esc(ch.id)+'"><span class="chapter-index">'+String(i+1).padStart(2,"0")+'</span><span class="chapter-card-copy"><strong>'+esc(ch.title)+'</strong><small>'+esc(ch.start)+' → '+esc(ch.end)+'</small><em>'+countPhrase(n,"researched event","researched events")+(markers?" · "+countPhrase(markers,"calendar marker","calendar markers"):"")+'</em></span></button>';
 }).join(""):'<div class="chapter-unresearched">No reliable multi-stage history has been reviewed for this campaign yet. The campaign overview and its dated source records remain available below; individual markers do not establish a complete chronology.</div>';
 $("chapter-list").querySelectorAll("[data-chapter]").forEach(b=>b.addEventListener("click",()=>selectChapter(b.dataset.chapter)));
 const field=(label,value)=>'<div class="chapter-field"><h4>'+label+'</h4><p>'+esc(value)+'</p></div>';
 if(chosenChapter){
  const currentIndex=chapters.indexOf(chosenChapter),nextChapter=chapters[currentIndex+1],prevChapter=chapters[currentIndex-1];
  const longform=chosenChapter.story?'<div class="chapter-longform"><span class="eyebrow">THE HISTORICAL NARRATIVE</span>'+chosenChapter.story.map(p=>'<p>'+esc(p)+'</p>').join("")+'</div>'+field('The German perspective',chosenChapter.axis)+field('How this leads to the next chapter',chosenChapter.bridge):'';
  const navigation=story?'<div class="chapter-navigation">'+(prevChapter?'<button type="button" class="subtle" data-read-chapter="'+esc(prevChapter.id)+'">← Previous: '+esc(prevChapter.title)+'</button>':'<span>Start of the Normandy account</span>')+(nextChapter?'<button type="button" class="subtle" data-read-chapter="'+esc(nextChapter.id)+'">Next: '+esc(nextChapter.title)+' →</button>':'<span>End of the Normandy account</span>')+'</div>':'';
  $("chapter-detail").innerHTML='<div class="chapter-detail-top"><span class="eyebrow">'+(story?'CHAPTER '+(currentIndex+1)+' OF '+chapters.length+' · ':'')+esc(chosenChapter.start)+' → '+esc(chosenChapter.end)+' · '+esc(chosenChapter.location)+'</span><h3>'+esc(chosenChapter.title)+'</h3></div>'+longform+field('What was happening on the ground',chosenChapter.situation)+field('What aircraft actually did',chosenChapter.airRole)+field('Why this phase matters',chosenChapter.change)+'<p class="chapter-limit"><strong>Evidence boundary:</strong> '+esc(chosenChapter.limits)+'</p><div class="dossier-links">'+chosenChapter.sourceIds.map(id=>sourceLink(id)).join("")+'</div>'+navigation;
  $("chapter-detail").querySelectorAll("[data-read-chapter]").forEach(b=>b.addEventListener("click",()=>selectChapter(b.dataset.readChapter)));
 }else if(c){
  $("chapter-detail").innerHTML='<div class="chapter-detail-top"><span class="eyebrow">Campaign-level context · '+esc(mLabel(c.start))+' to '+esc(mLabel(c.end))+'</span><h3>What the available research establishes</h3></div>'+field('Military and air objectives',c.objective)+field('Main developments',c.turningPoint)+field('Result',c.consequence)+'<p class="chapter-limit"><strong>Coverage gap:</strong> These are campaign-wide statements. We have not established source-backed phase dates or unit-level aviation activity for each step.</p><div class="dossier-links">'+c.sources.map(id=>sourceLink(id)).join("")+'</div>';
 }else{$("chapter-detail").innerHTML='';}
 const scopedResearch=scoped.filter(e=>e.summary).length;
 $("moment-scope").textContent=chosenChapter?countPhrase(scopedResearch,"researched event","researched events")+(scoped.length-scopedResearch?" · "+countPhrase(scoped.length-scopedResearch,"marker","markers"):""):countPhrase(scopedResearch,"researched event","researched events")+" · partial coverage";
 $("moment-list").innerHTML=scoped.length?scoped.map(e=>{
  const selected=state.selectedMoment===e.date+"|"+e.title;
  return '<button type="button" class="record '+(selected?'selected':'')+'" aria-current="'+selected+'" data-moment="'+esc(e.cid)+'" data-date="'+esc(e.date)+'" data-title="'+esc(e.title)+'" data-lat="'+e.lat+'" data-lng="'+e.lng+'"><span><strong>'+esc(e.title)+'</strong><small>'+esc(e.place)+(e.dating==="period-anchor"?' · Period context (representative date)':e.summary?' · Detailed research':' · Date marker, not yet an air-operation dossier')+'</small></span><span class="date-tag">'+esc(e.date)+(e.date.slice(0,7)===state.month?' · MAP MONTH':'')+'</span></button>';
 }).join(""):'<div class="empty">No individual dated event has been researched for this phase. The source-backed phase narrative above does not imply there were no aircraft or operations.</div>';
 $("moment-list").querySelectorAll("[data-moment]").forEach(b=>b.addEventListener("click",()=>selectMoment(b.dataset.moment,b.dataset.date,Number(b.dataset.lat),Number(b.dataset.lng),b.dataset.title)));
 const chosen=scoped.find(e=>e.date+"|"+e.title===state.selectedMoment);
 $("moment-detail").hidden=!chosen;
 if(!chosen){$("moment-detail").innerHTML='';return;}
 const detail=chosen.summary?(chosen.airAction?'<h4>What happened and why</h4><p>'+esc(chosen.summary)+'</p><h4>Air operations and their limits</h4><p>'+esc(chosen.airAction)+'</p><h4>German perspective</h4><p>'+esc(chosen.opposingView)+'</p>':'<p>'+esc(chosen.summary)+'</p><h4>Units and reporting scope</h4><p>'+esc(chosen.units||"Air units not yet individually verified")+'</p>')+'<h4>What changed</h4><p>'+esc(chosen.outcome||"Event-level effects not yet quantified")+'</p><p class="evidence-confidence">Evidence limit: '+esc(chosen.confidence||"No event-level source audit")+'</p>':'<p>This is a dated campaign marker, not yet an event-level research dossier. The general campaign sources do not prove individual missions, unit positions or losses.</p>';
 const ids=chosen.sourceIds?.length?chosen.sourceIds:c.sources;
 $("moment-detail").innerHTML='<span class="eyebrow">'+esc(chosen.date)+' · '+esc(chosen.place)+(chosen.dating==="period-anchor"?' · PERIOD CONTEXT / REPRESENTATIVE DATE':'')+'</span><h3>'+esc(chosen.title)+'</h3>'+detail+renderEventBilateralEvidence(c,chosen.date)+'<div class="dossier-links">'+ids.map(id=>sourceLink(id)).join("")+'</div>';
 $("moment-detail").querySelector?.('[data-claim-scope]')?.addEventListener('click',event=>{
  if(window.AtlasClaimLosses?.openCalculator(event.currentTarget.dataset.claimScope))event.preventDefault();
 });
}
function lossSource(r){const s=sourceIndex[r.sourceId];return s?'<a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.short)+' · PDF page '+(r.page??"see source")+' ↗</a>':"";}
function lossFields(){const k=state.lossOutcome==="destroyed"?"Destroyed":"Damaged";return ["enemy"+k,"otherOperational"+k,"nonOperational"+k];}
function getLossData(){return lossRows.filter(x=>x.theater===state.lossCommand&&(state.lossWindow==="all"||x.period.startsWith(state.lossWindow))); }
function plotStacked(rows,valueKeys,labels,palette,selected,onClick){
 const n=rows.length,w=Math.max(700,n*50+100),h=305,pad={l:49,r:14,t:20,b:51};
 const ymax=Math.max(1,...rows.map(r=>valueKeys.reduce((s,k)=>s+(Number.isFinite(r[k])?r[k]:0),0)))*1.12;
 const bw=Math.min(31,(w-pad.l-pad.r)/Math.max(1,n)*.65),gap=(w-pad.l-pad.r)/Math.max(1,n);
 let svg='<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="Historical source observations, choose bars to inspect details">';
 for(let j=0;j<=4;j++){const v=ymax*j/4,y=pad.t+(h-pad.t-pad.b)*(1-j/4);svg+='<line class="gridline" x1="'+pad.l+'" y1="'+y+'" x2="'+(w-pad.r)+'" y2="'+y+'"/><text x="'+(pad.l-5)+'" y="'+(y+3)+'" text-anchor="end">'+Math.round(v)+'</text>';}
 for(let i=0;i<n;i++){
  const r=rows[i],key=r.period||r.month,x=pad.l+gap*(i+.5),barx=x-bw/2;
  let y=h-pad.b;
  if(valueKeys.every(k=>r[k]===null||r[k]===undefined)){
   svg+='<rect class="missing-observation" data-chart-index="'+i+'" role="button" tabindex="0" aria-label="'+esc(key+' · no observation, inspect missing record')+'" x="'+barx.toFixed(1)+'" y="'+(h-pad.b-14)+'" width="'+bw+'" height="14" fill="#4e6470" opacity=".55"><title>No reported value, not zero</title></rect>';
  }
  for(let j=0;j<valueKeys.length;j++){
   const v=r[valueKeys[j]],height=Number.isFinite(v)?(h-pad.t-pad.b)*v/ymax:0;
   if(Number.isFinite(v)&&height>0){
    y-=height;svg+='<rect class="data-bar '+(key===selected?"selected":"")+'" role="button" tabindex="0" aria-label="'+esc(key+" · "+labels[j]+" "+fmt(v)+"; inspect observation")+'" data-chart-index="'+i+'" x="'+barx.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw+'" height="'+height.toFixed(1)+'" fill="'+palette[j]+'"><title>'+esc(key+" · "+labels[j]+" "+fmt(v))+'</title></rect>';
   }
  }
  const label=key?.length===7?key.slice(5)+"/"+key.slice(2,4):String(key??"");
  svg+='<text x="'+x.toFixed(1)+'" y="'+(h-pad.b+17)+'" text-anchor="middle">'+esc(label)+'</text>';
 }
 svg+='</svg><div class="chart-legend">'+labels.map((x,i)=>'<span><i style="background:'+palette[i]+'"></i>'+esc(x)+'</span>').join("")+'</div>';
 return svg;
}
function bindChartBars(root,selector,choose){
 root.querySelectorAll(selector).forEach(e=>{
  e.addEventListener("click",()=>choose(Number(e.dataset.chartIndex)));
  e.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();choose(Number(e.dataset.chartIndex));}});
 });
}
function renderLosses(){
 const r=getLossData();$("loss-command").value=state.lossCommand;$("loss-outcome").value=state.lossOutcome;$("loss-window").value=state.lossWindow;
 const keys=lossFields(),labels=["Enemy action","Other operational","Non-operational"],palette=["#dbab7d","#8fb4d4","#7ec5b0"];
 const root=$("loss-chart");
 root.innerHTML=r.length?plotStacked(r,keys,labels,palette,state.lossMonth):'<div class="empty">There are no original German monthly totals for this selected reporting command and year.</div>';
 bindChartBars(root,"[data-chart-index]",i=>{state.lossMonth=r[i].period;renderLosses();});
 const row=r.find(x=>x.period===state.lossMonth)||r[r.length-1];
 if(row){state.lossMonth=row.period;
  const total=state.lossOutcome==="destroyed"?row.destroyed:row.damaged;
  $("loss-detail").innerHTML='<h3>'+esc(mLabel(row.period))+' · '+esc(state.lossCommand)+'</h3><p><strong>'+fmt(total)+' '+esc(state.lossOutcome)+'</strong> (all aircraft types, documented wartime command total). Cause categories:</p><div class="cause-grid">'+keys.map((k,i)=>'<div><b>'+fmt(row[k])+'</b><span>'+labels[i]+'</span></div>').join("")+'</div><p>Missing aircraft: '+fmt(row.missing)+' (subset of enemy destroyed, NOT another loss category). Damaged and destroyed are separate outcomes.</p>'+lossSource(row);
 }else $("loss-detail").textContent="No corresponding observed month.";
}
function renderCoverage(){
 const n=lossRows.length,group=groupRows.length,sov=P.soviet.length;
 $("coverage-matrix").innerHTML=[
 ["German command loss returns",n+" recorded month-commands","Reich & West, Sep 1943–Nov 1944","Present"],
 ["USAAF combat group strength",groupRows.filter(r=>r.totalCombatGroups!==null).length+" reported totals / "+group+" theater-month rows","ETO & MTO, Feb 1942–May 1945; blanks are unavailable","Present"],
 ["VVS front and reserve strength",sov+" dated snapshots","Jul 1943–May 1945, excludes PVO/naval","Present"],
 ["USAAF factory acceptances",V.usaFactory.length+" months","Worldwide, not European airfield deployment","Present"],
 ["Eastern German aircraft loss returns","Not transcribed here","Do not replace with Western returns","Missing"],
 ["RAF/USAAF localized daily losses","Partial isolated campaign records","Not a complete all-front ledger","Partial"]
 ].map(x=>'<div class="coverage-item '+(x[3]==="Missing"?"missing":"")+'"><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span><br><em>'+esc(x[2])+'</em></div>').join("");
}
function forcePoints(){
 if(state.forceSeries==="usaaf")return groupRows.filter(r=>r.theater===state.forceArea).map(r=>({month:r.month,period:r.month,value:r[state.forceMetric],...r}));
 if(state.forceSeries==="vvs")return P.soviet.map(r=>{const t=Legacy.at(r.i),m=t.y+"-"+String(t.m+1).padStart(2,"0");return {period:m,month:m,value:r.total,fighters:r.fighters,unserviceable:r.unserviceableFighters,source:r.source,date:r.date};});
 return V.usaFactory.map(r=>({period:r.period,month:r.period,value:r.all,fighters:r.fighters,heavy:r.heavy,medium:r.medium,noncombat:r.noncombat}));
}
function forceTitle(){
 if(state.forceSeries==="usaaf")return state.forceArea+" · "+state.forceMetric;
 if(state.forceSeries==="vvs")return "VVS front air forces and command reserves · all aircraft";
 return "USAAF worldwide monthly factory acceptances · all aircraft";
}
function renderForces(){
 $("force-series").value=state.forceSeries;$("force-area").value=state.forceArea;$("force-metric").value=state.forceMetric;
 $("force-area-wrap").hidden=state.forceSeries!=="usaaf";$("force-metric-wrap").hidden=state.forceSeries!=="usaaf";
 const points=forcePoints();const index=points.findIndex(x=>x.period===state.forceSelected),selected=points[index]||points.find(x=>x.period<=state.month&&x.value!==null&&x.value!==undefined)||points.find(x=>x.value!==null&&x.value!==undefined);
 const chartRows=points.map(x=>({period:x.period,value:x.value}));const root=$("force-chart");
 root.innerHTML=plotStacked(chartRows,["value"],[forceTitle()],["#79cbbd"],selected?.period);
 bindChartBars(root,"[data-chart-index]",i=>{state.forceSelected=points[i].period;renderForces();});
 if(selected)state.forceSelected=selected.period;
 const desc=state.forceSeries==="usaaf"?"A combat group is an organization, not an aircraft. ETO and MTO records are theater assignments from Table 2; group role subtotals can contain archival arithmetic discrepancies.":
 state.forceSeries==="vvs"?"VVS original front air army + high-command reserve snapshots. Excludes the naval and PVO forces, other distant Soviet aviation. Snapshots are separate dates; no interpolation.":
 "These are worldwide U.S. factory acceptances. They are a flow of newly accepted aircraft, NOT the number available in Europe or serviceable on a particular front.";
 $("force-caveat").textContent=desc;
 let detail="";
 if(selected){
  if(state.forceSeries==="usaaf"){
   detail='<h3>'+esc(selected.period)+" · "+esc(selected.theater)+'</h3>';
   if(selected.totalCombatGroups===null)detail+='<p><strong>No observation in the source for this theater-month.</strong> Every organization subtotal is unavailable, not zero.</p>';
   else detail+='<p><strong>'+fmt(selected.totalCombatGroups)+'</strong> all combat groups</p><div class="cause-grid"><div><b>'+fmt(selected.fighterGroups)+'</b><span>Fighter groups</span></div><div><b>'+fmt(selected.heavyBombardmentGroups)+'</b><span>Heavy bomber groups</span></div><div><b>'+fmt(selected.troopCarrierGroups)+'</b><span>Troop carrier groups</span></div></div><p>Medium/light bombers: '+fmt(selected.mediumAndLightBombardmentGroups)+'; reconnaissance: '+fmt(selected.reconnaissanceGroups)+'. Reported total minus role subtotal: '+fmt(selected.reportedMinusRoleSum)+'.</p>'+(selected.value===null?'<p>Selected role was not reported in this month. This is not zero.</p>':'');
   detail+='<a href="'+esc(G.source)+'" target="_blank" rel="noopener noreferrer">USAAF Statistical Digest Table 2 ↗</a>';
  }
  else if(state.forceSeries==="vvs"){detail='<h3>'+esc(selected.date)+'</h3><p><strong>'+fmt(selected.value)+'</strong> combat aircraft in source-defined front and reserve populations.</p><p>Fighters: '+fmt(selected.fighters)+'. Fighters listed unserviceable: '+fmt(selected.unserviceable)+'. Do not subtract from total combat aircraft (different measure).</p><a href="'+esc(P.sources[selected.source]?.url||D.sources.vvs.url)+'" target="_blank" rel="noopener noreferrer">Original VVS statistics transcription ↗</a>';}
  else detail='<h3>'+esc(mLabel(selected.period))+'</h3><p><strong>'+fmt(selected.value)+'</strong> USAAF worldwide aircraft acceptances.</p><div class="cause-grid"><div><b>'+fmt(selected.fighters)+'</b><span>Fighters</span></div><div><b>'+fmt(selected.heavy)+'</b><span>Heavy bombers</span></div><div><b>'+fmt(selected.medium)+'</b><span>Medium</span></div></div><p>Non-combat acceptances: '+fmt(selected.noncombat)+'.</p><a href="'+esc(V.sources.aafsd74?.url||"https://www.ibiblio.org/hyperwar/AAF/StatDigest/")+'" target="_blank" rel="noopener noreferrer">USAAF Statistical Digest ↗</a>';
 }
 $("force-detail").innerHTML=detail;
}
function download(rows,filename){
 const cols=Object.keys(rows[0]||{});const csv=[cols.join(","),...rows.map(x=>cols.map(k=>{const v=x[k];return '"'+String(v===null||v===undefined?"":v).replace(/"/g,'""')+'"';}).join(","))].join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function renderSources(){
 $("dataset-summary").innerHTML=[[String(D.campaigns.length),"Curated campaigns · "+D.campaigns.reduce((n,c)=>n+c.facts.length,0)+" overview facts"+(window.NormandyV86Data?" + "+window.NormandyV86Data.observations.length+" Normandy operation observations":"")],[String(lossRows.length),"Original German command-month loss totals"],[groupRows.filter(x=>x.totalCombatGroups!==null).length+" / "+groupRows.length,"Reported USAAF ETO/MTO group totals / all dated rows"],[String(P.soviet.length)+" + "+String(V.usaFactory.length),"Soviet dated snapshots + US production months"]].map(x=>'<div><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>').join("");
 const catalogue=Object.entries(D.sources).map(([k,s])=>({name:s.title,url:s.url,detail:s.class})).concat(Object.values(sourceIndex).map(s=>({name:s.title,url:s.url,detail:"Captured German wartime loss returns"}))).filter(x=>x.url);
 const unique=new Map(catalogue.map(x=>[x.url,x]));
 $("source-catalogue").innerHTML=[...unique.values()].map(x=>'<article><b>'+esc(x.name)+'</b><small>'+esc(x.detail)+'</small><a target="_blank" rel="noopener noreferrer" href="'+esc(x.url)+'">Open original ↗</a></article>').join("");
}
function update(){renderTime();renderDossier();renderCampaignList();renderMoments();drawMap();window.AtlasNormandyOperations?.sync();}
function init(){
 if(!$("campaign-map"))return;
 setupMap();renderCoverage();renderSources();
 $("date-slider").addEventListener("input",e=>{cancelPlay();updateMonth(atIdx(Number(e.target.value)));});
 $("prev-month").addEventListener("click",()=>{cancelPlay();updateMonth(atIdx(monthIdx(state.month)-1));});
 $("next-month").addEventListener("click",()=>{cancelPlay();updateMonth(atIdx(monthIdx(state.month)+1));});
 $("jump-today").addEventListener("click",()=>{cancelPlay();updateMonth("1944-06");});
 $("play-time").addEventListener("click",()=>{
  if(state.play!==null){cancelPlay();return;}
  if(monthIdx(state.month)>=LMAX-LMIN)state.month=atIdx(0);
  $("play-time").textContent="Ⅱ Pause";
  state.play=setInterval(()=>{if(monthIdx(state.month)>=LMAX-LMIN){cancelPlay();return;}updateMonth(atIdx(monthIdx(state.month)+1));},750);
 });
 $("theater-select").addEventListener("change",e=>{state.theater=e.target.value;const next=matching().find(x=>x.id===state.selected)||matching().find(active)||matching()[0];if(state.selected!==next?.id){state.selectedChapter=null;state.selectedMoment=null;}state.selected=next?.id||null;update();});
 $("campaign-search").addEventListener("input",e=>{
  state.search=e.target.value;
  const results=matching(),term=state.search.trim().toLowerCase();
  // Incremental typing may first select a broadly matching active campaign;
  // a full campaign-title match must outrank incidental mentions in another
  // campaign's phase text (e.g. searching Poland must open Poland, not Bagration).
  const titled=term?results.find(c=>c.name.toLowerCase()===term)||results.find(c=>c.name.toLowerCase().startsWith(term))||results.find(c=>c.name.toLowerCase().includes(term)):null;
  const next=titled||results.find(x=>x.id===state.selected)||results.find(active)||results[0];
  if(state.selected!==next?.id){state.selectedChapter=null;state.selectedMoment=null;}
  state.selected=next?.id||null;update();
 });
 $("all-campaigns").addEventListener("change",e=>{state.all=e.target.checked;update();});
 $("fit-map").addEventListener("click",()=>{if(!state.map||!window.L)return;const cs=visibleOnMap();if(cs.length)state.map.flyToBounds(window.L.latLngBounds(cs.map(c=>[c.focus.lat,c.focus.lng])).pad(.3),{maxZoom:6,duration:.6});});
 document.querySelectorAll('a[href="#research-library"],a[href="#loss-lab"],a[href="#german-war-lab"],a[href="#air-forces"]').forEach(a=>a.addEventListener("click",()=>{$("research-library").open=true;}));
 $("loss-command").addEventListener("change",e=>{state.lossCommand=e.target.value;state.lossMonth=state.month;renderLosses();drawMap();});
 $("loss-outcome").addEventListener("change",e=>{state.lossOutcome=e.target.value;renderLosses();});
 $("loss-window").addEventListener("change",e=>{state.lossWindow=e.target.value;renderLosses();});
 $("download-losses").addEventListener("click",()=>download(getLossData().map(x=>({period:x.period,command:x.theater,enemyDestroyed:x.enemyDestroyed,otherOperationalDestroyed:x.otherOperationalDestroyed,nonOperationalDestroyed:x.nonOperationalDestroyed,enemyDamaged:x.enemyDamaged,otherOperationalDamaged:x.otherOperationalDamaged,nonOperationalDamaged:x.nonOperationalDamaged,missingIncludedInEnemyDestroyed:x.missing,sourceId:x.sourceId,page:x.page??""})),"grand-air-war-german-command-losses.csv"));
 $("force-series").addEventListener("change",e=>{state.forceSeries=e.target.value;state.forceSelected=state.month;renderForces();});
 $("force-area").addEventListener("change",e=>{state.forceArea=e.target.value;state.forceSelected=state.month;renderForces();});
 $("force-metric").addEventListener("change",e=>{state.forceMetric=e.target.value;state.forceSelected=state.month;renderForces();});
 $("download-force").addEventListener("click",()=>download(forcePoints(),"grand-air-war-"+state.forceSeries+"-observations.csv"));
 document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelPlay();});
 update();renderLosses();renderForces();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.GrandAirWarV77={campaigns:D.campaigns,groupEvidence,renderBritainClaimReview,lossRows,groupRows,forcePoints,clipEuropeanLand:europeanLand,visibleOnMap,choose:pickCampaign,chooseMoment:selectMoment,chooseChapter:selectChapter,setMonth:updateMonth,monthIdx,atIdx,selected:()=>state.selected,selectedChapter:()=>state.selectedChapter,active,map:()=>state.map,refreshMap:drawMap};
})();
