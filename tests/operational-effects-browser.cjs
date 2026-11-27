"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
module.exports = async function(browser,base,root) {
  for (const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:900},hasTouch:width<500,acceptDownloads:true});
    const errors = [];
    page.on("pageerror",error=>errors.push(error.message));
    try {
      await page.goto(new URL("grand-air-war-v80.html",base).href);
      await page.getByRole("link",{name:"Operational effects",exact:true}).press("Enter");
      await page.waitForURL(/operational-effects\.html/);
      assert.match(await page.title(),/v11\.0/);
      const air=page.getByRole("link",{name:"Airlift and supply",exact:true});
      if(width<500) await air.tap(); else await air.press("Enter");
      await page.locator("#arnhem summary").press("Enter");
      const reconciliation=page.getByRole("table",{name:"Reconciling the published recovery percentage"});
      assert.match(await reconciliation.innerText(),/6\.4/);
      assert.equal(await page.locator("#arnhem .sources li").count(),3);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1));
      await page.getByRole("heading",{name:"What changed because aircraft flew?"}).scrollIntoViewIfNeeded();
      await page.screenshot({path:path.join(root,"v80-qa-effects-"+width+".png")});
      const [download]=await Promise.all([page.waitForEvent("download"),page.locator("a[download]").click()]);
      assert.match(fs.readFileSync(await download.path(),"utf8"),/106 − 14/);
      await page.getByRole("link",{name:"20-campaign audit"}).click();
      await page.locator("section .side").first().waitFor();
      assert.equal(await page.locator("section .side").count(),40);
      await page.locator('.campaign-index a[href="#marketgarden"]').press("Enter");
      await page.locator("#marketgarden summary").press("Enter");
      assert.equal(await page.locator("#marketgarden tbody tr").count(),7);
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth+1));
      await page.locator("#marketgarden .side a").first().click();
      await page.waitForURL(/campaign=marketgarden#mission-/);
      assert.equal(await page.locator("#campaign-choice").inputValue(),"marketgarden");
      await page.goto(new URL("grand-air-war-v80.html?campaign=marketgarden#campaign-dossier",base).href);
      await page.getByRole("link",{name:"What the evidence establishes"}).click();
      await page.waitForURL(/dossier-audit.html#marketgarden/);
      assert.deepEqual(errors,[]);
    } finally { await page.close(); }
  }
  console.log("PASS v11.0 study, source, CSV, audit and dossier journeys at desktop and mobile widths.");
};
