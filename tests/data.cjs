/* Standalone and archival-series tests, require Node.js only. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const offset=(y,m)=>(y-1936)*12+m-6;
const ctx=vm.createContext({window:{LuftData:{idx:offset,at:i=>{
  const n=6+i;return {y:1936+Math.floor(n/12),m:n%12};
},readiness43:[[7,2228,1581,1019],[8,2228,1646,1080],[9,2288,1721,1193],[10,2244,1789,1140],[11,2244,1561,1095]]}}});
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
assert.equal(d.usaFighterLossMonthly.reduce((s,x)=>s+x.value,0),1048);
assert.equal(d.usaFighterLossMonthly[1].value,23);
assert.equal(d.usaFighterLossMonthly.at(-1).value,358);
assert.equal(d.usaFighterLossMonthly.find(p=>p.i===offset(1945,4)),undefined);
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
const standalone=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(standalone.includes('European Air War Atlas v4'));
assert.ok(standalone.includes('window.LuftV4Data'));
assert.ok(standalone.includes('window.AirWarAtlasQA'));
assert.ok(!/(?:src|href)="\.\//.test(standalone));
assert.ok(standalone.length>150000);
console.log('PASS: archival snapshots, historical bounds, cost figures, no fabricated gap totals, source structure, single-file build');
