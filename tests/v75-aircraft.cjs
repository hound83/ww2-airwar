'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({window:{}});
for(const name of ['performance-data','aircraft','aircraft-view','lab'])vm.runInContext(fs.readFileSync(path.join(root,'dist/atlas-v75-'+name+'.js'),'utf8'),ctx);
const R=ctx.window.AirWarV75Aircraft,V=ctx.window.AirWarV75AircraftView,L=ctx.window.AirWarV75Lab;
const raw=JSON.parse(fs.readFileSync(path.join(root,'research/transcriptions/aircraft-performance.json'),'utf8'));
assert.equal(JSON.stringify(ctx.window.AirWarV75PerformanceData),JSON.stringify(raw),'generated evidence matches canonical transcription');
assert.equal(new Set(R.entries.map(e=>e.id)).size,R.entries.length,'unique stable identifiers');
assert.ok(['measured','reconstructed','placeholder','illustrative'].every(s=>R.statuses[s]));
for(const force of ['RAF','USAAF','Luftwaffe','VVS','Regia Aeronautica / ANR','Armée de l’Air'])assert.ok(R.entries.some(e=>e.force===force));
assert.equal(R.get('does-not-exist'),null);
for(const e of R.entries){
 assert.ok(Object.isFrozen(e));
 if(e.status==='placeholder')assert.equal(e.observations.length,0);
 if(e.status!=='illustrative')assert.equal(R.modelFor(e.id),null,'no historical name mapped to generic physics');
 for(const p of e.observations){
  const s=R.sources[p.sourceId];assert.ok(s?.url.startsWith('https://')&&s.locator&&s.verification&&s.provenance);
  assert.ok(e.specimen&&e.engine&&e.conditions&&e.correction);
  assert.ok(Number.isFinite(p.altitudeFt)&&p.altitudeFt>=0&&Number.isFinite(p.value)&&p.value>=0);
  assert.equal(p.status,'measured');assert.equal(p.uncertainty,null,'unknown error is not a fabricated zero');
  assert.equal(p.unit,p.metric==='speed'?'mph TAS':'ft/min');
 }
}
// Independent table controls, not just comparisons to the generated copy.
assert.equal(R.observations('spitfire-lfix-bs543','speed').find(p=>p.altitudeFt===22000).value,407);
assert.equal(R.observations('spitfire-hfix-bs551','speed').find(p=>p.altitudeFt===27800).value,415.5);
assert.equal(R.observations('p51b5-436883','speed').find(p=>p.altitudeFt===29400).value,442.5);
assert.equal(R.observations('p51b5-436883','climb').find(p=>p.altitudeFt===25500).value,2658);
assert.equal(R.observations('p47d10-4375035','speed').find(p=>p.altitudeFt===31000).value,435);
assert.equal(R.observations('p47d10-4375035','climb').find(p=>p.altitudeFt===28000).value,1520);
assert.equal(R.conflicts.length,3,'source discrepancies stay auditable');
assert.equal(R.atAltitude('p51b5-436883','speed',0,true)[0].status,'measured','exact endpoints never relabeled reconstruction');
assert.equal(R.atAltitude('p51b5-436883','speed',5000,false).length,0,'no nearest-point substitution');
const mid=R.atAltitude('p51b5-436883','speed',5000,true)[0];
assert.equal(mid.value,388.5);assert.equal(mid.status,'reconstructed');assert.equal(mid.parentIds.length,2);
assert.equal(R.atAltitude('p51b5-436883','speed',45000,true).length,0,'no extrapolation');
assert.equal(R.atAltitude('spitfire-lfix-bs543','speed',15000,true).length,0,'no bridge from MS to FS');
assert.equal(R.atAltitude('p51b5-436883','climb',19500,false).length,2,'same-altitude gear observations retained');
for(const n of [NaN,Infinity,-1])assert.equal(R.atAltitude('p51b5-436883','speed',n,true).length,0);
assert.equal(R.atAltitude('pending-vvs-yak-3-vk-105pf2','speed',0,true).length,0);
assert.equal(R.atAltitude('p51b5-436883','turn',0,true).length,0,'unmeasured turn performance stays missing');
assert.throws(()=>L.aircraftAt(R.get('p51b5-436883'),0),/illustrative/);
assert.throws(()=>L.aircraftAt(null,0),/illustrative/);
assert.throws(()=>L.aircraftAt(L.presetAircraft.single,0,'invented-rating'),/Invalid/);
// Physics accounting independently checked at the public output boundary.
for(const p of Object.values(L.presetAircraft))for(const h of [0,4000,9000])for(const v of [45,80,135,200]){
 const x=L.aircraftAt(p,h,'military',60,6,v),weight=x.weightKg*9.80665;
 assert.ok(Math.abs(x.ps*weight-(x.pAvail-x.pRequired))<1e-6,'specific energy balance');
 assert.ok(Math.abs(x.eas/x.tas-Math.sqrt(x.rho/1.225))<1e-10,'EAS relation');
 if(x.nSust>=1){
  const required=(x.dragPar+x.dragInduced*x.nSust*x.nSust)*v;
  assert.ok(required<=x.pAvail+1e-6,'sustained turn satisfies actual power balance');
 }
}
assert.equal(V.change('v75-performance-left','bogus'),false);
assert.equal(V.change('v75-performance-left','reference-single'),false);
for(const value of ['NaN','Infinity','-1','45001',''])assert.equal(V.change('v75-performance-altitude',value),false);
const historical=V.render({});assert.ok(historical.includes('reported points')&&historical.includes('Exact reported points only'));
V.change('v75-performance-left','pending-vvs-yak-3-vk-105pf2');
assert.ok(V.render({}).includes('Research placeholder: no numbers'));
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [a,b] of [['performance-data','aircraft.js'],['aircraft.js','aircraft-view'],['aircraft.js','lab.js']])assert.ok(page.indexOf('atlas-v75-'+a)<page.indexOf('atlas-v75-'+b),'dependency order');
console.log('PASS aircraft registry: '+R.entries.length+' configurations, '+R.entries.reduce((n,e)=>n+e.observations.length,0)+' source points, provenance, missing-data and reconstruction boundaries, physical power balance');
