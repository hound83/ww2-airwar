/* Test pointer/tap/keyboard nearest-month inspection and event toggling. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function element(tag){
  const classes=new Set();
  const el={tag,innerHTML:'',textContent:'',style:{},hidden:false,children:[],listeners:{},
    parentElement:null,isConnected:true,dataset:{},
    classList:{add:x=>classes.add(x),contains:x=>classes.has(x)},
    setAttribute(k,v){this[k]=v;},
    addEventListener(ev,fn){this.listeners[ev]=fn;},
    getBoundingClientRect(){return {left:10,top:10,width:600,height:250};},
    appendChild(n){n.parentElement=this;n.isConnected=true;this.children.push(n);},
    remove(){this.isConnected=false;this.parentElement.children=this.parentElement.children.filter(c=>c!==this);},
    querySelectorAll(sel){return sel==='.atlas-event-marker'?this.children.filter(x=>x.class==='atlas-event-marker'):[];}
  };
  return el;
}
const parent=element('div');
const pilot=element('svg');pilot.viewBox={baseVal:{width:600}};
const historical=element('svg');historical.viewBox={baseVal:{width:980}};
parent.appendChild(pilot);parent.appendChild(historical);
const byId=new Map([['experience-chart',pilot],['v4-claims-test',historical]]);
const registry=new Map([
  ['experience-chart',{origin:'simulator',opts:{percent:true},rows:[
    {i:88,month:'Nov 1943',ex75:50,experienced75:100,cohort:200,ex200:10,experienced200:20},
    {i:89,month:'Dec 1943',ex75:62.5,experienced75:125,cohort:170,ex200:12,experienced200:24}],
    series:[{f:r=>r.ex75,color:'#9cae8b'},{f:r=>r.ex200,color:'#9fb3bd'}]}],
  ['v4-claims-test',{origin:'historical',opts:{percent:false},rows:[
    {i:88,label:'Nov 1943'}, {i:89,label:'Dec 1943'}],
    series:[{name:'Reported credits',value:r=>r.i===88?11:19,color:'#c89555',source:'digest167'}]}]
]);
const ctx=vm.createContext({document:{getElementById:id=>byId.get(id),createElement:element,createElementNS:(_,tag)=>element(tag)},
  window:{AirWarGraphRegistry:registry,LuftData:{label:i=>'Period '+i},
    LuftV4Data:{SOURCES:{digest167:{short:'USAAF Digest Table 167'}},milestones:[{i:89,title:'Event',detail:'Test marker'}]}},
  console});
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../dist/atlas-v5.js'),'utf8'),ctx);
const api=ctx.window.AirWarAtlasV5;
assert.equal(api.registrySize(),2);
assert.ok(pilot.listeners.pointermove);
pilot.listeners.pointermove({clientX:600,pointerType:'mouse'});
const tip=parent.children.find(x=>x.className==='atlas-tooltip');
assert.ok(tip&&!tip.hidden);
assert.ok(tip.innerHTML.includes('Dec 1943'));
assert.ok(tip.innerHTML.includes('125 pilots'));
assert.ok(tip.innerHTML.includes('Scenario calculation'));
pilot.listeners.keydown({key:'ArrowLeft',preventDefault(){}});
assert.ok(tip.innerHTML.includes('Nov 1943'));
pilot.listeners.click({clientX:600,pointerType:'touch'});
assert.ok(!tip.hidden);
assert.ok(pilot.children.some(x=>x.class==='atlas-event-marker'));
api.setMarkers(false);
assert.ok(!pilot.children.some(x=>x.class==='atlas-event-marker'));
api.setMarkers(true);
assert.ok(historical.children.some(x=>x.class==='atlas-event-marker'));
console.log('PASS: chart tooltip counts, source labels, touch, keyboard navigation, event marker toggle');
