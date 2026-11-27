'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),parent=path.resolve(os.tmpdir()),tmp=fs.mkdtempSync(path.join(parent,'airwar-build-'));
try{
 for(const folder of ['dist','scripts','research/transcriptions'])fs.mkdirSync(path.join(tmp,folder),{recursive:true});
 const files=['scripts/build-web.cjs','scripts/build-europe.cjs','dist/europe-coast.svg','research/transcriptions/europe-chapters.json','scripts/build-narvik.cjs','scripts/build-formations.cjs','scripts/build-operational-balance.cjs','research/transcriptions/operational-balance.json','research/transcriptions/formation-histories.json','research/transcriptions/narvik-daily-1940.json','research/transcriptions/aircraft-performance.json','research/transcriptions/normandy-v86-operations.json','research/transcriptions/britain-v87-operations.json','research/transcriptions/claims-losses-v88.json','research/transcriptions/battle-of-britain-campaign-claims-1940.json',...fs.readdirSync(path.join(root,'dist')).filter(f=>/\.(js|css|html)$/.test(f)).map(f=>'dist/'+f)];
 files.push('scripts/build-operational-effects.cjs','research/transcriptions/v11-operational-effects.json','research/transcriptions/v11-dossier-audit.json');
 files.push('scripts/build-campaign-evidence.cjs', ...fs.readdirSync(path.join(root,'research/transcriptions')).filter(f=>/^v102-.*\.json$/.test(f)).map(f=>'research/transcriptions/'+f));
 files.push('scripts/build-force-rosters.cjs', ...['campaign-force-coverage.json','deployment-stations.json','deployment-roster-context.json','deployment-benchmark-populations.csv','deployment-benchmark-members.csv','deployment-eastern-populations.csv','deployment-eastern-members.csv'].map(f=>'research/transcriptions/'+f));
 const expansionOutputs=["campaign-expansion.html","dist/campaign-expansion-data.js",...["episodes","figures","sources","atlantic-passages","arctic-passages","balkan-airlift","romanian-oil"].map(f=>"research/exports/v12-"+f+".csv")];
 files.push("scripts/build-campaign-expansion.cjs",...fs.readdirSync(path.join(root,"research/transcriptions")).filter(f=>f.startsWith("v12-")).map(f=>"research/transcriptions/"+f));
 const build=()=>cp.execFileSync(process.execPath,[path.join(tmp,'scripts/build-web.cjs')],{stdio:'pipe'});
 for(const file of files)fs.writeFileSync(path.join(tmp,file),fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'));
 build();
 const histories=fs.readFileSync(path.join(tmp,'formations.html'),'utf8');
 const balanceFiles=[...expansionOutputs,'operational-effects.html','dossier-audit.html','research/exports/operational-effects.csv','research/exports/dossier-audit.csv','research/exports/campaign-coverage.csv','research/exports/campaign-missions.csv','dist/force-rosters-data.js','research/exports/force-rosters.csv','europe.html','dist/europe-index.js','operational-balance.html','dist/operational-balance-index.js',...fs.readdirSync(path.join(tmp,'research/exports')).filter(n=>n.startsWith('operational-balance')).map(n=>'research/exports/'+n)];
 const balanceOutputs=balanceFiles.map(p=>fs.readFileSync(path.join(tmp,p),'utf8'));
 const narvik=fs.readFileSync(path.join(tmp,'narvik.html'),'utf8');
 const lf=fs.readFileSync(path.join(tmp,'index.html'),'utf8'),data=fs.readFileSync(path.join(tmp,'dist/atlas-v75-performance-data.js'),'utf8');
 for(const file of files)fs.writeFileSync(path.join(tmp,file),fs.readFileSync(path.join(tmp,file),'utf8').replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'));
 build();
 balanceFiles.forEach((p,i)=>{
   assert.equal(fs.readFileSync(path.join(tmp,p),'utf8'),balanceOutputs[i],p+' CRLF rebuild');
   assert.equal(fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n'),balanceOutputs[i],p+' published content');
 });
 assert.equal(fs.readFileSync(path.join(tmp,'formations.html'),'utf8'),histories,'formation pages must survive CRLF checkouts');
 assert.equal(fs.readFileSync(path.join(root,'formations.html'),'utf8').replace(/\r\n/g,'\n'),histories,'published formation pages must match the source graph');
 assert.equal(fs.readFileSync(path.join(tmp,'narvik.html'),'utf8'),narvik,'Narvik table must survive CRLF checkouts');
 assert.equal(fs.readFileSync(path.join(root,'narvik.html'),'utf8').replace(/\r\n/g,'\n'),narvik,'published Narvik table must match its transcription');
 assert.equal(fs.readFileSync(path.join(tmp,'index.html'),'utf8'),lf,'LF and CRLF checkouts produce identical HTML and cache hashes');
 assert.equal(fs.readFileSync(path.join(tmp,'dist/atlas-v75-performance-data.js'),'utf8'),data,'generated evidence is deterministic across platforms');
 assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n'),lf,'committed root entrypoint is current');
 console.log('PASS reproducible build: Windows and Linux line endings produce identical HTML, cache keys and evidence');
}finally{
 if(path.dirname(path.resolve(tmp))!==parent||!path.basename(tmp).startsWith('airwar-build-'))throw Error('Unexpected temporary cleanup path');
 fs.rmSync(tmp,{recursive:true,force:true});
}
// The standalone v7.6 page is not in build-web's generated root entrypoint.
// Validate its independent source/asset graph alongside normal reproducibility checks.
require('./grand-air-war-v76.cjs');
require('./europe.cjs');
require('./campaign-evidence.cjs');

// Historical Europe overview modules and data populations are tested in default CI.
require('./grand-air-war-v77.cjs');

// Verify v7.7 changes visible source data when the user actually operates controls.
require('./grand-air-war-v77-interactions.cjs');

// Grand Air War v8.0 German research and physical chart map regressions.
require('./grand-air-war-v80.cjs');

// Cross-check every rendered campaign, date, scope, aggregation and missing value.
require('./grand-air-war-v80-audit.cjs');

// Full campaign filter/zoom and separated research-population interaction matrix.
require('./grand-air-war-v80-interactions.cjs');

// Normandy operation journeys and dated evidence integrity.
require('./grand-air-war-v86.cjs');

// Bodenplatte airfield observations and source boundaries.
require('./bodenplatte.cjs');

// Operation Bagration campaign evidence and source boundaries.
require('./bagration.cjs');

// Reich defence case chronology, population boundaries and source graph.
require('./reich-defence.cjs');

// Malta campaign chronology, provenance and populations.
require('./malta.cjs');

// Sicily campaign chronology, capture dates, readiness and source scope.
require('./sicily.cjs');

require('./campaign-review.cjs');
require('./formations.cjs');
require('./operational-balance.cjs');

require("./campaign-expansion.cjs");
