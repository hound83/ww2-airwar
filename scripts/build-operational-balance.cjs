"use strict";
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const read = p => JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const {studies,sources,version} = read("research/transcriptions/operational-balance.json");
const formations = read("research/transcriptions/formation-histories.json");
const names = { ...Object.fromEntries(Object.entries(formations.campaigns).map(([id,c])=>[id,c.name])),bigweek:"Big Week",bodenplatte:"Bodenplatte" };
const unitName = new Map(formations.units.map(u=>[u.id,u.name]));
const escape = s => String(s).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const link = (href,label) => '<a href="'+escape(href)+'">'+escape(label)+'</a>';
const cite = (id,locator) => link(sources[id].url,sources[id].title+" · "+locator);
const format = new Intl.NumberFormat("en-GB",{maximumFractionDigits:1});
const evidenceId = (s,id) => s.id+"--"+id;
const csvDir = "research/exports";
fs.mkdirSync(path.join(root,csvDir),{recursive:true});
const exportPath = id => csvDir+"/operational-balance"+(id?"-"+id:"")+".csv";
const header = ["study","id","date_or_period","formation_geography_population","measure","value","unit","evidence_status","calculation","input_ids","interpretation","source_titles","source_urls","locators","source_classes"];
const cell = value => '"' + String(value).replace(/"/g,'""') + '"';
function saveCsv(id,records) {
  fs.writeFileSync(path.join(root,exportPath(id)),[header,...records].map(row=>row.map(cell).join(",")).join("\n")+"\n","utf8");
}
const campaignLinks = {};
for (const study of studies) for (const id of study.campaigns) (campaignLinks[id] ??= []).push({id:study.id,label:study.label});
fs.writeFileSync(path.join(root,"dist/operational-balance-index.js"),"/* Generated from operational-balance.json. */\nwindow.AtlasBalanceLinks = "+JSON.stringify(campaignLinks,null,2)+";\n");
const allRecords = [];
const symbols = {sum:" + ",difference:" − ",percent:" ÷ "};
function evaluate(study) {
  const values = new Map(study.rows.map(r=>[r.id,{...r,refs:[{source:r.source,locator:r.locator}]}]));
  const csv = study.rows.map(r=>[study.id,r.id,r.dates,r.scope,r.label,r.value,r.unit,r.qualifier,"","","",sources[r.source].title,sources[r.source].url,r.locator,sources[r.source].kind]);
  for (const calc of study.calculations) {
    const inputs = calc.inputs.map(id=>values.get(id));
    if (values.has(calc.id) || inputs.some(x=>!x)) throw Error("Invalid input or duplicate calculation: "+calc.id);
    if (inputs.length < 2 || (calc.op!=="sum" && inputs.length!==2)) throw Error("Invalid operand count: "+calc.id);
    if (!inputs.every(x=>x.unit===inputs[0].unit) || (calc.op!=="percent" && inputs[0].unit!==calc.unit)) throw Error("Incompatible units: "+calc.id);
    let value;
    switch (calc.op) {
      case "sum": value=inputs.reduce((total,x)=>total+x.value,0); break;
      case "difference": value=inputs[0].value-inputs[1].value; break;
      case "percent": value=100*inputs[0].value/inputs[1].value; break;
      default: throw Error("Unknown calculation: "+calc.op);
    }
    if (!Number.isFinite(value)) throw Error("Unavailable denominator: "+calc.id);
    const refs = inputs.flatMap(x=>x.refs).filter((ref,i,list)=>i===list.findIndex(x=>x.source===ref.source && x.locator===ref.locator));
    const dates = [...new Set(inputs.map(x=>x.dates))].join(" | ");
    const scope = [...new Set(inputs.map(x=>x.scope))].join(" | ");
    const expression = inputs.map(x=>format.format(x.value)).join(symbols[calc.op]) + (calc.op==="percent"?" × 100":"");
    values.set(calc.id,{...calc,value,dates,scope,refs,expression});
    csv.push([study.id,calc.id,dates,scope,calc.label,Number(value.toFixed(1)),calc.unit,"calculated",expression,calc.inputs.join(" | "),calc.interpretation,refs.map(x=>sources[x.source].title).join(" | "),refs.map(x=>sources[x.source].url).join(" | "),refs.map(x=>x.locator).join(" | "),refs.map(x=>sources[x.source].kind).join(" | ")]);
  }
  saveCsv(study.id,csv);
  allRecords.push(...csv);
  return values;
}
function studySection(s) {
  const values = evaluate(s);
  const worked = s.calculations.map(calc=>{
    const v=values.get(calc.id);
    const operands=calc.inputs.map(id=>link("#"+evidenceId(s,id),format.format(values.get(id).value))).join(symbols[calc.op]);
    return '<li id="'+evidenceId(s,calc.id)+'"><h4>'+escape(calc.label)+'</h4><p class="equation">'+operands+(calc.op==="percent"?" × 100":"")+' = <strong>'+format.format(v.value)+(v.unit==="%"?"%":" "+escape(v.unit))+'</strong></p><p>'+escape(calc.interpretation)+'</p></li>';
  }).join("\n");
  const rows=s.rows.map(r=>'<tr id="'+evidenceId(s,r.id)+'"><th scope="row">'+escape(r.label)+'</th><td>'+escape(r.dates)+'<span>'+escape(r.scope)+'</span></td><td class="quantity">'+format.format(r.value)+' '+escape(r.unit)+'<span>'+escape(r.qualifier)+'</span></td><td>'+cite(r.source,r.locator)+'<span>'+escape(sources[r.source].kind)+'</span></td></tr>').join("\n");
  const campaigns=s.campaigns.map(id=>link("./grand-air-war-v80.html?campaign="+id+"#campaign-dossier",names[id]+" dossier"));
  const units=s.units.map(id=>link("./formations.html#unit-"+id,unitName.get(id)));
  return '<section id="'+s.id+'" class="study" tabindex="-1" aria-labelledby="'+s.id+'-title"><header><p class="kicker">'+escape(s.label)+' · '+escape(s.period)+'</p><h2 id="'+s.id+'-title">'+escape(s.title)+'</h2><p class="lead">'+escape(s.answer)+'</p></header>'+
  s.points.map(p=>'<h3>'+escape(p.title)+'</h3><p>'+escape(p.text)+'</p><p class="citation">'+cite(p.source,p.locator)+'</p>').join("\n")+
  '<h3>Worked comparisons</h3><ul class="worked">'+worked+'</ul><aside class="gap"><h3>What remains uncertain</h3><p>'+escape(s.gap)+'</p></aside>'+
  '<h3>Figures and sources</h3><p><a download href="./'+exportPath(s.id)+'">Download '+escape(s.label)+' data (CSV)</a></p><table><caption>'+s.rows.length+' reported or reconstructed figures · '+escape(s.label)+'</caption><thead><tr><th>Measure</th><th>Period and reporting scope</th><th>Value and status</th><th>Source and passage</th></tr></thead><tbody>'+rows+'</tbody></table>'+
  '<h3>Explore the records</h3><nav class="related" aria-label="'+escape(s.label)+' records">'+[link("./"+s.record[0],s.record[1]),...units,...campaigns].join(" ")+'</nav><p>'+link("#studies","Back to the six studies")+'</p></section>';
}
const sections=studies.map(studySection);
saveCsv("",allRecords);
const index=studies.map(s=>'<li>'+link("#"+s.id,s.label)+'<span>'+escape(s.title)+'</span></li>').join("\n");
const html='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Six historical studies of what aircraft, crews, fuel and repairs allowed air forces to do next."><title>Operational balance studies · Grand Air War Atlas v'+version+'</title><link rel="stylesheet" href="./dist/operations-1944.css"><link rel="stylesheet" href="./dist/operational-balance.css"></head><body>'+
'<a class="skip" href="#studies">Skip to studies</a><header class="mast"><nav class="wrap" aria-label="Atlas navigation">'+link("./grand-air-war-v80.html","European Air War Atlas v"+version)+link("./formations.html","Formation histories")+'</nav></header><main class="wrap balance"><header class="intro"><h1>What could the air forces do next?</h1><p class="lead">Six studies follow aircraft and crews from one operation to the next. The records show when repairs restored a squadron, when fuel limited flying, and what the armies and ships under air cover actually experienced.</p></header>'+
'<nav id="studies" tabindex="-1" aria-label="Choose a study"><ul class="directory">'+index+'</ul></nav><p><a download href="./'+exportPath("")+'">Download all six studies (CSV)</a> · '+link("./research/transcriptions/operational-balance.json","Source data (JSON)")+'</p>\n'+sections.join("\n")+'</main></body></html>\n';
fs.writeFileSync(path.join(root,"operational-balance.html"),html,"utf8");
