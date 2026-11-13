"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

module.exports = async function checkBodenplatte(browser, base, root) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, hasTouch: width < 500 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(base + "?campaign=bodenplatte#campaign-dossier");
      assert.equal(await page.locator("#dossier-title").innerText(), "Operation Bodenplatte");
      await page.getByRole("link", { name: "Explore Bodenplatte locations and unit losses" }).click();
      await page.locator("#field-name").waitFor();
      assert.equal(await page.locator("#field-name").innerText(), "Eindhoven");
      assert.equal(await page.locator("#field-list a").count(), 20);
      assert.equal(await page.locator("#field-map .field-marker").count(), 20);

      const asch = page.locator('[data-airfield="asch"]');
      await asch.focus();
      await page.keyboard.press("Enter");
      assert.match(page.url(), /airfield=asch/);
      const zero = page.locator('[data-observation="asch-487th-lost"]');
      assert.match(await zero.innerText(), /0.*Lost/s);
      await zero.locator("summary").press("Enter");
      assert.ok(await zero.getByRole("link").isVisible());

      const evere = page.locator('#field-map [aria-label="Brussels–Evere"]');
      const melsbroek = page.locator('#field-map [aria-label="Brussels–Melsbroek"]');
      const a = await evere.boundingBox(), b = await melsbroek.boundingBox();
      assert.ok(a && b && Math.hypot(a.x - b.x, a.y - b.y) >= 32, "both Brussels markers must be selectable");
      if (width < 500) await melsbroek.tap();
      else await melsbroek.click();
      assert.equal(await page.locator("#field-name").innerText(), "Brussels–Melsbroek");
      await page.goBack();
      assert.equal(await page.locator("#field-name").innerText(), "Asch / Zutendaal");

      await page.locator('[data-airfield="evere"]').click();
      assert.equal(await page.locator("#field-name").innerText(), "Brussels–Evere");
      await page.locator('[data-airfield="metz"]').click();
      await page.locator("#side").selectOption("Allied");
      await page.locator("#evidence").selectOption("claims");
      assert.match(await page.locator("#field-status").innerText(), /No source records/);
      assert.equal(await page.locator("#field-csv").isDisabled(), true);
      await page.locator("#evidence").selectOption("outcomes");
      assert.match(await page.locator('[data-observation="metz-368-loss"]').innerText(), /Count unavailable/);
      const download = page.waitForEvent("download");
      await page.locator("#field-csv").click();
      const file = await download;
      assert.equal(file.suggestedFilename(), "bodenplatte-metz.csv");
      const csv = await fs.readFile(await file.path(), "utf8");
      assert.match(csv, /365th Fighter Group.*22.*22.*Cold Front/);
      assert.match(csv, /395th Fighter Squadron, 368th Fighter Group.*"","","Ground","unquantified"/);
      assert.doesNotMatch(csv, /metz-jg53-loss/);
      assert.ok(await page.getByRole("link", { name: "Operation scope (JSON)" }).isVisible());
      assert.match(await page.locator("#operation-totals").innerText(), /aerial losses are included/);

      await page.locator("#side").selectOption("");
      await page.locator("#evidence").selectOption("");
      await page.locator('[data-airfield="sinttruiden"]').click();
      const counts = page.locator(".comparison strong");
      assert.deepEqual(await counts.allInnerTexts(), ["10 destroyed · 31 damaged", "6 destroyed · 33 damaged"]);
      assert.equal(await page.locator(".comparison a").count(), 2);

      await page.locator('[data-airfield="ghent"]').click();
      assert.match(await page.locator("#field-highlights").innerText(), /18 destroyed and 5 damaged on the ground, 2 lost in air combat/);
      await page.locator("#evidence").selectOption("claims");
      assert.equal(await page.locator('[data-observation="gh-claim-d"]').count(), 1);
      assert.equal(await page.locator('[data-observation="gh-ground-d"]').count(), 0);
      await page.locator("#evidence").selectOption("");

      await page.locator("#raid-outcome").selectOption("intercepted");
      assert.equal(await page.locator("#field-list a:visible").count(), 2);
      assert.equal(await page.locator("#field-map .field-marker").count(), 2);
      await page.locator("#raid-outcome").selectOption("disputed");
      assert.equal(await page.locator("#field-list a:visible").count(), 3);
      await page.locator('[data-airfield="knokke"]').click();
      assert.match(await page.locator("#field-status").innerText(), /No source records/);
      await page.locator("#raid-outcome").selectOption("");
      await page.locator('[data-airfield="melsbroek"]').click();
      await page.getByRole("button", { name: "Find NS746" }).click();
      await page.locator("#unit-query").press("Enter");
      assert.match(page.url(), /airfield=melsbroek.*evidence=airframes.*q=NS746/);
      await page.reload();
      const mosquito = page.locator('[data-observation="airframe-NS746"]');
      assert.match(await mosquito.innerText(), /initially AC; later CE/);
      await mosquito.locator("summary").press("Enter");
      assert.ok(await mosquito.getByRole("link").first().isVisible());
      const namedDownload = page.waitForEvent("download");
      await page.locator("#field-csv").click();
      const namedCsv = await fs.readFile(await (await namedDownload).path(), "utf8");
      assert.match(namedCsv, /airframe-NS746.*initially AC; later CE/);
      assert.doesNotMatch(namedCsv, /airframe-NS567/);

      assert.equal(await page.locator("#chronology-events li").count(), 16);
      assert.match(await page.locator("#event-dec25-eindhoven").innerText(), /Austers destroyed/);
      await page.locator("#event-jan13-350").getByRole("link", { name: "Ophoven / Uphoven" }).click();
      assert.equal(await page.locator("#field-name").innerText(), "Ophoven / Uphoven");
      assert.match(await page.locator("#field-code").innerText(), /Y-32/);
      await page.locator("#formation-list summary").click();
      assert.equal(await page.locator("#formation-list tbody tr").count(), 37);
      const group = page.getByRole("row").filter({ has: page.getByRole("rowheader", { name: "III./JG 53", exact: true }) });
      await group.getByRole("link", { name: "Étain–Rouvres" }).click();
      assert.match(await page.locator("#field-code").innerText(), /intercepted before target/);
      assert.equal(await page.locator('[data-observation="jg53-iii"]').count(), 1);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.locator("#airfields").screenshot({ path: path.join(root, "v80-qa-bodenplatte-" + width + ".png") });
      await page.getByRole("link", { name: "Bodenplatte campaign dossier" }).click();
      await page.waitForFunction(() => window.GrandAirWarV77?.selected() === "bodenplatte");
      assert.equal(await page.locator("#dossier-title").innerText(), "Operation Bodenplatte");
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
  console.log("PASS Bodenplatte Chromium: campaign links, map selection, keyboard/touch, filters and CSV at 1440px and 390px.");
};
