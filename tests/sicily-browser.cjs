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

      await page.getByRole("link", { name: /Browse forces deployed on 9.10 July/ }).click();
      const roster = page.getByRole("combobox", { name: "Dated roster" });
      for (const [family, members] of [["sicily-gruppen", 4], ["sicily-stab", 2], ["sicily-211-wings", 5],
        ["sicily-211", 23], ["sicily-xii", 5], ["sicily-italian", 5]]) {
        await roster.selectOption(family);
        assert.equal(await page.locator("#roster-members tbody tr").count(), members);
      }
      assert.match(await page.locator("#roster-scope").innerText(), /At least 5/);
      await roster.selectOption("sicily-gruppen");
      assert.match(await page.locator("#roster-members").innerText(), /Gerbini/);
      const group = page.locator("#roster-members").getByRole("link", {name: "II./JG 53", exact: true});
      const groupUrl = new URL(await group.getAttribute("href"), route);
      assert.equal(groupUrl.searchParams.get("unit"), "II./JG 53");
      assert.equal(groupUrl.searchParams.get("population"), "sicily-gruppen");
      assert.match(await page.locator("#roster-members tbody tr").filter({hasText: "II./JG 53"}).first().innerText(), /23\s+18/);
      await roster.selectOption("sicily-211");
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator('#roster-members tbody tr').first().waitFor();
      assert.equal(await roster.inputValue(), "sicily-211");
      assert.match(await page.locator("#roster-members").innerText(), /No. 92 Squadron/);
      const rosterPage = page.url();
      await page.locator("#roster-members").getByRole("link", {name: "No. 92 Squadron", exact: true}).click();
      await page.locator("#unit-detail").getByRole("heading", {name: "No. 92 Squadron", exact: true}).waitFor();
      await page.locator("#unit-detail").getByRole("link", {name: "Open 244 Wing"}).click();
      await page.locator("#unit-detail").getByRole("heading", {name: "244 Wing", exact: true}).waitFor();
      await page.getByRole("link", {name: /View this wing.*squadrons/}).click();
      await page.locator("#unit-list").getByRole("link", {name: "No. 92 Squadron", exact: true}).click();
      await page.locator("#unit-detail").getByRole("link", {name: /Messina escort/}).click();
      await page.locator('#case-list [data-case="messina"][aria-current="true"]').waitFor();
      assert.match(await page.locator("#case-evidence").innerText(), /Warhawks escorted on the anti-shipping mission/);
      await page.goto(rosterPage, {waitUntil: "domcontentloaded"});
      await page.locator('#case-list [data-case="landing-cover"][aria-current="true"]').waitFor();
      const capture = page.locator('#case-list [data-case="pachino-capture"]');
      if (width < 500) await capture.tap();
      else await capture.press("Enter");
      assert.match(await page.locator("#station-history").innerText(), /10 Jul 1943.*Captured[\s\S]+13 Jul 1943.*No. 244 Wing/);
      assert.match(await page.locator("#case-formations").innerText(), /advance officers inspected/);
      await page.locator('#station-history [data-case="pachino-operational"]').click();
      assert.match(await page.locator("#case-title").innerText(), /first fighter wing/);
      assert.match(await page.locator("#case-evidence").innerText(), /Aircraft held ready for local defence\s+6/);
      assert.equal(await page.locator("#case-title").evaluate(el => el === document.activeElement), true);
      await page.locator('#case-formations [data-formation="wing244"]').click();
      assert.equal(await page.locator("#formation-wing244").getAttribute("open") !== null, true);
      assert.match(await page.locator("#formation-wing244").innerText(), /Pachino/);
      await page.locator("#formation-wing244 [data-case=pachino-capture]").click();
      assert.equal(await page.getByRole("combobox", { name: "Unit in the dated cases" }).inputValue(), "wing244");
      assert.equal(await page.locator("#case-list a").count(), 1);

      await page.getByRole("combobox", { name: "Chapter" }).selectOption("strait");
      assert.match(await page.locator("#case-count").innerText(), /No cases/);
      assert.equal(await page.locator("#case-detail").isHidden(), true);
      await page.getByRole("combobox", { name: "Unit in the dated cases" }).selectOption("");
      await page.getByRole("button", { name: "Strait of Messina" }).click();
      await page.locator('#campaign-map [data-case="messina"]').click();
      assert.match(await page.locator("#case-evidence").innerText(), /39,569/);
      assert.match(await page.locator("#case-evidence").innerText(), /Allied claims of craft destroyed\s+23/);
      assert.equal(await page.locator("#case-evidence a").count(), 7);
      assert.match(await page.locator("#case-evidence").innerText(), /Siebel/);
      assert.match(await page.locator("#case-evidence").innerText(), /Warhawks escorted on the anti-shipping mission\s+12/);
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
      await page.goto(route.href + "?case=biscari&formation=skg10#campaign", {waitUntil:"domcontentloaded"});
      await page.locator('#case-list [data-case="biscari"][aria-current="true"]').waitFor();
      assert.equal(await page.locator("#formation").inputValue(), "");
      const payload = await page.request.get(new URL("./research/transcriptions/sicily-air-campaign-1943.json", route).href);
      assert.ok(payload.ok());
      assert.equal((await payload.json()).cases.length, 23);
      // Enter both studies through the public campaign list, then verify shared and return routes.
      await page.goto(base);
      await page.locator('#campaign-list [data-campaign="sicily"]').click();
      await page.getByRole("heading", { name: "What difference did Allied fighters make in the battle for Sicily?" }).waitFor();
      const entry = page.locator("#dossier-study-link");
      if (width < 500) await entry.tap();
      else await entry.press("Enter");
      await page.waitForURL(/case=landing-cover#case-detail$/);
      await page.getByRole("heading", { name: "How much protection reached the fleet?" }).waitFor();
      await page.reload();
      await page.getByRole("heading", { name: "How much protection reached the fleet?" }).waitFor();
      assert.match(await page.locator("#case-evidence").innerText(), /gaps in cover over the American sectors/);
      await page.goBack();
      await page.waitForURL(/campaign=sicily#campaign-dossier$/);
      await page.locator("#dossier-study-link").click();
      await page.getByRole("link", { name: "covered Nelson and Rodney off Syracuse" }).click();
      await page.getByRole("heading", { name: /cover for ships off Syracuse/ }).waitFor();
      assert.match(await page.locator("#case-evidence").innerText(), /Aircraft covering shipping\s+8/);
      await page.locator('#station-history [data-case="pachino-patrols"]').click();
      await page.getByRole("heading", { name: /patrols before the ground party/ }).waitFor();
      assert.match(await page.locator("#case-evidence").innerText(), /Further patrols that day\s+3/);
      assert.ok(await page.locator('#case-evidence a[href$="#page=160"]').count());
      await page.reload();
      await page.getByRole("heading", { name: /patrols before the ground party/ }).waitFor();
      await page.getByRole("link", { name: "Sicily campaign dossier", exact: true }).click();
      await page.waitForURL(/campaign=sicily#campaign-dossier$/);
      await page.locator("#dossier-title").filter({hasText: /Sicily/}).waitFor();
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
      await page.locator("#dossier-title").filter({hasText: /Dieppe/}).waitFor();
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
  console.log("PASS Sicily Chromium: desktop and mobile dossier, map, Pachino, Gela, Messina, Biscari, formation, missing state and source data");
};
