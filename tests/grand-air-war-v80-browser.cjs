#!/usr/bin/env node
"use strict";
/* Browser QA, deliberately separate from dependency-free controller regression.
   Install playwright + Chromium before executing. Browser screenshots are CI artifacts only. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),http=require("node:http");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const server=http.createServer((request,response)=>{
 const pathname=decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname);
 const file=path.resolve(root,"."+(pathname.endsWith("/")?pathname+"index.html":pathname));
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
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"],...(process.env.ATLAS_CHROMIUM_PATH?{executablePath:process.env.ATLAS_CHROMIUM_PATH}:{})});
 try{
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1});
   const routePage=await browser.newPage({viewport,deviceScaleFactor:1});
   const rootUrl=base.slice(0,-"grand-air-war-v80.html".length);
   await routePage.goto(rootUrl,{waitUntil:"domcontentloaded",timeout:45000});
   await routePage.waitForURL(/grand-air-war-v80\.html/,{timeout:15000});
   assert.match(await routePage.title(),/Grand Air War Atlas/,"public root must open the current campaign explorer");
   await routePage.goto(rootUrl+"?legacy=1",{waitUntil:"domcontentloaded",timeout:45000});
   assert.ok(!routePage.url().includes("grand-air-war-v80.html"),"legacy pilot/aircraft route must remain accessible");
   await routePage.close();

   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base,{waitUntil:"domcontentloaded",timeout:45000});
   await page.waitForFunction(()=>!!window.GrandAirWarV77,{timeout:30000});
   await page.locator("#dossier-title").waitFor();
   assert.equal(await page.locator("#dossier-title").innerText(),"Normandy: Operation Overlord");
   assert.equal(await page.locator("#research-library").evaluate(e=>e.open),false,"unrelated source library should start closed");
   await page.locator("#campaign-dossier").evaluate(el=>{el.scrollTop=350;});
   await page.locator("#campaign-search").fill("Poland");
   assert.equal(await page.locator("#dossier-title").innerText(),"Invasion of Poland");
   assert.equal(await page.locator("#campaign-dossier").evaluate(el=>el.scrollTop),0,"new campaign kept previous dossier scroll and hid the facts");
   assert.match(await page.locator("#dossier-facts").innerText(),/300/);
   assert.match(await page.locator("#dossier-facts").innerText(),/1,300/);
   const separated=await page.locator("#dossier-facts .fact").evaluateAll(nodes=>nodes.every(node=>node.querySelector("small").getBoundingClientRect().bottom<=node.querySelector("a").getBoundingClientRect().top+1));
   assert.ok(separated,"claim source links overlap their scope notes");
   const dossier=await page.locator(".dossier").boundingBox(),firstFact=await page.locator("#dossier-facts .fact").first().boundingBox();
   assert.ok(firstFact.y-dossier.y<230,"source-backed facts are buried below the initial campaign narrative");
   assert.equal(await page.locator("#chapter-list .chapter-card").count(),3,"Poland needs three major operational phases");
   const phaseCardsOverlap=await page.locator("#chapter-list .chapter-card").evaluateAll(cards=>cards.some((card,i)=>cards.some((other,j)=>{
    if(i>=j)return false;const a=card.getBoundingClientRect(),b=other.getBoundingClientRect();
    return Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
   })));
   assert.equal(phaseCardsOverlap,false,"phase buttons overlap in actual viewport");
   assert.match(await page.locator("#chapter-detail").innerText(),/What aircraft actually did/i);
   assert.equal(await page.locator("#moment-detail").isVisible(),false,"campaign selection must not automatically display an arbitrary Wednesday event");
   assert.match(await page.locator("#moment-list").innerText(),/24th Reconnaissance|PZL\.23/);
   assert.match(await page.locator("#dossier-uncertainty").innerText(),/Source disagreement/);
   await page.locator("#moment-list").evaluate(el=>{el.scrollTop=999;});
   await page.locator('#chapter-list [data-chapter="interior"]').click();
   assert.equal(await page.locator("#moment-list").evaluate(el=>el.scrollTop),0,"switching phases kept stale event scroll position");
   assert.match(await page.locator("#chapter-detail").innerText(),/Kielce/);
   assert.match(await page.locator("#moment-list").innerText(),/9 September|Heinkel He 111/);
   assert.doesNotMatch(await page.locator("#moment-list").innerText(),/Orawka/);
   await page.locator('#moment-list [data-date="1939-09-09"]').click();
   assert.match(await page.locator("#moment-detail").innerText(),/Tadeusz Arabski/);
   await page.locator('#chapter-list [data-chapter="collapse"]').click();
   assert.match(await page.locator("#moment-list").innerText(),/1939-10-06/);
   assert.equal(await page.locator("#moment-detail").isVisible(),false,"phase switch must dismiss the prior event");
   await page.locator('#chapter-list [data-chapter="border"]').click();
   await page.locator('#moment-list [data-date="1939-09-03"]').click();
   assert.match(await page.locator("#moment-detail").innerText(),/24th Reconnaissance Squadron/);
   assert.equal(await page.locator('#moment-detail a[href*="muzeumlotnictwa.pl"]').count(),1);
   await page.locator("#campaigns").screenshot({path:path.join(root,"v80-qa-campaign-guide-"+viewport.width+".png")});
   // Walk all 20 campaigns through the real controller and verify source-backed
   // chapters, with intentionally unphased single-day Dieppe/Bodenplatte.
   const overview=await page.evaluate(()=>{
    const app=window.GrandAirWarV77;
    const failures=[];
    for(const c of app.campaigns){
     app.choose(c.id,false);
     const detail=document.getElementById("chapter-detail").textContent;
     const list=document.getElementById("chapter-list");
     const count=list.querySelectorAll(".chapter-card").length;
     if(!detail||count!==(c.chapters?.length||0)||document.getElementById("moment-detail").innerHTML||document.getElementById("chapter-detail").innerHTML.includes("undefined"))failures.push(c.id);
    }
    return {failures,reviewed:app.campaigns.length};
   });
   assert.deepEqual(overview.failures,[],"campaign guide incomplete or broken for: "+overview.failures.join(", "));
   assert.equal(overview.reviewed,20);
   await page.locator("#campaign-search").fill("");
   for(const [term,id] of [["Cobra","normandy"],["Peewit","britain"],["HMS Eagle","malta"],["Black Thursday","schweinfurt"],["Pitomnik","stalingrad"],["Prokhorovka","kursk"],["Cassino","italy"],["Vitebsk","bagration"],["Seelow","berlin"]]){
    await page.locator("#campaign-search").fill(term);
    assert.equal(await page.locator("#campaign-list [data-campaign]").count(),1,term+" should resolve to one campaign");
    assert.equal(await page.locator("#campaign-list [data-campaign]").first().getAttribute("data-campaign"),id,term+" wrong campaign");
   }
   await page.locator("#campaign-search").fill("RAF");
   assert.equal(await page.locator('#campaign-list [data-campaign="barbarossa"]').count(),0,"RAF search matches incidental 'aircraft' substring");
   await page.locator("#campaign-search").fill("");
   // Test new research chapters as a visitor, including the documented Malta
   // disagreement and Market Garden's failed-at-destination supply drops.
   for(const [id,count,phase,eventDate,expected] of [
    ["norway",3,"withdrawal","1940-06-08","Glorious"],
    ["malta",4,"crisis","1942-03-07","HMS Eagle"],
    ["barbarossa",3,"moscow","1941-12-05","Moscow"],
    ["france1940",3,"dunkirk","1940-05-26","2,739"],
    ["britain",5,"channel","1940-08-08","Peewit"],
    ["sicily",3,"inland","1943-07-22","Palermo"],
    ["stalingrad",3,"collapse","1943-01-16","Pitomnik"],
    ["reichdefense",3,"escort","1944-04-30","840"],
    ["kursk",3,"counterblow","1943-07-12","Prokhorovka"],
    ["italy",3,"cassino","1944-03-15","435"],
    ["bagration",3,"breakthrough","1944-07-03","Minsk"],
    ["berlin",3,"encirclement","1945-04-25","Berlin"],
    ["schweinfurt",2,"october","1943-10-14","291"],
    ["bigweek",2,"sustained","1944-02-25","4,000"],
    ["normandy",9,"falaise","1944-08-19","Falaise"],
    ["marketgarden",3,"resupply","1944-09-20","152"]
   ]){
    await page.evaluate(cid=>window.GrandAirWarV77.choose(cid,false),id);
    assert.equal(await page.locator("#chapter-list .chapter-card").count(),count,id+" chapter count");
    await page.locator('#chapter-list [data-chapter="'+phase+'"]').click();
    assert.ok((await page.locator("#chapter-detail").innerText()).length>500,id+" phase is a thin placeholder");
    await page.locator('#moment-list [data-date="'+eventDate+'"]').click();
    assert.match(await page.locator("#moment-detail").innerText(),new RegExp(expected),id+" detailed evidence inaccessible");
    assert.ok(await page.locator("#moment-detail a[href^='https://']").count()>0,id+" lacks clickable original research source");
    assert.equal(await page.locator("#moment-detail").isVisible(),true);
   }
   await page.evaluate(()=>window.GrandAirWarV77.choose("normandy",false));
   assert.equal(await page.locator("#campaign-story").isVisible(),true,"Normandy historical introduction hidden");
   assert.ok((await page.locator("#campaign-story").innerText()).length>900,"Normandy introduction is too thin");
   await page.locator('#chapter-list [data-chapter="cobra"]').click();
   assert.ok((await page.locator("#chapter-detail").innerText()).length>1700,"Cobra chapter lacks sustained narrative");
   await page.waitForFunction(()=>document.querySelectorAll(".story-map-point").length>=2,null,{timeout:15000});
   assert.ok(await page.locator(".story-map-point").count()>=2,"selected chapter needs interactive geographic episode markers");
   await page.locator('#moment-list [data-date="1944-07-25"]').click();
   assert.match(await page.locator("#moment-detail").innerText(),/German perspective|Air operations and their limits/i);
   assert.ok(await page.locator("#moment-detail a[href^='https://']").count()>=2,"Normandy event lacks multiple source trails");
   // Let Leaflet finish the chapter-to-episode flight before recording the map.
   // Earlier screenshots caught a partially animated pan and did not represent
   // the actual geographic story view that the reader sees after the move.
   await page.waitForTimeout(900);
   await page.locator("#campaign-story").screenshot({path:path.join(root,"v80-qa-normandy-story-"+viewport.width+".png")});
   await page.locator("#chapter-detail").screenshot({path:path.join(root,"v80-qa-normandy-chapter-"+viewport.width+".png")});
   await page.locator(".map-panel").screenshot({path:path.join(root,"v80-qa-normandy-map-"+viewport.width+".png")});
   for(const [id,figure] of [["norway","329"],["barbarossa","800"],["sicily","25,070"],["stalingrad","117.6"],["reichdefense","840"],["kursk","3,000"],["italy","435"],["bagration","2,319"],["berlin","4,398"]]){
    await page.evaluate(cid=>window.GrandAirWarV77.choose(cid,false),id);
    assert.match(await page.locator("#dossier-facts").innerText(),new RegExp(figure.replace(".","\\.")),id+" fact missing in actual UI");
    const sources=await page.locator("#dossier-facts .fact a[href^='https://']").count();
    assert.ok(sources>0,id+" numerical provenance link is not actionable");
   }

   // Full real-browser review: bilateral serviceability/loss panels and Sicily daily national returns.
   for(const [id,required] of [["britain",["990","805","> 900"]],["normandy",["11,590","319","826"]],["barbarossa",["2,000","5,700","4,614"]],["sicily",["283","198","59","32"]]]){
    await page.evaluate(cid=>window.GrandAirWarV77.choose(cid,false),id);
    const block=page.locator("#dossier-facts .campaign-comparisons");
    assert.equal(await block.count(),1,id+" has no cross-population review section");
    const rendered=await block.innerText();
    for(const token of required)assert.ok(rendered.includes(token),id+" missing comparison number: "+token);
    assert.ok(await block.locator('a[href^="https://"]').count()>0,id+" comparison has no direct reporting source");
    const layout=await block.evaluate(el=>({scroll:el.scrollWidth,client:el.clientWidth}));
    assert.ok(layout.scroll<=layout.client+2,id+" comparison causes horizontal overflow at "+viewport.width);
   }
   await page.evaluate(()=>window.GrandAirWarV77.choose("sicily",false));
   const rows=page.locator("#dossier-facts .operational-series tbody tr");
   assert.equal(await rows.count(),5,"Sicily Axis operating aircraft by nationality must show five actual days");
   assert.ok((await rows.first().innerText()).includes("481")&&(await rows.last().innerText()).includes("161"),"Sicily daily German+Italian totals are not derived correctly");
   const table=page.locator("#dossier-facts .operational-table-scroll");
   assert.ok(await table.evaluate(el=>el.scrollWidth>=el.clientWidth),"Sicily report table must support smaller viewports");

   for(const [id,phase,eventDate,figure] of [["norway","landings","1940-04-25","Thirteen"],["norway","narvik","1940-05-28","42"],["norway","withdrawal","1940-06-02","75"],["bagration","breakthrough","1944-06-24","2,319"],["bagration","breakthrough","1944-06-26","2,950"],["berlin","oder","1945-04-19","4,398"]]){
    await page.evaluate(cid=>window.GrandAirWarV77.choose(cid,false),id);
    await page.locator('#chapter-list [data-chapter="'+phase+'"]').click();
    await page.locator('#moment-list [data-date="'+eventDate+'"]').click();
    assert.match(await page.locator('#moment-detail').innerText(),new RegExp(figure,"i"),id+" additional historical event inaccessible");
    assert.ok(await page.locator('#moment-detail a[href^="https://"]').count()>0,id+" event lacks source link");
   }
   await page.evaluate(()=>window.GrandAirWarV77.choose("italy",false));
   await page.locator('#chapter-list [data-chapter="cassino"]').click();
   await page.locator(".campaign-guide").screenshot({path:path.join(root,"v80-qa-italy-guide-"+viewport.width+".png")});
   for(const [id,expectText] of [["dieppe","2,614"],["bodenplatte","Eindhoven"]]){
    await page.evaluate(cid=>window.GrandAirWarV77.choose(cid,false),id);
    assert.equal(await page.locator("#chapter-list .chapter-card").count(),0,id+" is a single-day action, not several invented dates");
    await page.locator("#moment-list [data-moment]").first().click();
    assert.match(await page.locator("#moment-detail").innerText(),new RegExp(expectText),id+" needs actionable single-day context");
   }
   await page.evaluate(()=>window.GrandAirWarV77.choose("malta",false));
   await page.locator('#chapter-list [data-chapter="crisis"]').click();
   await page.locator(".campaign-guide").screenshot({path:path.join(root,"v80-qa-malta-guide-"+viewport.width+".png")});
   await page.evaluate(()=>window.GrandAirWarV77.choose("poland",false));
   await page.locator('#chapter-list [data-chapter="interior"]').click();
   await page.evaluate(()=>window.GrandAirWarV77.setMonth("1939-10"));
   assert.equal(await page.locator('#chapter-list [data-chapter="interior"]').getAttribute("aria-pressed"),"true","month slider must not reset the selected chapter");
   await page.locator('#chapter-list [data-chapter="border"]').click();
   await page.locator("#campaign-search").fill("");
   await page.waitForFunction(()=>["loaded","unavailable"].includes(document.getElementById("campaign-map").dataset.landStatus));
   assert.equal(await page.locator("#campaign-map").getAttribute("data-land-status"),"loaded","historical coastline failed to load in connected browser QA");
   await page.locator(".map-panel").screenshot({path:path.join(root,"v80-qa-map-initial-"+viewport.width+".png")});
   await page.locator("#fit-map").click();
   await page.waitForTimeout(700); // fitBounds animation must complete before inspecting SVG paths
   await page.locator(".map-panel").screenshot({path:path.join(root,"v80-qa-map-fitted-"+viewport.width+".png")});
   const painted=await page.evaluate(()=>{
    const bounds=document.getElementById("campaign-map").getBoundingClientRect();
    return [...document.querySelectorAll('.leaflet-overlay-pane svg path[fill="#aaa991"]')]
     .filter(path=>{const r=path.getBoundingClientRect();return r.width>=4&&r.height>=4&&r.right>bounds.left&&r.left<bounds.right&&r.bottom>bounds.top&&r.top<bounds.bottom;}).length;
   });
   assert.ok(painted>=6,"fewer than six geographically distinct visible land polygons at "+viewport.width+"px; coastlines may be blank: "+painted);
   assert.ok(await page.locator(".leaflet-marker-icon").count()>0,"campaign pins vanished");
   await page.locator(".leaflet-control-zoom-in").click();
   await page.locator(".leaflet-control-zoom-out").click();
   assert.ok(await page.locator(".leaflet-marker-icon").count()>0,"physical zoom controls removed campaign markers");
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

   // Audited comparisons must actually render for all 20 campaigns and 119 dated episodes.
   const allCoverage=await page.evaluate(()=>{
    const app=window.GrandAirWarV77, errors=[],states={};let count=0;
    for(const campaign of app.campaigns){
      app.choose(campaign.id,false);
      if(!document.querySelector('#dossier-facts [data-bilateral-campaign="'+campaign.id+'"]'))errors.push(campaign.id+" missing campaign-level coverage");
      for(const e of campaign.moments){
        app.chooseMoment(campaign.id,e.date,e.lat,e.lng,e.title);
        const block=document.querySelector("#moment-detail .event-bilateral");
        const status=block?.getAttribute("data-bilateral-status");
        if(!status)errors.push(campaign.id+" "+e.date+" missing event-level source audit");
        states[status]=(states[status]||0)+1;count++;
      }
    }
    return {campaigns:app.campaigns.length,events:count,errors,states};
   });
   assert.equal(allCoverage.campaigns,20);
   assert.equal(allCoverage.events,119);
   assert.deepEqual(allCoverage.errors,[],"campaign/event bilateral audit coverage incomplete");
   assert.ok(allCoverage.states["no-matched-data"]>0,"the Atlas must label unsourced dates transparently");
   for(const [id,expected] of [["britain-hardest","paired-own-losses"],["dieppe","paired-own-losses"],["schweinfurt","paired-own-losses"],["bodenplatte","paired-own-losses"],["britain","claim-versus-record"]]){
    const target=id==="britain-hardest"?"1940-08-18":id==="schweinfurt"?"1943-10-14":id==="dieppe"?"1942-08-19":id==="bodenplatte"?"1945-01-01":"1940-09-15";
    await page.evaluate(({id,target})=>{
      const app=window.GrandAirWarV77,cid=id==="britain-hardest"?"britain":id,e=app.campaigns.find(x=>x.id===cid).moments.find(x=>x.date===target);
      app.chooseMoment(cid,e.date,e.lat,e.lng,e.title);
    },{id,target});
    assert.equal(await page.locator("#moment-detail .event-bilateral").getAttribute("data-bilateral-status"),expected,id+" incorrect evidence type");
    assert.ok(await page.locator("#moment-detail .event-bilateral a[href^='https://']").count()>0,id+" has no exact-day source links");
   }
   await page.evaluate(()=>window.GrandAirWarV77.choose("britain",false));
   assert.equal(await page.locator("#dossier-facts .opponent-returns tbody").count(),2,"wartime claims vs German archival losses must have phases and day rows");
   assert.equal(await page.locator("#dossier-facts .opponent-returns tbody").first().locator("tr").count(),5);
   assert.equal(await page.locator("#dossier-facts .opponent-returns tbody").last().locator("tr").count(),7);
   assert.match(await page.locator("#dossier-facts .opponent-returns").innerText(),/1,760.*1,733/s);
   await page.locator(".campaign-guide").screenshot({path:path.join(root,"v80-qa-britain-bilateral-"+viewport.width+".png")});

   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=2,"horizontal viewport overflow of "+overflow+"px at "+viewport.width);
   assert.deepEqual(errors,[],"JavaScript page errors: "+errors.join("; "));
   await page.screenshot({path:path.join(root,"v80-qa-"+viewport.width+".png"),fullPage:true});
   await page.close();
  }
 }finally{await browser.close();}
};
check().then(()=>{console.log("PASS v8 Chromium: desktop 1440px, mobile 390px, Poland fact/event/source drilldown, filters, independent labs, map, no overflow or JS exceptions");server.close();}).catch(e=>{console.error(e);server.close();process.exitCode=1;});
