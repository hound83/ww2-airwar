"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const journeys = [
  ["sicily","raf-92","pachino"],
  ["malta","raf-249","ta-qali"],
  ["britain","raf-303","northolt"],
  ["normandy","rcaf-430","sommervieu-b-8"],
  ["reichdefense","de-zg26-iii","wunstorf"],
  ["bagration","fr-normandie","doubrovka"]
];
module.exports = async (browser,base,root) => {
  for (const width of [1440,390]) {
    const page = await browser.newPage({viewport:{width,height:width < 500 ? 844 : 900},isMobile:width < 500,hasTouch:width < 500});
    const errors = [];
    page.on("pageerror",err => errors.push(err.message));
    try {
      for (const [campaign,unit,station] of journeys) {
        await page.goto(base + "?campaign=" + campaign + "#campaign-dossier",{waitUntil:"domcontentloaded"});
        const open = page.locator("#dossier-formations");
        if (width < 500) await open.tap();
        else await open.press("Enter");
        const list = page.locator("#campaign-" + campaign);
        await list.locator('a[href="#unit-' + unit + '"]').click();
        const article = page.locator("#unit-" + unit);
        await article.locator("h1").waitFor();
        const firstTitle = await article.locator("h1").innerText();
        await article.locator('a[href="#station-' + station + '"]').click();
        const field = page.locator("#station-" + station);
        await field.locator("h1").waitFor();
        assert.equal(await field.locator('a[href="#unit-' + unit + '"]').count(),1);
        assert.match(await field.locator(".citation a").first().getAttribute("href"),/^https:/);
        await page.goBack();
        await article.locator("h1").waitFor();
        await page.reload({waitUntil:"domcontentloaded"});
        assert.equal(await article.locator("h1").innerText(),firstTitle);
        assert.equal(await page.locator("[data-view]:visible").count(),1);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth <= document.documentElement.clientWidth+1));
        await article.getByRole("link",{name:"Open the campaign evidence"}).click();
        if (campaign === "sicily") await page.getByRole("heading",{name:/cover for ships off Syracuse/}).waitFor();
        if (campaign === "normandy") {
          await page.getByText(/Dives bridge reconnaissance/).first().waitFor();
        }
        const cases = {malta:'[data-case="spotter"][aria-current="true"]',bagration:'[data-case="orsha"][aria-current="true"]',reichdefense:'[data-raid="big-week"][aria-current="true"]',britain:'#moment-detail'};
        if (cases[campaign]) await page.locator(cases[campaign]).first().waitFor();
        await page.goBack();
        await article.locator('a[href*="?campaign=' + campaign + '#campaign-dossier"]').click();
        await page.locator("#dossier-formations").waitFor();
        assert.equal(new URL(page.url()).searchParams.get("campaign"),campaign);
      }
      const histories = new URL("formations.html",base).href;
      await page.goto(histories+"#unit-raf-601");
      await page.locator("#unit-raf-601 h1").waitFor();
      await page.screenshot({path:path.join(root,"v80-qa-formation-history-"+width+".png")});
      await page.locator('#unit-raf-601 a[href="#campaign-malta"]').press("Enter");
      await page.waitForFunction(()=>document.activeElement?.textContent === "Malta");
      await page.goto(histories+"#unrecorded");
      await page.locator("#unknown").waitFor();
      await page.goto(histories+"#unit-su-16va");
      await page.locator("#unit-su-16va").getByText(/no single operating airfield/).waitFor();
      await page.goto(base+"?campaign=poland#campaign-dossier");
      await page.locator("#dossier-study-title").waitFor();
      assert.ok(await page.locator("#dossier-formations").isHidden());
      assert.deepEqual(errors,[]);
    } finally { await page.close(); }
  }
  console.log("PASS six dossier → formation → station → evidence → dossier routes at 1440 and 390px, shared URL, keyboard, touch and unknown records");
};
