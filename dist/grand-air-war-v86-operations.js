/* Atlas v8.6: an operation, its dated geography and its evidence stay together. */
(function(){
'use strict';
const D=window.NormandyV86Data,A=window.GrandAirWarV77;
if(!D||!A||!document.getElementById('normandy-operations'))return;
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let operation=null,step=0,navigating=false,focusPlace=null;
const source=(id,page)=>{const s=D.sources[id];return s?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+(page?' · '+esc(page):'')+' ↗</a>':'';};
const factsFor=op=>D.observations.filter(f=>f.operation===op.id);
const metric=f=>(f.qualifier==='more than'?'> ':'')+f.value.toLocaleString('en-US');
function sync(){
 const visible=A.selected()==='normandy';
 $('normandy-operations').hidden=!visible;
 if(!visible){operation=null;focusPlace=null;}
 $('operation-dossier').hidden=!visible||!operation;
 $('campaign-dossier').hidden=visible&&!!operation;
 $('operation-evidence').hidden=!visible||!operation;
 document.querySelectorAll('[data-operation]').forEach(b=>{const selected=b.dataset.operation===operation?.id;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);});
}
function clear(){operation=null;focusPlace=null;sync();A.refreshMap();if(window.location?.hash?.startsWith('#operation='))window.history?.replaceState(null,'',window.location.pathname+window.location.search);}
function choose(id,index=0){
 const next=D.operations.find(o=>o.id===id);if(!next)return false;
 const value=Number(index);if(!Number.isInteger(value)||value<0||value>=next.snapshots.length)return false;
 operation=next;step=value;focusPlace=null;navigating=true;
 try{
  A.choose('normandy',false);
  const snapshot=operation.snapshots[step],campaign=A.campaigns.find(c=>c.id==='normandy');
  const chapter=campaign.chapters.find(ch=>ch.start<=snapshot.date&&snapshot.date<=ch.end);
  if(chapter)A.chooseChapter(chapter.id);
  A.setMonth(snapshot.date.slice(0,7));
 }finally{navigating=false;}
 render();A.refreshMap();
 const map=A.map(),L=window.L;
 if(map&&L){const s=operation.snapshots[step];const points=s.points.map(k=>D.places[k].slice(1));if(points.length)map.flyToBounds(L.latLngBounds(points).pad(.35),{maxZoom:operation.id==='dday'?9:10,duration:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:.4});}
 if(window.history?.replaceState&&window.location)window.history.replaceState(null,'','#operation='+operation.id+'&step='+step);
 return true;
}
function render(){
 sync();if(!operation)return;
 const s=operation.snapshots[step],op=operation;
 $('operation-dossier').innerHTML='<div class="eyebrow">NORMANDY · OPERATION '+(D.operations.indexOf(op)+1)+' OF 5</div><h2>'+esc(op.name)+'</h2><p class="operation-question">'+esc(op.question)+'</p>'+
 '<div class="operation-step-heading"><span>'+esc(s.date)+'</span><strong>'+esc(s.title)+'</strong></div><p class="operation-step-copy">'+esc(s.text)+'</p>'+
 '<nav class="operation-stepper" aria-label="Dated battlefield snapshots">'+op.snapshots.map((x,i)=>'<button type="button" data-operation-step="'+i+'" aria-current="'+(i===step?'step':'false')+'"><span>'+esc(x.date.slice(5))+'</span>'+esc(x.title)+'</button>').join('')+'</nav>'+
 '<div class="operation-step-actions"><button type="button" id="operation-prev"'+(step===0?' disabled':'')+'>← Previous snapshot</button><button type="button" id="operation-next"'+(step===op.snapshots.length-1?' disabled':'')+'>Next snapshot →</button></div>'+
 '<div class="operation-map-detail" id="operation-map-detail" aria-live="polite">Choose a labelled place or direction on the map to inspect its role.</div>'+
 '<div class="operation-snapshot-source">'+source(s.source,s.page)+'</div><a class="operation-evidence-jump" href="#operation-evidence">Read the operation, formations and evidence ↓</a><button type="button" id="operation-close" class="subtle">Return to campaign overview</button>';
 document.querySelectorAll('[data-operation-step]').forEach(b=>b.addEventListener('click',()=>choose(op.id,Number(b.dataset.operationStep))));
 $('operation-prev').addEventListener('click',()=>choose(op.id,step-1));$('operation-next').addEventListener('click',()=>choose(op.id,step+1));$('operation-close').addEventListener('click',clear);
 const fields=D.airfields.filter(f=>op.fields.includes(f.id));
 $('operation-evidence').innerHTML='<div class="operation-evidence-top"><div><span class="eyebrow">THE OPERATION IN CONTEXT</span><h2>'+esc(op.name)+' · '+esc(op.subtitle)+'</h2></div><span>'+esc(op.start)+' to '+esc(op.end)+'</span></div>'+
 '<div class="operation-narrative">'+[['The intention',op.intent],['What aircraft did',op.air],['The German response',op.opposition],['What changed',op.consequence]].map(([title,text])=>'<article><h3>'+title+'</h3><p>'+esc(text)+'</p></article>').join('')+'</div>'+
 '<div class="operation-source-trail">'+op.sources.map(id=>source(id)).join('')+'</div>'+
 '<h3 class="operation-subheading">Operational evidence <span>'+factsFor(op).length+' observations</span></h3><p class="operation-scope-note">Each figure keeps its own date, formation and reporting area. Aircraft, squadrons, sorties, personnel and bomb tonnage are different measures.</p>'+
 '<div class="operation-facts">'+factsFor(op).map(f=>'<article class="operation-fact" data-observation="'+esc(f.id)+'"><span class="operation-fact-date">'+esc(f.period?f.period.start+' to '+f.period.end:f.date)+'</span><strong>'+esc(metric(f))+'<small>'+esc(f.unit)+'</small></strong><h4>'+esc(f.label)+'</h4><p>'+esc(f.scope)+'</p><span class="operation-evidence-class">'+esc(f.evidenceClass)+'</span>'+source(f.source,f.page)+'</article>').join('')+'</div>'+
 (op.id==='dday'?'<p class="operation-interpretation"><strong>Read the allocation:</strong> 15 + 54 + 33 + 33 + 36 = 171 squadrons. The total is not a sixth additional task and cannot be added to its five components.</p>':'')+
 (op.id==='cobra'?'<p class="operation-interpretation"><strong>Friendly-fire losses:</strong> the 111 killed and 490 wounded refer to 25 July ground personnel. The separate 24 July incident is described in the first snapshot; neither count is an aircraft-loss figure.</p>':'')+
 (op.id==='mortain'?'<p class="operation-interpretation"><strong>Three different scopes:</strong> 294 is local Typhoon activity on 7 August; 2,193 covers wider Typhoon operations over five days; 4,012 is IX TAC over seven days. These figures overlap in time and are not summed. Ground investigation found that air claims overstated tank destruction.</p>':'')+
 '<h3 class="operation-subheading">The formations behind the operation</h3><div class="operation-formations">'+op.formations.map(id=>{const f=D.formations[id];return '<article data-formation="'+esc(id)+'" class="'+(f.side==='German'?'axis':'')+'"><span>'+esc(f.side+' · '+f.level)+'</span><h4>'+esc(f.name)+'</h4><strong>'+esc(f.aircraft)+'</strong><p>'+esc(f.role)+'</p>'+source(f.source,f.page)+'</article>';}).join('')+'</div>'+
 '<h3 class="operation-subheading">Forward airfields · what was ready, and when?</h3><p class="operation-scope-note">These are relevant basing examples. An opening date does not establish a unit’s presence on every later day, current serviceability, or the origin of a particular strike.</p><div class="operation-fields">'+fields.map(f=>'<article><span class="operation-field-status">'+(f.firstUse<=s.date?'Known first use by this snapshot':'First use after this snapshot')+'</span><h4>'+esc(f.id+' · '+f.name)+'</h4><strong>'+esc(f.firstUse)+'</strong><p>'+esc(f.dateMeaning)+'</p><p>'+esc(f.unit)+'</p>'+source(f.source,f.page)+'</article>').join('')+'</div>'+
 '<div class="operation-connections"><a href="#campaigns">Continue through the nine campaign chapters ↓</a><a href="./grand-air-war-v76.html">Open the detailed forward-airfield notebook ↗</a><button type="button" id="operation-export">Export these evidence records</button></div>';
 $('operation-export').addEventListener('click',()=>{
  const records=factsFor(op).map(f=>({...f,sourceTitle:D.sources[f.source].title,sourceUrl:D.sources[f.source].url}));
  const blob=new Blob([JSON.stringify({version:D.version,operation:op.id,observations:records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='normandy-'+op.id+'-evidence-v86.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 });
}
function placeDetail(key){
 if(!operation)return;focusPlace=key;const s=operation.snapshots[step];
 $('operation-map-detail').innerHTML='<strong>'+esc(D.places[key][0])+'</strong><p>'+esc(s.text)+'</p>'+source(s.source,s.page);
 A.refreshMap();
}
function draw(state){
 if(!operation||state.selected!=='normandy')return false;
 const L=window.L,map=state.map,layer=state.mapMarkers,s=operation.snapshots[step];
 layer.clearLayers();
 if(!map.getPane?.('operation-paths')){const pane=map.createPane?.('operation-paths');if(pane)pane.style.zIndex='450';}
 $('map-heading').textContent=operation.name+' · '+s.date+' · '+s.title;
 $('map-legend').innerHTML='<span class="op-key allies"></span> Allied advance <span class="op-key axis"></span> German movement <span class="op-key plan"></span> Dashed = planned ground direction · squares = fields with first use by this date';
 $('map-source-note').textContent='Approximate localities and schematic ground directions; no aircraft tracks or continuous front lines. Snapshot source below.';
 for(const link of s.links){
  const from=D.places[link.from],to=D.places[link.to],enemy=link.kind.startsWith('enemy')||link.kind==='retreat',planned=link.kind.includes('plan'),color=enemy?'#e59582':'#83e2d0';
  const line=L.polyline([from.slice(1),to.slice(1)],{pane:'operation-paths',className:'operation-ground-path',color,weight:4,opacity:.95,dashArray:planned?'8 7':null});
  line.bindTooltip?.(link.label+' · schematic ground direction');line.on?.('click',()=>{$('operation-map-detail').innerHTML='<strong>'+esc(link.label)+'</strong><p>'+esc(from[0]+' → '+to[0])+'. '+(planned?'Intended direction, not proof of capture.':'Schematic connection between documented places, not a surveyed path.')+'</p>'+source(s.source,s.page);});layer.addLayer(line);
  const p1=map.latLngToContainerPoint(from.slice(1)),p2=map.latLngToContainerPoint(to.slice(1));
  const angle=Math.atan2(p2.x-p1.x,p1.y-p2.y)*180/Math.PI;
  const arrow=L.marker([(from[1]+to[1])/2,(from[2]+to[2])/2],{interactive:false,icon:L.divIcon({className:'gaw-icon',html:'<span class="operation-arrow" style="color:'+color+';transform:rotate('+angle+'deg)">▲</span>',iconSize:[20,20],iconAnchor:[10,10]})});layer.addLayer(arrow);
 }
 // Locality labels at one coordinate can overlap at small viewport widths.
 // Keep the dots at their coordinates and stagger the label offsets vertically.
 const occupied=[];
 for(const key of s.points){
  const p=D.places[key],xy=map.latLngToContainerPoint(p.slice(1));let offset=0;
  while(occupied.some(q=>Math.abs(q.x-xy.x)<140&&Math.abs(q.y-(xy.y+offset))<30))offset+=32;
  occupied.push({x:xy.x,y:xy.y+offset});
  const left=xy.x>(map.getSize?.().x||900)-150;
  const label=L.divIcon({className:'gaw-icon',html:'<span class="operation-place'+(left?' label-left':'')+(key===focusPlace?' focused':'')+'"><i></i>'+(offset?'<em class="operation-label-leader" style="height:'+offset+'px"></em>':'')+'<b style="transform:translateY('+offset+'px)">'+esc(p[0])+'</b></span>',iconSize:[16,16],iconAnchor:[8,8]});
  const marker=L.marker(p.slice(1),{icon:label,keyboard:true,title:p[0]+' · inspect '+operation.name,zIndexOffset:1100});marker.on('click',()=>placeDetail(key));marker.bindTooltip?.(p[0]+' · '+s.date);layer.addLayer(marker);
 }
 for(const f of D.airfields.filter(f=>operation.fields.includes(f.id)&&f.firstUse<=s.date)){
  const xy=map.latLngToContainerPoint([f.lat,f.lng]),size=map.getSize?.();if(size&&(xy.x<20||xy.x>size.x-20||xy.y<15||xy.y>size.y-15))continue;
  const marker=L.marker([f.lat,f.lng],{keyboard:true,title:f.id+' '+f.name+' · dated first use',icon:L.divIcon({className:'gaw-icon',html:'<span class="operation-base">'+esc(f.id)+'</span>',iconSize:[34,22],iconAnchor:[17,11]}),zIndexOffset:900});
  marker.on('click',()=>{$('operation-map-detail').innerHTML='<strong>'+esc(f.id+' · '+f.name)+'</strong><p>'+esc(f.dateMeaning)+'</p><p>'+esc(f.unit)+'. A base relationship is not a recovered mission departure record.</p>'+source(f.source,f.page);});marker.bindTooltip?.(f.name+' · first use '+f.firstUse);layer.addLayer(marker);
 }
 return true;
}
$('operation-choices').innerHTML=D.operations.map((op,i)=>'<button type="button" data-operation="'+op.id+'" aria-pressed="false"><span>0'+(i+1)+' · '+esc(op.start.slice(5))+'</span><strong>'+esc(op.name)+'</strong><small>'+esc(op.subtitle)+'</small></button>').join('');
document.querySelectorAll('[data-operation]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.operation)));
window.AtlasNormandyOperations={choose,clear,sync,draw,onNavigate(){if(!navigating)clear();},current:()=>operation?{operation:operation.id,step,date:operation.snapshots[step].date}:null,data:D};
sync();
try{const params=new URLSearchParams(window.location?.hash?.slice(1)||'');const id=params.get('operation');if(id)choose(id,Number(params.get('step')||0));}catch{/* Invalid links leave the campaign overview usable. */}
})();
