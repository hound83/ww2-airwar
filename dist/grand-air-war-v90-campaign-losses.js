/* Compare source-specific campaign returns and test estimates on whole withheld periods. */
(function(){
'use strict';
const britain=window.AtlasBritainCampaignLossData;
const claims=window.AtlasClaimLossData;
if(!britain||!claims)return;

const DAY=86400000;
const sum=(rows,value)=>rows.reduce((total,row)=>total+value(row),0);
const without=(rows,index)=>rows.filter((_,i)=>i!==index);
const totals=rows=>({
 claims:sum(rows,row=>row.claims),
 losses:sum(rows,row=>row.losses),
 days:sum(rows,row=>row.days)
});

function fit(rows,method){
 const {claims,losses,days}=totals(rows);
 if(!claims)return {perClaim:0,perDay:losses/days};
 if(method==='claims')return {perClaim:losses/claims,perDay:0};

 // Fit losses per day to claims per day. Weight by period length.
 const claimRate=claims/days,lossRate=losses/days;
 const variance=sum(rows,row=>row.days*(row.claims/row.days-claimRate)**2);
 const covariance=sum(rows,row=>row.days*(row.claims/row.days-claimRate)*(row.losses/row.days-lossRate));
 const slope=variance>0?Math.max(0,covariance/variance):0;
 const intercept=lossRate-slope*claimRate;
 if(intercept>=0)return {perClaim:slope,perDay:intercept};

 // With a negative intercept, fit again on the zero-intercept boundary.
 return {
  perClaim:sum(rows,row=>row.claims*row.losses/row.days)/sum(rows,row=>row.claims**2/row.days),
  perDay:0
 };
}

function predict(fitted,row){
 return Math.round(fitted.perDay*row.days+fitted.perClaim*row.claims);
}

function score(rows,method){
 const errors=rows.map((row,index)=>Math.abs(predict(fit(without(rows,index),method),row)-row.losses));
 return {method,errors,mae:sum(errors,error=>error)/errors.length};
}

function choose(rows,claimsOnly=score(rows,'claims')){
 const combined=score(rows,'claims-and-days');
 return combined.mae<claimsOnly.mae?combined:claimsOnly;
}

function validate(rows){
 if(rows.length<4)return null;
 const checks=rows.map((row,index)=>{
  const training=without(rows,index);
  const {method,errors}=choose(training);
  const expected=predict(fit(training,method),row);
  const perDay=training.map((period,i)=>errors[i]/period.days).sort((a,b)=>a-b);
  const margin=Math.ceil(perDay[Math.ceil(0.8*perDay.length)-1]*row.days);
  const low=Math.max(0,expected-margin),high=expected+margin;
  return {...row,expected,low,high,method,error:Math.abs(expected-row.losses),covered:low<=row.losses&&row.losses<=high};
 });
 const baseline=score(rows,'claims');
 return {
  checks,mae:sum(checks,row=>row.error)/checks.length,
  maxError:Math.max(...checks.map(row=>row.error)),
  covered:checks.filter(row=>row.covered).length,
  baselineMae:baseline.mae,preferredMethod:choose(rows,baseline).method
 };
}

function periodRows(rows,claimKey,lossKey){
 return rows.map(row=>{
  const start=row.start||row.date,end=row.end||row.date;
  return {name:row.name,start,end,claims:row[claimKey],losses:row[lossKey],days:Math.round((Date.parse(end)-Date.parse(start))/DAY)+1};
 });
}

const britainRefs=sourceIds=>sourceIds.map(id=>({
 ...britain.sources[id],page:britain.sources[id].locator
}));
const july=claims.france.julyContext;
const julyRefs=[{...claims.sources[july.reference.source],page:july.reference.page}];
const julyScope='The RAF history compares several Allied air forces with the Luftwaffe. Its loss totals include multiple causes and its coverage includes day and night operations.';
const {weekSeries,phaseSeries,germanClaims}=britain;
const series={
 'britain-weeks':{
  label:'British claims by week',scope:'Battle of Britain · 10 July–31 October 1940',unit:'week',
  claimant:'British claims',lossLabel:'German aircraft destroyed',
  detail:weekSeries.claimScope+' The German total is recorded destruction. The first and last reporting weeks are partial.',
  rows:periodRows(weekSeries.rows,'britishClaims','germanDestroyed'),
  references:britainRefs(weekSeries.sourceIds)
 },
 'britain-phases':{
  label:'RAF claims by phase',scope:'Battle of Britain · 10 July–31 October 1940',unit:'phase',
  claimant:'RAF claims',lossLabel:'German aircraft destroyed',
  detail:phaseSeries.claimScope+' '+phaseSeries.lossScope+' The phase and weekly publications use their own claim totals.',
  rows:periodRows(phaseSeries.rows,'britishClaims','germanDestroyed'),
  references:britainRefs(phaseSeries.sourceIds)
 },
 'britain-german':{
  label:'Luftwaffe claims against the RAF',scope:'Battle of Britain · 10 July–31 October 1940',
  claimant:'Luftwaffe claims',lossLabel:'RAF fighters lost',
  detail:'The campaign total compares German claims with RAF Fighter Command fighter losses. The table below pairs seven dates in German situation reports with RAF losses from the published study.',
  rows:periodRows(germanClaims.selectedDates.rows,'claims','rafLosses'),
  total:{claims:germanClaims.campaign.claims,losses:germanClaims.campaign.britishFighterLosses},
  references:britainRefs([...germanClaims.campaign.sourceIds,...germanClaims.selectedDates.sourceIds])
 },
 'normandy-allied':{
  label:'Allied claims against Germany',scope:'Normandy · 1–18 July 1944',unit:'day',
  claimant:'Allied claims',lossLabel:'German aircraft lost',
  detail:julyScope+' The Allied air claims in the table exclude the 17 additional ground-gunner claims listed for the period.',
  rows:periodRows(july.days,'alliedClaims','germanLosses'),
  references:julyRefs
 },
 'normandy-german':{
  label:'German claims against the Allies',scope:'Normandy · 1–18 July 1944',unit:'day',
  claimant:'German claims',lossLabel:'Allied aircraft lost',
  detail:julyScope,
  rows:periodRows(july.days,'germanClaims','alliedLosses'),
  references:julyRefs
 }
};

for(const report of Object.values(series)){
 report.total??=totals(report.rows);
 report.validation=report.unit?validate(report.rows):null;
}
window.AtlasCampaignLosses={series,validate};
})();
