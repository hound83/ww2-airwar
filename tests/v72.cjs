'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({window:{}});
for(const file of ['model-v3-data.js','model-v4-data.js','atlas-v6-data.js','atlas-v7-data.js','atlas-v71-data.js','atlas-v72-data.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),ctx,{filename:file});
const {AirWarV71Data:old,AirWarV72Data:now,AirWarV72QA:QA,LuftData:D,AirWarV7Data:archive}=ctx.window;
assert.equal(QA.version,'7.2');
assert.equal(QA.monthlyRows(),26);
assert.equal(QA.scannedReports(),8);
assert.equal(archive.lossCatalog.length,20);
assert.equal(old.monthlyReturns.length,4,'original v7.1 sources kept');
assert.equal(now.reportIds.length,8);
assert.equal(new Set(now.reportIds).size,8);
const combined=[...old.monthlyReturns,...now.monthlyReturns];
assert.equal(combined.length,30);
assert.equal(new Set(combined.map(p=>p.i+':'+p.theater)).size,30,'no double counting months');
for(const p of combined){
  assert.equal(p.destroyed,p.enemyDestroyed+p.otherOperationalDestroyed+p.nonOperationalDestroyed,p.month+' '+p.theater);
  assert.equal(p.damaged,p.enemyDamaged+p.otherOperationalDamaged+p.nonOperationalDamaged,p.month+' '+p.theater);
  assert.ok(p.missing>=0&&p.missing<=p.enemyDestroyed);
  assert.equal(p.quality,'recorded');
  assert.ok((now.sourceIndex[p.sourceId]||old.sourceIndex[p.sourceId]).url.startsWith('https://www.raf.mod.uk/'));
  if(p.sourceId in now.sourceIndex)assert.ok(p.page>0);
}
for(let month=D.idx(1943,8);month<=D.idx(1944,10);month++){
  for(const theater of ['Reich','Western Front']){
    const rows=combined.filter(p=>p.i===month&&p.theater===theater);
    assert.equal(rows.length,1,'exactly one source per '+D.label(month)+' '+theater);
  }
}
for(const theater of ['Reich','Western Front']){
  assert.equal(QA.get(D.idx(1943,7),theater),null,'August 1943 remains missing in current series');
  assert.equal(QA.get(D.idx(1944,11),theater),null,'December 1944 remains missing');
  assert.equal(QA.get(D.idx(1945,4),theater),null,'May 1945 remains missing');
}
assert.equal(QA.get(D.idx(1944,2),'Reich').nonOperationalDamaged,202,'uses manual correction, not crossed-out 304');
assert.equal(QA.get(D.idx(1944,2),'Reich').damaged,436,'March 1944 total reconciles corrected 202');
assert.equal(QA.get(D.idx(1943,8),'Western Front').page,20,'September month-end is not October 1st p21');
assert.equal(QA.get(D.idx(1944,8),'Western Front').destroyed,240,'post-rename command total retained by narrow scope');
assert.equal(QA.get(D.idx(1944,7),'Reich').destroyed,656);
assert.equal(QA.get(D.idx(1944,7),'Western Front').destroyed,868);
assert.equal(QA.get(D.idx(1944,10),'Reich').destroyed,672);
const rootPage=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(rootPage.includes('./dist/atlas-v72-data.js?v=7.2'));
assert.ok(rootPage.indexOf('atlas-v71-data.js')<rootPage.indexOf('atlas-v72-data.js'));
assert.ok(rootPage.indexOf('atlas-v72-data.js')<rootPage.indexOf('model-v4.js'));
const model=fs.readFileSync(path.join(root,'dist/model-v4.js'),'utf8');
assert.ok(model.includes("version:'7.2'"));
assert.ok(model.includes('v72-matrix-empty'),'unverified monthly figures must be visibly marked');
assert.ok(model.includes('Reich_missing_subset_enemy_destroyed_PRIMARY'),'CSV preserves reported missing subsets');
console.log('PASS v7.2: 30 exact German command-month returns, original scan corrections, distinct loss causes, true data gaps, and reporting-boundary caveats');
