'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');

module.exports = async (browser, base, root) => {
  const route = new URL('./reich-defence.html', base).href;
  for (const [width, height] of [[1440, 1000], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 500, hasTouch: width < 500 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('#raid-list button[aria-current="true"]');
      await page.waitForSelector('.reich-pin');
      assert.equal(await page.locator('#raid-list button').count(), 13);
      assert.equal(await page.locator('.reich-pin').count(), 13);
      assert.equal(await page.locator('.reich-pin').evaluateAll(pins => {
        const map = document.querySelector('#reich-map').getBoundingClientRect();
        return pins.every(pin => {
          const box = pin.getBoundingClientRect();
          return box.left >= map.left && box.right <= map.right && box.top >= map.top && box.bottom <= map.bottom;
        });
      }), true);
      assert.match(await page.locator('#raid-title').innerText(), /Gomorrah/);
      assert.match(await page.locator('#raid-month').innerText(), /No transcribed command total/);
      await page.locator('#raid-mode').selectOption('night');
      assert.equal(await page.locator('#raid-list button').count(), 4);
      assert.equal(await page.locator('.reich-pin').count(), 4);
      await page.locator('[data-raid="nuremberg"]').press('Enter');
      assert.match(await page.locator('#raid-title').innerText(), /Nuremberg/);
      const details = await page.locator('#raid-records').innerText();
      for (const tally of ['616', '710', '94', '95']) assert.ok(details.includes(tally), tally);
      assert.equal(await page.locator('[data-scope="command"] .evidence-row').count(), 2);
      assert.match(await page.locator('#raid-month').innerText(), /662 aircraft destroyed/);
      await page.locator('[data-raid="schweinfurt-day-night"]').click();
      assert.match(await page.locator('#raid-links').innerText(), /Possible same raid/);
      assert.match(await page.locator('#raid-links').innerText(), /Documented day and night attacks/);
      await page.goto(route + '#munich', { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.querySelector('#raid-title').textContent.includes('Munich'));
      assert.equal(await page.locator('#raid-links strong').filter({ hasText: 'Documented loss during escort' }).count(), 2);
      assert.match(await page.locator('#raid-month').innerText(), /433 aircraft destroyed/);
      await page.locator('.reich-pin[aria-label="Leuna and the November interception"]').click();
      assert.match(await page.locator('[data-scope="command"]').innerText(), /142/);
      assert.match(await page.locator('[data-scope="command"]').innerText(), /97/);
      assert.match(await page.locator('[data-scope="allied"]').innerText(), /MACR 10156/);
      assert.equal(await page.locator('#raid-records a[href^="https://"]').count(), 3);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (width < 500) assert.equal(await page.locator('#raid-detail').evaluate(el => el === document.activeElement), true);
      await page.screenshot({ path: path.join(root, 'v80-qa-reich-defence-' + width + '.png'), fullPage: true });
      await page.locator('[data-raid="berlin-february"]').click();
      assert.match(await page.locator('#raid-month').innerText(), /No transcribed command total/);
      assert.match(await page.locator('#raid-records').innerText(), /1,003/);
      assert.deepEqual(errors, []);
    } finally {
      await page.close();
    }
  }
  const atlas = await browser.newPage();
  try {
    await atlas.goto(base, { waitUntil: 'domcontentloaded' });
    await atlas.waitForSelector('[data-campaign="reichdefense"]');
    await atlas.locator('[data-campaign="reichdefense"]').click();
    await atlas.getByRole('link', { name: 'Explore Reich defence raids and loss returns' }).click();
    await atlas.waitForSelector('#raid-list button');
    assert.match(await atlas.url(), /reich-defence\.html/);
  } finally {
    await atlas.close();
  }
  console.log('PASS Reich defence browser: dossier entry, desktop and mobile map, keyboard, filter, deep link, case evidence and gaps');
};
