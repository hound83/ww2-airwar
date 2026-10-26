/* European Air War Atlas v7.5 — narrative views. Source quantities never silently equal zero. */
(function(){
'use strict';
const campaigns=[
 {id:'britain',name:'Battle of Britain',theater:'west',start:[1940,6],end:[1940,9],group:'Air defence',summary:'Fighter Command defended Britain against German air attacks; attrition, aircraft serviceability and pilot replacement mattered as much as headline inventories.'},
 {id:'barbarossa',name:'Operation Barbarossa',theater:'east',start:[1941,5],end:[1941,11],group:'Eastern air war',summary:'The Soviet Air Forces suffered enormous opening losses. Border-district strengths, later front-air-army inventories and aircraft serviceability have different reporting populations.'},
 {id:'schweinfurt',name:'Schweinfurt–Regensburg',theater:'west',start:[1943,7],end:[1943,9],group:'Strategic bombing',summary:'Deep bomber raids demonstrated the costs of daylight operations without full escort and challenged German industrial defence.'},
 {id:'stalingrad',name:'Stalingrad air operations',theater:'east',start:[1942,7],end:[1943,1],group:'Eastern air war',summary:'Air supply and local air superiority became central operational constraints; sorties and supplies are separate measures.'},
 {id:'kursk',name:'Kursk / Operation Citadel',theater:'east',start:[1943,6],end:[1943,7],group:'Eastern air war',summary:'Large-scale tactical air operations coincided with the ground offensive. Aviation effects need separate operational evidence.'},
 {id:'bigweek',name:'Big Week',theater:'west',start:[1944,1],end:[1944,1],group:'Defence of the Reich',summary:'February 1944 air operations targeted aircraft production and drew German fighters into combat. Separate attrition from later industrial effects.'},
 {id:'normandy',name:'Normandy / Overlord',theater:'west',start:[1944,5],end:[1944,7],group:'Invasion support',summary:'Allied tactical airpower attacked transport and supported invasion operations; claims, sorties and enemy write-offs must remain separate.'},
 {id:'bagration',name:'Operation Bagration',theater:'east',start:[1944,5],end:[1944,7],group:'Eastern air war',summary:'Soviet operations changed the land-front situation and German air deployments. Detailed VVS returns are still being researched.'},
 {id:'bodenplatte',name:'Operation Bodenplatte',theater:'west',start:[1945,0],end:[1945,0],group:'Defence of the Reich',summary:'The Luftwaffe attempted a massed New Year airfield attack; aircraft and pilot losses need source-specific accounting.'}
];
const state={nation:'all',aircraft:'Bf 109',sourceQuery:'',showCampaigns:false};
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const format=n=>Number.isFinite(n)?Math.round(n).toLocaleString('en-US'):'—';
const key=(y,m)=>y+'-'+String(m+1).padStart(2,'0');
const val=x=>typeof x==='number'&&Number.isFinite(x)?x:null;
const sum=(arr,keyName)=>{const present=arr.filter(x=>val(x[keyName])!=null);return {value:present.length?present.reduce((n,x)=>n+x[keyName],0):null,covered:present.length,total:arr.length};};
const box=(name,body,cls='')=>'<section class="v75-panel '+cls+'"><h3>'+esc(name)+'</h3>'+body+'</section>';
const desc=(title,text)=>'<div class="v75-intro"><span class="kicker">HISTORICAL ANALYSIS · 1936–1945</span><h2>'+esc(title)+'</h2><p>'+esc(text)+'</p></div>';
const disclaimer=(text)=>'<p class="v75-scope"><strong>Scope:</strong> '+text+'</p>';
const note=(label,text)=>'<div class="v75-note"><b>'+esc(label)+'</b><span>'+text+'</span></div>';
const details=(title,body)=>'<details class="v75-details"><summary>'+esc(title)+'</summary><div class="v75-details-body">'+body+'</div></details>';
const renderChart=(ctx,id,rows,series,caption)=>ctx.chart(id,rows,series)+'<p class="v75-caption">'+caption+'</p>';
const stat=(number,label,foot)=>'<div class="v75-stat"><strong>'+format(number)+'</strong><span>'+esc(label)+'</span><small>'+esc(foot)+'</small></div>';
const evidence=(source,method)=>'<span class="v75-evidence">'+esc(source)+' · '+esc(method)+'</span>';
const header=(ctx,title,text)=>desc(title,text)+'<div class="v75-context"><span>'+esc(ctx.D.label(ctx.period.a))+' — '+esc(ctx.D.label(ctx.period.b))+'</span><span>'+esc(ctx.ui.theater==='overall'?'All available theaters':ctx.ui.theater==='west'?'Western Front':'Eastern Front')+'</span></div>';
const dated=(ctx,obj)=>({i:ctx.D.idx(obj.year,obj.month),label:obj.period});
function home(ctx){
 const cards=[
 ['balance','airpower.jpg','Airpower Overview','Who could deploy airpower, where, and how did the balance change?'],
 ['fleet','airpower.jpg','Aircraft & Equipment','Aircraft families, variants, strength, production and documented performance.'],
 ['pilothistory','pilots.jpg','Pilots & Experience','Availability, training, attrition and the loss of experienced aircrew.'],
 ['losses','losses.jpg','Losses & Claims','Reported write-offs, causes and the difference between claims and losses.'],
 ['comparison','industry.jpg','Industry & Operations','From factory acceptance to frontline serviceability and sorties.'],
 ['campaigns','losses.jpg','Campaigns & Battles','Map, timeline and before–during–after air campaign analysis.'],
 ['pilot','simulations.jpg','Pilot Simulator','Explore counterfactual pilot cohorts; do not confuse results with personnel returns.'],
 ['equipment','simulations.jpg','Aircraft Simulator','Compare historically constrained aircraft-performance scenarios.'],
 ['sources','research.jpg','Research Centre','Source explorer, data coverage, contradictions and research backlog.']
 ];
 return '<div class="v75-home-hero"><span class="kicker">EUROPEAN AIR WAR ATLAS · 1936–1945</span><h2>Explore the air war, not just the numbers.</h2><p>Aircraft · pilots · industry · losses · campaigns. Choose your topic first; then narrow the historical period, theater and aircraft.</p></div><div class="v75-home-grid">'+cards.map(x=>'<button class="v75-photo-card" type="button" data-v74-open="'+x[0]+'"><img loading="lazy" src="./dist/assets/'+x[1]+'" alt="Historical wartime photograph representing '+esc(x[2])+'"><span><b>'+esc(x[2])+'</b><small>'+esc(x[3])+'</small></span></button>').join('')+'</div>';
}
function airpower(ctx){
 const {ui,D,H,W,period}=ctx,range=period.range;
 const values=range.map(i=>({i,label:D.label(i)}));
 const g=x=>ctx.germanTheater(x.i,'strength');
 const sov=x=>H.sovietAt(x.i,'reconstruct');
 const early=new Map(W.sovietEarly.map(p=>[D.idx(Number(p.period.slice(0,4)),Number(p.period.slice(5,7))-1),p]));
 const sovDirect=x=>early.get(x.i)?.fighters??null;
 const snap=x=>ctx.allSnapshot(x.i);
 let items=ui.theater==='east'?
 [{name:'German fighters · Eastern allocation (estimated)',color:'#d6b879',value:x=>g(x).value},{name:'VVS fighters · reconstructed front+reserve (scope varies)',color:'#91b5a1',value:x=>sov(x).value}]:
 [{name:'German fighters · '+(ui.theater==='west'?'Western allocation (estimated)':'all-front strength'),color:'#d6b879',value:x=>g(x).value},
 {name:'USAAF ETO · selected fighters',color:'#91b8d0',value:x=>snap(x).usTotal},
 {name:'RAF · selected fighters',color:'#b5a8c6',value:x=>snap(x).rafTotal}];
 const direct=ui.theater==='east'?renderChart(ctx,'v75-early-vvs',values,[{name:'Soviet dated fighter checkpoint (varying reporting scopes)',color:'#7fc4b2',value:sovDirect}], 'Directly dated VVS observations are NOT one comparable continuous census. Hover/check the source before interpreting cross-month jumps.'):'';
 return header(ctx,'Airpower Overview','How did the operational balance change? The same chart must never merge production with theater inventories.')+
  box('Aircraft strength — trend over selected period',renderChart(ctx,'v75-airpower-series',values,items,
  'Stocks are snapshots and are never added across months. German theater allocation is modeled; RAF/USAAF selected fighter populations are not full national air forces.'), 'v75-hero-panel')+
  (direct?box('Early Soviet documentary checkpoints',direct):'')+
  note('Why these lines differ','Each source counts a particular organization, aircraft class and geography. A larger total does not imply more serviceable aircraft or trained crews.')+
  details('Historical limitations & comparability','<p>Overall is not West + East. RAF and USAAF ETO series are subsets; early Soviet border-district figures are not comparable to later front-plus-reserve populations. Source coverage varies by year.</p>');
}
function aircraft(ctx){
 const {D,V,W,period}=ctx,choices=['Bf 109','Fw 190','Spitfire','Hurricane','P-38','P-47','P-51'];
 const chosen=choices.includes(state.aircraft)?state.aircraft:'Bf 109';
 const isUS=/^P-/.test(chosen);
 const usModel=window.AirWarV75Production;
 const monthlyRows=isUS?period.range.map(i=>{const d=D.at(i);return {i,label:D.label(i),value:usModel?.years?.[d.y]?.[chosen]?.[d.m]??null};}):[];
 const monthlyChart=isUS&&usModel?box('Monthly factory acceptances · '+chosen,renderChart(ctx,'v75-type-production',monthlyRows,[{name:chosen+' · USAAF factory acceptances (worldwide)',color:'#a6c6ae',value:x=>x.value}], 'Table 76 · primary historical report, transcription checked against full-year control totals. Worldwide U.S. factory acceptance is not operational strength in Europe.')):'';

 const yrRows=isUS?Array.from({length:6},(_,k)=>({year:1940+k,value:V.usaAnnualAccepted?.[chosen]?.[1940+k]??null})):[];
 const bars=yrRows.map(x=>({year:x.year,count:x.value??null}));
 const barmax=Math.max(1,...bars.map(x=>x.count??0));
 const chartBody='<div class="v75-bars">'+bars.map(x=>'<div><span>'+esc(x.year)+'</span><div class="v75-bar-track">'+(x.count==null?'<i class="v75-missing">Unknown</i>':'<i style="width:'+Math.max(2,100*x.count/barmax).toFixed(2)+'%"></i>')+'</div><b>'+format(x.count)+'</b></div>').join('')+'</div>';
 const variants=chosen==='Bf 109'?['E','F','G','K-4']:chosen==='Fw 190'?['A','D','F','G']:chosen==='Spitfire'?['Mk I','Mk V','Mk IX','Mk XIV']:chosen==='P-47'?['B','C','D','M','N']:chosen==='P-51'?['A','B/C','D/K']:['Early series','Mid-war','Late-war'];
 return header(ctx,'Aircraft & Equipment','Find a family, explore variants and distinguish production, assigned strength, readiness and actual combat losses.')+
  '<div class="v75-chooser"><label>Aircraft family <select id="v75-aircraft-select">'+choices.map(n=>'<option '+(n===chosen?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label></div>'+
  box(chosen+' — variant development','<div class="v75-variant-row">'+variants.map((v,i)=>'<span>'+esc(v)+'<small>Variant '+(i+1)+'</small></span>').join('')+'</div><p class="v75-caption">Variant order is orientation only. Exact first service dates, configurations and per-variant quantities require source-verified aircraft-block data; a dash is not a zero.</p>')+
  monthlyChart+
  (isUS?box('Factory acceptances by year · '+chosen,chartBody+disclaimer('Worldwide U.S. factory acceptances, not ETO inventory, assignments, losses or serviceable aircraft.')):box('Production by variant · archival research required',note('No audited family series yet','A U.S. national production figure would be unrelated to '+esc(chosen)+'. This page therefore does not substitute foreign production for the selected aircraft. German, RAF and Soviet original or validated secondary output reports are research priorities.')))+
  box('Source-supported operation and performance',note('Do not confuse the measures','Production, aircraft on strength, serviceability and losses belong in linked but separately defined series. Per-variant performance curves will be added only after test conditions and engine/boost data are validated.'))+
  details('Technical profiles and documentation','<p>Aircraft test parameters are variant- and engine-setting-specific. This view preserves the research target: motor, weight, armament, wing loading, speed and climb vs altitude, where source measurements exist.</p>');
}
function pilots(ctx){
 const {V,period,D}=ctx,r=period.range,losses=V.pilotCasualtyCounts.filter(p=>r.includes(p.i)),rates=V.pilotAttrition.filter(p=>r.includes(p.i));
 const lossMap=new Map(losses.map(x=>[x.i,x.value])),rateMap=new Map(rates.map(x=>[x.i,x.value]));
 const rows=r.map(i=>({i,label:D.label(i)}));
 const total=sum(losses,'value');
 const east=ctx.ui.theater==='east', west=ctx.ui.theater==='west';
 const sovMay=ctx.W.sovietEarly.find(p=>p.period==='1942-05');
 return header(ctx,'Pilots & Experience','How were trained aircrews lost and replaced, and what happened to veteran experience? Fighter pilots are the primary population, not the only one.')+
  (east?box('Soviet source checkpoint · May 1942',period.range.includes(D.idx(1942,4))?'<div class="v75-statrow">'+stat(sovMay?.trainedFighterCrews,'Trained VVS fighter crews · front + reserve','Source-based transcription, 1 May 1942 reporting scope')+stat(sovMay?.fighters,'VVS fighter aircraft · same report','Aircraft are not pilot headcounts')+'</div>':note('No comparable Soviet pilot monthly series','The retained source includes a fighter-crew checkpoint in May 1942; it cannot be extrapolated through a different selected period.')):'<div class="v75-statrow">'+stat(total.value,'German fighter-pilot casualties · all fronts',losses.length+'/'+r.length+' reported months')+stat(null,'Other pilot populations','Additional RAF / USAAF / VVS personnel returns required')+'</div>')+
  (west?note('All-front German source, not West-only','The monthly fighter-pilot series has no source-audited Western theater split. It is shown below for background only, not a Western Front total.'):'')+
  (east?'':  box('Documented pilot casualties · Germany (partial Europe)',renderChart(ctx,'v75-pilot-casualties',rows,[{name:'German fighter-pilot casualties (reported)',color:'#d9a47a',value:x=>lossMap.get(x.i)??null}], 'Casualties are not necessarily fatalities. No missing month is treated as zero.'))+
  box('Loss percentage · separate population and definition',renderChart(ctx,'v75-pilot-attrition',rows,[{name:'Reported German fighter-pilot strength losses',color:'#a3c7bd',value:x=>rateMap.get(x.i)??null}], 'Monthly percentage losses may not share the same denominator as the casualty-count series; do not derive absolute losses by multiplication without matching both.') ))+
  note('What needs more evidence','RAF, USAAF and VVS pilot flows, training and squadron/group rosters remain research priorities. No JG 53 case study will be scaled into an entire air force.')+
  details('Cohort interpretation','<p>Survival of an original operational cohort differs from fatalities: injuries, POW status, transfers and retirement may remove a pilot from operational service. Cohort models belong to the Pilot Simulator, not to the historical record.</p>');
}
function losses(ctx){
 const {D,Z,period,ui}=ctx;
 const records=Z.monthlyReturns.filter(p=>period.range.includes(p.i)&&(ui.theater==='west'?p.theater==='Western Front':ui.theater==='east'?false:['Reich','Western Front'].includes(p.theater)));
 const byTheater=(theater)=>new Map(records.filter(p=>p.theater===theater).map(p=>[p.i,p]));
 const reich=byTheater('Reich'),west=byTheater('Western Front');
 const rows=period.range.map(i=>({i,label:D.label(i)}));
 const destroyed=sum(records,'destroyed'),damaged=sum(records,'damaged');
 const overview='<div class="v75-statrow">'+
   stat(destroyed.value,'German aircraft destroyed · reported commands',destroyed.covered+' reports across '+rows.length+' months · incomplete theater coverage')+
   stat(damaged.value,'German aircraft damaged · reported commands',damaged.covered+' reports; damaged aircraft are not write-offs')+'</div>';
 const series=[
   {name:'Reich · destroyed',color:'#d68b78',value:x=>reich.get(x.i)?.destroyed??null},
   {name:'Western command · destroyed',color:'#e4c28f',value:x=>west.get(x.i)?.destroyed??null},
   {name:'Reich · damaged',color:'#b17f85',value:x=>reich.get(x.i)?.damaged??null},
   {name:'Western command · damaged',color:'#97b2ad',value:x=>west.get(x.i)?.damaged??null}
 ];
 const graph=box('German command loss reports · distinct populations',
   renderChart(ctx,'v75-losses',rows,series,
   'Reich and Western Front are distinct commands, neither equal to all Germany. The plotted series are not total European losses. Damaged aircraft are not counted as destroyed.'),'v75-hero-panel');
 const gap=note('Eastern Front source gap','Existing German command-return series cover Western and Reich reporting units. They cannot be reassigned to Eastern German or Soviet losses.');
 return header(ctx,'Losses & Claims','Write-offs first, damage separately and victory claims never treated as independently confirmed destruction.')+
  (ui.theater==='east'?gap:overview+graph)+
  note('Victory claims differ from losses','Nationality, dates, aircraft class, theater and opponent must match before claims can be compared with recorded enemy write-offs.')+
  details('Available command returns · original monthly observations',records.length?
    '<div class="v75-tablewrap"><table><thead><tr><th>Report</th><th>Destroyed</th><th>Damaged</th><th>Source</th></tr></thead><tbody>'+
    records.map(p=>'<tr><td>'+esc(D.label(p.i))+' · '+esc(p.theater)+'</td><td>'+format(p.destroyed)+'</td><td>'+format(p.damaged)+'</td><td>'+esc(p.sourceId)+'</td></tr>').join('')+'</tbody></table></div>':
    '<p>No compatible reported command returns for this selected area and period.</p>');
}
function industry(ctx){
 const {D,W,period}=ctx,selected=W.usaFactory.filter(p=>period.range.includes(D.idx(p.year,p.month))),all=period.range.map(i=>({i,label:D.label(i)}));
 const by=new Map(selected.map(p=>[D.idx(p.year,p.month),p]));
 const usTotals=sum(selected,'fighters'),allTotals=sum(selected,'all');
 return header(ctx,'Industry & Operations','How did aircraft get from factories into operational units? Production alone is not frontline strength.')+
  '<div class="v75-statrow">'+stat(usTotals.value,'US-financed fighter factory acceptances',usTotals.covered+'/'+all.length+' months, worldwide')+stat(allTotals.value,'All US-financed factory acceptances',allTotals.covered+'/'+all.length+' months, worldwide')+'</div>'+
  box('Factory acceptances through time',renderChart(ctx,'v75-industry',all,[
    {name:'Fighter aircraft · worldwide acceptances',color:'#9ec4a5',value:x=>by.get(x.i)?.fighters??null},
    {name:'All aircraft · worldwide acceptances',color:'#dcb778',value:x=>by.get(x.i)?.all??null}],
    'Official USAAF Statistical Digest Table 74 · factory acceptances include US-financed Canadian and experimental aircraft. Not ETO or MTO frontline strength.'),'v75-hero-panel')+
  box('From production to combat operations','<div class="v75-flow"><span>Built</span><b>→</b><span>Accepted</span><b>→</b><span>Delivered</span><b>→</b><span>Assigned</span><b>→</b><span>Serviceable</span></div><p class="v75-caption">The flow is conceptual, not a Sankey: we do not possess a complete reconciled aircraft-level chain. Repair, reserves and transfer introduce delays and returns.</p>')+
  box('Operational bottlenecks','<div class="v75-bottlenecks"><span>⛽ Fuel & consumption</span><span>⚙ Engines & parts</span><span>🔧 Maintenance & repairs</span><span>♙ Trained aircrew</span></div><p class="v75-caption">Bottlenecks are described by documentary evidence rather than an invented single efficiency score. Sortie intensity requires a compatible fighter-class denominator.</p>')+
  details('Research priorities','<p>Germany: original output by month and type, oils and transport. United Kingdom: Ministry of Aircraft Production returns. USSR: NKAP output and front deliveries. U.S.: separate worldwide acceptance from ETO/MTO deployments and operational sorties.</p>');
}
function campaignsView(ctx){
 const {D,ui,period}=ctx;
 const filtered=campaigns.filter(p=>(ui.theater==='overall'||p.theater===ui.theater));
 const visible=filtered.filter(p=>D.idx(...p.start)<=period.b&&D.idx(...p.end)>=period.a);
 return header(ctx,'Campaigns & Battles','The air war as a sequence of campaigns, with a view of what existed before, what happened during and what changed afterwards.')+
  '<button class="v75-action" type="button" id="v75-show-campaigns" aria-expanded="'+state.showCampaigns+'">'+(state.showCampaigns?'Hide all campaign presets':'Browse campaign presets')+' ▾</button>'+
  (state.showCampaigns?'<div class="v75-campaign-grid">'+filtered.map(p=>'<button type="button" class="v75-campaign-card" data-v75-preset="'+p.id+'"><b>'+esc(p.name)+'</b><small>'+esc(p.group)+' · '+esc(key(p.start[0],p.start[1]))+' – '+esc(key(p.end[0],p.end[1]))+'</small><span>'+esc(p.summary)+'</span></button>').join('')+'</div>':'')+
  box('Campaigns in the selected interval',visible.length?'<div class="v75-campaign-grid">'+visible.map(p=>'<button type="button" class="v75-campaign-card" data-v75-preset="'+p.id+'"><b>'+esc(p.name)+'</b><small>'+esc(p.group)+' · '+esc(key(p.start[0],p.start[1]))+' – '+esc(key(p.end[0],p.end[1]))+'</small><span>'+esc(p.summary)+'</span></button>').join('')+'</div>':note('No featured campaign','Open the catalogue or adjust the selected historical interval.'),'v75-hero-panel')+
  box('What did the campaign change?','<div class="v75-before-after"><div><b>Before</b><p>Forces, experience, serviceability and strategic aims.</p></div><div><b>During</b><p>Sorties, aircraft and aircrew losses, operational constraints.</p></div><div><b>After</b><p>Recorded changes and cautious historical interpretation.</p></div></div><p class="v75-caption">A campaign coinciding with a numerical change does not automatically prove causation. Detailed daily claims require independently dated reports.</p>');
}
function research(ctx){
 const sources=Object.entries(ctx.V.SOURCES??{}).map(([id,x])=>({id,short:x.short||id,title:x.title||x.short||id,url:x.url,note:x.note||''}));
 const matches=sources.filter(s=>(s.title+' '+s.note+' '+s.id).toLowerCase().includes(state.sourceQuery.toLowerCase()));
 return desc('Research Centre','Original records, secondary studies, uncertainty, competing values and reusable source leads.')+
  '<div class="v75-research-tiles"><div><b>Source Explorer</b><p>Search historical publications and indexed reports.</p></div><div><b>Data Coverage</b><p>Recorded observations must be counted separately from reconstructed points.</p></div><div><b>Research Backlog</b><p>Unused but useful source leads are preserved for later work.</p></div><div><b>Methodology</b><p>Metric populations, scope, period and evidence method.</p></div></div>'+
  box('Search the source catalogue','<label class="v75-search">Find sources <input type="search" data-v75-source-search placeholder="Aircraft, RAF, 1944, losses, pilot…" value="'+esc(state.sourceQuery)+'"></label><div id="v75-source-matches"><span>'+matches.length+' indexed sources</span>'+matches.slice(0,32).map(s=>'<article class="v75-source-entry"><b>'+esc(s.short)+'</b><small>'+esc(s.title)+'</small><p>'+esc(s.note).slice(0,300)+'</p>'+(s.url?'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">View source</a>':'')+'</article>').join('')+'</div>')+
  box('Evidence status',note('Two independent dimensions','Provenance: Primary / Secondary / Compilation. Method: Recorded / Derived / Interpolated / Estimated / Scenario / Missing. A secondary reported number may still be a recorded historical observation.'))+
  details('Source gap matrix — interpretation','<p>Check original-report dates and definitions for each air force and metric separately. Documented German West/Reich losses do not imply German eastern or Soviet loss coverage; factory acceptances are not serviceable aircraft.</p>')+
  details('Research backlog','<p>Promising leads include USAAF Statistical Digest Table 76 (aircraft model acceptances), RAF squadron ORBs and returns, Soviet VVS air-army records, USSBS German industrial returns, NACA aircraft and engine flight reports. Source evidence is not automatically graph-ready.</p>');
}
function about(ctx){
 return desc('About the Project','A European air-war research laboratory: read the evidence first, then model counterfactuals with visible assumptions.')+
  box('Development roadmap','<div class="v75-roadmap"><div><strong>v7.4</strong><p>Historical photo home, early Soviet records, US factory-acceptance series.</p></div><div><strong>v7.5</strong><p>Topic-first navigation, multinational research storyboards, source status and documented missing-data handling.</p></div><div><strong>Later</strong><p>Fine-grained Mediterranean/Reich/Scandinavia maps, vetted variant production and validated altitude-dependent E-M curves.</p></div></div>')+
  details('How to interpret data','<p>Recorded is a historical source observation, not universal certainty. Interpolated uses compatible checkpoints; estimated uses additional model assumptions. Claims are not enemy write-offs, production is not assigned strength, and casualty totals are not all fatalities.</p>')+
  details('Static architecture','<p>The Atlas runs on GitHub Pages with historical datasets and source notes in the public repository. No user account or database is required to explore its research and simulations.</p>');
}
function render(view,ctx){
 const E=window.AirWarV75EvidenceViews, L=window.AirWarV75Lab, G=window.AirWarV75GermanViews;
 if(view==='home')return home(ctx);
 if(view==='balance')return airpower(ctx);
 if(view==='fleet')return aircraft(ctx)+(G?.aircraft(ctx)||'');
 if(view==='pilothistory')return pilots(ctx)+(E?.pilots(ctx)||'');
 if(view==='losses')return losses(ctx)+(E?.loss(ctx)||'');
 if(view==='comparison')return industry(ctx)+(E?.production(ctx)||'')+(G?.industry(ctx)||'');
 if(view==='campaigns')return campaignsView(ctx)+(E?.campaigns(ctx)||'');
 if(view==='pilot')return L?.pilotView(ctx)||'<p>Pilot simulator module not loaded.</p>';
 if(view==='equipment')return L?.aircraftView(ctx)||'<p>Aircraft simulation module not loaded.</p>';
 if(view==='sources')return research(ctx)+(E?.research(ctx)||'')+(G?.research(ctx)||'');
 if(view==='about')return about(ctx);
 return null;
}
window.AirWarV75Views={version:'7.5-preview',render, campaigns, state, esc, sum};
})();