'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({window:{}});
for(const file of ['model-v3-data.js','model-v4-data.js','atlas-v6-data.js','atlas-v7-data.js','atlas-v71-data.js']){
  vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),ctx,{filename:file});
}
const {AirWarV71Data:Z,AirWarV71QA:QA,LuftData:D}=ctx.window;
assert.equal(QA.version,'7.1');
assert.equal(QA.checkedMonthlyRows(),4);
assert.equal(QA.observedTypeRows(),4);
assert.deepEqual([...new Set(Z.monthlyReturns.map(x=>x.i))],[D.idx(1944,4),D.idx(1944,5)]);
for(const row of Z.monthlyReturns){
  assert.equal(row.destroyed,row.enemyDestroyed+row.otherOperationalDestroyed+row.nonOperationalDestroyed);
  assert.equal(row.damaged,row.enemyDamaged+row.otherOperationalDamaged+row.nonOperationalDamaged);
  assert.ok(row.missing<=row.enemyDestroyed,'missing is subset of enemy destroyed');
  assert.equal(row.quality,'recorded');
  assert.equal(Z.sourceIndex[row.sourceId].type.startsWith('Primary'),true);
}
assert.equal(QA.get(D.idx(1944,4),'Reich').destroyed,924);
assert.equal(QA.get(D.idx(1944,4),'Western Front').destroyed,343);
assert.equal(QA.get(D.idx(1944,5),'Reich').destroyed,433);
assert.equal(QA.get(D.idx(1944,5),'Western Front').destroyed,998);
assert.equal(QA.get(D.idx(1944,5),'Western Front').enemyDestroyed,818);
assert.equal(QA.get(D.idx(1944,5),'Western Front').missing,313);
assert.equal(QA.get(D.idx(1944,3),'Reich'),null,'missing March is not invented zero');
assert.equal(QA.byType(D.idx(1944,4),'Reich','Bf 109'),null,'May model totals not transcribed');
for(const row of Z.juneByType){
  assert.equal(row.quality,'provisional');
  assert.equal(row.destroyed,row.enemyDestroyed+row.otherOperationalDestroyed+row.nonOperationalDestroyed);
  assert.equal(row.damaged,row.enemyDamaged+row.otherOperationalDamaged+row.nonOperationalDamaged);
  assert.ok(row.destroyed<QA.get(row.i,row.theater).destroyed,'type subset cannot exceed all airframes');
  assert.ok(row.damaged<QA.get(row.i,row.theater).damaged,'type subset cannot exceed all damaged');
}
const site=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(site.includes('./dist/atlas-v71-data.js?v=7.2'));
assert.ok(site.indexOf('atlas-v71-data.js')<site.indexOf('model-v4.js'));
assert.ok(fs.readFileSync(path.join(root,'dist','model-v4.js'),'utf8').includes("version:'7.2'"));
console.log('PASS v7.1: original German monthly totals, damaged/destroyed category logic, provisional type transcription and true missing states');
