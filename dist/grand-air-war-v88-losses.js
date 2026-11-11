/* Compare like-for-like daily records and calculate scoped working estimates. */
(function(){
'use strict';
const D=window.AtlasClaimLossData,C=window.GrandAirWarV77Campaigns,N=window.NormandyV86Data;
if(!D||!C||!N)return;
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=x=>x.toLocaleString('en-US');
const per100=x=>(100*x).toFixed(1);
const band=({low,high})=>low===high?fmt(low):fmt(low)+'–'+fmt(high);
const sourceLink=s=>'<a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.title)+(s.page?' · '+esc(s.page):'')+'</a>';
const days=C.campaigns.find(campaign=>campaign.id==='britain').opponentReturnSeries.days;
const september=days.find(row=>row.date==='1940-09-15');
const cobra=D.cobra;
const cobraClaim=N.observations.find(fact=>fact.id===cobra.claimId);
const cobraSources=cobra.references.map(ref=>({...ref,...(D.sources[ref.source]||N.sources[ref.source])}));
const britishSource=C.sources[september.sourceId];
const scopes={
 britain:{claimCount:september.rafClaim,operation:'britain-15-sep',step:0},
 cobra:{claimCount:cobraClaim.value,operation:cobra.operation,step:1}
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

function allocateCobra(claims) {
 const widerSorties=cobra.widerUsFighterSorties+cobra.widerBritishFighterSorties;
 const bySorties=Math.min(claims,cobra.widerLosses*cobra.escortAircraft/widerSorties);
 const byClaims=Math.min(claims,cobra.widerLosses*(claims/(claims+cobra.otherAirClaims)));
 const min=Math.min(bySorties,byClaims),max=Math.max(bySorties,byClaims);
 return {low:Math.floor(min),high:Math.ceil(max),bySorties,byClaims,widerSorties};
}

function calculate(scope,claims) {
 if(!Number.isSafeInteger(claims)||claims<0)return null;
 if(scope==='britain')return compareBritain(days,claims);
 if(scope==='cobra')return allocateCobra(claims);
 return null;
}

function historicalEstimate(operationId,observations) {
 if(operationId!==cobra.operation)return null;
 const claim=observations.find(fact=>fact.id===cobra.claimId&&fact.date===cobra.date&&fact.measure==='claims'&&!fact.period);
 const resolved=observations.some(fact=>fact.measure==='losses'&&fact.lossScopeId===cobra.id&&fact.date===cobra.date&&!fact.period&&Number.isFinite(fact.value));
 if(!claim||resolved)return null;
 return {
  id:cobra.id,kind:'estimated',confidence:'low',method:'Local allocation scenarios',modelVersion:D.version,
  operation:operationId,date:cobra.date,claimant:cobra.claimant,opponent:cobra.opponent,area:cobra.area,
  outcome:'Aircraft destroyed in air combat',claimId:claim.id,claimCount:claim.value,
  ...calculate('cobra',claim.value),
  inputs:{
   widerGermanLossReports:cobra.widerLosses,
   escortAircraft:cobra.escortAircraft,
   estimatedWiderUsFighterSorties:cobra.widerUsFighterSorties,
   estimatedWiderBritishFighterSorties:cobra.widerBritishFighterSorties,
   ninthAirForceLisieuxClaims:cobra.otherAirClaims
  },
  assumptions:[
   'The sortie-share scenario uses the 483 escorts as a proxy for escort sorties and spreads the reported pool across estimated US and British fighter and fighter-bomber sorties.',
   'The claim-share scenario allocates the pool between Mission 494 and the documented Ninth Air Force claims over Lisieux. It assumes a similar share of claims corresponds to losses for both groups. Other Allied formations may also have inflicted losses.',
   'Both scenarios use the wider German daily report as the candidate pool. Cause, timing and attribution within that pool remain uncertain. The result is a sensitivity range.'
  ],
  sources:cobraSources
 };
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

function renderCobra(result,claims) {
 return '<p>Mission 494 reported '+fmt(cobraClaim.value)+' air-to-air destruction claims. The German calendar reports <strong>'+fmt(cobra.widerLosses)+' aircraft lost in its wider area</strong> that day. This estimate allocates a share to the Mission 494 escorts.</p>'+
  '<details><summary>Assumptions and source records</summary>'+
  '<p>Sortie share gives '+result.bySorties.toFixed(1)+' aircraft using '+fmt(cobra.escortAircraft)+' escorts out of about '+fmt(result.widerSorties)+' US and British fighter and fighter-bomber sorties. The scenario assumes the same opportunity per sortie.</p>'+
  '<p>Claim share gives '+result.byClaims.toFixed(1)+' aircraft using '+fmt(claims)+' out of '+fmt(claims+cobra.otherAirClaims)+' claims across Mission 494 and the four known Ninth Air Force claims over Lisieux. It assumes a similar share of claims corresponds to losses for both groups. Other Allied formations may also have inflicted losses.</p>'+
  '<p>Both scenarios start from the same German report. The causes, timing and Allied attribution of its losses are uncertain. The calculator limits the allocated share to the claims entered and rounds the endpoints outwards.</p>'+
  '<ul>'+cobraSources.map(s=>'<li>'+esc(s.detail)+' '+sourceLink(s)+'</li>').join('')+'</ul></details>';
}

function render() {
 const scope=$('claim-loss-scope').value,input=$('claim-loss-count');
 const result=$('claim-loss-result'),method=$('claim-loss-method');
 const claims=input.value.trim()===''?NaN:Number(input.value);
 const value=calculate(scope,claims);
 result.classList.toggle('claim-loss-estimated',scope==='cobra'&&!!value);
 if(!value){
  result.textContent='Enter a whole number of claims, zero or greater.';
  method.hidden=true;
  input.setAttribute('aria-invalid','true');
  return;
 }
 input.removeAttribute('aria-invalid');
 method.hidden=false;
 const {operation,step}=scopes[scope];
 const cobraScope=scope==='cobra';
 const outcome=cobraScope?'German aircraft destroyed in air combat':'German aircraft destroyed';
 const status=cobraScope?(claims===cobraClaim.value?'Working estimate · low confidence':'Hypothetical input · low confidence'):'Estimate from the selected recorded days';
 result.innerHTML='<strong>'+band(value)+'</strong> <span>'+outcome+'<small>'+
  status+'</small></span>';
 const wasOpen=method.querySelector('details')?.open;
 method.innerHTML=(cobraScope?renderCobra(value,claims):renderBritain(value))+
  '<p><a href="#operation='+operation+'&amp;step='+step+'">'+(cobraScope?'Open Cobra on 25 July 1944':'Open the 15 September 1940 raid')+'</a></p>';
 if(wasOpen)method.querySelector('details').open=true;
 method.querySelector('a[href^="#operation="]').addEventListener('click',event=>{
  if(!window.AtlasNormandyOperations?.choose(operation,step))return;
  event.preventDefault();
  $('operation-dossier').focus({preventScroll:true});
  $('operation-dossier').scrollIntoView({block:'start'});
 });
}

function selectScope(scope,claims=scopes[scope]?.claimCount) {
 const select=$('claim-loss-scope');
 if(!select||!Object.hasOwn(scopes,scope))return;
 select.value=scope;
 $('claim-loss-count-label').textContent=scope==='cobra'?'Aircraft claimed destroyed in the air':'Aircraft claimed destroyed';
 $('claim-loss-count').value=claims;
 render();
}
function init(){
 const select=$('claim-loss-scope');
 if(!select)return;
 select.addEventListener('change',()=>selectScope(select.value));
 $('claim-loss-count').addEventListener('input',render);
 selectScope(window.location.hash.startsWith('#operation=cobra')?'cobra':'britain');
}
window.AtlasClaimLosses={calculate,historicalEstimate,band,selectScope,britainChecks};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
