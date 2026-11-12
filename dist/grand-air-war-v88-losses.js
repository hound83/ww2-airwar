/* Compare dated aircraft claims and losses within their reporting populations. */
(function(){
'use strict';
const D=window.AtlasClaimLossData,C=window.GrandAirWarV77Campaigns,N=window.NormandyV86Data;
if(!D||!C||!N)return;
const campaignReports=window.AtlasCampaignLosses?.series;
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
 'britain-campaign':{series:['britain-weeks','britain-phases','britain-german']},
 'normandy-campaign':{series:['normandy-allied','normandy-german']},
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
const franceOmissions=france.training.map(row=>({
 date:row.date, claims:franceClaims-row.claims, losses:franceLosses-row.losses
}));
const franceChecks=france.checks.map(row=>({
 ...row, predicted:Math.round(row.claims*franceRate), sources:row.references.map(reference)
}));
const julyContext=france.julyContext;
const julyTotals=julyContext.days.reduce((sum,row)=>({
 germanLosses:sum.germanLosses+row.germanLosses,
 alliedClaims:sum.alliedClaims+row.alliedClaims,
 alliedLosses:sum.alliedLosses+row.alliedLosses,
 germanClaims:sum.germanClaims+row.germanClaims
}),{germanLosses:0,alliedClaims:0,alliedLosses:0,germanClaims:0});

function compareFrance(claims) {
 const omissions=franceOmissions.map(row=>({...row,expected:Math.round(claims*(row.losses/row.claims))}));
 const estimates=omissions.map(row=>row.expected);
 return {
  expected:Math.round(claims*franceRate),
  alternative:Math.round(claims*franceAlternativeRate),
  rate:franceRate,
  alternativeRate:franceAlternativeRate,
  leaveOneOut:{low:Math.min(...estimates),high:Math.max(...estimates),omissions}
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
 return {
  id:cobra.id,kind:'estimated',confidence:'low',method:'Pooled northern France day-fighter comparison',modelVersion:D.version,
  operation:operationId,date:cobra.date,claimant:cobra.claimant,opponent:cobra.opponent,area:cobra.area,
  outcome:'Aircraft destroyed in air combat',claimId:claim.id,claimCount:claim.value,
  ...compareFrance(claim.value),
  inputs:{widerGermanLossReports:cobra.widerLosses,matchedClaims:franceClaims,matchedLosses:franceLosses,possibleAdditionalLosses:francePossible},
  calibration:france.training.map(row=>({...row,sources:row.references.map(reference)})),
  validation:franceChecks[0],
  validationCases:franceChecks,
  campaignContext:{...julyContext,totals:julyTotals,source:reference(julyContext.reference)},
  commandReturn:{...cobra.commandReturn,source:reference(cobra.commandReturn.reference)},
  assumptions:[
   'Apply the claims-weighted rate from three selected pre-Cobra Eighth and Ninth Air Force daylight fighter comparisons in northern France to the Mission 494 escorts.',
   'The alternative includes both uncertain landings. The omission results show sensitivity to the choice of dates.',
   'The two August checks cover Ninth Air Force tactical fighters. The German day report and the 18-day series provide wider campaign context.'
  ],
  sources:cobra.references.map(reference)
 };
}

const isAircraftCount=value=>Number.isSafeInteger(value)&&value>=0;

function inventoryLossCeiling({opening,received,closing,knownOtherDepartures=0}) {
 if(![opening,received,closing,knownOtherDepartures].every(isAircraftCount))return null;
 const ceiling=opening+received-closing-knownOtherDepartures;
 return isAircraftCount(ceiling)?ceiling:null;
}

function selectLossRange({lower,upper},ceiling) {
 const boundedUpper=ceiling===null?upper:Math.min(upper,ceiling);
 const conflict=lower>boundedUpper;
 return {
  lower:conflict?null:lower,upper:boundedUpper,
  expected:conflict?null:Math.round((lower+boundedUpper)/2),
  ceiling,conflict
 };
}

function reconcileUnitReturns(units,period) {
 const totals={opening:0,received:0,closing:0,knownOtherDepartures:0};
 for(const {inventory,losses} of units){
  if(!inventory?.length)return null;
  let recorded=0;
  for(const row of inventory){
   const {opening,newDeliveries,repairReturns,transfersIn,closing,enemyAction,nonEnemy,overhaul,transfersOut}=row;
   if(![newDeliveries,repairReturns,transfersIn,nonEnemy,overhaul,transfersOut,enemyAction].every(isAircraftCount))return null;
   const received=newDeliveries+repairReturns+transfersIn;
   const knownOtherDepartures=nonEnemy+overhaul+transfersOut;
   const ceiling=inventoryLossCeiling({opening,received,closing,knownOtherDepartures});
   if(ceiling!==enemyAction)return null;
   recorded+=enemyAction;
   totals.opening+=opening;
   totals.received+=received;
   totals.closing+=closing;
   totals.knownOtherDepartures+=knownOtherDepartures;
  }
  if(recorded!==losses)return null;
 }
 return {...totals,period,departures:totals.opening+totals.received-totals.closing,ceiling:inventoryLossCeiling(totals)};
}

const bobruiskInventory=bobruisk.inventoryPeriod&&reconcileUnitReturns(bobruisk.unitLosses,bobruisk.inventoryPeriod);

function bobruiskEstimate(campaignId,date,observations) {
 if(campaignId!==bobruisk.campaign||date!==bobruisk.date||matchedLoss(observations,bobruisk.id,date))return null;
 const claim=observations.find(fact=>fact.date===date&&fact.measure==='claims'&&fact.side==='Soviet'&&
  fact.sourceId===bobruisk.references[0].source&&!fact.period);
 if(!claim)return null;
 const monthlyLosses=bobruisk.unitLosses.reduce((sum,row)=>sum+row.losses,0);
 const dayShare=bobruisk.dateEngagements/bobruisk.periodEngagements;
 const [lower,upper]=bobruisk.eligibleShare.map(share=>monthlyLosses*share*dayShare);
 const inventory=bobruiskInventory&&bobruiskInventory.period.start<=date&&date<=bobruiskInventory.period.end?bobruiskInventory:null;
 const range=selectLossRange({lower,upper},inventory?.ceiling??null);
 return {id:bobruisk.id,kind:'estimated',confidence:'low',date,
  ...range,inventory,monthlyLosses,claimCount:claim.value};
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
   '<td>'+fmt(row.claims)+(row.alternateClaims?'–'+fmt(row.alternateClaims):'')+'</td><td>'+fmt(row.losses)+
   (row.possibleLosses?' + '+row.possibleLosses+' uncertain':'')+'</td></tr>').join('')+
  '</tbody></table></div>';
}

function caseNotes(rows) {
 return '<ul>'+rows.map(row=>'<li><strong>'+esc(row.place)+'</strong> · '+esc(row.claimant)+' against '+esc(row.opponent)+
  '. '+esc(row.basis)+'. '+esc(row.detail)+' '+referenceLinks(row.references)+'</li>').join('')+'</ul>';
}

function renderCobra(result,claims) {
 const losses=cobra.commandReturn;
 const fighterLosses=losses.singleEngineFighters.map(row=>fmt(row.airCombatDestroyed)+' '+esc(row.aircraft)).join(' and ');
 const checkRows=franceChecks.map(row=>'<li><strong>'+esc(row.place)+'</strong> · '+fmt(row.predicted)+' predicted from '+
  fmt(row.claims)+' claims. '+band({low:row.losses,high:row.losses+row.possibleLosses})+' reconstructed losses.</li>').join('');
 return '<p><strong>'+Math.round(100*result.rate)+' losses per 100 claims</strong> across three earlier US fighter comparisons in northern France ('+
  franceLosses+' losses from '+franceClaims+' claims). For '+fmt(claims)+' claims, omitting one date at a time gives <strong>'+
  band(result.leaveOneOut)+'</strong>. Including both uncertain landings gives <strong>'+fmt(result.alternative)+'</strong>.</p>'+
  '<details><summary>Matched engagements, checks and sources</summary>'+engagementTable(france.training)+
  '<h3>Later engagement checks</h3><ul>'+checkRows+'</ul>'+
  '<p>The August checks cover Ninth Air Force tactical fighters. The small selected sample limits confidence for Eighth Air Force escorts.</p>'+
  caseNotes([...france.training,...franceChecks])+
  '<h3>Normandy, 1–18 July 1944</h3><p>The RAF history compares '+fmt(julyTotals.alliedClaims)+' Allied destruction claims with '+
  fmt(julyTotals.germanLosses)+' total German losses, and '+fmt(julyTotals.germanClaims)+' German destruction claims with '+
  fmt(julyTotals.alliedLosses)+' total Allied losses. These wider figures cover several air forces, day and night activity, and losses from multiple causes. '+
  sourceLink(reference(julyContext.reference))+'</p>'+
  '<h3>25 July German command return</h3><p>Luftflotte 3 recorded '+fmt(losses.enemyDestroyed)+
  ' aircraft destroyed by enemy action, including '+fmt(losses.enemyMissing)+' missing. The return lists '+
  fmt(losses.airCombatDestroyed)+' destroyed in air combat across all types, including '+fighterLosses+' in single-engine fighter units. '+
  'The separate operational calendar reports '+fmt(cobra.widerLosses)+' aircraft lost in its own reporting scope. The command-area return covers multiple engagements. A Mission 494 match needs the German units and airframes from the escort encounters. '+
  sourceLink(reference(losses.reference))+'</p>'+
  '<p>'+referenceLinks(cobra.references)+' · '+sourceLink(reference({source:'normandyClaimsAudit'}))+'</p></details>';
}

function renderReverse() {
 return '<p>German fighter claims and Allied aircraft losses from the same engagements. The Caen entry includes US and RAF losses. Le Bény-Bocage covers Canadian reconnaissance aircraft. The other cases cover US fighters.</p>'+
  engagementTable(D.germanClaims)+
  '<details><summary>Claim stages, loss definitions and sources</summary>'+caseNotes(D.germanClaims)+'</details>';
}

function bobruiskHeadline(result) {
 const value=result.conflict?'Up to '+fmt(result.upper):'About '+fmt(result.expected);
 const label=result.conflict?'Inventory ceiling · model conflicts with returns':'Working estimate · low confidence';
 const range=result.conflict?'':'<small>Scenario range '+result.lower.toFixed(1)+'–'+result.upper.toFixed(1)+'</small>';
 return '<strong>'+value+'</strong><span>German aircraft removed by enemy action<small>'+label+' · two Bobruisk-based groups</small>'+range+'</span>';
}

function renderBobruisk(result) {
 if(!result)return '<p>Use the Bobruisk event to review its dated loss evidence.</p>';
 const inventory=result.inventory;
 const inventoryText=inventory?
  '<p><strong>June inventory check.</strong> The groups opened with '+fmt(inventory.opening)+' aircraft, received '+fmt(inventory.received)+' and closed with '+fmt(inventory.closing)+
  '. Of the '+fmt(inventory.departures)+' that left, '+fmt(inventory.knownOtherDepartures)+' were non-enemy losses, overhaul or transfers. The remaining '+fmt(inventory.ceiling)+
  ' enemy-action removals set the ceiling for 26 June across these groups. '+sourceLink(reference({source:'sg10ReturnMirror'}))+'</p>':'';
 const allocation='<p>Assume half to all of the '+result.monthlyLosses+' June removals occurred during the opening battles. The date accounts for '+bobruisk.dateEngagements+
  ' of '+bobruisk.periodEngagements+' reported air engagements from 24 June to 4 July. ';
 const rangeText=result.conflict?'The modeled range exceeds the inventory ceiling. The returns support the upper bound shown.':
  'The working estimate is the rounded midpoint of the scenario range. The units’ daily flight and loss counts remain uncertain.';
 return '<p>The 16th Air Army reported <strong>'+result.claimCount+' German aircraft shot down</strong> that day. The working estimate covers enemy-action aircraft removals from two Bobruisk-based German groups. The June returns group together several kinds of enemy action.</p>'+
  '<details><summary>Monthly unit returns, inventory check and calculation</summary>'+
  '<ul>'+bobruisk.unitLosses.map(row=>'<li><strong>'+esc(row.unit)+' · '+row.losses+' '+esc(row.aircraft)+'</strong> removed by enemy action in June. Based at Bobruisk '+esc(row.basing)+
   '. '+referenceLinks([{source:row.source,page:row.page},{source:row.basingSource,page:'Base chronology'}])+'</li>').join('')+'</ul>'+
  inventoryText+allocation+rangeText+'</p><p>'+referenceLinks(bobruisk.references)+'</p></details>';
}

function renderEventEstimate(campaignId,date,observations) {
 const result=bobruiskEstimate(campaignId,date,observations);
 if(!result)return '';
 return '<div class="event-loss-estimate" data-event-estimate="'+esc(result.id)+'">'+
  '<div class="claim-loss-result claim-loss-estimated">'+bobruiskHeadline(result)+'</div>'+
  '<p>III./JG 51 and I./SG 10. The calculation uses June unit returns and the 26 June share of reported air engagements.'+
  (result.inventory?' The June inventory gives a ceiling of '+fmt(result.ceiling)+' for these groups.':'')+'</p>'+
  '<a href="?loss-scope=bobruisk#claim-loss-calculator" data-claim-scope="bobruisk">Review the Bobruisk calculation</a></div>';
}

const dayLabel=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',timeZone:'UTC'});
function campaignDate(row){
 const start=dayLabel.format(new Date(row.start)),end=dayLabel.format(new Date(row.end));
 const first=row.start.slice(0,7)===row.end.slice(0,7)?Number(row.start.slice(-2)):start;
 return row.start===row.end?'<time datetime="'+esc(row.start)+'">'+end+'</time>':
  '<time datetime="'+esc(row.start)+'">'+first+'</time>–<time datetime="'+esc(row.end)+'">'+end+'</time>';
}

function campaignPeriod(row){
 return '<th scope="row">'+(row.name?esc(row.name)+'<small>'+campaignDate(row)+'</small>':campaignDate(row))+'</th>';
}

function campaignTable(caption,headings,rows,attributes=''){
 return '<div class="claim-loss-table claim-campaign-table" role="region" tabindex="0" aria-label="'+esc(caption)+'" '+attributes+'>'+
  '<table><caption>'+esc(caption)+'</caption><thead><tr><th scope="col">Period</th>'+
  headings.map(heading=>'<th scope="col">'+esc(heading)+'</th>').join('')+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
}

function renderCampaignValidation(report){
 const result=report.validation;
 if(!result)return '<p>German claims by week and phase are the remaining source gap for the RAF loss model.</p>';
 const periods=result.checks.length+' '+report.unit+'s';
 const rows=result.checks.map(row=>'<tr data-held-out-period="'+esc(row.start)+'">'+campaignPeriod(row)+
  '<td>'+fmt(row.losses)+'</td><td>'+fmt(row.expected)+'</td><td class="'+(row.covered?'':'claim-range-miss')+'">'+
  band(row)+(row.covered?'':'<small>Missed</small>')+'</td></tr>');
 return '<p class="claim-campaign-score"><strong>'+result.mae.toFixed(1)+' aircraft average miss</strong> across '+periods+
  '. The claims-only ratio missed by '+result.baselineMae.toFixed(1)+'. The ranges covered '+result.covered+' of '+result.checks.length+' recorded totals.</p>'+
  '<details><summary>Held-out estimates and ranges</summary>'+
  '<p>Each estimate withholds one complete '+report.unit+'. The other periods choose between a claims-only ratio and a fit using claims and period length. Ranges scale the 80th percentile of the other periods’ errors per day to the length of the withheld period. The full series favors '+(result.preferredMethod==='claims'?'the claims-only ratio':'claims and period length')+'.</p>'+
  campaignTable('Checks against withheld loss records',['Recorded losses','Estimate','Modeled range'],rows,'data-held-out-table')+
  '<p><a href="https://github.com/hound83/ww2-airwar/blob/main/research/sources/atlas-v90-campaign-loss-validation-2026-11-12.md" target="_blank" rel="noopener noreferrer">Read the model and source audit</a></p></details>';
}

function renderCampaignReport(report){
 const max=Math.max(1,...report.rows.map(row=>Math.max(row.claims,row.losses)));
 const rows=report.rows.map(row=>'<tr data-campaign-period="'+esc(row.start)+'">'+campaignPeriod(row)+
  '<td class="claim-campaign-loss" style="--share:'+100*row.losses/max+'%">'+fmt(row.losses)+'</td>'+
  '<td class="claim-campaign-claims" style="--share:'+100*row.claims/max+'%">'+fmt(row.claims)+'</td>'+
  '<td>'+(row.claims?per100(row.losses/row.claims):'—')+'</td></tr>');
 const caption=report.unit?'Recorded comparison by '+report.unit:'Seven dated German reports';
 return '<p>'+esc(report.detail)+'</p><p>'+report.references.map(sourceLink).join(' · ')+'</p>'+
  renderCampaignValidation(report)+campaignTable(caption,['Recorded losses',report.claimant,'Losses per 100 claims'],rows,'data-recorded-campaign-table');
}

function render() {
 const scope=$('claim-loss-scope').value,input=$('claim-loss-count'),result=$('claim-loss-result'),method=$('claim-loss-method');
 if(scopes[scope].series){
  const report=campaignReports?.[$('claim-loss-series').value];
  result.classList.remove('claim-loss-estimated');
  method.hidden=!report;
  result.innerHTML=report?'<strong>'+fmt(report.total.losses)+'</strong><span>'+esc(report.lossLabel)+
   '<small>'+fmt(report.total.claims)+' '+esc(report.claimant)+' · '+esc(report.scope)+'</small></span>':'Campaign comparison could not load. Reload this page to retry.';
  if(report)method.innerHTML=renderCampaignReport(report);
  return;
 }
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
  result.innerHTML=eastern?bobruiskHeadline(eastern):'Bobruisk · 26 June 1944';
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
 const reporting=$('claim-loss-series'),series=scopes[scope].series;
 $('claim-loss-series-wrap').hidden=!series;
 if(series){
  reporting.innerHTML=campaignReports?series.map(id=>'<option value="'+id+'">'+esc(campaignReports[id].label)+'</option>').join(''):'';
  const requested=new URLSearchParams(window.location.search).get('loss-series');
  if(series.includes(requested))reporting.value=requested;
 }
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
 $('claim-loss-series').addEventListener('change',render);
 const requested=new URLSearchParams(window.location.search).get('loss-scope'),hash=window.location.hash;
 const initial=hash.startsWith('#operation=cobra')?'cobra':hash.startsWith('#operation=britain-')?'britain':'britain-campaign';
 selectScope(Object.hasOwn(scopes,requested)?requested:initial);
}
window.AtlasClaimLosses={calculate,historicalEstimate,bobruiskEstimate,renderEventEstimate,openCalculator,britainChecks,inventoryLossCeiling,selectLossRange};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
