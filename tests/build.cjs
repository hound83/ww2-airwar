'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),parent=path.resolve(os.tmpdir()),tmp=fs.mkdtempSync(path.join(parent,'airwar-build-'));
try{
 for(const folder of ['dist','scripts','research/transcriptions'])fs.mkdirSync(path.join(tmp,folder),{recursive:true});
 const files=['scripts/build-web.cjs','research/transcriptions/aircraft-performance.json',...fs.readdirSync(path.join(root,'dist')).filter(f=>/\.(js|css|html)$/.test(f)).map(f=>'dist/'+f)];
 const build=()=>cp.execFileSync(process.execPath,[path.join(tmp,'scripts/build-web.cjs')],{stdio:'pipe'});
 for(const file of files)fs.writeFileSync(path.join(tmp,file),fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'));
 build();
 const lf=fs.readFileSync(path.join(tmp,'index.html'),'utf8'),data=fs.readFileSync(path.join(tmp,'dist/atlas-v75-performance-data.js'),'utf8');
 for(const file of files)fs.writeFileSync(path.join(tmp,file),fs.readFileSync(path.join(tmp,file),'utf8').replace(/\r\n/g,'\n').replace(/\n/g,'\r\n'));
 build();
 assert.equal(fs.readFileSync(path.join(tmp,'index.html'),'utf8'),lf,'LF and CRLF checkouts produce identical HTML and cache hashes');
 assert.equal(fs.readFileSync(path.join(tmp,'dist/atlas-v75-performance-data.js'),'utf8'),data,'generated evidence is deterministic across platforms');
 assert.equal(fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n'),lf,'committed root entrypoint is current');
 console.log('PASS reproducible build: Windows and Linux line endings produce identical HTML, cache keys and evidence');
}finally{
 if(path.dirname(path.resolve(tmp))!==parent||!path.basename(tmp).startsWith('airwar-build-'))throw Error('Unexpected temporary cleanup path');
 fs.rmSync(tmp,{recursive:true,force:true});
}
