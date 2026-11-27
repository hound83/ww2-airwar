"use strict";
const assert=require("node:assert/strict"), fs=require("node:fs"), path=require("node:path"), vm=require("node:vm");
const root=path.join(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const ctx=vm.createContext({window:{}});
for (const name of ["grand-air-war-v77-campaigns","normandy-1944-story","force-rosters-data","campaign-expansion-data","campaign-expansion"]) {
  vm.runInContext(read("dist/"+name+".js"),ctx);
}
const w=ctx.window,{campaigns,sources}=w.AtlasExpansion;
const catalogue=w.GrandAirWarV77Campaigns.campaigns;
assert.equal(catalogue.length,new Set(catalogue.map(c=>c.id)).size);
assert.equal(catalogue.length,42);
assert.equal(campaigns.length,22);
const raw=(file)=>JSON.parse(read("research/transcriptions/v12-"+file+".json"));
const csv=file=>read("research/exports/v12-"+file+".csv").trimEnd().split("\n");
for (const [family,count] of [["episodes",93],["figures",95],["sources",84]]) assert.equal(csv(family).length,count+1);
const used=new Set();
for (const c of campaigns) {
  const dossier=catalogue.find(x=>x.id===c.id),roster=w.AtlasForceRosters.campaigns[c.id],study=w.AtlasExpansionIndex.studies[c.id];
  assert.ok(c.related.every(id=>catalogue.some(d=>d.id===id)));
  assert.ok(dossier && roster && study && c.episodes.length>=3 && dossier.facts.length>=1);
  assert.equal(roster.cases.length,c.episodes.length);
  assert.ok(read("campaign-expansion.html").includes('id="'+c.id+'"'));
  const keys=new Set();
  for (const [i,e] of c.episodes.entries()) {
    assert.match(e.date,/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(e.date.slice(0,7)>=c.start && e.date.slice(0,7)<=c.end);
    if(i)assert.ok(e.date>=c.episodes[i-1].date);
    assert.ok(!keys.has(e.date+"|"+e.title));keys.add(e.date+"|"+e.title);
    assert.ok(Number.isFinite(e.lat) && Number.isFinite(e.lng) && e.lat>=20 && e.lat<=80 && e.lng>=-80 && e.lng<=100);
    assert.ok(e.action && e.outcome && e.sources.length && e.sources.every(id=>sources[id]));
    e.sources.forEach(id=>used.add(id));
    const k=roster.cases[i];assert.equal(k.title,e.title);
    for(const id of k.rosterIds) {
      const p=roster.populations.find(p=>p.id===id);
      assert.equal(p.date,e.date);assert.equal(p.total,p.members.length);
      assert.ok(p.members.every(m=>m.strength===null && m.serviceable===null && m.stations.length===0));
    }
    for (const f of e.figures) assert.ok(Number.isFinite(f.value) && f.period && f.scope && f.type && e.sources.includes(f.source));
  }
}
assert.equal(used.size,Object.keys(sources).length);
for (const s of Object.values(sources)) {
  assert.ok(s.name && s.kind && s.locator);assert.equal(new URL(s.url).protocol,"https:");assert.doesNotMatch(s.url,/\s|:$/);
}
const arctic=raw("arctic-passages"), atlantic=raw("atlantic-passages"), balkans=raw("balkan-airlift"), oil=raw("romanian-oil");
assert.equal(arctic.filter(r=>r.direction==="eastbound").length,42);
assert.equal(arctic.filter(r=>r.direction==="westbound").length,36);
for (const r of arctic) assert.equal(r.sailed,r.arrived+r.returned+r.aircraft+r.submarine+r.surface+r.mines+r.foundered,r.convoy);
assert.equal(atlantic.length,20);
assert.equal(atlantic.find(r=>r.convoy==="ONS 5").stragglersLostToEnemy,2);
assert.equal(atlantic.find(r=>r.convoy==="HX 235").collisionLosses,1);
assert.equal(atlantic.find(r=>r.convoy==="SC 130").inConvoyLostToEnemy,0);
for (const r of balkans) {assert.equal(r.evacuated,r.aircrewAndPartisans+r.wounded+r.others);assert.ok(r.landings<=r.attempts);}
assert.equal(balkans.filter(r=>r.period.startsWith("1944")).reduce((n,r)=>n+r.evacuated,0),7863);
assert.equal(oil.length,8);assert.equal(oil[6].refineryOutput,null);assert.equal(oil[5].refineryOutput,100747);
for (const [f,rows] of [["arctic-passages",arctic],["atlantic-passages",atlantic],["balkan-airlift",balkans],["romanian-oil",oil]])assert.equal(csv(f).length,rows.length+1);
console.log("PASS expansion catalogue, source links, unit scopes, dated episodes, quantitative observations and four independent reporting series.");
