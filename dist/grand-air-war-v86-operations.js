/* Dated operations, maps and evidence for the Atlas campaign explorer. */
(function(){
'use strict';
const A=window.GrandAirWarV77,C=window.GrandAirWarV77Campaigns;
const datasets=[window.NormandyV86Data,window.BritainV87Data].filter(Boolean);
if(!datasets.length||!A||!C||!document.getElementById('normandy-operations'))return;
const $=id=>document.getElementById(id),esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let D=datasets[0],choicesCampaign=null,operation=null,step=0,navigating=false,focusPlace=null;
const evidenceSource=id=>D.sources[id]||C.sources[id];
const source=(id,page)=>{const s=evidenceSource(id);return s?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+(page?' · '+esc(page):'')+' ↗</a>':'';};
const metric=f=>(f.qualifier==='more than'?'> ':'')+f.value.toLocaleString('en-US');

function factsFor(op) {
 const observations=D.observations.filter(fact=>fact.operation===op.id);
 const campaign=C.campaigns.find(campaign=>campaign.id===D.campaign);
 for(const reference of op.campaignEvidence||[]) {
  const fact=campaign?.facts.find(fact=>reference.factId?fact.id===reference.factId:fact.label===reference.factLabel);
  if(fact)observations.push({
   ...fact,
   id:fact.id||reference.id,
   operation:op.id,
   source:fact.sourceId,
   evidenceClass:reference.evidenceClass,
   shortLabel:reference.shortLabel
  });
 }
 const row=campaign?.opponentReturnSeries?.days.find(row=>row.date===op.returnDate);
 if(row){
  const figures=[
   ['losses','German aircraft recorded destroyed',row.germanDestroyed,'aircraft','Postwar official comparison'],
   ['damage','German aircraft recorded damaged',row.germanDamaged,'aircraft','Postwar official comparison'],
   ['claims','RAF claims of German aircraft destroyed',row.rafClaim,'aircraft claimed','Wartime claims in postwar comparison']
  ];
  for(const [measure,label,value,unit,evidenceClass] of figures)observations.push({
   id:op.id+'-'+measure,operation:op.id,date:row.date,source:row.sourceId,
   page:'14 May 1947, selected days of intensive fighting',
   measure,label,value,unit,evidenceClass,
   scope:'The full reporting day in the Parliamentary comparison of contemporary RAF estimates and German records.'
  });
 }
 return observations;
}

function renderSnapshotFigures(facts,snapshot) {
 const groups=A.groupEvidence(facts.filter(fact=>fact.date===snapshot.date&&!fact.period));
 const keys=['aircraft-losses','personnel-casualties','sorties'];
 const important=groups.filter(group=>keys.includes(group.id));
 const rows=(important.length?important:groups.filter(group=>group.id==='victory-claims'))
  .flatMap(group=>group.facts.slice(0,2)).slice(0,4);
 if(!rows.length)return '';
 return '<section class="operation-snapshot-figures" data-snapshot-date="'+esc(snapshot.date)+'">'+
  '<h3>Reported figures for this date</h3><ul>'+rows.map(fact=>
   '<li data-snapshot-figure="'+esc(fact.id)+'"><strong>'+esc(metric(fact))+'</strong>'+
   '<span>'+esc(fact.shortLabel||fact.label)+'<small>'+esc(fact.evidenceClass)+'</small></span></li>'
  ).join('')+'</ul></section>';
}

function renderEvidenceFact(fact) {
 const date=fact.period?fact.period.start+' to '+fact.period.end:fact.date;
 return '<article class="operation-fact" data-observation="'+esc(fact.id)+'">'+
  '<span class="operation-fact-date">'+esc(date)+'</span>'+
  '<strong>'+esc(metric(fact))+'<small>'+esc(fact.unit)+'</small></strong>'+
  '<h5>'+esc(fact.label)+'</h5><p>'+esc(fact.scope)+'</p>'+
  '<span class="operation-evidence-class">'+esc(fact.evidenceClass)+'</span>'+
  source(fact.source,fact.page)+'</article>';
}

function renderEvidenceGroups(op,groups) {
 const lossGap=groups.some(group=>group.id==='aircraft-losses')?'':(
  '<section class="operation-evidence-group" data-evidence-group="aircraft-losses">'+
  '<h4>Aircraft losses</h4><p class="operation-scope-note">Aircraft-loss figures for this operation are unavailable in the Atlas.</p></section>'
 );
 const sections=groups.map(group=>{
  const context=op.id==='cobra'&&group.id==='personnel-casualties'
   ? '<p class="operation-interpretation">These ground casualties cover the 25 July short bombing. The 24 July incident has its own snapshot.</p>'
   : '';
  return '<section class="operation-evidence-group" data-evidence-group="'+group.id+'">'+
   '<h4>'+group.title+'</h4><div class="operation-facts">'+
   group.facts.map(renderEvidenceFact).join('')+'</div>'+context+'</section>';
 });
 return '<div class="operation-evidence-figures">'+lossGap+sections.join('')+'</div>';
}
function sync(){
 const selected=datasets.find(dataset=>dataset.campaign===A.selected());
 const visible=!!selected;
 if(selected&&selected!==D){D=selected;operation=null;focusPlace=null;}
 if(visible&&choicesCampaign!==D.campaign)renderChoices();
 document.querySelector?.('.mainstage')?.classList.toggle('operation-layout',visible&&!!operation);
 $('normandy-operations').hidden=!visible;
 if(!visible){operation=null;focusPlace=null;}
 $('operation-dossier').hidden=!visible||!operation;
 $('campaign-dossier').hidden=visible&&!!operation;
 $('operation-evidence').hidden=!visible||!operation;
 document.querySelectorAll('[data-operation]').forEach(b=>{const selected=b.dataset.operation===operation?.id;b.setAttribute('aria-pressed',String(selected));b.classList.toggle('selected',selected);});
}
function clear(){operation=null;focusPlace=null;sync();A.refreshMap();if(window.location?.hash?.startsWith('#operation='))window.history?.replaceState(null,'',window.location.pathname+window.location.search);}
function choose(id,index=0){
 const dataset=datasets.find(dataset=>dataset.operations.some(op=>op.id===id));
 const next=dataset?.operations.find(op=>op.id===id);if(!next)return false;
 const value=Number(index);if(!Number.isInteger(value)||value<0||value>=next.snapshots.length)return false;
 D=dataset;operation=next;step=value;focusPlace=null;navigating=true;
 try{
  A.choose(D.campaign,false);
  const snapshot=operation.snapshots[step],campaign=A.campaigns.find(c=>c.id===D.campaign);
  const chapter=campaign.chapters.find(ch=>ch.start<=snapshot.date&&snapshot.date<=ch.end);
  if(chapter)A.chooseChapter(chapter.id,false);
  A.setMonth(snapshot.date.slice(0,7));
 }finally{navigating=false;}
 render();A.refreshMap();
 const map=A.map(),L=window.L;
 if(map&&L){
  // One settled view per snapshot. The chapter fit used to start a competing
  // flight, leaving coastlines and labels on different animation frames.
  map.stop?.();map.invalidateSize?.({pan:false});
  const s=operation.snapshots[step],points=s.points.map(k=>D.places[k].slice(1));
  if(points.length)map.fitBounds(L.latLngBounds(points).pad(.35),{maxZoom:operation.id==='dday'?10:12,animate:false});
 }
 if(window.history?.replaceState&&window.location)window.history.replaceState(null,'','#operation='+operation.id+'&step='+step);
 return true;
}
function render(){
 sync();if(!operation)return;
 const active=document.activeElement;
 const focusSelector=active?.closest?.('#operation-dossier')?(active.id?'#'+active.id:active.dataset?.operationStep!==undefined?'[data-operation-step="'+active.dataset.operationStep+'"]':null):null;
 const s=operation.snapshots[step],op=operation;
 const facts=factsFor(op),groups=A.groupEvidence(facts);
 const campaign=C.campaigns.find(c=>c.id===D.campaign);
 const stepper=op.snapshots.length>1?(
  '<nav class="operation-stepper" aria-label="Dated battlefield snapshots">'+op.snapshots.map((x,i)=>'<button type="button" data-operation-step="'+i+'" aria-current="'+(i===step?'step':'false')+'"><span>'+esc(x.date.slice(5))+'</span>'+esc(x.title)+'</button>').join('')+'</nav>'+
  '<div class="operation-step-actions"><button type="button" id="operation-prev"'+(step===0?' disabled':'')+'>← Previous snapshot</button><button type="button" id="operation-next"'+(step===op.snapshots.length-1?' disabled':'')+'>Next snapshot →</button></div>'
 ):'';
 $('operation-dossier').innerHTML='<div class="eyebrow">'+esc(D.name||'Normandy')+'</div><h2>'+esc(op.name)+'</h2><p class="operation-question">'+esc(op.question)+'</p>'+
 '<div class="operation-step-heading"><span>'+esc(s.date)+'</span><strong>'+esc(s.title)+'</strong></div><p class="operation-step-copy">'+esc(s.text)+'</p>'+
 stepper+renderSnapshotFigures(facts,s)+
 '<div class="operation-map-detail" id="operation-map-detail" aria-live="polite">Choose a labelled place or direction on the map to inspect its role.</div>'+
 '<div class="operation-snapshot-source">'+source(s.source,s.page)+'</div><a class="operation-evidence-jump" href="#operation-evidence">Read the operation, formations and evidence ↓</a><button type="button" id="operation-close" class="subtle">Return to campaign overview</button>';
 document.querySelectorAll('[data-operation-step]').forEach(b=>b.addEventListener('click',()=>choose(op.id,Number(b.dataset.operationStep))));
 $('operation-prev')?.addEventListener('click',()=>choose(op.id,step-1));$('operation-next')?.addEventListener('click',()=>choose(op.id,step+1));$('operation-close').addEventListener('click',clear);
 $('operation-dossier').querySelector('.operation-evidence-jump')?.addEventListener('click',event=>{
  event.preventDefault();
  $('operation-evidence').scrollIntoView();
 });
 // Keep repeated keyboard navigation on the replacement control.
 if(focusSelector){const target=$('operation-dossier').querySelector(focusSelector);(target&&!target.disabled?target:$('operation-dossier').querySelector('[aria-current=step]'))?.focus({preventScroll:true});}
 const fields=D.airfields.filter(f=>op.fields.includes(f.id));
 $('operation-evidence').innerHTML='<div class="operation-evidence-top"><div><span class="eyebrow">THE OPERATION IN CONTEXT</span><h2>'+esc(op.name)+' · '+esc(op.subtitle)+'</h2></div><span>'+esc(op.start)+' to '+esc(op.end)+'</span></div>'+
 '<div class="operation-narrative">'+[['The intention',op.intent],['What aircraft did',op.air],[D.campaign==='britain'?'The British defence':'The German response',op.opposition],['What changed',op.consequence]].map(([title,text])=>'<article><h3>'+title+'</h3><p>'+esc(text)+'</p></article>').join('')+'</div>'+
 '<div class="operation-source-trail">'+op.sources.map(id=>source(id)).join('')+'</div>'+
 '<h3 class="operation-subheading">Operational evidence <span>'+facts.length+' observations</span></h3><p class="operation-scope-note">Dates, formations and reporting areas are shown with each figure.</p>'+
 renderEvidenceGroups(op,groups)+
 (op.returnDate?A.renderBritainClaimReview(campaign,op.returnDate):'')+
 (op.id==='dday'?'<p class="operation-interpretation"><strong>Read the allocation:</strong> 15 + 54 + 33 + 33 + 36 = 171 squadrons. The total is not a sixth additional task and cannot be added to its five components.</p>':'')+
 (op.id==='mortain'?'<p class="operation-interpretation"><strong>Three different scopes:</strong> 294 is local Typhoon activity on 7 August; 2,193 covers wider Typhoon operations over five days; 4,012 is IX TAC over seven days. These figures overlap in time and are not summed. Ground investigation found that air claims overstated tank destruction.</p>':'')+
 '<h3 class="operation-subheading">The formations behind the operation</h3><div class="operation-formations">'+op.formations.map(id=>{const f=D.formations[id];return '<article data-formation="'+esc(id)+'" class="'+(f.side==='German'?'axis':'')+'"><span>'+esc(f.side+' · '+f.level)+'</span><h4>'+esc(f.name)+'</h4><strong>'+esc(f.aircraft)+'</strong><p>'+esc(f.role)+'</p>'+source(f.source,f.page)+'</article>';}).join('')+'</div>'+
 (fields.length?'<h3 class="operation-subheading">Forward airfields</h3><p class="operation-scope-note">The dates show first use. Unit presence and serviceability depend on the reporting date.</p><div class="operation-fields">'+fields.map(f=>'<article><span class="operation-field-status">'+(f.firstUse<=s.date?'Known first use by this snapshot':'First use after this snapshot')+'</span><h4>'+esc(f.id+' · '+f.name)+'</h4><strong>'+esc(f.firstUse)+'</strong><p>'+esc(f.dateMeaning)+'</p><p>'+esc(f.unit)+'</p>'+source(f.source,f.page)+'</article>').join('')+'</div>':'')+
 '<div class="operation-connections"><a href="#campaigns">Continue through the campaign chapters ↓</a>'+
 (D.campaign==='normandy'?'<a href="./grand-air-war-v76.html">Open the detailed forward-airfield notebook ↗</a>':'')+
 '<button type="button" id="operation-export">Export these evidence records</button></div>';
 $('operation-export').addEventListener('click',()=>{
  const records=groups.flatMap(group=>group.facts).map(fact=>{
   const reference=evidenceSource(fact.source);
   return {...fact,sourceTitle:reference.title,sourceUrl:reference.url};
  });
  const blob=new Blob([JSON.stringify({version:D.version,operation:op.id,observations:records},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=D.campaign+'-'+op.id+'-evidence.json';document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
 });
}
function placeDetail(key){
 if(!operation)return;focusPlace=key;const s=operation.snapshots[step];
 $('operation-map-detail').innerHTML='<strong>'+esc(D.places[key][0])+'</strong><p>'+esc(s.text)+'</p>'+source(s.source,s.page);
 A.refreshMap();
}
function draw(state){
 if(!operation||state.selected!==D.campaign)return false;
 const L=window.L,map=state.map,layer=state.mapMarkers,s=operation.snapshots[step];
 layer.clearLayers();
 if(!map.getPane?.('operation-paths')){const pane=map.createPane?.('operation-paths');if(pane)pane.style.zIndex='450';}
 $('map-heading').textContent=operation.name+' · '+s.date+' · '+s.title;
 $('map-legend').innerHTML=D.campaign==='britain'?'Labelled places show raid targets, defence areas and bases.':'<span class="op-key allies"></span> Allied advance <span class="op-key axis"></span> German movement <span class="op-key plan"></span> Dashed = planned ground direction · squares = fields with first use by this date';
 $('map-source-note').textContent=D.campaign==='britain'?'Locations are approximate. Figures describe their listed reporting areas.':'Approximate localities and schematic ground directions; no aircraft tracks or continuous front lines. Snapshot source below.';
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
function renderChoices(){
 choicesCampaign=D.campaign;
 $('normandy-operations').dataset.campaign=D.campaign;
 $('operation-intro-label').textContent=D.campaign==='britain'?'BATTLE OF BRITAIN · 1940':'NORMANDY · 1944';
 $('operation-intro-title').textContent=D.campaign==='britain'?'Four raid days':'Explore the Normandy operations';
 $('operation-choices').innerHTML=D.operations.map(op=>'<button type="button" data-operation="'+esc(op.id)+'" aria-pressed="false"><strong>'+esc(op.name)+'</strong><small>'+esc(op.subtitle)+'</small></button>').join('');
 document.querySelectorAll('[data-operation]').forEach(b=>b.addEventListener('click',()=>choose(b.dataset.operation)));
}
window.AtlasNormandyOperations={choose,clear,sync,draw,onNavigate(){if(!navigating)clear();},current:()=>operation?{operation:operation.id,step,date:operation.snapshots[step].date}:null,get data(){return D;}};
sync();
try{const params=new URLSearchParams(window.location?.hash?.slice(1)||'');const id=params.get('operation');if(id)choose(id,Number(params.get('step')||0));}catch{/* Invalid links leave the campaign overview usable. */}
})();
