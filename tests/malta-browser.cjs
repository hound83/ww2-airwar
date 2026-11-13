'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = async (browser, base, root) => {
  const route = new URL('./malta.html', base).href;
  const index = await browser.newPage();
  try {
    await index.goto(base, { waitUntil: 'domcontentloaded' });
    await index.locator('[data-campaign="malta"]').click();
    await index.getByRole('link', { name: /Explore Malta’s airfields/ }).click();
    await index.waitForURL(route);
    await index.waitForSelector('#raid-list button');
  } finally {
    await index.close();
  }
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, hasTouch: width < 500, isMobile: width < 500 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(route + '#spotter', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-case="spotter"][aria-current="true"]');
      assert.equal(await page.locator('[data-case]').count(), 16);
      assert.ok(await page.locator('#raid-story').innerText().then(text => text.includes('HMS Eagle')));
      assert.match(await page.locator('#raid-records').innerText(), /16 delivered/);
      assert.equal(await page.locator('.map-pin').count(), 4);
      await page.getByRole('button', { name: 'Zoom to Malta' }).click();
      await page.waitForFunction(() => Boolean(document.querySelector('[aria-label^="Luqa,"]')));
      await page.locator('[aria-label^="Luqa,"]').click();
      await page.locator('[data-map-case="luqa-april"]').click();
      assert.match(await page.locator('#raid-title').innerText(), /Luqa/);
      await page.getByLabel('View', { exact: true }).selectOption('reinforcement');
      assert.equal(await page.locator('[data-case]').count(), 5);
      const choose = page.locator('[data-case="bowery"]');
      if (width < 500) await choose.tap();
      else await choose.press('Enter');
      assert.match(await page.locator('#raid-title').innerText(), /Bowery/);
      assert.match(await page.locator('#raid-records').innerText(), /Minutes to make fighters operational\s+35/);
      assert.ok(page.url().endsWith('#bowery'));
      if (width < 500) assert.equal(await page.locator('#raid-detail').evaluate(el => el === document.activeElement), true);
      await page.getByLabel('View', { exact: true }).selectOption('convoys');
      await page.locator('[data-case="vigorous"]').click();
      assert.match(await page.locator('#raid-records').innerText(), /Merchant ships reaching Malta\s+0/);
      await page.locator('[data-case="pedestal"]').click();
      assert.match(await page.locator('#raid-records').innerText(), /32,000/);
      await page.goto(route + '#october-interception', { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-case="october-interception"][aria-current="true"]');
      assert.match(await page.locator('#raid-records').innerText(), /Serviceable Spitfires\s+46/);
      assert.match(await page.locator('#spring-series').innerText(), /9,599/);
      assert.equal(await page.locator('#spring-series tbody tr').count(), 4);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: path.join(root, 'v80-qa-malta-' + width + '.png'), fullPage: true });
      await page.locator('[data-case="illustrious"]').click();
      assert.equal(await page.locator('#raid-records .metrics').count(), 0);
      assert.ok(await page.locator('#raid-records a[href^="https://"]').count() > 0);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
  console.log('PASS Malta browser: public dossier, map groups and zoom, keyboard and touch, filters, deep links, evidence and genuine gaps');
};
