"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

module.exports = async function checkBagration(browser, base, root) {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 850 }, hasTouch: width < 500 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(base + "?campaign=bagration#campaign-dossier");
      await page.getByRole("link", { name: "Explore the Bagration air campaign" }).click();
      await page.locator("#case-title").waitFor();
      assert.match(await page.locator("#case-title").innerText(), /Concentrating/);
      assert.equal(await page.locator("#case-list a").count(), 15);
      assert.equal(await page.locator("#campaign-map .bagration-pin").count(), 15);

      await page.locator('[data-case="bobruisk"]').focus();
      await page.keyboard.press("Enter");
      assert.match(page.url(), /case=bobruisk/);
      await page.locator("#kind").selectOption("Claims");
      assert.match(await page.locator('[data-evidence="bob-26-claim"]').innerText(), /13/);
      assert.equal(await page.locator('[data-evidence="bob-26-loss"]').count(), 0);
      await page.locator("#unit").selectOption("iii-jg51");
      assert.match(await page.locator("#evidence-status").innerText(), /No records/);
      assert.equal(await page.locator("#evidence-csv").isDisabled(), true);
      await page.locator("#kind").selectOption("Movement returns");
      assert.equal(await page.locator("[data-balance]").count(), 1);
      assert.match(await page.locator("[data-balance]").innerText(), /III\.\/JG 51/);
      await page.reload();
      assert.equal(await page.locator("#unit").inputValue(), "iii-jg51");
      const pending = page.waitForEvent("download");
      await page.locator("#evidence-csv").click();
      const download = await pending;
      const csv = await fs.readFile(await download.path(), "utf8");
      assert.equal(download.suggestedFilename(), "bagration-bobruisk.csv");
      assert.match(csv, /"Enemy action","8"/);
      assert.doesNotMatch(csv, /bob-26-claim/);

      await page.locator("#case-units").getByRole("link", { name: "III./JG 51" }).click();
      const card = page.locator("#unit-iii-jg51");
      assert.match(await card.innerText(), /Matschulitsche/);
      await card.getByRole("link", { name: "Kaunas and the retreating fighter groups" }).click();
      assert.match(await page.locator("#case-title").innerText(), /Kaunas/);

      await page.locator("#phase").selectOption("Encirclement");
      assert.equal(await page.locator("#case-list a:visible").count(), 2);
      assert.equal(await page.locator("#campaign-map .bagration-pin").count(), 2);
      const marker = page.locator('#campaign-map [aria-label="Berezina crossings and Minsk"]');
      await page.getByRole("button", { name: "Zoom in" }).click();
      if (width < 500) await marker.tap();
      else await marker.click();
      assert.match(await page.locator('[data-evidence="minsk-loss"]').innerText(), /119/);
      const sum = page.locator('[data-evidence="minsk-loss-sum"]');
      assert.match(await sum.innerText(), /179/);
      await sum.locator("summary").press("Enter");
      assert.ok(await sum.getByRole("link").isVisible());

      await page.locator("#phase").selectOption("");
      await page.locator('[data-case="mogilev"]').click();
      assert.match(await page.locator('[data-evidence="mogilev-missing"]').innerText(), /Count unavailable/);
      await page.goBack();
      assert.match(await page.locator("#case-title").innerText(), /Minsk/);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      await page.locator("#campaign").screenshot({ path: path.join(root, "v80-qa-bagration-" + width + ".png") });
      await page.getByRole("link", { name: "Bagration campaign dossier" }).click();
      await page.waitForFunction(() => window.GrandAirWarV77?.selected() === "bagration");
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
  console.log("PASS Bagration Chromium: dossier, dated map, formation drill-down, filters, sharing and CSV at 1440px and 390px.");
};
