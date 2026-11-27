"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
module.exports = async function(browser,base) {
  for (const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:900},hasTouch:width<500,acceptDownloads:true});
    const errors = [];
    page.on("pageerror", e=>errors.push(e.message));
    try {
      await page.goto(new URL("grand-air-war-v80.html?campaign=dieppe#campaign-dossier",base).href);
      const entry = page.locator("#dossier-deployments").getByRole("link",{name:"Missions, outcomes and coverage"});
      await entry.press("Enter");
      await page.locator(".mission").first().waitFor();
      assert.equal(await page.locator("#campaign-choice").inputValue(),"dieppe");
      await page.locator(".witnesses summary").first().press("Enter");
      assert.ok(await page.locator(".witnesses[open] a").count()>0);
      assert.equal(await page.getByRole("table",{name:"Allied allocations at Dieppe"}).locator("tbody tr").count(),9);
      const go = page.locator("#related a").filter({hasText:"All campaigns"});
      if(width<500) await go.tap(); else await go.press("Enter");
      await page.locator("table").first().waitFor();
      assert.equal(await page.locator(".region tbody tr").count(),40);
      assert.equal(await page.locator("#campaign-choice option").count(),43);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      await page.locator("#campaign-choice").selectOption("marketgarden");
      await page.waitForURL(/campaign=marketgarden/);
      await page.locator("#evidence .mission").first().waitFor();
      assert.ok((await page.locator(".mission").count())>0);
      assert.equal(await page.locator("#coverage tbody tr").count(),7);
      await page.locator("#related").getByRole("link",{name:"Dated rosters"}).click();
      await page.locator('#mission-study[href*="campaign=marketgarden"]').click();
      await page.waitForURL(/campaign-evidence.html\?campaign=marketgarden/);
      const [download] = await Promise.all([page.waitForEvent("download"),page.locator('a[download][href*="campaign-missions.csv"]').click()]);
      const data = fs.readFileSync(await download.path(),"utf8");
      assert.match(data,/marketgarden/);
      assert.match(data,/reported|account|diary/i);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
      assert.deepEqual(errors,[]);
    } finally { await page.close(); }
  }
  console.log("PASS missions and outcomes: 20 campaigns, 40 side comparisons, Dieppe roles, sources, dossier and roster navigation, mobile, keyboard and public CSV.");
};
