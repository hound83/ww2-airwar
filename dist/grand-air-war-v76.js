/* Grand Air War v7.6 · interactive, source-scoped Normandy field notebook.
   No new framework, external map API, invented operational positions or live Atlas mutation. */
(function(){
"use strict";
const DATA=window.GrandAirWarV76Data;
if(!DATA)return;
const $=id=>document.getElementById(id);
const NS="http://www.w3.org/2000/svg";
const FIRST=1936*12+6, LAST=1945*12+4;
const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
const state={month:"1944-06",zoom:"normandy",selection:{type:"event",id:"overlord"},timer:null};
const context={
 "1940-07":{title:"Battle of Britain",place:"Southern England and the Channel",detail:"The featured campaign catalogue includes the Battle of Britain, but this v7.6 prototype has not connected its unit-level event and map records. Select June 1944 for the detailed Normandy field notebook."},
 "1941-06":{title:"Operation Barbarossa",place:"Eastern Front",detail:"The invasion opened the Eastern air war in June 1941. This preview does not yet have a geography-matched, date-resolved Eastern Front unit map. Missing evidence is intentionally shown as unavailable."},
 "1944-02":{title:"Big Week",place:"Germany / Allied air bases",detail:"The February 1944 strategic-air campaign is a future detailed case. Its force and aircraft populations must be verified separately before being mapped."},
 "1945-01":{title:"Operation Bodenplatte",place:"Western Front airfields",detail:"The 1 January 1945 Luftwaffe attack is in the campaign catalogue. This prototype does not attribute unsourced airfield or aircraft-loss figures to it."}
};
const monthNo=s=>{const a=s.split("-").map(Number);return a[0]*12+(a[1]-1)-FIRST;};
const monthAt=n=>{const t=FIRST+Math.max(0,Math.min(LAST-FIRST,n));return Math.floor(t/12)+"-"+String(t%12+1).padStart(2,"0");};
const labelMonth=s=>{const[y,m]=s.split("-").map(Number);return months[m-1]+" "+y;};
const toISODate=s=>s&&s.slice(0,7);
const canShowNormandy=month=>month>="1944-05"&&month<="1944-08";
const projection=(lat,lon)=>[(lon+16)*940/73,(71-lat)*410/38];
const vbox=zoom=>zoom==="normandy"?{x:124,y:191,w:174,h:107}:{x:0,y:0,w:940,h:410};
const s=(tag,attr={},text)=>{const el=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attr))el.setAttribute(k,v);if(text!==undefined)el.textContent=text;return el;};
const set=(id,value)=>{const node=$(id);if(node)node.textContent=value;};
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const getMonthRow=()=>DATA.monthly.find(x=>x.month===state.month);
const getAirfields=()=>canShowNormandy(state.month)?DATA.airfields.filter(x=>toISODate(x.opened)<=state.month):[];
function cancelPlay(){if(state.timer){clearInterval(state.timer);state.timer=null;}$("time-play").textContent="▶ Play";$("time-play").setAttribute("aria-label","Play months");}
function setMonth(month){if(monthNo(month)<0||monthNo(month)>LAST-FIRST)return;
 state.month=month;const thisMonth=DATA.events.filter(x=>x.month===month);
 state.selection=thisMonth.length?{type:"event",id:thisMonth.find(x=>x.id==="overlord")?.id||thisMonth[0].id}:null;
 if(!canShowNormandy(month))state.zoom="europe";
 render();
}
function selectEvent(id){const event=DATA.events.find(x=>x.id===id);if(!event)return;
 if(state.month!==event.month)state.month=event.month;
 state.selection={type:"event",id};state.zoom="normandy";render();
}
function selectField(code){const field=DATA.airfields.find(x=>x.code===code);if(!field)return;
 if(!canShowNormandy(state.month))state.month="1944-06";
 if(toISODate(field.opened)>state.month)state.month=toISODate(field.opened);
 state.selection={type:"field",id:code};state.zoom="normandy";render();
}
function svgClickGroup(svg,x,y,kind,label,callback,options={}){
 const wide=state.zoom!=="normandy";
 const g=s("g",{class:"pin "+(state.selection?.id===options.id?"is-selected":""),role:"button",tabindex:"0","aria-label":label,transform:"translate("+x.toFixed(2)+","+y.toFixed(2)+")"});
 const r=wide?5.2:1.35;
 if(!wide)g.appendChild(s("circle",{r:r*2.2,fill:kind==="airfield"?"#8bdfcf":"#f0c892",opacity:".16"}));
 g.appendChild(s("circle",{class:"pin-core",r,fill:kind==="airfield"?"#8bdfcf":"#efc28d",opacity:options.opacity??1}));
 if(options.text&&state.zoom==="normandy")g.appendChild(s("text",{x:2.1,y:-1.5,class:"pin-label"},options.text));
 const act=()=>{cancelPlay();callback();};g.addEventListener("click",act);
 g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();act();}});
 svg.appendChild(g);return g;
}
function showMap(){
 const mount=$("map-surface");mount.textContent="";
 if(!window.AirWarV75Map?.render){mount.textContent="Base map unavailable; source records are still accessible below.";return;}
 const tmp=document.createElement("div");
 tmp.innerHTML=window.AirWarV75Map.render({ui:{theater:"overall"},D:{idx:()=>0},period:{a:0,b:0}},[]);
 const svg=tmp.querySelector("svg");if(!svg){mount.textContent="Map layout unavailable.";return;}
 for(const t of svg.querySelectorAll("text"))t.remove();
 const v=vbox(state.zoom);svg.setAttribute("viewBox",[v.x,v.y,v.w,v.h].join(" "));
 svg.setAttribute("preserveAspectRatio","xMidYMid meet");
 svg.setAttribute("aria-label",state.zoom==="normandy"?"Normandy and southern English Channel; approximate regional markers":"European coastline with Normandy focus");
 svg.style.overflow="hidden";
 const land=svg.querySelector("path");
 if(land){land.classList.add("coast-land");if(state.zoom==="europe")land.classList.add("wide");}
 const wide=state.zoom==="europe";
 function label(lat,lon,text){const[x,y]=projection(lat,lon);svg.appendChild(s("text",{x,y,class:"geo-label"+(wide?" wide":"" )},text));}
 if(!wide){label(50.34,-2.67,"ENGLISH CHANNEL");label(48.54,-1.78,"NORMANDY");label(49.62,-1.40,"COTENTIN");}
 else{label(53.6,-3.4,"UNITED KINGDOM");label(47.9,2.1,"FRANCE");label(51.6,10,"GERMANY");}
 if(canShowNormandy(state.month)){
  const events=DATA.events.filter(e=>e.month>="1944-05"&&e.month<=state.month);
  // A month's plot includes all earlier dated events, but only the selected month's symbols are fully opaque.
  for(const e of events){
   const[x,y]=projection(e.lat,e.lon);
   svgClickGroup(svg,x,y,e.kind,e.title+" · "+e.date,()=>selectEvent(e.id),{id:e.id,opacity:e.month===state.month?1:.37,text:e.id==="overlord"?"D-DAY":e.id==="cobra"?"COBRA":e.id==="falaise"?"FALAISE":""});
  }
  const fields=getAirfields();const cot=fields.filter(f=>f.sector==="Cotentin"),bessin=fields.filter(f=>f.sector==="Bessin");
  for(const cluster of [{list:cot,lat:49.44,lon:-1.34,label:"Cotentin airfield records"},{list:bessin,lat:49.21,lon:-0.76,label:"Bessin airfield records"}]){
   if(!cluster.list.length)continue;
   const[x,y]=projection(cluster.lat,cluster.lon);
   const g=s("g",{class:"cluster"+(wide?" wide":""),role:"button",tabindex:"0",transform:"translate("+x.toFixed(2)+","+y.toFixed(2)+")","aria-label":cluster.list.length+" "+cluster.label});
   g.appendChild(s("circle",{r:wide?8:2.35}));g.appendChild(s("text",{},String(cluster.list.length)));
   const click=()=>{cancelPlay();selectField(cluster.list[0].code);};
   g.addEventListener("click",click);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();click();}});
   svg.appendChild(g);
  }
 }else{
  const title=context[state.month]?.title||"Europe, "+labelMonth(state.month);
  const[xx,yy]=projection(49.18,-.37);
  svgClickGroup(svg,xx,yy,"context","Return to Normandy June 1944",()=>setMonth("1944-06"),{text:wide?"":"NORMANDY"});
 }
 mount.appendChild(svg);
 set("map-title",canShowNormandy(state.month)?"Normandy · "+labelMonth(state.month):"Europe · "+labelMonth(state.month));
 set("map-strap",wide?"EUROPEAN OVERVIEW · RESEARCH COVERAGE":"CAMPAIGN FIELD NOTEBOOK · REGIONAL MARKERS");
}
function renderInspector(){
 const root=$("inspector");root.dataset.mode=state.selection?.type||"gap";
 let obj=null,sourceKeys=[],status="",caution="",date="",title="",place="",description="";
 if(state.selection?.type==="event"){
  obj=DATA.events.find(x=>x.id===state.selection.id);
  if(obj){date=obj.date;title=obj.title;place=obj.place;description=obj.summary;sourceKeys=obj.sourceKeys;status=obj.evidence==="official-retrospective"?"Official USAF airfield source":obj.evidence==="dated-historical-event"?"Historical campaign milestone":"Historical campaign context";
   caution=obj.kind==="airfield"?"Regional location only. The symbol is not the exact ALG coordinate.":"Campaign context; no implied Normandy-wide strength or loss count.";
  }
 }
 if(state.selection?.type==="field"){
  obj=DATA.airfields.find(x=>x.code===state.selection.id);
  if(obj){date=obj.opened;title=obj.code+" · "+obj.name;place=obj.sector+" sector · Normandy";
   description="First operational date recorded: "+obj.opened+". "+obj.units.map(u=>u.name+" ("+u.first+" to "+u.last+")").join("; ")+". These are monthly candidate station intervals in the USAF field register, not evidence for every day or aircraft strength.";
   status="USAF 1988 source-code entry; unit station cross-check";
   caution="Approximate sector only. Month intervals and field opening day are distinct. This selected source subset is not a complete Allied field inventory.";
   sourceKeys=["johnson","maurer"];
  }
 }
 if(!obj){const x=context[state.month];date=labelMonth(state.month);title=x?.title||"Sources not yet connected";place=x?.place||"European theater";description=x?.detail||"This month is part of the full time machine, but v7.6 does not yet have source-audited, geography-compatible unit and campaign records for it. No missing month is treated as a zero.";status="Coverage gap, not a zero";caution="Return to May–August 1944 for the detailed Normandy demonstration.";sourceKeys=[];}
 set("inspect-date",date);set("inspect-title",title);set("inspect-place",place);set("inspect-summary",description);set("inspect-status",status);set("inspect-caution",caution);
 const impact=state.selection?.type==="event"?obj?.dayMetric:null;
 $("inspect-impact").hidden=!impact;
 if(impact){
  set("inspect-impact-value",impact.quantity.toLocaleString("en-US"));
  set("inspect-impact-label",impact.unit+" · "+impact.date);
  set("inspect-impact-sub",impact.RAFSorties.toLocaleString("en-US")+" RAF sorties · "+DATA.sources[impact.sourceKey].name.split(",")[0]);
 }
 $("inspect-sources").innerHTML=sourceKeys.map(k=>DATA.sources[k]?'<a target="_blank" rel="noopener noreferrer" href="'+esc(DATA.sources[k].url)+'">'+esc(DATA.sources[k].name.split(",")[0])+' ↗</a>':"").join("");
}
function renderMetrics(){
 const o=getMonthRow();
 set("metric-groups",o?o.etoCombatGroups.toLocaleString("en-US"):"—");
 set("metric-losses",o?o.germanWestDestroyed.toLocaleString("en-US"):"—");
 set("metric-fields",canShowNormandy(state.month)?getAirfields().length.toLocaleString("en-US"):"—");
 set("metrics-explainer",o?"USAAF ETO group counts and German Western Command losses are different populations. The ALG list is a curated source subset.":"These metrics have no source-checked series for the selected month in v7.6. Missing ≠ zero.");
 const items=[...document.querySelectorAll(".metric__note")];
 if(items.length===3){
  items[0].textContent=o?"Combat groups across the entire USAAF European Theater, including "+o.etoFighterGroups+" fighter groups. Not aircraft or Normandy-only.":"No ETO group observation linked in this demonstration for "+labelMonth(state.month)+".";
  items[1].textContent=o?"All-cause destroyed aircraft, Luftflotte 3 / West command-wide. Not just losses over Normandy.":"No geographically compatible Luftflotte 3 loss value linked for "+labelMonth(state.month)+".";
  items[2].textContent=o?"Selected USAF code-study fields operational by the end of "+labelMonth(state.month)+"; not all fields.":"Local field sample only covers May–August 1944; unavailable for this month.";
 }
}
function renderAirfields(){
 const fields=getAirfields(),container=$("airfield-list");
 if(!fields.length){container.innerHTML='<div class="empty">No reviewed Normandy ALG entries for this month in the v7.6 sample. This does not mean no airfields existed.</div>';return;}
 container.innerHTML=fields.map(f=>'<button type="button" class="airfield '+(state.selection?.id===f.code?"is-selected":"")+'" data-airfield="'+esc(f.code)+'"><span class="airfield__head"><b>'+esc(f.code)+'</b><span>'+esc(f.name)+'</span></span><small>First op. '+esc(f.opened)+'</small><em>'+esc(f.units.filter(u=>u.first<=state.month&&u.last>=state.month).map(u=>u.name).join(" · ")||"No selected unit observed in this month")+'</em></button>').join("");
 container.querySelectorAll("[data-airfield]").forEach(b=>b.addEventListener("click",()=>{cancelPlay();selectField(b.dataset.airfield);}));
}
function renderBars(){
 const max=Math.max(...DATA.monthly.map(x=>x.germanWestDestroyed));
 $("loss-bars").innerHTML=DATA.monthly.map(x=>'<button class="bar-col '+(state.month===x.month?"is-active":"")+'" type="button" data-bar-month="'+x.month+'" aria-label="Inspect '+labelMonth(x.month)+', '+x.germanWestDestroyed+' reported destroyed aircraft"><span class="bar-col__num">'+x.germanWestDestroyed.toLocaleString("en-US")+'</span><span class="bar-rail"><span class="bar-fill" style="height:'+(100*x.germanWestDestroyed/max).toFixed(1)+'%"></span></span><small>'+months[+x.month.slice(5)-1].slice(0,3)+'</small></button>').join("");
 $("loss-bars").querySelectorAll("[data-bar-month]").forEach(b=>b.addEventListener("click",()=>{cancelPlay();setMonth(b.dataset.barMonth);}));
}
function renderSources(){
 $("source-register").innerHTML=Object.entries(DATA.sources).filter(([k])=>k!=="maurer").map(([k,v])=>'<article class="source"><b>'+esc(v.name)+'</b><p>'+esc(v.note)+'</p><a href="'+esc(v.url)+'" target="_blank" rel="noopener noreferrer">Examine the source ↗</a></article>').join("");
}
function render(){
 $("time-range").value=String(monthNo(state.month));
 set("time-display",labelMonth(state.month));
 $("time-prev").disabled=monthNo(state.month)<=0;$("time-next").disabled=monthNo(state.month)>=LAST-FIRST;
 $("normandy-zoom").classList.toggle("is-active",state.zoom==="normandy");
 $("europe-zoom").classList.toggle("is-active",state.zoom==="europe");
 $("normandy-zoom").setAttribute("aria-pressed",state.zoom==="normandy"?"true":"false");
 $("europe-zoom").setAttribute("aria-pressed",state.zoom==="europe"?"true":"false");
 set("coverage-label",canShowNormandy(state.month)?"Featured campaign · Normandy 1944":"Source gap · outside featured Normandy interval");
 document.querySelectorAll("[data-month]").forEach(b=>b.classList.toggle("is-active",b.dataset.month===state.month));
 showMap();renderInspector();renderMetrics();renderAirfields();renderBars();
}
function init(){
 if(!$("map-surface"))return;
 renderSources();
 $("time-range").addEventListener("input",e=>{cancelPlay();setMonth(monthAt(Number(e.target.value)));});
 $("time-prev").addEventListener("click",()=>{cancelPlay();setMonth(monthAt(monthNo(state.month)-1));});
 $("time-next").addEventListener("click",()=>{cancelPlay();setMonth(monthAt(monthNo(state.month)+1));});
 $("time-play").addEventListener("click",()=>{
  if(state.timer){cancelPlay();return;}
  if(monthNo(state.month)>=LAST-FIRST)setMonth(DATA.bounds.first);
  $("time-play").textContent="Ⅱ Pause";$("time-play").setAttribute("aria-label","Pause months");
  state.timer=setInterval(()=>{if(monthNo(state.month)>=LAST-FIRST){cancelPlay();return;}setMonth(monthAt(monthNo(state.month)+1));},850);
 });
 $("europe-zoom").addEventListener("click",()=>{cancelPlay();state.zoom="europe";render();});
 $("normandy-zoom").addEventListener("click",()=>{cancelPlay();state.zoom="normandy";render();});
 $("return-to-normandy").addEventListener("click",()=>{cancelPlay();setMonth("1944-06");});
 document.querySelectorAll("[data-month]").forEach(b=>b.addEventListener("click",()=>{cancelPlay();setMonth(b.dataset.month);}));
 document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelPlay();});
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.GrandAirWarV76={setMonth,selectEvent,selectField,monthAt,monthNo,getMonthRow};
})();
