/* Modular site and archival-series tests, require Node.js only. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const offset=(y,m)=>(y-1936)*12+m-6;
const ctx=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'dist/model-v3-data.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'dist/model-v4-data.js'),'utf8'),ctx);
const d=ctx.window.LuftV4Data;
assert.equal(offset(1945,4),106);
assert.equal(d.usaCosts['P-47'][1944],85578);
assert.equal(d.usaCosts['P-51'][1944],51572);
assert.equal(d.usCrews['P-47'][0].value,689);
assert.equal(d.usa['P-47'].find(p=>p.i===offset(1943,8)).value,811);
assert.equal(d.usa['P-51'].find(p=>p.i===offset(1944,2)).value,792);
assert.equal(d.rafReady1940.Spitfire.find(x=>x.i===offset(1940,7)).value,208);
assert.equal(d.rafReady1940.Hurricane.find(x=>x.i===offset(1940,7)).value,350);
assert.equal(d.usaFighterLossMonthly.reduce((s,x)=>s+x.value,0),1044);
assert.equal(d.usaFighterLossMonthly[1].value,23);
assert.equal(d.usaFighterLossMonthly.at(-1).value,358);
assert.equal(d.usaFighterLossMonthly.find(p=>p.i===offset(1944,0)).value,110);
assert.equal(d.usaFighterLossMonthly.find(p=>p.i===offset(1944,2)).value,229);
assert.equal(d.usaFighterLossMonthly.find(p=>p.i===offset(1945,4)),undefined);
assert.equal(d.usaFighterLossAnnual.reduce((s,x)=>s+x.value,0),7124);
assert.equal(d.usaFighterLossAnnual.find(p=>p.year===1944).value,4758);
assert.equal(d.usaFighterLossAnnual.find(p=>p.year===1945).scope,'Jan–Aug (includes post-VE)');
assert.equal(d.usaFighterClaimsAnnual.reduce((s,x)=>s+x.air,0),7422);
assert.equal(d.usaFighterClaimsAnnual.reduce((s,x)=>s+x.ground,0),6796);
assert.equal(d.usaFighterClaimsAnnual.find(p=>p.year===1944).air,5602);
assert.equal(d.usaFighterClaimsAnnual.find(p=>p.year===1945).ground,4421);
// Full original Table 167 monthly fighter-class figures reconcile exactly to
// all four independently printed annual checkpoints. Claims are not losses.
assert.equal(d.usaFighterClaimsMonthly.length,34);
for(const annual of d.usaFighterClaimsAnnual){
  const monthly=d.usaFighterClaimsMonthly.filter(x=>x.year===annual.year);
  assert.equal(monthly.reduce((n,x)=>n+x.air,0),annual.air,`air claims ${annual.year}`);
  assert.equal(monthly.reduce((n,x)=>n+x.ground,0),annual.ground,`ground claims ${annual.year}`);
  assert.equal(monthly.reduce((n,x)=>n+x.total,0),annual.total,`all claims ${annual.year}`);
}
assert.equal(d.usaFighterClaimsMonthly.find(x=>x.i===offset(1944,3)).ground,527);
assert.equal(d.usaFighterClaimsMonthly.find(x=>x.i===offset(1945,3)).ground,3703);
assert.equal(d.usaFighterClaimsMonthly.find(x=>x.i===offset(1943,2)).air,0);
assert.equal(d.usaFighterClaimsMonthly.find(x=>x.i===offset(1942,6)),undefined);
for(const theater of ['ETO','MTO']){
  assert.equal(d.usaFighterSorties[theater].length,29);
  for(const year of [1943,1944,1945]){
    const series=d.usaFighterSorties[theater].filter(x=>x.year===year);
    assert.equal(series.reduce((n,x)=>n+x.total,0),d.usaFighterSortiesAnnual[theater][year],`${theater} sorties ${year}`);
    for(const x of series){
      assert.equal(x.total,x.escort+x.strike+x.recon+x.other,`${theater} ${x.year}/${x.month} roles`);
      assert.ok(x.total>0);
    }
  }
}
assert.equal(d.usaFighterSorties.ETO.find(x=>x.i===offset(1944,5)).escort,27970);
assert.equal(d.usaFighterSorties.MTO.find(x=>x.i===offset(1944,1)).escort,2628);
assert.equal(d.usaFighterSorties.ETO.find(x=>x.i===offset(1945,2)).strike,37311);
for(const type of ['Fighter','Heavy bomber','Medium/light bomber']){
  assert.equal(d.usCombatLosses[type].length,17);
  for(const year of [1944,1945]){
    const rows=d.usCombatLosses[type].filter(x=>x.year===year);
    for(const key of ['total','enemy','flak','other'])
      assert.equal(rows.reduce((n,x)=>n+x[key],0),d.usCombatLossesAnnual[type][year][key],`${type} ${year} ${key}`);
    for(const x of rows)assert.equal(x.total,x.enemy+x.flak+x.other);
  }
  for(const x of Object.values(d.usCombatLossesAnnual[type]))
    assert.equal(x.total,x.enemy+x.flak+x.other);
}
assert.equal(d.usCombatLosses.Fighter.find(x=>x.i===offset(1944,3)).enemy,201);
assert.equal(d.usCombatLosses['Heavy bomber'].find(x=>x.i===offset(1944,3)).enemy,314);
assert.equal(d.usCombatLosses['Heavy bomber'].find(x=>x.i===offset(1944,7)).enemy,61);
assert.equal(d.pilotAttrition.find(p=>p.i===offset(1942,0)).value,1.8);
assert.equal(d.pilotAttrition.find(p=>p.i===offset(1944,4)).value,25);
assert.equal(d.pilotAttrition.find(p=>p.i===offset(1944,5)),undefined);
assert.equal(d.pilotCasualtyCounts.find(p=>p.i===offset(1944,4)).value,578);
assert.equal(d.pilotCasualtyCounts.find(p=>p.i===offset(1942,0)),undefined);
assert.equal(d.sample(d.usa['P-47'],offset(1936,6)).value,null);
assert.equal(d.sample(d.usa['P-47'],offset(1945,4)).value,null);
assert.equal(d.germanType(offset(1943,7),'Bf 109').value+d.germanType(offset(1943,7),'Fw 190').value,1581);
for(const row of d.theaterLosses){
  assert.ok(row.a<=row.b);
  for(const theatre of [row.east,row.west,row.med]){
    assert.ok(theatre.combat<=theatre.all);
    assert.ok(theatre.all>0&&theatre.strength>0);
  }
}
const site=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(site.includes('European Air War Atlas'));
assert.ok(site.includes('./dist/atlas-v5.js'));
assert.ok(site.includes('./dist/model-v4-data.js'));
assert.ok(site.includes('./dist/atlas.css'));
assert.ok(site.length<50000);
assert.ok(!site.includes('window.LuftV4Data='));
for(const asset of ['atlas.css','atlas-v5.js','model-v3-data.js','model-v3.js','model-v4-data.js','model-v4.js'])
  assert.ok(fs.existsSync(path.join(root,'dist',asset)),asset);
console.log('PASS: archival snapshots, annual original claim/loss totals, recorded pilot rates, gap handling and modular website');
