/* Historical test explorer; never calls the illustrative physics solver. */
(function(){
'use strict';
const R=window.AirWarV75Aircraft;
const S={left:'spitfire-lfix-bs543',right:'p51b5-436883',altitudeFt:10000,reconstruct:false,mode:'historical'};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=n=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:1}):'—';
const charts=new Map(),attached=new WeakSet();
function registerChart(id,data){charts.set(id,data);}
function enhanceAll(){
 for(const [id,data] of charts){
  const svg=document.getElementById(id);if(!svg||attached.has(svg)||!data.rows.length)continue;
  attached.add(svg);
  const tip=document.createElement('div');tip.className='v75-flight-tooltip';tip.hidden=true;
  tip.setAttribute('role','status');tip.setAttribute('aria-live','polite');svg.parentElement.appendChild(tip);
  const overlay=document.createElementNS('http://www.w3.org/2000/svg','g');
  overlay.setAttribute('class','v75-flight-inspection');overlay.setAttribute('pointer-events','none');svg.appendChild(overlay);
  svg.setAttribute('tabindex','0');svg.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight Escape');
  let current=0;
  const hide=()=>{tip.hidden=true;overlay.innerHTML='';};
  const show=(index,event)=>{
   current=Math.max(0,Math.min(data.rows.length-1,index));
   const row=data.rows[current],g=data.geometry,rect=svg.getBoundingClientRect();
   const x=g.left+(row.x-g.xMin)/(g.xMax-g.xMin)*(g.width-g.left-g.right);
   overlay.innerHTML='<line x1="'+x+'" x2="'+x+'" y1="'+g.top+'" y2="'+g.bottom+'" stroke="#f1dfae" stroke-dasharray="4 4"/>'+row.values.map(v=>
    '<circle cx="'+x+'" cy="'+(g.bottom-(v.value-g.yMin)/(g.yMax-g.yMin)*(g.bottom-g.top))+'" r="7" fill="none" stroke="'+v.color+'" stroke-width="2"/>').join('');
   tip.innerHTML='<strong>'+esc(row.label)+'</strong>'+row.values.map(v=>'<div><b style="color:'+v.color+'">'+esc(v.name)+'</b><span>'+num(v.value)+' '+esc(v.unit)+'</span><small>'+esc(v.note)+'</small></div>').join('');
   tip.hidden=false;
   const box=tip.getBoundingClientRect(),px=event?.clientX??rect.left+x/g.width*rect.width,py=event?.clientY??rect.top+rect.height/2;
   const left=px+18+box.width<window.innerWidth-8?px+18:px-box.width-18;
   const top=py+14+box.height<window.innerHeight-8?py+14:py-box.height-14;
   tip.style.left=Math.max(8,Math.min(window.innerWidth-box.width-8,left))+'px';
   tip.style.top=Math.max(8,Math.min(window.innerHeight-box.height-8,top))+'px';
  };
  const inspect=e=>{
   const rect=svg.getBoundingClientRect(),g=data.geometry;
   const altitude=g.xMin+((e.clientX-rect.left)/rect.width*g.width-g.left)/(g.width-g.left-g.right)*(g.xMax-g.xMin);
   let index=0;data.rows.forEach((r,i)=>{if(Math.abs(r.x-altitude)<Math.abs(data.rows[index].x-altitude))index=i;});
   show(index,e);
  };
  svg.addEventListener('pointermove',inspect);
  svg.addEventListener('pointerdown',inspect);
  svg.addEventListener('click',inspect);
  svg.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide();});
  svg.addEventListener('focus',()=>show(current));svg.addEventListener('blur',hide);
  svg.addEventListener('keydown',e=>{
   if(e.key==='Escape')hide();
   if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1));}
  });
 }
}
function options(selected){return [...new Set(R.entries.map(e=>e.force))].filter(f=>f!=='Engineering references').map(force=>'<optgroup label="'+esc(force)+'">'+R.entries.filter(e=>e.force===force).map(e=>'<option value="'+e.id+'"'+(e.id===selected?' selected':'')+'>'+esc(e.name)+' · '+e.status+'</option>').join('')+'</optgroup>').join('');}
function scatter(a,b,metric){
 const all=[...R.observations(a.id,metric),...R.observations(b.id,metric)];
 if(!all.length)return '<p class="v75-empty">No imported '+esc(metric)+' observations for either selection. Missing is not zero.</p>';
 const W=800,H=290,L=65,T=25,B=48,RR=25;
 const xmax=Math.max(1,...all.map(p=>p.altitudeFt)),ymax=Math.max(1,...all.map(p=>p.value))*1.12;
 const px=x=>L+x/xmax*(W-L-RR),py=y=>H-B-y/ymax*(H-T-B);
 const id='v75-flight-'+metric;
 const series=[[a,'#a4c9ad',false],[b,'#e5b87f',true]];
 registerChart(id,{geometry:{width:W,left:L,right:RR,top:T,bottom:H-B,xMin:0,xMax:xmax,yMin:0,yMax:ymax},rows:[...new Set(all.map(p=>p.altitudeFt))].sort((x,y)=>x-y).map(x=>({x,label:'Reported at '+num(x)+' ft',values:series.flatMap(([entry,color])=>R.observations(entry.id,metric).filter(p=>p.altitudeFt===x).map(p=>({name:entry.name,value:p.value,unit:p.unit,color,note:p.gear+' gear · reported test result · '+R.sources[p.sourceId].title})))}))});
 let svg='<svg id="'+id+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Reported '+metric+' by altitude. Dashed lines connect observations within each gear. Hover, tap or use arrow keys to inspect reported points.">';
 for(let i=0;i<=4;i++){
  const x=xmax*i/4,y=ymax*i/4;
  svg+='<line x1="'+L+'" x2="'+(W-RR)+'" y1="'+py(y)+'" y2="'+py(y)+'" stroke="#42534b"/>'+
  '<text x="'+(L-8)+'" y="'+(py(y)+4)+'" text-anchor="end">'+num(y)+'</text><text x="'+px(x)+'" y="'+(H-25)+'" text-anchor="middle">'+num(x)+'</text>';
 }
 for(const [entry,color] of series){
  const points=R.observations(entry.id,metric);
  for(const gear of new Set(points.map(p=>p.gear))){
   const sorted=points.filter(p=>p.gear===gear).sort((p,q)=>p.altitudeFt-q.altitudeFt);
   if(sorted.length>1)svg+='<polyline class="v75-flight-connector" data-aircraft="'+entry.id+'" data-gear="'+esc(gear)+'" points="'+sorted.map(p=>px(p.altitudeFt)+','+py(p.value)).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="2.5" stroke-dasharray="7 4"/>';
  }
 }
 for(const [entry,color,square] of series)for(const p of R.observations(entry.id,metric)){
  const title=esc(entry.name+' · '+num(p.altitudeFt)+' ft · '+num(p.value)+' '+p.unit+' · '+p.gear+' · reported test result');
  svg+=square?'<rect x="'+(px(p.altitudeFt)-4)+'" y="'+(py(p.value)-4)+'" width="8" height="8" fill="'+color+'"><title>'+title+'</title></rect>':'<circle cx="'+px(p.altitudeFt)+'" cy="'+py(p.value)+'" r="5" fill="'+color+'"><title>'+title+'</title></circle>';
 }
 return '<div class="v75-test-plot">'+svg+'<text x="'+(W/2)+'" y="'+(H-3)+'" text-anchor="middle">Altitude · ft</text></svg></div><p class="v75-caption">Circle: '+esc(a.name)+' · Square: '+esc(b.name)+'. '+(metric==='speed'?'True airspeed · mph.':'Climb rate · ft/min.')+' Dashed lines connect reported points within each supercharger gear as visual guides; they are not additional measurements. Breaks separate gears. Hover, tap or use arrow keys for the nearest reported altitude and its available results. Test weights, ratings and cooling conditions differ; this is not a controlled ranking. Exact values are in the tables below.</p>';
}
function card(e){
 const src=R.sources[e.sourceId],points=e.observations;
 const values=['speed','climb'].map(metric=>{
  const found=R.atAltitude(e.id,metric,S.altitudeFt,S.reconstruct);
  return '<div><b>'+esc(metric==='speed'?'Speed':'Climb')+'</b>: '+(found.length?found.map(p=>'<span class="v75-result" data-status="'+p.status+'">'+num(p.value)+' '+esc(p.unit)+' · '+esc(p.gear)+' · <strong>'+p.status+'</strong></span>').join(' / '):'Unavailable at this altitude')+'</div>';
 }).join('');
 const conflicts=R.conflicts.filter(c=>c.configurationId===e.id);
 return '<section class="v75-panel v75-test-card" data-aircraft="'+e.id+'"><h3>'+esc(e.name)+'</h3><p class="v75-evidence-badge" data-status="'+e.status+'">'+esc(R.statuses[e.status])+'</p>'+
 '<p>'+esc(e.force)+' · '+esc(e.engine||'Engine configuration pending audit')+'</p><p>'+esc(e.conditions)+'</p><p class="v75-caption">'+esc(e.correction)+'</p>'+
 (src?'<p><a href="'+esc(src.url)+'" target="_blank" rel="noopener noreferrer">'+esc(src.title)+'</a><br><small>'+esc(src.locator)+' · '+esc(src.verification)+'</small></p>':'')+
 '<div class="v75-altitude-readout" aria-live="polite"><h4>At '+num(S.altitudeFt)+' ft</h4>'+values+'</div>'+
 '<p class="v75-scope">'+(points.length?'Historical physics model unavailable: no independently validated drag, engine and propeller fit.':'Research placeholder: no numbers, curves or generic aircraft substitution.')+'</p>'+
 (conflicts.length?'<details><summary>Source discrepancies retained ('+conflicts.length+')</summary>'+conflicts.map(c=>'<p>'+num(c.altitudeFt)+' ft · '+esc(c.metric)+': summary '+num(c.summary)+', detailed table '+num(c.detail)+' '+esc(c.unit)+'. '+esc(c.resolution)+'</p>').join('')+'</details>':'')+
 (points.length?'<details class="v75-details"><summary>Audit all '+points.length+' reported points</summary><div class="v75-table-scroll"><table><caption>'+esc(e.name)+' · source units preserved</caption><thead><tr><th scope="col">Metric</th><th scope="col">Altitude (ft)</th><th scope="col">Result</th><th scope="col">Gear</th></tr></thead><tbody>'+points.map(p=>'<tr><th scope="row">'+esc(p.metric)+'</th><td>'+num(p.altitudeFt)+'</td><td>'+num(p.value)+' '+esc(p.unit)+'</td><td>'+esc(p.gear)+'</td></tr>').join('')+'</tbody></table></div></details>':'')+'</section>';
}
function render(ctx){
 const measured=R.entries.filter(e=>e.status==='measured').length,pending=R.entries.filter(e=>e.status==='placeholder').length;
 const intro='<div class="v75-intro"><span class="kicker">AIRCRAFT PERFORMANCE LAB</span><h2>Variants, flight tests & engineering</h2><p>'+measured+' test configurations with reported results · '+pending+' research placeholders · '+R.entries.filter(e=>e.status==='illustrative').length+' illustrative references. Coverage is an expandable research queue, not a complete inventory of European wartime aircraft or operators.</p></div>';
 const modes='<label class="v75-lab-label">Explore<select id="v75-performance-mode"><option value="historical"'+(S.mode==='historical'?' selected':'')+'>Historical aircraft & test evidence</option><option value="illustrative"'+(S.mode==='illustrative'?' selected':'')+'>Illustrative engineering sandbox</option></select></label>';
 if(S.mode==='illustrative')return intro+modes+window.AirWarV75Lab.aircraftView(ctx);
 const a=R.get(S.left),b=R.get(S.right);
 return intro+modes+'<div class="v75-lab-controls"><label class="v75-lab-label">Aircraft A<select id="v75-performance-left">'+options(a.id)+'</select></label><label class="v75-lab-label">Aircraft B<select id="v75-performance-right">'+options(b.id)+'</select></label>'+
 '<label class="v75-lab-label">Inspect altitude (ft)<input id="v75-performance-altitude" type="number" min="0" max="45000" step="100" value="'+S.altitudeFt+'"></label><label class="v75-lab-label">Altitude readout<select id="v75-performance-reconstruct"><option value="false"'+(!S.reconstruct?' selected':'')+'>Exact reported points only</option><option value="true"'+(S.reconstruct?' selected':'')+'>Allow labeled reconstruction</option></select></label></div>'+
 '<p class="v75-scope"><strong>Four evidence states:</strong> measured = report test results; reconstructed = our interpolation; placeholder = no imported data; illustrative = generic assumptions. Reported measurements may already be corrected or faired by their authors. None of these historical entries has a validated physics model. Test reports are independent of the atlas date and theatre filters.</p>'+
 (S.reconstruct?'<p class="v75-scope">Reconstruction uses straight lines only between points for the same aircraft, test, metric and supercharger gear. It does not extrapolate or bridge gear changes. Sparse points can hide peaks; uncertainty is unquantified. Source conditions stay fixed.</p>':'<p class="v75-caption">A blank altitude readout means no exact observation. Change the altitude or explicitly enable reconstruction; there is no nearest-point substitution.</p>')+
 '<section class="v75-panel"><h3>Reported level-speed test points</h3>'+scatter(a,b,'speed')+'</section><section class="v75-panel"><h3>Reported climb test points</h3>'+scatter(a,b,'climb')+'</section>'+
 '<div class="v75-air-twins">'+card(a)+card(b)+'</div>';
}
function change(id,value){
 if(id==='v75-performance-mode'&&['historical','illustrative'].includes(value)){S.mode=value;return true;}
 if(['v75-performance-left','v75-performance-right'].includes(id)){
  const e=R.get(value);if(!e||e.status==='illustrative')return false;
  S[id.endsWith('left')?'left':'right']=value;return true;
 }
 if(id==='v75-performance-altitude'){
  if(String(value).trim()==='')return false;
  const n=Number(value);if(!Number.isFinite(n)||n<0||n>45000)return false;S.altitudeFt=n;return true;
 }
 if(id==='v75-performance-reconstruct'&&['true','false'].includes(value)){S.reconstruct=value==='true';return true;}
 return false;
}
window.AirWarV75AircraftView={state:S,render,change,registerChart,enhanceAll};
})();
