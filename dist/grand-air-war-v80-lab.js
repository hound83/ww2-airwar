/* v8.0 German recorded fighter, pilot, fuel and production analytical workbench */
(function(){
"use strict";
const D=window.GrandAirWarV80German;
if(!D)return;
const $=id=>document.getElementById(id);
const fmt=n=>n===undefined||n===null?"Unavailable":Number(n).toLocaleString("en-US");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lab={mode:"pilots",month:"1944-06",selected:"1944-05"};
const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const label=p=>months[Number(p.slice(5,7))-1]+" "+p.slice(0,4);
const names={
 pilots:["Fighter pilot losses","PILOT ATTRITION · PEOPLE","German single-engine fighter pilot losses, September 1943–May 1944. These are personnel casualties, not lost aircraft.","The April 1944 Galland figure 489 differs from Murray's 447. They are not interchangeable; population definitions remain unresolved."],
 readiness:["Luftflotte Reich fighter readiness","THREE ORIGINAL DATES · AIRCRAFT","Fighters on hand versus serviceable for one German command, not the entire Luftwaffe. Three dated snapshots, no extrapolated monthly line.","Single-engine and twin-engine fighters are separate categories. Ratios describe serviceability only."],
 production:["German aircraft production","ALL TYPES · MONTHLY OUTPUT","Aircraft produced in Germany in 1943–March 1945. This is factory FLOW, not a stock of serviceable fighters.","Secondary postwar USSBS reproduction. September 1944: 4,103 versus 4,130 conflict; 4,103 reconciles with official 39,807 full-year output."],
 fuel:["Aviation fuel production capacity","PERCENT OF CAPACITY · NOT TONNES","Aviation fuel output as a percentage of estimated production capacity, August 1944–February 1945.","A percentage of capacity is not actual fuel delivered to airfields or sorties flown."],
 unit:["JG 53: individual Gruppen","UNIT CASES · NOT ALL GERMANY","Two different Gruppen, April and May 1944. On-hand and serviceable aircraft shown; unit losses/operations are distinct counts.","These are different units and months. Losses and damaged aircraft are not additively independent."]
};
function rows(){
 if(lab.mode==="pilots")return D.pilotCasualties.map(x=>({key:x.period,period:x.period,v:x.losses,b:0,raw:x}));
 if(lab.mode==="readiness")return D.reichFighters.map(x=>({key:x.date,period:x.period,v:x.singleReady,b:x.singleOnHand-x.singleReady,raw:x}));
 if(lab.mode==="production")return D.production.map(x=>({key:x.period,period:x.period,v:x.value,b:0,raw:x}));
 if(lab.mode==="fuel")return D.fuelCapacity.map(x=>({key:x.period,period:x.period,v:x.aviationPercent,b:0,raw:x}));
 return D.unitStudies.map(x=>({key:x.unit,period:x.period,v:x.avgServiceable,b:x.avgAircraft-x.avgServiceable,raw:x}));
}
function sources(){return lab.mode==="production"?["ussbs","ussbsTable","ussbsarchive"]:lab.mode==="pilots"?["murray","galland"]:["murray"];}
function selected(){const all=rows();return all.find(r=>r.key===lab.selected)||all.find(r=>r.period===lab.month)||all.filter(r=>r.period<=lab.month).slice(-1)[0]||all[0];}
function switchMode(mode){
 if(!names[mode])return;
 lab.mode=mode;
 const match=rows().find(x=>x.period===lab.month);
 lab.selected=match?.key||(mode==="readiness"?"1944-06-01":mode==="production"?"1944-07":mode==="fuel"?"1945-02":mode==="unit"?"II./JG 53":"1944-05");
 render();
}
function detail(x){
 const r=x.raw;
 if(lab.mode==="pilots"){
  return "<strong>"+fmt(r.losses)+"</strong><p>Single-engine fighter pilots lost in "+label(r.period)+". The source reports a <b>"+r.rate+"%</b> casualty rate.</p>"+(r.period==="1944-04"?"<p>Conflicting wartime conference: <b>489 lost</b>, <b>396 replacement pilots</b>. Murray's table: <b>447</b>. Different reporting definitions.</p>":"")+"<small>Personnel casualties, not destroyed aircraft or one-front totals.</small>";
 }
 if(lab.mode==="readiness"){
  return "<strong>"+fmt(r.singleReady)+" / "+fmt(r.singleOnHand)+"</strong><p>Single-engine fighters serviceable / on hand: <b>"+Math.round(100*r.singleReady/r.singleOnHand)+"%</b>.</p><div class=\"figures\"><span><b>"+fmt(r.twinReady)+" / "+fmt(r.twinOnHand)+"</b>Twin-engine ready / on hand</span><span><b>"+Math.round(100*r.twinReady/r.twinOnHand)+"%</b>Twin-engine readiness</span></div><small>Luftflotte Reich only, "+esc(r.date)+".</small>";
 }
 if(lab.mode==="production"){
  return "<strong>"+fmt(r.value)+"</strong><p>German aircraft built, all types, "+label(r.period)+". <b>Production is not operational stock.</b></p>"+(r.period==="1944-09"?"<p>September transcription conflict: <b>4,103 vs 4,130</b>. Selected value reconciles to official 39,807 total for 1944.</p>":"")+"<small>USSBS-derived postwar series, original appendix independent recheck still open.</small>";
 }
 if(lab.mode==="fuel"){
  return "<strong>"+fmt(r.aviationPercent)+"%</strong><p>Aviation fuel production as a percentage of capacity.</p><div class=\"figures\"><span><b>"+fmt(r.overallPercent)+"%</b>All fuel capacity</span><span><b>"+fmt(r.aviationPercent)+"%</b>Aviation fuel capacity</span></div><small>Capacity utilization, not physical fuel tonnes or available sorties.</small>";
 }
 const april=r.unit.startsWith("III.");
 return "<strong>"+r.avgServiceable+" / "+r.avgAircraft+"</strong><p>Average serviceable / on-hand aircraft in <b>"+esc(r.unit)+"</b>, "+label(r.period)+".</p><div class=\"figures\"><span><b>"+fmt(april?r.combatAircraftLost:r.completelyDestroyed)+"</b>"+(april?"Combat aircraft lost":"Completely destroyed aircraft")+"</span><span><b>"+fmt(april?r.sorties:r.lostOrDamaged)+"</b>"+(april?"Combat sorties":"Lost or damaged aircraft; includes destroyed")+"</span></div><small>One Gruppe, not representative of all Luftwaffe units.</small>";
}
function drawChart(all,key){
 const host=$("german-chart"),n=all.length,w=Math.max(650,n*39+75),h=275,plot=205,left=51,gap=(w-left-18)/n,bw=Math.min(33,gap*.72),max=Math.max(1,...all.map(r=>r.v+r.b))*1.13;
 let svg='<svg viewBox="0 0 '+w+' '+h+'" width="'+w+'" height="'+h+'" role="img" aria-label="Source-recorded German '+esc(lab.mode)+' observations">';
 for(let tick=0;tick<=4;tick++){const y=17+plot*(1-tick/4);svg+='<line class="gridline" x1="'+left+'" y1="'+y+'" x2="'+(w-14)+'" y2="'+y+'"/><text x="'+(left-6)+'" y="'+(y+3)+'" text-anchor="end">'+Math.round(max*tick/4)+'</text>';}
 for(let i=0;i<n;i++){
  const r=all[i],x=left+gap*(i+.5),height=plot*r.v/max,other=plot*r.b/max,cls=r.key===key?" selected":"";
  svg+='<rect class="data-bar'+cls+'" data-german-index="'+i+'" x="'+(x-bw/2)+'" y="'+(222-height)+'" width="'+bw+'" height="'+height+'" fill="#a5d1c3"><title>'+esc(r.key)+': '+fmt(r.v)+'</title></rect>';
  if(other>0)svg+='<rect class="data-bar'+cls+'" data-german-index="'+i+'" x="'+(x-bw/2)+'" y="'+(222-height-other)+'" width="'+bw+'" height="'+other+'" fill="#537686"><title>Not serviceable: '+fmt(r.b)+'</title></rect>';
  if(n<15||i%3===0)svg+='<text x="'+x+'" y="242" text-anchor="middle">'+esc(n>=15?r.period.slice(2):r.key==="II./JG 53"?"II/JG53":r.key==="III./JG 53"?"III/JG53":label(r.period))+'</text>';
 }
 svg+='</svg><div class="chart-legend"><span><i style="background:#a5d1c3"></i>'+esc(lab.mode==="pilots"?"Pilots lost":lab.mode==="production"?"All aircraft produced":lab.mode==="fuel"?"Aviation fuel capacity %":"Serviceable aircraft")+'</span>'+(lab.mode==="unit"||lab.mode==="readiness"?'<span><i style="background:#537686"></i>Non-serviceable aircraft</span>':"")+'</div>';
 host.innerHTML=svg;
 host.querySelectorAll("[data-german-index]").forEach(el=>el.addEventListener("click",()=>{lab.selected=all[Number(el.dataset.germanIndex)].key;render();}));
}
function connection(chosen){
 const ar=window.GrandAirWarV77?.lossRows||[];
 const same=ar.filter(x=>x.period===chosen.period);
 const mismatch=chosen.period!==lab.month?"Selected source date "+label(chosen.period)+" is NOT a continuous observation for requested "+label(lab.month)+". ":"";
 if(!same.length)return mismatch+"No matching command-month German aircraft return is available for this period. The original losses panel can be explored separately.";
 return mismatch+same.map(x=>x.theater+": "+fmt(x.destroyed)+" aircraft destroyed").join("; ")+". Those are different command populations and types of measurement, not a ratio with the number shown here.";
}
function render(){
 if(!$("german-chart"))return;
 const desc=names[lab.mode],a=rows(),chosen=selected();
 document.querySelectorAll("[data-german-mode]").forEach(b=>{const active=b.dataset.germanMode===lab.mode;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
 $("german-overline").textContent=desc[1];$("german-series-title").textContent=desc[0];$("german-description").textContent=desc[2];$("german-caution").textContent=desc[3];
 $("german-observation-date").textContent=chosen.key.includes("JG")?chosen.key:chosen.key.length===10?chosen.key:label(chosen.period);
 $("german-observation").innerHTML=detail(chosen);
 $("german-connection").innerHTML='<h4>Context, not a replacement equation</h4><p>'+esc(connection(chosen))+'</p>';
 $("german-sources").innerHTML=sources().map(k=>'<a target="_blank" rel="noopener noreferrer" href="'+esc(D.sources[k].url)+'">'+esc(D.sources[k].name.split(",")[0])+' ↗</a>').join("");
 drawChart(a,chosen.key);
}
function exportCSV(){
 const series=rows(),lines=["period,metric,value,nonserviceable,source"];
 for(const r of series)lines.push([r.period,lab.mode,r.v,r.b,sources()[0]].join(","));
 const blob=new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download="grand-air-war-germany-"+lab.mode+".csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
function init(){
 if(!$("german-chart"))return;
 document.querySelectorAll("[data-german-mode]").forEach(b=>b.addEventListener("click",()=>switchMode(b.dataset.germanMode)));
 document.querySelectorAll("[data-german-spotlight]").forEach(b=>b.addEventListener("click",()=>{
  const mode=b.dataset.germanSpotlight,period=b.dataset.period;
  switchMode(mode);
  const target=rows().find(x=>x.key===period||x.period===period);
  if(target){lab.selected=target.key;render();}
  $("german-war-lab").scrollIntoView({behavior:"smooth",block:"start"});
 }));
 $("german-export").addEventListener("click",exportCSV);
 render();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
window.GrandAirWarV80Lab={
 setMode:switchMode,
 selectRow(key){lab.selected=key;render();},
 syncMonth(month){lab.month=month;const r=rows().find(x=>x.period===month);if(r)lab.selected=r.key;render();},
 rows,
 current:()=>({...lab})
};
})();
