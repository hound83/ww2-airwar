/* v7.5 cross-force evidence stories, source-based coverage and Battle of Britain weekly reports. */
(function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const E=window.AirWarV75Evidence;
const p=n=>Number.isFinite(n)?n.toLocaleString('en-US'):'—';
const card=(heading,body)=>'<section class="v75-panel v75-bow-chart"><h3>'+esc(heading)+'</h3>'+body+'</section>';
const src=(key)=>{const obj=E.source_index[key];return '<p class="v75-caption">Source: <a href="'+esc(obj.url)+'" target="_blank" rel="noopener noreferrer">'+esc(obj.title)+'</a> ('+esc(obj.provenance)+' · '+esc(obj.method)+'); cites '+esc(obj.cites_primary||obj.cites_secondary||'published material')+'. '+esc(obj.limitation)+'</p>';};
function inside(ctx,date){const y=+date.slice(0,4),m=+date.slice(5,7)-1,i=ctx.D.idx(y,m);return i>=ctx.period.a&&i<=ctx.period.b;}
function points(ctx,dates){return dates.filter(r=>inside(ctx,r.date));}
function weeks(ctx,rows){const first=ctx.D.at(ctx.period.a),last=ctx.D.at(ctx.period.b);
 const lo=first.y+'-'+String(first.m+1).padStart(2,'0')+'-01',hi=last.y+'-'+String(last.m+1).padStart(2,'0')+'-31';
 return rows.filter(r=>r.start>=lo&&r.end<=hi);
}
const cmp=([a,b])=>a.date.localeCompare(b.date);
const basePoint=(ctx,r)=>({...r,i:ctx.D.idx(+r.date.slice(0,4),+r.date.slice(5,7)-1),label:r.date.slice(5)});
function pilots(ctx){
 if(ctx.ui.theater==='east')return '';
 const raf=points(ctx,E.rafPilots),german=points(ctx,E.germanyPilots);
 if(!raf.length&&!german.length)return '';
 const output=raf.length?card('RAF Fighter Command · operational fighter pilots (exact 1940 return dates)',
  ctx.chart('v75-raf-pilot-1940',raf.map(x=>basePoint(ctx,x)),[
   {name:'RAF Fighter Command · operational pilots',color:'#a4c7a1',value:r=>r.operational},
   {name:'RAF established posts · different measure',color:'#d2b07a',value:r=>r.establishment}])+
  '<p class="v75-caption">The establishment is a staffing target, not an additional stock of pilots. The plotted dates are return dates, not inferred uniform monthly totals.</p>'+
  src('bow_pilots_secondary')):'';
 const luft=german.length?card('German operational single-engine fighter pilots · distinct reporting scope',
   ctx.chart('v75-german-pilot-1940',german.map(x=>basePoint(ctx,x)),
   [{name:'German fighter pilots · cited secondary return',color:'#bc8f81',value:r=>r.operational}])+
   '<p class="v75-caption">The 1 September observation is disputed: 735 in this compilation versus 688 attributed to Webster & Frankland; both are preserved in Research. This is not German all-aircrew strength.</p>'+src('bow_german_pilots_secondary')):'';
 return '<div class="v75-evidence-legend"><span>RAF and Luftwaffe · 1940 dated personnel observations</span><span>Secondary transcription of cited records</span></div>'+output+luft;
}
function loss(ctx){
 if(ctx.ui.theater==='east')return '';
 const included=weeks(ctx,E.weeklyRAFLosses);
 const row=included.filter(r=>r.start>='1940-07-30').map(r=>({...r,i:ctx.D.idx(+r.start.slice(0,4),+r.start.slice(5,7)-1),label:r.start.slice(5)+'–'+r.end.slice(5)}));
 if(!row.length)return '';
 const graph=ctx.chart('v75-raf-loss-weekly',row,[{name:'RAF Hurricane totally destroyed',color:'#d4a16f',value:r=>r.hurricane},{name:'RAF Spitfire totally destroyed',color:'#84afa7',value:r=>r.spitfire}]);
 const aggregated=E.weeklyRAFLosses[0];
 return card('RAF Fighter Command · Hurricane vs Spitfire write-offs by original week',
  graph+'<p class="v75-caption">Original reporting windows are weeks, not months. The 10 May–29 July 1940 aggregate ('+p(aggregated.hurricane)+' Hurricanes, '+p(aggregated.spitfire)+' Spitfires) is excluded from the weekly graph because its 81-day interval is not comparable to one-week bins. The table totals for all reporting windows reconcile to 753 and 467 respectively.</p>'+src('bow_loss_secondary'));
}
function production(ctx){
 const row=weeks(ctx,E.weeklyRAFProduction).map(r=>({...r,i:ctx.D.idx(+r.start.slice(0,4),+r.start.slice(5,7)-1),label:r.start.slice(5)+'–'+r.end.slice(5)}));
 if(!row.length)return '';
 const graph=ctx.chart('v75-raf-production-weekly',row,[
  {name:'Hurricane · weekly factory output',color:'#d4a16f',value:r=>r.hurricane},
  {name:'Spitfire · weekly factory output',color:'#84afa7',value:r=>r.spitfire}]);
 return card('British fighter factories · weekly aircraft output, June–November 1940',
   graph+'<p class="v75-caption">Hurricanes and Spitfires built each published week; NOT Fighter Command deliveries, operational strength or sorties. Border-crossing weeks are included only when wholly inside the selected months. All 22 source rows reconcile to 1,367 Hurricanes and 724 Spitfires.</p>'+src('bow_production_secondary'));
}
function campaigns(ctx){
 if(ctx.ui.theater==='east'||ctx.period.range.length>9)return '';
 const notes=weeks(ctx,E.weeklyRAFLosses).filter(x=>x.start>='1940-07-30');
 const pilotsPeriod=points(ctx,E.rafPilots);
 if(!notes.length&&!pilotsPeriod.length)return '';
 return card('Battle of Britain · traceable before / during / after returns',
  '<div class="v75-before-after"><div><b>Before</b><p>30 June 1940: Fighter Command reported 1,200 operational fighter pilots (secondary transcription of AIR 22/296).</p></div>'+
  '<div><b>During</b><p>Weekly production and destroyed-aircraft reports cover different windows. Compare only the overlapping dated evidence.</p></div>'+
  '<div><b>After</b><p>2 November 1940: 1,796 operational fighter pilots reported. A larger strength alone does not explain battle outcomes.</p></div></div>'+
  '<div class="v75-section-links"><button type="button" data-v74-open="pilothistory">Explore pilots</button><button type="button" data-v74-open="losses">Explore RAF losses</button><button type="button" data-v74-open="comparison">Explore RAF production</button></div>'+
  '<p class="v75-caption">The Battle of Britain air campaign cannot be reduced to an invented difference of claims and German write-offs; the three panels preserve original reporting scopes.</p>');
}
function nIn(ctx,dates){return dates.filter(r=>inside(ctx,r.date)).length;}
function cover(ctx){
 const all=ctx.period.range,E2=window.AirWarV75Evidence,W=ctx.W,V=ctx.V,Z=ctx.Z;
 const isEast=ctx.ui.theater==='east',isWest=ctx.ui.theater==='west';
 const factory=W.usaFactory.filter(q=>all.includes(ctx.D.idx(q.year,q.month))).length;
 const usTyped=all.filter(i=>{const d=ctx.D.at(i);return window.AirWarV75Production?.years?.[d.y]?.['P-47']?.[d.m]!=null;}).length;
 const sov=W.sovietEarly.filter(q=>all.includes(ctx.D.idx(+q.period.slice(0,4),+q.period.slice(5,7)-1))).length+
   (ctx.H.soviet||[]).filter(q=>all.includes(q.i)).length;
 const pilotRAF=isEast?0:nIn(ctx,E2.rafPilots),pilotGE=isEast?0:nIn(ctx,E2.germanyPilots);
 const gerLoss=Z.monthlyReturns.filter(q=>all.includes(q.i)&&(isEast?false:isWest?q.theater==='Western Front':['Western Front','Reich'].includes(q.theater))).length;
 const germanPilot=(V.pilotCasualtyCounts||[]).filter(q=>all.includes(q.i)).length;
 const rafLoss=isEast?0:weeks(ctx,E2.weeklyRAFLosses).length;
 const rafProd=weeks(ctx,E2.weeklyRAFProduction).length;
 const cells=[
 ['RAF',pilotRAF+' dated pilot returns',rafLoss+' weekly aircraft-loss bins',rafProd+' factory weeks','Fighter Command · West; secondary; 1940'],
 ['Luftwaffe',pilotGE+' 1940 pilot returns; '+germanPilot+' casualty months',gerLoss+' command-month loss reports','German output: partial 1943 only','Pilot data may be all-front; Reich vs West commands differ'],
 ['USAAF','No complete historical fighter-pilot series','USAAF ETO losses: mixed legacy coverage',factory+' worldwide factory months; '+usTyped+' typed P-47 months','USA production is worldwide, not European deployment'],
 ['VVS',W.sovietEarly.filter(q=>all.includes(ctx.D.idx(+q.period.slice(0,4),+q.period.slice(5,7)-1))&&q.trainedFighterCrews!=null).length+' fighter-crew checkpoints','No validated comprehensive loss series','No transcribed month/type production','Soviet strength checkpoints: '+sov+' with differing populations']
 ];
 const t='<div class="v75-data-table v75-coverage"><table><thead><tr><th>Air force</th><th>Pilots</th><th>Aircraft losses</th><th>Production</th></tr></thead><tbody>'+cells.map(q=>'<tr title="'+esc(q[4])+'"><th scope="row">'+esc(q[0])+'</th><td>'+esc(q[1])+'</td><td>'+esc(q[2])+'</td><td>'+esc(q[3])+'</td></tr>').join('')+'</tbody></table></div>';
 return card('Evidence coverage for the selected date range (counts, not confidence scores)',t+
  '<p class="v75-caption">Entries are scope-qualified. A zero count means no compatible current Atlas observation, NOT zero historical losses or production. Original, secondary, derived and scenario values are not interchangeable. Changing front does not transform worldwide factory outputs into East/West production.</p>');
}
function research(ctx){
 const conflict=E.sourceConflicts[0],sources=Object.entries(E.source_index);
 const records='<div class="v75-data-table"><table><thead><tr><th>Publication / reported archive</th><th>Source tier</th><th>Used for</th></tr></thead><tbody>'+sources.map(([id,s])=>
  '<tr><td><a target="_blank" rel="noopener noreferrer" href="'+esc(s.url)+'">'+esc(s.title)+'</a><br><small>'+esc(s.source_locator)+'</small></td><td>'+esc(s.provenance)+' · '+esc(s.verification)+'</td><td>'+esc(s.limitation)+'</td></tr>').join('')+'</tbody></table></div>';
 return cover(ctx)+card('Audited secondary transcriptions: original archive reference kept',records)+
  card('Unresolved source conflict — explicit, not smoothed away',
    '<p><strong>German operational fighter pilots, 1 September 1940:</strong> '+p(conflict.selected)+' in the working published table versus '+p(conflict.alternative)+' in the cited alternate secondary compilation. Neither count is silently averaged; the source-level disagreement remains open.</p>'+src('bow_german_pilots_secondary'));
}
window.AirWarV75EvidenceViews={pilots,loss,production,campaigns,research,cover};
})();