'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const data=JSON.parse(read('research/transcriptions/normandy-v86-operations.json'));
assert.equal(data.operations.length,5);assert.equal(data.observations.length,24);assert.equal(data.version,'8.6.0');
assert.equal(new Set(data.observations.map(f=>f.id)).size,24);
for(const f of data.observations){assert.ok(Number.isFinite(f.value)&&f.value>0);assert.ok(data.sources[f.source]?.url.startsWith('https://'));assert.ok(f.page&&f.scope&&f.unit&&f.evidenceClass);assert.ok(data.operations.some(o=>o.id===f.operation));if(f.period)assert.ok(f.period.start<=f.date&&f.date<=f.period.end);}
for(const op of data.operations){assert.ok(op.snapshots.length>=3);assert.ok(op.facts.length>=3);assert.ok(op.formations.some(k=>data.formations[k].side==='German'));for(const id of op.facts)assert.ok(data.observations.some(f=>f.id===id&&f.operation===op.id));for(const s of op.snapshots){assert.ok(op.start<=s.date&&s.date<=op.end);assert.ok(data.sources[s.source]&&s.page);for(const k of s.points)assert.ok(data.places[k]);for(const l of s.links){assert.ok(data.places[l.from]&&data.places[l.to]);assert.ok(['planned','advance','enemy-plan','enemy-advance','retreat'].includes(l.kind));}}}
assert.equal(data.observations.filter(f=>f.id.startsWith('dday-')&&f.id!=='dday-total').reduce((s,f)=>s+f.value,0),171);
assert.equal(data.observations.find(f=>f.id==='cobra-heavy').qualifier,'more than');
assert.equal(data.observations.find(f=>f.id==='cobra-killed').unit,'personnel');
assert.equal(data.observations.find(f=>f.id==='mortain-local').value,294);
assert.equal(data.observations.find(f=>f.id==='mortain-five-days').period.start,'1944-08-07');
assert.equal(data.observations.find(f=>f.id==='mortain-ixtac').period.end,'1944-08-14');
assert.equal(data.observations.filter(f=>f.operation==='falaise'&&f.unit==='aircraft').reduce((s,f)=>s+f.value,0),811);
for(const p of Object.values(data.places))assert.ok(p[1]>48&&p[1]<50&&p[2]>-2&&p[2]<1,'Normandy locality outside regional geography');
const elements=new Map();function el(id){if(!elements.has(id)){const handlers={};elements.set(id,{id,innerHTML:'',textContent:'',hidden:false,value:'',dataset:{},classList:{toggle(){}},setAttribute(){},querySelectorAll(){return[]},querySelector(){return null},addEventListener(k,fn){handlers[k]=fn},click(){handlers.click?.({target:this})}});}return elements.get(id);}
const document={readyState:'complete',hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){},createElement(){return el('dynamic')},body:{appendChild(){}}};
const map={zoom:8,on(){},fitBounds(){return this},flyTo(){},flyToBounds(){return this},getZoom(){return this.zoom},latLngToContainerPoint([lat,lng]){return{x:lng*150,y:lat*150}}};
let groupCount=0,markers;const L={map:()=>map,control:{zoom:()=>({addTo(){}}),attribution:()=>({addAttribution(){return this},addTo(){}})},latLngBounds:()=>({pad(){return this}}),divIcon:x=>x,
 layerGroup:()=>{const g={layers:[],addTo(){return this},addLayer(x){this.layers.push(x)},clearLayers(){this.layers=[]},eachLayer(fn){this.layers.forEach(fn)}};if(++groupCount===2)markers=g;return g},
 polyline:(points,options)=>({points,options,addTo(){return this},bindTooltip(){return this},on(){return this}}),
 marker:(location,options)=>({location,options,on(){return this},bindPopup(){return this},bindTooltip(){return this}})};
const window={L,location:{hash:'',pathname:'/grand-air-war-v80.html',search:''},history:{replaceState(){}}};
const ctx=vm.createContext({window,document,console,setInterval,clearInterval,URLSearchParams});
for(const f of ['dist/model-v3-data.js','dist/atlas-v7-data.js','dist/atlas-v71-data.js','dist/atlas-v72-data.js','dist/atlas-v73-data.js','dist/atlas-v74-data.js','dist/grand-air-war-v77-groups.js','dist/grand-air-war-v77-campaigns.js','dist/normandy-1944-story.js','dist/grand-air-war-v86-data.js','dist/grand-air-war-v80-core.js','dist/grand-air-war-v86-operations.js'])vm.runInContext(read(f),ctx,{filename:f});
const app=window.GrandAirWarV77,ops=window.AtlasNormandyOperations;let snapshots=0;
assert.ok(ops);assert.equal(ops.current(),null);assert.equal(el('normandy-operations').hidden,false);
assert.deepEqual(JSON.parse(JSON.stringify(window.NormandyV86Data)),data,'generated data must match maintained transcription');
for(const op of data.operations)for(let i=0;i<op.snapshots.length;i++){
 assert.equal(ops.choose(op.id,i),true);const s=op.snapshots[i];assert.equal(ops.current().date,s.date);assert.equal(app.selected(),'normandy');assert.equal(el('campaign-dossier').hidden,true);assert.equal(el('operation-dossier').hidden,false);assert.ok(el('operation-dossier').innerHTML.includes(s.title));assert.ok(el('operation-evidence').innerHTML.includes(op.question)===false,'question belongs in the dated briefing');
 assert.ok(el('operation-evidence').innerHTML.includes(op.intent));assert.equal((el('operation-evidence').innerHTML.match(/data-observation=/g)||[]).length,op.facts.length+(op.campaignEvidence?.length||0));assert.ok(el('map-heading').textContent.includes(s.date));assert.equal(markers.layers.filter(m=>m.options?.icon?.html?.includes('operation-place')).length,s.points.length);
 const bases=markers.layers.filter(m=>m.options?.icon?.html?.includes('operation-base'));assert.equal(bases.length,data.airfields.filter(f=>op.fields.includes(f.id)&&f.firstUse<=s.date).length,'future airfields leaked into selected date');snapshots++;
}
const normandy=app.campaigns.find(c=>c.id==='normandy');
for(const reference of data.operations.find(op=>op.id==='dday').campaignEvidence){
 const fact=normandy.facts.find(f=>f.id===reference.factId);
 assert.ok(fact&&fact.date==='1944-06-06'&&!fact.period,'D-Day links must resolve to single-day figures');
 assert.ok(window.GrandAirWarV77Campaigns.sources[fact.sourceId]?.url.startsWith('https://'));
}
assert.equal(ops.choose('missing'),false);assert.equal(ops.choose('cobra',999),false);
ops.choose('cobra',1);el('operation-next').click();assert.equal(ops.current().step,2);el('operation-prev').click();assert.equal(ops.current().step,1);
app.choose('poland',false);assert.equal(ops.current(),null);assert.equal(el('normandy-operations').hidden,true);assert.equal(el('campaign-dossier').hidden,false);assert.equal(el('operation-evidence').hidden,true);
ops.choose('cobra',1);app.chooseChapter('falaise');assert.equal(ops.current(),null,'chapter navigation must release stale operation map');
ops.choose('mortain',0);app.setMonth('1944-07');assert.equal(ops.current(),null,'independent month navigation must release old snapshot');
ops.choose('dday',0);assert.equal(markers.layers.some(m=>m.options?.icon?.html?.includes('operation-base')),false,'D-Day cannot show later continental bases as open');
el('operation-close').click();assert.equal(ops.current(),null);assert.equal(el('campaign-dossier').hidden,false);
const html=read('grand-air-war-v80.html');for(const name of ['grand-air-war-v86-data.js','grand-air-war-v86-operations.js','grand-air-war-v86.css'])assert.ok(html.includes(name));
assert.ok(html.indexOf('grand-air-war-v86-data.js')<html.indexOf('grand-air-war-v86-operations.js'));
console.log('PASS v8.6: 5 connected operations, '+snapshots+' dated map journeys, 24 scoped observations, future-base exclusion, multi-day and casualty semantics, step navigation and campaign/filter recovery');
