#!/usr/bin/env node
"use strict";
/* Controller-level matrix: filters x dates x visibility, map zoom/clustering,
   event drill-down, independent laboratory combinations and missing values.
   A separate real Chromium test is still needed for visual/viewport QA. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const els=new Map();
function element(id){
 if(!els.has(id)){
  const handlers={};
  els.set(id,{id,textContent:"",innerHTML:"",value:"",hidden:false,disabled:false,checked:false,open:false,dataset:{},
   classList:{toggle(){}},setAttribute(){},scrollIntoView(){},querySelector(){return null;},querySelectorAll(){return [];},
   addEventListener(k,fn){handlers[k]=fn;},dispatch(k,value){if(value!==undefined){if(k==="change"&&id==="all-campaigns")this.checked=value;else this.value=value;}assert.ok(handlers[k],id+" missing "+k);handlers[k]({target:this});}
  });
 }
 return els.get(id);
}
const document={readyState:"complete",hidden:false,getElementById:element,addEventListener(){},querySelectorAll(){return[]},createElement(){return element("dynamic")},body:{appendChild(){}}};
const markers=[];
const map={zoom:5,events:{},fitCount:0,getZoom(){return this.zoom;},fitBounds(){return this;},
 on(k,fn){for(const part of k.split(" "))this.events[part]=fn;},latLngToContainerPoint([lat,lng]){const s=2**(this.zoom-5)*9;return{x:lng*s,y:lat*s};},
 flyTo(_point,z){this.zoom=z;this.events.zoomend?.();},flyToBounds(_bounds,options={}){this.fitCount++;this.zoom=options.maxZoom||5;this.events.zoomend?.();},
 setZoom(z){this.zoom=z;this.events.zoomend?.();},closePopup(){}
};
let mapMarkerGroup;
let groupsMade=0;
const L={
 map:()=>map,divIcon:options=>options,
 control:{zoom:()=>({addTo(){}}),attribution:()=>({addAttribution(){return this},addTo(){}})},
 layerGroup:()=>{const group={layers:[],addTo(){return this},clearLayers(){this.layers=[];},addLayer(x){this.layers.push(x)},eachLayer(fn){this.layers.forEach(fn)}};if(++groupsMade===2)mapMarkerGroup=group;return group;},
 polyline:()=>({addTo(){},bringToFront(){}}),
 latLngBounds:()=>({pad(){return this}}),
 marker:(location,options)=>{const m={location,options,events:{},on(k,fn){this.events[k]=fn;return this},bindPopup(){return this},bindTooltip(){return this}};markers.push(m);return m;}
};
const window={L},ctx=vm.createContext({window,document,console,setInterval,clearInterval});
for(const f of ["dist/model-v3-data.js","dist/atlas-v7-data.js","dist/atlas-v71-data.js","dist/atlas-v72-data.js","dist/atlas-v73-data.js","dist/atlas-v74-data.js","dist/grand-air-war-v77-groups.js","dist/grand-air-war-v77-campaigns.js","dist/grand-air-war-v80-core.js"]){vm.runInContext(read(f),ctx,{filename:f,timeout:10000});}
const app=window.GrandAirWarV77;
assert.ok(app&&mapMarkerGroup,"real map and controller must initialize");
const visibleMarkers=()=>mapMarkerGroup.layers;
function inspectMap(expected){
 const pins=visibleMarkers();let represented=0;
 for(const m of pins){
  const icon=m.options.icon.html;
  const count=Number(icon.match(/>(\d+)<\/span>/)?.[1]);
  assert.ok(Number.isInteger(count)&&count>0,"pin label or cluster count missing");
  represented+=icon.includes("war-cluster")?count:1;
 }
 assert.equal(represented,expected,"campaign pins vanished in dynamic clustering");
 assert.equal(pins.length<=expected,true,"more map markers than campaigns");
}
inspectMap(20);
let matrix=0;
for(const region of ["all","west","east","reich","med","north"]){
 for(const query of ["","poland","RAF","no-campaign-exists-xyz"]){
  for(const month of ["1936-07","1939-09","1940-05","1944-06","1945-05"]){
   for(const all of [true,false]){
    element("theater-select").dispatch("change",region);
    element("campaign-search").dispatch("input",query);
    app.setMonth(month);
    element("all-campaigns").dispatch("change",all);
    const matching=app.campaigns.filter(c=>(region==="all"||c.theater===region)&&(!query||(c.name+" "+c.objective+" "+c.participants.join(" ")+" "+c.consequence).toLowerCase().includes(query.toLowerCase())));
    const expected=matching.filter(c=>all||c.start<=month&&c.end>=month).length;
    assert.equal(app.visibleOnMap().length,expected,"wrong map-filter intersection: "+[region,query,month,all]);
    inspectMap(expected);
    assert.ok(element("coverage-label").textContent.startsWith(expected+" shown of "+matching.length),"incorrect visible/matching count");
    if(!matching.length){assert.equal(app.selected(),null);assert.ok(element("dossier-title").textContent.includes("Adjust"));assert.ok(!element("moment-list").innerHTML.includes("data-moment"));}
    else{assert.ok(matching.some(c=>c.id===app.selected()),"selected campaign became invisible under filters");}
    matrix++;
   }
  }
 }
}
element("theater-select").dispatch("change","all");element("campaign-search").dispatch("input","");element("all-campaigns").dispatch("change",true);
for(const zoom of [3,4,5,6,7,8,9,10,12]){map.setZoom(zoom);inspectMap(20);if(zoom>=9)assert.equal(visibleMarkers().length,20,"high zoom must expose all 20 markers");}
element("fit-map").dispatch("click");assert.ok(map.fitCount>=1,"Fit map control is broken");
app.choose("poland",false);
assert.equal(element("date-display").textContent,"September 1939");
assert.ok(element("moment-detail").innerHTML.includes("Source")||element("moment-detail").innerHTML.includes("dispersed"));
const poland=app.campaigns.find(x=>x.id==="poland"),attack=poland.moments.find(x=>x.date==="1939-09-03");
app.chooseMoment("poland",attack.date,attack.lat,attack.lng,attack.title);
assert.ok(element("moment-detail").innerHTML.includes("24th Reconnaissance Squadron"));
assert.ok(element("moment-detail").innerHTML.includes("muzeumlotnictwa.pl"));
app.setMonth("1939-10");assert.equal(app.selected(),"poland");
assert.ok(element("moment-list").innerHTML.includes("1939-10-06"),"October events should be accessible");
app.choose("norway",false);assert.ok(element("dossier-facts").innerHTML.includes("No campaign-local"),"unverified must remain missing rather than zero");
const before=element("german-observation-date").textContent;
app.setMonth("1939-09");assert.equal(element("german-observation-date").textContent,before,"unrelated analysis changed on date scrub");
let lossCases=0;
for(const cmd of ["Reich","Western Front"])for(const outcome of ["destroyed","damaged"])for(const year of ["all","1943","1944"]){
 element("loss-command").dispatch("change",cmd);element("loss-outcome").dispatch("change",outcome);element("loss-window").dispatch("change",year);
 const chart=element("loss-chart").innerHTML,detail=element("loss-detail").innerHTML;
 assert.ok(chart.includes("data-chart-index")&&detail.includes(cmd),"loss filter has no data: "+[cmd,outcome,year]);
 assert.ok(!/NaN|undefined/.test(chart+detail),"invalid aggregation label in German loss chart");lossCases++;
}
let forceCases=0;
for(const mode of ["usaaf","vvs","production"]){
 element("force-series").dispatch("change",mode);
 for(const area of ["ETO","MTO"])for(const metric of ["totalCombatGroups","fighterGroups","heavyBombardmentGroups","mediumAndLightBombardmentGroups","troopCarrierGroups","reconnaissanceGroups"]){
  element("force-area").dispatch("change",area);element("force-metric").dispatch("change",metric);
  const html=element("force-chart").innerHTML,detail=element("force-detail").innerHTML;
  assert.ok(html.includes("<svg")&&detail.includes("<h3"),"missing force series: "+[mode,area,metric]);
  assert.ok(!/NaN|undefined/.test(html+detail),"invalid force value");
  if(mode!=="usaaf")assert.equal(element("force-area-wrap").hidden,true);
  forceCases++;
 }
}
element("force-series").dispatch("change","usaaf");
assert.ok(element("force-chart").innerHTML.includes("missing-observation"),"unreported group months should be labelled n/a, not zero-height ambiguous bars");
console.log("PASS v8 controller interaction matrix: "+matrix+" region/search/month/visibility combinations, 9 zoom levels, event/source drill-down, fit-map, "+lossCases+" German loss filters and "+forceCases+" Allied population filters");
