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
const nav=['pilot','equipment','balance','fleet','losses','comparison','sources'].map(tab=>{
  const el=node('nav-'+tab);el.dataset.v4Tab=tab;return el;
});
const selectors={
  'main.layout':oldRoot,'.timeline-panel':timeline,'h1':node('h1'),'.kicker':node('kicker'),
  '.lead':node('lead'),'footer':node('footer')
};
const document={
  body:node('body'),
  getElementById:ensure,
  createElement:()=>node(),
  querySelector:selector=>selectors[selector]||null,
  querySelectorAll:selector=>selector==='[data-v4-tab]'?nav:[]
};
const ctx=vm.createContext({document,window:{},console,setTimeout(){},clearTimeout(){}});
for(const filename of ['model-v3-data.js','model-v4-data.js'])
  vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),ctx,{filename});
ctx.window.LuftLabQA={inspect:()=>({start:78,end:89})};
vm.runInContext(fs.readFileSync(path.join(root,'model-v4.js'),'utf8'),ctx,{filename:'model-v4.js'});
assert.equal(ctx.window.AirWarAtlasQA.view(),'balance');
for(const [tab,text] of [
  ['balance','What was the Luftwaffe facing?'],
  ['fleet','The fleet, aircraft by aircraft'],
  ['losses','What was lost, where, and to whom?'],
  ['comparison','Thunderbolt vs Mustang'],
  ['sources','Audit the numbers'],
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
console.log('PASS: all seven navigation paths and new historical panels render in a DOM-compatible harness');
