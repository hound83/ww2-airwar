#!/usr/bin/env node
/* Build a reproducible, self-contained HTML release for GitHub Pages and download.
 * Source-of-truth: dist/index.html + dist/atlas.css + dist/model*.js
 * Artifact: ../index.html at the repository root for Pages + offline download.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const srcDir=path.resolve(__dirname,'../dist');
let html=fs.readFileSync(path.join(srcDir,'index.html'),'utf8');
const files=['atlas.css','model-v3-data.js','model-v3.js','model-v4-data.js','model-v4.js'];
for(const filename of files){
  const css=filename.endsWith('.css');
  const target=css?`<link rel="stylesheet" href="./${filename}">`:`<script src="./${filename}"></script>`;
  if(!html.includes(target))throw Error('Expected source reference not present: '+filename);
  const content=fs.readFileSync(path.join(srcDir,filename),'utf8');
  if(css&&/<\/style/i.test(content))throw Error('Unsafe CSS closing tag in '+filename);
  if(!css&&/<\/script/i.test(content))throw Error('Unsafe JS closing tag in '+filename);
  const inline=css?`<style>\n${content}\n</style>`:`<script>\n${content}\n</script>`;
  html=html.replace(target,inline);
}
if(/(?:src|href)="\.\//.test(html))throw Error('Unexpected relative asset left in standalone HTML');
const output=path.resolve(srcDir,'../index.html');
fs.writeFileSync(output,html);
console.log('Built '+output+' ('+Buffer.byteLength(html).toLocaleString('en-US')+' bytes).');
