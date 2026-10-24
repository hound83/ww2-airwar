/* Source-constrained dataset. A value marked MODEL is not an observed historical value. */
(function () {
  "use strict";
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const idx = (y,m) => (y-1936)*12+m-6;
  const at = i => { const k=6+i; return {y:1936+Math.floor(k/12),m:k%12}; };
  const label = i => { const d=at(i); return monthNames[d.m]+" "+d.y; };
  const MONTHS=107;
  const pilotRates = {
    1942:[1.8,4.4,3.3,6.6,7.7,7.7,7.2,9.4,8.1,4.2,2.4,6.2],
    1943:[8.2,6.7,8.6,10.9,13.9,12.7,16.0,15.6,15.7,14.5,9.9,10.4],
    1944:[12.1,17.9,21.7,20.1,25.0]
  };
  const modelRates = {
    1939:[1.5,1.8,2.0,2.2],
    1940:[2.0,2.2,2.5,2.8,3.1,4.0,5.0,6.5,8.0,6.0,3.5,2.5],
    1941:[2.5,2.6,2.8,3.2,4.3,5.0,5.5,5.4,5.0,4.6,4.0,4.0],
    1944:[23,24,22,20,18,17,15],
    1945:[15,13,11,8,3]
  };
  const pilotStrengthPoints = [
    [1936,6,420,"model"],[1937,0,490,"model"],[1938,0,670,"model"],[1939,0,900,"model"],
    [1939,8,1100,"model"],[1940,4,1350,"model"],[1940,7,1500,"model"],[1940,11,1400,"model"],
    [1941,5,1650,"model"],[1941,11,1750,"model"],[1942,0,1750,"model"],[1942,11,1890,"model"],
    [1943,0,1880,"constrained"],[1943,1,1908,"constrained"],[1943,2,1940,"constrained"],
    [1943,3,1960,"constrained"],[1943,4,1980,"constrained"],[1943,5,2000,"constrained"],
    [1943,6,2060,"constrained"],[1943,7,2112,"constrained"],
    [1943,8,343/0.157,"derived"],[1943,9,339/0.145,"derived"],
    [1943,10,245/0.099,"derived"],[1943,11,252/0.104,"derived"],
    [1944,0,292/0.121,"derived"],[1944,1,434/0.179,"derived"],
    [1944,2,511/0.217,"derived"],[1944,3,447/0.201,"derived"],[1944,4,578/0.250,"derived"],
    [1944,7,2600,"model"],[1944,11,3000,"model"],[1945,0,2800,"model"],
    [1945,3,2200,"model"],[1945,4,1700,"model"]
  ].map(p=>({i:idx(p[0],p[1]),value:p[2],quality:p[3]}));
  // SERVICEABLE aircraft, not fighters on strength and not deployed pilots.
  // Source: original German returns, RAF AHB translation VII/107 (1951).
  // Dates within each month are documented individually in atlas-v6-data.js.
  // The simulations need a continuous monthly curve; intermediate months are
  // explicitly interpolated, and May 1945 remains a SCENARIO, not a return.
  const aircraftPoints = [
    [1936,6,150,"model"],[1937,0,230,"model"],[1938,0,400,"model"],
    [1938,7,453,"documented"],[1939,7,686,"documented"],[1939,8,676,"documented"],
    [1940,2,817,"documented"],[1940,7,853,"documented"],[1940,8,721,"documented"],
    [1941,5,1110,"documented"],[1941,11,670,"documented"],
    [1942,5,926,"documented"],[1942,11,908,"documented"],
    [1943,3,1040,"documented"],[1943,4,1255,"documented"],
    [1943,5,1361,"documented"],[1943,7,1019,"documented"],
    [1943,11,1095,"documented"],[1944,2,1188,"documented"],
    [1944,3,1114,"documented"],[1944,4,1111,"documented"],
    [1944,5,895,"documented"],[1944,6,1193,"documented"],
    [1944,7,1043,"documented"],[1944,8,1413,"documented"],
    [1944,9,2487,"documented"],
    [1944,10,2256,"documented"],[1944,11,1521,"documented"],
    [1945,0,1610,"documented"],[1945,3,1648,"documented"],
    [1945,4,800,"model"]
  ].map(p=>({i:idx(p[0],p[1]),value:p[2],quality:p[3]}));
  const tempoPoints = [
    [1936,6,0],[1939,8,11],[1940,6,21],[1940,11,14],
    [1941,6,24],[1942,6,23],[1943,6,25],[1944,2,24],
    [1944,7,14],[1944,11,10],[1945,1,6],[1945,4,2]
  ].map(p=>({i:idx(p[0],p[1]),value:p[2],quality:"model"}));
  const contactPoints = [
    [1939,8,0.22],[1940,7,0.50],[1941,5,0.42],[1942,6,0.43],
    [1943,6,0.47],[1944,2,0.53],[1944,10,0.35],[1945,4,0.20]
  ].map(p=>({i:idx(p[0],p[1]),value:p[2],quality:"model"}));
  const eastPoints = [
    [1939,8,0.01],[1940,6,0.01],[1941,5,0.62],[1942,5,0.64],
    [1943,5,0.50],[1944,5,0.40],[1945,3,0.30]
  ].map(p=>({i:idx(p[0],p[1]),value:p[2],quality:"model"}));
  function interpolation(points,i){
    if(i<=points[0].i) return {...points[0],i};
    if(i>=points[points.length-1].i)return {...points[points.length-1],i};
    let upper=1;while(upper<points.length&&points[upper].i<i)upper++;
    const a=points[upper-1],b=points[upper],t=(i-a.i)/(b.i-a.i);
    return {i,value:a.value+(b.value-a.value)*t,quality:i===a.i?a.quality:i===b.i?b.quality:"interpolated",
      sourceA:a.i,sourceB:b.i};
  }
  function pilots(i){return interpolation(pilotStrengthPoints,i);}
  function aircraft(i){return interpolation(aircraftPoints,i);}
  function tempo(i){return interpolation(tempoPoints,i);}
  function contact(i){return interpolation(contactPoints,i);}
  function east(i){return interpolation(eastPoints,i);}
  function rate(i){
    const d=at(i),y=d.y,m=d.m;
    if(pilotRates[y] && pilotRates[y][m]!==undefined)
      return {value:pilotRates[y][m]/100,quality:"documented"};
    if(y<1939||(y===1939&&m<8)) return {value:0,quality:"peacetime"};
    if(y===1939)return {value:modelRates[1939][m-8]/100,quality:"model"};
    if(y===1940||y===1941)return {value:modelRates[y][m]/100,quality:"model"};
    if(y===1944)return {value:modelRates[1944][m-5]/100,quality:"model"};
    return {value:modelRates[1945][m]/100,quality:"model"};
  }
  const production43 = [1134,1263,1135,1072,1181,985,687];
  const acceptances44 = [1315,1016,1377,1696,1907,2177,2627,2779,3031,2735,2776,2424];
  const newBuilt44 = [1162,794,934,1016,1380,1704,1875,1798];
  const repaired44 = [237,320,373,456,384,571,671,676];
  const readiness43 = [[7,2228,1581,1019],[8,2228,1646,1080],[9,2288,1721,1193],[10,2244,1789,1140],[11,2244,1561,1095]];
  const pilotCasualties43 = [[8,343,15.7],[9,339,14.5],[10,245,9.9],[11,252,10.4]];
  const pilotCasualties44 = [[0,292,12.1],[1,434,17.9],[2,511,21.7],[3,447,20.1],[4,578,25]];
  // Rough 1944 monthly allocation: normalized to the 8,500 yearly fighter-aircraft write-offs.
  // This curve is never shown as an observed monthly breakdown.
  const fighterLossWeight44=[0.065,0.074,0.083,0.085,0.089,0.100,0.091,0.090,0.095,0.086,0.078,0.064];
  // Integer-preserving allocation, so the sum stays exactly 8,500 rather than
  // accumulating twelve independent rounding errors.
  const fighterLossTotalWeight44=fighterLossWeight44.reduce((a,b)=>a+b,0);
  const fighterLossReal44=fighterLossWeight44.map(x=>8500*x/fighterLossTotalWeight44);
  const fighterLossAllocated44=fighterLossReal44.map(Math.floor);
  const fighterLossRemainders44=fighterLossReal44.map((x,i)=>({i,frac:x-fighterLossAllocated44[i]}))
    .sort((a,b)=>b.frac-a.frac);
  const fighterLossExtra44=8500-fighterLossAllocated44.reduce((a,b)=>a+b,0);
  for(let j=0;j<fighterLossExtra44;j++)
    fighterLossAllocated44[fighterLossRemainders44[j].i]++;
  function writeoffs(i){
    const d=at(i),y=d.y,m=d.m;
    if(y===1943 && (m===9||m===10||m===11)){
      const r={9:.419,10:.210,11:.228}[m];
      const point=readiness43.find(x=>x[0]===m);
      return {value:Math.round(point[2]*r),quality:"derived",share:r,
        note:"Murray reports the write-off share; count derived from the reported present strength."};
    }
    if(y===1944){
      return {value:fighterLossAllocated44[m],quality:"allocated",
        note:"Share allocated from approximately 8,500 fighters written off in 1944, not a reported monthly count."};
    }
    return {value:null,quality:"unavailable",note:"No verified matching monthly day-fighter write-off series incorporated."};
  }
  function production(i){
    const d=at(i);
    if(d.y===1943&&d.m>=5)return {value:production43[d.m-5],quality:"documented",definition:"new or reconditioned fighters"};
    if(d.y===1944)return {value:acceptances44[d.m],quality:"documented",definition:"single-engine fighter acceptances"};
    return {value:null,quality:"unavailable",definition:""};
  }
  const sources=[
    {id:"MUR",kind:"Air University / USAF",label:"Murray, Strategy for Defeat (1983)",url:"https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf",why:"Tables XLIV, XLVII, XLVIII, LIII, LXVIII and LXX; pilot attrition, readiness and training."},
    {id:"MURHTML",kind:"USAF historical study mirror",label:"Murray, chapters VI–VII, searchable tables",url:"https://www.ibiblio.org/hyperwar/AAF/AAF-Luftwaffe/AAF-Luftwaffe-6.html",why:"1943 2,105 average fighter pilots; 2,967 losses; 1943 readiness; JG 26 losses."},
    {id:"AAF",kind:"Official USAAF wartime history",label:"Army Air Forces in WWII, Vol. III, Ch. 2",url:"https://www.ibiblio.org/hyperwar/AAF/III/AAF-III-2.html",why:"1944 monthly single-engine fighter acceptances, estimated annual write-offs and operational context."},
    {id:"1940",kind:"Official USAF historical study",label:"Luftwaffe fighter strength, March 1940",url:"https://www.dafhistory.af.mil/Portals/16/documents/Studies/151-200/AFD-090421-052.pdf",why:"Quartermaster figures: 1,449 authorized, 1,258 present, 817 operational single-engine fighters."},
    {id:"BATTLE",kind:"US defense historical publication",label:"The Battle of Britain force comparison",url:"https://media.defense.gov/2025/Jun/10/2003736254/-1/-1/0/AIR%20WARFARE%20%26%20AB%20DEFENSE.PDF",why:"13 August 1940 Luftwaffe 780 single-engine fighters in battle deployment, not worldwide pilots."},
    {id:"LUFT",kind:"Order-of-battle transcription",label:"Serviceable Luftwaffe aircraft snapshots 1940–45",url:"https://www.oocities.org/sturmvogel_66/LWJul42.html",why:"Type totals 1941–43; snapshots in 1944–45 should be checked against original returns."},
    {id:"CON",kind:"USAF wartime record translation",label:"Official Condor Legion organizational history",url:"https://www.dafhistory.af.mil/Portals/16/documents/Studies/101-150/AFD-090529-068.pdf",why:"Pilot rotations and training purpose; initially up to one year and ace rotations."},
    {id:"CGSC",kind:"U.S. Army historical collection",label:"Condor Legion 1937/38 organization",url:"https://cgsc.contentdm.oclc.org/digital/api/collection/p15040coll6/id/9244/download",why:"Approximately 13 fighters per J/88 Staffel in one order of battle."},
    {id:"CALDWELL",kind:"Aviation historical monograph",label:"Caldwell: Jagdgruppe 88 pilots, 326 participants",url:"https://api.pageplace.de/preview/DT0400.9781473833036_A24080184/preview-9781473833036_A24080184.pdf",why:"126 officers plus 200 noncommissioned fighter pilots over successive deployments."},
    {id:"AGER",kind:"Peer-reviewed research",label:"Ager et al., Killer Incentives",url:"https://www.jvoth.com/Killer_Incentives.pdf",why:"5,081 German fighter pilots who have at least one victory; sample selection cautions, attrition and aircraft losses."},
    {id:"AHB",kind:"RAF translated German records",label:"RAF Air Historical Branch German translations",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-german-translations/",why:"Captured German loss returns by theater; not yet translated into a uniform pilot-loss denominator."},
    {id:"AHB83",kind:"Primary source / RAF translation",label:"German Quartermaster loss returns, 1939–40",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/german-aircraft-losses-september-1939-december-1940/",why:"German loss/accident registers; RAF translators note retroactive corrections and minor accidents recorded."},
    {id:"AHB92",kind:"Primary source / RAF translation",label:"German Quartermaster loss returns, 1941",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/german-aircraft-losses-january-1941-december-1941/",why:"1941 loss cause and month breakdowns; individual types not reliably linked to opposing fighter type."},
    {id:"BOD",kind:"RAF Museum history",label:"Operation Bodenplatte, January 1945",url:"https://www.rafmuseum.org.uk/research/research-enquiries/history-of-aviation-timeline/british-military-aviation/1945-2/",why:"237 killed, missing or captured pilots plus 18 wounded in a single operation, not a monthly rate."}
  ];
  const germanTypes=[
    ["He 51",1936,1938,"J/88 in Spain","Early biplane fighter; largely obsolete by the outbreak of WWII.","CON"],
    ["Bf 109 B–E",1937,1941,"Spain; Western Europe","Early frontline single-engine fighter, then increasingly superseded.","CGSC"],
    ["Bf 109 F/G/K",1941,1945,"All fronts","Main series of late-war single-engine fighters; versions differ substantially.","MUR"],
    ["Bf 110",1939,1945,"Heavy fighter / night fighter","Twin-engine Zerstörer, later extensively used at night; NOT included in single-engine chart.","MUR"],
    ["Fw 190 A/F",1941,1945,"Day fighter / fighter-bomber","Important western and eastern frontline type.","MUR"],
    ["Me 410",1943,1944,"Heavy fighter / bomber-destroyer","Twin-engine type; not interchangeable with a Bf 109 or Fw 190.","MUR"],
    ["Fw 190 D / Ta 152",1944,1945,"Late piston fighters","Late improvements; Ta 152 saw very limited wartime service.","MUR"],
    ["Me 262",1944,1945,"Jet fighter","Limited jet units; separate from the single-engine piston fighter strength series.","AAF"]
  ];
  const alliedTypes=[
    ["Hurricane",1940,1945,"RAF","Central in the 1940 Battle of Britain; later other roles.","BATTLE"],
    ["Spitfire",1940,1945,"RAF / Allied","Western and Mediterranean fighter opposition throughout the war.","BATTLE"],
    ["P-38 Lightning",1942,1945,"USAAF","Twin-engine fighter in Mediterranean and European theaters.","AAF"],
    ["P-47 Thunderbolt",1943,1945,"USAAF","Eighth and Ninth Air Forces, escalating escort and ground attack.","AAF"],
    ["P-51 Mustang",1942,1945,"RAF (early); USAAF (later)","Earlier Allison-powered Mustangs served the RAF; high-volume Merlin P-51 escort expanded during 1944.","AAF"],
    ["Hawker Tempest",1944,1945,"RAF","Late-war Western European interceptor and fighter-bomber.","AHB"],
    ["Yak-1 / Yak-9",1941,1945,"Soviet VVS","Major Eastern Front fighter families; type mix changed over time.","MUR"],
    ["La-5 / La-7",1942,1945,"Soviet VVS","Radial-engine Soviet fighter families, increasingly prominent later.","MUR"],
    ["P-39 Airacobra",1942,1945,"Soviet VVS (Lend-Lease)","Widely used Soviet fighter, despite limited USAAF fighter use.","MUR"]
  ];
  const aces=[
    {name:"Erich Hartmann",claims:352,sorties:1404,from:"Oct 1942",to:"May 1945",theater:"Mostly Eastern Front",evidence:"Pilot interview / US Air Force",url:"https://www.acc.af.mil/Portals/92/Docs/ACC%20SAFETY/COMBAT%20EDGE/TAC85_01.pdf",note:"1,404 mission figure also reported in his published account; 825 involved actual air combat."},
    {name:"Gerhard Barkhorn",claims:301,sorties:1104,from:"Aug 1940",to:"May 1945",theater:"Claims on Eastern Front",evidence:"Museum of Flight / aviation history",url:"https://www.sps-aviation.com/story/?id=2967",note:"A Battle of Britain veteran with no initial victories; a useful counterexample to instant ace status."},
    {name:"Günther Rall",claims:275,sorties:621,from:"May 1940",to:"May 1945",theater:"Eastern and Western Fronts",evidence:"Smithsonian National Air and Space Museum",url:"https://airandspace.si.edu/stories/editorial/new-home-old-glove",note:"Survived numerous losses and injuries; periods away from combat matter."},
    {name:"Walter Nowotny",claims:258,sorties:442,from:"Mar 1941",to:"Nov 1944",theater:"Mostly Eastern Front",evidence:"Dutch Ministry of Defense",url:"https://magazines.defensie.nl/defensiekrant/2022/48/04_terugkijker_48",note:"Killed in 1944; extremely high claims per sortie, not a population average."},
    {name:"Hans-Joachim Marseille",claims:158,sorties:388,from:"1940",to:"Sep 1942",theater:"Western / North Africa",evidence:"Biographical historical research",url:"https://www.bfhg.de/die-hugenotten/hugenotten-und-ihre-nachkommen/marseille/",note:"Killed in a noncombat bailout after engine trouble."},
    {name:"Adolf Galland",claims:104,sorties:705,from:"1937",to:"May 1945",theater:"Spain and Western Front",evidence:"Museum of Flight archives",url:"https://archives.museumofflight.org/agents/people/459",note:"Years on staff duty break any assumption of continuous sorties."},
    {name:"Werner Mölders",claims:115,sorties:null,from:"1938",to:"Nov 1941",theater:"Spain, West, East",evidence:"Deutsche Biographie",url:"https://www.deutsche-biographie.de/sfz63882.html",note:"Includes 14 Spanish Civil War claims; published combat-sortie totals disagree."}
  ];
  const lossCauseCases=[
    {from:idx(1940,6),to:idx(1940,8),period:"July–September 1940",population:"German single-engine fighters, worldwide return",
      combat:398,operationalOther:79,groundOther:41,source:"Murray Table IX, based on AHB German Quartermaster records",
      url:"https://www.ibiblio.org/hyperwar/AAF/AAF-Luftwaffe/AAF-Luftwaffe-2.html",
      caution:"Aircraft destroyed on operations by enemy action versus other operational/non-operational losses. Does not classify the individual attacking Allied aircraft."},
    {from:idx(1941,0),to:idx(1941,11),period:"1941 (November excluded in source table)",population:"German single-engine fighters, annual returns (incomplete)",
      combat:622,operationalOther:705,groundOther:null,source:"Murray Table XVII, adapted from original German returns",
      url:"https://www.ibiblio.org/hyperwar/AAF/AAF-Luftwaffe/AAF-Luftwaffe-3.html",
      caution:"The 705 non-enemy-action figure includes all non-enemy causes; not directly comparable with July–September 1940's on-/off-operation split."}
  ];
  const rafArchive=[
    {from:idx(1939,8),to:idx(1940,11),area:"All regions",title:"1939–40 German aircraft losses",ref:"VII/83",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/german-aircraft-losses-september-1939-december-1940/"},
    {from:idx(1941,0),to:idx(1941,11),area:"All regions",title:"1941 German aircraft losses",ref:"VII/92",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/german-aircraft-losses-january-1941-december-1941/"},
    {from:idx(1943,5),to:idx(1943,7),area:"Defense of Reich",title:"June–August 1943 losses",ref:"VII/157",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-defence-of-the-reich-luftwaffe-befehlshaber-mitte-1-june-31-august-1943/"},
    {from:idx(1943,8),to:idx(1943,11),area:"Defense of Reich",title:"September–December 1943 losses",ref:"VII/149",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-in-the-area-of-luftflotte-reich-1-september-31-december-1943/"},
    {from:idx(1944,0),to:idx(1944,3),area:"Defense of Reich",title:"January–April 1944 losses",ref:"VII/138",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-in-the-area-of-luftflotte-reich-january-april-1944/"},
    {from:idx(1944,6),to:idx(1944,8),area:"Defense of Reich",title:"July–September 1944 losses",ref:"VII/142",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-in-the-area-of-luftflotte-reich-july-september-1944/"},
    {from:idx(1943,8),to:idx(1943,11),area:"Western Front",title:"September–December 1943 losses",ref:"VII/148",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-western-front-luftflotte-3-1st-september-31st-december-1943/"},
    {from:idx(1943,8),to:idx(1943,11),area:"Eastern Front",title:"September–December 1943 losses",ref:"VII/152",url:"https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-eastern-front-1st-september-31st-december-1943/"}
  ];
  window.LuftData={idx,at,label,MONTHS,pilots,aircraft,tempo,contact,east,rate,production,writeoffs,
    pilotStrengthPoints,aircraftPoints,readiness43,pilotCasualties43,pilotCasualties44,
    production43,acceptances44,newBuilt44,repaired44,sources,germanTypes,alliedTypes,aces,
    lossCauseCases,rafArchive};
})();
