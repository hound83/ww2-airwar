/* V7.3: front-scoped archive checkpoints and transparent variant MIX scenarios.
 * Operational windows are broad research aids. There is NO source-verified
 * monthly variant inventory in these tables. Never label the proxy as recorded. */
(function(){
  'use strict';
  const D=window.LuftData;
  const at=D.idx;
  // Transcription of official Soviet Air Force general-staff statistics (1962),
  // reproduced with original archival fond/opis/delo references at RKKA.
  // 'Front air armies and command reserve' includes RGK; excludes PVO, Navy,
  // Long Range Aviation and units outside the return's defined population.
  const soviet=[
    {i:at(1943,6),fighters:3690,total:8826,unserviceableFighters:516,source:'vvs1943',date:'1 Jul 1943'},
    {i:at(1944,0),fighters:3926,total:9239,unserviceableFighters:487,source:'vvs1944jan',date:'1 Jan 1944'},
    {i:at(1944,5),fighters:5815,total:12758,unserviceableFighters:492,source:'vvs1944jun',date:'1 Jun 1944'},
    {i:at(1945,0),fighters:5810,total:13936,unserviceableFighters:657,source:'vvs1945jan',date:'1 Jan 1945'},
    {i:at(1945,4),fighters:6268,total:13621,unserviceableFighters:897,source:'vvs1945may',date:'1 May 1945'}
  ];
  const sources={
    vvs1943:{short:'VVS General Staff · 1 Jul 1943',type:'Source transcription',url:'https://www.rkka.es/Estadisticas/VVS_stat/02/02_08.htm',note:'Front air armies and reserves; source cites Soviet Ministry of Defence archival files f.35 op.107313ss and 107564ss.'},
    vvs1944jan:{short:'VVS General Staff · 1 Jan 1944',type:'Source transcription',url:'https://www.rkka.es/Estadisticas/VVS_stat/02/02_09.htm',note:'Front air armies and RGK; source cites f.35 op.74315ss d.9, folios 1–2.'},
    vvs1944jun:{short:'VVS General Staff · 1 Jun 1944',type:'Source transcription',url:'https://www.rkka.es/Estadisticas/VVS_stat/02/02_10.htm',note:'Front air armies and RGK; source cites f.35 op.74315ss d.9, folios 30–31.'},
    vvs1945jan:{short:'VVS General Staff · 1 Jan 1945',type:'Source transcription',url:'https://www.rkka.es/Estadisticas/VVS_stat/02/02_11.htm',note:'Front air armies and reserves; source cites f.35 op.107567ss d.36, folios 3–68.'},
    vvs1945may:{short:'VVS General Staff · 1 May 1945',type:'Source transcription',url:'https://www.rkka.es/Estadisticas/VVS_stat/02/02_12.htm',note:'Front air armies and reserves; source cites f.35 op.107567 d.7, folios 1–59.'},
    p51museum:{short:'National Museum of the USAF · P-51D',type:'Museum primary source',url:'https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196263/north-american-p-51d-mustang/',note:'P-51B/C entered European combat December 1943; D arrived in quantity during spring 1944. Nearly 8,000 P-51Ds built worldwide; not an ETO monthly inventory.'},
    variantContext:{short:'Variant deployment context · research model',type:'Research starting point',url:'https://www.rafmuseum.org.uk/london/things-to-see-and-do/london-aircraft/',note:'Approximate operational service windows only; subtype proportions below are a deliberately low-confidence illustrative allocation of existing family inventory, NOT wartime subtype returns.'}
  };
  Object.values(sources).forEach(s=>{s.title=s.short;});
  // [name, from YYYY/MM (zero-index), through YYYY/MM, rising-in-service months,
  // declining-out-of-service months]. Windows are deliberately approximate.
  const variants=[
    {side:'Germany',family:'Bf 109',type:'Bf 109 B–D',from:at(1937,0),to:at(1941,5),rise:8,fall:17},
    {side:'Germany',family:'Bf 109',type:'Bf 109 E',from:at(1939,0),to:at(1943,5),rise:8,fall:18},
    {side:'Germany',family:'Bf 109',type:'Bf 109 F',from:at(1941,0),to:at(1944,2),rise:9,fall:18},
    {side:'Germany',family:'Bf 109',type:'Bf 109 G',from:at(1942,2),to:at(1945,4),rise:12,fall:2},
    {side:'Germany',family:'Bf 109',type:'Bf 109 K-4',from:at(1944,8),to:at(1945,4),rise:5,fall:0},
    {side:'Germany',family:'Fw 190',type:'Fw 190 A',from:at(1941,6),to:at(1945,4),rise:11,fall:6},
    {side:'Germany',family:'Fw 190',type:'Fw 190 D',from:at(1944,8),to:at(1945,4),rise:5,fall:0},
    {side:'RAF',family:'Spitfire',type:'Spitfire Mk I/II',from:at(1938,6),to:at(1942,11),rise:9,fall:15},
    {side:'RAF',family:'Spitfire',type:'Spitfire Mk V',from:at(1941,1),to:at(1945,4),rise:13,fall:22},
    {side:'RAF',family:'Spitfire',type:'Spitfire Mk IX',from:at(1942,5),to:at(1945,4),rise:13,fall:3},
    {side:'RAF',family:'Spitfire',type:'Spitfire Mk XIV',from:at(1944,0),to:at(1945,4),rise:8,fall:0},
    {side:'RAF',family:'Hurricane',type:'Hurricane Mk I',from:at(1938,11),to:at(1942,11),rise:7,fall:12},
    {side:'RAF',family:'Hurricane',type:'Hurricane Mk II/IV',from:at(1940,8),to:at(1945,4),rise:9,fall:3},
    {side:'USAAF',family:'P-51',type:'P-51 B/C',from:at(1943,11),to:at(1945,4),rise:5,fall:10,source:'p51museum'},
    {side:'USAAF',family:'P-51',type:'P-51 D/K',from:at(1944,3),to:at(1945,4),rise:7,fall:0,source:'p51museum'},
    {side:'USAAF',family:'P-47',type:'P-47 C / early D',from:at(1943,0),to:at(1944,11),rise:6,fall:9},
    {side:'USAAF',family:'P-47',type:'P-47 D (later blocks)',from:at(1943,7),to:at(1945,4),rise:12,fall:0},
    {side:'USAAF',family:'P-38',type:'P-38 F/G/H',from:at(1942,8),to:at(1944,10),rise:6,fall:12},
    {side:'USAAF',family:'P-38',type:'P-38 J/L',from:at(1943,7),to:at(1945,4),rise:10,fall:0}
  ];
  function mix(family,side,i,familyInventory){
    if(familyInventory==null)return [];
    const active=variants.filter(v=>v.family===family&&v.side===side&&v.from<=i&&v.to>=i);
    if(!active.length)return [];
    const w=v=>Math.max(.02,Math.min(1,(i-v.from+1)/Math.max(1,v.rise)))*Math.max(.02,Math.min(1,(v.to-i+1)/Math.max(1,v.fall||1)));
    const sum=active.reduce((n,v)=>n+w(v),0);
    const raw=active.map(v=>({...v,share:w(v)/sum}));
    // Largest remainder: subtype approximations always reconcile to the
    // preexisting family estimate; never create extra aircraft from rounding.
    const base=raw.map(v=>Math.floor(familyInventory*v.share));
    const leftover=Math.round(familyInventory)-base.reduce((a,b)=>a+b,0);
    raw.map((v,k)=>({k,rem:familyInventory*v.share-base[k]})).sort((a,b)=>b.rem-a.rem).slice(0,Math.max(0,leftover)).forEach(x=>base[x.k]++);
    return raw.map((v,k)=>({...v,value:base[k],quality:'estimated',method:'deployment-window allocation, not measured subtype strength'}));
  }
  function sovietAt(i,mode='strict'){
    const exact=soviet.find(x=>x.i===i);if(exact)return {...exact,value:exact.fighters,quality:'recorded'};
    const before=soviet.filter(x=>x.i<i).at(-1),after=soviet.find(x=>x.i>i);
    if(!before||!after)return {value:null,quality:'unavailable'};
    // Month-to-month values between long-separated Soviet snapshots are
    // explicitly MODELED; never equate to a recorded strength return.
    if(mode==='strict')return {value:null,quality:'unavailable'};
    return {value:Math.round(before.fighters+(after.fighters-before.fighters)*(i-before.i)/(after.i-before.i)),quality:'interpolated',source:before.source+' / '+after.source,note:'Between two original VVS checkpoints; '+(after.i-before.i)+'-month gap; historical operations not encoded as a monthly census.'};
  }
  function quarterLossAt(i,front,metric='all'){
    const q=window.LuftV4Data.theaterLosses.find(x=>i>=x.a&&i<=x.b),data=q?.[front];
    if(!data)return {value:null,quality:'unavailable',note:'No original German front loss checkpoint covers this month.'};
    if(q.a===q.b)return {value:data[metric],quality:'recorded',source:'german',note:'One-month front loss return.'};
    // Transparent *scenario* event weights; the quarter total is recorded,
    // but none of the individual monthly shares is a historical return.
    const eventWeights={
      west:{'1944-1':1.45,'1944-5':1.65,'1944-6':1.3,'1944-7':1.3},
      east:{'1944-0':1.15,'1944-5':1.4,'1944-6':1.35,'1944-7':1.25},
      med:{'1944-0':1.1,'1944-4':1.15}
    };
    const key=j=>{const d=D.at(j);return d.y+'-'+d.m;};
    const weight=j=>eventWeights[front]?.[key(j)]||1;
    const all=Array.from({length:q.b-q.a+1},(_,k)=>q.a+k);
    const totalWeight=all.reduce((n,j)=>n+weight(j),0);
    const amounts=all.map(j=>data[metric]*weight(j)/totalWeight),floors=amounts.map(Math.floor);
    const gap=data[metric]-floors.reduce((n,x)=>n+x,0);
    amounts.map((n,k)=>({k,r:n-floors[k]})).sort((a,b)=>b.r-a.r).slice(0,gap).forEach(x=>floors[x.k]++);
    return {value:floors[i-q.a],quality:'estimated',source:'german',
      note:'Quarter '+q.label+' '+front+' = '+data[metric]+' source-reported all-aircraft losses; monthly share estimated with illustrative event weights, not a monthly source return.'};
  }
  window.AirWarV73Data={soviet,sources,variants,mix,sovietAt,quarterLossAt};
})();
