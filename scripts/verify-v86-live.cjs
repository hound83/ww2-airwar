/* Wait for Pages to serve the exact locally verified explorer and operation assets. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base='https://hound83.github.io/ww2-airwar/';
const files=['grand-air-war-v80.html','dist/grand-air-war-v77-campaigns.js','dist/grand-air-war-v80-core.js','dist/grand-air-war-v86-data.js','dist/grand-air-war-v87-data.js','dist/grand-air-war-v88-data.js','dist/grand-air-war-v88-losses.js','dist/grand-air-war-v90-data.js','dist/grand-air-war-v90-campaign-losses.js','dist/grand-air-war-v86-operations.js','dist/grand-air-war-v86.css'];
files.push('europe.html','dist/europe-index.js','dist/europe.css','dist/europe-return.js','dist/europe-return.css','dist/europe-coast.svg','research/transcriptions/europe-chapters.json');
const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
files.push('operations-1944.html','dist/operations-1944.js','dist/operations-1944.css','research/transcriptions/operations-january-june-1944.json','research/transcriptions/davis-western-targets-may-july-1944.csv');
files.push('bodenplatte.html','dist/bodenplatte.js','dist/bodenplatte.css','dist/bodenplatte-data.js','research/transcriptions/bodenplatte-1945-01-01.json','research/transcriptions/bodenplatte-map.json','research/transcriptions/bodenplatte-operation-scope-1944-1945.json','research/transcriptions/bodenplatte-archival-evidence-1945-01-01.json','research/transcriptions/bodenplatte-unit-airframes-1945-01-01.csv','research/transcriptions/bodenplatte-operation-airframes-1945-01-01.csv','research/transcriptions/wikipedia-followup-evidence-2026-11-12.json');
files.push('operational-balance.html','dist/operational-balance-index.js','dist/operational-balance.css','research/transcriptions/operational-balance.json',
 ...fs.readdirSync(path.join(root,'research/exports')).filter(f=>f.startsWith('operational-balance')&&f.endsWith('.csv')).map(f=>'research/exports/'+f));
files.push('formations.html','dist/formations.js','dist/formations.css','research/transcriptions/formation-histories.json');
files.push('bagration.html','dist/bagration.js','dist/bagration.css','research/transcriptions/bagration-air-campaign-1944.json');
files.push('reich-defence.html','dist/reich-defence.js','dist/reich-defence.css','research/transcriptions/reich-defence-1943-1945.json','research/sources/atlas-reich-defence-2026-11-13.md');
files.push('malta.html','dist/malta.js','dist/malta.css','research/transcriptions/malta-air-campaign-1940-1942.json','research/sources/atlas-malta-air-campaign-2026-11-13.md');
files.push('dieppe.html','sicily.html','dist/sicily.js','dist/sicily.css','research/transcriptions/sicily-air-campaign-1943.json','research/sources/atlas-sicily-air-campaign-2026-11-14.md');
files.push('dist/grand-air-war-v80-studies.js','dist/grand-air-war-v80.css','narvik.html','big-week.html','dist/campaign-studies.css','research/transcriptions/narvik-daily-1940.json');
async function verify(){
 for(let attempt=1;attempt<=30;attempt++){
  const checks=await Promise.all(files.map(async file=>{try{const response=await fetch(base+file+'?verify='+encodeURIComponent(process.env.GITHUB_SHA||'v86'),{signal:AbortSignal.timeout(15000)});return response.ok&&hash(await response.text())===hash(fs.readFileSync(path.join(root,file),'utf8'));}catch{return false;}}));
  if(checks.every(Boolean)){console.log('PASS live Pages: explorer and evidence assets match the verified source revision.');return;}
  console.log('Pages publication pending ('+attempt+'/30): '+files.filter((_,i)=>!checks[i]).join(', '));
  if(attempt<30)await new Promise(resolve=>setTimeout(resolve,10000));
 }
 throw Error('Pages did not serve the expected Atlas assets within the bounded publication window.');
}
verify().catch(error=>{console.error(error);process.exitCode=1;});
