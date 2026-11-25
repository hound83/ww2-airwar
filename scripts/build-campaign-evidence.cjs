"use strict";

const fs = require("node:fs");
const path = require("node:path");

const regions = {
  opening: ["spain", "poland", "norway", "france1940", "britain"],
  dieppe: ["dieppe"],
  med: ["malta", "sicily", "italy"],
  east: ["barbarossa", "stalingrad", "kursk", "bagration", "berlin"],
  west: ["normandy", "marketgarden", "bodenplatte"],
  reich: ["reichdefense", "schweinfurt", "bigweek"]
};
const originalSides = {
  Republican: ["brunete-r"], Nationalist: ["brunete-n"],
  Axis: ["france-jg26","britain-lf2","britain-lf2-hq","stalingrad-ro","berlin-raid-first","sicily-gruppen","sicily-stab","sicily-italian","citadel-gruppen","kursk-hungarian-brigade","kursk-viii-strike-gruppen","italy-lf2","normandy-reinforcements","bagration-german-fighters","bagration-german-assault","bagration-german-bombers","market-response","bodenplatte-parents"],
  Allied: ["warsaw-pursuit","narvik-raf","britain-11g","malta-fighter","barbarossa-14sad","dieppe-allied","sicily-211","sicily-xii","sicily-211-wings","kursk-16va-divisions","kursk-2va-divisions","kursk-17va-divisions","schweinfurt-b17","argument-rearguard","bagration-air-armies","bagration-soviet-cover","bagration-soviet-day-regiments","bagration-3va-divisions","bagration-1va-divisions","bagration-4va-divisions","bagration-6va-divisions","bagration-16va-divisions","bagration-polish-regiments","berlin-va"]
};

function totals(populations, side) {
  const returns = populations.filter(p => p.side === side);
  const rows = returns.flatMap(p => p.members);
  return {
    lists: returns.length, named: rows.length, located: rows.filter(m => m.place || m.stations.length).length,
    mapped: rows.filter(m => m.stations.length).length, held: rows.filter(m => m.strength != null).length,
    ready: rows.filter(m => m.serviceable != null).length, activity: rows.filter(m => m.activity).length
  };
}

function addMembers(population, additions) {
  const names = new Set(population.members.map(m => m.unit));
  for (const raw of additions) {
    if (!raw.unit || names.has(raw.unit)) throw Error("Duplicate or empty unit in "+population.id+": "+raw.unit);
    names.add(raw.unit);
    population.members.push({parent:"", place:"", strength:null, serviceable:null, stations:[],
      source:population.source, locator:population.locator, activity:"", activitySource:"", activityLocator:"", ...raw});
  }
}

function csv(rows) {
  const quote = value => '"' + String(value ?? "").replaceAll('"','""') + '"';
  return rows.map(row => row.map(quote).join(",")).join("\n")+"\n";
}

module.exports = function buildEvidence(campaigns, populations, stations, read, root) {
  for (const [side,ids] of Object.entries(originalSides)) {
    for (const id of ids) populations.get(id).side = side;
  }
  const metrics = ["lists","named","located","mapped","held","ready","activity"];
  const coverageRows = [["campaign","force_side", ...metrics.flatMap(m => ["v10_1_"+m,"v10_2_"+m]), "effort_evidence","loss_evidence","effect_evidence"]];
  const missionRows = [["campaign","date","case","mission","observed_effect","evidence_limit","source","source_type","source_url","locator"]];
  const idsSeen = new Set();
  for (const [file,ids] of Object.entries(regions)) {
    const data = JSON.parse(read("v102-"+file+".json"));
    if (Object.keys(data.campaigns).sort().join() !== [...ids].sort().join()) throw Error("Campaign set in "+file);
    for (const [id,s] of Object.entries(data.stations || {})) {
      if (stations[id] && JSON.stringify(s) !== JSON.stringify(stations[id])) throw Error("Conflicting historical station "+id);
      stations[id] = s;
    }
    for (const [id,entry] of Object.entries(data.campaigns)) {
      const c = campaigns[id], sides = id==="spain" ? ["Republican","Nationalist"] : ["Allied","Axis"];
      if (!c || idsSeen.has(id) || c.populations.some(p=>!sides.includes(p.side))) throw Error("Unclassified campaign/return "+id);
      idsSeen.add(id);
      const before = Object.fromEntries(sides.map(side=>[side,totals(c.populations,side)]));
      for (const raw of entry.populations) {
        let p;
        if (raw.extend) {
          p = c.populations.find(p=>p.id===raw.extend);
          if (!p || raw.side!==p.side) throw Error("Invalid extension: "+raw.extend);
          if (raw.note) p.note = raw.note;
        } else {
          if (!sides.includes(raw.side) || !raw.id || populations.has(raw.id)) throw Error("Invalid new population: "+raw.id);
          p = {...raw,members:[]}; populations.set(p.id,p); c.populations.push(p);
        }
        addMembers(p,raw.members);
      }
      c.cases = entry.cases;
      if (entry.allocations) c.allocations = entry.allocations;
      c.coverage = {};
      for (const side of sides) {
        const after = totals(c.populations,side), observations = entry.evidenceBySide[side];
        if (!observations?.effort || !observations.losses || !observations.effect) throw Error("Evidence by side: "+id+" "+side);
        c.coverage[side] = {before:before[side],after,...observations};
        coverageRows.push([id,side,...metrics.flatMap(m=>[before[side][m],after[m]]),observations.effort,observations.losses,observations.effect]);
      }
      if (!c.cases.length) throw Error("No case for "+id);
      for (const k of c.cases) {
        for (const ref of k.rosterIds || []) if (!c.populations.some(p=>p.id===ref)) throw Error("Unknown case roster: "+id+" / "+ref);
        for (const source of k.sources) missionRows.push([id,k.date,k.title,k.mission,k.effect,k.limit,source.name,source.kind,source.url,source.locator]);
      }
    }
  }
  if (idsSeen.size !== Object.keys(campaigns).length) throw Error("Missing campaign evidence");
  const dest = path.join(root,"research/exports");
  fs.mkdirSync(dest,{recursive:true});
  fs.writeFileSync(path.join(dest,"campaign-coverage.csv"),csv(coverageRows));
  fs.writeFileSync(path.join(dest,"campaign-missions.csv"),csv(missionRows));
};
