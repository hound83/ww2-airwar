"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");

module.exports = async (browser, base, root) => {
  const route = new URL("./sicily.html", base);
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 500, isMobile: width < 500 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(new URL("?campaign=sicily#campaign-dossier", base).href, { waitUntil: "domcontentloaded" });
      await page.getByRole("link", { name: "Explore the Sicily air campaign" }).click();
      await page.waitForURL(route.href);
      await page.locator('#case-list [aria-current="true"][data-case="landing-cover"]').waitFor();
      assert.match(await page.locator("#case-evidence").innerText(), /440/);
      assert.equal(await page.getByRole("button", { name: "Gozo landing ground" }).count(), 1);
      assert.equal(await page.getByRole("button", { name: /Licata.*JOSS/ }).count(), 1);

      const capture = page.locator('#case-list [data-case="pachino-capture"]');
      if (width < 500) await capture.tap();
      else await capture.press("Enter");
      assert.match(await page.locator("#station-history").innerText(), /10 Jul 1943.*Captured[\s\S]+13 Jul 1943.*No. 244 Wing/);
      await page.locator('#station-history [data-case="pachino-operational"]').click();
      assert.match(await page.locator("#case-title").innerText(), /first fighter wing/);
      assert.match(await page.locator("#case-evidence").innerText(), /Aircraft held ready for local defence\s+6/);
      assert.equal(await page.locator("#case-title").evaluate(el => el === document.activeElement), true);
      await page.locator('#case-formations [data-formation="wing244"]').click();
      assert.equal(await page.locator("#formation-wing244").getAttribute("open") !== null, true);
      assert.match(await page.locator("#formation-wing244").innerText(), /Pachino/);
      await page.locator("#formation-wing244 [data-case=pachino-capture]").click();
      assert.equal(await page.getByRole("combobox", { name: "Formation" }).inputValue(), "wing244");
      assert.equal(await page.locator("#case-list a").count(), 1);

      await page.getByRole("combobox", { name: "Chapter" }).selectOption("strait");
      assert.match(await page.locator("#case-count").innerText(), /No cases/);
      assert.equal(await page.locator("#case-detail").isHidden(), true);
      await page.getByRole("combobox", { name: "Formation" }).selectOption("");
      await page.getByRole("button", { name: "Strait of Messina" }).click();
      await page.locator('#campaign-map [data-case="messina"]').click();
      assert.match(await page.locator("#case-evidence").innerText(), /39,569/);
      assert.match(await page.locator("#case-evidence").innerText(), /Allied claims of craft destroyed\s+23/);
      assert.equal(await page.locator("#case-evidence a").count(), 4);
      const share = page.url();
      await page.goto(share, { waitUntil: "domcontentloaded" });
      await page.locator('#case-list [data-case="messina"][aria-current="true"]').waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: path.join(root, "v80-qa-sicily-" + width + ".png"), fullPage: true });

      await page.goto(route.href + "?case=gela-friendly-fire#campaign", { waitUntil: "domcontentloaded" });
      await page.locator('#case-list [data-case="gela-friendly-fire"][aria-current="true"]').waitFor();
      assert.match(await page.locator("#case-evidence").innerText(), /Failed to return\s+23/);
      await page.getByRole("combobox", { name: "Chapter" }).selectOption("advance");
      await page.locator('#case-list [data-case="biscari"]').click();
      assert.match(await page.locator("#station-history").innerText(), /12 Jul 1943[\s\S]+14 Jul 1943/);
      assert.equal(await page.locator("#case-evidence a").count(), 2);
      const payload = await page.request.get(new URL("./research/transcriptions/sicily-air-campaign-1943.json", route).href);
      assert.ok(payload.ok());
      assert.equal((await payload.json()).cases.length, 22);
      // Enter both studies through the public campaign list, then verify shared and return routes.
      await page.goto(base);
      await page.locator('#campaign-list [data-campaign="sicily"]').click();
      const entry = page.locator("#dossier-study-link");
      if (width < 500) await entry.tap();
      else await entry.press("Enter");
      await page.waitForURL(/case=pachino-patrols#case-detail$/);
      await page.getByRole("heading", { name: /patrols before the ground party/ }).waitFor();
      assert.match(await page.locator("#case-evidence").innerText(), /Further patrols that day\s+3/);
      assert.ok(await page.locator('#case-evidence a[href$="#page=160"]').count());
      await page.reload();
      await page.getByRole("heading", { name: /patrols before the ground party/ }).waitFor();
      await page.goBack();
      await page.waitForURL(/campaign=sicily#campaign-dossier$/);
      assert.match(await page.locator("#dossier-title").innerText(), /Sicily/);
      await page.locator('#campaign-list [data-campaign="dieppe"]').click();
      await page.locator("#dossier-study-link").click();
      await page.waitForURL(/dieppe\.html#withdrawal$/);
      assert.match(await page.locator("#withdrawal").innerText(), /All twelve aircraft/);
      assert.ok(await page.locator('#withdrawal a[href$="#page383"]').count());
      await page.screenshot({path: path.join(root, "v80-qa-dieppe-" + width + ".png"), fullPage: true});
      await page.getByRole("link", {name: "Loss accounts",exact:true}).click();
      await page.reload();
      await page.waitForURL(/#losses$/);
      assert.match(await page.locator("#losses").innerText(), /108 Allied aircraft/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.getByRole("link", {name:"Return to the Dieppe dossier and its sourced figures"}).click();
      assert.match(await page.locator("#dossier-title").innerText(), /Dieppe/);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
  console.log("PASS Sicily Chromium: desktop and mobile dossier, map, Pachino, Gela, Messina, Biscari, formation, missing state and source data");
};
