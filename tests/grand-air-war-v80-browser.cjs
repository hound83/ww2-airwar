#!/usr/bin/env node
"use strict";
/* Browser QA, deliberately separate from dependency-free controller regression.
   Install playwright + Chromium before executing. Browser screenshots are CI artifacts only. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),http=require("node:http");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const server=http.createServer((request,response)=>{
 const pathname=decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname);
 const file=path.resolve(root,"."+pathname);
 if(!file.startsWith(root+path.sep)){response.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{
  if(err){response.writeHead(404).end();return;}
  const mime=file.endsWith(".html")?"text/html":file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":"application/octet-stream";
  response.writeHead(200,{"content-type":mime});response.end(data);
 });
});
const check=async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const base="http://127.0.0.1:"+server.address().port+"/grand-air-war-v80.html";
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base,{waitUntil:"domcontentloaded",timeout:45000});
   await page.waitForFunction(()=>!!window.GrandAirWarV77,{timeout:30000});
   await page.locator("#dossier-title").waitFor();
   assert.equal(await page.locator("#dossier-title").innerText(),"Normandy: Operation Overlord");
   assert.equal(await page.locator("#research-library").evaluate(e=>e.open),false,"unrelated source library should start closed");
   await page.locator("#campaign-search").fill("Poland");
   assert.equal(await page.locator("#dossier-title").innerText(),"Invasion of Poland");
   assert.match(await page.locator("#dossier-facts").innerText(),/300/);
   assert.match(await page.locator("#dossier-facts").innerText(),/1,300/);
   assert.match(await page.locator("#moment-list").innerText(),/24th Reconnaissance|PZL\.23/);
   assert.match(await page.locator("#dossier-uncertainty").innerText(),/Source disagreement/);
   await page.locator('#moment-list [data-date="1939-09-03"]').click();
   assert.match(await page.locator("#moment-detail").innerText(),/24th Reconnaissance Squadron/);
   assert.equal(await page.locator('#moment-detail a[href*="muzeumlotnictwa.pl"]').count(),1);
   await page.locator("#campaign-search").fill("");
   await page.locator("#fit-map").click();
   await page.waitForFunction(()=>["loaded","unavailable"].includes(document.getElementById("campaign-map").dataset.landStatus));
   assert.equal(await page.locator("#campaign-map").getAttribute("data-land-status"),"loaded","historical coastline failed to load in connected browser QA");
   assert.ok(await page.locator(".leaflet-marker-icon").count()>0,"campaign pins vanished");
   await page.locator("#theater-select").selectOption("east");
   await page.locator("#campaign-search").fill("Normandy");
   assert.match(await page.locator("#dossier-title").innerText(),/Adjust your search/);
   assert.match(await page.locator("#coverage-label").innerText(),/^0 shown of 0/);
   await page.locator("#campaign-search").fill("");
   await page.locator("#theater-select").selectOption("all");
   await page.locator("#date-slider").evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event("input",{bubbles:true}));},(1939*12+9-1)-(1936*12+6));
   await page.locator("#all-campaigns").uncheck();
   assert.match(await page.locator("#coverage-label").innerText(),/^1 shown/);
   await page.locator("#all-campaigns").check();
   assert.match(await page.locator("#coverage-label").innerText(),/^20 shown/);
   await page.locator(".research-open").click();
   assert.equal(await page.locator("#research-library").evaluate(e=>e.open),true);
   await page.locator("#force-series").selectOption("vvs");
   assert.equal(await page.locator("#force-area-wrap").isVisible(),false,"irrelevant area filter still shown");
   assert.match(await page.locator("#force-detail").innerText(),/combat aircraft/);
   await page.locator("#force-series").selectOption("usaaf");
   assert.equal(await page.locator("#force-area-wrap").isVisible(),true);
   await page.locator("#loss-command").selectOption("Reich");
   await page.locator("#loss-outcome").selectOption("damaged");
   assert.match(await page.locator("#loss-detail").innerText(),/damaged/);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=2,"horizontal viewport overflow of "+overflow+"px at "+viewport.width);
   assert.deepEqual(errors,[],"JavaScript page errors: "+errors.join("; "));
   await page.screenshot({path:path.join(root,"v80-qa-"+viewport.width+".png"),fullPage:true});
   await page.close();
  }
 }finally{await browser.close();}
};
check().then(()=>{console.log("PASS v8 Chromium: desktop 1440px, mobile 390px, Poland fact/event/source drilldown, filters, independent labs, map, no overflow or JS exceptions");server.close();}).catch(e=>{console.error(e);server.close();process.exitCode=1;});
