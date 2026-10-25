/* Luftwaffe Pilot Attrition Lab v3: changing monthly force, cohorts, equipment and transparent evidence. */
(function () {
  "use strict";
  const D=window.LuftData;
  if(!D)throw new Error("Historical data module failed to load");
  const $=id=>document.getElementById(id);
  const fmt=(v,d=0)=>Number(v||0).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
  const pc=(v,d=1)=>fmt(v,d)+"%";
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const randGen=(seed)=>()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const mean=(a,f)=>a.length?a.reduce((n,x)=>n+f(x),0)/a.length:0;
  const median=(a,f)=>{if(!a.length)return 0;const s=a.map(f).sort((a,b)=>a-b),k=Math.floor(s.length/2);return s.length%2?s[k]:(s[k-1]+s[k])/2;};
  const base={start:78,end:89,view:"pilot",cohort:"period",mode:"baseline",
    force:100,tempo:100,customTempo:25,contact:100,risk:3,claims:2,
    loss:100,recovery:15,east:100,condor:326,spainTempo:15};
  let state={...base},snapshots=[],registry=[],timer=null,recomputing=false;
  const namedCohorts={
    period:"Pilots on duty at selected start",condor:"Condor Legion J/88 veterans",
    bob:"Battle of Britain participants (modeled)",france:"Battle of France participants (modeled)",
    barbarossa:"Barbarossa, 1941 cohort (modeled)",
    reich43:"Defense of the Reich, 1943 (modeled)",reich44:"Defense of the Reich, 1944 (modeled)"
  };
  const scenarios=[
    ["full","1936–May 1945",0,106,"condor"],
    ["spain","Condor Legion",4,32,"condor"],
    ["spainend","Condor → 1945",4,106,"condor"],
    ["ww2","World War II",38,106,"period"],
    ["britain","Battle of Britain",48,51,"bob"],
    ["britainend","Britain → 1945",48,106,"bob"],
    ["barbarossa","Barbarossa → 1945",59,106,"barbarossa"],
    ["43","1943",78,89,"period"],
    ["schweinfurt","Schweinfurt raids",85,87,"reich43"],
    ["44","1944",90,101,"reich44"],
    ["end","1944–May 1945",90,106,"period"]
  ];
  const baselinePilot=i=>Math.max(80,Math.round(D.pilots(i).value));
  const effectiveForce=i=>Math.max(20,Math.round(D.pilots(i).value*(state.mode==="baseline"?1:state.force/100)));
  const monthlyTempo=i=>state.mode==="custom"?state.customTempo:
    D.tempo(i).value*(state.mode==="baseline"?1:state.tempo/100);
  const monthlyContact=i=>clamp(D.contact(i).value*(state.mode==="baseline"?1:state.contact/100),0.01,0.96);
  const pilotLoss=i=>{
    const r=D.rate(i),multiply=state.mode==="baseline"?1:state.loss/100;
    return {value:clamp(r.value*multiply,0,.7),
      quality:multiply!==1?r.quality==="documented"?"adjusted":"scenario":r.quality,
      sourceValue:r.value};
  };
  const season=m=>[.79,.86,.98,1.02,1.08,1.10,1.14,1.13,1.04,.97,.91,.81][m];
  function simulate(){
    const rng=randGen(3648219),s=state,cohortSet=new Set(Object.keys(namedCohorts).filter(x=>x!=="period"));
    let nextId=0,active=[],inactive=[],pending=[],totalCasualties=0,totalPermanent=0,returned=0,spainAssigned=0;
    registry=[];
    function create(i){
      const u=rng(),p={id:nextId++,entry:i,sorties:0,encounters:0,claims:0,combatMonths:0,
        experienceMonths:0,skill:u<.70?.60:u<.91?1.42:u<.989?3.1:u<.998?7.2:15,
        eastSeed:rng(),theater:"West",tag:Object.create(null),spainEnd:-1,
        status:"active",permanent:false};
      registry.push(p);return p;
    }
    for(let k=0;k<effectiveForce(0);k++)active.push(create(0));
    function roster(i,lossInfo={value:0,quality:"peacetime"},lossThis=0,returnThis=0,transferThis=0){
      const stats={i,month:i<0?"Before Jul 1936":D.label(i),count:active.length,ids:active.map(p=>p.id),
        strengthAnchor:D.pilots(Math.max(0,i)),lossRate:lossInfo.value,
        rateQuality:lossInfo.quality,actualLoss:lossThis,cumLoss:totalCasualties,
        permanent:totalPermanent,returned:returnThis,transfers:transferThis,tagCounts:{},
        claim0:0,claim1:0,claim5:0,claim20:0,claim1to4:0,claim5to19:0,claim20plus:0,experienced75:0,experienced200:0,
        meanSorties:mean(active,p=>p.sorties),medianSorties:median(active,p=>p.sorties),
        meanEncounters:mean(active,p=>p.encounters),medianEncounters:median(active,p=>p.encounters),
        meanClaims:mean(active,p=>p.claims),medianClaims:median(active,p=>p.claims),
        meanService:mean(active,p=>p.combatMonths/12),medianService:median(active,p=>p.combatMonths/12)};
      for(const key of cohortSet)stats.tagCounts[key]=0;
      for(const p of active){
        for(const key of cohortSet)if(p.tag[key])stats.tagCounts[key]++;
        if(p.claims===0)stats.claim0++;
        if(p.claims>=1)stats.claim1++;
        if(p.claims>=5)stats.claim5++;
        if(p.claims>=20)stats.claim20++;
        if(p.claims>=1&&p.claims<5)stats.claim1to4++;
        if(p.claims>=5&&p.claims<20)stats.claim5to19++;
        if(p.claims>=20)stats.claim20plus++;
        if(p.encounters>=75)stats.experienced75++;
        if(p.encounters>=200)stats.experienced200++;
      }
      return stats;
    }
    const history=[roster(-1)];
    for(let i=0;i<D.MONTHS;i++){
      const date=D.at(i),war=date.y>1939||(date.y===1939&&date.m>=8),
        spain=i>=4&&i<=32,lossInfo=pilotLoss(i),target=effectiveForce(i);
      let transferred=0,back=0;
      // Strength adjustments are postings/new pilots, not counted as combat fatalities.
      if(active.length>target){
        while(active.length>target){const j=Math.floor(rng()*active.length),p=active.splice(j,1)[0];p.status="reserve";inactive.push(p);transferred++;}
      }else{
        while(active.length<target){
          const p=inactive.length&&rng()<.48?inactive.shift():create(i);
          p.status="active";active.push(p);
        }
      }
      // Unique J/88 service participants rotate through Spain; never 326 pilots simultaneously.
      if(spain){
        const portion=Math.round(s.condor*(i-3)/29);
        let inSpain=active.filter(p=>p.spainEnd>=i).length;
        const eligible=active.filter(p=>!p.tag.condor);
        for(let j=eligible.length-1;j>0;j--){const k=Math.floor(rng()*(j+1));[eligible[j],eligible[k]]=[eligible[k],eligible[j]];}
        while(spainAssigned<portion&&eligible.length&&inSpain<70){
          const p=eligible.pop();
          // Tour lengths change over time, leaving room for the documented
          // succession of 326 distinct participants in a much smaller unit.
          p.tag.condor=true;p.spainEnd=i+(i<=10?5+Math.floor(rng()*3):3+Math.floor(rng()*4));
          spainAssigned++;inSpain++;
        }
      }
      const eastFrac=clamp(D.east(i).value*(s.mode==="baseline"?1:s.east/100),0,1);
      const scheduled=D.tempo(i).value;
      for(const p of active){
        const deployed=spain&&p.spainEnd>=i;
        p.theater=p.eastSeed<eastFrac?"East":"West";
        const monthly=deployed?s.spainTempo:war?monthlyTempo(i)*season(date.m):0;
        const sorties=Math.max(0,Math.round(monthly*(.70+.60*rng())));
        const previous=p.encounters;
        for(let j=0;j<sorties;j++){
          p.sorties++;
          const encounter=deployed?.43:monthlyContact(i);
          if(rng()<encounter){
            p.encounters++;
            const theater=deployed?1:p.theater==="East"?1.5:.78;
            const learn=.70+1.20*(1-Math.exp(-p.encounters/70));
            const factor=Math.pow(p.skill,(s.mode==="baseline"?2:s.claims)/2);
            const chance=Math.min(.48,.0108*theater*learn*factor);
            if(rng()<chance)p.claims++;
          }
        }
        if(p.encounters>previous)p.combatMonths++;
        if(sorties>0)p.experienceMonths++;
        if(date.y===1939&&date.m===8)p.tag.france=p.tag.france||false;
        if(war&&date.y===1940&&date.m>=4&&date.m<=5&&p.theater==="West"&&sorties>0)p.tag.france=true;
        if(war&&date.y===1940&&date.m>=6&&date.m<=9&&p.theater==="West"&&sorties>0&&rng()<.53)p.tag.bob=true;
        if(war&&date.y===1941&&date.m>=5&&date.m<=10&&p.theater==="East"&&sorties>0)p.tag.barbarossa=true;
        if(war&&date.y===1943&&date.m>=0&&p.theater==="West"&&sorties>0)p.tag.reich43=true;
        if(war&&date.y===1944&&date.m<=6&&p.theater==="West"&&sorties>0)p.tag.reich44=true;
      }
      const risk=s.mode==="baseline"?3:s.risk;
      const weights=active.map(p=>{
        const inexperienced=.55*Math.exp(-p.encounters/38)+.45*Math.exp(-p.sorties/150);
        return (1+(risk-1)*inexperienced)*(.80+.4*rng());
      });
      const avg=mean(weights,w=>w);
      const survivors=[],monthlyCasualties=[];
      for(let j=0;j<active.length;j++){
        const p=active[j],deployed=spain&&p.spainEnd>=i;
        const hazard=spain?(deployed?.012:0):war?clamp(lossInfo.value*weights[j]/avg,0,.85):0;
        if(rng()<hazard){
          monthlyCasualties.push(p);totalCasualties++;
          if(rng()<(s.mode==="baseline"?.15:s.recovery/100)){
            p.status="recovering";pending.push({p,at:i+2+Math.floor(rng()*5)});
          }else{p.status="permanent";p.permanent=true;totalPermanent++;}
        }else survivors.push(p);
      }
      const future=[];
      for(const item of pending){
        if(item.at<=i){
          if(survivors.length<target){item.p.status="active";survivors.push(item.p);back++;returned++;}
          else {item.p.status="reserve";inactive.push(item.p);}
        }else future.push(item);
      }
      pending=future;
      while(survivors.length<target){
        const p=inactive.length&&rng()<.12?inactive.shift():create(i+1);
        p.status="active";survivors.push(p);
      }
      active=survivors;
      history.push(roster(i,lossInfo,monthlyCasualties.length,back,transferred));
    }
    return history;
  }
  function collect(){
    const st=snapshots[state.start],en=snapshots[state.end+1],
      slice=snapshots.slice(state.start+1,state.end+2),
      initialIds=new Set(st.ids),key=state.cohort,
      selectedAll=key==="period"?initialIds.size:registry.filter(p=>p.tag[key]).length;
    const series=slice.map(r=>{
      const cohort=key==="period"?r.ids.filter(id=>initialIds.has(id)).length:r.tagCounts[key];
      return {...r,cohort,cohortPct:selectedAll?100*cohort/selectedAll:0,
        ex75:r.count?100*r.experienced75/r.count:0,
        ex200:r.count?100*r.experienced200/r.count:0,
        c1:r.count?100*r.claim1/r.count:0,
        c5:r.count?100*r.claim5/r.count:0,
        c20:r.count?100*r.claim20/r.count:0};
    });
    return {start:st,end:en,series,denominator:selectedAll,
      endCohort:series.length?series[series.length-1].cohort:0};
  }
  function slider(id,label,min,max,step,description){
    return '<div class="field"><label for="'+id+'" class="field-title">'+label+
      '<output id="'+id+'-v"></output></label><input class="range" type="range" id="'+id+
      '" min="'+min+'" max="'+max+'" step="'+step+'"><p class="note">'+description+
      '</p>'+(id==="force"||id==="tempo"||id==="risk"||id==="loss"?'<div id="'+id+'-meter"></div>':"")+'</div>';
  }
  function setSectionTags(){
    const root=document.querySelector("main");
    const direct=[...root.children];
    // Keep the first two panels: sidebar and period selection, switching only the analytic view.
    direct.slice(2,6).forEach(el=>el.classList.add("pilot-only"));
    // Distribution/ledger is the next root panel; sources is last.
    const table=$("ledger").closest(".panel");table.classList.add("pilot-only");
    const source=direct[direct.length-1];
    source.id="sources-panel";
    const cohortPanel=document.createElement("section");cohortPanel.className="panel pilot-only";cohortPanel.id="cohort-panel";
    cohortPanel.innerHTML=[
      '<h2>Named veteran cohort — long-term retention</h2>',
      '<p class="chart-summary">Follow pilots with a modeled campaign experience, including those who later leave frontline duty. The “still serving” count is NOT a death count.</p>',
      '<p class="cohort-status" id="cohort-description"></p>',
      '<div class="charts"><div class="chartbox"><h3>Selected cohort still in frontline service</h3><svg class="graph" id="cohort-chart" viewBox="0 0 600 260" preserveAspectRatio="none" role="img" aria-label="Named veteran retention"></svg></div>',
      '<div class="chartbox"><h3>Changing fighter pilot strength</h3><svg class="graph" id="force-chart" viewBox="0 0 600 260" preserveAspectRatio="none" role="img" aria-label="Monthly fighter pilot force"></svg></div></div>',
      '<div class="model-key"><span><b style="background:#f4c46a"></b>Tracked cohort remaining (%)</span><span><b style="background:#48d3c5"></b>Modeled active fighter pilots</span><span><b style="background:#82b9ff"></b>Monthly baseline strength estimate</span></div>'
    ].join("");
    table.parentNode.insertBefore(cohortPanel,table);
    const equipment=document.createElement("section");equipment.className="panel hidden";equipment.id="equipment-section";
    equipment.innerHTML=[
      '<h2>Equipment and airframe losses <span class="top-badge estimate">Different denominators</span></h2>',
      '<p class="chart-summary" id="equipment-intro"></p><div class="month-grid" id="equipment-stats"></div>',
      '<div class="divider"></div><div class="charts">',
      '<div class="chartbox"><h3>Serviceable single-engine fighters</h3><svg class="graph" id="aircraft-chart" viewBox="0 0 600 260" preserveAspectRatio="none" role="img" aria-label="Fighter aircraft strength"></svg><p class="data-caption">Interpolated between surviving snapshots. Not an annual production total and not pilot strength.</p></div>',
      '<div class="chartbox"><h3>Fighter aircraft received versus written off</h3><svg class="graph" id="production-chart" viewBox="0 0 600 260" preserveAspectRatio="none" role="img" aria-label="Aircraft acceptances and write-offs"></svg><p class="data-caption">Receipts/acceptances and write-offs represent different accounting categories; the 1944 monthly write-off shape is allocated from an annual estimate.</p></div>',
      '</div><div class="divider"></div><h3>Aircraft data ledger</h3>',
      '<div class="tablewrap"><table><thead><tr><th>Month</th><th>Fighters ready</th><th>Strength basis</th><th>Production / accepted</th><th>Production definition</th><th>Written off</th><th>Loss basis</th></tr></thead><tbody id="equipment-ledger"></tbody></table></div>',
      '<div class="divider"></div><details class="v73-details"><summary>German aircraft families · background only</summary><div class="v73-details-body"><p class="chart-summary">Broad operational windows, not model-by-model strength. The source-led Aircraft &amp; equipment view contains the v7.3 provisional subtype timeline and estimated counts.</p>',
      '<div class="info-cards" id="german-types"></div></div></details>',
      '<details class="v73-details"><summary>Allied aircraft families · background only</summary><div class="v73-details-body"><p class="chart-summary">Presence in a theater does not establish how many of that type were flying, or which aircraft caused a German loss. See the source-led variant explorer.</p>',
      '<div class="info-cards" id="allied-types"></div></div></details>',
      '<details class="v73-details"><summary>Recorded causes of loss · isolated historical snapshots</summary><div class="v73-details-body">',
      '<p class="chart-summary">Selected archival snapshots only. A 1941 case cannot be treated as coverage for 1941–1945. Enemy action includes multiple kinds of threat, not just fighter combat.</p>',
      '<div class="info-cards" id="cause-cases"></div></div></details>',
      '<div class="divider"></div><h3>Captured German aircraft-loss reports for this period</h3>',
      '<p class="chart-summary">The RAF digitized the German Quartermaster loss returns. Many distinguish Bf 109/Fw 190, ground destruction, combat damage, flak, operational accidents and non-operational accidents. Select a narrower period to filter available files. Links open the actual translated wartime records.</p>',
      '<div class="info-cards" id="raf-reports"></div>',
      '<div class="pinned"><strong>Attribution warning</strong><p class="small">German loss returns commonly distinguish combat damage, accidents or operational failures; they usually do not identify the specific attacking aircraft type. P-47, P-51, Spitfire and Soviet fighter “shares” of all losses are <strong>not calculated</strong> without a validated matched German-and-Allied event dataset. An attribution percentage here would be invented precision.</p></div>',
      '<h3>Documented aircraft-loss mechanisms</h3><div class="info-cards">',
      '<div class="info-card"><strong>Combat losses, Jan–Jun 1944</strong><p>2,855 German aircraft across the cited dataset; not explicitly a count of P-47/P-51 claims or solely single-engine fighters.</p></div>',
      '<div class="info-card"><strong>Accidents and other causes, Jan–Jun 1944</strong><p>1,345 German aircraft; damage from combat can contribute to a later loss or accident, so categories are administrative.</p></div>',
      '<div class="info-card"><strong>Single-engine fighters written off in 1944</strong><p>Approximately 8,500, plus around 8,000 aircraft damaged above 10%; a different population/period from the two half-year totals.</p></div>',
      '</div><p class="data-caption">Sources: Ager et al., 2022 (using Murray), and official USAAF World War II history, Vol. III, Ch. 2. Avoid summing overlapping periods or categories.</p>'
    ].join("");
    source.parentNode.insertBefore(equipment,source);
    const aces=document.createElement("section");aces.className="panel";aces.id="aces-panel";
    aces.innerHTML='<h2>Real pilots as external benchmarks</h2><p class="chart-summary">Named pilots and their documented/attributed combat claims, operational windows and mission totals. These extraordinary survivors are a highly selected sample—not the average pilot or the calibration target of the simulation.</p><div class="ace-grid" id="ace-grid"></div><div class="warning" style="margin-top:15px"><strong>Victories are claims/credits, not an independently verified enemy-loss count.</strong> Combat missions and actual aerial engagements are also different: Hartmann, for example, described 1,404 combat missions but 825 occasions of aerial combat. Leadership appointments, wounds, training duties and temporary grounding interrupt combat careers.</div>';
    source.parentNode.insertBefore(aces,source);
  }
  function controlPanel(){
    const aside=document.querySelector(".controls");
    aside.innerHTML=[
      '<h2>Historical scenario controls</h2><p class="small">Monthly pilot strength is reconstructed from wartime figures where available. All unsupported values are marked as estimates. These controls never create more pilots than the simulated roster contains.</p>',
      '<div class="field"><label class="field-title" for="mode">Model mode</label><select id="mode">',
      '<option value="baseline">Historical anchors + explicit estimates</option>',
      '<option value="sensitivity">Sensitivity: adjust assumptions</option>',
      '<option value="custom">Custom: set absolute sortie tempo</option>',
      '</select><p class="note">“Historical” means source-constrained where records exist; it does not mean every month is independently verified.</p></div>',
      '<div class="field"><label class="field-title" for="cohort">Track whose experience?</label><select id="cohort">'+
        Object.entries(namedCohorts).map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join("")+
        '</select><p class="note">Campaign cohorts are hypothetical groups participating at the time, not reconstructed individual rosters. You may follow them beyond the campaign dates.</p></div>',
      '<div class="divider"></div><h3>Frontline force and activity</h3>',
      slider("force","Active pilot strength vs baseline",40,160,5,"100% uses the period-dependent strength reconstruction. Below/above 100% explores uncertainty, not a claim of extra historical pilots."),
      slider("tempo","Operational sortie tempo vs baseline",40,200,5,"100% follows a changing month-by-month working tempo scenario; no all-Luftwaffe monthly per-pilot sortie series is verified."),
      slider("customTempo","Custom sorties per pilot/month",0,65,1,"Only active in Custom mode. Prewar non-deployed pilots still do not fly wartime combat sorties."),
      slider("contact","Air-combat encounters vs baseline",30,170,5,"Operational sorties include missions with no combat. The historical population-wide encounter fraction is not known."),
      '<div class="divider"></div><h3>Attrition and combat outcomes</h3>',
      slider("loss","Pilot casualties vs historical/model curve",50,150,5,"Historical loss percentages are preserved in Baseline; adjustments are clearly labeled counterfactual."),
      slider("risk","Rookie hazard versus veterans",1,5,.5,"Equal monthly exposure: a 3× assumption is a scenario, not an official measured German-wide ratio."),
      slider("recovery","Recorded casualties returning to service",0,40,5,"Wounded and some temporarily absent pilots could return. This is a sensitivity parameter; the source rate is not permanently killed."),
      slider("claims","Claim-rate concentration",1,4,.5,"Controls variation between ordinary pilots and an unusually successful minority. Claim numbers are simulated, not a complete roster of credits."),
      slider("east","Eastern Front activity weighting",30,170,5,"Changes modeled allocation of flying to theaters; does not imply identical hazard or air-combat success."),
      '<div class="divider"></div><h3>Condor Legion cohort</h3>',
      slider("condor","J/88 distinct fighter pilot participants",200,380,1,"Literature reports 326 different fighter pilots over the Spanish deployment, not 326 simultaneous fighters."),
      slider("spainTempo","Spanish operational sorties/month while deployed",5,30,1,"Modeled activity for the deployed pilots only. J/88 operated roughly squadron-sized formations; actual fighter sorties varied."),
      '<div class="divider"></div><div class="warning"><strong>Historical guardrail:</strong> There is no complete personnel roster or validated monthly 1936–45 pilot inventory. Estimates, recoveries, postings and equipment losses are never silently counted as documented pilot deaths.</div>'
    ].join("");
  }
  function sourcePanel(){
    const container=$("sources-panel");
    container.innerHTML=[
      '<h2>Evidence hierarchy, calculations and unresolved gaps</h2>',
      '<p class="chart-summary">We use original wartime returns in official histories where possible; transparent reconstructions elsewhere. The aircraft and personnel series are related, but NOT the same denominator.</p>',
      '<div class="info-cards">',
      '<div class="info-card"><strong>Direct wartime records <span class="source-tag">SOURCED</span></strong><p>Monthly fighter pilot casualty percentages January 1942–May 1944; late-1943 readiness tables; 1944 factory acceptances. A figure may still have reporting and classification problems.</p></div>',
      '<div class="info-card" style="border-color:var(--gold)"><strong>Derived or constrained <span class="source-tag estimate-tag">INFERENCE</span></strong><p>Sept 1943–May 1944 pilot strengths calculated as casualties divided by casualty share; early-1943 strengths fit the independently published 2,105 annual average.</p></div>',
      '<div class="info-card" style="border-color:var(--red)"><strong>Open historical gaps <span class="source-tag estimate-tag">MODEL</span></strong><p>Most strength values outside 1943–May 1944, actual all-pilot sortie/engagement distributions, specific cohort survival and the day-fighter 1945 attrition curve remain scenarios.</p></div>',
      '</div><div class="divider"></div>',
      '<div class="source-columns"><div><h3>1943 observed pilot losses</h3><div class="tablewrap"><table class="research-table"><thead><tr><th>Month</th><th>Casualties</th><th>% of fighter pilots</th><th>Implied pilot force</th></tr></thead><tbody>'+
        D.pilotCasualties43.map(x=>'<tr><td>'+D.label(D.idx(1943,x[0]))+'</td><td>'+fmt(x[1])+'</td><td>'+pc(x[2])+'</td><td>≈'+fmt(x[1]/(x[2]/100))+'</td></tr>').join("")+
        '</tbody></table></div><p class="data-caption">1943 total: 2,967 killed, wounded or missing. Average operational/partly-operational fighter pilots: 2,105. The early-year monthly strengths are constrained to the annual average, not directly observed.</p></div>',
      '<div><h3>1944 observed pilot losses</h3><div class="tablewrap"><table class="research-table"><thead><tr><th>Month</th><th>Casualties</th><th>% of fighter pilots</th><th>Implied pilot force</th></tr></thead><tbody>'+
        D.pilotCasualties44.map(x=>'<tr><td>'+D.label(D.idx(1944,x[0]))+'</td><td>'+fmt(x[1])+'</td><td>'+pc(x[2])+'</td><td>≈'+fmt(x[1]/(x[2]/100))+'</td></tr>').join("")+
        '</tbody></table></div><p class="data-caption">Jan–May 1944 total: 2,262. January 1944 is 12.1% here (Murray Table LIII); a separate long-range chart is transcribed as 12.9%. We use 12.1% consistently with this table and disclose the discrepancy.</p></div></div>',
      '<div class="divider"></div><div class="source-columns"><div><h3>1943 fighter readiness: authorized / present / ready</h3><div class="tablewrap"><table class="research-table"><thead><tr><th>Month</th><th>Authorized</th><th>Present</th><th>Ready</th></tr></thead><tbody>'+
        D.readiness43.map(x=>'<tr><td>'+D.label(D.idx(1943,x[0]))+'</td><td>'+fmt(x[1])+'</td><td>'+fmt(x[2])+'</td><td>'+fmt(x[3])+'</td></tr>').join("")+
        '</tbody></table></div><p class="data-caption">These are <strong>fighter aircraft</strong>, not fighter pilots. Readiness changes with damage, repairs and fuel shortages.</p></div>',
      '<div><h3>Historical examples of institutional loss</h3><div class="tablewrap"><table class="research-table"><thead><tr><th>Year</th><th>JG 26 pilots killed</th></tr></thead><tbody>'+
        [[1939,2],[1940,51],[1941,64],[1942,69],[1943,149],[1944,249],[1945,110]].map(x=>'<tr><td>'+x[0]+'</td><td>'+x[1]+'</td></tr>').join("")+
        '</tbody></table></div><p class="data-caption">One specific fighter wing only; cannot simply be multiplied across all German fighter units.</p></div></div>',
      '<div class="divider"></div><h3>Research archive and provenance</h3><div class="source-columns" id="sources-grid"></div>',
      '<div class="warning"><strong>Interpretation:</strong> An active-cohort count means “still in modeled frontline service,” not “survived the war” and certainly not “known to have been killed.” The source-based aggregate loss figures mix killed, wounded and missing. A pilot or aircraft disappearing from the operational roster can have many causes. Our trajectories are transparent scenario outcomes, never reconstructed biographies.</div>'
    ].join("");
  }
  function init(){
    document.title="Luftwaffe Attrition Lab · Pilots and Aircraft, 1936–1945";
    document.querySelector(".kicker").textContent="Historical airpower · Research lab v3.0";
    document.querySelector(".lead").textContent="Follow the changing Luftwaffe fighter force from Spain to May 1945. Track veteran cohorts, simulate pilots and combat experience, inspect aircraft production and losses, and compare findings with wartime sources.";
    controlPanel();setSectionTags();sourcePanel();
    document.querySelector(".timeline-top .small").textContent="July 1936–May 1945 · Both handles remain available for long-term cohort tracking";
    $("start").max=106;$("end").max=106;
    document.querySelector(".yearlabels").innerHTML="<span>1936</span><span>1938</span><span>1940</span><span>1942</span><span>1944</span><span>1945</span>";
    const timeline=document.querySelector(".timeline-panel");
    timeline.querySelector(".stack").innerHTML=scenarios.map(p=>'<button type="button" class="chip" data-scenario="'+p[0]+'">'+p[1]+'</button>').join("");
    const views=document.createElement("div");views.className="view-toggle";
    views.innerHTML='<span class="small">Analysis view:</span><button class="chip active" id="view-pilot">Pilots / experience</button><button class="chip" id="view-equipment">Aircraft / material losses</button>';
    timeline.insertBefore(views,timeline.querySelector(".dual"));
    const note=document.createElement("p");note.id="preset-hint";note.className="view-mode-desc";
    timeline.appendChild(note);
    document.querySelector("#experience-chart").closest(".panel").querySelector(".chart-summary").textContent=
      "Experience percentages and the selected cohort, sampled from a force whose size changes each month.";
    document.querySelector("#experience-chart").closest(".panel").querySelector(".legend").innerHTML=
      '<span><b style="background:var(--teal)"></b>75+ encounters</span><span><b style="background:var(--blue)"></b>200+ encounters</span><span><b style="background:var(--gold)"></b>Tracked cohort remaining</span>';
    document.querySelector("#loss-chart").closest(".panel").querySelector(".chart-summary").textContent=
      "Monthly casualty share: source records Jan 1942–May 1944, modeled elsewhere. Includes killed, wounded and missing.";
    document.querySelector("#loss-chart").closest(".panel").querySelector(".legend").innerHTML=
      '<span><b style="background:var(--teal)"></b>Source-linked base</span><span><b style="background:var(--gold)"></b>Scenario segments</span>';
    const thead=$("ledger").closest(".panel").querySelector("thead");
    thead.innerHTML="<tr><th>Month</th><th>On duty</th><th>Strength basis</th><th>Casualty rate</th><th>Sim. casualty events</th><th>Tracked cohort active</th><th>Mean sorties</th><th>Median sorties</th><th>Mean encounters</th><th>Mean combat years</th><th>Mean claims</th><th>1+ claims</th><th>5+ claims</th><th>20+ claims</th></tr>";
    $("ledger").closest(".panel").querySelector("p.small").innerHTML=
      'Each month is sampled from a <strong>changing roster</strong>. A simulated casualty includes permanently absent pilots and some who later recover. New postings restore the target force where possible. Counts are not official history.';
    $("ace-grid").innerHTML=D.aces.map(a=>'<div class="ace-card"><h3>'+a.name+'</h3><div class="number">'+fmt(a.claims)+' claims</div><div class="small">'+(a.sorties?fmt(a.sorties)+" combat sorties":"Sorties: disputed / unverified")+'</div><small>'+a.from+' → '+a.to+' · '+a.theater+'</small><p class="tiny">'+a.note+'</p><a class="tiny" target="_blank" rel="noreferrer" href="'+a.url+'">'+a.evidence+' ↗</a></div>').join("");
    $("sources-grid").innerHTML=D.sources.map(s=>'<div class="info-card"><strong>'+s.label+' <span class="source-tag">'+s.kind+'</span></strong><p>'+s.why+'</p><p><a target="_blank" rel="noreferrer" href="'+s.url+'">Read source ↗</a></p></div>').join("");
    document.querySelector("footer").textContent="Luftwaffe Attrition Lab v3.0 · Evidence-first historical sensitivity model · July 1936–May 1945 · All computations run in your browser.";
    const fields=["force","tempo","customTempo","contact","risk","claims","loss","recovery","east","condor","spainTempo"];
    for(const id of fields)$(id).addEventListener("input",e=>{state[id]=Number(e.target.value);schedule();});
    for(const id of ["mode","cohort"])$(id).addEventListener("change",e=>{
      state[id]=e.target.value;
      // Never leave counterfactual control values visible as if they were
      // active historical-baseline parameters.
      if(id==="mode"&&state.mode==="baseline"){
        for(const k of ["force","tempo","customTempo","contact","risk","claims","loss","recovery","east","condor","spainTempo"])
          state[k]=base[k];
      }
      recompute();
    });
    for(const id of ["start","end"])$(id).addEventListener("input",e=>{
      if(id==="start")state.start=Math.min(+e.target.value,state.end);
      else state.end=Math.max(+e.target.value,state.start);
      render();persist();
    });
    timeline.querySelectorAll("[data-scenario]").forEach(el=>el.addEventListener("click",()=>{
      const p=scenarios.find(x=>x[0]===el.dataset.scenario);
      state.start=p[2];state.end=p[3];state.cohort=p[4];render();persist();
    }));
    $("view-pilot").addEventListener("click",()=>{state.view="pilot";render();persist();});
    $("view-equipment").addEventListener("click",()=>{state.view="equipment";render();persist();});
    $("reset").addEventListener("click",()=>{state={...base};recompute();});
    $("share").addEventListener("click",async()=>{
      persist();try{await navigator.clipboard.writeText(location.href);$("share").textContent="Copied!";
        setTimeout(()=>$("share").textContent="Copy scenario link",1600);}
      catch(err){window.prompt("Copy the scenario URL",location.href);}
    });
    $("export").addEventListener("click",exportCsv);
  }
  function meter(id,ratio,baselineText,quality){
    const level=ratio<70?"Very low":ratio<90?"Low":ratio<=110?"Working baseline":ratio<=140?"High":"Very high";
    const position=clamp((ratio-40)/160*100,0,100);
    const q=quality==="documented"?"Original wartime return":
      quality==="adjusted"?"Counterfactual adjustment to wartime return":
      quality==="derived"?"Derived from wartime return":
      quality==="constrained"?"Constrained by annual data":"Working estimate / scenario";
    const hasAnchor=["documented","adjusted","derived","constrained"].includes(quality);
    const stretch=hasAnchor?(ratio<65||ratio>145):(ratio<50||ratio>165);
    const near=hasAnchor?(ratio>=90&&ratio<=110):(ratio>=80&&ratio<=120);
    const grade=stretch?"Highly speculative":near?"Close to working assumption":"Plausible sensitivity only";
    const gradeClass=stretch?"meter-warning":near?"meter-near":"meter-stretch";
    const html='<div class="model-meter"><div class="meter-caption">'+
      '<strong>'+level+'</strong> relative to this period. '+baselineText+
      '</div><div class="meter-scale"><i></i><i></i><i></i><i></i><i></i></div>'+
      '<div style="height:10px;position:relative"><span style="position:absolute;left:calc('+position+
      '% - 5px);top:-6px;color:#f2e6bd;font-size:17px">▲</span></div>'+
      '<div class="meter-labels"><span>Very low</span><span>Low</span><span>Normal / working estimate</span><span>High</span><span>Very high</span></div>'+
      '<div class="evidence-line">Historical input basis (does not change when moving the slider): <b>'+q+'</b></div>'+
      '<div class="meter-grade '+gradeClass+'"><strong>Current slider assessment: '+grade+'.</strong> '+
      (stretch?'Far outside the local anchor range; test as an extreme counterfactual, not as a historical estimate.':
      near?'Near the selected modeling baseline; this is not proof the baseline was historically correct.':
      'Changes the modeled outcome. Specific independent historical validation is not available for this multiplier.')+
      '</div></div>';
    $(id+"-meter").innerHTML=html;
  }
  function controls(){
    $("cohort").value=state.cohort;$("mode").value=state.mode;
    const fields=["force","tempo","customTempo","contact","risk","claims","loss","recovery","east","condor","spainTempo"];
    fields.forEach(id=>{
      const e=$(id),value=state[id],disabled=state.mode==="baseline"||
        (state.mode==="custom"&&id==="tempo")||(state.mode!=="custom"&&id==="customTempo");
      e.disabled=disabled;e.value=value;
      const suffix=["force","tempo","contact","loss","recovery","east"].includes(id)?"%":
        ["risk","claims"].includes(id)?"×":"";
      $(id+"-v").textContent=fmt(value,id==="risk"||id==="claims"?1:0)+suffix;
    });
    const b0=D.pilots(state.start),b1=D.pilots(state.end);
    const forceRatio=state.mode==="baseline"?100:state.force;
    meter("force",forceRatio,
      "Monthly fighter-pilot roster baseline: "+fmt(b0.value)+" at start → "+fmt(b1.value)+
      " at end. Current projected: "+fmt(effectiveForce(state.start))+" → "+fmt(effectiveForce(state.end))+".",
      b1.quality);
    const t0=monthlyTempo(state.start),t1=monthlyTempo(state.end);
    const tempoRatio=state.mode==="baseline"?100:state.mode==="custom"?
      100*t0/Math.max(1,D.tempo(state.start).value):state.tempo;
    meter("tempo",tempoRatio,
      "Typical scenario tempo shifts from "+fmt(t0,1)+" → "+fmt(t1,1)+" sorties per deployed pilot/month. Not a measured force-wide average.",
      "model");
    meter("loss",state.mode==="baseline"?100:state.loss,
      "Losses are based on observed monthly fighter-pilot casualties only in Jan 1942–May 1944; elsewhere modeled.",
      state.mode!=="baseline"&&D.rate(state.end).quality==="documented"?"adjusted":D.rate(state.end).quality);
    $("risk-meter").innerHTML='<div class="model-meter"><strong>Assumption, not a measured historical multiplier</strong>'+
      '<p class="meter-caption">A newcomer currently has up to '+fmt(state.mode==="baseline"?3:state.risk,1)+
      '× the simulated hazard of an equally exposed veteran. The veteran benefit declines gradually with encounters and sorties; it is NOT applied as a fixed historical fact.</p></div>';
    const md=state.mode==="baseline"?"Baseline mode: tuning controls are locked to their displayed default assumptions. Select Sensitivity or Custom to test alternatives.":
      state.mode==="sensitivity"?"Sensitivity mode: percentages alter the complete historical/estimated timeline. Documented figures remain visible separately in the archive.":
      "Custom mode: monthly operational sorties are your absolute scenario choice (combat is still limited to deployed pilots).";
    document.querySelector(".controls > .small").textContent=md;
    $("start").value=state.start;$("end").value=state.end;
    $("range-label").textContent=D.label(state.start)+" → "+D.label(state.end);
    $("range-fill").style.left=100*state.start/106+"%";
    $("range-fill").style.width=100*(state.end-state.start)/106+"%";
    document.querySelectorAll("[data-scenario]").forEach(el=>{
      const s=scenarios.find(p=>p[0]===el.dataset.scenario);
      el.classList.toggle("active",s[2]===state.start&&s[3]===state.end&&s[4]===state.cohort);
    });
    $("preset-hint").textContent=
      state.cohort==="condor"?"Condor cohort selected: the period handles remain unlocked. Extend the right handle to May 1945 to follow Spanish veterans into WWII.":
      state.cohort==="bob"?"Battle of Britain pilots selected: extend the right handle to study their later frontline retention. This cohort is simulated, not a named historical roster.":
      "Track the original selected-date roster or choose a named wartime cohort. Scenarios change the time interval and tracked group, not the definition of death.";
  }
  function plot(id,rows,series,opts={}){
    const el=$(id);if(!el)return;
    if(!rows.length){el.innerHTML="";return;}
    const W=600,H=260,L=52,R=18,T=12,B=34,h=H-T-B,w=W-L-R;
    const vals=series.flatMap(s=>rows.map(r=>s.f(r)).filter(Number.isFinite));
    const top=opts.max||Math.max(1,...vals)*1.10;
    const X=j=>L+w*(rows.length===1?.5:j/(rows.length-1));
    const Y=v=>T+h*(1-v/top);
    let html="";
    for(let k=0;k<=4;k++){
      const v=top*k/4,y=Y(v);
      html+='<line class="gridline" x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'"/>'+
        '<text x="'+(L-8)+'" y="'+(y+4)+'" text-anchor="end">'+fmt(v,opts.decimals??0)+(opts.percent?"%":"")+'</text>';
    }
    const ticks=Math.min(rows.length,6);
    for(let k=0;k<ticks;k++){
      const j=Math.round(k*(rows.length-1)/Math.max(1,ticks-1));
      html+='<text x="'+X(j)+'" y="'+(H-7)+'" text-anchor="middle">'+rows[j].month.replace(" "," ’")+'</text>';
    }
    for(const s of series){
      let path="",started=false;
      for(let k=0;k<rows.length;k++){
        const v=s.f(rows[k]);
        if(!Number.isFinite(v)){started=false;continue;}
        path+=(started?"L":"M")+X(k).toFixed(1)+" "+Y(v).toFixed(1)+" ";
        started=true;
      }
      if(path)html+='<path class="line" stroke="'+s.color+'" d="'+path+'"/>';
      if(rows.length<15)for(let k=0;k<rows.length;k++){
        const v=s.f(rows[k]);if(Number.isFinite(v))
          html+='<circle fill="'+s.color+'" r="3" cx="'+X(k)+'" cy="'+Y(v)+'"/>';
      }
    }
    el.innerHTML=html;
    // The website layer enhances the original SVG with a keyboard-accessible
    // nearest-month tooltip. Keep raw counts and model metadata for inspection.
    (window.AirWarGraphRegistry??=new Map()).set(id,{rows,series,opts,origin:'simulator'});
    window.AirWarAtlasV5?.enhance(id);
  }
  function pilotView(){
    const c=collect(),last=c.series[c.series.length-1],n=c.end.count||1;
    $("stat-context").innerHTML=fmt(c.series.length)+" months · Active day-fighter pilot positions change from "+
      fmt(c.start.count)+" to "+fmt(c.end.count)+". "+"<strong>"+namedCohorts[state.cohort]+"</strong> is the tracked group. "+
      "Active does not mean alive; a casualty does not necessarily mean killed.";
    const stats=[
      ["Cohort still on active duty",c.denominator?pc(100*c.endCohort/c.denominator):"N/A",
        fmt(c.endCohort)+" / "+fmt(c.denominator)+" modeled members","var(--gold)"],
      ["Current pilots with 75+ encounters",pc(100*c.end.experienced75/n),
        fmt(c.end.experienced75)+" current experienced pilots","var(--teal)"],
      ["Pilots with 5+ attributed claims",pc(100*c.end.claim5/n),
        fmt(c.end.claim5)+" pilots; victory claims ≠ verified enemy losses","var(--purple)"],
      ["Recorded pilot-force loss baseline",pc(100*D.rate(state.end).value),
        D.rate(state.end).quality==="documented"?"Reported period casualty share":"Model assumption, not observed count","var(--blue)"]
    ];
    $("stats").innerHTML=stats.map(s=>'<div class="stat" style="border-top:3px solid '+s[3]+'">'+
      '<div class="value">'+s[1]+'</div><div class="label">'+s[0]+'</div><div class="delta">'+s[2]+'</div></div>').join("");
    plot("experience-chart",c.series,[
      {f:r=>r.ex75,color:"#48d3c5"},{f:r=>r.ex200,color:"#82b9ff"},{f:r=>r.cohortPct,color:"#f4c46a"}
    ],{percent:true,max:100});
    plot("claims-chart",c.series,[
      {f:r=>r.c1,color:"#8bdd9e"},{f:r=>r.c5,color:"#b89cfb"},{f:r=>r.c20,color:"#fa7b81"}
    ],{percent:true,max:100});
    plot("service-chart",c.series,[
      {f:r=>r.meanSorties,color:"#48d3c5"},{f:r=>r.medianSorties,color:"#f4c46a"}
    ]);
    plot("loss-chart",c.series,[{f:r=>100*r.lossRate,color:"#48d3c5"}],
      {percent:true,max:Math.max(28,...c.series.map(r=>100*r.lossRate))*1.08});
    plot("cohort-chart",c.series,[{f:r=>r.cohortPct,color:"#f4c46a"}],{percent:true,max:100});
    plot("force-chart",c.series,[
      {f:r=>r.count,color:"#48d3c5"},{f:r=>D.pilots(r.i).value,color:"#82b9ff"}
    ]);
    const title=state.cohort==="period"?
      "The group is defined as pilots serving just before "+D.label(state.start)+".":
      "The group is defined by qualifying for the "+namedCohorts[state.cohort]+" scenario, not by complete surviving personnel lists.";
    const record=c.start.count===0?"":fmt(c.start.count)+" fighters were serving at the selected period start.";
    $("cohort-description").innerHTML='<strong>'+namedCohorts[state.cohort]+'</strong>: '+title+" "+
      record+" The simulated cohort has "+fmt(c.denominator)+" members identified across the modeled war, and "+
      fmt(c.endCohort)+" remain in frontline service in "+D.label(state.end)+
      ". Missing from the frontline may mean casualty, injury, captivity or transfer—not necessarily death.";
    const cards=[
      ["Zero credited claims",c.end.claim0,"var(--muted)"],
      ["1–4 credited claims",c.end.claim1to4,"var(--green)"],
      ["5–19 credited claims",c.end.claim5to19,"var(--purple)"],
      ["20+ credited claims",c.end.claim20plus,"var(--gold)"],
      ["Mean / median combat years",fmt(c.end.meanService,1)+" / "+fmt(c.end.medianService,1),"var(--teal)",true],
      ["Mean / median sorties",fmt(c.end.meanSorties)+" / "+fmt(c.end.medianSorties),"var(--blue)",true]
    ];
    $("distribution").innerHTML=cards.map(b=>'<div class="info-card" style="border-color:'+b[2]+'">'+
      '<strong>'+b[0]+'</strong><div style="font-size:23px;font-weight:850">'+(b[3]?b[1]:fmt(b[1])+
      ' <span class="small">('+pc(100*b[1]/n)+')</span>')+'</div></div>').join("");
    $("ledger").innerHTML=c.series.map(r=>{
    const quality=r.rateQuality==="documented"?"source":"model";
      return '<tr><td>'+r.month+' <span class="source-tag '+(quality==="model"?"estimate-tag":"")+'">'+quality+'</span></td>'+
        '<td>'+fmt(r.count)+'</td><td>'+r.strengthAnchor.quality+'</td><td>'+pc(100*r.lossRate)+'</td>'+
        '<td>'+fmt(r.actualLoss)+'</td><td>'+fmt(r.cohort)+'</td><td>'+fmt(r.meanSorties)+'</td>'+
        '<td>'+fmt(r.medianSorties)+'</td><td>'+fmt(r.meanEncounters)+'</td>'+
        '<td>'+fmt(r.meanService,2)+'</td><td>'+fmt(r.meanClaims,2)+'</td>'+
        '<td>'+fmt(r.claim1)+'</td><td>'+fmt(r.claim5)+'</td><td>'+fmt(r.claim20)+'</td></tr>';
    }).join("");
  }
  function equipmentView(){
    const start=state.start,end=state.end;
    const rows=[];
    for(let i=start;i<=end;i++){
      const a=D.aircraft(i),p=D.production(i),w=D.writeoffs(i);
      rows.push({i,month:D.label(i),aircraft:a.value,aq:a.quality,
        accepted:p.value,pq:p.quality,productionDefinition:p.definition,
        writtenOff:w.value,wq:w.quality,wNote:w.note});
    }
    const first=rows[0],last=rows[rows.length-1];
    $("equipment-intro").innerHTML=
      "Showing "+D.label(start)+"–"+D.label(end)+
      ". This line reconstructs the <strong>serviceable single-engine fighter aircraft</strong> series, not all Luftwaffe aircraft and not the number of pilots. Original period aircraft strength may not correspond to the same reporting category at every anchor.";
    const numbers=[
      ["Fighters ready · selected start",fmt(first.aircraft),first.aq==="documented"?"RAF AHB VII/107 source return":first.aq+" / not directly observed"],
      ["Fighters ready · selected end",fmt(last.aircraft),last.aq==="documented"?"RAF AHB VII/107 source return":last.aq+" / not directly observed"],
      ["1944 single-engine acceptances",fmt(D.acceptances44.reduce((a,b)=>a+b,0)),"official USAAF wartime history"],
      ["1944 fighter write-offs","≈8,500","USAAF estimate; year total, not per month"]
    ];
    $("equipment-stats").innerHTML=numbers.map(n=>'<div class="month-tile"><div class="n">'+n[1]+
      '</div><div class="label">'+n[0]+'</div><p class="tiny">'+n[2]+'</p></div>').join("");
    plot("aircraft-chart",rows,[{f:r=>r.aircraft,color:"#48d3c5"}]);
    plot("production-chart",rows,[
      {f:r=>Number.isFinite(r.accepted)?r.accepted:NaN,color:"#82b9ff"},
      {f:r=>Number.isFinite(r.writtenOff)?r.writtenOff:NaN,color:"#f4c46a"}
    ]);
    const labels="<div class=\"model-key\"><span><b style=\"background:#82b9ff\"></b>Production / acceptances (recorded)</span><span><b style=\"background:#f4c46a\"></b>Written off (derived/allocated)</span></div>";
    const elem=$("production-chart").nextElementSibling;
    if(elem&&!elem.querySelector(".model-key"))elem.insertAdjacentHTML("afterend",labels);
    $("equipment-ledger").innerHTML=rows.map(r=>'<tr><td>'+r.month+'</td>'+
      '<td>'+fmt(r.aircraft)+'</td><td><span title="'+(r.aq==="documented"?"Original German Quartermaster RAF VII/107 source checkpoint":r.aq==="interpolated"?"Between source checkpoints, not an exact return":"Explicit non-source model assumption")+'" class="source-tag '+(r.aq==="documented"?"":"estimate-tag")+'">'+(r.aq==="documented"?"SOURCE — serviceable":r.aq==="interpolated"?"INTERPOLATED":"MODEL")+'</span></td>'+
      '<td>'+(r.accepted===null?"—":fmt(r.accepted))+'</td>'+
      '<td class="small">'+(r.productionDefinition||"—")+'</td>'+ 
      '<td>'+(r.writtenOff===null?"—":fmt(r.writtenOff))+'</td>'+
      '<td><span title="'+r.wNote+'" class="source-tag '+(r.wq==="unavailable"?"":"estimate-tag")+'">'+r.wq+'</span></td></tr>').join("");
    const overlaps=(from,to)=>D.idx(to,11)>=start&&D.idx(from,0)<=end;
    // Type dates are approximate broad availability windows, NOT proof of combat participation in a selected month.
    const renderType=(x,german)=>'<div class="info-card" style="border-color:'+(german?"var(--teal)":"var(--gold)")+'">'+
      '<strong>'+x[0]+'</strong> <span class="top-badge '+(german?"":"estimate")+'">'+x[1]+'–'+x[2]+'</span>'+
      '<p>'+x[3]+'. '+x[4]+'</p>'+((D.sources.find(y=>y.id===x[5]))?
        '<a class="tiny" href="'+D.sources.find(y=>y.id===x[5]).url+'" target="_blank" rel="noreferrer">Source context ↗</a>':'')+'</div>';
    const ger=D.germanTypes.filter(x=>overlaps(x[1],x[2]));
    const ally=D.alliedTypes.filter(x=>overlaps(x[1],x[2]));
    $("german-types").innerHTML=ger.map(x=>renderType(x,true)).join("")||'<p class="small">No catalogued combat fighter models for this selection.</p>';
    $("allied-types").innerHTML=ally.map(x=>renderType(x,false)).join("")||'<p class="small">No catalogued opposing fighter models for this selection.</p>';
    const cases=D.lossCauseCases.filter(x=>x.from<=end&&x.to>=start);
    $("cause-cases").innerHTML=cases.map(c=>{
      const total=c.combat+c.operationalOther+(c.groundOther||0),combatPc=100*c.combat/total,
        opPc=100*c.operationalOther/total,groundPc=100*(c.groundOther||0)/total;
      return '<div class="info-card cause-card"><h3>'+c.period+'</h3><p class="small">'+c.population+'</p>'+ 
        '<div class="causes-stack"><span style="width:'+combatPc+'%;background:var(--red)"></span>'+ 
        '<span style="width:'+opPc+'%;background:var(--gold)"></span>'+ 
        '<span style="width:'+groundPc+'%;background:var(--blue)"></span></div>'+ 
        '<div class="small"><b style="color:var(--red)">'+fmt(c.combat)+' enemy action ('+pc(combatPc)+')</b></div>'+ 
        '<div class="small"><b style="color:var(--gold)">'+fmt(c.operationalOther)+' other causes ('+pc(opPc)+')</b></div>'+ 
        (c.groundOther===null?'':'<div class="small"><b style="color:var(--blue)">'+fmt(c.groundOther)+' destroyed off operations ('+pc(groundPc)+')</b></div>')+
        '<p class="tiny">'+c.caution+'</p><a class="tiny" href="'+c.url+'" target="_blank" rel="noreferrer">'+c.source+' ↗</a></div>';
    }).join("")||'<p class="small">No verified comparable fighter-loss breakdown is loaded for the selected dates. Select July–September 1940 or 1941 to see directly sourced cause comparisons; the 1944 annual write-off estimate is shown separately above.</p>';
    const archives=D.rafArchive.filter(x=>x.from<=end&&x.to>=start);
    $("raf-reports").innerHTML=archives.map(x=>'<div class="info-card"><span class="source-tag">'+x.ref+'</span>'+ 
      '<strong> '+x.area+'</strong><p class="small">'+x.title+'</p>'+ 
      '<a href="'+x.url+'" target="_blank" rel="noreferrer">Read primary return ↗</a></div>').join("")||
      '<p class="small">No digitized matching report from this curated subset. The RAF archive contains additional reports by region and date; see the research source links below.</p>';
  }
  function render(){
    if(!snapshots.length)return;
    controls();
    document.querySelectorAll(".pilot-only").forEach(el=>el.classList.toggle("hidden",state.view!=="pilot"));
    $("equipment-section").classList.toggle("hidden",state.view!=="equipment");
    $("view-pilot").classList.toggle("active",state.view==="pilot");
    $("view-equipment").classList.toggle("active",state.view==="equipment");
    if(state.view==="pilot")pilotView();else equipmentView();
  }
  function schedule(){
    clearTimeout(timer);timer=setTimeout(recompute,130);
    controls();
  }
  function recompute(){
    if(recomputing)return;
    recomputing=true;
    try{snapshots=simulate();render();persist();}
    finally{recomputing=false;}
  }
  function persist(){
    try{
      const url=new URL(location.href);
      url.hash="v3="+encodeURIComponent(btoa(JSON.stringify(state)));
      window.history.replaceState(null,"",url);
    }catch(err){/* A restrictive browser might disallow history updates. */}
  }
  function restore(){
    try{
      const raw=location.hash.match(/^#v3=(.*)$/);if(!raw)return;
      const s=JSON.parse(atob(decodeURIComponent(raw[1])));
      for(const [key,value] of Object.entries(s)){
        if(!(key in base))continue;
        if(typeof value!==typeof base[key])continue;
        state[key]=value;
      }
      state.start=clamp(Math.round(state.start),0,106);
      state.end=clamp(Math.round(state.end),state.start,106);
      if(!["baseline","sensitivity","custom"].includes(state.mode))state.mode="baseline";
      if(!["pilot","equipment"].includes(state.view))state.view="pilot";
      if(!(state.cohort in namedCohorts))state.cohort="period";
      state.force=clamp(state.force,40,160);state.tempo=clamp(state.tempo,40,200);
      state.contact=clamp(state.contact,30,170);state.loss=clamp(state.loss,50,150);
      state.condor=clamp(Math.round(state.condor),200,380);
    }catch(err){state={...base};}
  }
  function exportCsv(){
    const c=collect(),pilotKeys=["month","i","count","rateQuality","lossRate","actualLoss","cumLoss",
      "permanent","returned","transfers","cohort","meanSorties","medianSorties","meanEncounters",
      "medianEncounters","meanClaims","medianClaims","meanService","claim1","claim5","claim20",
      "experienced75","experienced200"];
    const equipmentKeys=["month","i","aircraft","aq","accepted","pq","writtenOff","wq"];
    const rows=state.view==="pilot"?c.series:()=>{
      const a=[];for(let i=state.start;i<=state.end;i++){
        const ac=D.aircraft(i),p=D.production(i),w=D.writeoffs(i);
        a.push({i,month:D.label(i),aircraft:ac.value,aq:ac.quality,
          accepted:p.value,pq:p.quality,writtenOff:w.value,wq:w.quality});
      }return a;
    };
    const records=typeof rows==="function"?rows():rows,keys=state.view==="pilot"?pilotKeys:equipmentKeys;
    const csv=[keys.join(","),...records.map(r=>keys.map(k=>{
      let v=r[k];if(v===undefined||v===null)v="";
      return JSON.stringify(v);
    }).join(","))].join("\n");
    const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;
    a.download="luftwaffe-"+state.view+"-"+D.label(state.start).replace(" ","-")+"-to-"+D.label(state.end).replace(" ","-")+".csv";
    a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  // Development / QA invariants. These are available read-only to the browser console.
  function diagnostics(){
    const projected1943=[];
    for(let m=0;m<12;m++)projected1943.push(D.pilots(D.idx(1943,m)).value);
    return {months:snapshots.length-1,first:D.label(0),last:D.label(106),
      baseline1943PilotAverage:mean(projected1943,x=>x),
      writtenOff1944:Math.round(Array.from({length:12},(_,m)=>D.writeoffs(D.idx(1944,m)).value).reduce((a,b)=>a+b,0)),
      sourceLossSepDec1943: D.pilotCasualties43.reduce((a,x)=>a+x[1],0),
      sourcedFullYearPilotCasualties1943:2967,
      simulatedPilotCasualtyEvents:snapshots[snapshots.length-1].cumLoss,
      modeledPilotsEverEntered:registry.length,
      condorEverTagged:registry.filter(p=>p.tag.condor).length,
      startRoster:snapshots[1].count,endRoster:snapshots[snapshots.length-1].count};
  }
  window.LuftLabQA={diagnostics,history:()=>snapshots.map(x=>({month:x.month,count:x.count,loss:x.actualLoss})),
    inspect:()=>({...state})};
  init();restore();recompute();
})();
