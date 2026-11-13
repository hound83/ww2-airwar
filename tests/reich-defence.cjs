'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const data = JSON.parse(read('research/transcriptions/reich-defence-1943-1945.json'));
const operations = JSON.parse(read('research/transcriptions/operations-january-june-1944.json'));
const archive = new Map(operations.records.map(row => [row.id, row]));
const sources = { ...operations.sources, ...data.sources };
const metrics = { ...operations.metrics, ...data.extraMetrics };
const byId = new Map(data.cases.map(item => [item.id, item]));
assert.equal(data.schema, 1);
assert.equal(byId.size, 13);
assert.equal(data.cases.length, byId.size);
assert.deepEqual(data.cases.map(item => item.date), data.cases.map(item => item.date).sort());
for (const item of data.cases) {
  assert.match(item.date, /^19\d{2}-\d{2}-\d{2}$/);
  assert.ok(!item.endDate || item.endDate > item.date, item.id);
  assert.ok(['day', 'night', 'both'].includes(item.mode));
  assert.ok(item.lat > 46 && item.lat < 55 && item.lng > 5 && item.lng < 16);
  assert.ok(item.extra?.length || item.records?.length, item.id);
  for (const id of item.refs || []) assert.match(sources[id].url, /^https:\/\//);
  assert.equal(new Set(item.records || []).size, item.records?.length || 0, item.id);
  for (const id of item.records || []) {
    const row = archive.get(id);
    assert.ok(row, id);
    assert.ok(row.date >= item.date && row.date <= (item.endDate || item.date), id);
  }
  for (const row of item.extra || []) {
    assert.match(sources[row.source].url, /^https:\/\//);
    assert.ok(row.locator && row.note);
    for (const [key, value] of Object.entries(row.metrics)) {
      assert.ok(metrics[key] && Number.isInteger(value) && value >= 0, key);
    }
    if (row.group === 'command') {
      const m = row.metrics;
      assert.equal(m.enemyDestroyed, m.enemyMissing + m.airCombatDestroyed + (m.groundBombDestroyed || 0));
      assert.equal(m.enemyDamaged, m.airCombatDamaged + (m.groundBombDamaged || 0));
    }
  }
}
assert.deepEqual(byId.get('double-strike').extra.map(row => row.metrics.lost), [60, 24, 36]);
assert.equal(byId.get('berlin-march').extra[0].metrics.enemyDestroyed, 69);
assert.equal(byId.get('leuna-november').extra[2].metrics.enemyDestroyed, 142);
assert.equal(byId.get('leuna-november').extra[2].metrics.airCombatDestroyed, 97);
assert.equal(byId.get('nuremberg').extra[0].metrics.attacked, 710);
assert.equal(archive.get('raf-6-17385').metrics.attacked, 616);
assert.equal(byId.get('oil-may').extra[0].metrics.dispatched, 935);
assert.equal(archive.get('us8-1944-05-12-353').metrics.dispatched, 886);
assert.equal(byId.get('munich').records.filter(id => id.includes('42-')).length, 2);
assert.match(read('dist/grand-air-war-v80-core.js'), /reichdefense.*reich-defence\.html/);
assert.match(read('dist/grand-air-war-v80-core.js'), /schweinfurt.*reich-defence\.html#black-thursday/);
console.log('PASS Reich defence: 13 dated cases, source graph, command scopes and incompatible tallies');
