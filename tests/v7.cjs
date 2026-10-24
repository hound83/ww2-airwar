/* The version-7 source distinction / archive coverage integrity contract. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({window:{}});
for(const file of ['model-v3-data.js','model-v4-data.js','atlas-v6-data.js','atlas-v7-data.js'])
  vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),ctx,{filename:file});
const D=ctx.window.LuftData,Y=ctx.window.AirWarV7Data,QA=ctx.window.AirWarV7QA;
assert.equal(QA.version,'7.0');
assert.equal(Y.pilotApril.losses,489);
assert.equal(Y.pilotApril.replacements,396);
assert.equal(Y.pilotApril.flowDifference,-93);
assert.equal(Y.pilotApril.alternativeMurray447,447);
assert.equal(Y.pilotApril.officerLosses,100);
assert.equal(Y.pilotApril.officerReplacements,62);
assert.equal(Y.pilotBaseline.total,2395);
assert.equal(Y.pilotBaseline.fullyReady+Y.pilotBaseline.partlyReady+Y.pilotBaseline.notFullyOrPartly,Y.pilotBaseline.total);
assert.equal(Y.reichReadiness.length,3);
assert.equal(Y.reichReadiness.filter(r=>r.i===D.idx(1944,6)).length,2,'two dates in July must not be conflated');
for(const p of Y.reichReadiness){assert.ok(p.seReady<=p.seOn);assert.ok(p.teReady<=p.teOn);}
assert.equal(Y.fuelCapacity.length,7);
assert.equal(Y.fuelCapacity.at(-1).aviationFuel,5);
assert.equal(Y.jg53[0].sorties,431);
assert.equal(Y.jg53[1].aircraftFullyDestroyed,34);
assert.equal(QA.originalLossReports(),20);
assert.equal(new Set(Y.lossCatalog.map(p=>p.id)).size,20);
for(const report of Y.lossCatalog){
  assert.ok(report.start<=report.end,report.id);
  assert.ok(report.url.startsWith('https://www.raf.mod.uk/'),report.id);
  assert.equal(report.transcribed,false);
  assert.equal(report.quality,'unavailable');
  assert.ok(!('losses' in report),'do not fabricate type/month counts: '+report.id);
}
assert.ok(QA.archiveCoverage(D.idx(1944,3),D.idx(1944,3),'Reich').some(p=>p.id==='VII/138'));
assert.equal(QA.archiveCoverage(D.idx(1945,4),D.idx(1945,4)).length,0);
const site=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const asset of ['atlas-v7-data.js','model-v4.js','atlas-v5.js'])
  assert.ok(site.includes('./dist/'+asset+'?v=7.1'),asset);
assert.ok(site.indexOf('atlas-v7-data.js')<site.indexOf('model-v4.js'));
console.log('PASS: original pilot flows vs independent casualty series; archival report index; exact dates and no fabricated loss data');
