'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx=vm.createContext({window:{}}),root=path.resolve(__dirname,'../dist');
for(const file of ['atlas-v75-production.js','atlas-v75-evidence.js','atlas-v75-lab.js','atlas-v75-evidence-views.js','atlas-v75-german-production.js','atlas-v75-german-views.js','atlas-v75-map.js'])
 vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const E=ctx.window.AirWarV75Evidence,L=ctx.window.AirWarV75Lab;
const G=ctx.window.AirWarV75GermanProduction;
assert.equal(G.years[1943].actual.reduce((s,n)=>s+n,0),25527,'1943 cross-checked annual control');
assert.equal(G.years[1944].actual.reduce((s,n)=>s+n,0),39807,'1944 USSBS control');
assert.equal(G.years[1945].actual[3],null,'April 1945 true missing, not zero');
assert.equal(G.conflicts[0].status.startsWith('UNRESOLVED'),true);
assert.equal(G.source.provenance,'secondary');
assert.equal(G.typeCheckpoints.find(x=>x.type==='Bf 109'&&x.date==='1943-12').count,357);
const total=(rs,k)=>rs.reduce((s,x)=>s+x[k],0);
assert.equal(E.rafPilots.length,8);
assert.equal(E.rafPilots[0].operational,1200);
assert.equal(E.rafPilots.at(-1).operational,1796);
assert.equal(E.germanyPilots.find(x=>x.date==='1940-09-01').operational,735);
assert.equal(E.sourceConflicts[0].alternative,688);
assert.equal(total(E.weeklyRAFProduction,'hurricane'),1367);
assert.equal(total(E.weeklyRAFProduction,'spitfire'),724);
assert.equal(total(E.weeklyRAFLosses,'hurricane'),753);
assert.equal(total(E.weeklyRAFLosses,'spitfire'),467);
assert.equal(E.weeklyRAFLosses[0].start,'1940-05-10');
assert.ok(E.weeklyRAFLosses[0].end<'1940-08-01','long cross-month reporting bin retained explicitly');
assert.ok(Object.values(E.source_index).every(s=>s.provenance==='secondary'&&s.method==='recorded'&&s.url.startsWith('https:')));
const p=L.pilotModel({initial:1000,months:12,tempo:22,replacements:110,lossPerThousand:5,recovery:20});
assert.equal(p.length,13);
for(const row of p){
 assert.ok(Math.abs(row.conservation)<1e-6,'pilots conserved: '+row.month);
 assert.ok(Math.abs(row.active-(row.rookie+row.experienced+row.veteran))<1e-6,'experience composition is exhaustive');
 assert.ok(row.active>=0&&row.original>=0&&row.original<=1000&&row.recovering>=0);
}
assert.equal(JSON.stringify(p),JSON.stringify(L.pilotModel({initial:1000,months:12,tempo:22,replacements:110,lossPerThousand:5,recovery:20})),'deterministic reproduction');
const low=L.pilotModel({lossPerThousand:2,months:12}).at(-1),high=L.pilotModel({lossPerThousand:12,months:12}).at(-1);
assert.ok(high.original<low.original,'higher hazard reduces cohort retention');
assert.ok(high.departed>low.departed,'higher hazard increases cumulative departures');
const a=L.presetAircraft.single,b=L.presetAircraft.turbo;
assert.ok(L.density(0)>L.density(9000));
for(const plane of [a,b]){
 for(const h of [0,1000,3000,4500,6500,9000]){
  for(const mode of ['continuous','military','emergency']){
   const x=L.aircraftAt(plane,h,mode,60,6,130);
   for(const n of [x.rho,x.shaftHP,x.pressure,x.weightKg,x.ps,x.pAvail,x.pRequired,x.ias,x.tas,x.instant,x.sustained])assert.ok(Number.isFinite(n),'finite');
   assert.ok(x.rho>0&&x.shaftHP>0&&x.pressure>0&&x.weightKg>0,'positive physical quantities');
   assert.ok(x.sustained<=x.instant+1e-9,'sustained turn never exceeds instantaneous lift and G caps');
   assert.ok(x.nSust<=x.nInst+1e-9,'sustained load <= instantaneous load');
   assert.ok(x.ias<=x.tas+1e-9,'IAS<=TAS in ISA model at altitude');
  }
 }
}
assert.ok(L.aircraftAt(a,8000,'military').shaftHP<L.aircraftAt(a,3000,'military').shaftHP,'above critical altitude loses power');
assert.ok(L.aircraftAt(a,4000,'emergency').shaftHP>L.aircraftAt(a,4000,'continuous').shaftHP,'boost mode increases available shaft power');
assert.ok(L.aircraftAt(a,4000,'military',85).weightKg>L.aircraftAt(a,4000,'military',45).weightKg,'fuel changes weight');
assert.ok(L.envelope(a,4000,'military',85,6).climb<L.envelope(a,4000,'military',45,6).climb,'more fuel decreases climb potential for this model');
const before=L.state.altitude;assert.ok(L.change('v75-altitude','6500'));assert.equal(L.state.altitude,6500);L.state.altitude=before;
assert.equal(L.change('legacy-unrelated-slider',30),false);
const map=ctx.window.AirWarV75Map.render({ui:{theater:'west'},D:{idx:(y,m)=>(y-1936)*12+m-6},period:{a:48,b:50}},[{id:'britain',name:'Battle of Britain',theater:'west',start:[1940,6],end:[1940,9]}]);
assert.ok(map.includes('Natural Earth')&&map.includes('data-v75-preset="britain"'),'map renders offline with accessible campaign selection');
console.log('PASS v7.5 evidence: RAF/GER pilots, factory/loss weekly controls, simulator conservation, altitude/boost and energy-model invariants');
