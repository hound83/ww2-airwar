'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({window:{}});
for(const file of ['model-v3-data.js','model-v4-data.js','atlas-v6-data.js','atlas-v73-data.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),ctx,{filename:file});
const {AirWarV73Data:H,LuftData:D,LuftV4Data:V,AirWarV6Data:X}=ctx.window;

assert.equal(H.soviet.length,5,'five separately cited Soviet original checkpoints');
for(const [year,month,fighters] of [[1943,6,3690],[1944,0,3926],[1944,5,5815],[1945,0,5810],[1945,4,6268]]){
  const p=H.sovietAt(D.idx(year,month),'reconstruct');
  assert.equal(p.value,fighters);
  assert.equal(p.quality,'recorded');
  assert.ok(H.sources[p.source].url.startsWith('https://www.rkka.es/'));
}
assert.equal(H.sovietAt(D.idx(1942,5),'reconstruct').value,null,'no Soviet pre-checkpoint extrapolation');
assert.equal(H.sovietAt(D.idx(1944,3)).quality,'unavailable','strict VVS series never silently fills gaps');
assert.equal(H.sovietAt(D.idx(1944,3),'reconstruct').quality,'interpolated','between two observed dates = interpolation');
assert.equal(H.sovietAt(D.idx(1945,5),'reconstruct').value,null,'no imaginary post-VE return');

for(const q of V.theaterLosses){
  for(const front of ['west','med','east']){
    const monthly=Array.from({length:q.b-q.a+1},(_,j)=>H.quarterLossAt(q.a+j,front));
    assert.equal(monthly.reduce((n,p)=>n+p.value,0),q[front].all,'reconcile archived '+q.label+' '+front);
    for(const p of monthly)assert.equal(p.quality,q.a===q.b?'recorded':'estimated');
  }
}
assert.equal(H.quarterLossAt(D.idx(1944,5),'west').value>H.quarterLossAt(D.idx(1944,3),'west').value,true,
  'June 1944 Western losses weighted above April within same original quarter');
assert.equal(H.quarterLossAt(D.idx(1944,6),'east').value>H.quarterLossAt(D.idx(1944,8),'east').value,true,
  'July 1944 Eastern losses weighted above September within same original quarter');
assert.equal(H.quarterLossAt(D.idx(1942,1),'east').value,null,'no quarter source means missing, not zero');

for(const [side,family] of [['Germany','Bf 109'],['Germany','Fw 190'],['RAF','Spitfire'],['USAAF','P-51']]){
  for(let i=D.idx(1943,0);i<=D.idx(1945,4);i++){
    const shares=H.mix(family,side,i,1200);
    if(shares.length){
      assert.equal(shares.reduce((n,p)=>n+p.value,0),1200,'all subtype counts reconcile to their existing family stock');
      assert.ok(shares.every(p=>p.value>=0&&p.quality==='estimated'&&i>=p.from&&i<=p.to));
    }
  }
}
assert.equal(H.mix('P-51','USAAF',D.idx(1943,0),700).length,0,'pre-European P-51 must not be assigned a subtype');
assert.equal(X.germanAt(D.idx(1945,4)).strength,null,'no May 1945 archival fighter return invented');
const model=fs.readFileSync(path.join(root,'dist/model-v4.js'),'utf8');
assert.ok(model.includes("version:'7.4'"));
assert.ok(model.includes('data-v73-theater'));
assert.ok(model.includes('periodOverview()'));
assert.ok(!model.includes('id="v4-month"'),'one selected period, no redundant month dropdown');
assert.ok(model.includes('easternFrontLens()'),'east front has explicit, front-specific view');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(page.indexOf('atlas-v73-data.js?v=7.4')<page.indexOf('model-v4.js?v=7.4'));
console.log('PASS v7.3: Soviet sourced checkpoints, gap discipline, event-weighted estimates reconcile to quarter totals, model-only fighter variants, theater controls and period-first UX');
