/* European Air War Atlas 7.4 + opt-in 7.5 development preview. Historical baseline preserved. */
(function(){
  'use strict';
  const D=window.LuftData,V=window.LuftV4Data,X=window.AirWarV6Data,Y=window.AirWarV7Data,
    Z71=window.AirWarV71Data,U=window.AirWarV72Data,H=window.AirWarV73Data,W=window.AirWarV74Data,QA=window.LuftLabQA;
  if(!D||!V||!X||!Y||!Z71||!U||!H||!W||!QA)throw Error('Load the historical datasets, scanned return transcriptions and original simulator before the Air War Atlas.');
  const Z={...Z71,monthlyReturns:[...Z71.monthlyReturns,...U.monthlyReturns].sort((a,b)=>a.i-b.i||a.theater.localeCompare(b.theater)),
    qualityNotes:{...Z71.qualityNotes,...U.qualityNotes},
    get(i,theater){return this.monthlyReturns.find(p=>p.i===i&&p.theater===theater)||null;}};
  Object.assign(V.SOURCES,X.sourceIndex,Y.sourceIndex,Z.sourceIndex,U.sourceIndex,H.sources,W.sources);
  const $=id=>document.getElementById(id);
  const fmt=(n,d=0)=>n==null||!Number.isFinite(n)?'—':Number(n).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
  const pct=(n,d=1)=>n==null?'—':fmt(n,d)+'%';
  const money=n=>n==null?'—':'$'+fmt(n);
  const safe=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const labelQuality=q=>({recorded:'Recorded',documented:'Recorded','recorded-secondary':'Source-compiled',reference:'Sourced',derived:'Derived',
    'estimated-high':'Interpolated','estimated-low':'Estimated',estimated:'Estimated',
    interpolated:'Interpolated',allocated:'Estimated allocation',model:'Scenario only',
    provisional:'Source transcription · provisional',unavailable:'No verified figure'}[q]||q);
  const tag=(q,more='')=>'<span title="'+safe(more||labelQuality(q))+'" class="v4-tag '+
    (q==='recorded'||q==='documented'?'is-recorded':q==='recorded-secondary'||q==='estimated-high'||q==='derived'?'is-higher':
    q==='unavailable'?'is-missing':'is-lower')+'">'+labelQuality(q)+'</span>';
  const nav=[['home','Start'],['balance','Airpower overview'],['fleet','Aircraft & equipment'],['pilothistory','Pilots & experience'],
    ['losses','Losses & claims'],['comparison','Industry & operations'],['campaigns','Campaigns & archives'],['pilot','Pilot simulator'],
    ['equipment','Aircraft simulator'],['sources','Research & sources'],['about','About the project']];
  let ui={view:'home',focus:D.idx(1943,7),detailMonth:null,theater:'overall',sources:false,lossGaps:false,fwShare:33,
    markers:true,comparison:'period',weightMethod:'fleet',weights:{'P-47':45,'P-51':20,'P-38':15,'Spitfire':15,'Other Allied':5},
    airCombat:35,western:80,opsTheater:'ETO',lossAirClass:'Fighter',chartFullRange:false,archiveTheater:'All',
    v71Theater:'Both',v71Metric:'destroyed'};
  const oldRoot=document.querySelector('main.layout');
  const extra=document.createElement('section');extra.id='v4-workspace';extra.className='panel';
  extra.innerHTML='<div id="v4-head"></div><div id="v73-detail-banner"></div><div id="v73-period-banner"></div><div id="v73-feature-banner"></div><div id="v4-body"></div><div id="v73-extra"></div><div id="v4-source-panel" class="v4-sources"></div>';
  for(const el of [...oldRoot.children])if(!el.classList.contains('controls')&&!el.classList.contains('timeline-panel'))el.classList.add('v4-old-section');
  oldRoot.appendChild(extra);
  const tl=document.querySelector('.timeline-panel');
  const navRoot=document.createElement('div');navRoot.id='v4-navigation';
  const navButton=([id,title])=>'<button type="button" class="v4-nav" data-v4-tab="'+id+'">'+title+'</button>';
  const navGroup=(title,ids)=>'<div class="v74-navgroup"><span class="v74-navlabel">'+title+'</span>'+nav.filter(p=>ids.includes(p[0])).map(navButton).join('')+'</div>';
  navRoot.innerHTML='<div class="v4-navigation-title"><span class="kicker">EUROPEAN AIR WAR · 1936–1945</span>'+ 
    '<span class="tiny">Version 7.4 · visual archive · original returns and estimates kept distinct</span></div>'+ 
    '<div class="v4-navrow">'+navGroup('Home',['home'])+navGroup('EXPLORE HISTORY',['balance','fleet','pilothistory','losses','comparison','campaigns'])+
    navGroup('SIMULATIONS',['pilot','equipment'])+navGroup('RESEARCH',['sources','about'])+'</div>';
  tl.insertBefore(navRoot,tl.firstChild);
  const toolbar=document.createElement('div');toolbar.id='v4-tools';toolbar.className='v4-tools';
  toolbar.innerHTML='<div class="v73-theater" role="group" aria-label="Historical theater"><span>Theater</span>'+ 
    [['overall','Overall'],['west','Western Front'],['east','Eastern Front']].map(([id,name])=>'<button type="button" data-v73-theater="'+id+'" aria-pressed="false">'+name+'</button>').join('')+'</div>'+ 
    '<span class="v73-simulator-note" id="v73-simulator-note" hidden>Theater is research context here; the legacy German pilot/aircraft simulator has its own front-exposure controls.</span>'+ 
    '<label class="v4-check"><input type="checkbox" id="v4-estimate-gaps"> Show lower-confidence loss gap estimates</label>'+ 
    '<label class="v4-check"><input type="checkbox" id="v4-markers-check" checked> Show historical event markers</label>'+ 
    '<label class="v4-check"><input type="checkbox" id="v4-sources-check"> Show source notes</label>'+ 
    '<button class="btn" id="v4-export">Export selected data CSV</button>';
  tl.appendChild(toolbar);
  document.title='European Air War Atlas · Pilots, Aircraft and Operations 1936–1945';
  document.querySelector('h1').innerHTML='European Air War <span>Atlas</span>';
  document.querySelector('.kicker').textContent='Source-led aviation history · interactive research laboratory';
  document.querySelector('.lead').textContent='From the Condor Legion to VE Day: inspect pilot attrition, inventories, production, loss returns, credited claims and Allied airpower. Original wartime figures, interpolation and hypothetical scenarios remain distinct.';
  document.querySelector('footer').textContent='European Air War Atlas v7.4 · July 1936–8 May 1945 · archival photography, research-grade provenance, worldwide production, early Soviet returns · Browser-only website.';
  // Update an obsolete legacy v3 narrative. Monthly Murray rates through May
  // 1944 have now been transcribed; months beyond that remain scenario inputs.
  for(const tile of document.querySelectorAll('.info-card')){
    if(!tile.textContent?.includes('1942 & 1944 loss curves'))continue;
    const heading=tile.querySelector('strong'),detail=tile.querySelector('p');
    if(heading)heading.innerHTML='1942–May 1944 documented loss rates <span class="source-tag">SOURCE</span>';
    if(detail)detail.textContent='Murray’s fighter-pilot strength-loss series is entered month by month through May 1944. Earlier wartime prehistory and late-1944/1945 hazards remain explicitly modeled assumptions.';
  }

  function card(value,title,foot,color='var(--teal)'){
    return '<div class="v4-stat" style="--accent:'+color+'"><div class="v4-number">'+value+'</div><div class="v4-label">'+title+'</div><div class="v4-foot">'+foot+'</div></div>';
  }
  function section(title,sub,content){return '<section class="v4-section"><div class="v4-section-head"><h2>'+title+'</h2>'+ (sub?'<p class="small">'+sub+'</p>':'')+'</div>'+content+'</section>';}
  function panel(title,body,foot=''){return '<div class="v4-subpanel"><h3>'+title+'</h3>'+body+(foot?'<p class="tiny">'+foot+'</p>':'')+'</div>';}
  function renderHome(){
    const cards=[
      ['balance','airpower.jpg','Airpower & Aircraft','Compare Germany, the RAF, USAAF and Soviet VVS across fronts and years.','Explore airpower'],
      ['pilothistory','pilots.jpg','Pilots & Experience','Investigate aircrew strength, service experience, claims and the attrition of veteran pilots.','Explore pilots'],
      ['losses','losses.jpg','Losses & Claims','Study original German monthly returns, missing reports and the difference between losses and victories.','Analyze losses'],
      ['comparison','industry.jpg','Industry & Campaigns','Follow factory output, aircraft readiness, sorties and the industrial context of air operations.','Explore industry'],
      ['pilot','simulations.jpg','Simulations','Experiment with fighter-pilot cohorts and aircraft models. Hypotheses are clearly separate from historical counts.','Open simulations'],
      ['sources','research.jpg','Research & Archives','Browse original wartime documents, source-audit notes, cataloged leads and known gaps.','Browse archives']
    ];
    $('v4-body').innerHTML='<div class="v74-home-intro"><span class="kicker">1936 — MAY 1945 · HISTORICAL RESEARCH ATLAS</span><h2>Explore the air war from every side.</h2>'+ 
      '<p>Follow the aircraft, people, fronts, production and losses that shaped the war in the skies. Historical observations, reconstructed values and simulator scenarios are kept distinct.</p></div>'+ 
      '<div class="v74-home-grid">'+cards.map(([id,img,title,desc,cta])=>'<button class="v74-home-card" type="button" data-v74-open="'+id+'">'+ 
        '<span class="v74-home-photo"><img src="./dist/assets/'+img+'" loading="lazy" alt="Historical wartime photograph illustrating '+safe(title)+'"></span>'+ 
        '<span class="v74-home-copy"><strong>'+safe(title)+'</strong><span>'+safe(desc)+'</span><em>'+safe(cta)+' ↗</em></span></button>').join('')+'</div>'+ 
      '<div class="v74-home-bottom"><div><strong>Original evidence, not invented certainty.</strong><p>Current source series include '+W.usaFactory.length+' documented USAAF production months, '+W.sovietEarly.length+' early Soviet front/district checkpoints and '+Z.monthlyReturns.length+' original German monthly command returns. Evidence quality travels with every figure.</p></div>'+ 
      '<div><strong>Choose a front and period when you explore.</strong><p>Overall includes more than West + East. Mediterranean operations, Reich defense and Scandinavia require their own documented scopes. Detailed geographic drilldown is planned for a later release.</p></div></div>'+ 
      '<p class="v74-photo-credit">Images: RAF/Imperial War Museum collections, U.S. Army Air Forces, Library of Congress and Toni Frissell. Individual photographs, originals and rights are cataloged in the project research folder.</p>';
  }
  function cite(id){const s=V.SOURCES[id];return s?'<a href="'+s.url+'" target="_blank" rel="noreferrer">'+s.short+' ↗</a>':'';}
  function fraction(parts){let total=parts.reduce((s,x)=>s+(x.value||0),0);return '<div class="v4-stackbar">'+parts.filter(x=>x.value>0).map(p=>
    '<span title="'+safe(p.label)+': '+fmt(p.value)+'" style="width:'+(p.value/Math.max(1,total)*100).toFixed(2)+'%;background:'+p.color+'"></span>').join('')+'</div>'+ 
    '<div class="v4-legend">'+parts.map(p=>'<span><i style="background:'+p.color+'"></i>'+p.label+' '+fmt(p.value)+'</span>').join('')+'</div>';}
  function table(headers,rows){return '<div class="tablewrap"><table class="v4-table"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(cols=>
    '<tr>'+cols.map(col=>'<td>'+col+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';}
  function chart(id,rows,series,{height=252,percent=false}={}){
    const observed=rows.map((r,k)=>series.some(s=>{const v=s.value(r);return typeof v==='number'&&Number.isFinite(v);})?k:-1).filter(k=>k>=0);
    const first=observed[0],last=observed.at(-1),coverage=observed.length,missing=rows.length-coverage;
    const focus=coverage>0&&rows.length>5&&coverage/rows.length<.66&&!ui.chartFullRange;
    const plotted=focus?rows.slice(first,last+1):rows;
    (window.AirWarGraphRegistry??=new Map()).set(id,{rows:plotted,series,opts:{percent},origin:'historical'});
    if(!coverage)return '<div class="v7-empty-chart" id="'+safe(id)+'"><strong>No source observation in this period</strong><p>These months have no compatible verified measurements for the selected graph. They are not zero. Change the date window or inspect Research & sources for coverage.</p></div>';
    const W=980,H=height,L=62,R=24,T=18,B=36,innerW=W-L-R,innerH=H-T-B;
    const nums=series.flatMap(s=>plotted.map(r=>s.value(r)).filter(v=>typeof v==='number'&&Number.isFinite(v)));
    const max=Math.max(1,...nums)*1.08;
    const px=k=>L+(plotted.length>1?k/(plotted.length-1):.5)*innerW;
    const py=v=>T+innerH*(1-v/max);
    let body='<defs><pattern id="v7-gap-hatch-'+safe(id)+'" patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(40)"><rect width="9" height="9" fill="#6d6852" fill-opacity=".18"/><line x1="0" y1="0" x2="0" y2="9" stroke="#d0af70" stroke-opacity=".42" stroke-width="2"/></pattern></defs>';
    // The full-range mode visually marks every gap; no line bridges unknown months.
    if(!focus&&missing){let run=-1;for(let k=0;k<=plotted.length;k++){
      const absent=k<plotted.length&&!series.some(s=>{const v=s.value(plotted[k]);return typeof v==='number'&&Number.isFinite(v);});
      if(absent&&run<0)run=k;
      if(!absent&&run>=0){const x0=plotted.length===1?L:px(Math.max(0,run-.48));const x1=plotted.length===1?W-R:px(Math.min(plotted.length-1,k-.52));
        body+='<rect class="v7-gap-area" fill="url(#v7-gap-hatch-'+safe(id)+')" x="'+Math.max(L,x0).toFixed(1)+'" y="'+T+'" width="'+Math.max(2,Math.min(W-R,x1)-Math.max(L,x0)).toFixed(1)+'" height="'+innerH+'"><title>Missing records: '+safe(plotted[run].label)+' through '+safe(plotted[k-1].label)+'</title></rect>';run=-1;}
    }}
    for(let i=0;i<=4;i++){const y=T+innerH*(i/4);body+='<line class="v4-gridline" x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'"/><text class="v4-tick" x="'+(L-10)+'" y="'+(y+4)+'" text-anchor="end">'+fmt(max*(1-i/4),0)+(percent?'%':'')+'</text>';}
    for(let j=0;j<Math.min(5,plotted.length);j++){const k=Math.round(j*(plotted.length-1)/Math.max(1,Math.min(4,plotted.length-1)));body+='<text class="v4-tick" x="'+px(k)+'" y="'+(H-8)+'" text-anchor="middle">'+safe(plotted[k].label)+'</text>';}
    for(const s of series){
      const state=r=>s.detail?.(r)?.quality||(s.source?'recorded':'recorded');
      const style=q=>q==='recorded'||q==='documented'||q==='recorded-secondary'?'':q==='interpolated'||q==='estimated-high'?' stroke-dasharray="7 5"':' stroke-dasharray="2 6"';
      plotted.forEach((r,k)=>{
        const v=s.value(r);if(v==null||!Number.isFinite(v))return;
        if(k){const last=s.value(plotted[k-1]);if(last!=null&&Number.isFinite(last)){
          const q=state(r)==='recorded'?state(plotted[k-1]):state(r);
          body+='<path fill="none" stroke="'+s.color+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"'+style(q)+' d="M'+px(k-1).toFixed(1)+','+py(last).toFixed(1)+' L'+px(k).toFixed(1)+','+py(v).toFixed(1)+'"/>';
        }}
        if(plotted.length<=20||(!k||s.value(plotted[k-1])==null)||(k===plotted.length-1||s.value(plotted[k+1])==null))
          body+='<circle cx="'+px(k)+'" cy="'+py(v)+'" r="'+(state(r)==='recorded'||state(r)==='recorded-secondary'?4:3)+'" '+
            ((state(r)==='recorded'||state(r)==='recorded-secondary')?'fill="'+s.color+'"':'fill="#2b392f" stroke="'+s.color+'" stroke-width="1.5"')+'><title>'+safe(r.label)+': '+s.name+' '+fmt(v)+' · '+labelQuality(state(r))+'</title></circle>';
      });
    }
    const runs=[];let begin=0,was=false;rows.forEach((r,k)=>{const yes=observed.includes(k);if(k&&yes!==was){runs.push({begin,end:k-1,observed:was});begin=k;}was=yes;});runs.push({begin,end:rows.length-1,observed:was});
    const coverageMap='<div class="v7-coverage-track" role="img" aria-label="'+coverage+' of '+rows.length+' months have a plotted value">'+runs.map(run=>'<span class="'+(run.observed?'v7-covered':'v7-uncovered')+'" style="flex:'+ (run.end-run.begin+1)+'" title="'+safe(rows[run.begin].label)+'–'+safe(rows[run.end].label)+' · '+(run.observed?'value available: see tooltip for source/estimate status':'no observation')+'"></span>').join('')+'</div>';
    const gapText=missing?'<div class="v7-coverage"><span><b>'+coverage+'</b> with a value · <b>'+missing+'</b> unavailable of '+rows.length+' selected months</span>'+ (focus?'<span>Graph zoomed to '+safe(plotted[0].label)+'–'+safe(plotted.at(-1).label)+'</span>':'')+'</div>'+coverageMap+
      '<button type="button" class="v7-expand-btn" data-v7-expand="1">'+(ui.chartFullRange?'Focus on observed dates':'Show full selected period + missing months')+' ↗</button>':
      '<p class="v7-coverage">'+coverage+' months with a value · see tooltip for recorded versus estimated status</p>';
    return '<svg class="v4-plot" id="'+id+'" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+safe(series.map(s=>s.name).join(' and '))+' across '+safe(plotted[0].label)+' to '+safe(plotted.at(-1).label)+'">'+body+'</svg>'+gapText+ 
      '<div class="v4-legend">'+series.map(s=>'<span><i style="background:'+s.color+'"></i>'+safe(s.name)+'</span>').join('')+'</div><p class="tiny">Solid: recorded when status is known · dashed: interpolated · dotted: estimated. Hover to inspect individual source status.</p>';
  }
  function months(){const v=QA.inspect();return {a:v.start,b:v.end,range:Array.from({length:v.end-v.start+1},(_,k)=>v.start+k)};}
  function sampleAir(i,branch,type){return V.airframe(type,i,branch);}
  function knownSum(values){const usable=values.filter(x=>x.value!=null);return usable.length?usable.reduce((a,x)=>a+x.value,0):null;}
  function combinedSeriesQuality(series){
    if(!series.some(x=>x.value!=null))return {quality:'unavailable',note:'No compatible sources for this interval.'};
    const gaps=series.filter(x=>x.value==null);
    const inferred=series.filter(x=>x.value!=null&&x.quality!=='recorded');
    return {quality:gaps.length?'estimated':inferred.length?'interpolated':'recorded',
      note:(gaps.length?'Partial total: '+gaps.length+' unavailable type series. ':'')+
      (inferred.length?'Contains '+inferred.length+' between-source/model series.':'All component values observed directly.')};
  }
  function allSnapshot(i){
    const us=['P-47','P-51','P-38'].map(type=>({type,...sampleAir(i,'USAAF',type)}));
    const raf=['Spitfire','Hurricane','Typhoon','Tempest','Mustang (RAF)'].map(type=>({type,...sampleAir(i,'RAF',type)}));
    const g109=V.germanType(i,'Bf 109',ui.fwShare/100),g190=V.germanType(i,'Fw 190',ui.fwShare/100);
    const record=X.germanAt(i);
    return {i,us,raf,german:[{type:'Bf 109 family',...g109},{type:'Fw 190 day fighters',...g190}],
      ready:{value:record.serviceable,quality:record.quality,source:'ahb107',note:record.note},
      onStrength:{value:record.strength,quality:record.quality,source:'ahb107',note:record.note},pilot:D.pilots(i),
      usTotal:knownSum(us),rafTotal:knownSum(raf)};
  }
  // Only the German all-front fighter CLASS has enough dated checkpoints for a
  // front-allocation proxy; it is not a German theater-level measured return.
  function germanTheater(i,measure='serviceable'){
    const p=X.germanAt(i),key=measure==='strength'?'strength':'serviceable';
    if(ui.theater==='overall')return {value:p[key],quality:p.quality,note:'German single-engine fighters, all fronts; '+p.note};
    const shares=V.share(i),factor=shares?.[ui.theater];
    if(factor==null||p[key]==null)return {value:null,quality:'unavailable',note:'No compatible front assignment and fighter-strength estimate for this date.'};
    return {value:Math.round(p[key]*factor/100),quality:'estimated',note:'Approximate theater allocation: '+factor+'% of ALL-FRONT German fighters, based on period-level distribution. Not a monthly German theater return.'};
  }
  function earlySovietAt(i,coverage){
    const p=W.sovietEarly.find(x=>D.idx(+x.period.slice(0,4),+x.period.slice(5,7)-1)===i&&x.coverage===coverage);
    return p?{value:p.fighters,quality:p.status,note:'Original dated snapshot, '+p.scope+'. Never interpolate across incompatible Soviet formations. '+W.sources[p.sourceId].url}:
      {value:null,quality:'unavailable',note:'No compatible source observation for this precise VVS population and month.'};
  }
  function theaterLabels(){return {overall:'European air war · all available theaters',west:'Western Front · Germany / RAF / USAAF',east:'Eastern Front · Germany / Soviet VVS'}[ui.theater];}
  function numericMean(values){const valid=values.filter(x=>Number.isFinite(x));return valid.length?valid.reduce((a,b)=>a+b,0)/valid.length:null;}
  function periodOverview(){
    const {a,b,range}=months();
    const german=range.map(i=>germanTheater(i)),known=german.filter(x=>x.value!=null);
    const mean=numericMean(german.map(x=>x.value));
    const begin=german[0]?.value,end=german.at(-1)?.value;
    const westLoss=Z.monthlyReturns.filter(p=>range.includes(p.i)&&p.theater==='Western Front');
    const germanLossRecords=Z.monthlyReturns.filter(p=>range.includes(p.i)&&p.theater==='Reich');
    const eastRates=range.map(i=>H.sovietAt(i,'reconstruct')).filter(x=>x.value!=null);
    const sovietDirect=range.filter(i=>H.soviet.some(p=>p.i===i)||W.sovietEarly.some(p=>D.idx(+p.period.slice(0,4),+p.period.slice(5,7)-1)===i)).length;
    const claims=V.usaFighterClaimsMonthly.filter(x=>range.includes(x.i));
    const scope=ui.theater==='east'?'Soviet front air-army inventories: '+sovietDirect+' directly recorded checkpoints / '+range.length+' months. VVS reserves are included; PVO and Naval Aviation are excluded.':
      ui.theater==='west'?'Western German command returns cover '+westLoss.length+' months, not all German forces in western Europe. USAAF ETO / RAF organizational populations are separately defined.':
      'Overall combines the scope of multiple original sources, NOT simply West + East. Mediterranean, Reich defense, Scandinavia and other areas matter.';
    const directlyRecorded=german.filter(x=>x.value!=null&&(x.quality==='recorded'||x.quality==='documented')).length;
    const qualityRate=range.length?directlyRecorded/range.length:0;
    const grade=qualityRate>=.9?'Extensive primary data':qualityRate>=.45?'Partial primary data':'Sparse primary data';
    const first=begin==null?'—':fmt(begin),last=end==null?'—':fmt(end);
    const rows=[
      {label:'German fighters · monthly average',value:fmt(mean),note:known.length+'/'+range.length+' months with modeled/observed values; '+(ui.theater==='overall'?'all-front source definition':'front allocation · estimated')},
      {label:'German fighters · start → end',value:first+' → '+last,note:'Stock at period boundaries · never summed across months'},
      ui.theater==='east'?{label:'VVS front fighters · average',value:fmt(numericMean(eastRates.map(x=>x.value))),note:sovietDirect+' direct checkpoints; intermediate months reconstructed · estimated'}:
      ui.theater==='west'?{label:'Western German command · destroyed',value:fmt(westLoss.reduce((s,x)=>s+x.destroyed,0)),note:westLoss.length+'/'+range.length+' verified source months · PARTIAL total, all aircraft classes'}:
        {label:'USAAF ETO · credited air victories',value:fmt(claims.reduce((s,x)=>s+x.air,0)),note:claims.length+'/'+range.length+' recorded months · credited, not confirmed aircraft losses'}
    ];
    return '<div class="v73-period-overview"><div class="v73-period-title"><div><span class="kicker">PERIOD ANALYSIS</span><h2>'+safe(theaterLabels())+'</h2><p>'+D.label(a)+' – '+D.label(b)+' · '+range.length+' months. Flows are summed; inventory is averaged and shown at both boundaries.</p></div><span class="v73-coverage-grade" title="German fighter-stock series only. '+directlyRecorded+' directly sourced months, '+(known.length-directlyRecorded)+' reconstructed months of '+range.length+'; each chart has independent coverage.">'+grade+' · '+directlyRecorded+'/'+range.length+' recorded</span></div>'+ 
      '<div class="v73-metrics">'+rows.map(p=>'<div><small>'+safe(p.label)+'</small><strong>'+p.value+'</strong><span>'+safe(p.note)+'</span></div>').join('')+'</div>'+ 
      '<p class="v73-scope-note">'+safe(scope)+' Source points are <strong>recorded</strong>; ordinary between-point interpolation is <strong>interpolated</strong>; event-weighted allocation or other assumptions are <strong>estimated</strong>. Simulators remain hypothetical.</p></div>';
  }
  function details(title,content,open=false){return '<details class="v73-details"'+(open?' open':'')+'><summary>'+title+' <span>Expand / collapse</span></summary><div class="v73-details-body">'+content+'</div></details>';}
  function variantExplorer(){
    const {a,b,range}=months(),interval=range.length>18?12:1;
    const families=ui.theater==='east'?[['Germany','Bf 109'],['Germany','Fw 190']]:
      ui.theater==='west'?[['Germany','Bf 109'],['Germany','Fw 190'],['RAF','Spitfire'],['RAF','Hurricane'],['USAAF','P-51'],['USAAF','P-47'],['USAAF','P-38']]:
      [['Germany','Bf 109'],['Germany','Fw 190'],['RAF','Spitfire'],['RAF','Hurricane'],['USAAF','P-51'],['USAAF','P-47'],['USAAF','P-38']];
    const sample=(side,family,i)=>{
      if(side==='Germany')return V.germanType(i,family,ui.fwShare/100).value;
      return V.airframe(family,i,side).value;
    };
    const tables=families.map(([side,family])=>{
      const entries=H.variants.filter(v=>v.family===family&&v.side===side&&v.to>=a&&v.from<=b);
      if(!entries.length)return '';
      const sampled=range.filter((_,k)=>k%interval===0||k===range.length-1);
      const columns=entries.map(v=>({type:v.type,period:D.label(v.from)+' – '+D.label(v.to),
        values:sampled.map(i=>H.mix(family,side,i,sample(side,family,i)).find(x=>x.type===v.type)?.value??null)}));
      return details(side+' · '+family+' — '+entries.length+' variants',
        '<p class="v73-estimate-warning">Estimated subtype allocation, NOT recorded monthly variant strength. Heuristic rise/retirement windows distribute the already estimated family inventory. Do not use these values as wartime counts. Service windows indicate model availability, not factory production dates. '+(family==='P-51'?cite('p51museum'):cite('variantContext'))+'</p>'+ 
        table(['Operational variant / modeled window',...sampled.map(i=>D.label(i))],columns.map(c=>[safe(c.type)+'<br><small>'+safe(c.period)+'</small>',...c.values.map(v=>v==null?'—':fmt(v)+' <span class="v73-est-mark" title="Scenario allocation · estimated">≈</span>')])));
    }).join('');
    return section('Fighter variants through the selected period','Subtype windows and provisional monthly/yearly strength allocation for each fighter family. For long periods the table samples once per year; change the range to see every month. The count estimates are a research scaffold, not a verified serial/variant inventory.',
      '<div class="v73-caution">A model may illustrate how E → F → G → K evolved, but a source-derived monthly variant census still needs original equipment returns. No inferred numbers are marked Recorded.</div>'+tables);
  }
  function nationalLedgers(){
    const {range}=months();
    const german=range.map(i=>{const s=X.germanAt(i);return [D.label(i),fmt(s.strength),fmt(s.serviceable),s.quality==='recorded'?'':tag(s.quality,s.note)];});
    const britain=range.map(i=>{const s=allSnapshot(i).raf;return [D.label(i),...['Spitfire','Hurricane','Typhoon','Tempest','Mustang (RAF)'].map(t=>fmt(s.find(x=>x.type===t)?.value)),
      s.every(x=>x.quality==='recorded')?'':tag(s.some(x=>x.quality==='unavailable')?'unavailable':s.some(x=>x.quality==='estimated-low')?'estimated-low':'interpolated')];});
    const us=range.map(i=>{const s=allSnapshot(i).us;return [D.label(i),...['P-38','P-47','P-51'].map(t=>fmt(s.find(x=>x.type===t)?.value)),
      s.every(x=>x.quality==='recorded')?'':tag(s.some(x=>x.quality==='unavailable')?'unavailable':s.some(x=>x.quality==='estimated-low')?'estimated-low':'interpolated')];});
    const soviet=range.map(i=>{const early=W.sovietEarly.find(p=>D.idx(+p.period.slice(0,4),+p.period.slice(5,7)-1)===i),
      s=early?{value:early.fighters,quality:early.status}:H.sovietAt(i,'reconstruct'),source=H.soviet.find(x=>x.i===i);
      return [D.label(i),fmt(s.value),early?fmt(early.all):source?fmt(source.total):'—',
        early?fmt(early.unserviceableFighters):source?fmt(source.unserviceableFighters):'—',s.quality==='recorded'?'':tag(s.quality),
        early?cite(early.sourceId)+'<br><small>'+safe(early.coverage)+'</small>':source?cite(source.source):'—'];});
    return section('Monthly evidence ledgers by country','Tables open independently; column headings stay visible while scrolling. Figures outside their source populations are not merged. A blank evidence cell signifies a directly recorded observation.',
      details('Germany · all-front single-engine fighters',table(['Month','On hand','Serviceable','Status (non-recorded only)'],german)+'<p class="tiny">German worldwide fighter class; not limited to any individual front. '+cite('ahb107')+'</p>')+
      details('United Kingdom · RAF selected models',table(['Month','Spitfire','Hurricane','Typhoon','Tempest','RAF Mustang','Status'],britain)+'<p class="tiny">Fighter Command / Air Defence GB and 2 TAF where available, not all RAF aircraft. '+cite('raf')+'</p>')+
      details('United States · USAAF ETO fighter models',table(['Month','P-38','P-47','P-51','Status'],us)+'<p class="tiny">ETO operational strength (not worldwide U.S. production); source checkpoints are quarterly. '+cite('usa')+'</p>')+
      details('Soviet Union · VVS front air armies & reserves',table(['Month','Fighters on strength','All combat aircraft','Fighters unserviceable¹','Status','Original return'],soviet)+
        '<p class="tiny">¹ Unserviceable fighter count is given only on direct source dates. <strong>1941 border-district and incomplete-front snapshots are geographically narrower than later front-plus-reserve data</strong>; they cannot be summed or connected as one homogeneous series. PVO, Naval Aviation and long-range forces are outside later definitions. '+cite('vvs1943')+'</p>'));
  }
  function theaterLossInsight(){
    const {a,b,range}=months(),fronts=ui.theater==='east'?['east']:ui.theater==='west'?['west']:['west','east','med'];
    const names={west:'German losses · Western Front',east:'German losses · Eastern Front',med:'German losses · Mediterranean'};
    const colors={west:'#9bb5c0',east:'#a6b993',med:'#d2b27a'};
    const series=fronts.map(front=>({name:names[front],color:colors[front],
      value:r=>H.quarterLossAt(r.i,front,'all').value,detail:r=>H.quarterLossAt(r.i,front,'all')}));
    const rows=fronts.map(front=>{
      const estimates=range.map(i=>H.quarterLossAt(i,front,'all'));
      return [names[front],fmt(estimates.filter(x=>x.value!=null).reduce((a,x)=>a+x.value,0)),
        estimates.filter(x=>x.value!=null).length+'/'+range.length,tag('estimated','Monthly values allocated from recorded quarter totals')];
    });
    return section('German aircraft losses · selected front and entire period','Original quarter-level German all-aircraft losses (not exclusively fighters) are distributed across component months using explicit historical-event weights. Periods containing full quarters reconcile exactly to source totals; partial-quarter selections are estimated. These are NOT monthly archival observations.',
      table(['Front','Selected months · losses (partial)','Months modeled','Monthly status'],rows)+
      chart('v73-front-loss',range.map(i=>({i,label:D.label(i)})),series)+
      '<p class="v4-callout">Month-to-month peaks here are an <strong>estimated</strong> allocation of actual quarterly loss totals, not direct wartime reports. A month with an offensive can receive a greater model weight. The underlying quarterly statistics remain separately available and unchanged. '+cite('german')+'</p>');
  }
  function easternFrontLens(){
    if(ui.theater!=='east'||!['fleet','pilothistory','comparison','campaigns'].includes(ui.view))return '';
    const {range}=months();
    const note=ui.view==='pilothistory'?
      'No matched monthly Soviet pilot-strength or pilot-casualty series has been verified. The preserved German personnel series is all-front: it cannot be relabeled Eastern Front.':
      ui.view==='comparison'?
      'The original U.S. procurement, cost and ETO sortie records are historical background, not Eastern Front operational counts. This front-specific stock overview uses only compatible country and period definitions.':
      ui.view==='campaigns'?
      'Campaign cards below are filtered to eastern campaigns. The full official USAAF Volume III bibliography is available as supplementary western-theater research.':
      'Soviet figures are front air-army plus command reserve fighters, not all Soviet aviation. German eastern stock is a geographic allocation estimate. Verified Soviet type-by-type monthly returns are not yet available.';
    return section('Eastern Front · available direct evidence',note,
      chart('v73-eastern-lens',range.map(i=>({i,label:D.label(i)})),[
        {name:'Soviet VVS fighters · front armies and reserves',color:'#8eafaa',value:r=>H.sovietAt(r.i,'reconstruct').value,detail:r=>H.sovietAt(r.i,'reconstruct')},
        {name:'Soviet VVS front + reserve · early original snapshots',color:'#c8cb88',value:r=>earlySovietAt(r.i,'front-plus-reserve').value,detail:r=>earlySovietAt(r.i,'front-plus-reserve')},
        {name:'Soviet VVS border / incomplete fronts · distinct population',color:'#aab6d0',value:r=>earlySovietAt(r.i,'geographically partial').value??earlySovietAt(r.i,'incomplete-front enumeration').value,
          detail:r=>earlySovietAt(r.i,'geographically partial').value!=null?earlySovietAt(r.i,'geographically partial'):earlySovietAt(r.i,'incomplete-front enumeration')},
        {name:'German S.E. fighters · Eastern allocation (est.)',color:'#d2b27a',value:r=>germanTheater(r.i,'strength').value,detail:r=>germanTheater(r.i,'strength')}
      ])+'<p class="v4-callout">Early Soviet points represent <strong>different military populations</strong> (border districts vs named fronts vs front plus reserve). The series are deliberately separate: a 1941–42 point cannot be linearly connected to the 1943–45 national sample without denominator reconciliation. '+cite('rkka41jun')+' · '+cite('rkka41dec')+' · '+cite('rkka42jul')+'</p>'+ 
      '<p class="tiny">Later documented Soviet source dates: '+H.soviet.filter(p=>range.includes(p.i)).map(p=>D.label(p.i)+' · '+fmt(p.fighters)).join('; ')+'. No figures outside source-supported dates are silently inferred. '+cite('vvs1943')+' · '+cite('vvs1945may')+'</p>');
  }
  function battleOfBritainDetail(){
    const {a,b}=months();
    if(b<D.idx(1940,6)||a>D.idx(1940,8)||ui.theater==='east')return '';
    return details('Battle of Britain · RAF combat-ready fighters (July–September 1940)',
      table(['On date','Spitfires ready','Hurricanes ready','Combined ready'],[6,7,8].map(m=>{
        const i=D.idx(1940,m),sp=V.rafReady1940.Spitfire.find(x=>x.i===i).value,hu=V.rafReady1940.Hurricane.find(x=>x.i===i).value;
        return [D.label(i),fmt(sp),fmt(hu),fmt(sp+hu)];
      }))+'<p class="tiny">Fighter Command combat-ready squadrons, not RAF worldwide aircraft on hand. Original historical research context for this campaign only. '+cite('raf1940')+'</p>');
  }
  function alliedMonthlyLoss(i){
    const reported=V.usaFighterLossMonthly.find(x=>x.i===i);
    if(!reported)return null;
    const fleet=allSnapshot(i).us;
    const fighterTotal=V.airframe('Fighters total',i,'USAAF');
    const counts=fleet.map(x=>Math.max(0,x.value||0));
    const other=Math.max(0,(fighterTotal.value||counts.reduce((a,b)=>a+b,0))-counts.reduce((a,b)=>a+b,0));
    const candidates=[...counts,other],total=candidates.reduce((a,b)=>a+b,0);
    if(!total)return null;
    const exact=candidates.map(n=>n*reported.value/total),allocation=exact.map(Math.floor);
    for(const r of exact.map((n,k)=>({k,frac:n-allocation[k]})).sort((a,b)=>b.frac-a.frac)
      .slice(0,reported.value-allocation.reduce((a,b)=>a+b,0)))allocation[r.k]++;
    return {recorded:reported.value,total,parts:['P-47','P-51','P-38','Other USAAF'].map((name,k)=>({name,value:allocation[k],share:candidates[k]/total})),
      note:'Low-confidence proxy: official monthly ETO all-fighter combat + accident losses, allocated by estimated airframe inventory shares. NOT historical losses by type.'};
  }
  function qualityText(q){return q==='recorded'?'An original dated observation.':q==='recorded-secondary'?'Source-compiled with some interpretive classifications.':q==='estimated-high'?'Interpolated from nearby source snapshots; relatively short gap.':q==='estimated-low'?'Longer interpolation or an explicit approximation; substantial uncertainty.':q==='derived'?'Calculated from a recorded numerator/denominator.':q==='unavailable'?'No compatible period/type observation verified.':'A transparent model assumption.';}
  function pointRows(list){return list.map(r=>[r.type,fmt(r.value),tag(r.quality,r.note),safe(qualityText(r.quality))]);}
  function renderBalance(){
    const {a,b,range}=months(),share=V.share(b),r=range.map(i=>({i,label:D.label(i)}));
    const series=ui.theater==='east' ? [
      {name:'German S.E. fighter stock · East allocation (est.)',color:'#b7a877',value:x=>germanTheater(x.i,'strength').value,detail:x=>germanTheater(x.i,'strength')},
      {name:'Soviet VVS front fighter stock (recorded/interpolated)',color:'#8eafaa',value:x=>H.sovietAt(x.i,'reconstruct').value,detail:x=>H.sovietAt(x.i,'reconstruct')},
      {name:'Early VVS front + reserves · dated return',color:'#c8cb88',value:x=>earlySovietAt(x.i,'front-plus-reserve').value,detail:x=>earlySovietAt(x.i,'front-plus-reserve')},
      {name:'Early VVS partial districts / named fronts · not comparable',color:'#9caacc',
        value:x=>earlySovietAt(x.i,'geographically partial').value??earlySovietAt(x.i,'incomplete-front enumeration').value,
        detail:x=>earlySovietAt(x.i,'geographically partial').value!=null?earlySovietAt(x.i,'geographically partial'):earlySovietAt(x.i,'incomplete-front enumeration')}
    ] : [
      {name:'German serviceable S.E. fighters · '+(ui.theater==='west'?'Western allocation':'all fronts'),color:'#a6b993',value:x=>germanTheater(x.i).value,detail:x=>germanTheater(x.i)},
      {name:'German single-engine fighters on hand',color:'#d2b27a',value:x=>germanTheater(x.i,'strength').value,detail:x=>germanTheater(x.i,'strength')},
      {name:'USAAF ETO P-38 / P-47 / P-51',color:'#9bb5c0',value:x=>allSnapshot(x.i).usTotal,
        detail:x=>combinedSeriesQuality(allSnapshot(x.i).us)},
      {name:'RAF selected fighters · Fighter Command / 2 TAF',color:'#b3a4a1',value:x=>allSnapshot(x.i).rafTotal,
        detail:x=>combinedSeriesQuality(allSnapshot(x.i).raf)},
      ...(ui.theater==='overall'?[{name:'Soviet VVS fighters · front armies + reserves',color:'#81a8a4',
        value:x=>H.sovietAt(x.i,'reconstruct').value,detail:x=>H.sovietAt(x.i,'reconstruct')}]:[])
    ];
    const geography=share?fraction([{label:'West',value:share.west,color:'#9bb5c0'},{label:'East',value:share.east,color:'#a6b993'},
      {label:'Mediterranean',value:share.med,color:'#d2b27a'},{label:'Scandinavia',value:share.north,color:'#b3a4a1'}]):
      '<p>No compatible German geographic strength distribution for the selected period end.</p>';
    const sortiesE=V.usaFighterSorties.ETO.filter(x=>range.includes(x.i)).reduce((n,x)=>n+x.total,0),
      sortiesM=V.usaFighterSorties.MTO.filter(x=>range.includes(x.i)).reduce((n,x)=>n+x.total,0);
    $('v4-body').innerHTML='<div class="v4-hero"><div><div class="kicker">AIR POWER · THEATER COMPARISON</div><h2>'+safe(ui.theater==='overall'?'The European air war — air forces over time':ui.theater==='west'?'The Western Front — air power & operations':'The Eastern Front — Luftwaffe and Soviet VVS')+'</h2><p>A broad Allied-and-German perspective, with distinct reporting populations and confidence labels. The chosen interval drives the comparison; detailed dates are inspected directly on charts.</p></div></div>'+ 
      section('Fighter strength across the selected period','Inventory is a stock, not a total produced or lost. Different air forces report different organizational populations. A German geographic allocation is always an estimate.',
        chart('v4-force-graph',r,series)+'<p class="v4-callout">'+(ui.theater==='east'?'Soviet VVS front air-army + reserve checkpoints are directly source-transcribed. Intervening months are labeled interpolated or estimated; Germany uses approximate geography. Soviet PVO/naval aviation is excluded.':
        'German Quartermaster class stock is all-front and distinct from the RAF and USAAF selected theater organizations. A crossing of lines is not a combat outcome.')+' '+cite('ahb107')+(ui.theater==='east'?' · '+cite('vvs1945jan'):'')+'</p>')+
      section('Where the aircraft were deployed','Country-by-country scope is shown; only compatible source-defined quantities are compared. No spurious national geographical percentages.',
        '<div class="v4-columns">'+panel('Germany · fighter theater allocation',geography+'<p class="tiny">Proportions are historical period bands, not month-specific counts or loss shares. '+cite('german')+'</p>')+
        (ui.theater==='east'?panel('Soviet VVS · directly sourced, separate scope',
          table(['Return','Fighters','Scope'],W.sovietEarly.filter(p=>range.includes(D.idx(+p.period.slice(0,4),+p.period.slice(5,7)-1))).map(p=>[
            p.day+' '+p.period,fmt(p.fighters),safe(p.coverage)]))+'<p class="tiny">Partial border and army group populations must not be confused with all Soviet front and reserve aviation. '+cite('rkka41jun')+'</p>'):
          panel('United States · reported fighter sorties',(sortiesE+sortiesM?fraction([{label:'European Theater (ETO)',value:sortiesE,color:'#9bb5c0'},{label:'Mediterranean Theater (MTO)',value:sortiesM,color:'#d2b27a'}]):
            '<p>No USAAF ETO/MTO sorties in this selected interval.</p>')+
            '<p class="tiny">This allocation is <strong>sorties</strong> rather than aircraft strength. The RAF selected series represents UK air-defense and tactical organizations; its worldwide theater percentage is not established here. '+cite('digest128')+'</p>'))+'</div>')+
      details('Historical German aircraft-strength returns · supporting records',
        table(['Original date','All-front on hand','All-front serviceable','Evidence'],X.germanFighterReadiness.filter(p=>p.i>=a&&p.i<=b).map(p=>[p.date,fmt(p.strength),fmt(p.serviceable),tag('recorded')]))+cite('ahb107'))+
      details('Events in this period', '<div class="v4-eventlist">'+V.milestones.filter(x=>x.i>=a&&x.i<=b).map(x=>'<div class="v4-event"><span>'+D.label(x.i)+'</span><strong>'+x.title+'</strong><p>'+x.detail+'</p></div>').join('')+'</div>');
  }
  // Reported 1943 monthly fighter-aircraft writeoff shares for Oct–Dec; 1944 annual
  // allocation is inherited unchanged from v3. Gaps never silently become zeros.
  function germanLoss(i){const known=D.writeoffs(i);if(known.value!=null)return {...known,quality:known.quality==='derived'?'derived':'allocated'};
    const d=D.at(i),present=D.readiness43.find(x=>x[0]===d.m);
    if(ui.lossGaps&&d.y===1943&&present&&d.m===7){
      return {value:Math.round(present[2]*.27),quality:'estimated-low',note:'Explicit scenario: 27% of 1943 August present fighter strength, based on nearby Oct–Dec reported monthly rates (41.9, 21.0, 22.8%). NOT an actual recorded August loss.'};
    }
    return {value:null,quality:'unavailable',note:'No verified compatible fighter write-off total for this month.'};
  }
  function modelGermanTypeLoss(i,type){const total=germanLoss(i),g=V.germanType(i,type,ui.fwShare/100),
    a=V.germanType(i,'Bf 109',ui.fwShare/100),b=V.germanType(i,'Fw 190',ui.fwShare/100);
    if(total.value==null||g.value==null)return {value:null,quality:'unavailable'};
    return {value:Math.round(total.value*g.value/Math.max(1,a.value+b.value)),quality:'estimated-low',
      note:'Total German write-offs allocated by estimated aircraft-on-strength shares, NOT reported Bf 109/Fw 190 loss counts.'};
  }
  function renderFleet(){
    const s=allSnapshot(ui.focus),m=D.at(ui.focus),year=m.y,{range}=months();
    const german=s.german,us=s.us,raf=s.raf,allyLoss=alliedMonthlyLoss(ui.focus);
    const classSnapshot=X.germanClassSnapshots.reduce((best,p)=>
      !best||Math.abs(p.i-ui.focus)<Math.abs(best.i-ui.focus)?p:best,null);
    const nearbyClass=classSnapshot&&Math.abs(classSnapshot.i-ui.focus)<=2?classSnapshot:null;
    const production=(type)=>{if(year===1943&&m.m>=5&&['Bf 109','Fw 190'].includes(type))
      return {value:V.germanProductionNew43[type][m.m-5],quality:'recorded',note:'NEW factory-built German fighter aircraft, not restored/reconditioned.'};
      if(['P-38','P-47','P-51'].includes(type)&&V.usaAnnualAccepted[type][year]!=null)
        return {value:V.usaAnnualAccepted[type][year],quality:'recorded',note:'FULL calendar-year U.S. factory acceptances worldwide, NOT monthly theater deliveries.'};
      return {value:null,quality:'unavailable'};};
    const gerRows=german.map(x=>{const kind=x.type.startsWith('Bf')?'Bf 109':'Fw 190',p=production(kind),l=modelGermanTypeLoss(ui.focus,kind);
      return [x.type,fmt(x.value),tag(x.quality,x.note),fmt(p.value)+(p.value!=null?'<span class="tiny"> '+(year===1943?'new built / month':'')+'</span>':''),fmt(l.value),tag(l.quality,l.note)];});
    const allyRows=[...us.map(x=>({...x,side:'USAAF'})),...raf.map(x=>({...x,side:'RAF'}))].map(x=>{const p=production(x.type),allocation=allyLoss?.parts.find(part=>part.name===x.type);
      return [x.side+' · '+x.type,fmt(x.value),tag(x.quality,x.note),fmt(p.value)+(p.value!=null?'<div class="tiny">Worldwide, full '+year+' year</div>':''),fmt(allocation?.value),
        allocation?tag('estimated-low',allyLoss.note):tag('unavailable','No recorded by-model loss total for this organization and month.')];});
    $('v4-body').innerHTML='<div class="v4-hero"><div><div class="kicker">AIRCRAFT STOCK · MOVEMENTS · LOSSES</div><h2>The fleet, aircraft by aircraft</h2><p>Month-end aircraft strength and per-model allocation. A factory acceptance, an aircraft at the front, an aircraft ready to fly, and a write-off are four different quantities.</p></div><div class="v4-inspect">'+(ui.detailMonth==null?'Period-end snapshot':'Inspected month')+'<strong>'+D.label(ui.focus)+'</strong></div></div>'+ 
      '<div class="v4-columns">'+panel('German piston day fighters · on strength',fraction(german.map((x,k)=>({label:x.type,value:x.value||0,color:k?'#f4c46a':'#48d3c5'})))+
         '<div class="v4-subcontrol"><label for="v4-fwshare">Fallback Fw 190 share when no type snapshot exists <b>'+ui.fwShare+'%</b></label><input class="range" type="range" min="10" max="65" step="1" id="v4-fwshare" value="'+ui.fwShare+'"><p class="tiny">Only affects unsupported dates. It does not overwrite dated German type observations.</p></div>',tag('estimated-low')+' · Bf 109 residual and inter-snapshot splits are estimates.')+
      panel('USAAF ETO fighter families',fraction(us.map((x,k)=>({label:x.type,value:x.value||0,color:['#82b9ff','#b89cfb','#8bdd9e'][k]})))+
        '<p class="small">National army-air-force assets in the European Theater of Operations; not the total worldwide P-47 or P-51 fleet.</p>',cite('usa'))+'</div>'+ 
      section('German Quartermaster returns · on hand versus serviceable','The original RAF AHB VII/107 translation preserves exact reporting dates and aircraft categories. This is a single-engine FIGHTER CLASS; do not confuse it with only Bf 109s, or with fighter pilots.',
        '<div class="v4-statgrid">'+
          card(fmt(s.onStrength.value),'All-front single-engine fighter stock',tag(s.onStrength.quality,s.onStrength.note)+' · aircraft on hand','var(--blue)')+
          card(fmt(s.ready.value),'All-front fighters serviceable',tag(s.ready.quality,s.ready.note)+' · capable of service','var(--teal)')+
          card(s.ready.value==null?'—':pct(100*s.ready.value/s.onStrength.value),'Share of inventory serviceable',s.ready.value==null?'No compatible German strength return in this month':labelQuality(s.ready.quality),'var(--gold)')+
          card(fmt(X.germanFighterReadiness.filter(p=>p.i>=months().a&&p.i<=months().b).length),'Direct RAF German fighter return months','All other values shown on this graph are estimated between original returns','var(--purple)')+'</div>'+ 
        chart('v6-german-readiness',range.map(i=>({i,label:D.label(i)})),[
          {name:'On hand · German single-engine fighters',color:'#d2b27a',value:r=>X.germanAt(r.i).strength,detail:r=>X.germanAt(r.i)},
          {name:'Serviceable · German single-engine fighters',color:'#48d3c5',value:r=>X.germanAt(r.i).serviceable,detail:r=>X.germanAt(r.i)}
        ])+
        table(['Original return (date)','On hand','Serviceable','Ready fraction','Evidence'],
          X.germanFighterReadiness.filter(p=>p.i>=months().a&&p.i<=months().b).map(p=>[
            p.date,fmt(p.strength),fmt(p.serviceable),pct(p.readyPct),tag('recorded',p.note)]))+
        '<p class="v4-callout">No invented April-to-May 1945 German record: April 13 is the last cited VII/107 point. The older simulator remains usable with a clearly labeled hypothetical May aircraft value. The source-led dashboard does not show that placeholder as a fact. '+cite('ahb107')+'</p>')+
      section('German aircraft classes, directly recorded snapshots','For transparency these are the original dated multi-category reports: a nearby report is NEVER silently relabeled as the selected month.',
        nearbyClass?'<p class="v4-callout">Source date <strong>'+nearbyClass.day+' '+D.label(nearbyClass.i)+'</strong> (viewing '+D.label(ui.focus)+'); '+(nearbyClass.i===ui.focus?'same reporting month':'nearest archival snapshot, a DIFFERENT month')+'. Original values are shown unaltered. '+cite('ahb107')+'</p>'+ 
        table(['German aircraft class','Aircraft on hand','Serviceable','Source quality'],Object.entries(nearbyClass.values).map(([name,pair])=>[
          safe(name),fmt(pair[0]),fmt(pair[1]),tag('recorded','Original German Quartermaster return; date '+nearbyClass.day+' '+D.label(nearbyClass.i))])):
        '<p class="small">No aircraft-class snapshot within two months of '+D.label(ui.focus)+'. Try June 1943, April 1944, January 1945 or April 1945. We do not extrapolate other classes into 1936–42.</p>')+
      section('Germany · month-by-type accounting','German production is directly tabulated by fighter type for June–December 1943. Additional months remain blank rather than fabricated.',
        table(['Type','On strength · est.','Confidence','Built/accepted','Write-offs · allocated','Loss confidence'],gerRows)+
        '<p class="v4-callout">'+(ui.focus===D.idx(1943,7)?'August 1943 is a reconstruction of the Bf 109/Fw 190 mix between February and December original snapshots. ': '')+
        'The loss columns use the same German parent population as the historic equipment view where possible. Per-model write-offs are <strong>never</strong> recorded counts here.</p>')+
      section('Allies · operational strength by fighter type','RAF columns include Fighter Command and 2nd Tactical Air Force when each organization existed. USAAF airframe strength is not an aircrew count.',
        table(['Type / organization','Aircraft','Confidence','US factory acceptances (year)','Estimated ETO losses*','Loss status'],allyRows)+
        (allyLoss?'<div class="v4-callout"><strong>Official USAAF ETO total: '+fmt(allyLoss.recorded)+' fighter aircraft lost in '+D.label(ui.focus)+'.</strong> This includes combat and accidents, without a by-model breakdown in Table 104. The P-47 / P-51 / P-38 cells above apportion the recorded total using their contemporaneous ETO inventory shares. They are <strong>lower-confidence estimates, not reported individual model losses</strong>. '+cite('digest104')+'</div>':
        '<p class="v4-callout">*No original ETO fighter-loss total has been extracted for this month. A missing number means unknown, not zero. '+cite('digest104')+'</p>'))+
      section('USAAF ETO fighter losses · actual monthly totals', 'Includes fighters of all models, combat and accident losses combined. This is a recorded aggregate, unlike the individual-type allocations.',
        chart('v4-usa-losses',range.map(i=>({i,label:D.label(i)})),[
          {name:'USAAF ETO fighter losses (all types)',color:'#fa7b81',value:r=>V.usaFighterLossMonthly.find(p=>p.i===r.i)?.value??null,source:'digest104'}
        ])+table(['Month','All fighter-aircraft losses','Confidence','Reporting series'],
          V.usaFighterLossMonthly.filter(p=>p.i>=months().a&&p.i<=months().b).map(p=>[D.label(p.i),fmt(p.value),tag('recorded'),'USAAF Statistical Digest Table 104']))+
        '<p class="tiny">'+cite('digest104')+' · The extracted source segment currently runs July 1943–April 1944. Never extend it as a fabricated late-war curve.</p>')+
      section('How type availability changed','Three main American fighter types and two German fighter families. German families are estimated outside dated stock returns.',
        chart('v4-fleet-plot',range.map(i=>({i,label:D.label(i)})),[
          {name:'P-47 · USAAF ETO',color:'#82b9ff',value:r=>V.airframe('P-47',r.i,'USAAF').value,detail:r=>V.airframe('P-47',r.i,'USAAF')},
          {name:'P-51 · USAAF ETO',color:'#b89cfb',value:r=>V.airframe('P-51',r.i,'USAAF').value,detail:r=>V.airframe('P-51',r.i,'USAAF')},
          {name:'P-38 · USAAF ETO',color:'#8bdd9e',value:r=>V.airframe('P-38',r.i,'USAAF').value,detail:r=>V.airframe('P-38',r.i,'USAAF')},
          {name:'Bf 109 · Germany',color:'#48d3c5',value:r=>V.germanType(r.i,'Bf 109',ui.fwShare/100).value,detail:r=>V.germanType(r.i,'Bf 109',ui.fwShare/100)},
          {name:'Fw 190 · Germany',color:'#f4c46a',value:r=>V.germanType(r.i,'Fw 190',ui.fwShare/100).value,detail:r=>V.germanType(r.i,'Fw 190',ui.fwShare/100)}
        ]))+
      section('Factory numbers versus deployment', 'A wartime industrial output series is not a frontline inventory ledger.',
        '<div class="v4-columns">'+panel('German NEW fighter production · 1943',table(['Month','Bf 109','Fw 190','Combined'],
          V.germanProductionNew43['Bf 109'].map((x,k)=>[D.label(D.idx(1943,5+k)),fmt(x),fmt(V.germanProductionNew43['Fw 190'][k]),fmt(x+V.germanProductionNew43['Fw 190'][k])])) ,cite('murray'))+
        panel('US factory acceptances · calendar year',table(['Year','P-38','P-47','P-51'],[1942,1943,1944,1945].map(y=>[
          String(y)+(y===1945?'*':''),...['P-38','P-47','P-51'].map(t=>fmt(V.usaAnnualAccepted[t][y]))]))+
          '<p class="tiny">*1945 series continues through the USAAF reporting year, after VE Day. These are WORLDWIDE acceptances, not aircraft delivered to the ETO. </p>',cite('digest'))+'</div>');
    $('v4-fwshare').addEventListener('input',e=>{ui.fwShare=+e.target.value;render();});
  }
  function lossPeriods(){const {a,b}=months();return V.theaterLosses.filter(x=>x.a<=b&&x.b>=a);}
  function weightedShares(i){
    if(ui.weightMethod==='manual'){const total=Object.values(ui.weights).reduce((a,b)=>a+b,0)||1;return Object.entries(ui.weights).map(([name,v])=>({name,share:v/total}));}
    const x=allSnapshot(i);const entries=[
      ['P-47',x.us[0].value||0],['P-51',x.us[1].value||0],['P-38',x.us[2].value||0],
      ['Spitfire',x.raf[0].value||0],['Other Allied',Math.round((x.raf[1].value||0)+(x.raf[2].value||0)+(x.raf[3].value||0))]
    ];const total=entries.reduce((a,z)=>a+z[1],0)||1;return entries.map(([name,v])=>({name,share:v/total}));
  }
  function estimatedAttribution(i){
    const gross=germanLoss(i);if(gross.value==null)return null;
    const theaters=V.share(i);if(!theaters)return null;
    const westernFactor=ui.western/100;
    const eligible=gross.value*(ui.airCombat/100)*westernFactor;
    const weighted=weightedShares(i).map(x=>({...x,value:Math.round(eligible*x.share)}));
    const difference=Math.round(eligible)-weighted.reduce((a,x)=>a+x.value,0);
    if(weighted.length)weighted[0].value+=difference;
    return {gross,eligible:Math.round(eligible),weighted};
  }
  function originalCoverageMatrix(range,theaters,metric){
    const selected=new Set(range),years=[...new Set(range.map(i=>1936+Math.floor((i+6)/12)))];
    const shortMonths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const available=range.reduce((n,i)=>n+theaters.filter(t=>Z.get(i,t)).length,0);
    const cells=range.length*theaters.length;
    const recordMonth=(year,month)=>D.idx(year,month);
    const matrix=years.map(year=>{
      const head='<div class="v72-matrix-year">'+year+'</div><div class="v72-matrix-months">'+shortMonths.map(m=>'<span>'+m+'</span>').join('')+'</div>';
      const rows=theaters.map(theater=>'<div class="v72-matrix-label">'+(theater==='Reich'?'Reich':'West')+'</div>'+ 
        '<div class="v72-matrix-months v72-matrix-values">'+shortMonths.map((monthName,month)=>{
          const i=recordMonth(year,month),inRange=i>=0&&i<D.MONTHS&&selected.has(i);
          if(!inRange)return '<span class="v72-matrix-outside" title="Outside the selected interval">·</span>';
          const record=Z.get(i,theater);
          if(!record)return '<span class="v72-matrix-empty" title="'+monthName+' '+year+' · '+safe(theater)+' · No verified original monthly return imported; not zero">—</span>';
          const source=V.SOURCES[record.sourceId];
          const info=monthName+' '+year+' · '+theater+' · '+fmt(record[metric])+' '+metric+
            ' · '+fmt(record.destroyed)+' total destroyed / '+fmt(record.damaged)+' damaged. '+
            (source?.short||'Original German return')+(record.page?' · scan p'+record.page:'')+'. Click to inspect.';
          return '<button type="button" class="v72-matrix-recorded'+(ui.focus===i?' is-selected':'')+'" data-v72-month="'+i+'" title="'+safe(info)+'" aria-label="'+safe(info)+'">'+fmt(record[metric])+'</button>';
        }).join('')+'</div>').join('');
      return '<div class="v72-matrix-group">'+head+rows+'</div>';
    }).join('');
    return '<div class="v72-matrix-wrap"><div class="v72-matrix-summary"><strong>Where original counts exist · '+available+'/'+cells+' command-month cells</strong>'+ 
      '<span><i class="v72-swatch-observed"></i> Recorded number <i class="v72-swatch-absent"></i> — unverified (not zero)</span></div>'+ 
      '<p class="tiny">Each number is the selected loss category for that reporting command and month. Hover for all-category totals and the archival page; click an observed month to inspect it. A blank/dash means <strong>we have not verified a compatible total</strong>, not that aircraft losses were zero.</p>'+ 
      '<div class="v72-matrix">'+matrix+'</div></div>';
  }
  function renderOriginalLossReturns(){
    const {a,b,range}=months();
    const theaters=ui.v71Theater==='Both'?['Reich','Western Front']:[ui.v71Theater];
    const records=Z.monthlyReturns.filter(x=>x.i>=a&&x.i<=b&&theaters.includes(x.theater));
    const metric=ui.v71Metric;
    const metricLabels={destroyed:'Aircraft destroyed · all causes',enemyDestroyed:'Destroyed by enemy action',
      otherOperationalDestroyed:'Operational losses · not enemy action',nonOperationalDestroyed:'Non-operational write-offs',
      damaged:'Aircraft damaged · all causes',enemyDamaged:'Damaged by enemy action',
      otherOperationalDamaged:'Operational damage · not enemy action',nonOperationalDamaged:'Non-operational damage',
      missing:'Missing aircraft · included in enemy destroyed'};
    const palette={'Reich':'#a9b58b','Western Front':'#d6ae75'};
    const controls='<div class="v4-subcontrols">'+
      '<div><label for="v71-theater">Original German reporting command</label><select id="v71-theater">'+
      [['Both','Both commands'],['Reich','Luftflotte Reich'],['Western Front','Luftflotte 3 / LW Kommando West']].map(([key,label])=>
        '<option value="'+key+'"'+(ui.v71Theater===key?' selected':'')+'>'+label+'</option>').join('')+'</select></div>'+ 
      '<div><label for="v71-metric">Original loss category</label><select id="v71-metric">'+
      Object.entries(metricLabels).map(([key,label])=>'<option value="'+key+'"'+(metric===key?' selected':'')+'>'+label+'</option>').join('')+'</select></div></div>';
    const totalSeries=theaters.map(theater=>({name:theater+' · '+metricLabels[metric],color:palette[theater],
      value:r=>Z.get(r.i,theater)?.[metric]??null}));
    const observed=theaters.map(t=>Z.get(ui.focus,t)).filter(Boolean);
    const cards=observed.length?'<div class="v4-statgrid">'+observed.flatMap(r=>[
      card(fmt(r.destroyed),r.theater+' · all-cause destroyed',r.month+' · '+tag('recorded'),'var(--gold)'),
      card(fmt(r.damaged),r.theater+' · all-cause damaged',r.month+' · damage is not another write-off','var(--teal)')
    ]).join('')+'</div>':'';
    const sourceTable=records.length?table(['Source month','German command','Enemy destroyed / damaged',
      'Other operational destroyed / damaged','Non-operational destroyed / damaged','All destroyed / damaged','Missing¹','Evidence'],records.map(p=>[
        p.month,safe(p.theater),fmt(p.enemyDestroyed)+' / '+fmt(p.enemyDamaged),
        fmt(p.otherOperationalDestroyed)+' / '+fmt(p.otherOperationalDamaged),
        fmt(p.nonOperationalDestroyed)+' / '+fmt(p.nonOperationalDamaged),
        '<strong>'+fmt(p.destroyed)+' / '+fmt(p.damaged)+'</strong>',fmt(p.missing),
        tag('recorded','Read from printed MONTH’S TOTAL, not inferred')+' '+cite(p.sourceId)+(p.page?' · PDF p'+p.page:'')
      ])):'<div class="v7-empty-chart"><strong>No original monthly total imported in this selected period</strong><p>These original command totals are verified for September 1943–November 1944. Earlier, later and other-theater observations remain unverified, not zero. Choose an overlapping period to view the original numbers.</p></div>';
    const destroyedCauseChart=records.length?'<div class="v74-cause-sample"><h3>Documented causes of aircraft destroyed · available command-months only</h3>'+ 
      fraction([
        {label:'Enemy action (includes missing)',value:records.reduce((n,p)=>n+p.enemyDestroyed,0),color:'#af8f78'},
        {label:'Other operational losses',value:records.reduce((n,p)=>n+p.otherOperationalDestroyed,0),color:'#9db4a6'},
        {label:'Non-operational write-offs',value:records.reduce((n,p)=>n+p.nonOperationalDestroyed,0),color:'#bcb487'}
      ])+'<p class="tiny">Mutually exclusive categories in the verified original MONTH’S TOTAL. Damaged aircraft are not added to destruction, and “missing” is already part of the enemy-action category. <strong>Only '+records.length+' imported command-months are represented</strong>; no missing month is assumed to contain zero losses.</p></div>':'';
    const primary=section('Original German aircraft loss returns · monthly totals',
      'Thirty month-end all-aircraft command totals, independently checked against original German loss-return images preserved by the RAF Air Historical Branch. These are <strong>destroyed / damaged aircraft</strong>, not Allied claims or pilot casualties. Original counts are shown only where verified.',
      controls+cards+chart('v71-original-monthly',range.map(i=>({i,label:D.label(i)})),totalSeries)+
      originalCoverageMatrix(range,theaters,metric)+destroyedCauseChart+sourceTable+
      '<p class="tiny">¹ Missing aircraft were already classified among enemy-action destroyed; do not add them again. '+
      safe(Z.qualityNotes.month)+' '+safe(Z.qualityNotes.definitions)+' '+safe(Z.qualityNotes.corrected)+' '+
      safe(Z.qualityNotes.boundary)+' '+safe(Z.qualityNotes.discrepancy)+'</p>');
    const types=Z.juneByType.filter(x=>x.i>=a&&x.i<=b&&theaters.includes(x.theater));
    const typeRows=types.map(p=>[safe(p.theater),safe(p.type),fmt(p.enemyDestroyed),fmt(p.otherOperationalDestroyed),
      fmt(p.nonOperationalDestroyed),'<strong>'+fmt(p.destroyed)+'</strong>',fmt(p.damaged),
      tag('provisional','OCR-assisted working transcription, incomplete independent row-wise checking')+' '+cite(p.sourceId)]);
    const typeParts=types.map(p=>({label:p.theater+' · '+p.type, value:p.destroyed,
      color:p.theater==='Reich'?(p.type==='Bf 109'?'#94a986':'#7e937b'):(p.type==='Bf 109'?'#d2b180':'#aa8566')}));
    const typeContent=types.length?'<div class="v4-callout"><strong>Transcription status:</strong> '+safe(Z.qualityNotes.type)+'</div>'+ 
      fraction(typeParts)+table(['Command','Aircraft type','Enemy-action destroyed','Other operational destroyed',
        'Non-operational destroyed','Transcribed destroyed¹','Transcribed damaged¹','Evidence'],typeRows)+
      '<p class="tiny">¹ These figures count aircraft in <em>every listed unit role</em>, including reconnaissance and fighter-bombers; they do not represent only day-fighter units. Each number is a working transcription from source lines, <strong>not a published month-end type subtotal</strong> and not a confirmed minimum of unique airframes until the full independent row audit is complete. Do not add to the all-type totals above.</p>':
      '<div class="v7-empty-chart"><strong>No aircraft-type transcription in the selected period</strong><p>The current source-line research sample covers June 1944. Other months remain visibly unverified; the dashboard does not create aircraft-type shares to fill them.</p></div>';
    return primary+section('Bf 109 and Fw 190 — June 1944 source-line transcription',
      'Aircraft types are separated from German reporting commands and loss causes. These preliminary aircraft-type sums carry <strong>lower confidence</strong> than the printed all-aircraft monthly totals above.',typeContent);
  }
  function lossReportStatus(report){
    const imported=Z.monthlyReturns.filter(x=>V.SOURCES[x.sourceId]?.url===report.url);
    if(!imported.length)return tag('unavailable','Original report located, cells not yet imported')+' Archive located; numbers awaiting transcription';
    const hasTypes=Z.juneByType.some(x=>V.SOURCES[x.sourceId]?.url===report.url);
    return tag('recorded','Original month-end all-aircraft totals checked against scan images')+' '+imported.length+' month-end total'+(imported.length!==1?'s':'')+' imported'+
      (hasTypes?' · '+tag('provisional')+' June Bf 109 / Fw 190 source-line draft':' · model-by-model entries pending');
  }
  function renderLosses(){
    const records=lossPeriods(),snap=estimatedAttribution(ui.focus),{range}=months();
    const r=V.theaterLosses.find(x=>ui.focus>=x.a&&ui.focus<=x.b);
    const focusClaim=V.usaFighterClaimsMonthly.find(x=>x.i===ui.focus);
    const monthlyClaims=V.usaFighterClaimsMonthly.filter(x=>range.includes(x.i));
    const combatLosses=V.usCombatLosses[ui.lossAirClass];
    const lossFocus=combatLosses.find(x=>x.i===ui.focus),lossRows=combatLosses.filter(x=>range.includes(x.i));
    const selectedFronts=ui.theater==='west'?['west']:ui.theater==='east'?['east']:['west','med','east'];
    const tableRows=records.flatMap(q=>selectedFronts.map(k=>[q.label,({west:'Western Front',med:'Mediterranean',east:'Eastern Front'})[k],
      fmt(q[k].strength),fmt(q[k].combat),fmt(q[k].all),pct(100*q[k].all/q[k].strength)]));
    const eighthAir=X.eighthAggregate.air;
    $('v4-body').innerHTML='<div class="v4-hero"><div><div class="kicker">CAUSES · THEATERS · AIRCRAFT ATTRIBUTION</div><h2>What was lost, where, and to whom?</h2><p>Actual German airframe loss returns, all-theater benchmarks and an explicitly hypothetical Allied fighter attribution workbench. Fighter claims are not confirmed German destroyed aircraft.</p></div><div class="v4-inspect">'+(ui.detailMonth==null?'Period-end reference':'Inspected month')+'<strong>'+D.label(ui.focus)+'</strong></div></div>'+ 
      (r?'<div class="v4-statgrid">'+selectedFronts.map((front,k)=>card(fmt(r[front].combat),
        ({west:'West',east:'East',med:'Mediterranean'})[front]+' · combat aircraft losses',
        'All aircraft classes · complete '+r.label,['var(--blue)','var(--teal)','var(--gold)'][k])).join('')+
        card(fmt(selectedFronts.reduce((n,front)=>n+r[front].all,0)),'Selected fronts · all-cause losses',
          'Complete '+r.label+'; only listed fronts, not necessarily all German losses','var(--red)')+'</div>':
        '<div class="warning">No compatible original German all-type theater-loss checkpoint covers '+D.label(ui.focus)+'. For verified quarter-level analysis select September 1943–September 1944.</div>')+
      (ui.theater==='east'?details('Reich / Western German original returns · not Eastern Front',renderOriginalLossReturns()):renderOriginalLossReturns())+
      section('Aircraft-type fighter victory credits — Eighth Fighter Command (whole war)','The credited P-47 / P-51 / P-38 victory split really is available, but the reporting universe is the <strong>US Eighth Fighter Command</strong>, not every Allied aircraft or every German loss in Europe. Fractional credits reflect joint awards; losses by cause were categorized by the later compiler.',
        '<div class="v4-statgrid">'+
          card(fmt(X.eighthAggregate.air,0),'Eighth Fighter Command · air victory credits',tag('recorded-secondary')+' Victory Credits Board and group records','var(--blue)')+
          card(fmt(X.eighthAggregate.ground,1),'Eighth Fighter Command · credited ground destructions',tag('recorded-secondary')+' Ground claims are not air-combat kills','var(--gold)')+
          card(fmt(X.eighthAggregate.airLoss),'Eighth fighters lost in air-combat-related category','Compiler classifications from mission and casualty records','var(--red)')+
          card(fmt(X.eighthAggregate.strafingLoss),'Eighth fighters lost in strafing-related category','Different causal definition from official USAAF theater loss ledger','var(--teal)')+'</div>'+ 
        fraction(X.eighthFighterTypes.map((p,k)=>({label:p.type+' · '+pct(100*p.air/eighthAir),value:p.air,color:['#b5af9d','#91a68a','#a5b5bd','#ceb484'][k]})))+
        table(['Fighter','Air victory credits','Share of Eighth air credits','Ground credits','Air-combat-related own losses*','Strafing-related own losses*','Evidence'],
          X.eighthFighterTypes.map(p=>[p.type,fmt(p.air,1),pct(100*p.air/eighthAir),fmt(p.ground,1),fmt(p.airLoss),fmt(p.strafingLoss),tag(p.quality,p.scope)]))+
        '<p class="v4-callout">*The own-loss categories were assembled from MACRs and unit records with compiler judgement and may not match official Table 104/159 cause classifications. The source itself contains a <strong>one-plane discrepancy:</strong> all type rows and the group total sum to <strong>890</strong> strafing losses, while its final “All types” summary prints <strong>889</strong>. We show the reconciled row sum, and preserve the discrepancy here. <strong>Never multiply these whole-war proportions into every month of German losses.</strong> For a period-specific attribution hypothesis use the sliders farther below, which remain visibly speculative. '+cite('marshall')+'</p>')+
      section('Big Week — directly comparable campaign records','Official USAAF history, 20–25 February 1944. German WESTERN fighter losses are a wider monthly statistic; these are not all losses within Big Week itself.',
        '<div class="v4-statgrid">'+
          card(fmt(Object.values(X.bigWeekOfficial.usFighterSorties).reduce((n,x)=>n+x,0)),'USAAF fighter escort/support sorties · 20–25 Feb','Eighth 2,548 · Ninth 712 · Fifteenth 413','var(--blue)')+
          card(fmt(X.bigWeekOfficial.usFighterLosses),'USAAF fighter losses · Big Week','Official U.S. report; not only air combat','var(--red)')+
          card(fmt(X.bigWeekOfficial.usHeavyBomberLosses.eighth+X.bigWeekOfficial.usHeavyBomberLosses.fifteenth),'USAAF heavy bombers lost · Big Week','Eighth 137 · Fifteenth 89','var(--gold)')+
          card(fmt(X.bigWeekOfficial.rafHeavyBomberLosses),'RAF heavy bombers lost · overlapping campaign','Different night missions; not a U.S. fighter-loss count','var(--teal)')+'</div>'+ 
        table(['German western fighter loss month','Original minimum','Possible revised value','Certainty'],
          X.bigWeekOfficial.germanWesternFighterLost.map(p=>[p.label,fmt(p.min),fmt(p.max),p.min===p.max?tag('recorded','Official retrospective count; dates and boundaries still matter'):tag('estimated-low','Official history warns of 77 potentially misassigned lagged losses')]))+
        '<p class="small">An official history flags 456 versus a possible 533 German February 1944 western fighter losses due to 77 reporting-period adjustments. A single neat figure would conceal that archival disagreement. '+cite('argument')+'</p>')+
      section('Original German all-aircraft losses by front', 'From archive-derived Table 15 (Zamansky). Entire published quarters are displayed when they overlap your selected date range. No partial-quarter estimates are passed off as recorded.',
        records.length?table(['Period','Front','Average inventory','Operational / combat losses','Total all-cause losses','Total vs inventory*'],tableRows)+
          '<p class="tiny">*Quarterly losses divided by average strength. Not the per-sortie loss probability; aircraft may turn over multiple times during a quarter. </p>':
          '<p class="small">No compatible dated loss block overlaps this interval. Earlier RAF/German returns remain linked under Research & sources.</p>')+
      section('Captured German aircraft-loss register: what survives, and when','The RAF Air Historical Branch preserved <strong>20 identified original German returns</strong>. Version 7.2 includes <strong>30 manually checked month-end totals from 12 original volumes</strong>, covering two German reporting commands. June Bf 109 / Fw 190 source-line breakdowns remain preliminary; other original tables are cataloged and explicitly untranscribed.',
        '<div class="v7-archive-controls"><label for="v7-archive-theater">Filter original reports by theater</label><select id="v7-archive-theater">'+
        ['All','All fronts','Reich','Western Front','Eastern Front','Mediterranean','Norway'].map(t=>'<option value="'+t+'"'+(ui.archiveTheater===t?' selected':'')+'>'+t+'</option>').join('')+'</select></div>'+ 
        (Y.lossCatalog.filter(p=>p.start<=months().b&&p.end>=months().a&&(ui.archiveTheater==='All'||ui.archiveTheater===p.theater)).length?
          table(['Original RAF volume','German command / theater','Report covers','Current status'],Y.lossCatalog.filter(p=>p.start<=months().b&&p.end>=months().a&&(ui.archiveTheater==='All'||ui.archiveTheater===p.theater)).map(p=>[
            '<a href="'+p.url+'" target="_blank" rel="noreferrer">AHB '+p.id+' ↗</a>',safe(p.theater),safe(p.from)+' – '+safe(p.to),lossReportStatus(p)])):
          '<div class="v7-empty-chart">No identified register overlaps this time window / theater filter. This does <strong>not</strong> imply no aircraft were lost.</div>')+
        '<p class="tiny">Original scans can contain overlapping reporting dates, changing command boundaries, aircraft damage categories and delayed amendments. Only counts checked against the printed tables will become recorded numerical series. '+cite('capturedloss')+'</p>')+
      '<div class="v4-columns">'+panel('Historical fighter write-offs · selected month',
        '<div class="v4-big">'+fmt(germanLoss(ui.focus).value)+'</div>'+tag(germanLoss(ui.focus).quality,germanLoss(ui.focus).note)+
        '<p class="small">'+(germanLoss(ui.focus).note||'1944 figures are allocated from an annual total of approximately 8,500; no observed type-specific month totals.')+'</p>',cite('murray'))+
      panel('Claims and physical losses',
        '<div class="v4-comparison-note"><strong>Allied air-air claims</strong><span>Usually not independently reconciled</span></div>'+ 
        '<div class="v4-comparison-note"><strong>German combat write-offs</strong><span>May include bombing, ground attack, air-to-air, flak and consequences of damage</span></div>'+ 
        '<div class="v4-comparison-note"><strong>German noncombat write-offs</strong><span>Administrative causes, sometimes with earlier combat damage</span></div>'+ 
        '<p class="small">Do not subtract Allied claims from German all-cause losses or equate an individual claim to a destroyed aircraft.</p>',cite('rafreports'))+'</div>'+ 
      section('Explore a hypothetical attribution scenario',
        'This is a sensitivity tool, not a historical reconstruction. Enter independently dated model-level accepted-claim shares if you have them; inventory weighting is only a weaker fallback.',
        '<div class="v4-subcontrols">'+
        '<div><label for="v4-weight-method">Attribution weighting input</label><select id="v4-weight-method"><option value="fleet"'+(ui.weightMethod==='fleet'?' selected':'')+'>Fighter availability proxy — LOWER confidence</option><option value="manual"'+(ui.weightMethod==='manual'?' selected':'')+'>Enter Allied accepted-claim percentages</option></select></div>'+ 
        '<div class="v4-rangecontrol"><label for="v4-combatshare">Scenario: German fighter losses attributed to air combat <b>'+ui.airCombat+'%</b></label><input class="range" id="v4-combatshare" type="range" min="5" max="80" step="5" value="'+ui.airCombat+'"/></div>'+ 
        '<div class="v4-rangecontrol"><label for="v4-westernshare">Scenario: of those, facing Western Allies <b>'+ui.western+'%</b></label><input class="range" id="v4-westernshare" type="range" min="20" max="100" step="5" value="'+ui.western+'"/></div></div>'+ 
        (ui.weightMethod==='manual'?'<div class="v4-fivecontrols">'+Object.entries(ui.weights).map(([name,v])=>
          '<label>'+safe(name)+' <b>'+v+'</b><input data-v4-weight="'+safe(name)+'" type="range" class="range" min="0" max="100" step="1" value="'+v+'"/></label>').join('')+'</div>':'')+
        (snap?'<div class="v4-estimate"><h3>Illustrative '+D.label(ui.focus)+' attribution</h3>'+ 
          '<p>Of '+fmt(snap.gross.value)+' German fighter write-offs, the scenario isolates '+fmt(snap.eligible)+
          ' hypothetical West-versus-Allied-fighter losses, then divides only that pool by '+(ui.weightMethod==='manual'?'your claim-share inputs':'aircraft availability (NOT actual claims)')+'.</p>'+ 
          fraction(snap.weighted.map((x,k)=>({label:x.name,value:x.value,color:['#82b9ff','#b89cfb','#8bdd9e','#f4c46a','#fa7b81'][k]})))+
          table(['Attacker type','Scenario share','Estimated loss attribution','Evidence'],snap.weighted.map(x=>[x.name,pct(x.share*100),fmt(x.value),tag('estimated-low')]))+
          '</div>':'<p class="warning">No supported German fighter write-off total for '+D.label(ui.focus)+'. No attribution figure is generated. The optional lower-confidence gap switch above can enable an explicitly hypothetical August 1943 example.</p>')+
        '<p class="v4-callout">Even if 33% of accepted Allied claims belonged to a P-51, that would support allocating <em>a specified Allied air-to-air loss pool</em> by claim share—not 33% of all German losses or personnel deaths. Historical claims also require consistent theaters, time windows, and reconciliation rules.</p>')+
      section('German aircraft losses through the selected interval','1944 write-offs remain an aggregate allocation and may not follow any particular model’s historical monthly path.',
        chart('v4-lossplot',range.map(i=>({i,label:D.label(i)})),[
          {name:'German fighter aircraft written off',color:'#fa7b81',value:r=>germanLoss(r.i).value,detail:r=>germanLoss(r.i)}
        ])+'<p class="tiny">Only sourced months and explicitly allocated 1944 scenarios are plotted; gaps stay blank.</p>')+
      section('USAAF ETO fighter claims and actual U.S. fighter losses · yearly source totals','Independent USAAF measures: credited enemy aircraft in air/on ground versus U.S. first-line fighter losses (combat and accidents). IMPORTANT: 1945 claims cover Jan–May, while the separate Table 104 loss subtotal covers Jan–Aug, including post-VE; they are not matched-period ratios.',
        table(['Year','Fighter credits · air','Credits · ground','ETO first-line fighter losses','Evidence'],
          V.usaFighterClaimsAnnual.map(x=>[x.year+(x.year===1945?' · claims Jan–May / losses Jan–Aug':''),fmt(x.air),fmt(x.ground),
            fmt(V.usaFighterLossAnnual.find(a=>a.year===x.year)?.value),tag('recorded')]))+
        '<p class="v4-callout">These are <strong>U.S. fighter-class claims</strong>, not a P-47, P-51, P-38 or RAF breakdown. First-line fighter losses include combat plus accident losses. The different 1945 end dates matter: <strong>do not divide claims by losses in that row</strong>, or treat the losses as VE-Day-only totals. '+cite('digest167')+' · '+cite('digest104')+'</p>')+
      section('Original USAAF fighter claims · every month, 1942–45',
        'Direct monthly figures from the original USAAF Statistical Digest Table 167. This is the fighter AIRCRAFT CLASS, all ETO fighter models combined, rather than model-specific P-47/P-51/P-38 claims. Select an interval above and hover/tap either trace for exact credits.',
        '<div class="v4-statgrid">'+
        card(focusClaim?fmt(focusClaim.air):'—','Enemy aircraft credited in air · '+D.label(ui.focus),focusClaim?tag('recorded')+' Official Table 167':'Month outside original August 1942–May 1945 reporting','var(--blue)')+
        card(focusClaim?fmt(focusClaim.ground):'—','Enemy aircraft credited on ground · '+D.label(ui.focus),focusClaim?tag('recorded')+' Official Table 167':'Not reported for selected date','var(--gold)')+'</div>'+
        chart('v5-claims-monthly',range.map(i=>({i,label:D.label(i)})),[
          {name:'USAAF fighter class · in-air credits',color:'#788d89',value:r=>V.usaFighterClaimsMonthly.find(x=>x.i===r.i)?.air??null,source:'digest167'},
          {name:'USAAF fighter class · ground credits',color:'#b28b59',value:r=>V.usaFighterClaimsMonthly.find(x=>x.i===r.i)?.ground??null,source:'digest167'}
        ])+
        (monthlyClaims.length?table(['Month','Air credits','Ground credits','Total fighter credits','Evidence'],monthlyClaims.map(x=>[
          D.label(x.i),fmt(x.air),fmt(x.ground),fmt(x.total),tag('recorded')])):
          '<p class="small">No official Table 167 fighter-class monthly observations within this selected interval.</p>')+
        '<p class="v4-callout">Important: the sharp April 1945 ground-claim spike reflects <em>credited claims against aircraft on the ground</em>; it is not 3,703 German pilots killed, nor verified aircraft write-offs. Zero denotes a source-reported zero; dates before August 1942 remain unavailable. '+cite('digest167')+'</p>')+
      section('American combat-mission aircraft losses · by cause and class',
        'A separate original return (Table 159), not the Table 104 first-line inventory write-offs. Its enemy-aircraft, antiaircraft and other-cause attributions apply to planes lost on U.S. COMBAT MISSIONS. It does not say which German aircraft or unit caused each loss.',
        '<div class="v4-subcontrols"><div><label for="v5-loss-class">American aircraft class</label><select id="v5-loss-class">'+
          ['Fighter','Heavy bomber','Medium/light bomber'].map(k=>'<option value="'+k+'"'+(k===ui.lossAirClass?' selected':'')+'>'+k+'</option>').join('')+
          '</select></div></div>'+
        '<div class="v4-statgrid">'+
        card(lossFocus?fmt(lossFocus.total):'—','Recorded combat-mission aircraft lost · '+D.label(ui.focus),lossFocus?tag('recorded')+' '+ui.lossAirClass:'1942–43 monthly breakdown unavailable','var(--red)')+
        card(lossFocus?fmt(lossFocus.enemy):'—','Attributed to enemy aircraft',lossFocus?tag('recorded')+' USAAF aircraft lost in combat':'Original Table 159 monthly returns start January 1944','var(--blue)')+
        card(lossFocus?fmt(lossFocus.flak):'—','Attributed to antiaircraft fire',lossFocus?tag('recorded')+' Flak-caused aircraft loss':'Not a count of German air-to-air victories','var(--gold)')+'</div>'+
        chart('v5-us-combat-loss-cause',range.map(i=>({i,label:D.label(i)})),[
          {name:ui.lossAirClass+' · lost to enemy aircraft',color:'#8795a1',value:r=>combatLosses.find(x=>x.i===r.i)?.enemy??null,source:'digest159'},
          {name:ui.lossAirClass+' · lost to flak',color:'#ad8660',value:r=>combatLosses.find(x=>x.i===r.i)?.flak??null,source:'digest159'},
          {name:ui.lossAirClass+' · other combat-mission causes',color:'#a16c69',value:r=>combatLosses.find(x=>x.i===r.i)?.other??null,source:'digest159'}
        ])+
        (lossRows.length?table(['Month','Total lost','Enemy aircraft','Flak','Other causes','Evidence'],lossRows.map(x=>[
          D.label(x.i),fmt(x.total),fmt(x.enemy),fmt(x.flak),fmt(x.other),tag('recorded')])):
          '<p class="small">Monthly Table 159 cause data begin January 1944. Earlier 1942–43 totals exist only as published annual aggregates.</p>')+
        table(['Reporting year','Combat-mission losses','Enemy aircraft','Antiaircraft','Other causes'],
          Object.entries(V.usCombatLossesAnnual[ui.lossAirClass]).map(([year,x])=>[
            year+(year==='1942'?' · Aug–Dec':year==='1945'?' · Jan–May':''),fmt(x.total),fmt(x.enemy),fmt(x.flak),fmt(x.other)]))+
        '<p class="v4-callout"><strong>These are U.S. aircraft lost—not German losses.</strong> A crash attributed to “other causes” here is an outcome of a combat mission, not necessarily a routine peacetime accident. Table 104 has a broader first-line loss accounting definition; therefore the two totals need not match. '+cite('digest159')+'</p>')+
      section('Personnel attrition · separate scale','The series below contains only historically reported German fighter-pilot strength-loss rates; no simulated periods are disguised as source records.',
        chart('v4-pilotloss-plot',range.map(i=>({i,label:D.label(i)})),[
          {name:'Reported fighter-pilot strength loss %',color:'#f4c46a',value:r=>V.pilotAttrition.find(p=>p.i===r.i)?.value??null,source:'murray'}
        ],{percent:true})+'<p class="tiny">January 1942–May 1944 rates reported in Murray’s Table LXVIII and related 1944 casualty returns. See Pilots & experience for original counts and definitions. '+cite('murray')+'</p>');
    $('v4-weight-method').addEventListener('change',e=>{ui.weightMethod=e.target.value;render();});
    $('v5-loss-class').addEventListener('change',e=>{ui.lossAirClass=e.target.value;render();});
    for(const [id,key] of [['v4-combatshare','airCombat'],['v4-westernshare','western']])$(id).addEventListener('input',e=>{ui[key]=+e.target.value;render();});
    document.querySelectorAll('[data-v4-weight]').forEach(e=>e.addEventListener('input',x=>{ui.weights[e.dataset.v4Weight]=+x.target.value;render();}));
  }
  function renderPilotHistory(){
    const {range}=months(),focus=V.pilotAttrition.find(x=>x.i===ui.focus),
      count=V.pilotCasualtyCounts.find(x=>x.i===ui.focus);
    const rateRows=V.pilotAttrition.filter(x=>range.includes(x.i));
    $('v4-body').innerHTML='<div class="v4-hero"><div><div class="kicker">PERSONNEL RETURNS · COHORT EXPERIENCE</div><h2>The pilots behind the aircraft</h2><p>Monthly source-reported German fighter-pilot strength losses are observable. The percentage with 200 encounters, 20 credited victories, or years of surviving combat is not recorded in these aggregate tables. Explore that distinction below.</p></div><div class="v4-inspect">'+(ui.detailMonth==null?'Period-end reference':'Inspected month')+'<strong>'+D.label(ui.focus)+'</strong></div></div>'+ 
      '<div class="v4-statgrid">'+
      card(focus?pct(focus.value):'—','Fighter-pilot strength lost this month',focus?tag('recorded')+' Murray Table LXVIII, not solely fatalities':'No comparable source rate for this exact month','var(--red)')+
      card(count?fmt(count.value):'—','Source-reported fighter-pilot casualties',count?tag('recorded')+' Losses include categories beyond killed':'An absolute count cannot be inferred from modeled strength','var(--gold)')+
      card(fmt(rateRows.length),'Reported rate months in range','Documented monthly pilot-strength loss percentages; 1942–May 1944','var(--teal)')+
      card('Not observed','Average kills or sorties','Per-pilot experience distribution requires personnel-level records','var(--blue)')+'</div>'+
      section('A German command report: April 1944 losses versus replacements','The captured 15–16 May Göring/Galland conference is a direct personnel-return comparison. Its reported 489 pilot losses differ from the <strong>447</strong> in the existing Murray month-series. The reporting definitions are not demonstrably identical; neither figure replaces the other.',
        '<div class="v4-statgrid">'+
        card(fmt(Y.pilotApril.losses),'Galland: fighter pilots lost · April 1944',tag('recorded')+' Including '+fmt(Y.pilotApril.officerLosses)+' officers','var(--red)')+
        card(fmt(Y.pilotApril.replacements),'Galland: replacement pilots · April 1944',tag('recorded')+' Including '+fmt(Y.pilotApril.officerReplacements)+' officers','var(--teal)')+
        card('−'+fmt(Math.abs(Y.pilotApril.flowDifference)),'Difference in these two reported flows','Derived: 396 replacements minus 489 losses · not a full strength change','var(--gold)')+
        card(fmt(Y.pilotApril.alternativeMurray447),'Murray: April source-series casualties',tag('recorded-secondary')+' Different compiled series; comparability unresolved','var(--blue)')+'</div>'+ 
        '<div class="v4-callout"><strong>The mismatch is real, not a graph bug.</strong> Do not combine 489 with a percentage from the other table to manufacture a pilot denominator. The original conference also discusses releasing instructors, transferring experienced crews and training shortages. '+cite('galland44')+' · '+cite('murray7')+'</div>')+
      section('Frontline fighter-pilot readiness at the end of 1943','Murray gives a dated German single-engine frontline pilot-strength snapshot. It is <strong>not</strong> the number of all German aircrew or all serving pilots throughout the war.',
        '<div class="v4-statgrid">'+card(fmt(Y.pilotBaseline.total),'Pilots on frontline strength','31 Dec 1943 · source-compiled German return','var(--gold)')+
        card(fmt(Y.pilotBaseline.fullyReady),'Fully combat-ready','62.3% of total · rounded','var(--teal)')+
        card(fmt(Y.pilotBaseline.partlyReady),'Partly combat-ready','12.2% of total · rounded','var(--blue)')+
        card(fmt(Y.pilotBaseline.notFullyOrPartly),'Not reported as fully / partly ready','Residual 2,395 − 1,491 − 291; <strong>derived</strong>','var(--red)')+'</div>'+ 
        fraction([{label:'Fully ready',value:1491,color:'#91aa83'},{label:'Partly ready',value:291,color:'#b9a471'},{label:'Other readiness',value:613,color:'#9c7770'}])+cite('murray7'))+
      section('German fighter-pilot attrition · monthly source series','Dates without a comparable wartime rate stay blank. This is NOT a mortality curve, a claims curve, or the simulator output.',
        chart('v5-pilot-source-rate',range.map(i=>({i,label:D.label(i)})),[
          {name:'Reported fighter-pilot strength loss %',color:'#c89555',value:r=>V.pilotAttrition.find(p=>p.i===r.i)?.value??null,source:'murray'}
        ],{percent:true})+
        '<div class="v4-callout">A monthly loss of 15% of pilot strength does <strong>not</strong> mean 15% killed. The source’s definition can include wounded, missing, captured or removed from active strength. Replacement pilots can also enter between monthly reports. '+cite('murray')+'</div>')+
      section('Recorded individual-month counts, where available','Counts are not extrapolated to other months. The corresponding percentage may derive from a different source table with its own denominator.',
        chart('v5-pilot-source-count',range.map(i=>({i,label:D.label(i)})),[
          {name:'Recorded fighter-pilot casualties',color:'#b06f55',value:r=>V.pilotCasualtyCounts.find(p=>p.i===r.i)?.value??null,source:'murray'}
        ])+
        table(['Month','Reported strength lost','Reported count','Evidence'],rateRows.map(p=>[
          D.label(p.i),pct(p.value),fmt(V.pilotCasualtyCounts.find(x=>x.i===p.i)?.value),tag('recorded')]))+
        '<p class="tiny">Murray’s Table LXVIII chart gives rates; adjacent 1943–44 tables supply only the listed absolute casualty counts. Missing months are truly missing, not zero.</p>')+
      '<div class="v4-columns">'+panel('What happened to the 1940 veterans?',
        '<p>Surviving the Battle of Britain might produce valuable operational experience, but losing aircraft, pilots, and veteran flight leaders also damages future training and unit continuity.</p><p class="small">A named 1940 cohort can be followed through 1945 <em>as a scenario</em>. We cannot infer a precise surviving fraction from aggregate fighter-aircraft losses.</p>',cite('rafBattle'))+
      panel('What surviving aces can—and cannot—tell us',
        '<p>The reference pilots in the simulator span hundreds to over a thousand sorties, widely different theaters and years of combat. Famous aces are a <strong>survivorship-selected</strong> minority, not a representative sample of all German pilots.</p><p class="small">Turn to the Pilot simulator for modeled cohorts, exposure differences, correlated skill and newcomer risks.</p>',cite('murray'))+'</div>'+
      section('What a fighter Gruppe actually experienced · spring 1944','These two different JG 53 units provide documented local case studies. Their rates are <strong>not</strong> estimates for every Luftwaffe fighter unit.',
        table(['Unit / date','Mean aircraft / ready','Aircraft loss or damage','Pilot losses','Operational tempo'],Y.jg53.map(p=>[
          p.unit+' · '+p.month,fmt(p.avgAircraft)+' / '+fmt(p.avgReady),
          p.combatAircraftLost!=null?fmt(p.combatAircraftLost)+' combat + '+fmt(p.noncombatAircraftWrittenOff)+' noncombat write-offs':fmt(p.aircraftFullyDestroyed)+' fully destroyed / '+fmt(p.aircraftDamagedOrLost)+' lost or damaged',
          p.missing!=null?fmt(p.killed)+' killed, '+fmt(p.missing)+' missing, '+fmt(p.wounded)+' wounded; injuries separately recorded':fmt(p.killed)+' killed, '+fmt(p.injured)+' injured',
          p.sorties!=null?fmt(p.sorties)+' sorties, '+fmt(p.operations)+' operations':fmt(p.daysActive)+' days of operations']))+
        '<p class="tiny">In May the loss/damage categories should not be added to casualty categories indiscriminately: injury and bailout descriptions overlap. '+cite('murray7')+'</p>')+
      section('Explore the hypothetical cohort model','The original Monte Carlo engine tracks individuals with sorties, encounters and accumulated claims, plus a varying risk of loss. These trajectories are NOT reconstructed service records.',
        '<button class="btn primary" id="v5-open-simulator">Open cohort simulation ↗</button>');
    $('v5-open-simulator').addEventListener('click',()=>setView('pilot'));
  }
  function factoryEvidence(){
    const {range}=months(),selected=new Set(range);
    const entries=W.usaFactory.filter(p=>selected.has(D.idx(p.year,p.month)));
    const byYear=[...new Set(entries.map(p=>p.year))].map(y=>({year:y,months:entries.filter(p=>p.year===y)}));
    const category=[['Fighters','fighters','#8fb9a8'],['Heavy/very heavy bombers','heavy','#d0b486'],
      ['Medium/light bombers','medium','#97a9bc'],['Other accepted aircraft','noncombat','#a79eb6']];
    const total=entries.reduce((s,p)=>s+p.all,0),fighters=entries.reduce((s,p)=>s+p.fighters,0);
    const bars=byYear.map(y=>{
      const n=y.months.reduce((s,p)=>s+p.all,0),cols=category.map(([name,key,color])=>({label:name,value:y.months.reduce((s,p)=>s+p[key],0),color}));
      return '<div class="v74-factory-year"><strong>'+y.year+' <small>'+y.months.length+' month'+(y.months.length===1?'':'s')+' selected</small></strong><div>'+fraction(cols)+'</div><b>'+fmt(n)+'</b></div>';
    }).join('');
    return section('USAAF factory acceptances · original monthly worldwide data',
      'New in v7.4: all 68 original reported months (January 1940–August 1945) from Statistical Digest Table 74. This is <strong>worldwide manufacturing acceptance</strong>, not aircraft available or deployed in Europe. Selected-period flows are summed; 1945 is never assumed to be a complete calendar year.',
      '<div class="v74-evidence-summary"><div><span>Aircraft accepted · selected months</span><strong>'+fmt(total)+'</strong></div><div><span>Fighters accepted · selected months</span><strong>'+fmt(fighters)+'</strong></div><div><span>Original source months in selection</span><strong>'+entries.length+' / '+range.length+'</strong></div></div>'+ 
      chart('v74-usa-factory-fighters',range.map(i=>({i,label:D.label(i)})),[
        {name:'USAAF fighters accepted at factories (worldwide)',color:'#8fb9a8',source:'aafsd74',
          value:r=>W.usaFactory.find(p=>D.idx(p.year,p.month)===r.i)?.fighters??null}
      ])+
      (bars?'<div class="v74-factory-years">'+bars+'</div>':'<p class="v7-empty-chart">No factory acceptance entry in this period. The series begins January 1940; absence means unknown, not zero.</p>')+
      details('Original month-by-month Table 74 transcription · all selected months',table([
        'Year / month','Total accepted','Fighters','Heavy + very heavy bombers','Medium + light bombers','Other types','Evidence'
      ],entries.map(p=>[p.period,fmt(p.all),fmt(p.fighters),fmt(p.heavy),fmt(p.medium),fmt(p.noncombat),cite('aafsd74')])))+
      '<p class="v4-callout">An original aircraft accepted by a U.S. factory might still require shipment, assembly, crew allocation and serviceability. These totals cannot be added to USAAF ETO aircraft-on-strength or to RAF fighter counts. The HyperWar digitization contains three flagged numeric transcription discrepancies, checked against row and annual totals; see the preserved corrections in the research JSON. '+cite('aafsd74')+'</p>');
  }
  function renderComparison(){
    const {range}=months(),american=allSnapshot(ui.focus).us;
    const seats=['P-47','P-51','P-38'].map(type=>({name:type,pilot:V.sample(V.usCrews[type],ui.focus),airframe:american.find(x=>x.type===type)}));
    const c1944=V.usaCosts,claims1944=V.usaFighterClaimsAnnual.find(x=>x.year===1944);
    const sorties=V.usaFighterSorties[ui.opsTheater],sortieFocus=sorties.find(x=>x.i===ui.focus);
    const sortieRange=sorties.filter(x=>range.includes(x.i));
    $('v4-body').innerHTML='<div class="v4-hero"><div><div class="kicker">INDUSTRIAL OUTPUT · OPERATIONAL EXPOSURE</div><h2>How airpower was supplied and employed</h2><p>Production, aircraft procurement cost, theater inventory, flying hours and confirmed reporting categories tell different parts of the story. Explore aircraft types without equating cost, availability or credited victories with intrinsic fighter quality.</p></div><div class="v4-inspect">'+(ui.detailMonth==null?'Period-end reference':'Inspected month')+'<strong>'+D.label(ui.focus)+'</strong></div></div>'+
      '<div class="v4-statgrid">'+
      card(money(c1944['P-38'][1944]),'P-38 · 1944 unit procurement cost','Average flyaway price; original USAAF fiscal-year basis','var(--blue)')+
      card(money(c1944['P-47'][1944]),'P-47 · 1944 unit procurement cost','Same accounting definition; excludes service costs','var(--teal)')+
      card(money(c1944['P-51'][1944]),'P-51 · 1944 unit procurement cost','Same accounting definition; not cost per sortie','var(--gold)')+
      card(fmt(claims1944.air),'1944 USAAF ETO fighter aerial credits','All fighter models combined; claimed, not independently confirmed','var(--red)')+'</div>'+
      factoryEvidence()+
      section('Defence of the Reich: serviceable fighter aircraft at three original dates','Murray Table LIX reports <strong>Luftflotte Reich</strong> only. It is deliberately kept separate from the all-front fighter returns and from the modeled airframe-by-type split.',
        table(['Exact date','Single-engine on strength','Single-engine ready','Single-engine readiness','Twin-engine on strength','Twin-engine ready','Source'],Y.reichReadiness.map(p=>[
          p.date,fmt(p.seOn),fmt(p.seReady),pct(100*p.seReady/p.seOn),fmt(p.teOn),fmt(p.teReady),tag('recorded-secondary')]))+
        '<p class="tiny">The two July 1944 observations are 1 July and 27 July, not two separate months. These are dated snapshots; the apparent rebound is not a documented continuous daily trend. '+cite('murray7')+'</p>')+
      section('Fuel disruption: aircraft production was not the same as aircraft capability','German fuel-capacity percentages show one reason late-war aircraft strength cannot simply be turned into effective sorties. These are percentages of reported <strong>production capacity</strong>, not absolute tonnage, inventories or actual sorties.',
        chart('v7-fuel-capacity',range.map(i=>({i,label:D.label(i)})),[
          {name:'Total fuel · % productive capacity',color:'#aab68d',value:r=>Y.fuelCapacity.find(p=>p.i===r.i)?.allFuel??null,source:'murray7'},
          {name:'Aviation fuel · % productive capacity',color:'#b99b70',value:r=>Y.fuelCapacity.find(p=>p.i===r.i)?.aviationFuel??null,source:'murray7'}
        ],{percent:true})+
        table(['Month','All fuel · share of capacity','Aviation fuel · share of capacity','Evidence'],Y.fuelCapacity.filter(p=>range.includes(p.i)).map(p=>[
          p.label,pct(p.allFuel,0),pct(p.aviationFuel,0),tag('recorded-secondary')]))+
        '<p class="tiny">Murray Table LVIII, August 1944–February 1945. Values past February 1945 remain unobserved in this particular table; the chart does not continue its trend by assumption. '+cite('murray7')+'</p>')+
      section('Airframe procurement costs','Original average wartime U.S. military aircraft costs, not maintenance or lifetime operating cost. Different model contracts and changing production scale affect comparisons.',
        table(['Fiscal year','P-38 Lightning','P-47 Thunderbolt','P-51 Mustang','Accounting status'],[1942,1943,1944,1945].map(y=>[
          String(y),money(c1944['P-38'][y]),money(c1944['P-47'][y]),money(c1944['P-51'][y]),tag('recorded')]))+
        '<p class="tiny">'+cite('cost')+' · Do not extrapolate these prices into unobserved sortie costs or assume each model had an identical role.</p>')+
      section('U.S. factories versus European aircraft inventories','Worldwide annual acceptances are separate from ETO operational strength; no interpolation can prove the aircraft were serviceable or engaged at any exact moment.',
        table(['Calendar year','P-38 accepted worldwide','P-47 accepted worldwide','P-51 accepted worldwide'],[1942,1943,1944,1945].map(y=>[
          String(y)+(y===1945?' · full US year':''),...['P-38','P-47','P-51'].map(t=>fmt(V.usaAnnualAccepted[t][y]))]))+
        chart('v4-eto-plot',range.map(i=>({i,label:D.label(i)})),[
          {name:'P-47 · USAAF ETO',color:'#82b9ff',value:r=>V.airframe('P-47',r.i,'USAAF').value,detail:r=>V.airframe('P-47',r.i,'USAAF')},
          {name:'P-51 · USAAF ETO',color:'#48d3c5',value:r=>V.airframe('P-51',r.i,'USAAF').value,detail:r=>V.airframe('P-51',r.i,'USAAF')},
          {name:'P-38 · USAAF ETO',color:'#f4c46a',value:r=>V.airframe('P-38',r.i,'USAAF').value,detail:r=>V.airframe('P-38',r.i,'USAAF')}
        ])+
        table(['USAAF model','ETO aircraft · '+D.label(ui.focus),'Quality','Fighter crews on hand','Crew evidence'],seats.map(x=>[
          x.name,fmt(x.airframe.value),tag(x.airframe.quality),fmt(x.pilot.value),tag(x.pilot.quality)]))+
        '<p class="tiny">USAAF strength is reconstructed from quarterly snapshots; crew snapshots cover only a few dated months. '+cite('usa')+'</p>')+
      section('European flying hours · currently verified comparison blocks','Quarterly hours are an exposure measure; they mix distinct missions and include periods after D-Day. Missing types/quarters are not zero.',
        '<div class="v4-columns">'+V.flyingHours.map(q=>panel(q.label,fraction([
          {label:'P-47',value:q.p47,color:'#82b9ff'},{label:'P-51',value:q.p51,color:'#48d3c5'}])+
          '<p class="tiny">P-47 '+fmt(q.p47)+' hours · P-51 '+fmt(q.p51)+' hours</p>',cite('hrs'))).join('')+'</div>')+
      section('September 1944 — original Allied force table versus German western fighters','Official USAAF history III chapter 17 gives the average daily fighter inventory and operational count for four separate Allied forces. German western operational command strength is reported on <strong>25 September</strong> (a different observation); this is not the worldwide Luftwaffe.',
        table(['Allied air force','Daily average fighters on hand','Daily average operational','Ready fraction'],
          X.september44Allied.forces.map(p=>[p.name,fmt(p.total),fmt(p.operational),pct(100*p.operational/p.total)]).concat([[
            'ALL FOUR reported forces',fmt(X.september44Allied.reportedTotal.total),fmt(X.september44Allied.reportedTotal.operational),pct(100*X.september44Allied.reportedTotal.operational/X.september44Allied.reportedTotal.total)]]))+
        '<p class="v4-callout"><strong>German Luftflotte Kommando West: '+fmt(X.september44Allied.germanWest.fightersOnStrength)+' fighters on strength, '+X.september44Allied.germanWest.date+'.</strong> This narrower theater command should not be compared against the RAF AHB VII/107 all-front German aircraft stock as though they were the same population. The Allied four include the Italy-based Fifteenth AF; air forces differed in missions and location. '+cite('ninthSep44')+'</p>')+
      section('Monthly USAAF fighter missions by role · original combat sortie returns',
        'Table 128 records the number of fighter SORTIES by mission, not the number of unique pilots or fighter models. Choose ETO or Mediterranean; the latter is a distinct theater and should not be added to German Western Front fighter totals without reconciling the scope.',
        '<div class="v4-subcontrols"><div><label for="v5-ops-theater">Recorded theater</label><select id="v5-ops-theater">'+
          '<option value="ETO"'+(ui.opsTheater==='ETO'?' selected':'')+'>European Theater (ETO)</option>'+
          '<option value="MTO"'+(ui.opsTheater==='MTO'?' selected':'')+'>Mediterranean Theater (MTO)</option></select></div></div>'+
        '<div class="v4-statgrid">'+
        card(sortieFocus?fmt(sortieFocus.total):'—','Total fighter combat sorties · '+D.label(ui.focus),sortieFocus?tag('recorded')+' All USAAF fighter models':'No Table 128 data for selected date','var(--blue)')+
        card(sortieFocus?pct(sortieFocus.escort/sortieFocus.total*100):'—','Escort share · '+D.label(ui.focus),sortieFocus?fmt(sortieFocus.escort)+' escort sorties':'Source begins January 1943','var(--teal)')+
        card(sortieFocus?pct(sortieFocus.strike/sortieFocus.total*100):'—','Strike share · '+D.label(ui.focus),sortieFocus?fmt(sortieFocus.strike)+' bombing/strafing sorties':'Not a zero before January 1943','var(--gold)')+'</div>'+
        chart('v5-us-sorties-role',range.map(i=>({i,label:D.label(i)})),[
          {name:'USAAF fighter escort sorties',color:'#7a9085',value:r=>sorties.find(x=>x.i===r.i)?.escort??null,source:'digest128'},
          {name:'Bombing and strafing sorties',color:'#b58d59',value:r=>sorties.find(x=>x.i===r.i)?.strike??null,source:'digest128'},
          {name:'Reconnaissance sorties',color:'#8698ab',value:r=>sorties.find(x=>x.i===r.i)?.recon??null,source:'digest128'},
          {name:'Other fighter combat sorties',color:'#a17675',value:r=>sorties.find(x=>x.i===r.i)?.other??null,source:'digest128'}
        ])+
        (sortieRange.length?table(['Month','All sorties','Escorts','Bombing / strafing','Recon','Other*','Evidence'],sortieRange.map(x=>[
          D.label(x.i),fmt(x.total),fmt(x.escort),fmt(x.strike),fmt(x.recon),fmt(x.other),tag('recorded')])):
          '<p class="small">No documented Table 128 fighter-sortie returns in the selected date range.</p>')+
        '<p class="v4-callout">*Other includes combat patrols, interceptions, sweeps and sea-search flights. The large recorded shift into strike sorties across 1944–45 reflects <em>mission assignment</em>, not an inherent performance ranking of aircraft types. Figures cover <strong>all USAAF fighters</strong>, without a P-47/P-51/P-38 split. '+cite('digest128')+'</p>')+
      section('ETO fighter claims are not by model in the surviving digest table','Table 167 is explicitly grouped by aircraft CLASS (fighter, bomber), not a P-38 / P-47 / P-51 breakdown. Do not apportion these original totals by aircraft inventory and call them observed model victories.',
        table(['Reporting year','Fighter air-to-air credits','Fighter aircraft destroyed on ground · credited','Combined claims','Source'],
          V.usaFighterClaimsAnnual.map(c=>[c.year+(c.year===1945?' · Jan–May':''),fmt(c.air),fmt(c.ground),fmt(c.total),tag('recorded')]))+
        '<p class="v4-callout">These are <strong>U.S. wartime credited claims</strong>, not German independently verified destruction. Losses, pilot deaths, and claims must remain separate measures. '+cite('digest167')+'</p>')+
      '<div class="v4-columns">'+panel('Changes in operational assignments',
        '<p>Mission mix changed throughout the war: escort, interception, armed reconnaissance and ground support exposed pilots to different opponents and threats.</p><p class="small">A change in credited aerial victories without a comparable exposure denominator does not by itself measure fighter-to-fighter combat performance.</p>',cite('murray'))+
      panel('Time-window discipline',
        '<p>The COSSAC invasion outline was presented in July 1943; the landings were 6 June 1944.</p><p class="small">A quarterly flight-hours value that includes late June 1944 cannot be used as a precise “pre-D-Day only” result. Monthly claims by individual model remain outside this source set.</p>',cite('navy'))+'</div>';
    $('v5-ops-theater').addEventListener('change',e=>{ui.opsTheater=e.target.value;render();});
  }
  function renderCampaigns(){
    const {a,b}=months();
    const eastern=new Set(['barbarossa','citadel']);
    const western=new Set(['britain','schweinfurt','bigweek','overlord','bodenplatte']);
    const selected=X.campaignCases.filter(p=>p.a<=b&&p.b>=a&&
      (ui.theater==='overall'||(ui.theater==='east'?eastern:western).has(p.id)));
    const chapterRows=X.historyChapters.map(c=>['Chapter '+c.chapter,safe(c.title),safe(c.theatre),
      '<a href="'+c.url+'" rel="noreferrer" target="_blank">Read original chapter ↗</a>']);
    $('v4-body').innerHTML='<div class="v4-hero"><div><div class="kicker">CAMPAIGN HISTORY · CROSS-REFERENCED ARCHIVES</div><h2>From the Condor Legion to VE Day</h2>'+ 
      '<p>Campaign landmarks use the shared 1936–May 1945 timeline. A campaign article is a research starting point; official primary/secondary documents decide which numbers enter the calculator.</p></div><div class="v4-inspect">Active interval<strong>'+D.label(a)+' — '+D.label(b)+'</strong></div></div>'+ 
      section('Campaigns in your selected time window','These are selected research case studies, not a complete catalog of major operations. Theater selection filters their geographical emphasis; clicking the research links never changes model values.',
        selected.length?'<div class="v6-campaign-grid">'+selected.map(p=>'<article class="v6-campaign-card"><small>'+D.label(p.a)+' – '+D.label(p.b)+'</small>'+ 
          '<h3>'+safe(p.name)+'</h3><p class="tiny">'+safe(p.scale)+'</p><p>'+safe(p.note)+'</p><p class="tiny">'+cite(p.source)+' · <a target="_blank" rel="noreferrer" href="'+p.wiki+'">Wikipedia references trail ↗</a></p></article>').join('')+'</div>':
        '<p class="small">No featured campaign intersects this selection; the annual/archive series still apply. Move your range or open the research bibliography.</p>')+
      section('What the original books actually cover','All 22 chapter URLs supplied for USAAF Volume III (January 1944–May 1945), indexed as an audit trail. No photograph or map implies a precise pilot fatality or a fighter kill count.',
        table(['Chapter','Original section','Geographical area','Direct source'],chapterRows)+
        '<p class="tiny">The WWII USAAF official history includes Allied and captured German records. The chapters are historical narrative and operation tables; each extracted number needs to be tied to its exact page, campaign duration and force. '+cite('ushistory3')+'</p>')+
      section('Historical audit example: September 1944','Daily average operational Allied fighters, compared with a <em>different day and theater</em> German inventory return.',
        table(['Command','On strength','Operational'],X.september44Allied.forces.map(p=>[p.name,fmt(p.total),fmt(p.operational)]))+
        '<p class="v4-callout">Official Chapter 17 puts the combined Allied four-command operational count at '+fmt(X.september44Allied.reportedTotal.operational)+' out of '+fmt(X.september44Allied.reportedTotal.total)+', while Luftflotte Kommando West had '+fmt(X.september44Allied.germanWest.fightersOnStrength)+' fighters on strength on 25 September. Compare with the RAF VII/107 <strong>worldwide</strong> series carefully: different reporting populations, periods and readiness criteria. '+cite('ninthSep44')+'</p>')+
      section('Research trail, not a hidden ranking','Wikipedia articles and specialist citations below are additional discovery routes. For the full evaluated trail, publication details and status, see Research & sources.',
        '<div class="v6-linkgrid">'+X.wikiTopics.filter(x=>x.section==='Campaign').map(x=>'<a href="'+x.url+'" target="_blank" rel="noreferrer">'+safe(x.name)+' ↗ <small>'+safe(x.bibliography)+'</small></a>').join('')+'</div>');
  }
  function renderAbout(){
    $('v4-body').innerHTML='<div class="v4-hero"><div><div class="kicker">PROJECT NOTES</div><h2>Why this atlas exists</h2><p>A historical research tool for the European air war, from Spanish Civil War volunteer fighter units to the end of fighting in Europe. It investigates how pilots, equipment, replacements, force employment and losses interacted over time.</p></div></div>'+
      section('The starting question','The project began with curiosity about different Allied fighter aircraft and their wartime assignments. The scope widened as the larger questions about German pilot attrition, Allied force strength, industrial capacity and archive quality proved more revealing.',
        '<p class="small">This is not an aircraft-ranking exercise or an attempt to validate one commentator’s preferred conclusion. Historical interpretations may motivate questions; source records determine which numerical claims can be shown.</p>')+
      section('Two engines, different answers','Historical records and hypothetical dynamics are offered side by side, but should never be silently merged.',
        '<div class="v4-columns">'+panel('Source-led views',
          '<p>Documented national reports, dated theater inventories, factory output, costs, fighter-pilot attrition rates and aggregate victory credits. Values are marked as recorded, derived, higher-confidence estimates, lower-confidence estimates or unavailable.</p>')+
        panel('Pilot and equipment simulations',
          '<p>Adjustable cohorts, loss exposure, flying tempos, combat encounters and credited claims. The model explores plausible mechanisms and alternative assumptions, not the personal biographies of every historical fighter pilot.</p>')+'</div>')+
      section('What an honest number requires','Every quantity should have an original reporting population, theater, exact period, category and citation.',
        '<ul><li>Claimed aircraft destroyed ≠ independently documented German aircraft losses.</li><li>Aircraft produced ≠ aircraft delivered ≠ aircraft operationally ready.</li><li>Fighter-pilot strength losses ≠ deaths; men can return from injury or be reassigned.</li><li>Interpolated months remain estimates; undocumented 1945 months are never fabricated.</li><li>German, British and American strength snapshots often measure different things.</li></ul>')+
      section('Research continuity','A locally running static website hosted from the public repository, with datasets and tests kept in separable source files.',
        '<p class="small">Use the Research & sources tab to audit provenance and known gaps; the simulator and export tools remain accessible in their own tabs.</p>');
  }
  function renderSources(){
    $('v4-body').innerHTML='<div class="v4-hero v74-research-hero"><div><div class="kicker">METHOD · DOCUMENTARY TRAIL</div><h2>Audit the numbers</h2><p>Every plotted historical quantity has a definition, time scope and provenance category. The simulator makes assumptions explicit and leaves unavailable records blank.</p></div><img src="./dist/assets/research.jpg" alt="Historical March 1945 332nd Fighter Group briefing photograph by Toni Frissell" loading="lazy"></div>'+ 
      section('Five evidence categories','Two grades for estimated data, as requested. “Higher confidence” still does not mean the number was recorded for that precise month.',
        '<div class="v4-five">'+[
          ['recorded','Recorded','Direct source value with date and denominator.'],
          ['derived','Derived','Formula applied to source numbers; definition recorded.'],
          ['estimated-high','Higher-confidence estimate','Interpolation between nearby, comparable archival checkpoints.'],
          ['estimated-low','Lower-confidence estimate','Longer gap, approximate model shares, or cross-series apportionment.'],
          ['model','Scenario only','Illustrative hazard, engagement chance, front transfer or claim allocation.']
        ].map(x=>'<div class="v4-info"><h3>'+tag(x[0])+'</h3><strong>'+x[1]+'</strong><p>'+x[2]+'</p></div>').join('')+'</div>')+
      section('Newly transcribed original data · 7.4','These series can be independently inspected even if they are not statistically comparable. Early Soviet entries are separate archival reporting populations, not points in a uniform USSR-wide census.',
        table(['Original date / scope','Fighter aircraft','All combat / accepted aircraft','Evidence status','Original source'],[
          ...W.sovietEarly.map(p=>[p.day+' '+p.period+' · '+safe(p.coverage),fmt(p.fighters),fmt(p.all),tag(p.status),cite(p.sourceId)+
            (p.trainedFighterCrews!=null?'<br><small>'+fmt(p.trainedFighterCrews)+' trained fighter crews (separate headcount)</small>':'')]),
          ['Jan 1940–Aug 1945 · worldwide USAAF factory acceptances',fmt(W.usaFactory.reduce((n,p)=>n+p.fighters,0)),
            fmt(W.usaFactory.reduce((n,p)=>n+p.all,0)),tag('recorded'),cite('aafsd74')]
        ])+'<p class="v4-callout">The RKKA historical website transcribes Soviet wartime archive figures, but does not magically turn an incomplete 1941 front list into complete Soviet strength. <strong>Original-page verification is still a follow-up.</strong> The USA production figures are flows; Soviet aircraft strength is stock. Those measures should not share a summed total.</p>')+
      section('Promising research still to audit','The offline research ledger retains unintegrated leads, identified archives, chronology conflicts and how future versions can use them. Finding a source does not mean its numbers are already verified.',
        table(['Source or archival direction','Status / possible contribution'],[
          ['RAF AHB VII/83 and VII/92 · 1939–41 German loss returns', 'Located primary-report family · original monthly causes/types await source-page audit'],
          ['RAF AHB VII/152 · German Eastern Front 1943', 'Official translated captured wartime reports · front-specific returns may be extracted'],
          ['Soviet MOD f.35, op.107559ss, d.13 · November return', '1,646 fighters / 5,335 combat, but page heading conflicts with wartime context: 1941 versus 1942; withheld from plotted chronology'],
          ['Bundesarchiv RL 2 III/700–734 and RAF AIR 40/1207', 'Candidate German unit returns · match date, Luftflotte, geography and category before merge'],
          ['Monthly RAF and Soviet pilot-strength / casualty returns', 'Research needed · do not fill by applying German pilot hazard assumptions'],
          ['USAAF late-1944/1945 aircraft-type operating/loss returns', 'Follow-up to avoid approximated individual fighter loss totals']
        ])+'<p class="tiny">A fuller searchable source inventory and rationale is preserved in <code>research/sources/lead-inventory.md</code> in the GitHub project, including source URLs and numerical audit notes.</p>')+
      section('Original research links','Sources are intentionally tucked away here and behind the source-note toggle on every analytical view.',
        '<div class="v6-search"><label for="v6-source-search">Search original archives, page titles, aircraft or organizations</label><input type="search" id="v6-source-search" placeholder="e.g. RAF, Murray, pilots, claims, Bundesarchiv…" aria-label="Search source bibliography"></div>'+ 
        '<div class="v4-sourcegrid" id="v6-sourcegrid">'+Object.entries(V.SOURCES).map(([id,s])=>'<div class="v4-sourcecard" data-v6-search="'+safe((s.short+' '+s.title+' '+s.type+' '+s.note).toLowerCase())+'"><small>'+safe(s.type)+'</small><h3>'+safe(s.title)+'</h3><p>'+safe(s.note)+'</p><a href="'+s.url+'" target="_blank" rel="noreferrer">Open original / transcript ↗</a></div>').join('')+'</div>')+
      section('Wikipedia bibliography cross-check — exact provenance','The originating Wikipedia page and the resulting book/archive lead are listed together. “Verified” means the linked original or compilation was inspected; “Bibliography” means the cited book was identified but its relevant pages have <strong>not</strong> been read. A citation is not an automatic data point.',
        table(['Discovered via','Referenced source','Classification','Follow-up status','Specific relevance / limitations'],
          X.researchTrails.map(p=>[safe(p.from),'<a href="'+p.url+'" target="_blank" rel="noreferrer">'+safe(p.to)+' ↗</a>',
            safe(p.kind),tag(p.status==='verified'?'recorded':p.status==='verified-partial'?'estimated-high':'estimated-low',p.status),safe(p.role)])))+
      section('Research entry points: Wikipedia article-by-article','Equipment and battle pages are listed explicitly so you can follow their own footnotes. No unsourced infobox battle-strength estimate becomes a recorded source-series value.',
        table(['Area','Wikipedia page','Bibliographic route / caution'],X.wikiTopics.map(p=>[safe(p.section),
          '<a href="'+p.url+'" target="_blank" rel="noreferrer">'+safe(p.name)+' ↗</a>',safe(p.bibliography)])))+
      section('USAAF Volume III complete 22-chapter set','Primary official operational history, 1944–VE Day. The whole set remains linked even if the current time slider is in 1936–43.',
        '<div class="v6-linkgrid">'+X.historyChapters.map(p=>'<a href="'+p.url+'" target="_blank" rel="noreferrer">Chapter '+p.chapter+' · '+safe(p.title)+' ↗</a>').join('')+'</div>')+
      section('Twenty original German aircraft-loss returns: full catalog','All twenty linked RAF reports remain discoverable. May/June 1944 Reich and Western Front have source-checked all-aircraft monthly totals; type-level June rows are provisional. The remainder have not been numerically imported.',
        table(['RAF AHB original','German theater','Recorded date span','Numerical import'],Y.lossCatalog.map(p=>[
          '<a href="'+p.url+'" target="_blank" rel="noreferrer">'+p.id+' ↗</a>',p.theater,p.from+' – '+p.to,lossReportStatus(p)]))+
        '<p class="tiny">Major source leads: '+cite('capturedloss')+', '+cite('galland44')+', '+cite('murray7')+' and the independently reproduced <em>same</em> German meeting minutes '+cite('nurembergL166')+'.</p>')+
      section('Known data gaps and safeguards','Some missing time series simply cannot be reconstructed with the source sets available.',
        '<div class="v4-columns">'+panel('Not claimed as measured',
          '<ul><li>Every German fighter pilot’s individual experience and combat years</li><li>German casualties matched to each exact P-47/P-51/Spitfire kill claim</li><li>All fronts’ monthly aircraft losses divided by exact German model</li><li>Monthly RAF and Soviet pilot strength across all commands</li><li>May 1945 “unreported losses” manufactured from an empty record</li></ul>')+
        panel('Data-quality safeguards',
          '<ul><li>Absence appears as —, never as a zero casualty event</li><li>All counts are bounded to actual selected historical periods</li><li>1980s/2010s author interpretations are distinguished from wartime tabulations</li><li>Full-quarter observations are never silently monthlyized</li><li>Aircraft-on-strength, operational-ready, crew-on-hand and accepted production are separate series</li></ul>')+'</div>');
    $('v6-source-search').addEventListener('input',e=>{
      const q=e.target.value.toLowerCase().trim();
      document.querySelectorAll('#v6-sourcegrid .v4-sourcecard').forEach(card=>{card.hidden=!card.dataset.v6Search.includes(q);});
    });
  }
  function renderNotes(){
    const sourcePanel=$('v4-source-panel');
    sourcePanel.hidden=!ui.sources||['sources','home','about'].includes(ui.view);
    if(ui.sources){sourcePanel.innerHTML='<h3>Source notes and exact reporting definitions</h3>'+Object.entries(V.SOURCES).map(([id,s])=>
      '<p><strong>'+s.short+'</strong> — '+s.note+' '+cite(id)+'</p>').join('');}
  }
  function progressivelyCollapse(){
    if(typeof document.querySelectorAll!=='function'||typeof document.createElement!=='function')return;
    const primary={
      fleet:['Germany · month-by-type accounting','Allies · operational strength by fighter type'],
      pilothistory:['German fighter-pilot attrition · monthly source series'],
      losses:['Original German all-aircraft losses by front','German aircraft losses through the selected interval'],
      comparison:['USAAF factory acceptances · original monthly worldwide data','U.S. factories versus European aircraft inventories','Monthly USAAF fighter missions by role'],
      campaigns:['Campaigns in your selected time window']
    }[ui.view];
    if(!primary)return;
    // Eastern selection never silently treats western Allied or worldwide
    // background material as east-specific: keep it available collapsed.
    if(ui.theater==='east'&&['fleet','pilothistory','comparison'].includes(ui.view)){
      const body=$('v4-body'),wrapper=document.createElement('details');wrapper.className='v73-details v73-wrapped';
      const heading=document.createElement('summary');heading.textContent='Other theaters / all-front historical reference · Expand';
      wrapper.appendChild(heading);
      for(const child of [...body.children])if(!child.classList.contains('v4-hero'))wrapper.appendChild(child);
      body.appendChild(wrapper);
      return;
    }
    for(const sectionEl of document.querySelectorAll('#v4-body > .v4-section')){
      const h=sectionEl.querySelector('h2');
      if(!h||primary.some(p=>h.textContent.includes(p)))continue;
      // Native reparenting preserves existing input listeners and the chart
      // instances. Do not replace innerHTML after a view wires its controls.
      const wrapper=document.createElement('details');wrapper.className='v73-details v73-wrapped';
      const label=document.createElement('summary');label.textContent=h.textContent+' · Supporting detail';
      sectionEl.parentNode.insertBefore(wrapper,sectionEl);
      wrapper.appendChild(label);wrapper.appendChild(sectionEl);
    }
  }
  function render(){
    const v3=QA.inspect(),{a,b}=months();
    const openDetails=new Set([...document.querySelectorAll('#v4-body details[open]')].map(el=>el.querySelector('summary')?.textContent));
    if(ui.detailMonth!=null&&(ui.detailMonth<a||ui.detailMonth>b))ui.detailMonth=null;
    ui.focus=ui.detailMonth??b;
    const isV75Preview=String(window.location?.search||'').includes('preview=7.5');
    const v4view=isV75Preview||!['pilot','equipment'].includes(ui.view);
    document.body.classList.toggle('v4-on',v4view);
    document.body.classList.toggle('v73-on',true);
    document.body.classList.toggle('v73-static',['about','sources','home'].includes(ui.view));
    document.body.classList.toggle('v74-home',ui.view==='home');
    document.body.classList.toggle('v74-research',ui.view==='sources');
    document.body.classList.toggle('v73-simulator',!v4view);
    extra.hidden=!v4view;
    document.querySelectorAll('[data-v4-tab]').forEach(el=>{
      el.classList.toggle('active',el.dataset.v4Tab===ui.view);
      el.setAttribute('aria-current',el.dataset.v4Tab===ui.view?'page':'false');
    });
    $('v4-tools').hidden=['about','sources','home'].includes(ui.view);
    $('v73-simulator-note').hidden=v4view||isV75Preview;
    document.querySelectorAll('[data-v73-theater]').forEach(el=>{
      const selected=el.dataset.v73Theater===ui.theater;el.classList.toggle('active',selected);el.setAttribute('aria-pressed',String(selected));
    });
    $('v4-estimate-gaps').checked=ui.lossGaps;$('v4-sources-check').checked=ui.sources;
    $('v4-markers-check').checked=ui.markers;
    if(!v4view)return;
    $('v4-head').innerHTML='<div class="v4-eyebrow">'+D.label(a)+' → '+D.label(b)+
      '<span> · '+(b-a+1)+' selected months'+(ui.detailMonth!=null?' · detail '+D.label(ui.detailMonth):' · period end '+D.label(b))+'</span></div>';
    document.body.classList.toggle('v75-preview',isV75Preview);
    const v75Body=isV75Preview?window.AirWarV75Views?.render(ui.view,{ui,D,V,X,Y,Z,H,W,QA,period:months(),allSnapshot,germanTheater,chart,fmt,tag,cite}):null;
    if(v75Body!=null){$('v4-body').innerHTML=v75Body;}
    else{
    if(ui.view==='home')renderHome();
    if(ui.view==='balance')renderBalance();
    if(ui.view==='fleet')renderFleet();
    if(ui.view==='losses')renderLosses();
    if(ui.view==='pilothistory')renderPilotHistory();
    if(ui.view==='comparison')renderComparison();
    if(ui.view==='campaigns')renderCampaigns();
    if(ui.view==='sources')renderSources();
    if(ui.view==='about')renderAbout();
    }
    $('v73-extra').innerHTML=v75Body!=null?'':ui.view==='fleet'?variantExplorer()+nationalLedgers():ui.view==='campaigns'?battleOfBritainDetail():'';
    $('v73-period-banner').innerHTML=v75Body!=null?'':['home','about','sources'].includes(ui.view)?'':periodOverview();
    $('v73-feature-banner').innerHTML=v75Body!=null?'':(ui.theater!=='overall'&&!['home','balance','about','sources'].includes(ui.view)?
      '<p class="v73-front-warning">'+safe(theaterLabels())+': this page also contains all-front, nationwide or differently scoped reference figures. Those sections are background, <strong>not</strong> automatically assigned to the selected front.</p>':'')+
      (ui.view==='home'?'':easternFrontLens()+(ui.view==='losses'?theaterLossInsight():''));
    $('v73-detail-banner').innerHTML=v75Body!=null?'':ui.detailMonth!=null&&!['home','about','sources'].includes(ui.view)?'<div class="v73-detail-note">Inspecting '+D.label(ui.detailMonth)+' within '+D.label(a)+'–'+D.label(b)+' <button type="button" data-v73-clear-month>Return to period end</button></div>':'';
    renderNotes();
    window.AirWarAtlasV5?.enhanceAll();
    window.AirWarV75AircraftView?.enhanceAll();
    if(v75Body==null)progressivelyCollapse();
    for(const el of document.querySelectorAll('#v4-body details'))if(openDetails.has(el.querySelector('summary')?.textContent))el.open=true;
  }
  function setView(view){
    ui.view=view;
    if(!String(window.location?.search||'').includes('preview=7.5')&&(view==='pilot'||view==='equipment')){$('view-'+view).click();}
    render();
    if(typeof window.scrollTo==='function')window.scrollTo(0,0);
  }
  function exportCsv(){
    const {range}=months();const columns=['month','USAAF_P47_ETO','USAAF_P51_ETO','USAAF_P38_ETO',
      'RAF_Spitfire_selected','RAF_Hurricane_selected','German_SE_fighter_stock_allfront','German_SE_fighter_serviceable_allfront','German_SE_fighter_stock_quality',
      'German_pilots_modeled','German_fighter_writeoffs','German_writeoff_quality','Bf109_estimated','Fw190_estimated',
      'Reich_all_aircraft_destroyed_PRIMARY','Reich_all_aircraft_damaged_PRIMARY',
      'Reich_enemy_destroyed_PRIMARY','Reich_enemy_damaged_PRIMARY',
      'Reich_other_operational_destroyed_PRIMARY','Reich_other_operational_damaged_PRIMARY',
      'Reich_nonoperational_destroyed_PRIMARY','Reich_nonoperational_damaged_PRIMARY',
      'Reich_missing_subset_enemy_destroyed_PRIMARY','Reich_primary_source_id',
      'Western_all_aircraft_destroyed_PRIMARY','Western_all_aircraft_damaged_PRIMARY',
      'Western_enemy_destroyed_PRIMARY','Western_enemy_damaged_PRIMARY',
      'Western_other_operational_destroyed_PRIMARY','Western_other_operational_damaged_PRIMARY',
      'Western_nonoperational_destroyed_PRIMARY','Western_nonoperational_damaged_PRIMARY',
      'Western_missing_subset_enemy_destroyed_PRIMARY','Western_primary_source_id',
      'Reich_Bf109_destroyed_PROVISIONAL','Reich_Fw190_destroyed_PROVISIONAL',
      'Western_Bf109_destroyed_PROVISIONAL','Western_Fw190_destroyed_PROVISIONAL'];
    const sourceColumns=(record)=>record?[record.destroyed,record.damaged,record.enemyDestroyed,record.enemyDamaged,
      record.otherOperationalDestroyed,record.otherOperationalDamaged,record.nonOperationalDestroyed,
      record.nonOperationalDamaged,record.missing,record.sourceId]:Array(10).fill('');
    const body=[columns,...range.map(i=>{const s=allSnapshot(i),l=germanLoss(i);
      return [D.label(i),...s.us.map(x=>x.value??''),s.raf[0].value??'',s.raf[1].value??'',
        s.onStrength.value??'',s.ready.value??'',s.onStrength.quality,s.pilot.value,l.value??'',l.quality,...s.german.map(x=>x.value??''),
        ...sourceColumns(Z.get(i,'Reich')),...sourceColumns(Z.get(i,'Western Front')),
        Z.byType(i,'Reich','Bf 109')?.destroyed??'',Z.byType(i,'Reich','Fw 190')?.destroyed??'',
        Z.byType(i,'Western Front','Bf 109')?.destroyed??'',Z.byType(i,'Western Front','Fw 190')?.destroyed??''];})]
      .map(row=>row.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n');
    const url=URL.createObjectURL(new Blob([body],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;
    anchor.download='european-airwar-'+D.label(months().a).replace(' ','-')+'-'+D.label(months().b).replace(' ','-')+'.csv';
    anchor.click();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  document.querySelectorAll('[data-v4-tab]').forEach(el=>el.addEventListener('click',()=>setView(el.dataset.v4Tab)));
  document.querySelectorAll('[data-v73-theater]').forEach(el=>el.addEventListener('click',()=>{ui.theater=el.dataset.v73Theater;ui.detailMonth=null;ui.v71Theater=ui.theater==='west'?'Western Front':'Both';render();}));
  $('v4-estimate-gaps').addEventListener('change',e=>{ui.lossGaps=e.target.checked;render();});
  $('v4-markers-check').addEventListener('change',e=>{ui.markers=e.target.checked;window.AirWarAtlasV5?.setMarkers(ui.markers);});
  $('v4-sources-check').addEventListener('change',e=>{ui.sources=e.target.checked;render();});
  $('v4-export').addEventListener('click',exportCsv);
  extra.addEventListener('click',e=>{ 
    const preset=e.target.closest('[data-v75-preset]');
    if(preset&&window.AirWarV75Views){
      const c=window.AirWarV75Views.campaigns.find(x=>x.id===preset.dataset.v75Preset);
      if(c){
        ui.theater=c.theater;ui.detailMonth=null;
        $('start').value=D.idx(...c.start);$('end').value=D.idx(...c.end);
        for(const id of ['start','end'])$(id).dispatchEvent(new Event('input',{bubbles:true}));
        setTimeout(render,0);return;
      }
    }
    if(e.target.closest('#v75-show-campaigns')){window.AirWarV75Views.state.showCampaigns=!window.AirWarV75Views.state.showCampaigns;render();return;}
    if(e.target.closest('[data-v7-expand]')){ui.chartFullRange=!ui.chartFullRange;render();}
    if(e.target.closest('[data-v73-clear-month]')){ui.detailMonth=null;render();}
    const open=e.target.closest('[data-v74-open]');if(open){setView(open.dataset.v74Open);return;}
    const month=e.target.closest('[data-v72-month]');if(month){ui.detailMonth=+month.dataset.v72Month;render();}});
  extra.addEventListener('change',e=>{
    if(window.AirWarV75AircraftView?.change(e.target.id,e.target.value)){render();return;}
    if(window.AirWarV75Lab?.change(e.target.id,e.target.value)){render();return;}
    if(e.target.id==='v75-aircraft-select'&&window.AirWarV75Views){window.AirWarV75Views.state.aircraft=e.target.value;render();return;}
    if(e.target.matches('[data-v75-source-search]')&&window.AirWarV75Views){window.AirWarV75Views.state.sourceQuery=e.target.value;render();return;}
    if(e.target.id==='v7-archive-theater'){ui.archiveTheater=e.target.value;render();}});
  extra.addEventListener('change',e=>{if(e.target.id==='v71-theater'){ui.v71Theater=e.target.value;render();}
    if(e.target.id==='v71-metric'){ui.v71Metric=e.target.value;render();}});
  // Original v3 owns the dual range handles. Listen after their own callbacks;
  // never rewrite or replace its simulation state, URL persistence or exports.
  for(const id of ['start','end'])$(id).addEventListener('input',()=>{ui.detailMonth=null;setTimeout(render,0);});
  document.querySelectorAll('[data-scenario]').forEach(e=>e.addEventListener('click',()=>{ui.detailMonth=null;setTimeout(render,0);}));
  $('reset').addEventListener('click',()=>setTimeout(render,180));
  const originalViews=['view-pilot','view-equipment'];
  originalViews.forEach(id=>$(id).addEventListener('click',()=>{ui.view=id.replace('view-','');render();}));
  // QA API permits inspection without touching the original simulator's API.
  window.AirWarAtlasQA={version:'7.4',snapshot:i=>allSnapshot(i),attrition:i=>germanLoss(i),sourceIds:()=>Object.keys(V.SOURCES),
    originalLoss:(i,theater)=>Z.get(i,theater),verifiedOriginalMonths:()=>Z.monthlyReturns.length,
    view:()=>ui.view,config:()=>({...ui}),theaterGerman:germanTheater,periodOverview,
    factoryAt:(y,m)=>W.usaFactory.find(p=>p.year===y&&p.month===m)||null,
    sovietEarly:()=>W.sovietEarly,
    historicalMilestones:()=>V.milestones.length};
  // Opening view aligns with saved period without hiding any legacy capabilities.
  ui.focus=QA.inspect().end;render();
})();
