"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const specialists = {
  norway: "#anchorage h2", bigweek: "#february-24 h2", dieppe: "#withdrawal",
  malta: '[data-case="pedestal"][aria-current="true"]',
  reichdefense: '[data-raid="double-strike"][aria-current="true"]',
  schweinfurt: '[data-raid="black-thursday"][aria-current="true"]',
  sicily: '#case-list [data-case="landing-cover"][aria-current="true"]',
  bagration: '[data-case="bobruisk"][aria-current="true"]',
  bodenplatte: '[data-airfield="eindhoven"][aria-current="true"]'
};
module.exports = async (browser, base, root) => {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 500, isMobile: width < 500 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(base, { waitUntil: "domcontentloaded" });
      await page.locator("#dossier-study-title").waitFor();
      const studies = await page.evaluate(() => window.AtlasCampaignStudies);
      assert.equal(Object.keys(studies).length, 20);
      for (const [id, study] of Object.entries(studies)) {
        await page.locator('#campaign-list [data-campaign="' + id + '"]').click();
        await page.getByRole("heading", { name: study.question, exact: true }).waitFor();
        assert.equal(new URL(page.url()).searchParams.get("campaign"), id);
        const panel = page.locator("#dossier-study");
        assert.equal(await panel.locator("#dossier-study-answer").textContent(), study.answer);
        const notes = panel.locator("details");
        if (!(await notes.evaluate(el => el.open))) await notes.locator("summary").press("Enter");
        assert.equal(await panel.locator("#dossier-study-source").getAttribute("href"), study.source);
        assert.equal(await panel.locator("#dossier-study-gap").innerText(), study.gap);
        if (id === "norway") await panel.screenshot({path: path.join(root, "v80-qa-dossier-review-" + width + ".png")});
        const entry = panel.locator("#dossier-study-link");
        const target = new URL(await entry.getAttribute("href"), base);
        if (width < 500) await entry.tap();
        else await entry.press("Enter");
        await page.waitForURL(url => url.pathname === target.pathname && url.searchParams.get("event") === target.searchParams.get("event") && url.hash === target.hash, { waitUntil: "domcontentloaded" });
        if (specialists[id]) {
          await page.locator(specialists[id]).first().waitFor();
        } else {
          const detail = page.locator("#moment-detail");
          await detail.locator(":scope > h3").waitFor();
          assert.ok((await detail.innerText()).includes(study.date));
          assert.equal(new URL(await detail.getByRole("link", {name: "Link to this event"}).getAttribute("href"), base).href, target.href);
        }
        if (id === "norway" || id === "bigweek") {
          await page.locator("h1").scrollIntoViewIfNeeded();
          await page.screenshot({path: path.join(root, "v80-qa-" + id + "-study-" + width + ".png")});
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        }
        await page.goBack({waitUntil:"domcontentloaded"});
        await page.getByRole("heading", { name: study.question, exact: true }).waitFor();
        assert.equal(new URL(page.url()).searchParams.get("campaign"), id);
      }
      const shared = new URL("?campaign=poland&event=1939-09-01#moment-detail", base);
      await page.goto(shared.href, {waitUntil:"domcontentloaded"});
      await page.getByRole("heading", {name: studies.poland.question}).waitFor();
      assert.ok(await page.locator("#moment-detail").isHidden());
      const episode = "121st Fighter Squadron intercepts Dornier Do 17 bombers";
      await page.locator('#moment-list [data-date="1939-09-01"]').filter({hasText:episode}).click();
      assert.equal(new URL(page.url()).searchParams.get("episode"), episode);
      await page.locator("#moment-detail").getByRole("heading", {name:episode}).waitFor();
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator("#moment-detail").getByRole("heading", {name:episode}).waitFor();
      assert.deepEqual(errors, [], width + "px campaign journeys");
    } finally {
      await page.close();
    }
  }
  console.log("PASS all 20 campaign-to-evidence journeys and Back at 1440px and 390px, including same-day episode reload");
};
