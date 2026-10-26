/* Variant registry. Historical observations never supply generic physics coefficients. */
(function(){
'use strict';
const evidence=window.AirWarV75PerformanceData;
if(!evidence)throw Error('Load aircraft performance evidence before registry');
const statuses={
 measured:'Measured · reported flight-test results; corrections and transcription limits apply',
 reconstructed:'Reconstructed · interpolation within one test and supercharger gear; not a measurement',
 placeholder:'Placeholder · research backlog; no performance numbers or simulation',
 illustrative:'Illustrative · invented engineering inputs; not a historical aircraft'
};
const entries=evidence.configurations.map(c=>({...c,name:c.variant+' · '+c.specimen,status:'measured',model:null,
 observations:['speed','climb'].flatMap(metric=>c[metric].map(([altitudeFt,value,gear],i)=>({
  id:c.id+'-'+metric+'-'+i,metric,altitudeFt,value,gear,unit:metric==='speed'?'mph TAS':'ft/min',
  status:'measured',sourceId:c.sourceId,method:'reported_test_result',uncertainty:null
 })))
}));
// This is a deliberately incomplete, extensible research queue, not service-date evidence.
// Separate marks and blocks must eventually receive their own test configurations.
const backlog={
 Luftwaffe:{'Bf 109':['E-1','E-3','E-4','F-2','F-4','G-2','G-6','G-14','G-10','K-4'],'Fw 190':['A-3','A-4','A-5','A-8','D-9'],'Bf 110':['C','G-2','G-4'],'Me 262':['A-1a'],'He 162':['A-2'],'Ju 87':['B-2','D-3'],'Ju 88':['A-4','G-6'],'He 111':['H-6'],'Do 217':['E-4']},
 RAF:{Spitfire:['Mk I','Mk II','Mk Vb','F Mk IX (Merlin 61)','Mk VIII','Mk XIV'],Hurricane:['Mk I','Mk IIA','Mk IIC'],Typhoon:['Mk Ib'],Tempest:['Mk V'],Mustang:['Mk III'],Mosquito:['FB Mk VI','NF Mk XIII'],Beaufighter:['Mk IF','Mk VI'],Lancaster:['Mk I'],Halifax:['Mk III']},
 USAAF:{'P-38':['F','J','L'],'P-47':['C','D-22','D-28','M'],'P-51':['B-15-NA','C','D-5-NA','D-20-NA'],'P-39':['Q'],'P-40':['F','N'],'B-17':['F','G'],'B-24':['D','J'],'B-25':['C'],'B-26':['B']},
 VVS:{'I-16':['Type 24'],'MiG-3':['AM-35A'],'LaGG-3':['Series 35'],'Yak-1':['M-105PA'],'Yak-7':['B'],'Yak-9':['D','U'],'Yak-3':['VK-105PF2'],'La-5':['F','FN'],'La-7':['ASh-82FN'],'Il-2':['Two-seat AM-38F'],'Pe-2':['Series 110'],'Tu-2':['ASh-82FN']},
 'Regia Aeronautica / ANR':{'C.200':['Saetta'],'C.202':['Folgore'],'C.205':['Veltro'],'G.55':['Centauro'],'Re.2005':['Sagittario'],'SM.79':['II']},
 'Armée de l’Air':{'MS.406':['C1'],'D.520':['C1'],'MB.152':['C1'],'Hawk 75':['A-3'],'LeO 451':['B4']}
};
for(const [force,families] of Object.entries(backlog))for(const [family,variants] of Object.entries(families))for(const variant of variants){
 const id=('pending-'+force+'-'+family+'-'+variant).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
 entries.push({id,force,family,variant,name:family+' '+variant,status:'placeholder',model:null,observations:[],
  conditions:'Engine rating, fuel grade, weight, propeller, armament and test specimen still need source review.',
  correction:'No performance data imported. A family name cannot stand in for its variants.'});
}
const illustrative=[
 {id:'reference-single',name:'Single-stage supercharged reference',kind:'Single-speed / illustrative',powerHP:1280,criticalM:4800,emptyKg:2500,fuelKg:360,ammunitionKg:180,wingM2:22.5,cd0:.027,k:.052,propEff:.79,clMax:1.48,structureG:6.5,mapInHg:46},
 {id:'reference-turbo',name:'Turbocharged reference',kind:'Turbo / illustrative',powerHP:2000,criticalM:7500,emptyKg:3900,fuelKg:600,ammunitionKg:300,wingM2:27.8,cd0:.027,k:.050,propEff:.81,clMax:1.58,structureG:6.0,mapInHg:49}
];
for(const model of illustrative)entries.push({id:model.id,force:'Engineering references',family:'Generic',variant:model.name,name:model.name,status:'illustrative',model,observations:[],conditions:'All numeric inputs are illustrative assumptions.',correction:'No historical calibration or validation.'});
function deepFreeze(x){if(x&&typeof x==='object'){Object.values(x).forEach(deepFreeze);Object.freeze(x);}return x;}
deepFreeze(entries);deepFreeze(evidence);deepFreeze(statuses);
const byId=new Map(entries.map(e=>[e.id,e]));
function get(id){return byId.get(id)||null;}
function modelFor(id){const e=get(id);return e?.status==='illustrative'?e.model:null;}
function observations(id,metric){return (get(id)?.observations||[]).filter(p=>p.metric===metric);}
// No extrapolation, no cross-gear bridge, no silent nearest-point substitution.
// Returned parent IDs preserve a reproducible audit trail for every interpolation.
function atAltitude(id,metric,altitudeFt,reconstruct=false){
 if(!Number.isFinite(altitudeFt)||altitudeFt<0)return [];
 const points=observations(id,metric),out=[];
 for(const gear of new Set(points.map(p=>p.gear))){
  const rows=points.filter(p=>p.gear===gear).sort((a,b)=>a.altitudeFt-b.altitudeFt);
  const exact=rows.find(p=>Math.abs(p.altitudeFt-altitudeFt)<1e-7);
  if(exact){out.push({...exact,parentIds:[exact.id]});continue;}
  if(!reconstruct)continue;
  const lo=rows.filter(p=>p.altitudeFt<altitudeFt).at(-1),hi=rows.find(p=>p.altitudeFt>altitudeFt);
  if(!lo||!hi)continue;
  out.push({...lo,id:undefined,altitudeFt,value:lo.value+(hi.value-lo.value)*(altitudeFt-lo.altitudeFt)/(hi.altitudeFt-lo.altitudeFt),
   status:'reconstructed',method:'linear_within_test_and_gear',parentIds:[lo.id,hi.id],uncertainty:null});
 }
 return out;
}
const api={schemaVersion:1,entries,statuses,sources:evidence.sources,conflicts:evidence.conflicts,get,modelFor,observations,atAltitude};
window.AirWarV75Aircraft=Object.freeze(api);
})();
