/* Node-only DOM shim: runs EVERY new Atlas render path, no browser download. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../dist');
function node(id='',classes=[]){
  const present=new Set(classes);
  return {id,children:[],dataset:{},value:'',checked:false,innerHTML:'',textContent:'',hidden:false,
    listeners:{},classList:{contains:x=>present.has(x),add:x=>present.add(x),toggle:(x,on)=>on?present.add(x):present.delete(x)},
    addEventListener(evt,fn){this.listeners[evt]=fn;},
    appendChild(child){this.children.push(child);},
    insertBefore(child){this.children.unshift(child);},
    setAttribute(){},click(){this.listeners.click?.({target:this});}};
}
const all=new Map(),ensure=id=>all.get(id)||((all.set(id,node(id))),all.get(id));
const oldRoot=node('main',['layout']);oldRoot.children=[node('controls',['controls']),node('timeline',['timeline-panel']),node('old-section',['panel'])];
const timeline=oldRoot.children[1];
const nav=['home','pilot','equipment','balance','fleet','pilothistory','losses','comparison','campaigns','sources','about'].map(tab=>{
  const el=node('nav-'+tab);el.dataset.v4Tab=tab;return el;
});
const theaters=['overall','west','east'].map(t=>{const el=node('theater-'+t);el.dataset.v73Theater=t;return el;});
const selectors={
  'main.layout':oldRoot,'.timeline-panel':timeline,'h1':node('h1'),'.kicker':node('kicker'),
  '.lead':node('lead'),'footer':node('footer')
};
const document={
  body:node('body'),
  getElementById:ensure,
  createElement:()=>node(),
  querySelector:selector=>selectors[selector]||null,
  querySelectorAll:selector=>selector==='[data-v4-tab]'?nav:selector==='[data-v73-theater]'?theaters:[]
};
const ctx=vm.createContext({document,window:{},console,setTimeout(){},clearTimeout(){}});
for(const filename of ['model-v3-data.js','model-v4-data.js','atlas-v6-data.js','atlas-v7-data.js','atlas-v71-data.js','atlas-v72-data.js','atlas-v73-data.js','atlas-v74-data.js'])
  vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),ctx,{filename});
ctx.window.LuftLabQA={inspect:()=>({start:78,end:89})};
vm.runInContext(fs.readFileSync(path.join(root,'model-v4.js'),'utf8'),ctx,{filename:'model-v4.js'});
assert.equal(ctx.window.AirWarAtlasQA.view(),'home');
for(const [tab,text] of [
  ['home','Explore the air war from every side.'],
  ['balance','The European air war — air forces over time'],
  ['fleet','The fleet, aircraft by aircraft'],
  ['pilothistory','The pilots behind the aircraft'],
  ['losses','What was lost, where, and to whom?'],
  ['comparison','How airpower was supplied and employed'],
  ['campaigns','From the Condor Legion to VE Day'],
  ['sources','Audit the numbers'],
  ['about','Why this atlas exists'],
  ['pilot','The experienced core']
]){
  nav.find(n=>n.dataset.v4Tab===tab).click();
  assert.equal(ctx.window.AirWarAtlasQA.view(),tab);
  if(tab!=='pilot')assert.ok(ensure('v4-body').innerHTML.includes(text),tab+' rendered');
}
nav.find(n=>n.dataset.v4Tab==='fleet').click();
assert.ok(ensure('v4-body').innerHTML.includes('Official USAAF ETO total'));
assert.ok(ensure('v4-body').innerHTML.includes('lower-confidence estimates'));
nav.find(n=>n.dataset.v4Tab==='losses').click();
assert.ok(ensure('v4-body').innerHTML.includes('Personnel attrition'));
assert.ok(ensure('v4-body').innerHTML.includes('5,602'));
assert.ok(ensure('v4-body').innerHTML.includes('4,758'));
assert.ok(ensure('v4-body').innerHTML.includes('v5-claims-monthly'));
assert.ok(ensure('v4-body').innerHTML.includes('every month, 1942–45'));
assert.ok(ensure('v4-body').innerHTML.includes('v5-us-combat-loss-cause'));
assert.ok(ensure('v4-body').innerHTML.includes('3,765'));
ensure('v5-loss-class').listeners.change({target:{value:'Heavy bomber'}});
assert.ok(ensure('v4-body').innerHTML.includes('3,497'));
nav.find(n=>n.dataset.v4Tab==='pilothistory').click();
assert.ok(ensure('v4-body').innerHTML.includes('15.7%'));
assert.ok(!ensure('v4-body').innerHTML.includes('4,429'));
nav.find(n=>n.dataset.v4Tab==='comparison').click();
assert.ok(ensure('v4-body').innerHTML.includes('not by model'));
assert.ok(ensure('v4-body').innerHTML.includes('v5-us-sorties-role'));
assert.ok(ensure('v4-body').innerHTML.includes('5,741'));
ensure('v5-ops-theater').listeners.change({target:{value:'MTO'}});
assert.ok(ensure('v4-body').innerHTML.includes('16,344'));
assert.ok(ensure('v4-body').innerHTML.includes('6,232'));
assert.ok(!ensure('v4-body').innerHTML.includes('DEBATE CHECK'));
nav.find(n=>n.dataset.v4Tab==='fleet').click();
assert.ok(ensure('v4-body').innerHTML.includes('German Quartermaster returns'));
assert.ok(ensure('v4-body').innerHTML.includes('serviceable'));
nav.find(n=>n.dataset.v4Tab==='losses').click();
assert.ok(ensure('v4-body').innerHTML.includes('Eighth Fighter Command'));
assert.ok(ensure('v4-body').innerHTML.includes('890'));
nav.find(n=>n.dataset.v4Tab==='sources').click();
assert.ok(ensure('v4-body').innerHTML.includes('Wikipedia bibliography cross-check'));
assert.ok(ensure('v4-body').innerHTML.includes('Chapter 22'));
assert.ok(ensure('v4-body').innerHTML.includes('RAF AHB VII/107'));
assert.ok(selectors.footer.textContent.includes('v7.4'));
assert.ok(ctx.window.AirWarAtlasQA.version==='7.4');
assert.equal(ctx.window.AirWarAtlasQA.verifiedOriginalMonths(),30);
nav.find(n=>n.dataset.v4Tab==='pilothistory').click();
assert.ok(ensure('v4-body').innerHTML.includes('489'));
assert.ok(ensure('v4-body').innerHTML.includes('396'));
assert.ok(ensure('v4-body').innerHTML.includes('v7-coverage-track'));
nav.find(n=>n.dataset.v4Tab==='losses').click();
assert.ok(ensure('v4-body').innerHTML.includes('Captured German aircraft-loss register'));
assert.ok(ensure('v4-body').innerHTML.includes('v72-matrix'));
assert.ok(ensure('v4-body').innerHTML.includes('VII/149'));
nav.find(n=>n.dataset.v4Tab==='sources').click();
assert.ok(ensure('v4-body').innerHTML.includes('Twenty original German aircraft-loss returns'));
theaters.find(n=>n.dataset.v73Theater==='east').click();
assert.equal(ctx.window.AirWarAtlasQA.config().theater,'east');
nav.find(n=>n.dataset.v4Tab==='balance').click();
assert.ok(ensure('v4-body').innerHTML.includes('Luftwaffe and Soviet VVS'));
assert.ok(ensure('v4-body').innerHTML.includes('vvs1945jan')||ensure('v4-body').innerHTML.includes('Soviet VVS'));
nav.find(n=>n.dataset.v4Tab==='fleet').click();
assert.ok(ensure('v73-feature-banner').innerHTML.includes('v73-eastern-lens'));
assert.ok(ensure('v73-extra').innerHTML.includes('Soviet Union · VVS'));
nav.find(n=>n.dataset.v4Tab==='losses').click();
assert.ok(ensure('v73-feature-banner').innerHTML.includes('German losses · Eastern Front'));
assert.ok(ensure('v4-body').innerHTML.includes('Reich / Western German original returns · not Eastern Front'));
nav.find(n=>n.dataset.v4Tab==='campaigns').click();
assert.ok(ensure('v4-body').innerHTML.includes('Kursk / Operation Citadel'));
assert.ok(!ensure('v4-body').innerHTML.includes('Big Week / Operation Argument'));
nav.find(n=>n.dataset.v4Tab==='about').click();
assert.equal(document.body.classList.contains('v73-static'),true,'About has no date picker');
console.log('PASS: all ten navigation paths, RAF German original returns, RAF/USAAF claims, historical archive and new source browser');
