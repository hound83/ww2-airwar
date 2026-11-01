/* Grand Air War v7.6: dated Normandy research experience.
   Map uses Leaflet 1.9.4 + normal viewport-only OpenStreetMap tiles.
   Markers denote published approximate sites, not independently surveyed WW2 runway centres. */
(function(){
"use strict";
const D=window.GrandAirWarV76Data;if(!D||!Array.isArray(D.story))return;
const $=id=>document.getElementById(id);
const esc=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const dateLabel=d=>{const p=d.split("-");return Number(p[2])+" "+months[Number(p[1])-1]+" "+p[0];};
const AIR=D.airfields,STORY=D.story;
const state={step:0,selection:{type:"scene",id:STORY[0].id},map:null,layers:null,mode:"normandy",showAirfields:true,showEvents:true,timer:null,rendering:false};
const current=()=>STORY[state.step],asOf=()=>current().date;
const opened=f=>f.declaredOperational<=asOf();
const sourceSet=keys=>(keys||[]).filter(k=>D.sources[k]);
function linkSources(keys){return sourceSet(keys).map(k=>'<a href="'+esc(D.sources[k].url)+'" target="_blank" rel="noopener noreferrer">'+esc(D.sources[k].name)+" ↗</a>").join("");}
function stop(){if(state.timer!==null){clearInterval(state.timer);state.timer=null;}$("scene-play").textContent="▶ Follow events";}
function chooseStep(i,fromUser=true){
 if(i<0||i>=STORY.length)return;
 if(fromUser)stop();state.step=i;state.selection={type:"scene",id:STORY[i].id};
 if(state.mode==="europe"&&i>0)state.mode="normandy";
 render();
}
function chooseField(code){
 const f=AIR.find(x=>x.code===code);if(!f)return;stop();
 if(!opened(f)){const i=STORY.findIndex(e=>e.airfieldCode===code&&e.date>=f.declaredOperational);if(i>=0)state.step=i;}
 state.selection={type:"field",id:code};state.mode="normandy";
 render();if(state.map)state.map.flyTo([f.lat,f.lon],Math.max(12,state.map.getZoom()),{animate:true,duration:.5});
}
function view(mode){
 state.mode=mode;const m=state.map;
 if(m){if(mode==="normandy")m.flyToBounds([[48.96,-1.74],[49.70,-.36]],{padding:[35,38],maxZoom:11,duration:.7});else m.flyTo([50.6,6.8],5,{duration:.7});}
 renderControls();drawMapMarkers();
}
function iconFor(it,active=false){
 const field=it.kind==="field";const name=field?it.code:"●";
 return window.L.divIcon({className:"gaw-icon",html:'<span class="gaw-pin '+(field?"":"operation ")+(active?"is-selected":"")+'">'+esc(name)+'</span>',iconSize:field?[42,31]:[28,29],iconAnchor:field?[21,35]:[14,28],popupAnchor:[0,-32]});
}
function clusterIcon(count){
 return window.L.divIcon({className:"gaw-icon",html:'<span class="gaw-cluster"><b>'+count+'</b><small>zoom in</small></span>',iconSize:[47,47],iconAnchor:[23,24]});
}
function markersForDate(){
 const items=[];
 if(state.showAirfields)for(const f of AIR.filter(opened)){
  items.push({kind:"field",code:f.code,lat:f.lat,lon:f.lon,name:f.name,source:f.siteSourceKey});
 }
 if(state.showEvents)for(const e of STORY.filter(x=>x.date<=asOf())){
  // Do not duplicate marker at an airfield. Open an airfield from its code or select
  // an exact event from the chronology instead.
  if(e.airfieldCode)continue;
  if(e.type!=="operation"&&e.id!==current().id)continue;
  items.push({kind:"event",id:e.id,lat:e.lat,lon:e.lon,name:e.title});
 }
 if(state.showEvents&&state.selection?.type==="scene"){
  const e=STORY.find(x=>x.id===state.selection.id);
  if(e&&!e.airfieldCode&&!items.some(i=>i.id===e.id))
   items.push({kind:"event",id:e.id,lat:e.lat,lon:e.lon,name:e.title});
 }
 return items;
}
function groupsInPixels(items){
 const map=state.map, threshold=map.getZoom()>=13?0:(map.getZoom()>=11?38:61);
 if(!threshold)return items.map(x=>[x]);
 const groups=[];
 // Regroup whenever the map pans or zooms; never permanently collapse geographic sites.
 for(const it of items){
  const a=map.latLngToContainerPoint([it.lat,it.lon]);
  let best=null,bestDist=Infinity;
  for(const g of groups){
   const rep=g.reduce((acc,x)=>{const p=map.latLngToContainerPoint([x.lat,x.lon]);return {x:acc.x+p.x,y:acc.y+p.y}}, {x:0,y:0});
   const dx=a.x-rep.x/g.length,dy=a.y-rep.y/g.length,dist=Math.hypot(dx,dy);
   if(dist<threshold&&dist<bestDist){best=g;bestDist=dist;}
  }
  if(best)best.push(it);else groups.push([it]);
 }
 return groups;
}
function drawMapMarkers(){
 if(!state.map||!state.layers)return;
 state.layers.clearLayers();
 const m=state.map;const items=markersForDate();const groups=groupsInPixels(items);
 for(const g of groups){
  if(g.length>1){
   const lat=g.reduce((a,x)=>a+x.lat,0)/g.length,lon=g.reduce((a,x)=>a+x.lon,0)/g.length;
   const mk=window.L.marker([lat,lon],{icon:clusterIcon(g.length),keyboard:true,title:g.length+" nearby records; zoom in"});
   mk.on("click",()=>{const area=window.L.latLngBounds(g.map(x=>[x.lat,x.lon]));if(m.getZoom()>=13){m.flyTo([lat,lon],Math.min(17,m.getZoom()+2));}else m.flyToBounds(area.pad(.8),{maxZoom:Math.min(14,m.getZoom()+2)});});
   mk.bindTooltip(g.length+" records nearby · zoom in",{direction:"top"});
   state.layers.addLayer(mk);continue;
  }
  const it=g[0];
  const selected=state.selection?.id===(it.kind==="field"?it.code:it.id);
  const mark=window.L.marker([it.lat,it.lon],{icon:iconFor(it,selected),keyboard:true,title:it.kind==="field"?it.code+" "+it.name:it.name,zIndexOffset:selected?900:0});
  mark.on("click",()=>{if(it.kind==="field")chooseField(it.code);else chooseStep(STORY.findIndex(e=>e.id===it.id));});
  mark.bindTooltip((it.kind==="field"?it.code+" · ":"")+esc(it.name),{direction:"top",offset:[0,-20]});
  state.layers.addLayer(mark);
 }
}
function initMap(){
 if(!window.L||!window.L.map){$("map-failure").hidden=false;return;}
 try{
  const L=window.L;
  state.map=L.map("map-surface",{zoomControl:false,scrollWheelZoom:true,touchZoom:true,keyboard:true,minZoom:5,maxZoom:17,zoomSnap:1,preferCanvas:true});
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:17,keepBuffer:2,updateWhenIdle:true}).addTo(state.map);
  L.control.zoom({position:"topright"}).addTo(state.map);
  state.layers=L.layerGroup().addTo(state.map);
  state.map.setView([49.33,-1.1],10);
  state.map.on("zoomend moveend",drawMapMarkers);
  state.map.on("tileerror",()=>{if(!state.map)return; /* Text chronology remains fully usable if tiles fail. */});
 }catch(e){$("map-failure").hidden=false;}
}
function renderControls(){
 const detail=state.mode==="normandy";
 $("normandy-zoom").classList.toggle("is-active",detail);
 $("europe-zoom").classList.toggle("is-active",!detail);
 $("normandy-zoom").setAttribute("aria-pressed",String(detail));
 $("europe-zoom").setAttribute("aria-pressed",String(!detail));
 $("layer-airfields").checked=state.showAirfields;$("layer-events").checked=state.showEvents;
 $("scene-range").value=String(state.step);$("scene-counter").textContent=(state.step+1)+" / "+STORY.length;
 $("scene-prev").disabled=state.step===0;$("scene-next").disabled=state.step===STORY.length-1;
 $("scene-phase").textContent=asOf()<"1944-06-27"?"From Britain to forward airfields":asOf()<"1944-07-25"?"Forward airpower supports the advance":"Breakout and pursuit";
 $("map-title").textContent=state.mode==="normandy"?"Normandy · "+dateLabel(asOf()):"Europe · "+dateLabel(asOf());
 $("coverage-label").textContent=dateLabel(asOf())+" · "+AIR.filter(opened).length+" / 8 researched US fields";
 $("asof-date").textContent=dateLabel(asOf());
}
function renderInspector(){
 const choice=state.selection;const f=choice?.type==="field"?AIR.find(x=>x.code===choice.id):null;
 const e=!f?STORY.find(x=>x.id===choice?.id)||current():null;
 const date=f?dateLabel(f.declaredOperational):dateLabel(e.date);
 const type=f?"AIRFIELD SOURCE RECORD":e.type.toUpperCase()+" · DATED RECORD";
 const title=f?f.code+" · "+f.name:e.title;
 const place=f?f.sector:e.place;
 const headline=f?"Forward airfield · "+f.aircraft:e.headline;
 const detail=f?f.story:e.detail;
 const consequence=f?("Recorded in the USAAF code register as "+f.originalJohnsonFirstUse+"; site history declares fully usable "+f.declaredOperational+". Named unit: "+f.units.map(x=>x.name).join(", ")+"."):e.effect;
 const caution=f?("First use, full readiness and the unit's arrival are different dates. Published site point, not verified WWII runway centre. Engineer: "+f.engineer+"."):(e.positionPrecision+"; sources are retrospective unless labeled otherwise.");
 const keys=f?["johnson",f.siteSourceKey,"algCoords"]:(e.sourceKeys||[]);
 for(const [id,v]of Object.entries({"inspect-type":type,"inspect-date":date,"inspect-title":title,"inspect-place":place,"inspect-headline":headline,"inspect-summary":detail,"inspect-consequence":consequence,"inspect-caution":caution}))$(id).textContent=v;
 $("inspect-status").textContent=f?"FIELD AND UNIT CHRONOLOGY · RESEARCH":e.type==="operation"?"OPERATIONAL CONTEXT / SOURCE":e.type==="unit"?"UNIT ACTION / LOCATION":"ENGINEER / FIELD SOURCE";
 $("inspect-sources").innerHTML=linkSources(keys);
 const fact=e?.id==="overlord";
 $("inspect-impact").hidden=!fact;
 if(fact){$("inspect-impact-value").textContent="14,674";$("inspect-impact-label").textContent="Allied sorties · 6 June 1944";$("inspect-impact-sub").textContent="5,656 RAF sorties · RAF Museum";}
}
function renderStory(){
 $("story-list").innerHTML=STORY.map((e,i)=>{
  const active=state.selection?.type==="scene"&&state.selection.id===e.id;
  const future=i>state.step;
  return '<button type="button" class="story-step '+(active?"is-active ":"")+(future?"is-future":"")+'" data-scene="'+i+'" aria-current="'+(active?"step":"false")+'"><span class="step-date">'+esc(dateLabel(e.date))+'<br><span class="step-kind">'+esc(e.type)+'</span></span><span><b>'+esc(e.title)+'</b><small>'+esc(e.headline)+'</small></span></button>';
 }).join("");
 $("story-list").querySelectorAll("[data-scene]").forEach(b=>b.addEventListener("click",()=>chooseStep(Number(b.dataset.scene))));
}
function renderFields(){
 const count=AIR.filter(opened).length;
 $("field-progress-value").textContent=count+" / "+AIR.length;
 $("airfield-list").innerHTML=AIR.map(f=>{
  const ready=opened(f);const isSelected=state.selection?.type==="field"&&state.selection.id===f.code;
  const groupName=f.units.map(u=>u.name).join(", ");
  return '<button type="button" class="airfield '+(isSelected?"is-selected":"")+'" data-airfield="'+esc(f.code)+'"><span class="airfield__head"><b>'+esc(f.code)+'</b><span>'+esc(f.name)+'</span></span><small>'+(ready?"Ready by this date":"Later: "+esc(dateLabel(f.declaredOperational)))+' · '+esc(f.aircraft)+'</small><em>'+esc(groupName)+'</em></button>';
 }).join("");
 $("airfield-list").querySelectorAll("[data-airfield]").forEach(b=>b.addEventListener("click",()=>chooseField(b.dataset.airfield)));
}
function sources(){
 const keys=new Set([...STORY.flatMap(e=>e.sourceKeys||[]),...AIR.map(f=>f.siteSourceKey),"johnson","alg1b","algCoords"]);
 $("source-register").innerHTML=[...keys].filter(k=>D.sources[k]).map(k=>{
  const s=D.sources[k];return '<article class="source"><b>'+esc(s.name)+'</b><p>'+esc(s.note)+'</p><a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">Original / compilation ↗</a></article>';
 }).join("");
 $("limitations-list").innerHTML=(D.reviewFlags||[]).map(x=>"<li>"+esc(x)+"</li>").join("");
}
function render(){
 renderControls();renderInspector();renderStory();renderFields();drawMapMarkers();
}
function init(){
 if(!$("map-surface"))return;
 sources();initMap();
 $("normandy-zoom").addEventListener("click",()=>view("normandy"));
 $("europe-zoom").addEventListener("click",()=>view("europe"));
 $("fit-points").addEventListener("click",()=>{if(!state.map)return;const items=markersForDate();if(items.length){state.map.flyToBounds(window.L.latLngBounds(items.map(x=>[x.lat,x.lon])).pad(.25),{maxZoom:12});}});
 $("layer-airfields").addEventListener("change",e=>{state.showAirfields=e.target.checked;drawMapMarkers();});
 $("layer-events").addEventListener("change",e=>{state.showEvents=e.target.checked;drawMapMarkers();});
 $("scene-range").max=String(STORY.length-1);
 $("scene-range").addEventListener("input",e=>chooseStep(Number(e.target.value)));
 $("scene-prev").addEventListener("click",()=>chooseStep(state.step-1));
 $("scene-next").addEventListener("click",()=>chooseStep(state.step+1));
 $("scene-play").addEventListener("click",()=>{
  if(state.timer!==null){stop();return;}
  if(state.step===STORY.length-1)state.step=-1;
  $("scene-play").textContent="Ⅱ Pause";
  state.timer=setInterval(()=>{if(state.step>=STORY.length-1){stop();return;}state.step++;state.selection={type:"scene",id:STORY[state.step].id};render();},2500);
 });
 document.addEventListener("visibilitychange",()=>{if(document.hidden)stop();});
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.GrandAirWarV76={chooseStep,chooseField,markersForDate,getStory:()=>STORY.slice(),getState:()=>({step:state.step,date:asOf(),mode:state.mode})};
})();
