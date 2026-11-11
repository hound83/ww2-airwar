'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const data=JSON.parse(read('research/transcriptions/normandy-v86-operations.json'));
assert.equal(data.operations.length,5);assert.equal(data.observations.length,35);assert.equal(data.version,'8.6.0');
assert.equal(new Set(data.observations.map(f=>f.id)).size,35);
for(const f of data.observations){assert.ok(Number.isFinite(f.value)&&f.value>0);assert.ok(data.sources[f.source]?.url.startsWith('https://'));assert.ok(f.page&&f.scope&&f.unit&&f.evidenceClass);assert.ok(data.operations.some(o=>o.id===f.operation));if(f.period)assert.ok(f.period.start<=f.date&&f.date<=f.period.end);}
for(const op of data.operations){assert.ok(op.snapshots.length>=3);assert.ok(op.facts.length>=3);assert.ok(op.formations.some(k=>data.formations[k].side==='German'));for(const id of op.facts)assert.ok(data.observations.some(f=>f.id===id&&f.operation===op.id));for(const s of op.snapshots){assert.ok(op.start<=s.date&&s.date<=op.end);assert.ok(data.sources[s.source]&&s.page);for(const k of s.points)assert.ok(data.places[k]);for(const l of s.links){assert.ok(data.places[l.from]&&data.places[l.to]);assert.ok(['planned','advance','enemy-plan','enemy-advance','retreat'].includes(l.kind));}}}
assert.equal(data.observations.filter(f=>f.id.startsWith('dday-')&&f.id!=='dday-total').reduce((s,f)=>s+f.value,0),171);
assert.equal(data.observations.find(f=>f.id==='cobra-heavy').qualifier,'more than');
assert.equal(data.observations.find(f=>f.id==='cobra-killed').unit,'personnel');
assert.equal(data.observations.find(f=>f.id==='mortain-local').value,294);
assert.equal(data.observations.find(f=>f.id==='mortain-five-days').period.start,'1944-08-07');
assert.equal(data.observations.find(f=>f.id==='mortain-ixtac').period.end,'1944-08-14');
assert.equal(data.observations.filter(f=>['falaise-lancasters','falaise-halifaxes','falaise-mosquitoes'].includes(f.id)).reduce((s,f)=>s+f.value,0),811);
for(const p of Object.values(data.places))assert.ok(p[1]>48&&p[1]<50&&p[2]>-2&&p[2]<1,'Normandy locality outside regional geography');
const elements=new Map();function el(id){if(!elements.has(id)){const handlers={};elements.set(id,{id,innerHTML:'',textContent:'',hidden:false,value:'',dataset:{},classList:{toggle(){}},setAttribute(){},querySelectorAll(){return[]},querySelector(){return null},addEventListener(k,fn){handlers[k]=fn},click(){handlers.click?.({target:this})}});}return elements.get(id);}
const document={readyState:'complete',hidden:false,getElementById:id=>id==='claim-loss-scope'?null:el(id),querySelectorAll(){return[]},addEventListener(){},createElement(){return el('dynamic')},body:{appendChild(){}}};
const map={zoom:8,on(){},fitBounds(){return this},flyTo(){},flyToBounds(){return this},getZoom(){return this.zoom},latLngToContainerPoint([lat,lng]){return{x:lng*150,y:lat*150}}};
let groupCount=0,markers;const L={map:()=>map,control:{zoom:()=>({addTo(){}}),attribution:()=>({addAttribution(){return this},addTo(){}})},latLngBounds:()=>({pad(){return this}}),divIcon:x=>x,
 layerGroup:()=>{const g={layers:[],addTo(){return this},addLayer(x){this.layers.push(x)},clearLayers(){this.layers=[]},eachLayer(fn){this.layers.forEach(fn)}};if(++groupCount===2)markers=g;return g},
 polyline:(points,options)=>({points,options,addTo(){return this},bindTooltip(){return this},on(){return this}}),
 marker:(location,options)=>({location,options,on(){return this},bindPopup(){return this},bindTooltip(){return this}})};
const window={L,location:{hash:'',pathname:'/grand-air-war-v80.html',search:''},history:{replaceState(){}}};
const ctx=vm.createContext({window,document,console,setInterval,clearInterval,URLSearchParams});
for(const f of ['dist/model-v3-data.js','dist/atlas-v7-data.js','dist/atlas-v71-data.js','dist/atlas-v72-data.js','dist/atlas-v73-data.js','dist/atlas-v74-data.js','dist/grand-air-war-v77-groups.js','dist/grand-air-war-v77-campaigns.js','dist/normandy-1944-story.js','dist/grand-air-war-v86-data.js','dist/grand-air-war-v87-data.js','dist/grand-air-war-v80-core.js','dist/grand-air-war-v88-data.js','dist/grand-air-war-v88-losses.js','dist/grand-air-war-v86-operations.js'])vm.runInContext(read(f),ctx,{filename:f});
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
console.log('PASS v8.6: 5 connected operations, '+snapshots+' dated map journeys, 35 scoped observations, future-base exclusion, multi-day and casualty semantics, step navigation and campaign/filter recovery');

const britain=JSON.parse(read('research/transcriptions/britain-v87-operations.json'));
assert.deepEqual(JSON.parse(JSON.stringify(window.BritainV87Data)),britain);
assert.equal(britain.operations.length,4);
for(const op of britain.operations){
 assert.equal(ops.choose(op.id,0),true);
 assert.equal(app.selected(),'britain');
 assert.equal(ops.current().date,op.returnDate);
 assert.ok(el('operation-dossier').innerHTML.includes('data-snapshot-date="'+op.returnDate+'"'));
 assert.ok(el('operation-evidence').innerHTML.includes('data-evidence-group="victory-claims"'));
 assert.ok(el('operation-evidence').innerHTML.includes('1947 Parliamentary comparison'));
 assert.equal(markers.layers.filter(m=>m.options?.icon?.html?.includes('operation-place')).length,op.snapshots[0].points.length);
}
assert.match(el('operation-evidence').innerHTML,/Test estimate for 15 September: 66–74 aircraft destroyed/);
assert.match(el('operation-evidence').innerHTML,/published return records 56/);
ops.choose('cobra',0);
assert.equal(app.selected(),'normandy');
assert.doesNotMatch(el('operation-dossier').innerHTML,/data-snapshot-figure="cobra-8af-bombers-lost"/,'25 July losses must stay off 24 July');
ops.choose('cobra',1);
assert.match(el('operation-dossier').innerHTML,/data-snapshot-figure="cobra-8af-bombers-lost"/);
ops.choose('mortain',0);
assert.doesNotMatch(el('operation-dossier').innerHTML,/data-snapshot-figure="mortain-(five-days|ixtac)"/,'multi-day sortie totals cannot appear as snapshot figures');
console.log('PASS v8.7: four raid dossiers, scope-preserving map figures and a labelled held-out estimate');

const model=window.AtlasClaimLosses;
const calibration=JSON.parse(read('research/transcriptions/claims-losses-v88.json'));
assert.deepEqual(JSON.parse(JSON.stringify(window.AtlasClaimLossData)),calibration);
const compare=model.calculate('britain',100);
assert.equal(compare.totals.claims,936);
assert.equal(compare.totals.destroyed,371);
assert.equal(compare.expected,40);
assert.equal(model.britainChecks.length,7);
assert.equal(model.britainChecks.filter(day=>day.covered).length,5);
const heldOut=model.britainChecks.find(day=>day.date==='1940-09-15');
assert.equal(heldOut.totals.claims,751,'the held-out day must be removed from the fit');
assert.deepEqual([heldOut.low,heldOut.high,heldOut.germanDestroyed],[66,96,56]);
assert.equal(model.calculate('bagration',13),null,'Eastern claims need their own inputs');
for(const invalid of [NaN,Infinity,-1,1.5,'12'])assert.equal(model.calculate('cobra',invalid),null);
assert.deepEqual([model.calculate('cobra',0).expected,model.calculate('cobra',0).alternative],[0,0]);
const estimate=model.historicalEstimate('cobra',data.observations);
assert.deepEqual([estimate.expected,estimate.alternative,estimate.rate],[8,9,23/34]);
assert.deepEqual([estimate.inputs.matchedClaims,estimate.inputs.matchedLosses],[34,23]);
assert.deepEqual([estimate.validation.claims,estimate.validation.predicted,estimate.validation.losses],[3,2,2]);
assert.ok(estimate.calibration.every(row=>row.date<estimate.date&&row.sources.every(ref=>ref.url?.startsWith('https://')&&ref.page)));
assert.deepEqual([estimate.leaveOneOut.low,estimate.leaveOneOut.high],[7,9]);
assert.deepEqual(Array.from(estimate.leaveOneOut.omissions,row=>[row.date,row.claims,row.losses,row.expected]),[
 ['1944-06-22',25,15,7],['1944-06-27',20,14,8],['1944-07-18',23,17,9]
]);
assert.equal(new Set(estimate.calibration.map(row=>row.date)).size,estimate.calibration.length);
assert.deepEqual(Array.from(estimate.validationCases,row=>[row.claims,row.predicted,row.losses,row.possibleLosses]),[[3,2,2,0],[23,16,16,2]]);
assert.ok(estimate.validationCases.every(row=>row.date>estimate.date&&row.sources.every(ref=>ref.url?.startsWith('https://')&&ref.page)));
const context=estimate.campaignContext;
assert.equal(context.days.length,18);
assert.deepEqual(Array.from(context.days,row=>row.date),Array.from({length:18},(_,i)=>'1944-07-'+String(i+1).padStart(2,'0')));
assert.deepEqual([context.totals.germanLosses,context.totals.alliedClaims,context.totals.alliedLosses,context.totals.germanClaims],[355,329,312,314]);
assert.equal(context.flakClaims.value,17);
assert.equal(estimate.claimCount,12);
assert.equal(estimate.kind,'estimated');
assert.equal(estimate.confidence,'low');
assert.ok(estimate.sources.every(ref=>ref.url?.startsWith('https://')&&ref.page&&ref.detail));
assert.equal(model.historicalEstimate('cobra',data.observations.filter(fact=>fact.id!==estimate.claimId)),null);
const replacement={measure:'losses',value:4,lossScopeId:estimate.id,date:estimate.date};
assert.equal(model.historicalEstimate('cobra',[...data.observations,replacement]),null,'a fully matched source replaces the estimate');
assert.ok(model.historicalEstimate('cobra',[...data.observations,{...replacement,measure:'losses-subset'}]));
assert.ok(model.historicalEstimate('cobra',[...data.observations,{...replacement,date:'1944-07-24'}]));
ops.choose('cobra',0);
assert.doesNotMatch(el('operation-dossier').innerHTML,/data-snapshot-estimate=/);
ops.choose('cobra',1);
assert.match(el('operation-dossier').innerHTML,/data-snapshot-estimate=.*≈8.*12 US escort claims/);
assert.match(el('operation-evidence').innerHTML,/data-evidence-group="estimated-losses"/);
ops.choose('cobra',2);
assert.doesNotMatch(el('operation-dossier').innerHTML,/data-snapshot-estimate=/);
ops.choose('britain-15-sep',0);
assert.doesNotMatch(el('operation-evidence').innerHTML,/data-evidence-group="estimated-losses"/);
const ceiling=model.inventoryLossCeiling({opening:500,received:500,closing:350});
assert.equal(ceiling,650);
assert.equal(model.inventoryLossCeiling({opening:500,received:500,closing:350,knownOtherDepartures:50}),600);
assert.equal(model.inventoryLossCeiling({opening:500,closing:350}),null,'unknown receipts cannot support a ceiling');
assert.equal(model.inventoryLossCeiling({opening:500,received:0,closing:550}),null,'unreconciled stocks cannot support a ceiling');
assert.equal(model.inventoryLossCeiling({opening:500,received:0,closing:500}),0,'a balanced inventory can support a zero ceiling');
const narrowed=model.selectLossRange({lower:600,upper:1000},ceiling);
assert.deepEqual([narrowed.lower,narrowed.expected,narrowed.upper,narrowed.conflict],[600,625,650,false]);
const conflicting=model.selectLossRange({lower:800,upper:800},ceiling);
assert.deepEqual([conflicting.lower,conflicting.expected,conflicting.upper,conflicting.conflict],[null,null,650,true]);
assert.equal(model.selectLossRange({lower:600,upper:1000},null).expected,800);

const easternCampaign=app.campaigns.find(campaign=>campaign.id==='bagration');
const eastern=model.bobruiskEstimate(easternCampaign.id,'1944-06-26',easternCampaign.facts);
assert.deepEqual([eastern.expected,eastern.monthlyLosses,eastern.claimCount],[2,12,13]);
const {opening,received,closing,departures,knownOtherDepartures,period}=eastern.inventory;
assert.deepEqual([opening,received,closing,departures,knownOtherDepartures,eastern.ceiling],[72,10,57,25,13,12]);
assert.deepEqual([period.start,period.end],['1944-06-01','1944-06-30']);
assert.deepEqual([eastern.lower.toFixed(1),eastern.upper.toFixed(1),eastern.conflict],['1.2','2.5',false]);
assert.equal(model.bobruiskEstimate(easternCampaign.id,'1944-06-24',easternCampaign.facts),null);
assert.equal(model.bobruiskEstimate(easternCampaign.id,eastern.date,[...easternCampaign.facts,{measure:'losses',lossScopeId:eastern.id,date:eastern.date,value:1}]),null);
assert.equal(model.calculate('reverse',8),null,'historical comparisons keep their original reporting populations');
assert.ok(calibration.germanClaims.some(row=>row.claims===8&&row.losses===3));
assert.ok(calibration.germanClaims.some(row=>row.claims===6&&row.losses===5&&row.opponent.includes('RAF')));
assert.ok(calibration.germanClaims.some(row=>row.claims===2&&row.losses===2&&row.opponent.includes('Canadian')));
assert.ok(calibration.germanClaims.some(row=>row.claims===14&&row.alternateClaims===16&&row.losses===7));
const day=easternCampaign.moments.find(moment=>moment.date===eastern.date);
app.chooseMoment(easternCampaign.id,day.date,day.lat,day.lng,day.title);
assert.match(el('moment-detail').innerHTML,/data-event-estimate=.*About 2.*two Bobruisk-based groups/);
assert.match(el('moment-detail').innerHTML,/June inventory gives a ceiling of 12 for these groups/);
console.log('PASS claims and losses: Cobra calibration, reverse cases, scoped Bobruisk inventory, range selection and conflict handling');
