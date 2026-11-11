/* Compare dated aircraft claims and losses within their reporting populations. */
(function(){
'use strict';
const D=window.AtlasClaimLossData,C=window.GrandAirWarV77Campaigns,N=window.NormandyV86Data;
if(!D||!C||!N)return;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>x.toLocaleString('en-US');
const per100=x=>(100*x).toFixed(1);
const band=({low,high})=>low===high?fmt(low):fmt(low)+'–'+fmt(high);
const reference=ref=>({...ref,...(D.sources[ref.source]||N.sources[ref.source]||C.sources[ref.source])});
const sourceLink=s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+(s.page?' · '+esc(s.page):'')+'</a>';
const referenceLinks=refs=>refs.map(ref=>sourceLink(reference(ref))).join(' · ');
const days=C.campaigns.find(campaign=>campaign.id==='britain').opponentReturnSeries.days;
const september=days.find(row=>row.date==='1940-09-15');
const britishSource=C.sources[september.sourceId];
const cobra=D.cobra;
const cobraClaim=N.observations.find(fact=>fact.id===cobra.claimId);
const france=D.france;
const bobruisk=D.bobruisk;
const easternCampaign=C.campaigns.find(campaign=>campaign.id===bobruisk.campaign);
const scopes={
 britain:{claimCount:september.rafClaim,operation:'britain-15-sep',step:0},
 cobra:{claimCount:cobraClaim.value,operation:cobra.operation,step:1},
 reverse:{},
 bobruisk:{}
};

function compareBritain(rows,claims) {
 const totals=rows.reduce((sum,row)=>({claims:sum.claims+row.rafClaim,destroyed:sum.destroyed+row.germanDestroyed}),{claims:0,destroyed:0});
 const rates=rows.map(row=>row.germanDestroyed/row.rafClaim);
 const min=Math.min(...rates),max=Math.max(...rates),rate=totals.destroyed/totals.claims;
 return {low:Math.floor(claims*min),high:Math.ceil(claims*max),expected:Math.round(claims*rate),min,max,rate,totals};
}

const britainChecks=days.map(row=>{
 const forecast=compareBritain(days.filter(peer=>peer.date!==row.date),row.rafClaim);
 return {...row,...forecast,covered:forecast.low<=row.germanDestroyed&&row.germanDestroyed<=forecast.high};
});
const covered=britainChecks.filter(check=>check.covered).length;
const meanError=britainChecks.reduce((sum,row)=>sum+Math.abs(row.germanDestroyed-row.expected),0)/britainChecks.length;

const franceClaims=france.training.reduce((sum,row)=>sum+row.claims,0);
const franceLosses=france.training.reduce((sum,row)=>sum+row.losses,0);
const francePossible=france.training.reduce((sum,row)=>sum+row.possibleLosses,0);
const franceRate=franceLosses/franceClaims;
const franceAlternativeRate=(franceLosses+francePossible)/franceClaims;

function compareFrance(claims) {
 return {
  expected:Math.round(claims*franceRate),
  alternative:Math.round(claims*franceAlternativeRate),
  rate:franceRate,
  alternativeRate:franceAlternativeRate
 };
}

function calculate(scope,claims) {
 if(!Number.isSafeInteger(claims)||claims<0)return null;
 if(scope==='britain')return compareBritain(days,claims);
 if(scope==='cobra')return compareFrance(claims);
 return null;
}

function matchedLoss(observations,id,date) {
 return observations.some(fact=>fact.measure==='losses'&&fact.lossScopeId===id&&fact.date===date&&!fact.period&&Number.isFinite(fact.value));
}

function historicalEstimate(operationId,observations) {
 if(operationId!==cobra.operation)return null;
 const claim=observations.find(fact=>fact.id===cobra.claimId&&fact.date===cobra.date&&fact.measure==='claims'&&!fact.period);
 if(!claim||matchedLoss(observations,cobra.id,cobra.date))return null;
 const validation={...france.check,predicted:compareFrance(france.check.claims).expected,
  sources:france.check.references.map(reference)};
 return {
  id:cobra.id,kind:'estimated',confidence:'low',method:'Pooled northern France day-fighter comparison',modelVersion:D.version,
  operation:operationId,date:cobra.date,claimant:cobra.claimant,opponent:cobra.opponent,area:cobra.area,
  outcome:'Aircraft destroyed in air combat',claimId:claim.id,claimCount:claim.value,
  ...compareFrance(claim.value),
  inputs:{widerGermanLossReports:cobra.widerLosses,matchedClaims:franceClaims,matchedLosses:franceLosses,possibleAdditionalLosses:francePossible},
  calibration:france.training.map(row=>({...row,sources:row.references.map(reference)})),
  validation,
  assumptions:[
   'Apply the pooled rate from the selected Eighth and Ninth Air Force daylight fighter engagements in northern France to the Mission 494 escorts.',
   'The alternative includes one forced landing whose final disposition is unclear. The comparison covers selected fights and the day report covers a wider area.',
   'Use the wider German loss report as context. Its geographic and cause coverage differs from the escort claims.'
  ],
  sources:cobra.references.map(reference)
 };
}

function bobruiskEstimate(campaignId,date,observations) {
 if(campaignId!==bobruisk.campaign||date!==bobruisk.date||matchedLoss(observations,bobruisk.id,date))return null;
 const claim=observations.find(fact=>fact.date===date&&fact.measure==='claims'&&fact.side==='Soviet'&&
  fact.sourceId===bobruisk.references[0].source&&!fact.period);
 if(!claim)return null;
 const monthlyLosses=bobruisk.unitLosses.reduce((sum,row)=>sum+row.losses,0);
 const dayShare=bobruisk.dateEngagements/bobruisk.periodEngagements;
 const [lower,upper]=bobruisk.eligibleShare.map(share=>monthlyLosses*share*dayShare);
 return {id:bobruisk.id,kind:'estimated',confidence:'low',date,expected:Math.round((lower+upper)/2),
  lower,upper,monthlyLosses,claimCount:claim.value};
}

function renderBritain(result) {
 const septemberCheck=britainChecks.find(check=>check.date===september.date);
 const checkRows=britainChecks.map(row=>'<tr><th scope="row">'+esc(row.date)+'</th><td>'+fmt(row.rafClaim)+'</td><td>'+fmt(row.germanDestroyed)+'</td><td>'+per100(row.germanDestroyed/row.rafClaim)+'</td><td>'+band(row)+'</td></tr>').join('');
 return '<p>Across seven selected days, German records give <strong>'+per100(result.rate)+' destroyed per 100 RAF claims</strong> ('+
  fmt(result.totals.destroyed)+' recorded, '+fmt(result.totals.claims)+' claimed). The daily ratios span '+per100(result.min)+'–'+per100(result.max)+' per 100.</p>'+
  '<p>On 15 September the record gives <strong>'+fmt(september.germanDestroyed)+' destroyed</strong> from '+fmt(september.rafClaim)+' RAF claims. The estimate from the other six days was '+band(septemberCheck)+'.</p>'+
  '<details><summary>Source records and held-out day checks</summary>'+
  '<p>Each check leaves one full day out and uses the other six days’ lowest and highest rates. The range included '+covered+' of '+britainChecks.length+
  ' recorded totals. The pooled forecast missed by '+meanError.toFixed(1)+' aircraft on average. These are selected intensive days from August and September 1940.</p>'+
  '<div class="claim-loss-table" role="region" tabindex="0" aria-label="Battle of Britain comparisons by date"><table><thead><tr>'+
  '<th scope="col">Date</th><th scope="col">Claims</th><th scope="col">Recorded destroyed</th><th scope="col">Per 100 claims</th><th scope="col">Held-out range</th>'+
  '</tr></thead><tbody>'+checkRows+'</tbody></table></div><p>'+sourceLink(britishSource)+'</p></details>';
}

function engagementTable(rows) {
 return '<div class="claim-loss-table claim-loss-engagements" role="region" tabindex="0" aria-label="Matched air combat engagements">'+
  '<table><thead><tr><th scope="col">Engagement</th><th scope="col">Claims</th><th scope="col">Losses</th></tr></thead><tbody>'+
  rows.map(row=>'<tr data-claim-case="'+esc(row.id)+'"><th scope="row"><time datetime="'+esc(row.date)+'">'+esc(row.date)+'</time>'+esc(row.place)+'</th>'+
   '<td>'+fmt(row.claims)+'</td><td>'+fmt(row.losses)+(row.possibleLosses?' + '+row.possibleLosses+' uncertain':'')+'</td></tr>').join('')+
  '</tbody></table></div>';
}

function caseNotes(rows) {
 return '<ul>'+rows.map(row=>'<li><strong>'+esc(row.place)+'</strong> · '+esc(row.claimant)+' against '+esc(row.opponent)+
  '. '+esc(row.basis)+'. '+esc(row.detail)+' '+referenceLinks(row.references)+'</li>').join('')+'</ul>';
}

function renderCobra(result,claims) {
 const check=france.check,predicted=compareFrance(check.claims).expected;
 return '<p><strong>'+per100(result.rate)+' losses per 100 claims</strong> across two reconstructed US fighter engagements in northern France ('+
  franceLosses+' losses from '+franceClaims+' claims). For '+fmt(claims)+' claims the alternative is <strong>'+fmt(result.alternative)+
  '</strong> if the disputed forced landing is counted as a loss.</p>'+
  '<details><summary>Matched engagements, check and sources</summary>'+engagementTable(france.training)+
  '<p>Independent August check at '+esc(check.place)+'. The earlier rate predicts '+predicted+' German losses from '+check.claims+
  ' US claims. The reconstruction gives '+check.losses+'. The small sample and the mix of escort and tactical fighters limit the confidence of the Cobra estimate.</p>'+
  caseNotes([...france.training,check])+
  '<p>Mission 494 recorded '+cobraClaim.value+' air-to-air claims. The German calendar reports '+cobra.widerLosses+
  ' aircraft lost across a wider area that day. Individual US claims also describe combats away from St-Lô. The calendar is context for the estimate.</p>'+
  '<p>'+referenceLinks(cobra.references)+'</p></details>';
}

function renderReverse() {
 return '<p>German fighter claims and Allied aircraft losses from the same encounters. The Caen entry includes US and RAF losses. The other three cover US fighters.</p>'+
  engagementTable(D.germanClaims)+
  '<details><summary>Claim stages, loss definitions and sources</summary>'+caseNotes(D.germanClaims)+'</details>';
}

function renderBobruisk(result) {
 if(!result)return '<p>Use the Bobruisk event to review its dated loss evidence.</p>';
 return '<p>The 16th Air Army reported <strong>'+result.claimCount+' German aircraft shot down</strong> that day. The working estimate covers enemy-action aircraft removals from two Bobruisk-based German groups. The June returns group together several kinds of enemy action.</p>'+
  '<details><summary>Monthly unit returns and calculation</summary>'+
  '<ul>'+bobruisk.unitLosses.map(row=>'<li><strong>'+esc(row.unit)+' · '+row.losses+' '+esc(row.aircraft)+'</strong> removed by enemy action in June. Based at Bobruisk '+esc(row.basing)+
   '. '+referenceLinks([{source:row.source,page:row.page},{source:row.basingSource,page:'Base chronology'}])+'</li>').join('')+'</ul>'+
  '<p>Assume half to all of the '+result.monthlyLosses+' June removals occurred during the opening battles. The date accounts for '+bobruisk.dateEngagements+
  ' of '+bobruisk.periodEngagements+' reported air engagements in the 24 June to 4 July Bobruisk operation. Applying that activity share gives '+
  result.lower.toFixed(1)+'–'+result.upper.toFixed(1)+' aircraft under those assumptions. The rounded midpoint gives the displayed estimate. The units’ daily flight and loss counts remain uncertain.</p>'+
  '<p>'+referenceLinks(bobruisk.references)+'</p></details>';
}

function renderEventEstimate(campaignId,date,observations) {
 const result=bobruiskEstimate(campaignId,date,observations);
 if(!result)return '';
 return '<div class="event-loss-estimate" data-event-estimate="'+esc(result.id)+'">'+
  '<div class="claim-loss-result claim-loss-estimated"><strong>About '+fmt(result.expected)+'</strong><span>German aircraft removed by enemy action<small>Working estimate · two Bobruisk-based groups · low confidence</small></span></div>'+
  '<p>III./JG 51 and I./SG 10. The calculation uses June unit returns and the 26 June share of reported air engagements.</p>'+
  '<a href="?loss-scope=bobruisk#claim-loss-calculator" data-claim-scope="bobruisk">Review the Bobruisk calculation</a></div>';
}

function render() {
 const scope=$('claim-loss-scope').value,input=$('claim-loss-count'),result=$('claim-loss-result'),method=$('claim-loss-method');
 const wasOpen=method.querySelector('details')?.open;
 const editable=scopes[scope].claimCount!==undefined;
 const claims=input.value.trim()===''?NaN:Number(input.value);
 const comparison=editable?calculate(scope,claims):null;
 const eastern=scope==='bobruisk'?bobruiskEstimate(bobruisk.campaign,bobruisk.date,easternCampaign.facts):null;
 result.classList.toggle('claim-loss-estimated',(scope==='cobra'&&!!comparison)||!!eastern);
 if(editable&&!comparison){
  result.textContent='Enter a whole number of claims, zero or greater.';
  method.hidden=true;
  input.setAttribute('aria-invalid','true');
  return;
 }
 input.removeAttribute('aria-invalid');
 method.hidden=false;
 if(scope==='cobra'){
  result.innerHTML='<strong>About '+fmt(comparison.expected)+'</strong><span>German aircraft destroyed in air combat<small>'+
   (claims===cobraClaim.value?'Working estimate · low confidence':'Hypothetical input · low confidence')+'</small></span>';
  method.innerHTML=renderCobra(comparison,claims);
 }else if(scope==='britain'){
  result.innerHTML='<strong>'+band(comparison)+'</strong><span>German aircraft destroyed<small>Estimate from the selected recorded days</small></span>';
  method.innerHTML=renderBritain(comparison);
 }else if(scope==='reverse'){
  const rambouillet=D.germanClaims.find(row=>row.id==='rambouillet-august15-reverse');
  result.innerHTML='<strong>'+rambouillet.claims+' claimed · '+rambouillet.losses+' lost</strong><span>Rambouillet · 15 August 1944<small>II./JG 26 against US 373rd Fighter Group P-47s</small></span>';
  method.innerHTML=renderReverse();
 }else{
  result.innerHTML=eastern?'<strong>About '+fmt(eastern.expected)+'</strong><span>German aircraft removed by enemy action<small>Working estimate · two Bobruisk-based groups · low confidence</small></span>':'Bobruisk · 26 June 1944';
  method.innerHTML=renderBobruisk(eastern);
 }
 if(wasOpen)method.querySelector('details')?.setAttribute('open','');
 const {operation,step}=scopes[scope];
 if(operation){
  const label=scope==='cobra'?'Open Cobra on 25 July 1944':'Open the 15 September 1940 raid';
  method.insertAdjacentHTML('beforeend','<p><a class="claim-open-case" href="#operation='+operation+'&amp;step='+step+'">'+label+'</a></p>');
  method.querySelector('.claim-open-case').addEventListener('click',event=>{
   if(!window.AtlasNormandyOperations?.choose(operation,step))return;
   event.preventDefault();
   $('operation-dossier').focus({preventScroll:true});
   $('operation-dossier').scrollIntoView({block:'start'});
  });
 }else if(scope==='bobruisk'){
  method.insertAdjacentHTML('beforeend','<p><a class="claim-open-case" href="#moment-detail">Open Bobruisk on 26 June 1944</a></p>');
  method.querySelector('.claim-open-case').addEventListener('click',event=>{
   const atlas=window.GrandAirWarV77,day=easternCampaign.moments.find(moment=>moment.date===bobruisk.date);
   if(!atlas||!day)return;
   event.preventDefault();
   atlas.chooseMoment(bobruisk.campaign,day.date,day.lat,day.lng,day.title);
   $('moment-detail').focus({preventScroll:true});
   $('moment-detail').scrollIntoView({block:'start'});
  });
 }
}

function selectScope(scope,claims=scopes[scope]?.claimCount) {
 const select=$('claim-loss-scope');
 if(!select||!Object.hasOwn(scopes,scope))return false;
 select.value=scope;
 $('claim-loss-count-wrap').hidden=claims===undefined;
 $('claim-loss-count-label').textContent=scope==='cobra'?'Aircraft claimed destroyed in the air':'Aircraft claimed destroyed';
 $('claim-loss-count').value=claims??'';
 render();
 return true;
}

function openCalculator(scope,claims) {
 if(!selectScope(scope,claims))return false;
 $('claim-loss-scope').focus({preventScroll:true});
 $('claim-loss-calculator').scrollIntoView({block:'start'});
 return true;
}

function init(){
 const select=$('claim-loss-scope');
 if(!select)return;
 select.addEventListener('change',()=>selectScope(select.value));
 $('claim-loss-count').addEventListener('input',render);
 const requested=new URLSearchParams(window.location.search).get('loss-scope');
 selectScope(Object.hasOwn(scopes,requested)?requested:window.location.hash.startsWith('#operation=cobra')?'cobra':'britain');
}
window.AtlasClaimLosses={calculate,historicalEstimate,bobruiskEstimate,renderEventEstimate,openCalculator,britainChecks};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
