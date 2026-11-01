#!/usr/bin/env node
"use strict";
/* Browser-independent interaction test for v7.7's real controller, no synthetic historical observations. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,".."),read=f=>fs.readFileSync(path.join(root,f),"utf8");
const elements=new Map();
const element=id=>{
 if(!elements.has(id)){
  const handlers={};
  elements.set(id,{id,innerHTML:"",textContent:"",value:"",checked:false,disabled:false,hidden:false,
   addEventListener(type,fn){handlers[type]=fn;},
   querySelectorAll(){return [];},
   dispatch(type,value){if(value!==undefined){this.value=value;}assert.ok(handlers[type],"missing handler "+id+"."+type);handlers[type]({target:this});},
   scrollIntoView(){}});
 }
 return elements.get(id);
};
const document={readyState:"complete",hidden:false,getElementById:element,addEventListener(){},createElement(){return element("dynamic");},body:{appendChild(){}}};
const window={};
const context=vm.createContext({window,document,console,setInterval,clearInterval});
for(const file of ["dist/model-v3-data.js","dist/atlas-v7-data.js","dist/atlas-v71-data.js","dist/atlas-v72-data.js","dist/atlas-v73-data.js","dist/atlas-v74-data.js","dist/grand-air-war-v77-groups.js","dist/grand-air-war-v77-campaigns.js","dist/grand-air-war-v77.js"]){
 vm.runInContext(read(file),context,{filename:file,timeout:5000});
}
const app=window.GrandAirWarV77;
assert.ok(app);
assert.equal(element("date-display").textContent,"June 1944");
assert.ok(element("dossier-title").textContent.includes("Normandy"));
assert.ok(element("dossier-facts").innerHTML.includes("14,674"));
assert.ok(element("loss-detail").innerHTML.includes("998"),"selected Jun 1944 western losses missing");
assert.ok(element("force-detail").innerHTML.includes("102"),"ETO June 1944 group source not loaded");
app.choose("britain");
assert.equal(element("date-display").textContent,"July 1940");
assert.equal(element("dossier-title").textContent,"Battle of Britain");
assert.ok(element("dossier-facts").innerHTML.includes("1,733"));
assert.ok(element("dossier-facts").innerHTML.includes("2,692"));
element("date-slider").dispatch("input","97"); // Aug 1944, computed zero index
assert.equal(element("date-display").textContent,"August 1944");
element("loss-command").dispatch("change","Reich");
assert.ok(element("loss-detail").innerHTML.includes("Reich"));
element("loss-outcome").dispatch("change","damaged");
assert.ok(element("loss-chart").innerHTML.includes("enemy action")||element("loss-chart").innerHTML.includes("Enemy action"));
element("force-series").dispatch("change","vvs");
assert.ok(element("force-detail").innerHTML.includes("combat aircraft"));
element("force-series").dispatch("change","production");
assert.ok(element("force-detail").innerHTML.includes("factory")||element("force-detail").innerHTML.includes("acceptances"));
element("force-series").dispatch("change","usaaf");
element("force-area").dispatch("change","MTO");
assert.ok(element("force-detail").innerHTML.includes("MTO"));
element("force-metric").dispatch("change","fighterGroups");
assert.ok(element("force-detail").innerHTML.includes("Fighter groups"));
element("theater-select").dispatch("change","east");
assert.ok(element("campaign-list").innerHTML.includes("Bagration"));
assert.ok(!element("campaign-list").innerHTML.includes("Big Week"),"theatre filter failed");
element("theater-select").dispatch("change","all");
element("campaign-search").dispatch("input","Malta");
assert.ok(element("campaign-list").innerHTML.includes("Malta"));
assert.ok(!element("campaign-list").innerHTML.includes("Bagration"));
console.log("PASS v7.7 interactions: dated campaign selection, cause-separated loss views, theater/group production/VVS charts and search.");
