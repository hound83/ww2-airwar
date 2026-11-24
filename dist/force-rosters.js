(() => {
  "use strict";
  const {campaigns, stations} = window.AtlasForceRosters;
  const {coverage, labelDate, csv} = window.AtlasRosterTools;
  const $ = id => document.getElementById(id);
  const esc = text => String(text ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const anchor = (url, label, attrs="") => '<a href="'+esc(url)+'" '+attrs+'>'+esc(label)+'</a>';
  const option = (value,label) => '<option value="'+esc(value)+'">'+esc(label)+'</option>';
  const names = {spain:"Spanish Civil War", poland:"Poland", norway:"Norway", france1940:"France and the Low Countries", britain:"Battle of Britain", malta:"Malta", barbarossa:"Barbarossa", dieppe:"Dieppe", stalingrad:"Stalingrad", reichdefense:"Defence of the Reich", sicily:"Sicily", kursk:"Kursk", schweinfurt:"Schweinfurt", italy:"Mainland Italy", bigweek:"Big Week", normandy:"Normandy", bagration:"Bagration", marketgarden:"Market Garden", bodenplatte:"Bodenplatte", berlin:"Berlin"};
  const labels = {geography:"Places and dates",strength:"Strength and readiness",effort:"Flying activity",losses:"Losses and damage",effect:"Operational effect"};
  const idOf = (obj,key,fallback) => Object.hasOwn(obj,key) ? key : fallback;
  let campaignId, campaign, population, unitName, phrase, stationId, visible=[];
  function href(changes={}) {
    const url=new URL(location.href);
    const params={campaign:campaignId,population:population.id,unit:unitName,q:phrase,station:stationId,...changes};
    for (const [k,v] of Object.entries(params)) { if(v) url.searchParams.set(k,v); else url.searchParams.delete(k); }
    url.hash="";
    return url.pathname+url.search;
  }
  function navigate(url, replace=false, focus="") {
    if (replace) history.replaceState(null,"",url); else history.pushState(null,"",url);
    render();
    if (focus) $(focus).focus();
  }
  function restore() {
    const q=new URLSearchParams(location.search);
    campaignId=idOf(campaigns,q.get("campaign"),"sicily"); campaign=campaigns[campaignId];
    population=campaign.populations.find(p=>p.id===q.get("population")) || campaign.populations[0];
    phrase=q.get("q")||""; stationId=q.get("station")||""; unitName=q.get("unit")||"";
    if (!population.members.some(m=>m.stations.includes(stationId))) stationId="";
    if (!population.members.some(m=>m.unit===unitName)) unitName="";
  }
  function memberUrl(m) { return href({unit:m.unit}); }
  function dossier() { return "./grand-air-war-v80.html?campaign="+encodeURIComponent(campaignId)+"#campaign-dossier"; }
  function renderCampaign() {
    $("campaign").value=campaignId; $("campaign-name").textContent=names[campaignId];
    document.title=names[campaignId]+" deployments · European Air War Atlas";
    $("campaign-summary").textContent=campaign.summary;
    for (const id of ["back-dossier","footer-dossier"]) $(id).href=dossier();
    $("populations").innerHTML=campaign.populations.map(p=>'<a data-roster-nav href="'+esc(href({population:p.id,unit:"",q:"",station:""}))+'"'+(p.id===population.id?' aria-current="true"':'')+'><strong>'+esc(p.label)+'</strong><small>'+esc(labelDate(p.date))+' · '+esc(coverage(p))+'</small></a>').join("");
    $("assessment-title").textContent=campaign.title;
    $("assessment-forces").innerHTML=campaign.forces.map(f=>'<p><strong>'+esc(f.name)+'</strong> · '+esc(f.coverage)+'</p>').join("");
    $("assessment-fields").innerHTML=Object.entries(labels).map(([field,label])=>'<dt>'+esc(label)+'</dt><dd>'+esc(campaign[field])+'</dd>').join("");
    $("assessment-source").innerHTML=anchor(campaign.source,campaign.locator);
    const study=window.AtlasCampaignStudies?.[campaignId];
    if (study) {
      const q = new URLSearchParams({campaign:campaignId,event:study.date});
      if (study.episode) q.set("episode",study.episode);
      $("study-case").innerHTML=anchor(study.href || "./grand-air-war-v80.html?"+q+"#moment-detail",study.label+" · "+labelDate(study.date));
    }
  }
  function renderDetail(m) {
    const el=$("unit-detail"); el.hidden=!m;
    if(!m){ el.replaceChildren(); return; }
    const p=population, links=[];
    for (const id of m.stations) links.push(anchor(href({station:id,unit:"",q:""}),"Show units at "+stations[id].name,"data-station-link"));
    if (m.parent && p.members.filter(x=>x.parent===m.parent).length>1)
      links.push(anchor(href({unit:"",q:m.parent,station:""}),"View units under "+m.parent,"data-siblings"));
    for(const child of campaign.populations.filter(x=>x.parentPopulation===p.id && x.parentUnit===m.unit)) {
      links.push(anchor(href({population:child.id,unit:"",q:"",station:""}),child.label+" · "+labelDate(child.date),"data-roster-nav"));
    }
    if(p.parentPopulation) links.push(anchor(href({population:p.parentPopulation,unit:p.parentUnit,q:"",station:""}),"Open "+p.parentUnit+" in the campaign allocation","data-unit-link"));
    if(p.id==="sicily-211")
      links.push(anchor(href({population:"sicily-211-wings",unit:m.parent,q:"",station:""}),"Open "+m.parent,"data-unit-link"));
    if(p.id==="sicily-211-wings")
      links.push(anchor(href({population:"sicily-211",unit:"",q:m.unit,station:""}),"View this wing’s squadrons","data-siblings"));
    if(campaignId==="sicily" && p.id==="sicily-211" && /No\. 92 Squadron/.test(m.unit))
      links.push(anchor("./sicily.html?case=messina#case-detail","Messina escort and cover · 16 Aug 1943"));
    if(campaignId==="britain") links.push(anchor("./grand-air-war-v80.html?campaign=britain#operation=britain-7-sep&step=0","7 September operation"));
    if(campaignId==="bagration") links.push(anchor("./bagration.html#formations","Bagration formation histories"));
    el.innerHTML='<p class="kicker">'+esc(p.echelon)+' · '+esc(labelDate(p.date))+'</p><h3>'+esc(m.unit)+'</h3>'+
      '<p>'+esc([m.parent,m.place].filter(Boolean).join(" · ") || p.force)+'</p>'+
      (m.strength!==null || m.serviceable!==null ? '<p>'+[m.strength!==null?m.strength+" aircraft on strength":"",m.serviceable!==null?m.serviceable+" serviceable":""].filter(Boolean).join(" · ")+'</p>':'')+
      '<p>'+anchor(p.source,p.locator)+'</p>'+
      (m.source!==p.source || m.locator!==p.locator ? '<p>'+anchor(m.source,m.locator)+'</p>':'')+
      (m.activity?'<p>'+esc(m.activity)+'</p><p>'+anchor(m.activitySource,m.activityLocator)+'</p>':'')+
      (links.length?'<p class="unit-links">'+links.join(" ")+'</p>':'');
  }
  function renderMembers() {
    const p=population, needle=phrase.trim().toLocaleLowerCase();
    const matches=p.members.filter(m=>[m.unit,m.parent,m.place].join(" ").toLocaleLowerCase().includes(needle));
    const mapped=new Map();
    for(const m of matches) for(const id of m.stations) mapped.set(id,(mapped.get(id)||0)+1);
    // Keep an active station available to clear even after a search returns no units there.
    const options=[...mapped.keys()];
    if(stationId && !mapped.has(stationId)) options.push(stationId);
    options.sort((a,b)=>stations[a].name.localeCompare(stations[b].name));
    $("station").innerHTML=option("","All stations")+options.map(id=>option(id,stations[id].name)).join("");
    $("station").value=stationId; $("station").disabled=!options.length;
    visible=matches.filter(m=>!stationId || m.stations.includes(stationId));
    $("filters").hidden=!p.members.length;
    $("unit-search").value=phrase;
    $("export-view").disabled=!!p.members.length && !visible.length;
    $("result-count").textContent=!p.members.length ? "This source reports a total. Individual units have yet to be identified here." :
      visible.length===0 ? "No units match these filters. Clear the search or choose another station." :
      visible.length+" of "+p.members.length+" named "+(p.members.length===1?"entry":"entries")+" shown.";
    const stocks=p.members.some(m=>m.strength!==null || m.serviceable!==null);
    const hasPlace=p.members.some(m=>m.place);
    const table=$("unit-list");
    table.innerHTML=visible.length ? '<div class="table-wrap"><table aria-label="Named units in the selected return"><thead><tr><th scope="col">Unit</th><th scope="col">Parent or sector</th>'+
      (hasPlace?'<th scope="col">Reported place</th>':'')+(stocks?'<th scope="col">Held</th><th scope="col">Serviceable</th>':'')+'</tr></thead><tbody>'+
      visible.map(m=>'<tr'+(m.unit===unitName?' data-current':'')+'><td>'+anchor(memberUrl(m),m.unit,"data-unit-link")+'</td><td>'+esc(m.parent || "Unspecified")+'</td>'+
        (hasPlace?'<td>'+esc(m.place || "Unspecified")+'</td>':'')+(stocks?'<td>'+esc(m.strength??"—")+'</td><td>'+esc(m.serviceable??"—")+'</td>':'')+'</tr>').join("")+'</tbody></table></div>':"";
    renderDetail(visible.find(m=>m.unit===unitName));
    const pins=[...mapped].map(([id,count])=>({...stations[id],id,count}));
    $("map-panel").hidden=!pins.length;
    const unmapped=$("unmapped");
    unmapped.hidden=!!pins.length || !p.members.length || !!needle;
    unmapped.textContent=p.geographyNote || "No airfield positions are mapped for this dated list.";
    window.AtlasStationMap?.render($("station-map"),pins,stationId,id=>{navigate(href({station:stationId===id?"":id,unit:""}));$("station-map").querySelector('[data-station="'+CSS.escape(id)+'"]')?.focus({preventScroll:true});});
    $("map-caption").textContent=[matches.filter(m=>m.stations.length).length+" of "+matches.length+" listed unit entries have mapped stations.",p.geographyNote,"Select a station to filter the table. Coastlines: Natural Earth."].filter(Boolean).join(" ");
    $("station-citations").innerHTML=stationId?'<p>'+anchor(stations[stationId].source,stations[stationId].name+" · "+stations[stationId].locator)+'</p>':"";
  }
  function render() {
    restore();renderCampaign();const p=population;
    $("return-date").textContent=labelDate(p.date)+" · "+p.force;
    $("return-title").textContent=p.label;
    $("scope-meta").innerHTML="<strong>"+esc(coverage(p))+"</strong><span>"+esc(p.echelon)+" · "+esc(p.event)+"</span>";
    $("return-scope").textContent=p.scope; $("return-note").textContent=p.note;
    $("return-source").innerHTML=anchor(p.source,p.locator)+" · "+esc(p.sourceClass);
    renderMembers();
  }
  $("campaign").innerHTML=Object.entries(names).map(([id,label])=>option(id,label)).join("");
  $("campaign").addEventListener("change",e=>navigate(href({campaign:e.target.value,population:"",unit:"",station:"",q:""})));
  $("station").addEventListener("change",e=>navigate(href({station:e.target.value,unit:""})));
  $("unit-search").addEventListener("input",e=>navigate(href({q:e.target.value,unit:""}),true));
  document.addEventListener("click",e=>{
    if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||e.button!==0) return;
    const link=e.target.closest("[data-roster-nav],[data-unit-link],[data-siblings],[data-station-link]");
    if(!link)return;
    e.preventDefault();navigate(link.href,false,link.hasAttribute("data-unit-link")?"unit-detail":link.hasAttribute("data-station-link")?"station":"roster");
  });
  $("export-view").addEventListener("click",()=>{
    const blob=new Blob([csv([{campaign:campaignId,population,members:visible}],stations)],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob), link=document.createElement("a");
    link.href=url;link.download="atlas-"+population.id+".csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  });
  window.addEventListener("popstate",render);
  render();
  if (unitName && !$("unit-detail").hidden) $("unit-detail").focus();
})();
