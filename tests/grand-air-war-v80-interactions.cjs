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
const searchIndex=c=>[c.name,c.objective,c.turningPoint,c.consequence,c.participants.join(" "),...(c.chapters||[]).flatMap(ch=>[ch.title,ch.location,ch.situation,ch.airRole,ch.change,ch.limits]),...c.moments.flatMap(e=>[e.title,e.place,e.summary||"",e.units||"",e.outcome||""])].join(" ").toLowerCase();
const queryMatch=(c,q)=>!q.trim()||(q.trim().length<=3?searchIndex(c).split(/[^a-z0-9]+/).includes(q.trim().toLowerCase()):searchIndex(c).includes(q.trim().toLowerCase()));
for(const region of ["all","west","east","reich","med","north"]){
 for(const query of ["","poland","RAF","Cobra","Peewit","Glorious","HMS Eagle","   ","no-campaign-exists-xyz"]){
  for(const month of ["1936-07","1939-09","1940-05","1944-06","1945-05"]){
   for(const all of [true,false]){
    element("theater-select").dispatch("change",region);
    element("campaign-search").dispatch("input",query);
    app.setMonth(month);
    element("all-campaigns").dispatch("change",all);
    const matching=app.campaigns.filter(c=>(region==="all"||c.theater===region)&&queryMatch(c,query));
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
for(const [query,expected] of [["Cobra","normandy"],["Peewit","britain"],["Glorious","norway"],["HMS Eagle","malta"],["Palermo","sicily"],["Pitomnik","stalingrad"],["Prokhorovka","kursk"],["Cassino","italy"],["Vitebsk","bagration"],["Seelow","berlin"]]){
 element("campaign-search").dispatch("input",query);
 assert.deepEqual([...app.visibleOnMap()].map(c=>c.id),[expected],"search should find campaign through researched operation: "+query);
}
element("campaign-search").dispatch("input","RAF");
assert.ok(!app.visibleOnMap().some(c=>c.id==="barbarossa"),"short RAF search must not match the trailing letters in 'aircraft'");
element("campaign-search").dispatch("input","");
for(const typed of ["P","Po","Pol","Pola","Polan","Poland"])element("campaign-search").dispatch("input",typed);
assert.equal(app.selected(),"poland","incremental title search should not retain a campaign incidentally mentioning Poland in its phase text");
element("campaign-search").dispatch("input","Berlin");
assert.equal(app.selected(),"berlin","full campaign title match must outrank broad historical context hits");
element("campaign-search").dispatch("input","");
for(const zoom of [3,4,5,6,7,8,9,10,12]){map.setZoom(zoom);inspectMap(20);if(zoom>=9)assert.equal(visibleMarkers().length,20,"high zoom must expose all 20 markers");}
element("fit-map").dispatch("click");assert.ok(map.fitCount>=1,"Fit map control is broken");
app.choose("poland",false);
assert.equal(element("date-display").textContent,"September 1939");
assert.equal(app.selectedChapter(),"border");
assert.ok(element("chapter-detail").innerHTML.includes("German air operations"));
assert.equal(element("moment-detail").hidden,true,"no random event should be selected after choosing a campaign");
app.chooseChapter("interior");
assert.ok(element("moment-list").innerHTML.includes("1939-09-09"));
assert.ok(!element("moment-list").innerHTML.includes("1939-09-03"));
const poland=app.campaigns.find(x=>x.id==="poland"),attack=poland.moments.find(x=>x.date==="1939-09-03");
app.chooseMoment("poland",attack.date,attack.lat,attack.lng,attack.title);
assert.equal(app.selectedChapter(),"border","event drill-down must choose matching parent phase");
assert.ok(element("moment-detail").innerHTML.includes("24th Reconnaissance Squadron"));
assert.ok(element("moment-detail").innerHTML.includes("muzeumlotnictwa.pl"));
app.chooseChapter("collapse");
app.setMonth("1939-10");assert.equal(app.selected(),"poland");assert.equal(app.selectedChapter(),"collapse","month scrub should preserve the selected phase");
assert.ok(element("moment-list").innerHTML.includes("1939-10-06"),"October events should be accessible via their phase");
app.choose("britain",false);assert.equal(app.campaigns.find(c=>c.id==="britain").chapters.length,5);
assert.ok(element("dossier-facts").innerHTML.includes("data-comparison-quality=\"near-comparable\""),"battle of Britain strength comparison not rendered");
assert.ok(element("dossier-facts").innerHTML.includes("data-evidence-id=\"raf-fc-serviceable-11aug\"")&&element("dossier-facts").innerHTML.includes("805"),"British and German serviceable fighter snapshots not present together");
assert.ok(element("dossier-facts").innerHTML.includes("over 900")&&element("dossier-facts").innerHTML.includes("&gt; 900"),"RAF operational fighter losses incorrectly shown as exact");

app.chooseChapter("airfields");assert.ok(element("chapter-detail").innerHTML.includes("sector airfields"));
app.choose("france1940",false);app.chooseChapter("dunkirk");assert.ok(element("chapter-detail").innerHTML.includes("2,739"));
app.choose("normandy",false);
assert.ok(element("dossier-facts").innerHTML.includes("11,590")&&element("dossier-facts").innerHTML.includes("319"),"Normandy Allied and Luftflotte 3 air strength evidence not both shown");
assert.ok(element("dossier-facts").innerHTML.includes("NOT contemporaneous equivalent denominators"),"Normandy cross-period loss comparison must warn against false casualty ratios");
app.chooseChapter("falaise");assert.ok(element("moment-list").innerHTML.includes("1944-08-19"),"Falaise phase must have a researched event");
app.choose("norway",false);assert.ok(element("dossier-facts").innerHTML.includes("17"),"Norway's source-scoped withdrawal fighters are not visible");
assert.ok(element("dossier-facts").innerHTML.includes("49")&&element("dossier-facts").innerHTML.includes("13"),"RAF original squadron sorties and ground losses not displayed");
app.chooseChapter("landings");assert.ok(element("moment-list").innerHTML.includes("Gladiators on the ice"),"Norway original RAF airfield attack not accessible");
assert.ok(element("chapter-list").innerHTML.includes("Narvik"),"Norway research chapters are not reachable");
app.chooseChapter("withdrawal");assert.ok(element("moment-list").innerHTML.includes("HMS Glorious"),"Norwegian withdrawal has no dated evidence");
app.choose("malta",false);assert.equal(element("chapter-list").innerHTML.match(/data-chapter="/g).length,4);
app.chooseChapter("crisis");assert.ok(element("chapter-detail").innerHTML.includes("HMS Eagle"),"contradictory source attribution hidden");
assert.ok(element("moment-list").innerHTML.includes("1942-03-07"),"first Spitfire event not linked to phase");
app.choose("barbarossa",false);
assert.ok(element("dossier-facts").innerHTML.includes("German intelligence estimate")&&element("dossier-facts").innerHTML.includes("4,614"),"Barbarossa estimate vs reported-claims distinction missing");
app.chooseChapter("moscow");assert.ok(element("moment-list").innerHTML.includes("1941-12-05"),"Moscow counteroffensive not accessible");
assert.ok(element("dossier-facts").innerHTML.includes("800"),"Soviet opening-airfield losses subset not displayed");
app.choose("sicily",false);
assert.ok(element("dossier-facts").innerHTML.includes("data-series=\"german-italian-aircraft\""),"German/Italian Sicily operational time series not rendered");
assert.ok(element("dossier-facts").innerHTML.includes("481")&&element("dossier-facts").innerHTML.includes("161"),"German+Italian same-day totals not shown");
assert.ok(element("dossier-facts").innerHTML.includes("59")&&element("dossier-facts").innerHTML.includes("32"),"Sicily German and Italian losses must remain separate");
app.chooseChapter("inland");assert.ok(element("moment-list").innerHTML.includes("1943-07-22"),"Sicily inland phase has no sourced timeline");
assert.ok(element("dossier-facts").innerHTML.includes("440")&&element("dossier-facts").innerHTML.includes("200"),"US Navy Sicily fighter-cover and plotted-flight observations not displayed");
app.choose("bigweek",false);assert.ok(element("dossier-facts").innerHTML.includes("&gt; 200"),"hyphenated lower-bound value was displayed as exact 200");
app.chooseChapter("sustained");assert.ok(element("moment-list").innerHTML.includes("1944-02-25"),"Big Week conclusion missing");
app.choose("marketgarden",false);app.chooseChapter("resupply");
assert.ok(element("chapter-detail").innerHTML.includes("152")&&element("moment-list").innerHTML.includes("1944-09-20"),"Market Garden subset/day not usable");
for(const [id,chapter,date,number] of [
 ["stalingrad","collapse","1943-01-16","117.6"],
 ["reichdefense","escort","1944-04-30","840"],
 ["kursk","counterblow","1943-07-12","3,000"],
 ["italy","cassino","1944-03-15","435"],
 ["bagration","breakthrough","1944-07-03","5,300"],
 ["berlin","encirclement","1945-04-25","7,500"]
]){
 app.choose(id,false);
 assert.ok(element("dossier-facts").innerHTML.includes(number),id+" source-specific numerical observation not displayed");
 if(id==="stalingrad")assert.ok(element("dossier-facts").innerHTML.includes("not a single-day reading"),"multiweek airlift average rendered as a dated daily observation");
 assert.equal(app.campaigns.find(c=>c.id===id).chapters.length,3,id+" stage count");
 app.chooseChapter(chapter);
 assert.ok(element("moment-list").innerHTML.includes(date),id+" dated event missing in selected phase");
 assert.ok(!/undefined|NaN/.test(element("chapter-detail").innerHTML),id+" invalid phase rendering");
 const event=app.campaigns.find(c=>c.id===id).moments.find(e=>e.date===date);
 app.chooseMoment(id,event.date,event.lat,event.lng,event.title);
 assert.ok(element("moment-detail").innerHTML.includes("https://")&&element("moment-detail").innerHTML.includes(event.title),id+" source link or event detail is inaccessible");
}

let auditedEventCount=0;
for(const campaign of app.campaigns){
 app.choose(campaign.id,false);
 const dossier=element("dossier-facts").innerHTML;
 assert.ok(dossier.includes('data-bilateral-campaign="'+campaign.id+'"'),"opposing-loss coverage missing "+campaign.id);
 assert.ok(dossier.includes("No aircraft exchange ratio is computed automatically"),"loss ratio disclaimers missing "+campaign.id);
 for(const e of campaign.moments){
  app.chooseMoment(campaign.id,e.date,e.lat,e.lng,e.title);
  const review=element("moment-detail").innerHTML;
  assert.ok(review.includes("event-bilateral")&&review.includes("data-bilateral-status="),campaign.id+" / "+e.date+" needs reciprocal research status");
  assert.ok(!review.includes("NaN")&&!review.includes("undefined"),"invalid event bilateral data "+campaign.id+" / "+e.date);
  auditedEventCount++;
 }
}
assert.equal(auditedEventCount,82,"each dated event must have a visible reciprocal evidence assessment");
app.choose("britain",false);
assert.equal((element("dossier-facts").innerHTML.match(/data-opponent-returns="britain"/g)||[]).length,1,"British Parliament wartime claim-vs-loss ledger missing");
assert.ok(element("dossier-facts").innerHTML.includes("1,760")&&element("dossier-facts").innerHTML.includes("1,733"),"historical source inconsistency must be explicit");
const sep=app.campaigns.find(x=>x.id==="britain").moments.find(x=>x.date==="1940-09-15");
app.chooseMoment("britain",sep.date,sep.lat,sep.lng,sep.title);
assert.ok(element("moment-detail").innerHTML.includes('data-bilateral-status="claim-versus-record"'),"15 September RAF claims cannot be mislabeled as RAF loss");
for(const id of ["dieppe","schweinfurt","bodenplatte"]){
 const event=app.campaigns.find(x=>x.id===id).moments.find(e=>e.date===(id==="schweinfurt"?"1943-10-14":id==="dieppe"?"1942-08-19":"1945-01-01"));
 app.chooseMoment(id,event.date,event.lat,event.lng,event.title);
 assert.ok(element("moment-detail").innerHTML.includes('data-bilateral-status="paired-own-losses"'),id+" paired own-loss reporting missing");
}

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
