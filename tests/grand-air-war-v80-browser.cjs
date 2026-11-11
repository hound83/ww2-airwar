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
 const base=process.env.ATLAS_BASE_URL||"http://127.0.0.1:"+server.address().port+"/grand-air-war-v80.html";
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"],...(process.env.ATLAS_CHROMIUM_PATH?{executablePath:process.env.ATLAS_CHROMIUM_PATH}:{})});
 try{
  await require("./grand-air-war-v80-layout-browser.cjs")(browser,base,root);
  for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
   const page=await browser.newPage({viewport,deviceScaleFactor:1,hasTouch:viewport.width<500,isMobile:viewport.width<500});
   const routePage=await browser.newPage({viewport,deviceScaleFactor:1});
   const rootUrl=base.slice(0,-"grand-air-war-v80.html".length);
   await routePage.goto(rootUrl,{waitUntil:"domcontentloaded",timeout:45000});
   await routePage.waitForURL(/grand-air-war-v80\.html/,{timeout:15000});
   assert.match(await routePage.title(),/Grand Air War Atlas/,"public root must open the current campaign explorer");
   await routePage.goto(rootUrl+"?legacy=1",{waitUntil:"domcontentloaded",timeout:45000});
   assert.ok(!routePage.url().includes("grand-air-war-v80.html"),"legacy pilot/aircraft route must remain accessible");
   await routePage.goto(base+'?loss-scope=normandy-campaign&loss-series=normandy-german#claim-loss-calculator',{waitUntil:'domcontentloaded',timeout:45000});
   assert.equal(await routePage.locator('#claim-loss-series').inputValue(),'normandy-german');
   assert.match(await routePage.locator('#claim-loss-result').innerText(),/312.*Allied aircraft lost.*314 German claims/s);
   await routePage.close();

   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base,{waitUntil:"domcontentloaded",timeout:45000});
   await page.waitForFunction(()=>!!window.GrandAirWarV77,{timeout:30000});
   await page.locator("#dossier-title").waitFor();
   assert.equal(await page.locator("#dossier-title").innerText(),"Normandy: Operation Overlord");
   const campaignScope=page.locator('#claim-loss-scope'),reportingSeries=page.locator('#claim-loss-series');
   const campaignResult=page.locator('#claim-loss-result'),campaignMethod=page.locator('#claim-loss-method');
   const recordedTable=campaignMethod.locator('[data-recorded-campaign-table]');
   const heldOutTable=campaignMethod.locator('[data-held-out-table]');
   assert.equal(await campaignScope.inputValue(),'britain-campaign');
   assert.equal(await reportingSeries.inputValue(),'britain-weeks');
   assert.equal(await page.locator('#claim-loss-count').isVisible(),false);
   assert.match(await campaignResult.innerText(),/1,733.*German aircraft destroyed.*2,698 British claims/s);
   assert.equal(await recordedTable.locator('tbody tr').count(),17);
   assert.match(await campaignMethod.locator('.claim-campaign-score').innerText(),/16\.5.*30\.0.*14 of 17/);
   await campaignMethod.getByText('Held-out estimates and ranges',{exact:true}).press('Enter');
   assert.equal(await heldOutTable.locator('tbody tr').count(),17);
   const septWeek=heldOutTable.locator('[data-held-out-period="1940-09-15"]');
   assert.match(await septWeek.innerText(),/120.*153.*131–175.*Missed/s);
   for(const table of [recordedTable,heldOutTable]){
    assert.ok(await table.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'campaign table exceeds viewport');
   }
   await page.locator('#claim-loss-calculator').screenshot({path:path.join(root,'v80-qa-campaign-losses-britain-'+viewport.width+'.png')});
   await reportingSeries.selectOption('britain-phases');
   assert.equal(await recordedTable.locator('tbody tr').count(),5);
   assert.match(await campaignResult.innerText(),/1,733.*2,692 RAF claims/s);
   assert.match(await recordedTable.locator('[data-campaign-period="1940-10-01"]').innerText(),/325.*260.*125\.0/s);
   await reportingSeries.selectOption('britain-german');
   assert.match(await campaignResult.innerText(),/915.*RAF fighters lost.*3,058 Luftwaffe claims/s);
   assert.equal(await recordedTable.locator('tbody tr').count(),7);
   assert.equal(await heldOutTable.count(),0);
   await page.locator('#dossier-link-detail [data-claim-scope="normandy-campaign"]').click();
   assert.equal(await campaignScope.inputValue(),'normandy-campaign');
   assert.equal(await reportingSeries.inputValue(),'normandy-allied');
   assert.match(await campaignResult.innerText(),/355.*German aircraft lost.*329 Allied claims/s);
   assert.equal(await recordedTable.locator('tbody tr').count(),18);
   assert.match(await campaignMethod.locator('.claim-campaign-score').innerText(),/9\.8.*14 of 18/);
   await reportingSeries.selectOption('normandy-german');
   assert.match(await campaignResult.innerText(),/312.*314 German claims/s);
   assert.match(await campaignMethod.locator('.claim-campaign-score').innerText(),/8\.4.*10\.4.*14 of 18/);
   await page.locator('#claim-loss-calculator').screenshot({path:path.join(root,'v80-qa-campaign-losses-normandy-'+viewport.width+'.png')});
   console.log('v9 '+viewport.width+'px: Britain campaign reporting periods, holdouts and Normandy direction checks verified');
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
   assert.equal(await page.locator(".war-cluster, .war-pin").count(),0,"European campaign clusters obscure the Normandy episode view");
   assert.match(await page.locator("#map-heading").innerText(),/Normandy.*chapter episodes mapped/,"Normandy map context is missing");
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
    return [...document.querySelectorAll('#campaign-map svg path[fill="#aaa991"]')]
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


   const evidenceOrder=scope=>page.locator(scope+' > [data-evidence-group]').evaluateAll(
    groups=>groups.map(group=>group.dataset.evidenceGroup)
   );
   await page.evaluate(()=>window.GrandAirWarV77.choose('bigweek',false));
   assert.deepEqual(await evidenceOrder('#dossier-facts'),['aircraft-losses','personnel-casualties','sorties']);
   await page.evaluate(()=>window.GrandAirWarV77.choose('dieppe',false));
   assert.deepEqual(await evidenceOrder('#dossier-facts'),['aircraft-losses','sorties','aircraft-damage']);
   const dieppeLosses=page.locator('#dossier-facts [data-evidence-group="aircraft-losses"] .fact');
   assert.deepEqual(await dieppeLosses.locator('b').allTextContents(),['48','106']);
   if(viewport.width>=1000){
    const positions=await dieppeLosses.evaluateAll(cards=>cards.map(card=>card.getBoundingClientRect().top));
    assert.ok(Math.abs(positions[0]-positions[1])<1,'Dieppe same-day loss figures should share a row on desktop');
   }

   // v8.6: operate every showcase and every dated snapshot on both viewports.
   await page.evaluate(()=>window.GrandAirWarV77.choose('normandy',false));
   assert.equal(await page.locator('#operation-choices [data-operation]').count(),5);
   for(const id of ['dday','goodwood','cobra','mortain','falaise']){
    if(viewport.width<500)await page.locator('[data-operation="'+id+'"]').tap();else await page.locator('[data-operation="'+id+'"]').click();
    assert.equal(await page.locator('#operation-dossier').isVisible(),true);
    assert.equal(await page.locator('#campaign-dossier').isVisible(),false);
    const figures='#operation-evidence .operation-evidence-figures';
    const order=await evidenceOrder(figures);
    assert.equal(order[0],'aircraft-losses',id+' should lead with the loss evidence or its gap');
    if(id==='dday'){
     assert.deepEqual(order,['aircraft-losses','sorties','other']);
     const loss=page.locator(figures+' [data-observation="allied-dday-aircraft-lost"]');
     assert.match(await loss.innerText(),/1944-06-06.*127.*Secondary historical summary/s);
     assert.equal(await loss.locator('a[href*="2014_Oct_Newsletter"]').count(),1);
     assert.equal(await page.locator(figures+' [data-evidence-group="sorties"] [data-observation]').count(),2);
     await page.locator(figures).screenshot({path:path.join(root,'v80-qa-dday-losses-'+viewport.width+'.png')});
    }
    if(id==='cobra'){
     assert.deepEqual(order,['aircraft-losses','estimated-losses','personnel-casualties','victory-claims','other']);
     const casualties=page.locator(figures+' [data-evidence-group="personnel-casualties"]');
     assert.deepEqual(await casualties.locator('[data-observation]').evaluateAll(cards=>cards.map(card=>card.dataset.observation)),['cobra-killed','cobra-wounded']);
     assert.match(await casualties.innerText(),/111.*490/s);
    }
    if(id==='mortain'){
     assert.deepEqual(order,['aircraft-losses','sorties','aircraft-damage']);
     assert.match(await page.locator(figures+' [data-evidence-group="aircraft-losses"]').innerText(),/5.*Typhoon attack report/s);
    }
    const count=await page.locator('[data-operation-step]').count();
    for(let i=0;i<count;i++){
     await page.locator('[data-operation-step="'+i+'"]').click();
     await page.waitForTimeout(500);
     const current=await page.evaluate(()=>window.AtlasNormandyOperations.current());
     assert.equal(current.operation,id);assert.equal(current.step,i);
     assert.match(await page.locator('#map-heading').innerText(),new RegExp(current.date));
     assert.ok(await page.locator('.operation-place').count()>1);
     const expectedPaths=await page.evaluate(()=>{const x=window.AtlasNormandyOperations;const c=x.current();return x.data.operations.find(o=>o.id===c.operation).snapshots[c.step].links.length;});
     assert.equal(await page.locator('.operation-ground-path').count(),expectedPaths);
     if(expectedPaths)assert.ok(await page.locator('.operation-ground-path').evaluateAll(nodes=>nodes.every(n=>Number(getComputedStyle(n.closest('.leaflet-pane')).zIndex)>=450)),'operation paths are behind physical land');
     assert.ok(await page.locator('#operation-evidence [data-observation]').count()>=3);
     const datedEstimate=page.locator('#operation-dossier [data-snapshot-estimate]');
     assert.equal(await datedEstimate.count(),id==='cobra'&&i===1?1:0);
     if(id==='cobra'&&i===1)assert.match(await datedEstimate.innerText(),/≈8.*12 US escort claims.*low confidence/s);
     assert.ok(await page.locator('#operation-evidence a[href^="https://"]').count()>=5);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=2,'operation creates page overflow');
    }
    if(viewport.width<500)await page.locator('.operation-place').first().tap();else await page.locator('.operation-place').first().click();
    assert.ok(await page.locator('#operation-map-detail a[href]').count()>0,'map place must reveal its historical source');
    await page.locator('.mainstage').screenshot({path:path.join(root,'v80-qa-v86-'+id+'-'+viewport.width+'.png')});
   }
   await page.locator('[data-operation="cobra"]').click();
   await page.locator('#operation-next').focus();await page.keyboard.press('Enter');
   assert.equal((await page.evaluate(()=>window.AtlasNormandyOperations.current())).step,1);
   await page.waitForTimeout(900); // Leaflet's JS pan must settle before the screenshot.
   await page.locator('.mainstage').screenshot({path:path.join(root,'v80-qa-v86-cobra-bombardment-'+viewport.width+'.png')});
   await page.locator('#operation-evidence').screenshot({path:path.join(root,'v80-qa-v86-evidence-'+viewport.width+'.png')});
   const downloadPromise=page.waitForEvent('download');
   await page.locator('#operation-export').click();
   const exported=await downloadPromise;assert.match(exported.suggestedFilename(),/cobra.*evidence/);
   const exportedPayload=JSON.parse(fs.readFileSync(await exported.path(),'utf8'));
   const exportedRecords=exportedPayload.observations;
   assert.equal(exportedPayload.estimates.length,1);
   const [estimate]=exportedPayload.estimates;
   assert.deepEqual([estimate.kind,estimate.date,estimate.claimCount,estimate.expected,estimate.alternative],['estimated','1944-07-25',12,8,9]);
   assert.equal(estimate.inputs.widerGermanLossReports,10);
   assert.equal(estimate.inputs.matchedClaims,34);
   assert.equal(estimate.inputs.matchedLosses,23);
   assert.equal(estimate.calibration.length,3);
   assert.equal(estimate.validation.predicted,2);
   assert.deepEqual(estimate.validationCases.map(row=>row.predicted),[2,16]);
   assert.deepEqual([estimate.leaveOneOut.low,estimate.leaveOneOut.high],[7,9]);
   assert.equal(estimate.campaignContext.days.length,18);
   assert.equal(estimate.campaignContext.totals.germanLosses,355);
   assert.ok(estimate.calibration.every(row=>row.sources.every(ref=>ref.url.startsWith('https://'))));
   assert.ok(estimate.sources.every(ref=>ref.url.startsWith('https://')&&ref.page));
   assert.ok(exportedRecords.some(fact=>fact.id===estimate.claimId&&fact.value===12));
   assert.ok(exportedRecords.some(fact=>fact.id==='cobra-8af-ground-claims'&&fact.value===2));
   assert.equal(exportedRecords.some(fact=>fact.id===estimate.id),false);
   await page.locator('#operation-next').click();
   const cobraLink=page.url();
   await page.locator('#operation-evidence [data-claim-scope="cobra"]').click();
   assert.equal(page.url(),cobraLink,'opening the calculator must preserve the selected operation link');
   assert.equal(await page.locator('#claim-loss-scope').inputValue(),'cobra');
   const claims=page.locator('#claim-loss-count'),result=page.locator('#claim-loss-result');
   assert.equal(await claims.inputValue(),'12');
   assert.match(await result.innerText(),/About 8.*low confidence/s);
   assert.equal(await result.evaluate(element=>element.classList.contains('claim-loss-estimated')),true);
   await page.locator('#claim-loss-method summary').click();
   const cobraMethod=page.locator('#claim-loss-method');
   assert.match(await cobraMethod.innerText(),/68 losses per 100 claims.*23 losses from 34 claims.*7–9.*both uncertain landings gives 9/s);
   assert.match(await cobraMethod.innerText(),/Clastres–La Fère.*16 predicted from 23 claims.*16–18 reconstructed losses/s);
   assert.match(await cobraMethod.innerText(),/329 Allied destruction claims.*355 total German losses.*314 German destruction claims.*312 total Allied losses/s);
   assert.equal(await cobraMethod.locator('tbody tr').count(),3);
   assert.equal(await cobraMethod.locator('a[href$="atlas-v891-normandy-claims-audit-2026-11-11.md"]').count(),1);
   assert.ok(await cobraMethod.locator('.claim-loss-engagements').evaluate(table=>table.scrollWidth<=table.clientWidth+1),'Cobra comparison overflows the viewport');
   await page.locator('#claim-loss-calculator').screenshot({path:path.join(root,'v80-qa-cobra-calculator-'+viewport.width+'.png')});
   await claims.fill('24');
   assert.match(await result.innerText(),/About 16.*Hypothetical input/s);
   await claims.fill('1.5');
   assert.match(await result.innerText(),/Enter a whole number/);
   assert.equal(await claims.getAttribute('aria-invalid'),'true');
   assert.equal(await page.locator('#claim-loss-method').isVisible(),false);
   await claims.fill('0');
   assert.match(await result.innerText(),/^About 0/);
   const scopeSelector=page.locator('#claim-loss-scope');
   await scopeSelector.selectOption('britain');
   assert.equal(await claims.inputValue(),'185');
   assert.match(await result.innerText(),/56–96.*selected recorded days/s);
   await scopeSelector.selectOption('cobra');
   assert.equal(await claims.inputValue(),'12');
   await page.locator('#claim-loss-method a[href^="#operation="]').click();
   assert.equal((await page.evaluate(()=>window.AtlasNormandyOperations.current())).step,1);
   assert.match(await page.locator('#operation-dossier [data-snapshot-estimate]').innerText(),/≈8/);
   assert.deepEqual(exportedRecords.slice(0,5).map(fact=>fact.id),[
    'cobra-8af-bombers-lost','cobra-8af-fighters-lost','cobra-8af-bombers-writeoffs','cobra-killed','cobra-wounded'
   ]);
   assert.ok(exportedRecords.every(fact=>fact.sourceUrl?.startsWith('https://')));
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.AtlasNormandyOperations?.current()?.operation==='cobra');
   assert.equal((await page.evaluate(()=>window.AtlasNormandyOperations.current())).step,1,'operation permalink lost selected snapshot');
   await page.locator('#operation-close').click();
   assert.equal(await page.locator('#campaign-dossier').isVisible(),true);
   await page.locator('[data-operation="mortain"]').click();
   await page.locator('#campaign-search').fill('Poland');
   assert.equal(await page.locator('#normandy-operations').isVisible(),false);
   assert.equal(await page.locator('#operation-evidence').isVisible(),false);
   await page.locator('#campaign-search').fill('');
   await page.evaluate(()=>window.GrandAirWarV77.choose('britain',false));
   assert.equal(await page.locator('#operation-choices [data-operation]').count(),4);
   await page.locator('#dossier-link-detail [data-claim-scope="britain-campaign"]').click();
   assert.equal(await campaignScope.inputValue(),'britain-campaign');
   for(const [id,date,loss] of [
    ['britain-15-aug','1940-08-15',76],['britain-18-aug','1940-08-18',71],
    ['britain-7-sep','1940-09-07',40],['britain-15-sep','1940-09-15',56]
   ]){
    const option=page.locator('[data-operation="'+id+'"]');
    if(viewport.width<500)await option.tap();else await option.click();
    assert.equal((await page.evaluate(()=>window.AtlasNormandyOperations.current())).date,date);
    assert.ok(await page.locator('#campaign-map .operation-place').count()>=2);
    const summary=page.locator('#operation-dossier [data-snapshot-date="'+date+'"]');
    assert.match(await summary.innerText(),new RegExp(loss+'.*German aircraft recorded destroyed','s'));
    assert.equal(await page.locator('#operation-prev').count(),0,'a single day has no previous snapshot');
    assert.ok(await page.locator('#operation-evidence [data-evidence-group="victory-claims"] [data-observation]').count()===1);
   }
   assert.match(await page.locator('#operation-evidence .claim-estimate-check').innerText(),/66–74.*56/s);
   const sharedUrl=page.url();
   await page.locator('.operation-evidence-jump').click();
   assert.equal(page.url(),sharedUrl,'opening evidence must preserve the selected operation link');
   await page.locator('#operation-evidence .event-review-claim').screenshot({path:path.join(root,'v80-qa-claim-review-'+viewport.width+'.png')});
   await page.locator('.mainstage').screenshot({path:path.join(root,'v80-qa-britain-raid-'+viewport.width+'.png')});
   await page.locator('#operation-evidence [data-claim-scope="britain"]').click();
   assert.equal(await page.locator('#claim-loss-scope').inputValue(),'britain');
   assert.equal(await claims.inputValue(),'185');
   assert.match(await page.locator('#claim-loss-method').innerText(),/39\.6 destroyed per 100 RAF claims.*56 destroyed.*66–96/s);
   const britainDetails=page.locator('#claim-loss-method details');
   if(!await britainDetails.evaluate(details=>details.open))await britainDetails.locator('summary').click();
   assert.match(await britainDetails.innerText(),/included 5 of 7 recorded totals/);
   assert.equal(await britainDetails.locator('tbody tr').count(),7);
   assert.ok(await britainDetails.locator('.claim-loss-table').evaluate(table=>table.scrollWidth<=table.clientWidth+1),'benchmark table columns must fit the supported viewport');
   assert.match(await britainDetails.locator('tbody tr').filter({hasText:'1940-09-15'}).innerText(),/185.*56.*30\.3.*66–96/s);
   await page.locator('#claim-loss-calculator').screenshot({path:path.join(root,'v80-qa-britain-calculator-'+viewport.width+'.png')});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>window.AtlasNormandyOperations?.current()?.operation==='britain-15-sep');
   await page.locator('#operation-close').click();
   await scopeSelector.selectOption('reverse');
   assert.equal(await claims.isVisible(),false);
   assert.match(await result.innerText(),/8 claimed · 3 lost.*Rambouillet/s);
   const reverseTable=page.locator('#claim-loss-method .claim-loss-engagements');
   assert.equal(await reverseTable.locator('tbody tr').count(),6);
   assert.match(await reverseTable.locator('[data-claim-case="normandy-june6"]').innerText(),/1944-06-06.*6.*5/s);
   assert.match(await reverseTable.locator('[data-claim-case="evreux-july18-reverse"]').innerText(),/12.*2 \+ 1 uncertain/s);
   assert.match(await reverseTable.locator('[data-claim-case="beny-june18-reverse"]').innerText(),/RCAF.*2.*2/s);
   assert.match(await reverseTable.locator('[data-claim-case="clastres-august25-reverse"]').innerText(),/14–16.*7/s);
   assert.ok(await reverseTable.evaluate(table=>table.scrollWidth<=table.clientWidth+1),'German claims table overflows the viewport');
   await page.locator('#claim-loss-calculator').screenshot({path:path.join(root,'v80-qa-german-claims-'+viewport.width+'.png')});
   await scopeSelector.selectOption('bobruisk');
   assert.equal(await claims.isVisible(),false);
   assert.match(await result.innerText(),/About 2.*two Bobruisk-based groups.*Scenario range 1\.2–2\.5/s);
   assert.match(await page.locator('#claim-loss-method').innerText(),/13 German aircraft shot down/);
   const bobruiskDetails=page.locator('#claim-loss-method details');
   if(!await bobruiskDetails.evaluate(details=>details.open))await bobruiskDetails.locator('summary').press('Enter');
   const bobruiskText=await bobruiskDetails.innerText();
   assert.match(bobruiskText,/8 Bf 109G-6.*4 Fw 190F\/G.*29 of 141/s);
   assert.match(bobruiskText,/opened with 72 aircraft, received 10 and closed with 57.*25 that left, 13.*12 enemy-action removals.*29 of 141/s);
   assert.equal(await bobruiskDetails.getByRole('link',{name:'I./SG 10 return mirror'}).getAttribute('href'),'https://asisbiz.com/Luftwaffe/bisg10.html');
   await page.locator('#claim-loss-calculator').screenshot({path:path.join(root,'v80-qa-bobruisk-calculator-'+viewport.width+'.png')});
   await page.locator('#claim-loss-method .claim-open-case').click();
   const eastern=page.locator('#moment-detail [data-event-estimate]');
   assert.match(await eastern.innerText(),/About 2.*enemy action.*low confidence.*June inventory gives a ceiling of 12/s);
   assert.equal(await page.locator('#moment-detail .event-bilateral').getAttribute('data-bilateral-status'),'partial');
   await eastern.locator('a').click();
   assert.equal(await scopeSelector.inputValue(),'bobruisk');
   await page.locator('#moment-list [data-moment="bagration"][data-date="1944-06-24"]').click();
   assert.equal(await eastern.count(),0,'26 June estimate appeared on another day');
   console.log('v8.9.1 '+viewport.width+'px: Cobra 8 from 12, campaign comparisons and the Bobruisk inventory ceiling verified');
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(overflow<=2,"horizontal viewport overflow of "+overflow+"px at "+viewport.width);
   assert.deepEqual(errors,[],"JavaScript page errors: "+errors.join("; "));
   await page.screenshot({path:path.join(root,"v80-qa-"+viewport.width+".png"),fullPage:true});
   await page.close();
  }
 }finally{await browser.close();}
};
check().then(()=>{console.log("PASS v8 Chromium: desktop 1440px, mobile 390px, Poland fact/event/source drilldown, filters, independent labs, map, no overflow or JS exceptions");server.close();}).catch(e=>{console.error(e);server.close();process.exitCode=1;});
