/* v7.5 preview: narrative UI, typed USAAF production, zero/missing contracts. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ctx=vm.createContext({window:{}});
for(const file of ['atlas-v75-production.js','atlas-v75.js'])vm.runInContext(fs.readFileSync(path.join(root,'dist',file),'utf8'),ctx,{filename:file});
const A=ctx.window.AirWarV75Views,P=ctx.window.AirWarV75Production;
assert.equal(A.version,'7.5-preview');
assert.equal(A.campaigns.length,9);
assert.equal(P.geography,'worldwide');
assert.equal(P.metric,'factory_acceptance');
for(const [year,checks] of Object.entries({1943:{'P-38':2213,'P-47':4428,'P-51':1710},1944:{'P-38':4186,'P-47':7065,'P-51':6908},1945:{'P-38':1666,'P-47':3559,'P-51':5111}}))
 for(const [type,annual] of Object.entries(checks))
  assert.equal(P.years[year][type].reduce((n,x)=>n+x,0),annual,year+' '+type+' matches authoritative annual source total');
assert.equal(A.sum([{x:null},{x:undefined}],'x').value,null,'all missing != zero');
assert.equal(A.sum([{x:0},{x:null}],'x').value,0,'recorded zero preserved');
assert.equal(A.sum([{x:10},{x:null}],'x').covered,1,'partial flows retain coverage');
const D={idx:(y,m)=>y*12+m,at:i=>({y:Math.floor(i/12),m:i%12}),label:i=>Math.floor(i/12)+'-'+String(i%12+1).padStart(2,'0')};
const range=Array.from({length:6},(_,i)=>D.idx(1944,i));
const rc={
  ui:{view:'home',theater:'overall'},D,period:{a:range[0],b:range.at(-1),range},
  V:{SOURCES:{us:{short:'USAAF Digest',title:'Table 76',note:'WWII factory acceptances',url:P.url}},usaAnnualAccepted:{'P-47':{1944:7065}},pilotCasualtyCounts:[],pilotAttrition:[]},
  W:{usaFactory:[{year:1944,month:0,fighters:3000,all:8000}],sovietEarly:[{period:'1942-05',fighters:1757}]},
  H:{sovietAt:()=>({value:null})},Z:{monthlyReturns:[]},X:{},Y:{},QA:{},
  germanTheater:()=>({value:null}),allSnapshot:()=>({usTotal:120,rafTotal:80}),
  chart:id=>'<svg id="'+id+'"></svg>'
};
for(const v of ['home','balance','fleet','pilothistory','losses','comparison','campaigns','sources','about']){
  const html=A.render(v,rc);assert.equal(typeof html,'string',v+' must produce HTML');assert.ok(html.length>100,v+' nonempty');
}
assert.equal((A.render('home',rc).match(/v75-photo-card/g)||[]).length,9,'9 navigation photo cards');
assert.ok(A.render('fleet',rc).includes('Monthly factory acceptances'),'documented P-47 monthly series visible');
assert.ok(A.render('pilothistory',rc).includes('Not yet a compatible personnel series'),'no fake Allied pilot series');
assert.ok(A.render('industry',rc)===null,'unrecognized internal route does not render random view');
rc.ui.theater='east';
assert.ok(A.render('losses',rc).includes('Eastern Front source gap'),'West return must not be mislabelled East');
assert.ok(!A.render('losses',rc).includes('German aircraft destroyed</span>'),'no synthetic East loss total');
const page=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.ok(page.includes('atlas-v75-production.js?v=7.5-preview'));
assert.ok(page.indexOf('atlas-v75-production.js')<page.indexOf('atlas-v75.js'));
assert.ok(page.indexOf('atlas-v75.js')<page.indexOf('model-v4.js'));
assert.ok(page.includes('model-v4.js?v=7.4&preview=7.5'),'changed legacy model cache bust without changing v7.4 fallback');
assert.ok(fs.readFileSync(path.join(root,'dist/model-v4.js'),'utf8').includes("preview=7.5"));
console.log('PASS v7.5 preview · 9 views, monthly source data, zero/missing, geography separation and asset order');
