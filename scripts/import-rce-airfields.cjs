#!/usr/bin/env node
'use strict';

// Import factual, public-domain Dutch historical airfield polygons from RCE.
// Usage: node scripts/import-rce-airfields.cjs /path/to/wfs-featurecollection.json
// Source: https://services.rce.geovoorziening.nl/landschapsatlas/wfs
// Metadata/license: https://data.overheid.nl/dataset/81058-vliegvelden-in-nederland

const fs = require('node:fs');
const path = require('node:path');

const input = process.argv[2];
if (!input) {
  console.error('Provide a local WFS FeatureCollection JSON snapshot as the first argument.');
  process.exit(2);
}

const raw = JSON.parse(fs.readFileSync(input, 'utf8'));
if (raw.type !== 'FeatureCollection' || !Array.isArray(raw.features)) {
  throw new Error('Expected a GeoJSON FeatureCollection');
}

const start = 1936;
const end = 1945;
const output = path.resolve(__dirname, '..', 'research', 'transcriptions', 'airfields-netherlands-rce-1936-1945.geojson');
const seen = new Set();

function verifyPosition(value) {
  if (typeof value[0] === 'number') {
    const [lon, lat] = value;
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < 2 || lon > 9 || lat < 50 || lat > 54) {
      throw new Error(`Unexpected Netherlands coordinate: ${lon}, ${lat}`);
    }
    return;
  }
  for (const child of value) verifyPosition(child);
}

const features = raw.features.filter((feature) => {
  const p = feature.properties || {};
  return Number.isInteger(p.actief_van) && Number.isInteger(p.actief_tot) &&
    p.actief_van <= end && p.actief_tot >= start;
}).map((feature) => {
  const p = feature.properties;
  if (!p.naam || !feature.geometry || !['Polygon', 'MultiPolygon'].includes(feature.geometry.type)) {
    throw new Error(`Unexpected or incomplete source airfield: ${feature.id}`);
  }
  if (seen.has(feature.id)) throw new Error(`Repeated source feature id: ${feature.id}`);
  seen.add(feature.id);
  verifyPosition(feature.geometry.coordinates);
  return {
    type: 'Feature',
    id: `rce-${feature.id}`,
    geometry: feature.geometry,
    properties: {
      name: p.naam,
      facility_type_original: p.type,
      usage_original: p.gebruik,
      runway_type_original: p.type_baan,
      icao_code: p.icao_code,
      active_from_year: p.actief_van,
      active_until_year: p.actief_tot,
      date_precision: 'year',
      source_record_id: feature.id,
      source_id: 'RCE-LANDSCHAPSATLAS-VLIEGVELDEN',
      evidence_status: 'source_compiled',
      armed_force: null,
      wartime_unit: null
    }
  };
}).sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'nl') ||
  a.properties.active_from_year - b.properties.active_from_year || a.id.localeCompare(b.id));

const geojson = {
  type: 'FeatureCollection',
  metadata: {
    title: 'Netherlands airfield footprint phases overlapping the Atlas period, 1936–1945',
    publisher: 'Rijksdienst voor het Cultureel Erfgoed (RCE), Netherlands',
    source_id: 'RCE-LANDSCHAPSATLAS-VLIEGVELDEN',
    source_url: 'https://services.rce.geovoorziening.nl/landschapsatlas/wfs?service=WFS&version=2.0.0&request=GetFeature&typeNames=landschapsatlas:vliegvelden&outputFormat=application%2Fjson&srsName=EPSG:4326',
    catalog_url: 'https://data.overheid.nl/dataset/81058-vliegvelden-in-nederland',
    license: 'Public domain, as identified by the official Dutch open-data catalogue',
    snapshot_timestamp: raw.timeStamp || null,
    source_records: raw.features.length,
    filtered_records: features.length,
    unique_source_names: new Set(features.map(f => f.properties.name)).size,
    coordinate_system: 'EPSG:4326 (longitude, latitude)',
    temporal_filter: 'active_from_year <= 1945 and active_until_year >= 1936',
    cautions: [
      'Each feature is a dated footprint phase, not a unique airfield and not a unit deployment.',
      'Start and end are calendar years only: do not invent month/day precision.',
      'The historical-use field does not establish air-arm affiliation or unit strength.',
      'A feature overlapping the Atlas period does not necessarily operate throughout WWII.'
    ]
  },
  features
};

// Keep the source-equivalent shapes intact while avoiding multi-megabyte
// whitespace inflation. Consumers can pretty-print an individual feature.
fs.writeFileSync(output, JSON.stringify(geojson) + '\n', 'utf8');
console.log(`Wrote ${features.length} dated footprint records for ${geojson.metadata.unique_source_names} names to ${output}`);
