(() => {
  "use strict";
  const {campaigns} = window.AtlasForceRosters;
  const {labelDate} = window.AtlasRosterTools;
  const regions = [
    ["Opening campaigns and Channel", {spain:"Spanish Civil War", poland:"Poland", norway:"Norway", france1940:"France and the Low Countries", britain:"Battle of Britain", dieppe:"Dieppe"}],
    ["Mediterranean", {malta:"Malta", sicily:"Sicily", italy:"Mainland Italy"}],
    ["Eastern Front", {barbarossa:"Barbarossa", stalingrad:"Stalingrad", kursk:"Kursk", bagration:"Bagration", berlin:"Berlin"}],
    ["Western air offensive and invasion", {reichdefense:"Defence of the Reich", schweinfurt:"Schweinfurt", bigweek:"Big Week", normandy:"Normandy", marketgarden:"Market Garden", bodenplatte:"Bodenplatte"}]
  ];
  const names = Object.assign({}, ...regions.map(([,names]) => names));
  const metrics = {lists:"Dated rosters", named:"Named memberships", located:"Members with a reported place", mapped:"Members with a mapped station", held:"Members with aircraft on strength recorded", ready:"Members with serviceability recorded", activity:"Members with a specific activity recorded"};
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? "").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const link = (href,label) => '<a href="'+esc(href)+'">'+esc(label)+'</a>';
  const study = id => id ? "./campaign-evidence.html?campaign="+encodeURIComponent(id) : "./campaign-evidence.html";
  const roster = (id,pop) => "./forces.html?campaign="+encodeURIComponent(id)+(pop?"&population="+encodeURIComponent(pop):"");
  const dossier = id => "./grand-air-war-v80.html?campaign="+encodeURIComponent(id)+"#campaign-dossier";
  const table = (caption,headers,rows) => '<div class="table-wrap"><table><caption>'+esc(caption)+'</caption><thead><tr>'+headers.map(h=>'<th scope="col">'+esc(h)+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';
  function overview() {
    const intro = '<section class="study-intro"><h2>Coverage by campaign and side</h2><p>The two counts show named unit memberships in v10.1 and v10.2. A formation can appear on more than one date. Zero means the roster has no named entry for that side.</p></section>';
    return intro + regions.map(([title,group])=>{
      const rows = [];
      for (const [id,label] of Object.entries(group)) {
        const c = campaigns[id];
        for (const [side,data] of Object.entries(c.coverage)) {
          rows.push('<tr><th scope="row">'+link(study(id),label)+'</th><td>'+esc(side)+'</td><td>'+data.before.named+'</td><td>'+data.after.named+'</td><td>'+data.after.lists+'</td></tr>');
        }
      }
      return '<section class="region">'+table(title,["Campaign","Side","v10.1 named","v10.2 named","Dated rosters in v10.2"],rows)+'</section>';
    }).join("");
  }
  function showCase(k,c,id,index) {
    const refs = k.sources.map(s=>'<li>'+link(s.url,s.name)+' <span>'+esc(s.kind)+' · '+esc(s.locator)+'</span></li>').join("");
    const related = (k.rosterIds || []).map(pid=>{
      const p=c.populations.find(p=>p.id===pid);
      return link(roster(id,pid),p.label);
    });
    return '<article class="mission" id="mission-'+(index+1)+'"><p class="kicker">'+esc(labelDate(k.date))+'</p><h3>'+esc(k.title)+'</h3><p>'+esc(k.mission)+'</p><h4>Recorded outcome</h4><p>'+esc(k.effect)+'</p><p class="limit"><strong>Evidence limit</strong> '+esc(k.limit)+'</p><details class="witnesses"><summary>Sources ('+k.sources.length+')</summary><ul>'+refs+'</ul></details>'+
      (related.length?'<nav class="study-nav" aria-label="Dated rosters for this case">'+related.join(" ")+'</nav>':'')+'</article>';
  }
  function allocations(c) {
    if (!c.allocations?.length) return "";
    const rows = c.allocations.map(r=>'<tr><th scope="row">'+esc(r.role)+'</th><td>'+esc(r.total)+'</td><td>'+esc(r.named)+'</td><td>'+esc(r.note)+'</td></tr>');
    return '<section class="region">'+table("Allied allocations at Dieppe",["Role","Allocated","Identified","Evidence"],rows)+'</section>';
  }
  function campaignView(c,id) {
    const sides = Object.keys(c.coverage);
    const rows = Object.entries(metrics).map(([field,label])=>{
      const values = sides.map(side=>{
        const {before,after} = c.coverage[side];
        return '<td>'+before[field]+'</td><td>'+after[field]+'</td>';
      });
      return '<tr><th scope="row">'+esc(label)+'</th>'+values.join("")+'</tr>';
    });
    const accounts = sides.map(side=>{
      const s=c.coverage[side];
      return '<section class="force-account"><h3>'+esc(side)+'</h3><dl><dt>Flying activity</dt><dd>'+esc(s.effort)+'</dd><dt>Losses and damage</dt><dd>'+esc(s.losses)+'</dd><dt>Operational effect</dt><dd>'+esc(s.effect)+'</dd></dl></section>';
    });
    return '<section class="study-intro"><h2>Dated mission evidence</h2>'+c.cases.map((k,index)=>showCase(k,c,id,index)).join("")+'</section>'+allocations(c)+
      '<section class="region" id="coverage"><h2>How much is documented?</h2><p>Counts describe the Atlas at each release. The unit rows can recur across different dated returns. A reported place may identify only a sector.</p>'+
      table("Roster coverage",["Measure",...sides.flatMap(side=>[side+" v10.1",side+" v10.2"])],rows)+'</section>'+
      '<section class="region"><h2>Evidence by force</h2><div class="force-accounts">'+accounts.join("")+'</div></section>';
  }
  const id = new URLSearchParams(location.search).get("campaign");
  for (const [region,group] of regions) {
    const optgroup = document.createElement("optgroup"); optgroup.label = region;
    for (const [value,name] of Object.entries(group)) optgroup.append(new Option(name,value));
    $("campaign-choice").append(optgroup);
  }
  $("campaign-choice").addEventListener("change",e=>location.assign(study(e.target.value)));
  if (Object.hasOwn(names,id)) {
    const c=campaigns[id]; $("campaign-choice").value=id;
    document.title=names[id]+" · Missions and outcomes · European Air War Atlas";
    $("page-title").textContent=names[id]; $("page-intro").textContent=c.title;
    $("related").innerHTML=link(study(""),"All campaigns")+" "+link(roster(id),"Dated rosters")+" "+link(dossier(id),"Campaign dossier");
    $("evidence").innerHTML=campaignView(c,id);
  } else {
    $("evidence").innerHTML=overview();
  }
})();
