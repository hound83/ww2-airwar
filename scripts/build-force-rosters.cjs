"use strict";
const fs = require("node:fs");
const path = require("node:path");
const {csv} = require("../dist/force-rosters-shared.js");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, "research/transcriptions", file), "utf8");
const json = file => JSON.parse(read(file));
function readCsv(file) {
  const input = read(file).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const rows = [];
  let row = [], field = "", quoted = false;
  for (let i=0; i<input.length; i++) {
    const ch=input[i];
    if (ch === '"') {
      if (quoted && input[i+1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (ch === "," || ch === "\n")) {
      row.push(field); field = "";
      if (ch === "\n") { rows.push(row); row=[]; }
    } else field += ch;
  }
  if (quoted) throw Error("Unclosed quotation in "+file);
  if (row.length || field) { row.push(field); rows.push(row); }
  const headers = rows.shift();
  return rows.map(fields => {
    if (fields.length !== headers.length) throw Error("Column mismatch in "+file);
    return Object.fromEntries(headers.map((header,i) => [header,fields[i]]));
  });
}
const campaigns = json("campaign-force-coverage.json");
const geography = json("deployment-stations.json");
const stations = geography.stations;
const metadata = json("deployment-roster-context.json");
const populations = new Map();
for (const c of Object.values(campaigns)) c.populations = [];
function add(p, campaign) {
  if (populations.has(p.id) || !campaigns[campaign]) throw Error("Invalid roster: "+p.id);
  populations.set(p.id,p);
  campaigns[campaign].populations.push(p);
}
const members = new Map();
for (const prefix of ["deployment-benchmark","deployment-eastern"]) {
  const sourceRows = readCsv(prefix+"-populations.csv");
  for (const r of sourceRows) {
    const extra = metadata[r.id] || {};
    const note = extra.note || r.interpretation;
    add({id:r.id, label:extra.label || r.scope, date:r.reporting_date, force:r.force, echelon:r.echelon,
      parentPopulation:extra.parentPopulation || "", parentUnit:extra.parentUnit || "",
      event:r.population_event, scope:r.scope, total:Number(r.reported_or_counted), basis:r.count_basis,
      source:r.source_url, locator:r.locator, sourceClass:r.source_class, note, members:[]}, r.campaign);
  }
  for (const r of readCsv(prefix+"-members.csv")) {
    const p = populations.get(r.population), key = r.population+"|"+r.unit;
    if (!p || members.has(key)) throw Error("Invalid membership: "+key);
    const m = {unit:r.unit, parent:r.parent_or_sector, place:r.base_or_area,
      strength:r.on_strength==="" ? null : Number(r.on_strength), serviceable:r.serviceable==="" ? null : Number(r.serviceable),
      stations:[], source:p.source, locator:p.locator, activity:"", activitySource:"", activityLocator:""};
    p.members.push(m); members.set(key,m);
  }
  for (const r of sourceRows) {
    if (populations.get(r.id).members.length !== Number(r.members_in_extract)) throw Error("Member count: "+r.id);
  }
}
// The five wing identities are the distinct direct parents in the published 211 Group table.
const sq = populations.get("sicily-211");
const wings = [...new Set(sq.members.map(m=>m.parent))];
add({...sq,id:"sicily-211-wings",label:"Five Commonwealth wings",echelon:"wing",scope:"Five named wings under No. 211 Group",
  total:wings.length,note:"The five wings contain 23 named squadrons. US units and No. 6 Squadron are listed separately under the group.",
  members:wings.map(unit=>({unit,parent:"No. 211 Group",place:"",strength:null,serviceable:null,stations:[],source:sq.source,locator:sq.locator,activity:"",activitySource:"",activityLocator:""}))},"sicily");
for (const m of populations.get("sicily-211-wings").members) members.set("sicily-211-wings|"+m.unit,m);
for (const detail of geography.members) {
  const m = members.get(detail.population+"|"+detail.unit);
  if (!m) throw Error("Unmatched station/evidence: "+detail.population+"|"+detail.unit);
  for (const id of detail.stationIds || []) if (!stations[id]) throw Error("Unknown station: "+id);
  if (detail.place) m.place = detail.place;
  if (detail.stationIds) m.stations = detail.stationIds;
  for (const key of ["source","locator","activity","activitySource","activityLocator"]) {
    if (detail[key]) m[key] = detail[key];
  }
}
for (const [id,note] of Object.entries(geography.notes || {})) {
  if (!populations.has(id)) throw Error("Unknown station note: "+id);
  populations.get(id).geographyNote = note;
}
require("./build-campaign-evidence.cjs")(campaigns,populations,stations,read,root);
for (const [id,c] of Object.entries(campaigns)) {
  if (!c.populations.length) throw Error("Missing dated comparison for "+id);
  for (const p of c.populations) {
    if (!Number.isInteger(p.total) || p.total<=0 || p.members.length>p.total || !p.source || !p.locator) throw Error("Invalid denominator or source: "+p.id);
  }
}
require("./build-operational-effects.cjs")(campaigns);
const data = {version:"10.2", campaigns, stations};
fs.writeFileSync(path.join(root,"dist/force-rosters-data.js"),"/* Generated by scripts/build-force-rosters.cjs. */\nwindow.AtlasForceRosters = "+JSON.stringify(data)+";\n");
const all = Object.entries(campaigns).flatMap(([campaign,c])=>c.populations.map(population=>({campaign,population,members:population.members})));
fs.mkdirSync(path.join(root,"research/exports"),{recursive:true});
fs.writeFileSync(path.join(root,"research/exports/force-rosters.csv"),csv(all,stations));
