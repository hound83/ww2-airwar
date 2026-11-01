/* Grand Air War v7.7 — European campaigns, official-source datasets, and linked analysis.
   This UI never estimates unsupported monthly force inventories or geographically locates command-wide losses as individual battle casualties. */
(function(){
"use strict";
const D=window.GrandAirWarV77Campaigns,G=window.GrandAirWarV77Groups,V=window.AirWarV74Data,
 P=window.AirWarV73Data,A=window.AirWarV71Data,B=window.AirWarV72Data,Legacy=window.LuftData;
if(!D||!G||!V||!P||!A||!B||!Legacy)return;
const $=id=>document.getElementById(id),esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=x=>x===null||x===undefined?"Unavailable":Number(x).toLocaleString("en-US");
const MN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const LMIN=1936*12+6,LMAX=1945*12+4;
const monthIdx=m=>Number(m.slice(0,4))*12+Number(m.slice(5,7))-1-LMIN;
const atIdx=i=>{const t=LMIN+Math.max(0,Math.min(LMAX-LMIN,i));return Math.floor(t/12)+"-"+String(t%12+1).padStart(2,"0");};
const mLabel=m=>MN[Number(m.slice(5,7))-1]+" "+m.slice(0,4);
const sourceLink=(id,label)=>D.sources[id]?'<a target="_blank" rel="noopener noreferrer" href="'+esc(D.sources[id].url)+'">'+esc(label||D.sources[id].title)+" ↗</a>":"";
const lossRows=[...A.monthlyReturns,...B.monthlyReturns].map(x=>({...x,period:(()=>{const z=Legacy.at(x.i);return z.y+"-"+String(z.m+1).padStart(2,"0");})()})).sort((a,b)=>a.i-b.i||a.theater.localeCompare(b.theater));
const sourceIndex={...A.sourceIndex,...B.sourceIndex};
const groupRows=G.rows.map(r=>Object.fromEntries(G.columns.map((c,i)=>[c,r[i]])));
const state={month:"1944-06",theater:"all",search:"",all:false,selected:"normandy",map:null,mapMarkers:null,play:null,lossCommand:"Western Front",lossOutcome:"destroyed",lossWindow:"all",lossMonth:"1944-06",forceSeries:"usaaf",forceArea:"ETO",forceMetric:"totalCombatGroups",forceSelected:"1944-06"};
const themes={west:"Western Front",reich:"Reich / strategic bombing",east:"Eastern Front",med:"Mediterranean / Italy",north:"Northern Europe"};
const active=c=>c.start<=state.month&&c.end>=state.month;
const matches=c=>(state.theater==="all"||c.theater===state.theater)&&(!state.search||(c.name+" "+c.objective+" "+c.participants.join(" ")+" "+c.consequence).toLowerCase().includes(state.search));
const matching=()=>D.campaigns.filter(matches);
const visibleOnMap=()=>matching().filter(c=>state.all||active(c));
function cancelPlay(){if(state.play!==null){clearInterval(state.play);state.play=null;}$("play-time").textContent="▶ Play";}
function updateMonth(month,keep=false){
 if(monthIdx(month)<0||monthIdx(month)>LMAX-LMIN)return;
 state.month=month;
 if(!keep&&!active(D.campaigns.find(c=>c.id===state.selected)||{})){const a=matching().find(active);if(a)state.selected=a.id;}
 update();
}
function pickCampaign(id,fly=true){
 const c=D.campaigns.find(x=>x.id===id);if(!c)return;cancelPlay();
 state.selected=id;
 if(!active(c))state.month=c.start;
 if(state.theater!=="all"&&state.theater!==c.theater)state.theater="all";
 update();
 if(fly&&state.map){const z=state.map.getZoom();state.map.flyTo([c.focus.lat,c.focus.lng],Math.max(6,Math.min(9,z)),{duration:.6});}
}
function selectMoment(cId,date,lat,lng){
 pickCampaign(cId,false);
 if(date&&date.slice(0,7)!==state.month)updateMonth(date.slice(0,7),true);
 if(state.map)state.map.flyTo([lat,lng],Math.max(7,Math.min(10,state.map.getZoom())),{duration:.6});
}
function makeIcon(text,mode,selected,inactive=false){
 return window.L.divIcon({className:"gaw-icon",html:'<span class="map-marker '+esc(mode)+" "+(selected?"selected ":"")+(inactive?"inactive":"")+'">'+esc(text)+'</span>',iconSize:[mode==="report"?76:116,27],iconAnchor:[mode==="report"?38:58,14]});
}
function setupMap(){
 if(!window.L){$("map-fallback").hidden=false;return;}
 try{
  state.map=L.map("campaign-map",{zoomControl:false,minZoom:3,maxZoom:12,scrollWheelZoom:true,touchZoom:true,keyboard:true});
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:12,keepBuffer:2}).addTo(state.map);
  L.control.zoom({position:"topright"}).addTo(state.map);
  state.mapMarkers=L.layerGroup().addTo(state.map);
  state.map.setView([52,13],5);
  state.map.on("zoomend",drawMap);
 }catch(e){$("map-fallback").hidden=false;}
}
function drawMap(){
 if(!state.mapMarkers)return;
 state.mapMarkers.clearLayers();
 const cs=visibleOnMap();
 const pins=cs.map(c=>({kind:"campaign",lat:c.focus.lat,lng:c.focus.lng,code:c.id,title:c.name,subtitle:c.start+" – "+c.end,active:active(c)}));
 const present=lossRows.filter(x=>x.period===state.month);
 for(const c of present){pins.push({kind:"report",lat:c.theater==="Reich"?52.0:49.8,lng:c.theater==="Reich"?10.2:2.0,code:c.theater,title:c.theater==="Reich"?"Luftflotte Reich":"Luftflotte 3 / West",subtitle:fmt(c.destroyed)+" aircraft destroyed in reporting command",active:true});}
 const groups=[];
 const threshold=state.map.getZoom()>=8?0:state.map.getZoom()>=6?34:56;
 for(const pin of pins){
  const pix=state.map.latLngToContainerPoint([pin.lat,pin.lng]);
  let placed=false;
  if(threshold)for(const g of groups){
   if(g.every(i=>i.kind!==pin.kind))continue;
   const p=state.map.latLngToContainerPoint([g[0].lat,g[0].lng]);
   if(Math.hypot(p.x-pix.x,p.y-pix.y)<threshold){g.push(pin);placed=true;break;}
  }
  if(!placed)groups.push([pin]);
 }
 for(const group of groups){
  const multi=group.length>1;
  const first=group[0],lat=group.reduce((s,x)=>s+x.lat,0)/group.length,lng=group.reduce((s,x)=>s+x.lng,0)/group.length;
  const text=multi?group.length+" campaigns":(first.kind==="report"?first.code==="Reich"?"REICH LOSS":"WEST LOSS":first.title);
  const icon=makeIcon(text,multi?"campaign":first.kind,!multi&&first.code===state.selected,!first.active);
  const marker=L.marker([lat,lng],{icon,keyboard:true,title:multi?group.length+" nearby records":first.title});
  if(multi)marker.on("click",()=>state.map.flyTo([lat,lng],Math.min(10,state.map.getZoom()+2)));
  else if(first.kind==="report")marker.on("click",()=>{state.lossCommand=first.code;state.lossMonth=state.month;renderLosses();document.getElementById("loss-lab").scrollIntoView({behavior:"smooth",block:"start"});});
  else marker.on("click",()=>pickCampaign(first.code,true));
  marker.bindTooltip(multi?group.map(x=>x.title).join(" · "):first.title+" · "+first.subtitle);
  state.mapMarkers.addLayer(marker);
 }
}
function renderTime(){
 $("date-slider").value=String(monthIdx(state.month));$("date-display").textContent=mLabel(state.month);
 $("prev-month").disabled=monthIdx(state.month)===0;$("next-month").disabled=monthIdx(state.month)===LMAX-LMIN;
 $("theater-select").value=state.theater;$("campaign-search").value=state.search;$("all-campaigns").checked=state.all;
 $("coverage-label").textContent=matching().filter(active).length+" active · "+matching().length+" in selection";
 $("map-heading").textContent=matching().filter(active).length+" campaigns active · "+mLabel(state.month);
}
function renderDossier(){
 const c=D.campaigns.find(x=>x.id===state.selected)||D.campaigns[0];
 $("dossier-meta").textContent="BATTLE DOSSIER · "+themes[c.theater]+(active(c)?" · ACTIVE":" · OTHER PERIOD");
 $("dossier-title").textContent=c.name;
 $("dossier-dates").textContent=mLabel(c.start)+" — "+mLabel(c.end)+" · approximate focus: "+c.focus.lat.toFixed(1)+"°, "+c.focus.lng.toFixed(1)+"°";
 $("dossier-aim").textContent=c.objective;$("dossier-turn").textContent=c.turningPoint;$("dossier-outcome").textContent=c.consequence;
 $("dossier-forces").innerHTML=c.participants.map(x=>'<span class="force-chip">'+esc(x)+'</span>').join("");
 $("dossier-facts").innerHTML=c.facts.length?c.facts.map(f=>'<article class="fact"><b>'+fmt(f.value)+'</b><span class="fact-unit">'+esc(f.unit)+'</span><p>'+esc(f.label)+'</p><small>'+esc(f.scope)+' · '+esc(f.date)+' · '+esc(f.type)+'</small>'+sourceLink(f.sourceId,"Check observation")+'</article>').join(""):'<div class="no-evidence">No battle-specific loss or sortie total has been verified for this campaign. A blank record is not zero. Use the linked command and force series below for separate reporting populations.</div>';
 $("dossier-sources").innerHTML=c.sources.map(id=>sourceLink(id)).join("");
 const norm=c.id==="normandy";
 $("dossier-link-detail").innerHTML=norm?'<div class="dossier-links"><a href="./grand-air-war-v76.html">Explore the dated Normandy airfield notebook ↗</a></div>':'';
}
function renderCampaignList(){
 const rows=matching().sort((a,b)=>{const n=Number(active(b))-Number(active(a));return n||b.start.localeCompare(a.start);});
 $("campaign-count").textContent=rows.filter(active).length+" active of "+rows.length;
 $("campaign-list").innerHTML=rows.length?rows.map(c=>'<button type="button" data-campaign="'+esc(c.id)+'" class="record '+(c.id===state.selected?"selected ":"")+(active(c)?"":"muted")+'"><span><strong>'+esc(c.name)+'</strong><small>'+esc(themes[c.theater])+' · '+esc(c.participants.slice(0,2).join(" vs "))+'</small></span><span class="date-tag">'+esc(c.start.slice(0,4))+(active(c)?" · ACTIVE":"")+'</span></button>').join(""):'<div class="empty">No matching campaigns. Try another theater or search term.</div>';
 $("campaign-list").querySelectorAll("[data-campaign]").forEach(b=>b.addEventListener("click",()=>pickCampaign(b.dataset.campaign)));
}
function renderMoments(){
 const filter=matching();
 const all=filter.flatMap(c=>c.moments.map(e=>({...e,cid:c.id,cname:c.name})));
 const current=all.filter(e=>e.date.slice(0,7)===state.month).sort((a,b)=>a.date.localeCompare(b.date));
 const near=current.length?current:all.filter(e=>Math.abs(monthIdx(e.date.slice(0,7))-monthIdx(state.month))<=2).sort((a,b)=>Math.abs(monthIdx(a.date.slice(0,7))-monthIdx(state.month))-Math.abs(monthIdx(b.date.slice(0,7))-monthIdx(state.month))).slice(0,10);
 $("moment-count").textContent=current.length?current.length+" dated events":"Nearest documented events";
 $("moment-list").innerHTML=near.length?near.map(e=>'<button type="button" class="record" data-moment="'+esc(e.cid)+'" data-date="'+esc(e.date)+'" data-lat="'+e.lat+'" data-lng="'+e.lng+'"><span><strong>'+esc(e.title)+'</strong><small>'+esc(e.cname)+' · '+esc(e.place)+'</small></span><span class="date-tag">'+esc(e.date)+'</span></button>').join(""):'<div class="empty">No verified dated event is registered for this month and theater. This is a research gap, not proof that no air operations occurred.</div>';
 $("moment-list").querySelectorAll("[data-moment]").forEach(b=>b.addEventListener("click",()=>selectMoment(b.dataset.moment,b.dataset.date,Number(b.dataset.lat),Number(b.dataset.lng))));
}
function lossSource(r){const s=sourceIndex[r.sourceId];return s?'<a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.short)+' · PDF page '+(r.page??"see source")+' ↗</a>':"";}
function lossFields(){const k=state.lossOutcome==="destroyed"?"Destroyed":"Damaged";return ["enemy"+k,"otherOperational"+k,"nonOperational"+k];}
function getLossData(){return lossRows.filter(x=>x.theater===state.lossCommand&&(state.lossWindow==="all"||x.period.startsWith(state.lossWindow))); }
function plotStacked(rows,valueKeys,labels,palette,selected,onClick){
 const n=rows.length,w=Math.max(700,n*50+100),h=305,pad={l:49,r:14,t:20,b:51};
 const ymax=Math.max(1,...rows.map(r=>valueKeys.reduce((s,k)=>s+(Number.isFinite(r[k])?r[k]:0),0)))*1.12;
 const bw=Math.min(31,(w-pad.l-pad.r)/Math.max(1,n)*.65),gap=(w-pad.l-pad.r)/Math.max(1,n);
 let svg='<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="Historical source observations, choose bars to inspect details">';
 for(let j=0;j<=4;j++){const v=ymax*j/4,y=pad.t+(h-pad.t-pad.b)*(1-j/4);svg+='<line class="gridline" x1="'+pad.l+'" y1="'+y+'" x2="'+(w-pad.r)+'" y2="'+y+'"/><text x="'+(pad.l-5)+'" y="'+(y+3)+'" text-anchor="end">'+Math.round(v)+'</text>';}
 for(let i=0;i<n;i++){
  const r=rows[i],key=r.period||r.month,x=pad.l+gap*(i+.5),barx=x-bw/2;
  let y=h-pad.b;
  for(let j=0;j<valueKeys.length;j++){
   const v=r[valueKeys[j]],height=Number.isFinite(v)?(h-pad.t-pad.b)*v/ymax:0;
   if(Number.isFinite(v)&&height>0){
    y-=height;svg+='<rect class="data-bar '+(key===selected?"selected":"")+'" data-chart-index="'+i+'" x="'+barx.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw+'" height="'+height.toFixed(1)+'" fill="'+palette[j]+'"><title>'+esc(key+" · "+labels[j]+" "+fmt(v))+'</title></rect>';
   }
  }
  const label=key?.length===7?key.slice(5)+"/"+key.slice(2,4):String(key??"");
  svg+='<text x="'+x.toFixed(1)+'" y="'+(h-pad.b+17)+'" text-anchor="middle">'+esc(label)+'</text>';
 }
 svg+='</svg><div class="chart-legend">'+labels.map((x,i)=>'<span><i style="background:'+palette[i]+'"></i>'+esc(x)+'</span>').join("")+'</div>';
 return svg;
}
function renderLosses(){
 const r=getLossData();$("loss-command").value=state.lossCommand;$("loss-outcome").value=state.lossOutcome;$("loss-window").value=state.lossWindow;
 const keys=lossFields(),labels=["Enemy action","Other operational","Non-operational"],palette=["#dbab7d","#8fb4d4","#7ec5b0"];
 const root=$("loss-chart");
 root.innerHTML=r.length?plotStacked(r,keys,labels,palette,state.lossMonth):'<div class="empty">There are no original German monthly totals for this selected reporting command and year.</div>';
 root.querySelectorAll("[data-chart-index]").forEach(e=>e.addEventListener("click",()=>{const row=r[Number(e.dataset.chartIndex)];state.lossMonth=row.period;renderLosses();}));
 const row=r.find(x=>x.period===state.lossMonth)||r[r.length-1];
 if(row){state.lossMonth=row.period;
  const total=state.lossOutcome==="destroyed"?row.destroyed:row.damaged;
  $("loss-detail").innerHTML='<h3>'+esc(mLabel(row.period))+' · '+esc(state.lossCommand)+'</h3><p><strong>'+fmt(total)+' '+esc(state.lossOutcome)+'</strong> (all aircraft types, documented wartime command total). Cause categories:</p><div class="cause-grid">'+keys.map((k,i)=>'<div><b>'+fmt(row[k])+'</b><span>'+labels[i]+'</span></div>').join("")+'</div><p>Missing aircraft: '+fmt(row.missing)+' (subset of enemy destroyed, NOT another loss category). Damaged and destroyed are separate outcomes.</p>'+lossSource(row);
 }else $("loss-detail").textContent="No corresponding observed month.";
}
function renderCoverage(){
 const n=lossRows.length,group=groupRows.length,sov=P.soviet.length;
 $("coverage-matrix").innerHTML=[
 ["German command loss returns",n+" recorded month-commands","Reich & West, Sep 1943–Nov 1944","Present"],
 ["USAAF combat group strength",group+" theater-months","ETO & MTO, Feb 1942–May 1945","Present"],
 ["VVS front and reserve strength",sov+" dated snapshots","Jul 1943–May 1945, excludes PVO/naval","Present"],
 ["USAAF factory acceptances",V.usaFactory.length+" months","Worldwide, not European airfield deployment","Present"],
 ["Eastern German aircraft loss returns","Not transcribed here","Do not replace with Western returns","Missing"],
 ["RAF/USAAF localized daily losses","Partial isolated campaign records","Not a complete all-front ledger","Partial"]
 ].map(x=>'<div class="coverage-item '+(x[3]==="Missing"?"missing":"")+'"><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span><br><em>'+esc(x[2])+'</em></div>').join("");
}
function forcePoints(){
 if(state.forceSeries==="usaaf")return groupRows.filter(r=>r.theater===state.forceArea).map(r=>({month:r.month,period:r.month,value:r[state.forceMetric],...r}));
 if(state.forceSeries==="vvs")return P.soviet.map(r=>{const t=Legacy.at(r.i),m=t.y+"-"+String(t.m+1).padStart(2,"0");return {period:m,month:m,value:r.total,fighters:r.fighters,unserviceable:r.unserviceableFighters,source:r.source,date:r.date};});
 return V.usaFactory.map(r=>({period:r.period,month:r.period,value:r.all,fighters:r.fighters,heavy:r.heavy,medium:r.medium,noncombat:r.noncombat}));
}
function forceTitle(){
 if(state.forceSeries==="usaaf")return state.forceArea+" · "+state.forceMetric;
 if(state.forceSeries==="vvs")return "VVS front air forces and command reserves · all aircraft";
 return "USAAF worldwide monthly factory acceptances · all aircraft";
}
function renderForces(){
 $("force-series").value=state.forceSeries;$("force-area").value=state.forceArea;$("force-metric").value=state.forceMetric;
 $("force-area-wrap").hidden=state.forceSeries!=="usaaf";$("force-metric-wrap").hidden=state.forceSeries!=="usaaf";
 const points=forcePoints();const index=points.findIndex(x=>x.period===state.forceSelected),selected=points[index]||points.find(x=>x.period<=state.month&&x.value!==null&&x.value!==undefined)||points.find(x=>x.value!==null&&x.value!==undefined);
 const chartRows=points.map(x=>({period:x.period,value:x.value}));const root=$("force-chart");
 root.innerHTML=plotStacked(chartRows,["value"],[forceTitle()],["#79cbbd"],selected?.period);
 root.querySelectorAll("[data-chart-index]").forEach(e=>e.addEventListener("click",()=>{state.forceSelected=points[Number(e.dataset.chartIndex)].period;renderForces();}));
 if(selected)state.forceSelected=selected.period;
 const desc=state.forceSeries==="usaaf"?"A combat group is an organization, not an aircraft. ETO and MTO records are theater assignments from Table 2; group role subtotals can contain archival arithmetic discrepancies.":
 state.forceSeries==="vvs"?"VVS original front air army + high-command reserve snapshots. Excludes the naval and PVO forces, other distant Soviet aviation. Snapshots are separate dates; no interpolation.":
 "These are worldwide U.S. factory acceptances. They are a flow of newly accepted aircraft, NOT the number available in Europe or serviceable on a particular front.";
 $("force-caveat").textContent=desc;
 let detail="";
 if(selected){
  if(state.forceSeries==="usaaf"){detail='<h3>'+esc(selected.period)+" · "+esc(selected.theater)+'</h3><p><strong>'+fmt(selected.totalCombatGroups)+'</strong> all combat groups</p><div class="cause-grid"><div><b>'+fmt(selected.fighterGroups)+'</b><span>Fighter groups</span></div><div><b>'+fmt(selected.heavyBombardmentGroups)+'</b><span>Heavy bomber groups</span></div><div><b>'+fmt(selected.troopCarrierGroups)+'</b><span>Troop carrier groups</span></div></div><p>Medium/light bombers: '+fmt(selected.mediumAndLightBombardmentGroups)+'; reconnaissance: '+fmt(selected.reconnaissanceGroups)+'. Reported total minus role subtotal: '+fmt(selected.reportedMinusRoleSum)+'.</p><a href="'+esc(G.source)+'" target="_blank" rel="noopener noreferrer">USAAF Statistical Digest Table 2 ↗</a>';}
  else if(state.forceSeries==="vvs"){detail='<h3>'+esc(selected.date)+'</h3><p><strong>'+fmt(selected.value)+'</strong> combat aircraft in source-defined front and reserve populations.</p><p>Fighters: '+fmt(selected.fighters)+'. Fighters listed unserviceable: '+fmt(selected.unserviceable)+'. Do not subtract from total combat aircraft (different measure).</p><a href="'+esc(P.sources[selected.source]?.url||D.sources.vvs.url)+'" target="_blank" rel="noopener noreferrer">Original VVS statistics transcription ↗</a>';}
  else detail='<h3>'+esc(mLabel(selected.period))+'</h3><p><strong>'+fmt(selected.value)+'</strong> USAAF worldwide aircraft acceptances.</p><div class="cause-grid"><div><b>'+fmt(selected.fighters)+'</b><span>Fighters</span></div><div><b>'+fmt(selected.heavy)+'</b><span>Heavy bombers</span></div><div><b>'+fmt(selected.medium)+'</b><span>Medium</span></div></div><p>Non-combat acceptances: '+fmt(selected.noncombat)+'.</p><a href="'+esc(V.sources.aafsd74?.url||"https://www.ibiblio.org/hyperwar/AAF/StatDigest/")+'" target="_blank" rel="noopener noreferrer">USAAF Statistical Digest ↗</a>';
 }
 $("force-detail").innerHTML=detail;
}
function download(rows,filename){
 const cols=Object.keys(rows[0]||{});const csv=[cols.join(","),...rows.map(x=>cols.map(k=>{const v=x[k];return '"'+String(v===null||v===undefined?"":v).replace(/"/g,'""')+'"';}).join(","))].join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function renderSources(){
 $("dataset-summary").innerHTML=[[String(D.campaigns.length), "Curated campaigns incl. pre-war Spanish aviation"],[String(lossRows.length),"Original German command-month loss totals"],[String(groupRows.length),"ETO/MTO combat group-month records"],[String(P.soviet.length)+" + "+String(V.usaFactory.length),"Soviet dated snapshots + US production months"]].map(x=>'<div><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>').join("");
 const catalogue=Object.entries(D.sources).map(([k,s])=>({name:s.title,url:s.url,detail:s.class})).concat(Object.values(sourceIndex).map(s=>({name:s.title,url:s.url,detail:"Captured German wartime loss returns"}))).filter(x=>x.url);
 const unique=new Map(catalogue.map(x=>[x.url,x]));
 $("source-catalogue").innerHTML=[...unique.values()].map(x=>'<article><b>'+esc(x.name)+'</b><small>'+esc(x.detail)+'</small><a target="_blank" rel="noopener noreferrer" href="'+esc(x.url)+'">Open original ↗</a></article>').join("");
}
function update(){renderTime();renderDossier();renderCampaignList();renderMoments();drawMap();}
function init(){
 if(!$("campaign-map"))return;
 setupMap();renderCoverage();renderSources();
 $("date-slider").addEventListener("input",e=>{cancelPlay();updateMonth(atIdx(Number(e.target.value)));});
 $("prev-month").addEventListener("click",()=>{cancelPlay();updateMonth(atIdx(monthIdx(state.month)-1));});
 $("next-month").addEventListener("click",()=>{cancelPlay();updateMonth(atIdx(monthIdx(state.month)+1));});
 $("jump-today").addEventListener("click",()=>{cancelPlay();updateMonth("1944-06");});
 $("play-time").addEventListener("click",()=>{
  if(state.play!==null){cancelPlay();return;}
  if(monthIdx(state.month)>=LMAX-LMIN)state.month=atIdx(0);
  $("play-time").textContent="Ⅱ Pause";
  state.play=setInterval(()=>{if(monthIdx(state.month)>=LMAX-LMIN){cancelPlay();return;}updateMonth(atIdx(monthIdx(state.month)+1));},750);
 });
 $("theater-select").addEventListener("change",e=>{state.theater=e.target.value;state.search="";update();});
 $("campaign-search").addEventListener("input",e=>{state.search=e.target.value.trim().toLowerCase();update();});
 $("all-campaigns").addEventListener("change",e=>{state.all=e.target.checked;update();});
 $("fit-map").addEventListener("click",()=>{if(!state.map)return;const cs=visibleOnMap();if(cs.length)state.map.flyToBounds(L.latLngBounds(cs.map(c=>[c.focus.lat,c.focus.lng])).pad(.3),{maxZoom:6,duration:.6});});
 $("loss-command").addEventListener("change",e=>{state.lossCommand=e.target.value;state.lossMonth=state.month;renderLosses();drawMap();});
 $("loss-outcome").addEventListener("change",e=>{state.lossOutcome=e.target.value;renderLosses();});
 $("loss-window").addEventListener("change",e=>{state.lossWindow=e.target.value;renderLosses();});
 $("download-losses").addEventListener("click",()=>download(getLossData().map(x=>({period:x.period,command:x.theater,enemyDestroyed:x.enemyDestroyed,otherOperationalDestroyed:x.otherOperationalDestroyed,nonOperationalDestroyed:x.nonOperationalDestroyed,enemyDamaged:x.enemyDamaged,otherOperationalDamaged:x.otherOperationalDamaged,nonOperationalDamaged:x.nonOperationalDamaged,missingIncludedInEnemyDestroyed:x.missing,sourceId:x.sourceId,page:x.page??""})),"grand-air-war-german-command-losses.csv"));
 $("force-series").addEventListener("change",e=>{state.forceSeries=e.target.value;state.forceSelected=state.month;renderForces();});
 $("force-area").addEventListener("change",e=>{state.forceArea=e.target.value;state.forceSelected=state.month;renderForces();});
 $("force-metric").addEventListener("change",e=>{state.forceMetric=e.target.value;state.forceSelected=state.month;renderForces();});
 $("download-force").addEventListener("click",()=>download(forcePoints(),"grand-air-war-"+state.forceSeries+"-observations.csv"));
 document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelPlay();});
 update();renderLosses();renderForces();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.GrandAirWarV77={campaigns:D.campaigns,lossRows,groupRows,forcePoints,choose:pickCampaign,setMonth:updateMonth,monthIdx,atIdx,selected:()=>state.selected,active};
})();
