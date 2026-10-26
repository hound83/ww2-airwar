#!/usr/bin/env node
/* Reproducible Github Pages entrypoint. Individual stylesheet/data/model scripts
   stay as modular, inspectable files in dist/; no duplicated all-in-one bundle. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const performance=JSON.parse(fs.readFileSync(path.join(root,'research/transcriptions/aircraft-performance.json'),'utf8'));
fs.writeFileSync(path.join(root,'dist/atlas-v75-performance-data.js'),'/* Generated from research/transcriptions/aircraft-performance.json; do not edit. */\nwindow.AirWarV75PerformanceData = '+JSON.stringify(performance,null,2)+';\n','utf8');
const source=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
const assets=['atlas.css','atlas-v75.css','model-v3-data.js','model-v3.js','model-v4-data.js','atlas-v6-data.js','atlas-v7-data.js','atlas-v71-data.js','atlas-v72-data.js','atlas-v73-data.js','atlas-v74-data.js','atlas-v75-production.js','atlas-v75-evidence.js','atlas-v75-performance-data.js','atlas-v75-aircraft.js','atlas-v75-aircraft-view.js','atlas-v75-lab.js','atlas-v75-evidence-views.js','atlas-v75-german-production.js','atlas-v75-german-views.js','atlas-v75-map.js','atlas-v75.js','model-v4.js','atlas-v5.js','atlas-v6.js'];
let html=source;
for(const asset of assets){
  const attr=asset.endsWith('.css')?'href':'src';
  const version=asset.startsWith('atlas-v75')?'7.5-preview':asset==='model-v4.js'?'7.4&preview=7.5':'7.4';
  const revision=createHash('sha256').update(fs.readFileSync(path.join(root,'dist',asset))).digest('hex').slice(0,12);
  const old=`${attr}="./${asset}"`,next=`${attr}="./dist/${asset}?v=${version}&r=${revision}"`;
  if(!html.includes(old))throw Error('Missing expected local asset '+old);
  if(!fs.existsSync(path.join(root,'dist',asset)))throw Error('Missing dependency '+asset);
  html=html.replace(old,next);
}
if(/(?:src|href)="\.\/(?!dist\/)/.test(html))throw Error('Unexpected unresolved relative dependency');
fs.writeFileSync(path.join(root,'index.html'),html,'utf8');
console.log('Built GitHub Pages index.html ('+Buffer.byteLength(html)+' bytes; '+assets.length+' modular assets).');
