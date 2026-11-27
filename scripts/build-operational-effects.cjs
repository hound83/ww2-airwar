"use strict";

const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = file => JSON.parse(fs.readFileSync(path.join(root, "research/transcriptions", file), "utf8"));
const {sources, topics} = read("v11-operational-effects.json");
const audit = read("v11-dossier-audit.json");
const esc = value => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const link = (href, label) => '<a href="'+esc(href)+'">'+esc(label)+'</a>';
const download = (file, label) => '<a download href="./research/exports/'+file+'">'+esc(label)+'</a>';
const numbers = new Intl.NumberFormat("en-US");
const rosterMetrics = {named:"Named memberships",lists:"Dated lists",located:"Members with a place",mapped:"Members with a mapped station",held:"Members with strength recorded",ready:"Members with serviceability recorded",activity:"Members with an activity recorded"};

function page(title, intro, nav, content, downloads) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · European Air War Atlas v11.0</title>
<meta name="description" content="${esc(intro)}"><link rel="stylesheet" href="./dist/operational-effects.css"></head>
<body><a class="skip" href="#content">Skip to evidence</a>
<header><nav class="wrap top" aria-label="Atlas navigation">${link("./","European Air War Atlas")} ${link("./campaign-evidence.html","Missions and outcomes")} ${link("./forces.html","Dated forces")}</nav></header>
<main id="content" class="wrap"><div class="lead"><p class="edition">European Air War Atlas · v11.0</p><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>
<nav class="sections" aria-label="Browse this study">${nav}</nav>${content}
<footer>${downloads} ${link("./research/sources/atlas-v11-operational-effects.md","Research notes")}</footer></main></body></html>\n`;
}

function table(title, headers, rows) {
  return '<div class="scroll" tabindex="0" role="region" aria-label="'+esc(title)+'"><table><caption>'+esc(title)+'</caption><thead><tr>'+
    headers.map(s=>'<th scope="col">'+esc(s)+'</th>').join("")+'</tr></thead><tbody>'+rows.map(cells=>'<tr><th scope="row">'+cells[0]+'</th>'+cells.slice(1).map(s=>'<td>'+s+'</td>').join("")+'</tr>').join("")+'</tbody></table></div>';
}

function csv(file, rows) {
  const quote = value => '"'+String(value ?? "").replaceAll('"','""')+'"';
  fs.writeFileSync(path.join(root,"research/exports",file),rows.map(row=>row.map(quote).join(",")).join("\n")+"\n");
}

function renderTable(t, study, topic, observations) {
  const rows = t.rows.map(({period,values,note,derived={}})=>{
    if (values.length!==t.columns.length) throw Error("Observation width: "+t.title);
    const cells = values.map((value,i)=>{
      const col=t.columns[i], source=sources[col.source];
      if (!source || !study.sources.includes(col.source) || (value!==null && !Number.isFinite(value))) throw Error("Invalid observation in "+t.title);
      const calculation=derived[i] || "";
      const status=value===null?"unreported in this series":calculation?"calculated":"reported";
      observations.push([topic.id,study.id,study.beneficiary,t.title,t.scope,period,col.label,value,col.unit,
        status,calculation,source.name,source.kind,source.url,source.locator,note]);
      return value===null?'<abbr title="Unreported in this series">—</abbr>':calculation?'<abbr title="'+esc(calculation)+'">'+numbers.format(value)+'</abbr>':numbers.format(value);
    });
    return [esc(period),...cells,esc(note)];
  });
  const headers=["Period",...t.columns.map(c=>c.label+" ("+c.unit+")"),"Reading the return"];
  const refs=[...new Set(t.columns.map(c=>c.source))].map(id=>link(sources[id].url,sources[id].name));
  return table(t.title,headers,rows)+'<p class="scope">'+esc(t.scope)+' '+refs.join(" · ")+'</p>';
}

function renderStudy(study,topic,observations) {
  const figures=study.tables.map(t=>renderTable(t,study,topic,observations)).join("");
  const refs=study.sources.map(id=>{const s=sources[id];return '<li>'+link(s.url,s.name)+'<span>'+esc(s.kind)+' · '+esc(s.locator)+'</span></li>';}).join("");
  const dossierLinks=study.campaigns.map(id=>link("./campaign-evidence.html?campaign="+id,audit[id].name)).join(" · ");
  return `<article id="${esc(study.id)}"><p class="date">${esc(study.window)}</p><h3>${esc(study.title)}</h3>
<p class="who">${esc(study.beneficiary)}</p><p>${esc(study.finding)}</p><p>${esc(study.alternative)}</p>
<aside><strong>What the records leave open</strong><p>${esc(study.limit)}</p></aside>
<details class="series"><summary>Figures, dates and sources</summary>${figures}<h4>Witnesses and source passages</h4><ul class="sources">${refs}</ul></details>
<p class="related">Campaign evidence · ${dossierLinks}</p></article>`;
}

module.exports=function buildOperationalEffects(campaigns) {
  if(Object.keys(audit).sort().join()!==Object.keys(campaigns).sort().join()) throw Error("Dossier audit must cover the campaign register");
  const observations=[["topic","study","beneficiary","series","scope","period","measure","value","unit","evidence_status","calculation","source","source_type","url","locator","note"]];
  const studies=topics.map(topic=>'<section id="'+topic.id+'"><h2>'+esc(topic.question)+'</h2><p class="standfirst">'+esc(topic.intro)+'</p>'+
    topic.cases.map(study=>renderStudy(study,topic,observations)).join("")+'</section>').join("");
  const menu=topics.map(t=>link("#"+t.id,t.name)).join(" ")+link("./dossier-audit.html","20-campaign audit");
  const effectFile="operational-effects.csv", auditFile="dossier-audit.csv";
  csv(effectFile,observations);
  fs.writeFileSync(path.join(root,"operational-effects.html"),page("What changed because aircraft flew?",
    "Follow supplies to the troops, fighter cover to the ships, and factory disruption through repair and replacement. Each comparison records what the people on the receiving end could establish.",menu,studies,download(effectFile,"Download the evidence (CSV)")));
  const metrics=Object.keys(rosterMetrics);
  const auditRows=[["campaign","side","finding_status","finding","remaining_gap","mission_case","case_sources_and_locators","effect_study","dossier_url",
    ...metrics.flatMap(m=>["v10_1_"+m,"v11_"+m]),"effort","losses","effect"]];
  const cards=Object.entries(audit).map(([id,entry])=>{
    const current=campaigns[id], reader="./campaign-evidence.html?campaign="+id;
    if(Object.keys(entry.sides).sort().join()!==Object.keys(current.coverage).sort().join()) throw Error("Missing reporting side: "+id);
    const specific=topics.flatMap(t=>t.cases).filter(s=>s.campaigns.includes(id));
    const sideText=Object.entries(entry.sides).map(([side,assessment])=>{
      const cov=current.coverage[side], k=current.cases[assessment.case-1];
      if(!k || !["Answered","Partial","Open"].includes(assessment.status)) throw Error("Invalid audit decision: "+id);
      const caseLink=reader+"#mission-"+assessment.case;
      const urls=specific.map(s=>"./operational-effects.html#"+s.id);
      auditRows.push([id,side,assessment.status,assessment.finding,assessment.open,k.title,k.sources.map(s=>s.name+" | "+s.locator+" | "+s.url).join("\n"),urls.join(" "),caseLink,
        ...metrics.flatMap(m=>[cov.before[m],cov.after[m]]),cov.effort,cov.losses,cov.effect]);
      return '<div class="side"><h3>'+esc(side)+'</h3><p class="status">'+esc(assessment.status)+'</p><p>'+esc(assessment.finding)+'</p><p><strong>Still needed</strong> '+esc(assessment.open)+'</p>'+link(caseLink,k.title)+'</div>';
    }).join("");
    const sides=Object.keys(entry.sides);
    const counts=metrics.map(m=>[esc(rosterMetrics[m]),...sides.map(s=>current.coverage[s].before[m]+" → "+current.coverage[s].after[m])]);
    const qualitative=sides.map(s=>{const v=current.coverage[s];return '<h4>'+esc(s)+'</h4><dl>'+[["Flying effort",v.effort],["Losses and damage",v.losses],["Operational effect",v.effect]].map(([k,val])=>'<dt>'+esc(k)+'</dt><dd>'+esc(val)+'</dd>').join("")+'</dl>';}).join("");
    return '<section id="'+id+'"><h2>'+esc(entry.name)+'</h2><div class="sides">'+sideText+'</div><details><summary>Compare roster counts and evidence by side</summary>'+
      table(entry.name+" · v10.1 → v11.0",["Measure",...sides],counts)+qualitative+'</details><nav class="related">'+link(reader,"Mission sources")+' · '+link("./forces.html?campaign="+id,"Dated rosters")+
      specific.map(s=>" · "+link("./operational-effects.html#"+s.id,s.title)).join("")+'</nav></section>';
  }).join("");
  csv(auditFile,auditRows);
  const jump=Object.entries(audit).map(([id,e])=>link("#"+id,e.name)).join(" ");
  const guide='<p class="standfirst">Each judgement applies to the specific question in its row. “Answered” identifies a bounded historical finding. “Partial” identifies an incomplete chain of evidence. “Open” marks an outcome or attribution that still lacks a matching record. The roster counts carried forward from v10.2 measure what the Atlas documents. A unit can recur on multiple dates.</p>';
  fs.writeFileSync(path.join(root,"dossier-audit.html"),page("What do the 20 dossiers establish?",
    "Compare each side’s evidence with the v10.1 baseline. Each entry identifies a finding, the record behind it and the next document needed.",link("./campaign-expansion.html","22 subsequent campaign studies")+link("./operational-effects.html","Operational effects")+download(auditFile,"Download all 40 assessments (CSV)"),
    guide+'<nav class="campaign-index" aria-label="Jump to campaign">'+jump+'</nav>'+cards,download(auditFile,"Download the audit (CSV)")));
};
