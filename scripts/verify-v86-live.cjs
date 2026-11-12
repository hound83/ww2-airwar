/* Wait for Pages to serve the exact locally verified explorer and operation assets. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),base='https://hound83.github.io/ww2-airwar/';
const files=['grand-air-war-v80.html','dist/grand-air-war-v77-campaigns.js','dist/grand-air-war-v80-core.js','dist/grand-air-war-v86-data.js','dist/grand-air-war-v87-data.js','dist/grand-air-war-v88-data.js','dist/grand-air-war-v88-losses.js','dist/grand-air-war-v90-data.js','dist/grand-air-war-v90-campaign-losses.js','dist/grand-air-war-v86-operations.js','dist/grand-air-war-v86.css'];
const hash=s=>crypto.createHash('sha256').update(s.replace(/\r\n/g,'\n')).digest('hex');
files.push('operations-1944.html','dist/operations-1944.js','dist/operations-1944.css','research/transcriptions/operations-january-june-1944.json','research/transcriptions/davis-western-targets-may-july-1944.csv');
files.push('bodenplatte.html','dist/bodenplatte.js','dist/bodenplatte.css','research/transcriptions/bodenplatte-1945-01-01.json');
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
