"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs");
module.exports=async(browser,base)=>{
  for (const width of [1440,390]) {
    const page=await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    try {
      await page.goto(new URL("grand-air-war-v80.html?campaign=sicily#campaign-dossier",base).href);
      await page.locator("#dossier-roster-jump").waitFor();
      const dossierCoverage=await page.evaluate(()=>{
        const atlas=window.GrandAirWarV77;
        return atlas.campaigns.map(c=>{
          atlas.choose(c.id,false);
          const panel=document.querySelector("#dossier-deployments");
          return [!panel.hidden,panel.querySelectorAll("li").length,document.querySelector("#dossier-roster-jump").href.includes("campaign="+c.id)];
        });
      });
      assert.equal(dossierCoverage.length,20);
      assert.ok(dossierCoverage.every(([shown,n,link])=>shown && n>0 && link));
      await page.evaluate(()=>window.GrandAirWarV77.choose("sicily",false));
      await page.locator("#dossier-roster-jump").click();
      await page.locator("#unit-list tr a").first().waitFor();
      assert.equal(await page.locator("#unit-list tbody tr").count(),4);
      assert.match(await page.locator("#return-note").innerText(),/136.*55/);
      const size=()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1);
      assert.ok(await size(),"roster width "+width);
      await page.locator("#station").selectOption("sciacca");
      assert.ok(await page.locator("#unit-list tbody tr").count()>0);
      assert.ok((await page.locator("#station-map [aria-pressed=true]").count())>=1);
      let [file]=await Promise.all([page.waitForEvent("download"),page.locator("#export-view").click()]);
      const data=fs.readFileSync(await file.path(),"utf8").trimEnd();
      assert.equal(data.split("\n").length-1,await page.locator("#unit-list tbody tr").count());
      assert.match(data,/Sciacca/);
      await page.locator("#station").selectOption("");
      await page.locator("#populations a[href*='population=sicily-211&'],#populations a[href$='population=sicily-211']").first().click();
      assert.equal(await page.locator("#unit-list tbody tr").count(),23);
      await page.locator("#unit-search").fill("92 Squadron");
      await page.locator("#unit-list [data-unit-link]").first().focus();
      await page.keyboard.press("Enter");
      assert.match(await page.locator("#unit-detail").innerText(),/92 Squadron/);
      assert.ok(await page.locator('#unit-detail a[href*="case=messina"]').count());
      await page.reload();await page.locator("#unit-detail:visible").waitFor();
      await page.locator("#unit-detail [data-unit-link]").click();
      assert.match(await page.locator("#unit-detail").innerText(),/244 Wing/);
      await page.locator("#unit-detail [data-siblings]").filter({hasText:/squadrons/}).click();
      assert.equal(await page.locator("#unit-list tbody tr").count(),5);
      await page.locator("#campaign").selectOption("britain");
      assert.equal(await page.locator("#unit-list tbody tr").count(),21);
      await page.locator("#unit-search").fill("unmatched formation");
      assert.equal(await page.locator("#unit-list tbody tr").count(),0);
      assert.equal(await page.locator("#export-view").isDisabled(),true);
      await page.locator("#campaign").selectOption("kursk");
      assert.equal(await page.locator("#unit-list tbody tr").count(),8);
      await page.locator("#campaign").selectOption("bagration");
      await page.locator("#unit-list a").filter({hasText:/^16th Air Army$/}).click();
      await page.locator("#unit-detail a").filter({hasText:/16th Air Army divisions/}).click();
      assert.equal(await page.locator("#unit-list tbody tr").count(),19);
      await page.goBack();assert.match(await page.locator("#unit-detail").innerText(),/16th Air Army/);
      await page.locator("#campaign").selectOption("reichdefense");
      await page.locator('#populations [href*="berlin-250-raf-support"]').click();
      assert.match(await page.locator("#scope-meta").innerText(),/2 reported/);
      assert.equal(await page.locator("#filters").isVisible(),false);
      assert.match(await page.locator("#assessment-forces").innerText(),/Luftwaffe|Germany|German/);
      [file]=await Promise.all([page.waitForEvent("download"),page.locator("#export-view").click()]);
      assert.match(fs.readFileSync(await file.path(),"utf8"),/reported total only/);
      assert.ok(await size());assert.deepEqual(errors,[]);
    } finally { await page.close(); }
  }
  console.log("PASS roster journeys at desktop and mobile: 20 dossiers, dated selections, station map, linked evidence, siblings, history, CSV and missing states.");
};
