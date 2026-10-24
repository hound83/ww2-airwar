/* Air War Atlas v4: dated series and explicit measurement definitions.
   No interpolated/allocated figure is a wartime observation. */
(function(){
  'use strict';
  const base=window.LuftData, at=base.idx;
  const point=(year,month,value,source,quality='recorded')=>({i:at(year,month),value,source,quality});
  const points=(rows,source)=>rows.map(r=>point(r[0],r[1],r[2],source));
  const SOURCES={
    digest:{short:'USAAF Statistical Digest, 1945',title:'Army Air Forces Statistical Digest, World War II · Tables 55, 74–82, 89, 107, 167',url:'https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html',type:'original official statistics',note:'The compiled wartime tables define the reporting theater, category and dates. The online operations chapter/table 167 is not yet fully transcribed.'},
    cost:{short:'USAAF Statistical Digest, Table 82',title:'Original fiscal-year flyaway costs, pp. 134–135',url:'https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-3.html',type:'original official statistics',note:'Cost of complete aircraft as authorized under fiscal-year programs; excludes spare parts, modifications and flight operations.'},
    usa:{short:'USAAF Operational Strength / Statistical Survey',title:'USAAF European operational aircraft strength by type, 1942–1945',url:'https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrusaafeur',type:'research transcription from official survey',note:'Quarterly snapshots of operational aircraft by model, not number built and not necessarily serviceable on a specific day.'},
    raf:{short:'RAF strength / TNA AIR 22',title:'RAF Fighter Command and 2nd Tactical Air Force strength by model',url:'https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrrafeur',type:'research transcription of archival records',note:'Snapshots at the start of month. RAF series mostly counts serviceable aircraft; compare with USAAF only with scope warning.'},
    german:{short:'German archives / Zamansky (2016)',title:'Zamansky, Luftwaffe: A Case Study · Appendices A, Tables 3 and 15',url:'https://www.ww2.dk/Dan%20Zamansky%20-%20The%20Study.pdf',type:'peer research transcribing Bundesarchiv records',note:'Original German returns BArch RL 2-III/716, 722, 728, 944–946 and BArch ZA 3/358; distinguishes on-strength vs at-front vs serviceable.'},
    murray:{short:'Murray, Strategy for Defeat (1983)',title:'Murray, Strategy for Defeat · tables XXXVII, XLV–XLVII and LXVIII',url:'https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf',type:'USAF historical research using original wartime returns',note:'1943–44 German pilot casualties, production and readiness; early source periods and definitions differ from later series.'},
    hrs:{short:'USAAF Digest, Table 107',title:'USAAF flying hours by airplane model, European area (quarterly)',url:'https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html',type:'original official statistics',note:'Quarterly flight hours. Contains ground-support and other missions as well as escort; Q2 1944 includes flying after D-Day.'},
    navy:{short:'US Navy Overlord planning history',title:'Operation Neptune: Planning and Preparation for Cross-Channel Operations',url:'https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/o/operation-neptune-invasion-normandy/chapter-2-planing-and-preparation-for-cross-channel-overloard-operations.html',type:'official operational history',note:'COSSAC in early 1943, Morgan appointed April, July 1943 outline plan, landings 6 June 1944.'},
    rafreports:{short:'UK National Archives, AIR 50',title:'RAF combat reports, 1939–1945',url:'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/raf-combat-reports-1939-1945/',type:'archival catalog of original claims',note:'Individual reports have details of type, unit and action. A complete month-by-month pan-Allied fighter claim series is not included here.'},
    bundes:{short:'Bundesarchiv: Luftwaffe losses',title:'Bundesarchiv guidance: German aircraft and crew loss reports',url:'https://www.bundesarchiv.de/im-archiv-recherchieren/archivgut-recherchieren/nach-themen/das-schicksal-abgestuerzter-deutscher-flugzeuge-und-deren-besatzungen-im-zweiten-weltkrieg/',type:'German original archive',note:'Report received date can differ from incident date; causes revised or incomplete.'},
    digest104:{short:'USAAF Statistical Digest, Table 104',title:'Fighter airplane losses overseas by theater, 1943–45',url:'https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf',type:'original official statistics',note:'ETO monthly all-fighter losses combine combat and accident losses. The table does NOT break these totals down by fighter model; any model allocation is a scenario.'},
    raf1940:{short:'Royal Air Force Air Power Review',title:'Battle of Britain Fighter Command ready and unserviceable aircraft, July–September 1940',url:'https://www.raf.mod.uk/what-we-do/centre-for-air-and-space-power-studies/aspr/apr-vol1-iss2-5-pdf/',type:'Royal Air Force historical study',note:'Official secondary research: July 1 ready Spitfires 199, Hurricanes 347; August 1 ready Spitfires 208, Hurricanes 350; September 1 ready Spitfires 209, Hurricanes 349. Different day, denominator and scope from the RAF inventory survey.'}
  };
  // Quarter-end USAAF operational aircraft snapshots transcribed from Statistics / USAAF Survey.
  const datesUS=[[1942,8],[1942,11],[1943,2],[1943,5],[1943,8],[1943,11],[1944,2],[1944,5],[1944,8],[1944,11],[1945,2],[1945,3]];
  const usaRows={
    'P-38':[133,168,56,2,93,380,707,568,379,257,250,244],
    'P-47':[0,88,203,141,811,1215,1920,1632,1840,1735,1932,2057],
    'P-51':[0,0,0,0,34,266,792,803,1203,1548,1694,1867],
    'Other fighters':[0,260,99,3,5,1,0,43,48,45,76,82],
    'B-17':[144,178,229,783,835,1302,1487,1471,1927,2168,2367,2291],
    'B-24':[34,41,74,51,96,308,772,1458,1471,1183,1045,1041],
    'Fighters total':[133,516,358,146,943,1862,3419,3046,3470,3585,3952,4250]
  };
  const usa={}; for(const [type,values] of Object.entries(usaRows)) usa[type]=datesUS.map((d,k)=>point(d[0],d[1],values[k],'usa'));
  // RAF numbers: Fighter Command / Air Defence GB plus 2 TAF (after organizational split).
  const datesRAF=[[1939,8],[1940,0],[1940,6],[1941,0],[1941,4],[1941,8],[1942,0],[1942,4],[1942,8],[1943,0],[1943,4],[1943,8],[1944,0],[1944,4],[1944,8],[1945,0],[1945,4]];
  const rafRows={
    'Spitfire':[104,126,243,242,371,623,724,693,854,708,739,833,805,833,884,584,601],
    'Hurricane':[133,166,282,471,510,406,185,138,110,51,24,57,37,25,18,0,0],
    'Typhoon':[0,0,0,0,0,0,0,0,58,85,223,193,257,329,350,236,273],
    'Tempest':[0,0,0,0,0,0,0,0,0,0,0,0,0,24,87,75,95],
    'Mustang (RAF)':[0,0,0,0,0,0,0,0,0,0,0,179,142,183,166,136,215]
  };
  const raf={};for(const [type,values] of Object.entries(rafRows))raf[type]=datesRAF.map((d,k)=>point(d[0],d[1],values[k],'raf'));
  // Distinct German measures: on-strength includes reserve; at-front excludes reserve;
  // operationally ready is a subset and should not be equated to on-strength.
  const germanSingle=points([[1941,10,1153],[1941,11,1098],[1942,11,1439],[1943,1,1356],[1943,11,1561],[1944,1,1616]],'german');
  const germanFront=points([[1941,10,888],[1941,11,899],[1942,11,1230],[1943,1,1217],[1943,11,1482],[1944,1,1596]],'german');
  const germanFw=points([[1941,10,110],[1941,11,147],[1942,11,670],[1943,1,667],[1943,11,467],[1944,1,456]],'german');
  const sectorShares=[
    {a:at(1942,7),b:at(1942,11),east:43,west:19,med:22,north:16},
    {a:at(1942,11),b:at(1943,6),east:28,west:33,med:26,north:13},
    {a:at(1943,6),b:at(1944,1),east:23,west:52,med:18,north:7},
    {a:at(1944,1),b:at(1944,5),east:22,west:58,med:14,north:6},
    {a:at(1944,5),b:at(1945,4),east:26,west:67,med:2,north:5}
  ];
  // All German operational aircraft (not just fighters!), three theaters, reported per quarter.
  const theaterLosses=[
    {a:at(1943,8),b:at(1943,8),label:'Sep 1943',west:{strength:4221,combat:217,all:493},med:{strength:1319,combat:280,all:381},east:{strength:2407,combat:223,all:326}},
    {a:at(1943,9),b:at(1943,11),label:'Q4 1943',west:{strength:4600,combat:746,all:1521},med:{strength:1156,combat:390,all:562},east:{strength:2517,combat:380,all:595}},
    {a:at(1944,0),b:at(1944,2),label:'Q1 1944',west:{strength:5288,combat:1505,all:2518},med:{strength:1090,combat:483,all:641},east:{strength:2631,combat:536,all:845}},
    {a:at(1944,3),b:at(1944,5),label:'Q2 1944',west:{strength:5202,combat:2503,all:3676},med:{strength:906,combat:544,all:749},east:{strength:3044,combat:629,all:1029}},
    {a:at(1944,6),b:at(1944,8),label:'Q3 1944',west:{strength:5226,combat:2631,all:3643},med:{strength:747,combat:361,all:470},east:{strength:3073,combat:1020,all:1381}}
  ];
  const germanProductionNew43={"Bf 109":[663,704,515,525,556,472,350],"Fw 190":[109,169,159,167,127,114,313]};
  const usaAnnualAccepted={
    'P-38':{1942:1265,1943:2213,1944:4186,1945:1666},
    'P-47':{1942:532,1943:4428,1944:7065,1945:3559},
    'P-51':{1942:634,1943:1710,1944:6908,1945:5111}
  };
  const usaCosts={
    'P-38':{1942:120407,1943:105567,1944:97147},
    'P-47':{1941:113246,1942:105594,1943:104258,1944:85578,1945:83001},
    'P-51':{1942:58698,1943:58824,1944:51572,1945:50985}
  };
  const flyingHours=[{label:'Q1 1944',a:at(1944,0),b:at(1944,2),p47:113500,p51:25300},{label:'Q2 1944',a:at(1944,3),b:at(1944,5),p47:275800,p51:154000}];
  // Fighter crews on hand, USAAF ETO Table 55, NOT aircraft and not engaged pilots.
  const usCrews={
    'P-47':points([[1943,7,689],[1944,4,2457],[1944,5,2422],[1944,6,2493]],'digest'),
    'P-38':points([[1943,7,91],[1944,4,911],[1944,5,923],[1944,6,519]],'digest'),
    'P-51':points([[1943,7,0],[1944,4,1101],[1944,5,1152],[1944,6,1826]],'digest')
  };
  // Table 104: all USAAF ETO fighter-airplane losses (combat AND accident).
  // This is a directly recorded aggregate; individual P-47/P-51/P-38 losses are
  // NOT present in Table 104 and may only be explored by labeled allocation.
  const usaFighterLossMonthly=points([
    [1943,6,18],[1943,7,23],[1943,8,27],[1943,9,30],[1943,10,62],[1943,11,58],
    [1944,0,111],[1944,1,129],[1944,2,232],[1944,3,358]
  ],'digest104');
  const rafReady1940={
    'Spitfire':points([[1940,6,199],[1940,7,208],[1940,8,209]],'raf1940'),
    'Hurricane':points([[1940,6,347],[1940,7,350],[1940,8,349]],'raf1940')
  };
  // Historical date facts; do not extend the 1945 Europe campaign beyond 8 May.
  const milestones=[
    {i:at(1936,6),title:'Condor Legion origins',detail:'A small deployed volunteer/rotating force, not the entire wartime Luftwaffe.'},
    {i:at(1939,8),title:'War begins in Europe',detail:'German campaign air units expand; RAF is already tracking operational strength.'},
    {i:at(1940,6),title:'Battle of Britain',detail:'521 single-engine German fighter pilots lost July–September 1940 (source-reported); does not mean all fatalities.'},
    {i:at(1941,5),title:'Invasion of the Soviet Union',detail:'Very different fighter workloads and engagement rates in East and West.'},
    {i:at(1943,6),title:'COSSAC outline plan',detail:'Cross-Channel operation planning has proceeded; D-Day preparation is an interval, not a single start date.'},
    {i:at(1943,9),title:'Second Schweinfurt',detail:'Bomber losses demonstrate escort limitations. German pilots and airframes are also heavily attrited.'},
    {i:at(1944,1),title:'Big Week',detail:'USAAF escort force still has a large P-47 presence as P-51 strength grows.'},
    {i:at(1944,5),title:'D-Day',detail:'6 June 1944. Thereafter escort and ground-support assignments evolve.'},
    {i:at(1945,4),title:'War ends in Europe',detail:'8 May 1945; incomplete returns should not be translated into fabricated losses.'}
  ];
  function sample(series,i,{allowExtrapolate=false}={}){
    if(!series?.length)return {value:null,quality:'unavailable',source:null};
    const exact=series.find(p=>p.i===i);if(exact)return {...exact};
    const lo=series.filter(p=>p.i<i).at(-1),hi=series.find(p=>p.i>i);
    if(!lo||!hi){if(!allowExtrapolate)return {value:null,quality:'unavailable',source:null};return {...(lo||hi),quality:'estimated-low',note:'Scenario extension beyond nearest reported snapshot'};}
    const value=Math.round(lo.value+(hi.value-lo.value)*(i-lo.i)/(hi.i-lo.i));
    return {i,value,source:lo.source===hi.source?lo.source:lo.source+'+'+hi.source,quality:hi.i-lo.i<=4?'estimated-high':'estimated-low',note:'Linearly interpolated between dated source snapshots; no monthly observation'};
  }
  function airframe(type,i,side){return sample((side==='USAAF'?usa:raf)[type],i);}
  function share(i){return sectorShares.find(x=>i>=x.a&&i<=x.b)||null;}
  function germanType(i,type,scenario190=.33){
    const present=(i>=at(1943,7)&&i<=at(1943,11)) ? base.readiness43.find(r=>r[0]===base.at(i).m) : null;
    const aggregate=present?{value:present[2],quality:'recorded',source:'murray'}:sample(germanSingle,i);
    if(aggregate.value===null)return aggregate;
    const fw=sample(germanFw,i);
    let estimate=fw.value,quality=fw.quality;
    if(estimate===null){estimate=Math.round(aggregate.value*(i<at(1941,7)?0:scenario190));quality='estimated-low';}
    const val=type==='Fw 190'?Math.min(aggregate.value,estimate):Math.max(0,aggregate.value-estimate);
    return {value:val,quality:type==='Fw 190'?quality:(quality==='recorded'?'estimated-high':quality),source:'german',note:'Bf 109 is residual of German single-engine fighter strength minus known/estimated Fw 190; other small types may be included.'};
  }
  window.LuftV4Data={SOURCES,usa,raf,usaAnnualAccepted,usaCosts,usCrews,usaFighterLossMonthly,rafReady1940,flyingHours,germanProductionNew43,
    germanSingle,germanFront,germanFw,sectorShares,theaterLosses,milestones,sample,airframe,share,germanType};
})();
