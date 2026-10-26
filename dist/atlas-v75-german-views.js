/* v7.5 German aircraft industrial output — separate from US factory acceptances and command strength. */
(function(){
'use strict';
const G=window.AirWarV75GermanProduction;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>Number.isFinite(x)?x.toLocaleString('en-US'):'—';
const card=(title,body)=>'<section class="v75-panel"><h3>'+esc(title)+'</h3>'+body+'</section>';
const rows=(ctx)=>ctx.period.range.map(i=>{const d=ctx.D.at(i),r=G.years[d.y];return {i,label:ctx.D.label(i),actual:r?.actual?.[d.m]??null,planned:r?.planned?.[d.m]??null};});
function industry(ctx){
 const selected=rows(ctx),count=selected.filter(x=>x.actual!=null).length;
 if(!count)return '';
 const actual=selected.filter(x=>x.actual!=null).reduce((s,x)=>s+x.actual,0);
 const graph=ctx.chart('v75-ger-all-production',selected,[
 {name:'German aircraft output, all types (secondary series)',color:'#dac48c',value:x=>x.actual},
 {name:'German planned output (not delivered/produced)',color:'#8da6a1',value:x=>x.planned}]);
 return card('German aircraft industry — actual output versus production programme',
 '<div class="v75-statrow"><div class="v75-stat"><strong>'+fmt(actual)+'</strong><span>German aircraft production · known months</span><small>'+count+'/'+selected.length+' selected months; incomplete years show partial totals</small></div>'+
 '<div class="v75-stat"><strong>'+fmt(G.years[1944].actual.reduce((a,b)=>a+b,0))+'</strong><span>Germany 1944 · all aircraft types</span><small>Cross-check: USSBS overall report 39,807, not a fighter-specific figure</small></div></div>'+
 graph+'<p class="v75-caption">Secondary: <em>Germany and the Second World War</em>, vol. VII, Table I.I.10, p. 118, citing USSBS Report 2a and Aircraft Division Report 4. Actual production and *planned* programme are different lines. 1945 April actual output is <strong>unknown</strong>, not zero. This is German national output, not a West- or Eastern Front delivery series.</p>'+
 '<p><a href="'+esc(G.source.url)+'" rel="noopener noreferrer" target="_blank">Publication details · research trail</a></p>');
}
function aircraft(ctx){
 if(window.AirWarV75Views?.state?.aircraft!=='Bf 109')return '';
 const hits=G.typeCheckpoints.filter(x=>x.type==='Bf 109'&&ctx.period.range.includes(ctx.D.idx(+x.date.slice(0,4),+x.date.slice(5,7)-1)));
 if(!hits.length)return card('Bf 109 historic acceptance checkpoints','<p>Two independently compiled original-document leads exist for July/December 1943; neither falls in this date range. No substitute US production figures are shown.</p>');
 return card('Bf 109 · German factory-acceptance checkpoints (not variant production)',
 '<div class="v75-statrow">'+hits.map(x=>'<div class="v75-stat"><strong>'+fmt(x.count)+'</strong><span>'+esc(x.type)+' · '+esc(x.date)+'</span><small>Reported factory acceptance, source compilation</small></div>').join('')+'</div>'+
 '<p class="v75-caption">From RAF Air Historical Branch historical narrative, citing the German Wagenführ data. These two observations do not establish monthly K-4, G-6, G-14 or Bf 109 family production in adjacent months. <a rel="noopener noreferrer" target="_blank" href="'+esc(G.conflicts[0].source_a)+'">Source trail</a></p>');
}
function research(ctx){
 const c=G.conflicts[0],s=G.source,selected=rows(ctx),n=selected.filter(x=>x.actual!=null).length;
 return card('German output: traceable compilation and 1943 Fw 190 source conflict',
 '<p><strong>'+fmt(n)+'</strong> documented monthly German all-aircraft output rows in your selected range, sourced as a <strong>secondary scholarly transcription</strong> and cross-checked against the separately available 1944 USSBS annual control.</p>'+
 '<p><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+'</a>, '+esc(s.publisher)+'. Earlier original reports cited: '+esc(s.primary_leads.join('; '))+'. Original scans still need page-by-page audit.</p>'+
 '<p><strong>Unresolved:</strong> one RAF AHB page lists Fw 190 acceptances of '+fmt(c.value_a)+' for July 1943; a separate USAAF report excerpt suggests '+fmt(c.value_b)+'. These have not been reconciled and neither is plotted as the default July Fw 190 figure.</p>');
}
window.AirWarV75GermanViews={industry,aircraft,research};
})();