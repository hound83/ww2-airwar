"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname,"..");
const read = file => fs.readFileSync(path.join(root,file),"utf8");
const {version,chapters} = JSON.parse(read("research/transcriptions/europe-chapters.json"));
const context = {window:{}};
for (const file of ["grand-air-war-v77-campaigns.js","europe-index.js"]) vm.runInNewContext(read("dist/"+file),context);
const {byCampaign,titles} = context.window.AtlasEurope;
const ids = chapters.map(c=>c.id);
assert.equal(new Set(ids).size,7);
assert.equal(chapters.flatMap(c=>c.campaigns).length,20);
assert.deepEqual(Object.keys(byCampaign).sort(),context.window.GrandAirWarV77Campaigns.campaigns.map(c=>c.id).sort().join(",").split(","));
const page = read("europe.html");
assert.ok(page.includes("Atlas v"+version) && read("grand-air-war-v80.html").includes("Live Atlas v"+version));
const linkedBalances = new Set();
for (const chapter of chapters) {
  assert.equal(titles[chapter.id],chapter.title);
  assert.ok(page.includes('<article id="'+chapter.id+'"'));
  assert.ok(chapter.passages.every(p=>p[1].length>200 && p[2].length>0));
  for (const id of chapter.campaigns) assert.equal(byCampaign[id],chapter.id);
  for (const [route] of chapter.records) {
    const url = new URL(route,"https://example.test");
    const file = url.pathname.slice(1);
    assert.ok(read(file).includes("europe-return.js"),file);
    if (file==="operational-balance.html") {
      linkedBalances.add(url.hash);
      assert.ok(read(file).includes('id="'+url.hash.slice(1)+'"'));
    }
    if (file==="formations.html") assert.ok(read(file).includes('id="'+url.hash.slice(1)+'"'));
  }
}
assert.equal(linkedBalances.size,6);
for (const [,value] of page.matchAll(/href="([^"]+)"/g)) {
  const url = new URL(value.replaceAll("&amp;","&"),"https://atlas.test/europe.html");
  if (url.origin!=="https://atlas.test") { assert.equal(url.protocol,"https:");continue; }
  const route=url.pathname.slice(1);
  assert.ok(fs.existsSync(path.join(root,route)),route);
  if (route==="europe.html" && url.hash) assert.ok(page.includes('id="'+url.hash.slice(1)+'"'));
  if (url.searchParams.has("fromChapter")) {
    assert.ok(ids.includes(url.searchParams.get("fromChapter")));
    assert.ok(read(route).includes("europe-return.js"),route);
  }
}
console.log("PASS v10 chapter sources, 20 distinct dossier memberships, six linked balance studies and destination support");
