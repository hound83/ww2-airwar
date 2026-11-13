'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('research/transcriptions/malta-air-campaign-1940-1942.json'));
const byId = new Map(data.cases.map(item => [item.id, item]));
const topics = ['reinforcement', 'defence', 'convoys'];
assert.equal(data.schema, 1);
assert.equal(byId.size, 16);
assert.equal(data.cases.length, byId.size);
assert.deepEqual(data.cases.map(item => item.date), data.cases.map(item => item.date).sort());
assert.deepEqual(data.cases.map(item => item.date).filter(date => !/^194[012]-\d\d-\d\d$/.test(date)), []);
for (const item of data.cases) {
  assert.ok(!item.end || item.end > item.date, item.id);
  const site = data.sites[item.site];
  assert.ok(site && site.lat >= 30 && site.lat <= 39 && site.lng > 0 && site.lng <= 31, item.id);
  assert.ok(item.topics.length && item.topics.every(topic => topics.includes(topic)), item.id);
  assert.ok(item.evidence.length);
  for (const key of item.refs || []) assert.match(data.sources[key].url, /^https:\/\//);
  for (const row of item.evidence) {
    assert.match(data.sources[row.source].url, /^https:\/\//);
    assert.ok(row.label && row.locator && row.note);
    for (const [id, value] of Object.entries(row.metrics)) {
      assert.ok(data.metrics[id] && Number.isInteger(value) && value >= 0, id);
    }
  }
}
assert.deepEqual(byId.get('spotter').evidence.map(row => row.metrics.arrivals), [15, 15, 16]);
assert.deepEqual(byId.get('calendar').evidence[0].metrics, { emb: 47, flown: 47, arrivals: 46 });
const bowery = byId.get('bowery').evidence;
assert.equal(bowery[0].metrics.flown + bowery[1].metrics.flown, 64);
assert.equal(bowery[2].metrics.arrivals, 60);
assert.equal(bowery[2].metrics.minutes, 35);
assert.deepEqual(byId.get('bellows').evidence.map(row => row.metrics.arrivals), [37, 36]);
assert.equal(byId.get('vigorous').evidence[0].metrics.boatsArrived, 0);
assert.equal(byId.get('october-interception').evidence[2].metrics.serviceable, 46);
assert.deepEqual(data.series.rows.map(([, a, b, c, total]) => a + b + c - total), [20, 0, 0, 0]);
const ctx = { window: {} };
vm.runInNewContext(read('dist/grand-air-war-v77-campaigns.js'), ctx);
const dossier = ctx.window.GrandAirWarV77Campaigns.campaigns.find(item => item.id === 'malta');
const spotter = dossier.moments.find(item => item.date === '1942-03-07');
assert.match(spotter.title, /HMS Eagle/);
assert.match(spotter.summary, /first delivery was Calendar on 20 April/);
assert.equal(dossier.end, '1942-11');
assert.match(read('dist/grand-air-war-v80-core.js'), /c\.id==="malta".*\.\/malta\.html/);
console.log('PASS Malta: 16 dated cases, source graph, carrier correction and scoped measures');
