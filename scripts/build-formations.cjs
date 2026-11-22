"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const {campaigns, sources, units} = JSON.parse(fs.readFileSync(path.join(root, "research/transcriptions/formation-histories.json"), "utf8"));
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[c]));
const slug = value => value.normalize("NFKD").replace(/[\u0300-\u036f’']/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
const link = (href, label) => '<a href="' + esc(href) + '">' + esc(label) + '</a>';
const stationId = place => "station-" + slug(place);
const dossier = id => link("./grand-air-war-v80.html?campaign=" + id + "#campaign-dossier", campaigns[id].name + " campaign dossier");
const campaignLink = id => link("#campaign-" + id, campaigns[id].name);
const unitLink = u => link("#unit-" + u.id, u.name);
const cite = row => link(sources[row.source].url, sources[row.source].title + " · " + row.locator);
const dateFormat = new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric",timeZone:"UTC"});
const monthFormat = new Intl.DateTimeFormat("en-GB",{month:"long",year:"numeric",timeZone:"UTC"});
function displayDate(value) {
  const [start,end] = value.split("/");
  if (end) {
    const finish = end.length === 2 ? start.slice(0,8) + end : start.slice(0,5) + end;
    return displayDate(start) + " – " + displayDate(finish);
  }
  if (/^\d{4}-\d\d-\d\d$/.test(start)) return dateFormat.format(new Date(start+"T12:00:00Z"));
  if (/^\d{4}-\d\d$/.test(start)) return monthFormat.format(new Date(start+"-01T12:00:00Z"));
  return start;
}
const stationRows = new Map();
for (const unit of units) for (const row of unit.stations) {
  if (!stationRows.has(row.place)) stationRows.set(row.place, []);
  stationRows.get(row.place).push({unit, row});
}
const stations = [...stationRows.keys()].sort((a,b) => a.localeCompare(b, "en"));
const sortedUnits = [...units].sort((a,b) => a.name.localeCompare(b.name, "en", {numeric:true}));
const list = (items, cls = "") => '<ul class="' + cls + '">' + items.map(item => "<li>" + item + "</li>").join("\n") + "</ul>";
function panel(id, title, body, eyebrow = "") {
  return '<article id="' + id + '" class="history-view" data-view><header>' + (eyebrow ? '<p class="kicker">' + esc(eyebrow) + '</p>' : "") + '<h1 tabindex="-1">' + esc(title) + '</h1></header>\n' + body + '</article>';
}
function campaignPanel(id, c) {
  const members = sortedUnits.filter(u => u.campaigns.includes(id));
  return panel("campaign-" + id, c.name, '<p class="lead">' + esc(c.question) + '</p><p>' + dossier(id) + '</p><h2>Formations</h2>' +
    list(members.map(u => unitLink(u) + '<span>' + esc(u.role) + '</span>'), "directory") , c.period);
}
const balanceStudies = JSON.parse(fs.readFileSync(path.join(root,"research/transcriptions/operational-balance.json"),"utf8")).studies;
function unitPanel(u) {
  const related = balanceStudies.filter(s=>s.units.includes(u.id)).map(s=>link("./operational-balance.html#"+s.id,s.title));
  const balance = related.length ? "<h2>Operational balance</h2>"+list(related,"station-links") : "";
  const events = u.events.map(e => '<li><p class="event-date">' + esc(displayDate(e.date)) + '</p><div><h3>' + esc(e.place) + '</h3><p>' + esc(e.text) + '</p><p class="citation">' + cite(e) + '</p></div></li>');
  const stationList = u.stations.length ? list(u.stations.map(s => link("#" + stationId(s.place), s.place) + ' · ' + esc(s.period)), "station-links") : '<p>The air-army sources cited here locate operations across a front. They give no single operating airfield for the entire formation.</p>';
  return panel("unit-" + u.id, u.name, '<p class="lead">' + esc(u.contribution) + '</p><nav class="crumbs" aria-label="Related campaign histories">' + u.campaigns.map(campaignLink).join(" · ") + '</nav><h2>Operations and evidence</h2><ol class="events">' + events.join("\n") +
    '</ol><aside class="limit"><h2>What remains uncertain</h2><p>' + esc(u.limit) + '</p></aside><h2>Operating stations</h2>' + stationList +
    balance + '<h2>Read the campaign record</h2><p>' + link("./" + u.href, "Open the campaign evidence") + '</p><p class="crumbs">' + u.campaigns.map(dossier).join(" · ") + '</p>', u.role);
}
function stationPanel(place) {
  return panel(stationId(place), place, '<h2>Formations recorded here</h2>' + list(stationRows.get(place).map(({unit,row}) => unitLink(unit) + '<span>' + esc(row.period) + '</span><p class="citation">' + cite(row) + '</p>'), "directory"), "Operating station");
}
const directory = panel("directory", "Formation histories", '<p class="lead">Follow the people and units behind the campaign maps, from their operating stations to the missions they flew and the effects recorded by witnesses.</p><h2>Browse by campaign</h2>' +
  list(Object.entries(campaigns).map(([id,c]) => campaignLink(id) + '<span>' + esc(c.question) + '</span>'), "directory campaign-grid") +
  '<h2>Browse by name</h2><p class="index-links">' + link("#formations", "All " + units.length + " formations") + link("#stations", "All " + stations.length + " operating stations") + '</p>');
const pages = [directory, panel("formations","Formation index",list(sortedUnits.map(u => unitLink(u) + '<span>' + esc(u.role) + '</span>'), "directory campaign-grid")),
  panel("stations","Operating station index",list(stations.map(s => link("#" + stationId(s),s)), "directory station-grid")),
  ...Object.entries(campaigns).map(([id,c]) => campaignPanel(id,c)), ...units.map(unitPanel), ...stations.map(stationPanel)];
const html = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Documented formation histories, operating stations and the effects of air operations in the European air war."><title>Formation histories · European Air War Atlas</title><link rel="stylesheet" href="./dist/operations-1944.css"><link rel="stylesheet" href="./dist/formations.css"><script defer src="./dist/formations.js"></script></head><body>\n<a class="skip" href="#content">Skip to history</a><header class="mast"><nav class="wrap" aria-label="Atlas navigation">' +
  link("./grand-air-war-v80.html","European Air War Atlas") + link("#directory","Formation histories") + link("#formations","Formations A–Z") + link("#stations","Stations A–Z") + '</nav></header><main id="content" class="wrap history" tabindex="-1">\n' +
  pages.join("\n") + '\n<p id="unknown" hidden>This address does not match a formation, campaign or station. Browse the directory above.</p></main></body></html>\n';
fs.writeFileSync(path.join(root, "formations.html"), html);
