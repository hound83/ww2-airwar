"use strict";
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const {version, chapters, sources} = JSON.parse(read("research/transcriptions/europe-chapters.json"));
const balance = JSON.parse(read("research/transcriptions/operational-balance.json"));
const context = {window: {}};
for (const file of ["grand-air-war-v77-campaigns.js", "grand-air-war-v80-studies.js"]) {
  vm.runInNewContext(read("dist/" + file), context, {filename: file});
}
const campaigns = new Map(context.window.GrandAirWarV77Campaigns.campaigns.map(c => [c.id, c.name]));
const studies = context.window.AtlasCampaignStudies;
const esc = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const anchor = (url, label) => '<a href="' + esc(url) + '">' + esc(label) + '</a>';
const chapterLink = c => anchor("#" + c.id, c.title);
function origin(href, chapter) {
  const url = new URL(href, "https://atlas.invalid/");
  url.searchParams.set("fromChapter", chapter);
  return "." + url.pathname + url.search + url.hash;
}
function citation(ref) {
  const [key, locator] = ref.split("|");
  if (key.startsWith("campaign.")) {
    const study = studies[key.slice(9)];
    return anchor(study.source, study.locator);
  }
  if (key.startsWith("balance.")) {
    const source = balance.sources[key.slice(8)];
    if (!locator) throw Error("Missing source locator for " + key);
    return anchor(source.url, source.title + " · " + locator);
  }
  const [name, position, url] = sources[key];
  return anchor(url, name + " · " + position);
}
function cases(c) {
  return c.campaigns.map(id => {
    const study = studies[id];
    const query = new URLSearchParams({campaign:id, event:study.date});
    if (study.episode) query.set("episode", study.episode);
    const record = study.href || "grand-air-war-v80.html?" + query + "#moment-detail";
    const dossier = "grand-air-war-v80.html?campaign=" + id + "#campaign-dossier";
    return '<li><strong>' + anchor(origin(dossier,c.id), campaigns.get(id)) +
      '</strong><span>' + anchor(origin(record,c.id), study.label) + ' · <time datetime="' + study.date + '">' +
      new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeZone:"UTC"}).format(new Date(study.date)) + '</time></span></li>';
  }).join("\n");
}
function article(c, i) {
  const sections = c.passages.map(([heading, content, refs]) =>
    '<section class="passage"><h3>' + esc(heading) + '</h3><p>' + esc(content) + '</p><details><summary>Sources</summary><ul>' +
    refs.map(ref => "<li>" + citation(ref) + "</li>").join("") + "</ul></details></section>").join("\n");
  const extra = c.records.length ? '<h3>Units, maps and records</h3><ul class="records">' +
    c.records.map(([url,label]) => "<li>" + anchor(origin(url,c.id),label) + "</li>").join("") + "</ul>" : "";
  const previous = i ? anchor("#"+chapters[i-1].id,"Previous · "+chapters[i-1].title) : anchor("#contents","All chapters");
  const next = i < chapters.length-1 ? anchor("#"+chapters[i+1].id,"Next · "+chapters[i+1].title) : anchor("#contents","Return to all chapters");
  return '<article id="' + c.id + '" tabindex="-1"><header><p class="period">Chapter ' + (i+1) + ' · ' + esc(c.period) +
    '</p><h2>' + esc(c.title) + '</h2><p class="standfirst">' + esc(c.intro) + '</p></header>\n' + sections +
    '<aside class="evidence" aria-label="Evidence for '+esc(c.title)+'"><h3>Campaign dossiers and dated cases</h3><ul class="cases">'+cases(c)+'</ul>'+extra+'</aside>' +
    (c.next ? '<p class="bridge">' + esc(c.next) + '</p>' : '') + '<nav class="step" aria-label="Chapter navigation">' + previous + next + '</nav></article>';
}
const toc = chapters.map((c,i) => '<li><a href="#'+c.id+'"><span>'+esc(c.period)+'</span>'+esc(c.title)+'</a></li>').join("");
const coast = read("dist/europe-coast.svg");
const coastline = coast.slice(coast.indexOf("<rect "),coast.indexOf("</svg>"));
const pins = chapters.map((c,i) => {
  const [name,lon,lat] = c.place, x = ((lon+16)*480/72).toFixed(1), y = ((72-lat)*9).toFixed(1);
  const left = ["reach","eastern-front"].includes(c.id);
  return '<a href="#'+c.id+'" aria-label="'+esc(name+' · '+c.title)+'" transform="translate('+x+' '+y+')"><title>'+esc(name+' · '+c.title)+'</title><circle class="hit" r="13"/><circle class="pin" r="4.3"/><text x="'+(left?-8:8)+'" y="'+(c.id==="last-winter"?-7:4)+'" text-anchor="'+(left?"end":"start")+'">'+esc(name)+'</text></a>';
}).join("");
const html = '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Seven illustrated chapters follow the European air war from the Spanish Civil War to Berlin, with campaign dossiers, dated maps and source records."><title>The air war across Europe · Grand Air War Atlas v'+version+'</title><link rel="stylesheet" href="./dist/europe.css"></head><body>'+
'<a class="skip" href="#contents">Skip to chapters</a><header class="mast"><nav class="wrap"><a href="./grand-air-war-v80.html">European Air War Atlas v'+version+'</a><a href="./grand-air-war-v80.html#campaign-map">Campaign map</a></nav></header>'+
'<main class="wrap"><header class="lead"><div><p class="period">Europe &amp; the Mediterranean · 1936–1945</p><h1>The air war<br>across Europe</h1><p>Who could cross a strait, hold an island or keep an army supplied? Follow seven chapters from Spain to Berlin through the records of the people who flew, and of those waiting on the ground.</p>'+anchor("#"+chapters[0].id,"Begin in Spain →")+'</div><figure><svg class="places" viewBox="0 0 480 360" aria-labelledby="map-title"><title id="map-title">Seven places in the chapters</title>'+coastline+pins+'</svg><figcaption>Select a place to open its chapter. Coastlines from '+anchor("https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/","Natural Earth")+'.</figcaption></figure></header>'+
'<div class="layout"><nav id="contents" tabindex="-1" aria-label="Contents"><h2>Chapters</h2><ol>'+toc+'</ol></nav><div>'+chapters.map(article).join("\n")+'</div></div></main></body></html>\n';
fs.writeFileSync(path.join(root,"europe.html"),html);
const titles = Object.fromEntries(chapters.map(c=>[c.id,c.title]));
const byCampaign = Object.fromEntries(chapters.flatMap(c=>c.campaigns.map(id=>[id,c.id])));
fs.writeFileSync(path.join(root,"dist/europe-index.js"),"/* Generated from europe-chapters.json. */\nwindow.AtlasEurope = "+JSON.stringify({titles,byCampaign},null,2)+";\n");
