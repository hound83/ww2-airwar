"use strict";
const assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path"), vm=require("node:vm");
const root=path.join(__dirname,".."), read=f=>fs.readFileSync(path.join(root,f),"utf8").replace(/\r\n/g,"\n");
const ctx=vm.createContext({window:{}});
for(const f of ["grand-air-war-v77-campaigns","force-rosters-data"])vm.runInContext(read("dist/"+f+".js"),ctx);
const d=ctx.window.AtlasForceRosters;
const {coverage,csv}=require("../dist/force-rosters-shared.js");
const all=[],byId=new Map();
assert.deepEqual(Object.keys(d.campaigns).sort(),Array.from(ctx.window.GrandAirWarV77Campaigns.campaigns,c=>c.id).sort());
for(const [id,c] of Object.entries(d.campaigns)){
  assert.ok(c.forces.length>=2,id+" belligerents");
  for(const key of ["summary","geography","strength","effort","losses","effect","source","locator"])assert.ok(c[key],id+" "+key);
  for(const p of c.populations){
    assert.ok(!byId.has(p.id));byId.set(p.id,p);
    all.push({campaign:id,population:p,members:p.members});
    assert.ok(p.date&&p.echelon&&p.scope&&p.locator&&p.source.startsWith("https://"));
    assert.ok(p.members.length<=p.total);
    assert.equal(new Set(p.members.map(m=>m.unit)).size,p.members.length);
    for(const m of p.members){
      assert.ok(m.source&&m.locator);
      if(m.activity)assert.ok(m.activitySource&&m.activityLocator);
      for(const s of m.stations){const x=d.stations[s];assert.ok(x?.source&&x.locator&&Number.isFinite(x.lat)&&Number.isFinite(x.lon),m.unit+" station "+s);}
    }
  }
}
function count(id,n){assert.equal(byId.get(id).members.length,n,id);assert.equal(byId.get(id).total,n,id)}
function stocks(ids){return ids.flatMap(id=>Array.from(byId.get(id).members)).reduce(([a,b],m)=>[a+m.strength,b+m.serviceable],[0,0])}
count("sicily-gruppen",4);count("sicily-stab",2);count("sicily-211",23);count("sicily-211-wings",5);count("sicily-xii",5);
assert.deepEqual(stocks(["sicily-gruppen","sicily-stab"]),[136,55]);assert.equal(coverage(byId.get("sicily-italian")),"At least 5 identified");
count("britain-lf2",21);count("britain-lf2-hq",8);count("britain-11g",23);
assert.deepEqual(stocks(["britain-lf2","britain-lf2-hq"]),[669,533]);count("citadel-gruppen",8);
count("bagration-air-armies",5);const children=[...byId.values()].filter(p=>p.parentPopulation==="bagration-air-armies");
assert.equal(children.length,5);assert.equal(children.reduce((a,p)=>a+p.members.length,0),52);
for(const child of children)assert.ok(byId.get(child.parentPopulation).members.some(m=>m.unit===child.parentUnit));
for(const [id,n] of [["kursk-2va-divisions",11],["kursk-16va-divisions",12],["kursk-17va-divisions",9],["kursk-hungarian-brigade",6]])count(id,n);
assert.equal(byId.get("stalingrad-ro").total,26);
assert.ok(byId.get("stalingrad-ro").members.length>0);
assert.equal(coverage(byId.get("berlin-250-raf-support")),"2 reported · names unresolved");
assert.ok(all.some(r=>r.members.some(m=>m.activity && m.stations.length)));
assert.equal(csv(all,d.stations),read("research/exports/force-rosters.csv"));
assert.match(csv([all.find(x=>x.population.id==="berlin-250-raf-support")],d.stations),/reported total only/);
console.log("PASS dated force coverage: "+all.length+" returns across 20 campaigns; "+all.reduce((a,i)=>a+i.members.length,0)+" dated memberships; stocks, sources, parent links and CSV agree.");
