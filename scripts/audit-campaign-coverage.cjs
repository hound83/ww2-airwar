#!/usr/bin/env node
"use strict";
// Reproduce the v10.0 dossier inventory from the same data and Normandy override as the explorer.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const ctx = vm.createContext({window: {}});
for (const file of ["dist/grand-air-war-v77-campaigns.js", "dist/normandy-1944-story.js", "dist/operational-balance-index.js"]) {
  vm.runInContext(read(file), ctx, {filename: file});
}
const {GrandAirWarV77Campaigns: dossiers, AtlasBalanceLinks: balances} = ctx.window;
const histories = JSON.parse(read("research/transcriptions/formation-histories.json")).units;
const register = JSON.parse(read("research/transcriptions/campaign-evidence-audit-2026-11-12.json")).series;
function monthIndex(value) {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month;
}
const csv = value => '"' + String(value).replaceAll('"', '""') + '"';
const rows = dossiers.campaigns.map(c => {
  const archive = register.filter(s => s.campaign === c.id);
  return {
    campaign: c.id, first_month: c.start, last_month: c.end,
    campaign_months_inclusive: monthIndex(c.end) - monthIndex(c.start) + 1,
    months_with_dossier_episode: new Set(c.moments.map(e => e.date.slice(0,7))).size,
    dossier_episodes: c.moments.length, dossier_facts: c.facts.length,
    facts_with_explicit_side: c.facts.filter(f => f.side).length,
    facts_with_explicit_measure: c.facts.filter(f => f.measure).length,
    participant_labels: c.participants.length,
    formation_histories: histories.filter(h => h.campaigns.includes(c.id)).length,
    balance_study_links: (balances[c.id] || []).length,
    register_series: archive.length,
    register_rows: archive.reduce((total, s) => total + s.rows.length, 0),
    register_side_tags: [...new Set(archive.map(s => s.side))].sort().join(" | "),
    register_recorded_side_tags: [...new Set(archive.filter(s => s.status === "recorded").map(s => s.side))].sort().join(" | ")
  };
});
const output = [Object.keys(rows[0]), ...rows.map(Object.values)].map(row => row.map(csv).join(",")).join("\n") + "\n";
const target = "research/transcriptions/atlas-v10-coverage-inventory.csv";
if (process.argv.includes("--check")) {
  if (read(target).replaceAll("\r\n","\n") !== output) throw new Error("Inventory differs from " + target);
  console.log("Matched the saved inventory for " + rows.length + " campaign dossiers.");
} else {
  process.stdout.write(output);
}
