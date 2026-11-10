#!/usr/bin/env node
"use strict";
/* End-to-end source-population, aggregation, date, geometry and output audit.
   This checks *internal* consistency, not independent archival transcription. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const elements=new Map();
function el(id){
 if(!elements.has(id))elements.set(id,{
  id,innerHTML:"",textContent:"",value:"",checked:false,disabled:false,hidden:false,dataset:{},
  addEventListener(){},querySelectorAll(){return[]},setAttribute(){},scrollIntoView(){}
 });
 return elements.get(id);
}
const document={readyState:"complete",hidden:false,getElementById:el,addEventListener(){},querySelectorAll(){return[]},createElement(){return el("dynamic")},body:{appendChild(){}}};
const window={},ctx=vm.createContext({window,document,console,setInterval,clearInterval});
for(const f of ["dist/model-v3-data.js","dist/atlas-v7-data.js","dist/atlas-v71-data.js","dist/atlas-v72-data.js","dist/atlas-v73-data.js","dist/atlas-v74-data.js","dist/grand-air-war-v77-groups.js","dist/grand-air-war-v77-campaigns.js","dist/grand-air-war-v80-core.js","dist/grand-air-war-v80-german.js","dist/grand-air-war-v80-lab.js"]){vm.runInContext(read(f),ctx,{filename:f,timeout:10000});}
const D=window.GrandAirWarV77Campaigns,A=window.GrandAirWarV77,G=window.GrandAirWarV80German,L=window.GrandAirWarV80Lab;
const allFacts=D.campaigns.flatMap(c=>c.facts.map(f=>({...f,campaign:c.id})));
const allEvents=D.campaigns.flatMap(c=>c.moments.map(e=>({...e,campaign:c.id})));
const isMonth=x=>/^\d{4}-(0[1-9]|1[0-2])$/.test(x);
assert.equal(D.campaigns.length,20);
assert.equal(allFacts.length,135,"campaign quantities need an updated source-count explanation");
assert.equal(allEvents.length,82,"campaign event count should be explicit and reviewed");
assert.equal(new Set(D.campaigns.map(c=>c.id)).size,D.campaigns.length);
for(const c of D.campaigns){
 assert.ok(isMonth(c.start)&&isMonth(c.end)&&c.start<=c.end,c.id+" invalid period");
 assert.ok(c.focus.lat>=30&&c.focus.lat<=76&&c.focus.lng>=-24&&c.focus.lng<=62,c.id+" off Europe chart");
 assert.ok(c.objective&&c.turningPoint&&c.consequence&&c.participants.length,c.id+" incomplete dossier");
 assert.ok(c.sources.length,c.id+" lacks source links");
 for(const id of c.sources)assert.match(D.sources[id]?.url||"",/^https?:\/\/|^\.\//,c.id+" unavailable research link");
 const chapters=c.chapters||[];
 assert.equal(new Set(chapters.map(ch=>ch.id)).size,chapters.length,c.id+" duplicated chapter IDs");
 for(let i=0;i<chapters.length;i++){
  const ch=chapters[i];
  assert.match(ch.start,/^\d{4}-\d\d-\d\d$/,c.id+" invalid chapter start");
  assert.match(ch.end,/^\d{4}-\d\d-\d\d$/,c.id+" invalid chapter end");
  assert.ok(ch.start<=ch.end&&ch.start.slice(0,7)>=c.start&&ch.end.slice(0,7)<=c.end,c.id+" chapter outside campaign");
  if(i)assert.ok(chapters[i-1].end<ch.start,c.id+" overlapping/out-of-order chapters");
  for(const key of ["title","location","situation","airRole","change","limits"])assert.ok(ch[key]?.length>=20||key==="title"&&ch[key]?.length>=8,c.id+" missing historical chapter field "+key);
  assert.ok(ch.sourceIds?.length,c.id+" unsourced chapter");
  for(const id of ch.sourceIds)assert.match(D.sources[id]?.url||"",/^https:\/\/|^\.\//,c.id+" missing chapter source: "+id);
  assert.ok(ch.sourceIds.some(id=>D.sources[id]?.url?.startsWith("https://")),c.id+" chapter relies only on internal links");
 }
 for(const e of c.moments){
  assert.match(e.date,/^\d{4}-\d\d-\d\d$/,c.id+" invalid event day");
  assert.ok(e.date.slice(0,7)>=c.start&&e.date.slice(0,7)<=c.end,c.id+" out-of-period event: "+e.date);
  assert.ok(Number.isFinite(e.lat)&&Number.isFinite(e.lng)&&e.title&&e.place);
  if(chapters.length)assert.equal(chapters.filter(ch=>ch.start<=e.date&&e.date<=ch.end).length,1,c.id+" dated evidence not in exactly one phase: "+e.date);
  if(e.summary){
   assert.ok(e.units&&e.outcome&&e.confidence,c.id+" event needs evidence, units, outcome and confidence");
   assert.ok(e.sourceIds?.length,c.id+" detailed event without specific sources");
   for(const id of e.sourceIds)assert.ok(D.sources[id]?.url?.startsWith("https://"),c.id+" event with missing source "+id);
  }
 }
 for(let i=1;i<c.moments.length;i++)assert.ok(c.moments[i-1].date<=c.moments[i].date,c.id+" dated evidence appears out of chronological order");
 for(const f of c.facts){
  assert.ok(Number.isFinite(f.value)&&f.value>=0,c.id+" invalid historical number");
  assert.ok(f.unit&&f.label&&f.scope&&f.date&&f.type,c.id+" missing comparison boundaries");
  assert.match(D.sources[f.sourceId]?.url||"",/^https?:\/\//,c.id+" fact without an external source");
  assert.ok(f.date.slice(0,7)>=c.start&&f.date.slice(0,7)<=c.end,c.id+" out-of-period fact: "+f.date);
  if(f.period)assert.ok(f.period.length>=25,c.id+" requires an explicit meaningful reporting period");
 }
}
assert.equal(new Set(allEvents.map(e=>e.campaign+e.date+e.title)).size,allEvents.length,"duplicated dated event");
assert.equal(D.campaigns.find(c=>c.id==="spain").facts[0].value,7350);
assert.equal(D.campaigns.find(c=>c.id==="spain").facts[1].value,19000);
const france=D.campaigns.find(c=>c.id==="france1940");
assert.deepEqual([...france.facts.map(f=>f.value)],[71,40,2739,651],"France observations from two distinct source populations");
assert.ok(france.facts.every(f=>f.scope.includes("RAF")),"France cannot imply all-belligerent returns");
assert.equal(A.visibleOnMap().length,20,"overview must NOT hide other campaigns in June 1944");
assert.equal(el("all-campaigns").checked,true,"all campaign centres shown by default");
const chronology=el("campaign-list").innerHTML;
assert.ok(chronology.indexOf('data-campaign="spain"')<chronology.indexOf('data-campaign="france1940"'));
assert.ok(chronology.indexOf('data-campaign="france1940"')<chronology.indexOf('data-campaign="normandy"'));
A.choose("spain");
assert.ok(el("dossier-facts").innerHTML.includes("7,350"),"Condor Legion source metric is visible");
assert.ok(el("dossier-meta").textContent.includes("Spanish Civil War / Spain"),"Spain should not be labelled WWII Western Front");
assert.ok(el("dossier-research-context").textContent.includes("independent research"),"1936 source must not imply 1943 Western reporting");
A.choose("france1940");
assert.ok(el("dossier-facts").innerHTML.includes("2,739")&&el("dossier-facts").innerHTML.includes("40"));
assert.ok(!el("dossier-research-context").textContent.includes("1943"),"1940 source card must not offer 1943 West losses");
A.choose("poland");
assert.ok(el("dossier-facts-heading").textContent.includes("4 sourced figures"));
const poland=D.campaigns.find(c=>c.id==="poland");
assert.equal(poland.end,"1939-10","campaign end must include October resistance");
assert.equal(poland.facts.length,4);
assert.equal(poland.moments.length,7);
assert.equal(poland.chapters.length,3);
assert.deepEqual([...poland.chapters.map(c=>c.start)],["1939-09-01","1939-09-07","1939-09-17"]);
assert.deepEqual([...D.campaigns.filter(c=>c.chapters?.length).map(c=>[c.id,c.chapters.length])],[ ["spain",3],["poland",3],["norway",3],["france1940",3],["britain",5],["malta",4],["barbarossa",3],["stalingrad",3],["reichdefense",3],["sicily",3],["kursk",3],["schweinfurt",2],["italy",3],["bigweek",2],["normandy",3],["bagration",3],["marketgarden",3],["berlin",3] ]);
// Every source-backed phase, including the older pilots, must offer at least
// one inspectable detailed event. Calendar-only placeholders are not evidence.
for(const id of ["spain","poland","norway","france1940","britain","malta","barbarossa","stalingrad","reichdefense","sicily","kursk","schweinfurt","italy","bigweek","normandy","bagration","marketgarden","berlin"]){
 const c=D.campaigns.find(c=>c.id===id);
 assert.ok(c.chapters.length>=2,id+" missing a sequential research guide");
 for(const ch of c.chapters){
  assert.ok(c.moments.some(e=>e.summary&&e.date>=ch.start&&e.date<=ch.end),id+"/"+ch.id+" has no researched event to inspect");
  assert.ok(ch.limits.length>=65,id+"/"+ch.id+" has no meaningful evidence-limitation explanation");
 }
}
const norway=D.campaigns.find(c=>c.id==="norway");
assert.ok(norway.facts.some(f=>f.value===17&&f.date==="1940-06-08"),"embarked fighters must remain an independent 8 June observation");
assert.ok(norway.facts.find(f=>f.value===17).scope.includes("Nos. 263 and 46"),"embarked RAF fighters are not an all-theatre loss ledger");
assert.deepEqual([...norway.facts.map(f=>f.value)],[42,53,75,24,329,249,17,49,37,6,13]);
assert.ok(norway.facts.find(f=>f.value===6).type.includes("claims")&&norway.facts.find(f=>f.value===13).type.includes("primary"),"Norway claims and airfield losses must be distinguished");
assert.ok(norway.facts.find(f=>f.value===49).period.includes("not a single-day"),"multi-day Norway sorties must not appear as one-day figure");
assert.equal(norway.moments.filter(e=>["1940-05-28","1940-06-02"].includes(e.date)).length,2,"new RAF daily event dates should be independently inspectable");
for(const [date,expected] of [["1940-05-28",[42,53]],["1940-06-02",[75,24]]]){
 const rows=norway.facts.filter(f=>f.date===date);
 assert.deepEqual([...rows.map(f=>f.value)],expected,"daily ORB evidence is missing or incorrectly partitioned on "+date);
 assert.ok(rows.every(f=>f.sourceId==="rafNorwayDailyCampaignOriginal"),"daily numbers must link the original RAF report");
}
assert.ok(norway.facts.find(f=>f.value===75).scope.includes("TOGETHER"),"joint daily sorties cannot be assigned to a single squadron");
assert.ok(norway.facts.find(f=>f.value===24).scope.includes("NOT confirmed"),"combat actions are not confirmed enemy aircraft losses");
assert.ok(norway.facts.find(f=>f.value===329).period.includes("not daily"),"12-day total must not become a daily figure");
assert.ok(norway.facts.find(f=>f.value===249).scope.includes("No. 46 Squadron ONLY"),"unit population must remain explicit");
assert.ok(D.sources.rafNorwayDailyCampaignOriginal.url.includes("raf.mod.uk"),"official RAF primary unit-report trail is required");

const barbarossa=D.campaigns.find(c=>c.id==="barbarossa");
assert.deepEqual([...barbarossa.facts.map(f=>f.value)],[2000,1270,5700,330,4614,1200,800]);
assert.ok(barbarossa.facts.find(f=>f.value===800).scope.includes("not another 800"),"Barbarossa on-ground losses are included in total, not added");
const sicily=D.campaigns.find(c=>c.id==="sicily");
assert.deepEqual([...sicily.facts.map(f=>f.value)],[59,32,44,12,25070,177,293,16243,69,440,200]);
assert.ok(sicily.facts.find(f=>f.value===177).scope.includes("Allied loss total"),"Sicily Allied aircraft losses must not become Axis losses");
assert.ok(sicily.facts.find(f=>f.value===293).type.includes("claims"),"Sicily 293 Allied claims are not verified opponent losses");
assert.ok(sicily.facts.find(f=>f.value===25070).period.includes("NOT single-day"),"full-campaign sorties must not be mapped onto a single day");
assert.ok(sicily.facts.find(f=>f.value===16243).unit.includes("tons"),"bomb tonnage must not be conflated with sortie counts");
assert.ok(sicily.facts.find(f=>f.value===440).unit.includes("per day")&&sicily.facts.find(f=>f.value===440).scope.includes("not 440 aircraft"),"Husky patrol sortie rate must not become force inventory");
assert.ok(sicily.facts.find(f=>f.value===200).scope.includes("NOT confirmed hostile aircraft shot down"),"US Navy plotted tracks are not verified German/Italian losses");

/* Cross-belligerent evidence matrix: serviceability, claims, separate dates, original sources. */
const britain=D.campaigns.find(c=>c.id==="britain"),normandy=D.campaigns.find(c=>c.id==="normandy");
const findById=(campaign,id)=>campaign.facts.find(f=>f.id===id);
assert.equal(findById(britain,"raf-hurricanes-serviceable-11aug").value+findById(britain,"raf-spitfires-serviceable-11aug").value,990,"RAF serviceable Hurricane/Spitfire subtotals must reconcile");
assert.equal(findById(britain,"raf-fc-serviceable-11aug").value,990,"RAF August serviceability absent");
assert.equal(findById(britain,"lw-se-serviceable-10aug").value,805,"Luftwaffe fighter serviceability absent");
assert.ok(findById(britain,"lw-se-strength-10aug").value>findById(britain,"lw-se-serviceable-10aug").value,"aircraft on strength cannot be silently equated with serviceable");
assert.ok(findById(britain,"raf-fighter-ops-loss-juloct").type.includes("lower-bound"),"greater-than-900 RAF fighter losses must not become exactly 900");
assert.equal(findById(britain,"lw-bf109-ops-loss-juloct").value,600,"Bf 109 category cannot be conflated with all German aircraft");
assert.ok(findById(britain,"raf-fc-serviceable-11aug").date!==findById(britain,"lw-se-serviceable-10aug").date,"adjacent-date strength snapshots must remain labeled");
assert.equal(findById(normandy,"lw-lf3-jun-jul-fighterloss").value+findById(normandy,"lw-lf3-jun-jul-bomberloss").value+findById(normandy,"lw-lf3-jun-jul-transportloss").value+findById(normandy,"lw-lf3-jun-jul-groundloss").value,826,"German Luftflotte 3 destroyed categories must reconcile exactly");
assert.equal(findById(normandy,"lw-lf3-jun-jul-losses").value,826,"German command loss total missing");
assert.equal(findById(normandy,"allied-dday-aircraft").value,11590,"Allied air commitment not visible");
assert.equal(findById(normandy,"allied-dday-aircraft-lost").value,127,"all-cause Allied D-Day air loss statistic missing");
assert.equal(findById(normandy,"shaef-dday-strategic-sorties").value+findById(normandy,"shaef-dday-tactical-sorties").value,10585,"SHAEF strategic+tactical sorties must reconcile");
assert.ok(findById(normandy,"lw-lf3-operational-6jun").value<findById(normandy,"lw-lf3-onstrength-5jun").value,"German air availability and on-strength categories inverted");
assert.ok(findById(normandy,"lw-lf3-first-week-loss").value+findById(normandy,"lw-lf3-second-week-loss").value<=826,"first two weeks are already contained in the longer German loss window");
assert.ok(findById(barbarossa,"soviet-barbarossa-german-estimate").type.includes("estimate")&&findById(barbarossa,"soviet-barbarossa-german-estimate").scope.includes("NOT independently"),"Soviet German-intelligence guesses must not masquerade as actual operational strength");
assert.ok(findById(barbarossa,"vvs-barbarossa-German-claims-9days").type.includes("claims"),"German victory claims cannot represent Soviet recorded losses");
for(const campaign of [britain,normandy,barbarossa,sicily]){
 const newFacts=campaign.facts.filter(f=>f.id);
 assert.ok(newFacts.every(f=>f.side&&f.measure&&f.date&&D.sources[f.sourceId]?.url?.startsWith("https://")),"side-specific facts must preserve population, time, and direct source links: "+campaign.id);
 for(const group of campaign.comparisons||[]){
  assert.ok(group.caution.length>60&&group.quality,"cross-side comparison missing clear denominators");
  for(const row of group.rows){
   const fact=row.factId?findById(campaign,row.factId):campaign.facts.find(f=>f.label===row.factLabel);
   assert.ok(fact&&D.sources[fact.sourceId],"comparison duplicates or invents a source figure: "+campaign.id);
  }
 }
}
const axisRows=sicily.operationalSeries.rows;
assert.equal(axisRows.length,5,"Sicily German/Italian operational activity must show five dated returns");
assert.deepEqual([...axisRows.map(r=>[r.date,r.german,r.italian])],[["1943-07-11",283,198],["1943-07-12",202,171],["1943-07-13",164,197],["1943-07-14",156,88],["1943-07-15",85,76]]);
assert.equal(axisRows[0].german+axisRows[0].italian,481,"Sicily initial Axis fighter operating count does not reconcile");
assert.equal(axisRows[4].german+axisRows[4].italian,161,"Sicily later Axis flying count does not reconcile");
assert.ok(sicily.operationalSeries.description.includes("NOT missions/sorties"),"Sicily operating aircraft are not flight sorties");
assert.equal(findById(sicily,"sicily-german-day-losses-11-16").value,59);
assert.equal(findById(sicily,"sicily-italian-day-losses-11-16").value,32);
assert.ok(findById(sicily,"sicily-german-night-losses-10-17").period.includes("Nights"),"day/night losses require separate windows");


const bag=D.campaigns.find(c=>c.id==="bagration");
const bv=x=>bag.facts.find(f=>f.label===x)?.value;
assert.equal(bv("16th Air Army serviceable combat aircraft before Bobruisk assault"),2319);
assert.equal(331+149+661+1108+70,2319,"16th Air Army serviceable aircraft classes must reconcile to 2,319");
assert.equal(bv("16th Air Army operationally ready crews"),1846);
assert.equal(bv("6th Air Army serviceable aircraft on left flank, separately counted"),321);
assert.equal(bv("16th Air Army combat sorties during opening day Bobruisk offensive"),3191);
assert.equal(1846+860+264+102+99+20,3191,"24 June 16th Air Army mission breakdown must equal 3191");
assert.equal(bv("16th Air Army combat sorties on 26 June"),2950);
assert.equal(bv("16th Air Army aircraft lost on 26 June"),19);
assert.ok(bag.facts.find(f=>f.value===13&&f.date==="1944-06-26")?.type.includes("claims"),"reported German defeats cannot be recorded as independently verified German losses");
assert.equal(bag.moments.filter(e=>["1944-06-24","1944-06-26"].includes(e.date)).length,2,"Bobruisk daily operational event drilldowns missing");
const nm=D.campaigns.find(c=>c.id==="normandy");
const naval=nm.facts.filter(f=>f.sourceId==="navyNormandyGermanDaily");
assert.equal(naval.length,6,"original German Normandy sortie populations not all recorded");
assert.equal(naval.find(f=>f.value===2588)?.date,"1944-06-13");
assert.equal(naval.find(f=>f.value===1683)?.date,"1944-06-13");
assert.equal(3568+9151+1101+153,13973,"German published category arithmetic changed; verify the source's known 10-sortie discrepancy");
assert.ok(naval.filter(f=>[3568,9151,1101,153].includes(f.value)).every(f=>f.scope.includes("discrepancy of 10")),"published German source headcount disagreement must stay visible");
assert.ok(naval.every(f=>f.sourceId==="navyNormandyGermanDaily"&&f.unit.includes("sorties")),"sorties may not be described as aircraft strength");


/* Reciprocal-evidence system: every campaign, every event, every source count. */
const validMetrics=new Set(["strength","losses","operations","claims","other"]);
assert.equal(D.campaigns.length,20);
let missingSides=0,completeSideCoverage=0,eventCount=0,sameDateTwoSideLosses=0;
for(const camp of D.campaigns){
 assert.ok(Array.isArray(camp.opposingSides)&&camp.opposingSides.length>=2,camp.id+" must enumerate all named belligerent air forces");
 const ids=new Set(camp.opposingSides.map(s=>s.id));
 assert.equal(ids.size,camp.opposingSides.length,camp.id+" duplicated force populations");
 const seen=new Set();
 for(const f of camp.facts){
  assert.ok(ids.has(f.subjectSide),camp.id+" unassigned/invalid belligerent for "+f.label);
  assert.ok(validMetrics.has(f.metricClass),camp.id+" unknown evidence kind");
  assert.ok(f.evidenceKey&&!seen.has(f.evidenceKey),camp.id+" duplicate evidence identifier "+f.evidenceKey);
  seen.add(f.evidenceKey);
  assert.ok(D.sources[f.sourceId]?.url?.startsWith("https://"),camp.id+" reciprocal observation lacks source");
  if(f.metricClass==="claims")assert.ok(/claim|estimate/i.test(f.label+" "+f.type),camp.id+" claims wrongly assigned");
 }
 const populated=camp.opposingSides.filter(s=>camp.facts.some(f=>f.subjectSide===s.id)).length;
 missingSides+=camp.opposingSides.length-populated;
 if(populated===camp.opposingSides.length)completeSideCoverage++;
 for(const e of camp.moments){
  eventCount++;
  assert.match(e.date,/^\\d{4}-\\d{2}-\\d{2}$/);
  const exact=camp.facts.filter(f=>f.date===e.date && !f.period);
  const two=camp.opposingSides.filter(s=>exact.some(f=>f.subjectSide===s.id&&f.metricClass==="losses")).length;
  if(two>=2)sameDateTwoSideLosses++;
  assert.ok(!exact.some(f=>f.period),camp.id+" period estimate was treated as event-day fact");
 }
}
assert.equal(eventCount,82,"all events must receive an explicit source-coverage result");
assert.ok(missingSides>0,"cannot claim every belligerent already has audited figures");
assert.ok(completeSideCoverage>0,"at least some campaigns have evidence for multiple forces");
const dieppe=D.campaigns.find(c=>c.id==="dieppe");
assert.equal(dieppe.facts.find(f=>f.value===48).subjectSide,"german");
assert.equal(dieppe.facts.find(f=>f.value===24).metricClass,"losses");
assert.equal(dieppe.facts.find(f=>f.value===91).metricClass,"claims");
assert.equal(dieppe.facts.find(f=>f.value===91).subjectSide,"german");
assert.ok(dieppe.facts.find(f=>f.value===48).scope.includes("NOT include the additional 24"),"German destroyed and damaged must not be conflated");
assert.ok(sameDateTwoSideLosses>=2,"Dieppe and Bodenplatte must expose same-day bilateral loss observations");
const mg=D.campaigns.find(c=>c.id==="marketgarden");
for(const num of [153,1265,87]){
 const f=mg.facts.find(x=>x.value===num);
 assert.ok(f&&f.subjectSide==="allied"&&f.period&&!f.date.startsWith("1944-09-20"),"Market Garden period aggregate improperly assigned to one day");
}
const bw=D.campaigns.find(c=>c.id==="bigweek");
for(const num of [33.3,20]){
 const f=bw.facts.find(x=>x.value===num);
 assert.ok(f&&f.subjectSide==="german"&&f.unit.includes("%")&&f.type.includes("approximate"),"Big Week fighter/pilot fraction improperly treated as absolute aircraft count");
}

const malta=D.campaigns.find(c=>c.id==="malta");
assert.ok(malta.chapters.find(c=>c.id==="crisis").limits.includes("HMS Eagle"),"documented RAF/IWM carrier disagreement must remain visible");
assert.equal(malta.facts.find(f=>f.date==="1942-03-07").value,15);
assert.ok(malta.facts.find(f=>f.date.startsWith("1942-10")).scope.includes("separate population"),"October Axis sorties must not be pooled with April Luftwaffe sorties");
const garden=D.campaigns.find(c=>c.id==="marketgarden");
assert.equal(garden.facts.find(f=>f.value===152).type,"recorded-subset");
assert.equal(garden.facts.find(f=>f.value===162).date,"1944-09-20");
assert.ok(garden.moments.find(e=>e.date==="1944-09-20").outcome.includes("failed"),"destination success is not supplies reaching Allied troops");
const bigweek=D.campaigns.find(c=>c.id==="bigweek");
assert.equal(bigweek.facts.find(f=>f.value===200).type,"lower-bound");
assert.ok(bigweek.chapters.every(ch=>ch.limits.includes("not")||ch.limits.includes("entire")),"campaign-wide loss estimates must not become 3-day numbers");
const schweinfurt=D.campaigns.find(c=>c.id==="schweinfurt");
assert.deepEqual([...schweinfurt.chapters.map(ch=>ch.start)],["1943-08-17","1943-10-14"]);
assert.ok(!schweinfurt.sources.includes("bigWeek"),"1944 Big Week is not a 1943 raid evidence source");
assert.deepEqual([...schweinfurt.facts.map(f=>f.value)],[376,60,291,60],"August and October dispatch/loss populations must remain separate");
assert.ok(schweinfurt.facts.filter(f=>f.value===60).every(f=>f.type==="recorded-subset"),"60 is a subset, not another dispatched total");
assert.ok(schweinfurt.chapters.find(ch=>ch.id==="october").limits.includes("251 B-17s")&&schweinfurt.chapters.find(ch=>ch.id==="october").sourceIds.includes("usafSchweinfurtOctober251"),"official 251-on-mission versus 291-dispatched divergence must be visible and sourced");
const bodenplatte=D.campaigns.find(c=>c.id==="bodenplatte");
assert.ok(bodenplatte.facts.some(f=>f.value===45&&f.scope.includes("do not add")),"Eindhoven local loss must not be stacked with whole-raid values");
assert.ok(bodenplatte.facts.some(f=>f.value===35&&f.scope.includes("not necessarily identical")),"local versus whole-raid damage definitions need disclosure");
for(const id of ["dieppe","bodenplatte"])assert.ok(D.campaigns.find(c=>c.id===id).moments.every(e=>e.summary&&e.sourceIds.length),id+" single-day action needs researched event details");
// Numbers here represent different kinds of evidence; no facts array may be
// silently summed into a common "campaign aircraft losses" metric.
const stalingrad=D.campaigns.find(c=>c.id==="stalingrad");
assert.deepEqual([...stalingrad.facts.map(f=>f.value)],[300,500,117.6],"Stalingrad target and actual seven-week delivery must stay distinct");
assert.equal(stalingrad.facts.filter(f=>f.unit==="tons/day").length,3);
assert.ok(stalingrad.facts[0].scope.includes("not transported")&&stalingrad.facts[2].scope.includes("seven weeks"));
assert.ok(stalingrad.facts[2].period.includes("not a single-day")&&stalingrad.facts[2].date==="1942-11","multiweek airlift mean must not be labeled a fabricated Wednesday");
assert.ok(stalingrad.chapters.at(-1).limits.includes("different date ranges"),"airlift secondary disagreement must be disclosed");
const reich=D.campaigns.find(c=>c.id==="reichdefense");
assert.deepEqual([...reich.facts.map(f=>f.value)],[662,840]);
assert.equal(389+95+178,662);assert.equal(580+83+177,840);
assert.ok(reich.facts.every(f=>f.scope.includes("Luftflotte Reich reporting area ONLY")&&f.type==="primary-command-return"),"no campaign-wide losses from monthly German Reich returns");
const kursk=D.campaigns.find(c=>c.id==="kursk");
assert.deepEqual([...kursk.facts.map(f=>f.value)],[3000,2000]);
assert.ok(kursk.facts.every(f=>f.type.includes("assigned-strength")&&!f.scope.includes("loss total")));
const italy=D.campaigns.find(c=>c.id==="italy");
assert.equal(italy.end,"1945-05","Italy May 2 surrender must be included, not truncated at April");
assert.deepEqual([...italy.facts.map(f=>f.value)],[435,173,262,300]);
assert.equal(173+262,435,"Cassino subsets must reconcile without double-counting");
assert.ok(italy.facts.slice(1,3).every(f=>f.type==="recorded-subset")&&italy.facts[3].type==="approximate-subset");
assert.ok(italy.facts[0].scope.includes("08:30–12:00")&&italy.chapters[1].limits.includes("SUBSET"));
const bagration=D.campaigns.find(c=>c.id==="bagration");
assert.deepEqual([...bagration.facts.filter(f=>[5300,1400].includes(f.value)).map(f=>f.value)],[5300,1400]);
assert.ok(bagration.facts.filter(f=>[5300,1400].includes(f.value)).every(f=>f.type==="secondary-order-of-battle-estimate"&&f.scope.includes("NOT")));
assert.ok(bagration.moments.some(e=>e.date==="1944-06-23")&&!bagration.moments.some(e=>e.date==="1944-06-22"),"main Bagration assault began 23 June, reconnaissance 22 June");
const berlin=D.campaigns.find(c=>c.id==="berlin");
assert.equal(berlin.facts.length,3,"additional Berlin sortie evidence must preserve the unresolved 2738 discrepancy");
assert.equal(berlin.facts[0].value,7500);
assert.deepEqual([...berlin.facts.slice(1).map(f=>f.value)],[4398,4054]);
assert.ok(berlin.facts.slice(1).every(f=>f.unit.includes("sorties")&&f.scope.includes("16th Air Army only")),"Berlin daily sorties must not be presented as full Soviet army totals");
assert.ok(berlin.facts.every(f=>f.value!==2738),"inconsistent 2738 aircraft vs crew figure must stay withheld");
assert.ok(berlin.chapters[0].limits.includes("experienced crews")&&berlin.chapters[1].limits.includes("not by itself audit"));
assert.deepEqual([...berlin.moments.filter(e=>e.date.startsWith("1945-05")).map(e=>e.date)],["1945-05-02","1945-05-08"]);
assert.ok(!berlin.participants.includes("RAF")&&!berlin.participants.includes("USAAF"),"western strategic forces must not be listed as direct Berlin assault participants");
for(const c of D.campaigns)assert.ok(c.facts.length,"all 20 campaigns should now have at least one provenance-scoped number: "+c.id);
for(const c of D.campaigns.filter(c=>c.chapters?.length))assert.ok(c.moments.every(e=>e.summary&&e.sourceIds?.length),c.id+" still has undetailed calendar placeholder");
assert.ok(el("dossier-facts").innerHTML.includes("≈ 300")&&el("dossier-facts").innerHTML.includes("&gt; 1,300"));
assert.ok(el("dossier-facts").innerHTML.includes("126")&&el("dossier-facts").innerHTML.includes("114"));
assert.ok(el("dossier-uncertainty").textContent.includes("Source disagreement"));
assert.ok(el("chapter-list").innerHTML.includes("Retreat, interior defence"));
assert.ok(el("chapter-detail").innerHTML.includes("Fighter interception")&&el("chapter-detail").innerHTML.includes("polishHistoryPhases")===false);
assert.ok(el("moment-list").innerHTML.includes("PZL.23")&&!el("moment-list").innerHTML.includes("Kielce"));
assert.equal(el("moment-detail").innerHTML,"","date-level narrative should not be auto-selected");
assert.equal(el("moment-detail").hidden,true);
 A.chooseChapter("interior");
 assert.ok(el("moment-list").innerHTML.includes("Kielce")&&!el("moment-list").innerHTML.includes("PZL.23"));
 assert.ok(el("chapter-detail").innerHTML.includes("9 September"));
 A.chooseChapter("collapse");
 assert.ok(el("moment-list").innerHTML.includes("1939-10-06"),"late resistance must be in final phase");
assert.ok(!el("moment-list").innerHTML.includes("D-Day"),"events must belong only to the selected campaign");
const sortie=poland.moments.find(e=>e.date==="1939-09-03");
A.chooseMoment("poland",sortie.date,sortie.lat,sortie.lng,sortie.title);
assert.ok(el("moment-detail").innerHTML.includes("24th Reconnaissance Squadron"));
assert.ok(el("moment-detail").innerHTML.includes("muzeumlotnictwa.pl"),"specific event must open original source");
assert.equal(A.selectedChapter(),"border","selecting a dated event should restore its parent phase");
assert.equal(el("date-display").textContent,"September 1939");
const before=A.selected();A.setMonth("1944-06");assert.equal(A.selected(),before,"time scrub changed dossier without consent");
const raw={type:"Feature",geometry:{type:"MultiPolygon",coordinates:[[[[-55,-5],[105,-5],[105,90],[-55,90],[-55,-5]]],[[[-10,40],[0,40],[0,50],[-10,50],[-10,40]]]]}};
const cropped=A.clipEuropeanLand(raw);
assert.ok(cropped.geometry.coordinates.length);
const collection=A.clipEuropeanLand({type:"FeatureCollection",features:[raw]});
assert.equal(collection.geometry.coordinates.length,cropped.geometry.coordinates.length,"world-atlas GeometryCollection conversion");
for(const poly of cropped.geometry.coordinates)for(const ring of poly)for(const [lon,lat] of ring){assert.ok(lon>=-50&&lon<=100&&lat>=0&&lat<=83,"world-land edge extends outside Europe chart");}
assert.ok(cropped.geometry.coordinates.some(poly=>poly.some(r=>r.some(pt=>pt[0]===-50))),"global-ring boundary was not clipped");
const seam={type:"Feature",geometry:{type:"Polygon",coordinates:[[
 [-180,65],[179.8,65],[20,40],[-10,40],[20,50],[100,60],[179.8,69],[-180,69],[-180,65]
]]}};
const withoutStripe=A.clipEuropeanLand(seam);
for(const poly of withoutStripe.geometry.coordinates)for(const ring of poly)for(let i=1;i<ring.length;i++){
 const a=ring[i-1],b=ring[i];
 assert.ok(!(Math.abs(a[0]-b[0])>80&&a[1]>60&&b[1]>60),"dateline creates a false cross-Europe land stripe");
}
const losses=A.lossRows;
assert.equal(losses.length,30);
assert.equal(new Set(losses.map(r=>r.theater+r.period)).size,30,"duplicate command-month");
for(const r of losses){
 assert.equal(r.destroyed,r.enemyDestroyed+r.otherOperationalDestroyed+r.nonOperationalDestroyed,"destroyed aggregation for "+r.period);
 assert.equal(r.damaged,r.enemyDamaged+r.otherOperationalDamaged+r.nonOperationalDamaged,"damaged aggregation for "+r.period);
 assert.ok(r.missing<=r.enemyDestroyed,"missing is already included in enemy destroyed");
 assert.ok(!Object.values(r).some(v=>typeof v==="number"&&!Number.isFinite(v)));
}
const groups=A.groupRows;
assert.equal(groups.length,80);
assert.equal(groups.filter(r=>r.totalCombatGroups===null).length,4,"unreported theater-months should remain null");
for(const r of groups){
 if(r.totalCombatGroups===null){
  assert.equal(r.reportedMinusRoleSum,null,"missing group month cannot have a computed zero discrepancy");
  for(const key of ["heavyBombardmentGroups","mediumAndLightBombardmentGroups","fighterGroups","troopCarrierGroups","reconnaissanceGroups"])assert.equal(r[key],null,"missing group months cannot imply zero role observations");
  continue;
 }
 const keys=["heavyBombardmentGroups","mediumAndLightBombardmentGroups","fighterGroups","troopCarrierGroups","reconnaissanceGroups"];
 const sum=keys.reduce((s,k)=>s+(r[k]??0),0);
 assert.ok(Math.abs(r.totalCombatGroups-sum-r.reportedMinusRoleSum)<1e-9,"reported organization subtotal disagreement must remain visible: "+r.month+" "+r.theater);
}
assert.equal(window.AirWarV73Data.soviet.length,5);
for(const r of window.AirWarV73Data.soviet)assert.ok(r.fighters>=r.unserviceableFighters&&r.total>=r.fighters);
assert.equal(window.AirWarV74Data.usaFactory.length,68);
assert.equal(new Set(window.AirWarV74Data.usaFactory.map(r=>r.period)).size,68,"duplicate U.S. acceptance month");
for(const r of window.AirWarV74Data.usaFactory){
 assert.ok(isMonth(r.period)&&r.all>=0&&r.fighters<=r.all);
 assert.equal(r.all,r.fighters+r.heavy+r.medium+r.noncombat,"U.S. world factory types do not reconcile for "+r.period);
}
assert.equal(G.pilotCasualties.length,9);assert.equal(G.reichFighters.length,3);
assert.equal(G.production.length,27);assert.equal(G.fuelCapacity.length,7);assert.equal(G.unitStudies.length,2);
assert.equal(new Set(G.reichFighters.map(r=>r.date)).size,3,"27 July and 1 July are distinct observations");
for(const r of G.reichFighters)assert.ok(r.singleReady<=r.singleOnHand&&r.twinReady<=r.twinOnHand);
for(const r of G.fuelCapacity)assert.ok(r.aviationPercent>=0&&r.aviationPercent<=100&&r.overallPercent>=0&&r.overallPercent<=100);
for(const r of G.unitStudies)assert.ok(r.avgServiceable<=r.avgAircraft,"unit stock and serviceability denominator");
const may=G.unitStudies.find(r=>r.lostOrDamaged!==undefined);
assert.ok(may.completelyDestroyed<=may.lostOrDamaged,"destroyed aircraft are a subset of lost-or-damaged");
assert.equal(G.production.filter(r=>r.period.startsWith("1944-")).reduce((s,r)=>s+r.value,0),39807);
assert.equal(G.productionConflict.alternate-G.productionConflict.selected,27,"September 1944 archival discrepancy");
L.setMode("readiness");assert.ok(el("german-chart").innerHTML.includes("07-01")&&el("german-chart").innerHTML.includes("07-27"),"both July readiness dates must be identifiable");
const html=read("grand-air-war-v80.html"),css=read("dist/grand-air-war-v80.css");
for(const id of ["overview","campaigns","loss-lab","german-war-lab","air-forces","research-sources"])assert.ok(html.includes('id="'+id+'"'));
assert.ok(css.includes(".research-library")&&css.includes(".moment-detail"),"research and events must have visually distinct layouts");
assert.ok(html.includes('id="research-library"')&&html.includes('id="moment-detail"')&&html.includes('id="chapter-list"')&&html.includes('id="chapter-detail"'));
assert.ok(!html.includes('id="dossier-analyze"'),"obsolete misleading campaign-to-report button must be removed");
assert.ok(read("dist/model-v4.js").includes('href="./grand-air-war-v80.html"'),"visible v7.4 navigation must link to optional v8 preview");
console.log("PASS v8 data/display audit: 20 mapped dossiers, "+D.campaigns.reduce((s,c)=>s+(c.chapters?.length||0),0)+" sourced phases, "+allFacts.length+" sourced facts, "+allEvents.length+" dated events, scoped losses, groups, fuel, readiness, production, labels and links");
