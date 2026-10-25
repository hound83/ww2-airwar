'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const atlas=fs.readFileSync(path.join(root,'dist/model-v4.js'),'utf8');
const css=fs.readFileSync(path.join(root,'dist/atlas.css'),'utf8');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dist=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const source=JSON.parse(fs.readFileSync(path.join(root,'research/transcriptions/usaaf-factory-acceptances-table74.json'),'utf8'));
const ctx=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(root,'dist/atlas-v74-data.js'),'utf8'),ctx);
const W=ctx.window.AirWarV74Data;
assert.equal(W.usaFactory.length,68,'68 official factory acceptance months');
assert.equal(W.sovietEarly.length,5,'five early VVS source observations');
assert.equal(W.sovietEarly.find(p=>p.period==='1942-05').trainedFighterCrews,1270,
  'wartime early Soviet trained fighter crews kept separate from aircraft');
assert.equal(W.usaFactory[0].period,'1940-01');
assert.equal(W.usaFactory.at(-1).period,'1945-08');
for(let y=1940;y<=1945;y++){
  const rows=W.usaFactory.filter(r=>r.year===y);
  assert.equal(rows.length,y===1945?8:12);
  for(const [key,orig] of [['fighters','fighters'],['all','all_aircraft']])
    assert.equal(rows.reduce((a,p)=>a+p[key],0),source.annual[String(y)][orig],`${y} ${key} annual controls`);
}
for(const row of W.usaFactory){
  assert.equal(row.all,row.fighters+row.heavy+row.medium+row.noncombat,`${row.period} categories reconcile`);
  assert.ok(row.fighters>=0&&row.all>=0);
}
assert.equal(source.transcription_corrections.length,3,'all detected digitization conflicts preserved');
assert.equal(W.metadata.observation,'monthly_flow');
assert.equal(W.metadata.geography,'worldwide');
assert.ok(!W.sovietEarly.some(p=>p.coverage==='worldwide'),'1941 populations do not fake global USSR coverage');
assert.ok(W.sovietEarly.every(p=>W.sources[p.sourceId]?.url),'early observations cite original host');
for(const file of ['airpower.jpg','pilots.jpg','losses.jpg','industry.jpg','simulations.jpg','research.jpg',
  'barlow-condensed-700.woff2','barlow-condensed-600.woff2','source-sans-3.woff2',
  'OFL-BarlowCondensed.txt','OFL-SourceSans3.txt'])
  assert.ok(fs.statSync(path.join(root,'dist/assets',file)).size>50,`${file} valid nonempty asset`);
assert.ok(page.includes('./dist/atlas-v74-data.js?v=7.4'));
assert.ok(page.indexOf('atlas-v74-data.js?v=7.4')<page.indexOf('model-v4.js?v=7.4'));
assert.ok(dist.includes('./atlas-v74-data.js'));
assert.ok(atlas.includes("version:'7.4'"));
assert.ok(atlas.includes('renderHome()'));
assert.ok(atlas.includes('factoryEvidence()'));
assert.ok(atlas.includes("ui.view==='home'"));
assert.ok(!atlas.includes('v4-return-pilots'),'no redundant source-page simulator CTA');
assert.ok(css.includes('.v4-on .timeline-panel>.view-toggle'),'legacy controls cannot leak onto research pages');
assert.ok(css.includes('@font-face'),'self-hosted typography');
assert.ok(css.includes('.v74-home-grid'),'six-card homepage');
assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'),'desktop cards laid out');
assert.ok(fs.existsSync(path.join(root,'research/sources/lead-inventory.md')));
assert.ok(fs.existsSync(path.join(root,'research/sources/visual-credits.md')));
console.log('PASS v7.4: 68 original USAAF factory months reconcile by category and year; Soviet front scopes remain separate; photo, font, responsive homepage and research provenance assets present');
