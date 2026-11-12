"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

module.exports = async (browser, base, root) => {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({
      viewport: {width, height: 850},
      deviceScaleFactor: 1,
      isMobile: width === 390,
      hasTouch: width === 390,
      acceptDownloads: true
    });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    try {
      await page.goto(base, {waitUntil: "domcontentloaded"});
      await page.getByRole("navigation", {name: "Explore the Atlas"})
        .getByRole("link", {name: "1944 mission timeline"}).click();
      await page.waitForURL(/operations-1944\.html/);
      await page.locator(".record").first().waitFor({timeout: 15000});
      assert.match(await page.locator("#filter-status").innerText(), /records across \d+ start dates/);
      const before = await page.locator(".day").count();
      await page.getByRole("button", {name: "Show more dates"}).click();
      assert.ok(await page.locator(".day").count() > before);

      await page.getByRole("button", {name: /Big Week/}).click();
      assert.match(page.url(), /from=1944-02-19/);
      assert.equal(await page.locator("input[name=to]").inputValue(), "1944-02-26");
      await page.getByLabel("Evidence", {exact: true}).selectOption("both");
      assert.match(await page.locator(".day").first().innerText(), /Evidence from both sides/);
      await page.getByLabel("Evidence", {exact: true}).selectOption("linked");
      const intercept = page.locator(".record").filter({
        has: page.locator("summary .title").filter({hasText: "B-24 interception near Holzminden"})
      });
      await intercept.locator("summary").focus();
      await page.keyboard.press("Enter");
      assert.equal(await intercept.getAttribute("open"), "");
      assert.match(await intercept.innerText(), /Possible same raid/);
      assert.ok(await intercept.locator('a[href^="https://aviationtrails.co.uk"]').count());

      await page.getByLabel("Evidence", {exact: true}).selectOption("");
      await page.locator('#filters select[name="force"]').selectOption("us15");
      const query = page.getByRole("searchbox");
      await query.fill("Steyr");
      assert.match(await page.locator("#filter-status").innerText(), /records across \d+ start dates/);
      assert.match(page.url(), /force=us15.*q=Steyr/);
      const csvPromise = page.waitForEvent("download");
      await page.getByRole("button", {name: "Download filtered records (CSV)"}).click();
      const download = await csvPromise;
      const csv = await fs.readFile(await download.path(), "utf8");
      assert.match(csv, /"source_url","source_locator"/);
      assert.match(csv, /"us15-1944-02-24"/);
      assert.doesNotMatch(csv, /"us8-1944/);
      assert.match(csv, /https:\/\/www\.ibiblio\.org\/hyperwar\/AAF\/III\/AAF-III-2\.html/);

      await query.fill("no-such-airfield-1944");
      assert.equal(await page.locator("#filter-status").innerText(), "No records match these filters.");
      assert.equal(await page.locator("#csv-download").isDisabled(), true);
      await page.goto(new URL("./operations-1944.html?preset=d-day", base).href);
      await page.locator(".record").first().waitFor();
      assert.equal(await page.locator("input[name=from]").inputValue(), "1944-06-05");
      assert.match(await page.locator(".day").filter({hasText: "German night sorties off Normandy"}).innerText(), /both sides/);
      await page.locator("#coverage-force").selectOption("reich");
      assert.equal(await page.locator("#coverage-rows tr").count(), 6);
      assert.match(await page.locator("#coverage-rows tr").filter({hasText: "February"}).innerText(), /359/);

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 2, "1944 timeline overflow at " + width + "px");
      assert.deepEqual(errors, []);
      await page.screenshot({path: path.join(root, "operations-1944-qa-" + width + ".png")});
    } finally {
      await page.close();
    }
  }
  console.log("PASS 1944 operations Chromium: Atlas navigation, dates, opposing evidence, keyboard, search, export and coverage on desktop and mobile.");
};
