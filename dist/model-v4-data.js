/* Air War Atlas v4: dated series and explicit measurement definitions.
   No interpolated/allocated figure is a wartime observation. */
(function(){
  'use strict';
  const base=window.LuftData, at=base.idx;
  const point=(year,month,value,source,quality='recorded')=>({i:at(year,month),value,source,quality});
  const points=(rows,source)=>rows.map(r=>point(r[0],r[1],r[2],source));
  const SOURCES={
    digest:{short:'USAAF Statistical Digest, 1945',title:'Army Air Forces Statistical Digest, World War II · Tables 55, 74–82, 89, 107, 167',url:'https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html',type:'original official statistics',note:'The compiled wartime tables define reporting theater, category and dates. Table 167 reports by bomber/fighter CLASS, not individual P-47/P-51/P-38 fighter type.'},
    cost:{short:'USAAF Statistical Digest, Table 82',title:'Original fiscal-year flyaway costs, pp. 134–135',url:'https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-3.html',type:'original official statistics',note:'Cost of complete aircraft as authorized under fiscal-year programs; excludes spare parts, modifications and flight operations.'},
    usa:{short:'USAAF Operational Strength / Statistical Survey',title:'USAAF European operational aircraft strength by type, 1942–1945',url:'https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrusaafeur',type:'research transcription from official survey',note:'Quarterly snapshots of operational aircraft by model, not number built and not necessarily serviceable on a specific day.'},
    raf:{short:'RAF strength / TNA AIR 22',title:'RAF Fighter Command and 2nd Tactical Air Force strength by model',url:'https://www.theworldwars.net/stats/file.php?e=ww2&s=airstrrafeur',type:'research transcription of archival records',note:'Snapshots at the start of month. RAF series mostly counts serviceable aircraft; compare with USAAF only with scope warning.'},
    german:{short:'German archives / Zamansky (2016)',title:'Zamansky, Luftwaffe: A Case Study · Appendices A, Tables 3 and 15',url:'https://www.ww2.dk/Dan%20Zamansky%20-%20The%20Study.pdf',type:'peer research transcribing Bundesarchiv records',note:'Original German returns BArch RL 2-III/716, 722, 728, 944–946 and BArch ZA 3/358; distinguishes on-strength vs at-front vs serviceable.'},
    murray:{short:'Murray, Strategy for Defeat (1983)',title:'Murray, Strategy for Defeat · tables XXXVII, XLV–XLVII and LXVIII',url:'https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf',type:'USAF historical research using original wartime returns',note:'1943–44 German pilot casualties, production and readiness; early source periods and definitions differ from later series.'},
    hrs:{short:'USAAF Digest, Table 107',title:'USAAF flying hours by airplane model, European area (quarterly)',url:'https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html',type:'original official statistics',note:'Quarterly flight hours. Contains ground-support and other missions as well as escort; Q2 1944 includes flying after D-Day.'},
    navy:{short:'US Navy Overlord planning history',title:'Operation Neptune: Planning and Preparation for Cross-Channel Operations',url:'https://www.history.navy.mil/research/library/online-reading-room/title-list-alphabetically/o/operation-neptune-invasion-normandy/chapter-2-planing-and-preparation-for-cross-channel-overloard-operations.html',type:'official operational history',note:'COSSAC in early 1943, Morgan appointed April, July 1943 outline plan, landings 6 June 1944.'},
    rafreports:{short:'UK National Archives, AIR 50',title:'RAF combat reports, 1939–1945',url:'https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/raf-combat-reports-1939-1945/',type:'archival catalog of original claims',note:'Individual reports have details of type, unit and action. A complete month-by-month pan-Allied fighter claim series is not included here.'},
    bundes:{short:'Bundesarchiv: Luftwaffe losses',title:'Bundesarchiv guidance: German aircraft and crew loss reports',url:'https://www.bundesarchiv.de/im-archiv-recherchieren/archivgut-recherchieren/nach-themen/das-schicksal-abgestuerzter-deutscher-flugzeuge-und-deren-besatzungen-im-zweiten-weltkrieg/',type:'German original archive',note:'Report received date can differ from incident date; causes revised or incomplete.'},
    digest104:{short:'USAAF Statistical Digest, Table 104',title:'Fighter airplane losses overseas by theater, 1942–Aug 1945',url:'https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf',type:'original official statistics',note:'ETO 1st-line fighter losses include combat AND accident losses; not broken down by model. Critically the published 1945 annual column is Jan–AUG, unlike Table 167 claims ending May; it is NOT a directly comparable wartime-only Jan–May figure. Original first-line Jan 1944 110 / Mar 1944 229 differ from all-lines 111 / 232.'},
    raf1940:{short:'Royal Air Force Air Power Review',title:'Battle of Britain Fighter Command ready and unserviceable aircraft, July–September 1940',url:'https://www.raf.mod.uk/what-we-do/centre-for-air-and-space-power-studies/aspr/apr-vol1-iss2-5-pdf/',type:'Royal Air Force historical study',note:'Official secondary research: July 1 ready Spitfires 199, Hurricanes 347; August 1 ready Spitfires 208, Hurricanes 350; September 1 ready Spitfires 209, Hurricanes 349. Different day, denominator and scope from the RAF inventory survey.'}
    ,digest167:{short:'USAAF Statistical Digest, Table 167',title:'Enemy aircraft reported destroyed in ETO, by aircraft class (Aug 1942–May 1945)',url:'https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf',type:'original official statistics',note:'Original MONTHLY and annual USAAF fighter-class credited enemy aircraft, split IN AIR versus ON GROUND. These are credited claims, not independently matched German write-offs. Fighter means aircraft class, not P-47, P-51 or P-38.'}
    ,digest128:{short:'USAAF Statistical Digest, Table 128',title:'Monthly U.S. fighter combat sorties by mission role, ETO and MTO, 1943–45',url:'https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf',type:'original official statistics',note:'ALL USAAF fighter aircraft by theater, not type-specific sorties. Mission categories are Escort, Bombing/Strafing, Reconnaissance and Other (patrol, interception, sweeps, sea search). 1945 includes only January–May. Europe and Mediterranean are distinct.'}
    ,digest159:{short:'USAAF Statistical Digest, Table 159',title:'ETO American losses on combat missions by aircraft class and cause, 1942–45',url:'https://media.defense.gov/2011/Mar/31/2001330134/-1/-1/0/AFD-110331-045.pdf',type:'original official statistics',note:'1944–May 1945 ORIGINAL monthly losses on COMBAT MISSIONS by bomber/fighter CLASS and attribution to enemy aircraft, antiaircraft fire or other causes. These are not ALL first-line aircraft write-offs in Table 104; the causes do not reveal which model or nation shot each plane down.'}
    ,rafBattle:{short:'RAF Museum, Battle of Britain',title:'RAF Museum Battle of Britain campaign overview',url:'https://www.rafmuseum.org.uk/research/online-exhibitions/history-of-the-battle-of-britain/the-battle-of-britain-phase-three',type:'national museum historical research',note:'Documents sustained fighter-crew exhaustion and combat losses. No exact percentage of original veteran pilots surviving the whole war can be calculated from the campaign narrative.'}
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
    [1944,0,110],[1944,1,129],[1944,2,229],[1944,3,358]
  ],'digest104');
  // Table 104 FIRST-LINE losses: combat and accidents, not second-line removals.
  // 1945 covers JAN–AUG in the ETO, not Jan–May. Keep aggregate annual
  // checkpoints separate from known July 1943–April 1944 monthly observations.
  const usaFighterLossAnnual=[
    {year:1942,value:68},{year:1943,value:301},{year:1944,value:4758},{year:1945,value:1997}
  ].map(x=>({...x,quality:'recorded',source:'digest104',scope:x.year===1945?'Jan–Aug (includes post-VE)':'Jan–Dec'}));
  // Table 167 ETO: enemy aircraft credited as destroyed by all USAAF fighters.
  // In 1944 this was 5,602 credited in the air + 2,375 on the ground.
  // Crucially these columns are NOT by individual fighter model despite the
  // common, misleading shorthand 'by type' used in the table heading.
  const usaFighterClaimsAnnual=[
    {year:1942,air:7,ground:0},{year:1943,air:451,ground:0},
    {year:1944,air:5602,ground:2375},{year:1945,air:1362,ground:4421}
  ].map(x=>({...x,total:x.air+x.ground,quality:'recorded',source:'digest167',scope:x.year===1945?'Jan–May':'Jan–Dec'}));
  // USAAF Statistical Digest Table 167 ORIGINAL MONTHLY FIGHTER-CLASS CREDITS.
  // Each row is [year, zero-based month, in-air credits, on-ground credits].
  // The original table explicitly prints '-' for zeroes. No 1942 Jan–Jul data
  // are supplied (ETO reporting here begins in AUG 1942); this is not a zero.
  const usaFighterClaimsMonthly=[
    [1942,7,1,0],[1942,8,0,0],[1942,9,5,0],[1942,10,0,0],[1942,11,1,0],
    [1943,0,5,0],[1943,1,2,0],[1943,2,0,0],[1943,3,4,0],
    [1943,4,8,0],[1943,5,18,0],[1943,6,42,0],[1943,7,53,0],
    [1943,8,38,0],[1943,9,76,0],[1943,10,105,0],[1943,11,100,0],
    [1944,0,203,0],[1944,1,341,1],[1944,2,469,76],[1944,3,418,527],
    [1944,4,596,242],[1944,5,470,148],[1944,6,407,153],[1944,7,551,437],
    [1944,8,586,440],[1944,9,202,139],[1944,10,492,181],[1944,11,867,31],
    [1945,0,337,87],[1945,1,163,295],[1945,2,395,321],
    [1945,3,454,3703],[1945,4,13,15]
  ].map(([year,month,air,ground])=>({i:at(year,month),year,month,air,ground,
    total:air+ground,quality:'recorded',source:'digest167'}));
  // Original USAAF Statistical Digest Table 128, month by theater and role.
  // [year, month (zero-based), total, escort, bombing+strafing, reconnaissance, other].
  // 'Other' = patrol, interception, sweep, sea search. 1944 ETO source has
  // zero reconnaissance missions in this table; 1945 separate category recorded.
  const usaSortiesETO=[
    [1943,0,429,0,0,0,429],[1943,1,450,0,0,0,450],
    [1943,2,608,0,0,0,608],[1943,3,540,8,0,8,524],
    [1943,4,2220,384,0,0,1836],[1943,5,1997,169,0,0,1828],
    [1943,6,2286,607,0,0,1679],[1943,7,2264,1578,0,0,686],
    [1943,8,3424,2167,0,0,1257],[1943,9,3396,2890,0,0,506],
    [1943,10,3905,2638,105,2,1160],[1943,11,5741,5095,89,57,500],
    [1944,0,7167,6080,201,0,886],[1944,1,10679,10295,83,0,301],
    [1944,2,16261,14659,887,0,715],[1944,3,21554,14072,3803,0,3679],
    [1944,4,36210,26091,6405,0,3714],[1944,5,55460,27970,11320,0,16170],
    [1944,6,42953,20577,9098,0,13278],[1944,7,45827,23793,4524,0,17510],
    [1944,8,33685,13531,11056,0,9098],[1944,9,29881,15659,11731,0,2491],
    [1944,10,30120,19082,7542,0,3496],[1944,11,35487,15723,12940,0,6824],
    [1945,0,26418,10898,9878,4473,1169],[1945,1,36226,13261,13906,8410,649],
    [1945,2,62842,19853,37311,452,5226],[1945,3,48056,16654,25420,4452,1530],
    [1945,4,3011,168,729,362,1752]
  ];
  // February 1944 MTO escort is 2,628, NOT the 6,628 produced by an indexed
  // PDF transcription: 2,628+4,014+5,880=12,522; the YEARLY escort total
  // also then reconciles to 65,348 exactly. See DATA_NOTES.md.
  const usaSortiesMTO=[
    [1943,0,2700,1352,286,186,876],[1943,1,2021,1093,350,312,266],
    [1943,2,4509,2238,505,68,1698],[1943,3,8973,3433,2063,388,3089],
    [1943,4,8289,2889,2393,204,2803],[1943,5,8527,3769,1770,94,2894],
    [1943,6,16344,6232,3916,353,5843],[1943,7,14671,4486,4011,521,5653],
    [1943,8,12321,2493,4491,210,5127],[1943,9,8860,2241,3951,151,2517],
    [1943,10,10713,3036,4161,334,3182],[1943,11,14265,3713,6157,291,4104],
    [1944,0,19339,4526,6359,0,8454],[1944,1,12522,2628,4014,0,5880],
    [1944,2,14661,4487,4037,0,6137],[1944,3,16310,6050,6844,0,3416],
    [1944,4,21079,6746,11759,0,2574],[1944,5,16766,5862,8232,0,2672],
    [1944,6,16050,8235,5223,0,2592],[1944,7,18972,7887,6461,0,4624],
    [1944,8,11301,4513,4164,0,2624],[1944,9,9563,4003,4583,0,977],
    [1944,10,11985,4270,6822,0,893],[1944,11,14980,6141,7988,0,851],
    [1945,0,9965,2311,7402,1,251],[1945,1,13906,6658,6868,0,380],
    [1945,2,15498,0,15062,4,432],[1945,3,18897,5340,11749,1400,408],
    [1945,4,545,0,332,176,37]
  ];
  const toSorties=rows=>rows.map(([year,month,total,escort,strike,recon,other])=>({
    i:at(year,month),year,month,total,escort,strike,recon,other,quality:'recorded',source:'digest128'}));
  const usaFighterSorties={ETO:toSorties(usaSortiesETO),MTO:toSorties(usaSortiesMTO)};
  const usaFighterSortiesAnnual={ETO:{1943:27260,1944:365284,1945:176553},
    MTO:{1943:112193,1944:183528,1945:58811}};
  // Table 159. Combat-mission aircraft losses, ETO only. Distinct denominator
  // from Table 104 first-line losses incl. accidents on or off combat missions.
  // [year, month, total, enemy aircraft, antiaircraft fire, other causes].
  // The table supplies only ANNUAL 1942/1943 totals, MONTHLY 1944–May 1945.
  const usCombatLossesRows={
    Fighter:[
      [1944,0,69,57,6,6],[1944,1,103,69,13,21],[1944,2,191,54,46,91],
      [1944,3,280,201,60,19],[1944,4,340,176,98,66],[1944,5,540,147,226,167],
      [1944,6,326,65,153,108],[1944,7,546,100,294,152],[1944,8,357,104,190,63],
      [1944,9,349,99,198,52],[1944,10,298,80,164,54],[1944,11,366,141,163,62],
      [1945,0,274,72,162,40],[1945,1,299,38,208,53],[1945,2,419,76,244,99],
      [1945,3,343,36,207,100],[1945,4,36,5,16,15]
    ],
    'Heavy bomber':[
      [1944,0,203,139,27,37],[1944,1,271,170,81,20],[1944,2,345,178,112,55],
      [1944,3,420,314,105,1],[1944,4,376,211,122,43],[1944,5,320,112,162,46],
      [1944,6,352,80,201,71],[1944,7,331,61,238,32],[1944,8,374,137,207,30],
      [1944,9,177,36,112,29],[1944,10,209,50,146,13],[1944,11,119,28,74,17],
      [1945,0,314,49,222,43],[1945,1,196,14,157,25],[1945,2,266,63,164,39],
      [1945,3,190,72,77,41],[1945,4,7,1,4,2]
    ],
    'Medium/light bomber':[
      [1944,0,5,1,2,2],[1944,1,19,4,14,1],[1944,2,15,2,9,4],
      [1944,3,32,1,25,6],[1944,4,45,10,28,7],[1944,5,44,25,12,7],
      [1944,6,34,5,23,6],[1944,7,91,2,75,14],[1944,8,27,0,25,2],
      [1944,9,26,0,24,2],[1944,10,31,1,18,12],[1944,11,118,42,48,28],
      [1945,0,58,0,28,30],[1945,1,85,4,68,13],[1945,2,89,5,52,32],
      [1945,3,46,11,18,17],[1945,4,0,0,0,0]
    ]
  };
  const usCombatLosses=Object.fromEntries(Object.entries(usCombatLossesRows).map(([name,rows])=>[
    name,rows.map(([year,month,total,enemy,flak,other])=>({i:at(year,month),year,month,
      total,enemy,flak,other,source:'digest159',quality:'recorded'}))]));
  const usCombatLossesAnnual={
    Fighter:{1942:{total:10,enemy:10,flak:0,other:0},1943:{total:178,enemy:161,flak:1,other:16},1944:{total:3765,enemy:1293,flak:1611,other:861},1945:{total:1371,enemy:227,flak:837,other:307}},
    'Heavy bomber':{1942:{total:42,enemy:37,flak:0,other:5},1943:{total:1036,enemy:700,flak:228,other:108},1944:{total:3497,enemy:1516,flak:1587,other:394},1945:{total:973,enemy:199,flak:624,other:150}},
    'Medium/light bomber':{1942:{total:3,enemy:2,flak:0,other:1},1943:{total:47,enemy:16,flak:23,other:8},1944:{total:487,enemy:93,flak:303,other:91},1945:{total:278,enemy:20,flak:166,other:92}}
  };
  const pilotAttrition=[...Array.from({length:107},(_,i)=>{
    const r=base.rate(i);return r.quality==='documented'?point(base.at(i).y,base.at(i).m,Math.round(r.value*1000)/10,'murray'):null;
  }).filter(Boolean)];
  // Counts in the source only for these months; earlier percentages do NOT
  // authorize fabricated headcounts from a simulated nominal force strength.
  const pilotCasualtyCounts=[...base.pilotCasualties43.map(([m,n])=>point(1943,m,n,'murray')),
    ...base.pilotCasualties44.map(([m,n])=>point(1944,m,n,'murray'))];
  const rafReady1940={
    'Spitfire':points([[1940,6,199],[1940,7,208],[1940,8,209]],'raf1940'),
    'Hurricane':points([[1940,6,347],[1940,7,350],[1940,8,349]],'raf1940')
  };
  // Historical date facts; do not extend the 1945 Europe campaign beyond 8 May.
  const milestones=[
    {i:at(1936,6),title:'Condor Legion origins',detail:'A small deployed volunteer/rotating force, not the entire wartime Luftwaffe.'},
    {i:at(1939,8),title:'War begins in Europe',detail:'German campaign air units expand; RAF is already tracking operational strength.'},
    {i:at(1940,6),title:'Battle of Britain',detail:'Combat losses, wounded and captured crews depleted veteran fighter units; no complete longitudinal German pilot cohort is available here.'},
    {i:at(1941,5),title:'Invasion of the Soviet Union',detail:'Very different fighter workloads and engagement rates in East and West.'},
    {i:at(1943,6),title:'COSSAC outline plan',detail:'Cross-Channel operation planning has proceeded; D-Day preparation is an interval, not a single start date.'},
    {i:at(1943,9),title:'Second Schweinfurt',detail:'Bomber losses demonstrate escort limitations. German pilots and airframes are also heavily attrited.'},
    {i:at(1944,1),title:'Big Week',detail:'USAAF escort force still has a large P-47 presence as P-51 strength grows.'},
    {i:at(1944,5),title:'D-Day',detail:'6 June 1944. Thereafter escort and ground-support assignments evolve.'},
    {i:at(1945,0),title:'Operation Bodenplatte',detail:'1 January 1945. German airfield attacks consumed aircraft and scarce trained crews, on top of continuing Allied pressure.'},
    {i:at(1945,4),title:'War ends in Europe',detail:'8 May 1945; incomplete returns should not be translated into fabricated losses.'}
  ];
  function sample(series,i,{allowExtrapolate=false}={}){
    if(!series?.length)return {value:null,quality:'unavailable',source:null};
    const exact=series.find(p=>p.i===i);if(exact)return {...exact};
    const lo=series.filter(p=>p.i<i).at(-1),hi=series.find(p=>p.i>i);
    if(!lo||!hi){if(!allowExtrapolate)return {value:null,quality:'unavailable',source:null};return {...(lo||hi),quality:'estimated-low',note:'Scenario extension beyond nearest reported snapshot'};}
    const value=Math.round(lo.value+(hi.value-lo.value)*(i-lo.i)/(hi.i-lo.i));
    return {i,value,source:lo.source===hi.source?lo.source:lo.source+'+'+hi.source,quality:'interpolated',note:'Linearly interpolated between dated source snapshots ('+(hi.i-lo.i)+'-month span); no monthly observation'+(hi.i-lo.i>6?'; long gap, low confidence':'')};
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
  window.LuftV4Data={SOURCES,usa,raf,usaAnnualAccepted,usaCosts,usCrews,usaFighterLossMonthly,usaFighterLossAnnual,usaFighterClaimsAnnual,usaFighterClaimsMonthly,usaFighterSorties,usaFighterSortiesAnnual,usCombatLosses,usCombatLossesAnnual,
    pilotAttrition,pilotCasualtyCounts,rafReady1940,flyingHours,germanProductionNew43,
    germanSingle,germanFront,germanFw,sectorShares,theaterLosses,milestones,sample,airframe,share,germanType};
})();
