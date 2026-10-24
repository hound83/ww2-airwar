/* Source integrity: date-order, scope, totals, reproducibility, no fabricated VE-Day records. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({window:{}});
for(const filename of ['model-v3-data.js','model-v4-data.js','atlas-v6-data.js','atlas-v6.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'dist',filename),'utf8'),ctx,{filename});
const D=ctx.window.LuftData,X=ctx.window.AirWarV6Data,QA=ctx.window.AirWarV6QA;
assert.equal(QA.version,'6.0');
assert.equal(QA.returnCount(),27);
assert.equal(QA.chapterCount(),22);
assert.equal(QA.wikiCount(),24);
assert.ok(QA.bibliographyCount()>=34);
assert.ok(QA.sourceCount()>=16);
for(const [k,p] of X.germanFighterReadiness.entries()){
  assert.equal(p.quality,'recorded');
  assert.equal(p.source,'ahb107');
  assert.ok(p.serviceable>0&&p.serviceable<=p.strength,'German fighter serviceability bounded: '+p.date);
  if(k)assert.ok(p.i>X.germanFighterReadiness[k-1].i,'Source return months strictly ascending');
  const date=new Date(Date.UTC(p.year,p.month,p.day));
  assert.equal(date.getUTCMonth(),p.month,'valid day in source month: '+p.date);
  const point=X.germanAt(p.i);
  assert.equal(point.quality,'recorded');
  assert.equal(point.strength,p.strength);
  assert.equal(point.serviceable,p.serviceable);
  assert.equal(D.aircraft(p.i).value,p.serviceable,'simulator anchored to original serviceable value');
  assert.equal(D.aircraft(p.i).quality,'documented');
}
assert.equal(QA.audit(D.idx(1936,6)).classification,'unavailable');
assert.equal(QA.audit(D.idx(1945,4)).classification,'unavailable');
assert.equal(X.germanAt(D.idx(1945,4)).strength,null);
assert.equal(X.germanAt(D.idx(1945,3)).strength,2173);
assert.equal(X.germanAt(D.idx(1945,3)).serviceable,1648);
assert.equal(X.germanAt(D.idx(1940,7)).serviceable,853);
assert.equal(X.germanAt(D.idx(1943,7)).strength,1581);
assert.equal(X.germanAt(D.idx(1943,7)).serviceable,1019);
assert.equal(X.germanAt(D.idx(1944,9)).strength,3055);
assert.equal(X.germanAt(D.idx(1944,9)).serviceable,2487);
assert.equal(X.germanAt(D.idx(1944,8)).quality,'recorded');
assert.equal(X.germanAt(D.idx(1944,8)).strength,1984);
assert.equal(X.germanAt(D.idx(1944,8)).serviceable,1413);
assert.equal(X.germanAt(D.idx(1944,4)).serviceable,1111);
assert.equal(X.germanAt(D.idx(1944,2)).strength,1696);
for(const cls of X.germanClassSnapshots)for(const pair of Object.values(cls.values))
  assert.ok(pair[1]<=pair[0]&&pair[0]>0,'Original strength vs serviceable');
for(const key of ['air','ground','airLoss','strafingLoss']){
  const sum=X.eighthFighterTypes.reduce((n,p)=>n+p[({air:'air',ground:'ground',airLoss:'airLoss',strafingLoss:'strafingLoss'})[key]],0);
  assert.ok(Math.abs(X.eighthAggregate[key]-sum)<1e-6,key+' matches 8th fighter type subtotals');
}
assert.equal(X.eighthAggregate.strafingLoss-X.eighthAggregate.printedStrafingLoss,1,
  'Original publication contains an explicit one-aircraft discrepancy');
assert.equal(X.bigWeekOfficial.usFighterSorties.eighth,2548);
assert.equal(X.bigWeekOfficial.germanWesternFighterLost[1].max-X.bigWeekOfficial.germanWesternFighterLost[1].min,77);
const allied=X.september44Allied.forces;
assert.equal(allied.reduce((n,p)=>n+p.total,0),X.september44Allied.reportedTotal.total);
assert.equal(allied.reduce((n,p)=>n+p.operational,0),X.september44Allied.reportedTotal.operational);
assert.equal(X.september44Allied.germanWest.fightersOnStrength,431);
assert.equal(new Set(X.historyChapters.map(p=>p.url)).size,22);
const rootHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const asset of ['atlas-v6-data.js','atlas-v6.js','model-v3.js','model-v4.js','atlas.css'])
  assert.ok(rootHtml.includes('./dist/'+asset+'?v=7.1'));
assert.ok(rootHtml.indexOf('atlas-v6-data.js')<rootHtml.indexOf('model-v4.js'));
assert.ok(rootHtml.indexOf('atlas-v5.js')<rootHtml.indexOf('atlas-v6.js'));
console.log('PASS: v6 aircraft records, date windows, observed/estimated distinction, source-audited Eighth Command totals, campaign tables, bibliography and publication assets');
