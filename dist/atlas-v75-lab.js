/* v7.5 source-conscious simulation labs. Physics is explicitly an illustrative engineering sandbox, NOT validated aircraft reconstruction. */
(function(){
'use strict';
const g=9.80665, rho0=1.225, hpW=745.699872;
const S={force:'RAF',compare:'none',startPilots:1000,tempo:22,replacements:110,lossPerThousand:5,rookieMultiplier:1.65,recovery:20,comparisonRisk:1.25,advanced:false,altitude:4000,engineMode:'military',fuelPercent:60,pilotG:6};
const forces=[['RAF','RAF Fighter Command / fighters'],['Luftwaffe','Luftwaffe fighter pilots'],['USAAF','USAAF fighter pilots'],['VVS','Soviet VVS fighter pilots']];
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pretty=(n,d=0)=>Number.isFinite(n)?n.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d}):'—';
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const group=(n,sorties,original)=>({n,sorties,original});
function pilotModel({initial=1000,months=12,tempo=22,replacements=110,lossPerThousand=5,rookieMultiplier=1.65,recovery=20}={}){
  initial=clamp(initial,100,20000);months=clamp(Math.floor(months),1,110);tempo=clamp(tempo,0,100);
  replacements=clamp(replacements,0,10000);lossPerThousand=clamp(lossPerThousand,0,50);
  rookieMultiplier=clamp(rookieMultiplier,1,4);recovery=clamp(recovery,0,90);
  let pilots=[group(initial*.25,5,true),group(initial*.5,55,true),group(initial*.25,175,true)];
  const pending=[],outputs=[],lostPermanent={n:0},entered={n:initial};
  const snapshot=(period,flows)=>{const active=pilots.reduce((s,p)=>s+p.n,0),rec=pending.reduce((s,p)=>s+p.n,0),
    original=pilots.filter(p=>p.original).reduce((s,p)=>s+p.n,0),
    rookie=pilots.filter(p=>p.sorties<30).reduce((s,p)=>s+p.n,0),
    experienced=pilots.filter(p=>p.sorties>=30&&p.sorties<120).reduce((s,p)=>s+p.n,0),
    veteran=pilots.filter(p=>p.sorties>=120).reduce((s,p)=>s+p.n,0),
    conservation=entered.n-(active+rec+lostPermanent.n);
    return {month:period,active,original,recovering:rec,rookie,experienced,veteran,departed:lostPermanent.n,entered:entered.n,conservation,...flows};};
  outputs.push(snapshot(0,{arrivals:0,losses:0,returned:0}));
  for(let m=1;m<=months;m++){
    let returned=0;
    for(let k=pending.length-1;k>=0;k--)if(pending[k].due<=m){
      const p=pending.splice(k,1)[0];pilots.push(group(p.n,p.sorties,p.original));returned+=p.n;
    }
    let leaves=0;
    for(const p of pilots){
      const multiplier=p.sorties<30?rookieMultiplier:p.sorties<120?1:.70;
      const hazard=1-Math.exp(-tempo*lossPerThousand/1000*multiplier);
      const lost=p.n*hazard,temporary=lost*recovery/100,permanent=lost-temporary;
      p.n-=lost;p.sorties+=tempo;leaves+=lost;lostPermanent.n+=permanent;
      if(temporary>0)pending.push({...p,n:temporary,due:m+2});
    }
    pilots.push(group(replacements,0,false));entered.n+=replacements;
    // Recombine cohorts by original-status and 10-sortie experience bands.
    // This preserves pilot mass and bounds the runtime for long periods.
    const bucket=new Map();
    for(const c of pilots){
      const key=(c.original?'original':'new')+'|'+Math.floor(c.sorties/10);
      const known=bucket.get(key);
      if(known){known.sorties=(known.sorties*known.n+c.sorties*c.n)/(known.n+c.n);known.n+=c.n;}
      else bucket.set(key,{...c});
    }
    pilots=[...bucket.values()];
    outputs.push(snapshot(m,{arrivals:replacements,losses:leaves,returned}));
  }
  return outputs;
}
const presetAircraft={
  single:{name:'Single-stage supercharged reference',kind:'Single-speed / illustrative',powerHP:1280,criticalM:4800,emptyKg:2500,fuelKg:360,ammunitionKg:180,wingM2:22.5,cd0:.027,k:.052,propEff:.79,clMax:1.48,structureG:6.5,mapInHg:46},
  turbo:{name:'Turbocharged reference',kind:'Turbo / illustrative',powerHP:2000,criticalM:7500,emptyKg:3900,fuelKg:600,ammunitionKg:300,wingM2:27.8,cd0:.027,k:.050,propEff:.81,clMax:1.58,structureG:6.0,mapInHg:49}
};
function density(h){h=clamp(h,0,11000);return rho0*Math.pow(1-2.25577e-5*h,4.2559);}
const modeRatio={continuous:.82,military:1,emergency:1.10};
function aircraftAt(plane,h,mode='military',fuel=60,pilotG=6,tas=135){
 const rho=density(h),critical=clamp(plane.criticalM-(modeRatio[mode]-1)*2300,3000,9500);
 const compressor=h<=critical?1:Math.pow(density(h)/density(critical),.92);
 const pressure=plane.mapInHg*modeRatio[mode]*compressor;
 const shaftHP=plane.powerHP*modeRatio[mode]*compressor;
 const weightKg=plane.emptyKg+plane.ammunitionKg+plane.fuelKg*clamp(fuel,0,100)/100;
 const massN=weightKg*g,v=clamp(tas,30,300),q=.5*rho*v*v,S=plane.wingM2;
 const dragPar=q*S*plane.cd0,induced=2*plane.k*massN*massN/(rho*v*v*S);
 const pAvail=shaftHP*hpW*plane.propEff;
 const ps=(pAvail-(dragPar+induced)*v)/massN;
 const nStall=q*S*plane.clMax/massN;
 const nInst=Math.min(nStall,plane.structureG,clamp(pilotG,2,10));
 const dAllowed=pAvail/v;
 const nPowerSq=Math.max(0,(dAllowed-dragPar)*rho*v*v*S/(2*plane.k*massN*massN));
 const nSust=Math.min(nInst,Math.sqrt(nPowerSq));
 const degreesPerS=n=>n>=1?(180/Math.PI)*g*Math.sqrt(n*n-1)/v:0;
 return {h,rho,shaftHP,pressure,critical,weightKg,pAvail,pRequired:(dragPar+induced)*v,dragPar,dragInduced:induced,ps,nInst:nInst>=1?nInst:0,nSust:nSust>=1?nSust:0,instant:degreesPerS(nInst),sustained:degreesPerS(nSust),ias:v*Math.sqrt(rho/rho0)*3.6,tas:v*3.6,valid:nInst>=1};
}
function envelope(plane,h,mode,fuel,gcap){
 const samples=[];for(let v=42;v<=275;v+=2)samples.push(aircraftAt(plane,h,mode,fuel,gcap,v));
 const flying=samples.filter(x=>x.valid&&x.ps>=0);
 const fastest=flying.at(-1)||null;const best=flying.reduce((b,x)=>!b||x.ps>b.ps?x:b,null);
 const sustained=samples.reduce((b,x)=>!b||x.sustained>b.sustained?x:b,null);
 return {fast:fastest?.tas??null,climb:Math.max(0,best?.ps??0),sustain:sustained?.sustained??null,hp:aircraftAt(plane,h,mode,fuel,gcap,135).shaftHP};
}
const select=(id,label,options,value)=>'<label class="v75-lab-label">'+esc(label)+'<select id="'+id+'">'+options.map(([v,t])=>'<option value="'+esc(v)+'"'+(String(v)===String(value)?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>';
const slider=(id,label,min,max,step,value,suffix='')=>'<label class="v75-lab-label"><span>'+esc(label)+' <b>'+pretty(value,1)+esc(suffix)+'</b></span><input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'"></label>';
const pane=(name,content)=>'<section class="v75-panel"><h3>'+esc(name)+'</h3>'+content+'</section>';
const intro=(title,lead)=>'<div class="v75-intro"><span class="kicker">SCENARIO LAB · NOT OBSERVED HISTORY</span><h2>'+esc(title)+'</h2><p>'+esc(lead)+'</p></div>';
function pilotView(ctx){
 const length=ctx.period.range.length,base=pilotModel({initial:S.startPilots,months:length,tempo:S.tempo,replacements:S.replacements,lossPerThousand:S.lossPerThousand,rookieMultiplier:S.rookieMultiplier,recovery:S.recovery});
 const comp=S.compare!=='none'?pilotModel({initial:S.startPilots,months:length,tempo:S.tempo,replacements:S.replacements,lossPerThousand:S.lossPerThousand*S.comparisonRisk,rookieMultiplier:S.rookieMultiplier,recovery:S.recovery}):null;
 const plotted=base.map((x,k)=>({...x,i:ctx.period.range[0]+Math.max(0,k-1),label:k?ctx.D.label(ctx.period.range[k-1]):'Start',comparison:comp?.[k]?.active??null}));
 const last=base.at(-1),other=comp?.at(-1),sumLoss=last.departed;
 const summary='<div class="v75-statrow">'+
  '<div class="v75-stat"><strong>'+pretty(last.active)+'</strong><span>Active pilots · end</span><small>Model expectation, not recorded</small></div>'+
  '<div class="v75-stat"><strong>'+pretty(last.original)+'</strong><span>Original cohort still active</span><small>Not the number known alive</small></div>'+
  '<div class="v75-stat"><strong>'+pretty(sumLoss)+'</strong><span>Cumulative permanent departures</span><small>Not equivalent to fatalities</small></div>'+
  '<div class="v75-stat"><strong>'+pretty(last.recovering)+'</strong><span>Temporarily unavailable</span><small>Two-month recovery assumption</small></div></div>';
 const rates=ctx.chart('v75-lab-population',plotted,[{name:'Chosen force · illustrative active pilots',color:'#a4cab3',value:r=>r.active},
 ...(comp?[{name:'Comparator · higher hypothetical risk',color:'#e0b277',value:r=>r.comparison}]:[])]);
 const orig=ctx.chart('v75-lab-originals',plotted,[{name:'Original starting cohort · active',color:'#d9af85',value:r=>r.original}]);
 const classes=[['New (<30 modeled sorties)',last.rookie,'#98b5a0'],['Experienced (30–119)',last.experienced,'#d5bc7b'],['Veterans (120+)',last.veteran,'#c58e78']];
 const experience='<div class="v75-composition">'+classes.map(([label,n,color])=>'<div><span>'+esc(label)+'</span><div><i style="width:'+clamp(100*n/Math.max(1,last.active),0,100).toFixed(1)+'%;background:'+color+'"></i></div><b>'+pretty(n)+'</b></div>').join('')+'</div>';
 const evidence=window.AirWarV75Evidence,rafPoint=evidence?.rafPilots.find(p=>p.date==='1940-06-30');
 const historic=ctx.period.range.includes(ctx.D.idx(1940,5))?'<p>For context, the secondary-transcribed RAF Fighter Command return records <strong>'+pretty(rafPoint?.operational)+'</strong> operational pilots on 30 June 1940, from a different reporting population than this model. <a href="'+esc(evidence.source_index.bow_pilots_secondary.url)+'" target="_blank" rel="noopener noreferrer">View original citation trail</a>.</p>':'<p>This scenario uses no nation-calibrated attrition hazard for the selected period. Open Pilots & Experience for the available measured pilot returns.</p>';
 return intro('Pilot Simulator','A transparent population experiment: replacements and experience can move in opposite directions. RAF, Luftwaffe, USAAF and VVS labels set research context, not invented national loss probabilities.')+
  '<div class="v75-lab-controls">'+select('v75-force','Chosen fighter force',forces,S.force)+select('v75-compare','Optional comparison', [['none','No comparison'],...forces.filter(x=>x[0]!==S.force)],S.compare)+
  slider('v75-initial','Starting active pilots · scenario',200,5000,100,S.startPilots)+
  slider('v75-tempo','Sorties per active pilot / month',5,50,1,S.tempo)+
  slider('v75-arrivals','New frontline arrivals / month',0,300,10,S.replacements)+
  slider('v75-risk','Departures per 1,000 pilot-sorties · illustrative',1,15,.5,S.lossPerThousand)+'</div>'+
  '<details class="v75-details"><summary>Advanced model assumptions</summary><div class="v75-details-body v75-lab-controls">'+
  slider('v75-rookie','Rookie loss-risk multiplier',1,3,.05,S.rookieMultiplier,'×')+
  slider('v75-recovery','Temporarily unavailable share of losses',0,50,5,S.recovery,'%')+
  (comp?slider('v75-comparison-risk','Comparison risk multiplier · hypothetical',.5,2.5,.05,S.comparisonRisk,'×'):'')+
  '<p class="v75-caption">The model uses an expected-value cohort process. Temporary removals recover after two modeled months. Loss-risk multipliers, experience thresholds and arrival rates are adjustable assumptions, not air-force-specific observations.</p></div></details>'+
  summary+pane('Operational pilot population · source-neutral scenario',rates+'<p class="v75-caption">Every value shown above is a scenario calculation. Comparing two differently named air forces does not establish a historical advantage.</p>')+
  pane('Original cohort still serving',orig+'<p class="v75-caption">Pilots temporarily absent, missing, reassigned or retired cannot be equated with confirmed deaths.</p>')+
  pane('Experience composition · scenario end',experience)+
  pane('Historical anchor and uncertainty',historic+'<p class="v75-caption">Population accounting conserves original pilots + new arrivals = active + recovering + permanently departed. The model is deterministic and repeatable.</p>');
}
function signedEnergyPlot(rows){
 const W=940,H=290,L=65,R=24,T=20,B=43;
 const values=rows.flatMap(r=>[r.ap,r.bp]).filter(Number.isFinite);
 const abs=Math.max(1,...values.map(Math.abs))*1.08;
 const px=i=>L+i*(W-L-R)/(rows.length-1),py=v=>T+(H-T-B)*(.5-v/(2*abs));
 const line=k=>rows.map((r,i)=>px(i).toFixed(1)+','+py(r[k]).toFixed(1)).join(' ');
 const axis='<line x1="'+L+'" y1="'+py(0)+'" x2="'+(W-R)+'" y2="'+py(0)+'" stroke="#dbc498" stroke-width="1.8" stroke-dasharray="6 5"/>';
 const captions=[0,Math.floor((rows.length-1)/2),rows.length-1].map(i=>'<text x="'+px(i)+'" y="'+(H-10)+'" text-anchor="middle" fill="#d3dfd2" font-size="14">'+esc(rows[i].label)+'</text>').join('');
 return '<div class="v75-signed-chart"><svg role="img" aria-label="Illustrative specific excess power versus true airspeed, including negative energy regions" viewBox="0 0 '+W+' '+H+'" width="100%">'+axis+
 '<text x="10" y="'+(T+14)+'" font-size="13" fill="#e4cfa9">+'+pretty(abs,1)+'</text>'+
 '<text x="24" y="'+(py(0)-7)+'" font-size="13" fill="#f1e0ad">0</text>'+
 '<text x="10" y="'+(H-B-5)+'" font-size="13" fill="#e4cfa9">-'+pretty(abs,1)+'</text>'+
 '<polyline points="'+line('ap')+'" stroke="#a4c9ad" stroke-width="2.6" fill="none"/>'+
 '<polyline points="'+line('bp')+'" stroke="#d5ac7c" stroke-width="2.6" fill="none"/>'+captions+'</svg>'+
 '<div class="v75-evidence-legend"><span>Green: supercharger reference</span><span>Gold: turbo reference</span><span>Dashed: zero excess power</span></div></div>';
}
function aircraftView(ctx){
 const a=presetAircraft.single,b=presetAircraft.turbo;
 const h=S.altitude,mode=S.engineMode,f=S.fuelPercent,cap=S.pilotG;
 const as=aircraftAt(a,h,mode,f,cap),bs=aircraftAt(b,h,mode,f,cap);
 const rows=Array.from({length:19},(_,i)=>({h:i*500,label:pretty(i*500)+' m',
  aa:envelope(a,i*500,mode,f,cap),bb:envelope(b,i*500,mode,f,cap)}));
 const speed=rows.map(x=>({label:x.label,a:x.aa.fast,b:x.bb.fast}));
 const climbs=rows.map(x=>({label:x.label,a:x.aa.climb,b:x.bb.climb}));
 const power=rows.map(x=>({label:x.label,a:x.aa.hp,b:x.bb.hp}));
 const turns=Array.from({length:18},(_,i)=>{const v=65+i*10;
  const pa=aircraftAt(a,h,mode,f,cap,v),pb=aircraftAt(b,h,mode,f,cap,v);
  return {label:pretty(v*3.6)+' km/h',as:pa.sustained,ai:pa.instant,bs:pb.sustained,bi:pb.instant,ap:pa.ps,bp:pb.ps};});
 const graph=(id,points,series,caption)=>ctx.chart(id,points,series)+'<p class="v75-caption">'+caption+'</p>';
 const math='<p><code>ρ(h) = ISA troposphere density</code></p><p><code>P_available = shaft power(h, boost) × assumed propeller efficiency</code></p>'+
  '<p><code>D = ½ρV²SCd₀ + 2k(nW)²/(ρV²S)</code></p>'+
  '<p><code>P_s = (P_available − D×V) / W</code></p>'+
  '<p>Level sustained turn requires P_s ≥ 0; instantaneous turn is separately capped by assumed CLmax, airframe structural and pilot limits. IAS and TAS are kept distinct.</p>';
 const compact=(p,x)=>'<div class="v75-air-spec"><strong>'+esc(p.name)+'</strong><small>'+esc(p.kind)+'</small><div><span>Effective boost (inHg)</span><b>'+pretty(x.pressure,1)+'</b></div><div><span>Shaft power at altitude</span><b>'+pretty(x.shaftHP)+' hp</b></div><div><span>Mass at combat entry</span><b>'+pretty(x.weightKg)+' kg</b></div><div><span>Critical altitude (model)</span><b>'+pretty(x.critical)+' m</b></div></div>';
 return intro('Aircraft Simulator · performance laboratory','How altitude, boost and combat-entry mass jointly affect drag, excess power, climbing and turns. Two explicit engineering reference configurations are shown; they are NOT validated P-47 or Bf 109 predictions.')+
  '<div class="v75-lab-controls">'+slider('v75-altitude','Altitude',0,9000,250,h,' m')+
  select('v75-engine','Power rating · generic model', [['continuous','Continuous'],['military','Military'],['emergency','Emergency (scenario boost)']],mode)+
  slider('v75-fuel','Internal fuel remaining · combat entry',20,90,5,f,'%')+
  slider('v75-gcap','Pilot G cap · assumed',3,9,.5,cap,' g')+'</div>'+
  '<p class="v75-scope"><strong>Not aircraft-calibrated:</strong> engine critical heights, power modes, drag coefficients, propeller efficiency and weights below are deliberately illustrative input assumptions. External tanks are considered jettisoned. No historical flight-test comparison is implied.</p>'+
  '<div class="v75-air-twins">'+compact(a,as)+compact(b,bs)+'</div>'+
  pane('Maximum model level speed vs altitude',graph('v75-air-maxspeed',speed,[{name:'Supercharger reference · TAS',color:'#a4c9ad',value:r=>r.a},{name:'Turbo reference · TAS',color:'#d5ac7c',value:r=>r.b}], 'True airspeed (TAS), km/h. Source-confirmed aircraft performance points are not inferred from these curves.'))+
  pane('Maximum climb potential vs altitude',graph('v75-air-climb',climbs,[{name:'Supercharger reference · m/s',color:'#a4c9ad',value:r=>r.a},{name:'Turbo reference · m/s',color:'#d5ac7c',value:r=>r.b}], 'Best model specific excess power across sampled flight speeds (m/s); a ceiling reflects Ps approaching zero.'))+
  pane('Shaft power vs altitude · selected boost',graph('v75-air-power',power,[{name:'Supercharger · hp',color:'#a4c9ad',value:r=>r.a},{name:'Turbo · hp',color:'#d5ac7c',value:r=>r.b}], 'Engine boost and critical altitude directly affect available power; do NOT substitute static sea-level horsepower for every height.'))+
  pane('Instantaneous and sustained turns at '+pretty(h)+' m',graph('v75-air-turns',turns,[
  {name:'Supercharger · instantaneous °/s',color:'#a4c9ad',value:r=>r.ai},{name:'Supercharger · sustained °/s',color:'#447f64',value:r=>r.as},
  {name:'Turbo · instantaneous °/s',color:'#d5ac7c',value:r=>r.bi},{name:'Turbo · sustained °/s',color:'#a16c3a',value:r=>r.bs}],
  'Speeds on the X-axis are true airspeed, not indicated airspeed. Sustained turns must satisfy power balance and lift/G caps.'))+
  '<details class="v75-details"><summary>Advanced E–M: specific excess power, model and historical calibration</summary><div class="v75-details-body">'+
  signedEnergyPlot(turns)+'<p class="v75-caption">Ps = 0 marks constant specific energy; positive permits acceleration/climb while negative means energy must be lost to sustain the maneuver. This graph explicitly accommodates negative values.</p>'+
  math+'<p>Historical flight tests have different test weights, ratings, boost pressures and temperatures. No 95/5 parasite/induced drag split is assumed. Each intended historical aircraft needs its own fitted drag polar and propeller/engine data, checked against an INDEPENDENT flight-test curve.</p>'+
  '<p><a target="_blank" rel="noopener noreferrer" href="https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf">FAA Aerodynamics for Naval Aviators</a> · <a target="_blank" rel="noopener noreferrer" href="https://ntrs.nasa.gov/citations/19930094435">NACA altitude supercharging report</a></p></div></details>'+
  pane('Historical performance reference · not model calibration','<p><strong>Spitfire Mk I</strong>: the historical secondary reference <i>The Narrow Margin</i> gives 355 mph at 19,000 ft and a loaded mass of 6,409 lb, with Merlin II/III nominal 1,030 hp near 16,250 ft. That is a documented published test-performance claim, NOT a calibration or validation of the generic curves above.</p><p><a href="https://erenow.org/ww/narrow-margin-battle-britain-rise-air-power-1930-1940/21.php" rel="noopener noreferrer" target="_blank">Inspect the published technical appendix</a></p>');
}
const mappings={'v75-force':['force','text'],'v75-compare':['compare','text'],'v75-initial':['startPilots','number'],'v75-tempo':['tempo','number'],'v75-arrivals':['replacements','number'],'v75-risk':['lossPerThousand','number'],'v75-rookie':['rookieMultiplier','number'],'v75-recovery':['recovery','number'],'v75-comparison-risk':['comparisonRisk','number'],'v75-altitude':['altitude','number'],'v75-engine':['engineMode','text'],'v75-fuel':['fuelPercent','number'],'v75-gcap':['pilotG','number']};
function change(id,value){const m=mappings[id];if(!m)return false;S[m[0]]=m[1]==='number'?Number(value):value;if(id==='v75-force'&&S.force===S.compare)S.compare='none';return true;}
window.AirWarV75Lab={state:S,forces,pilotModel,aircraftAt,envelope,density,presetAircraft,pilotView,aircraftView,change};
})();