#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'research', 'transcriptions', 'airfields-netherlands-rce-1936-1945.geojson'), 'utf8'));

assert.equal(data.type, 'FeatureCollection');
assert.equal(data.metadata.source_records, 191);
assert.equal(data.features.length, 101);
assert.equal(data.metadata.unique_source_names, 64);
assert.match(data.metadata.license, /Public domain/);

const ids = new Set();
for (const feature of data.features) {
  assert.ok(!ids.has(feature.id), `duplicate ${feature.id}`);
  ids.add(feature.id);
  assert.ok(['Polygon', 'MultiPolygon'].includes(feature.geometry.type));
  assert.ok(feature.properties.active_from_year <= 1945);
  assert.ok(feature.properties.active_until_year >= 1936);
  assert.equal(feature.properties.date_precision, 'year');
  assert.equal(feature.properties.armed_force, null);
  assert.equal(feature.properties.wartime_unit, null);
}
assert.ok(data.features.some(f => f.properties.name === 'Deelen'));
assert.ok(data.features.some(f => f.properties.name === 'Gilze-Rijen'));
console.log('RCE WWII-era airfield provenance, dates and geometry: PASS');
