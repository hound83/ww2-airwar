/* v7 archive inventory and directly traceable German personnel/operational returns.
 * Catalog entries are discoverable original documents, NOT transcribed aircraft
 * loss counts. Neither absence of a return nor an empty date means zero loss.
 */
(function(){
  'use strict';
  const D=window.LuftData;
  if(!D)throw Error('LuftData must load before the v7 archive.');
  const idx=D.idx;
  const raf='https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/';
  const sourceIndex={
    galland44:{short:'RAF AHB VII/71 · 15–16 May 1944',title:'Göring–Galland conference: April 1944 fighter-pilot losses, reinforcements and training',url:raf+'notes-on-discussions-with-reichsmarschall-goering-held-on-15th-16th-may-1944-on-the-subject-of-fighters-and-fighter-personnel/',type:'Primary: captured German command conference, RAF translation',note:'Galland reports 489 April fighter pilots lost and 396 replacements; 100 and 62 officers respectively. Command-level reported casualty percentages use different denominators. Compare, do not substitute for Murray Table LXVIII 447.'},
    murray7:{short:'Murray, Strategy for Defeat, ch. VII',title:'German fighter-pilot strength, JG 53 unit case studies and Luftflotte Reich readiness',url:'https://www.ibiblio.org/hyperwar/AAF/AAF-Luftwaffe/AAF-Luftwaffe-7.html',type:'Secondary scholarly history based on wartime German files',note:'2,395 single-engine fighter pilots on frontline strength 31 Dec 1943, of whom 1,491 fully combat ready and 291 partly ready; source gives two JG53 unit case studies and Table LIX Reich-only readiness 1944.'},
    capturedloss:{short:'RAF AHB German losses · original document index',title:'Twenty separately dated original German aircraft loss translation volumes',url:'https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-german-translations/',type:'Primary: RAF translations of captured German Quartermaster returns',note:'The individual scanned originals cover different commands and time windows; listed here as an archive coverage guide only. Aircraft-type losses must be transcribed from the tables before numerical use.'},
    nurembergL166:{short:'Nuremberg document L-166',title:'Captured Goering–Galland conference minutes, reproduced in Nuremberg evidence',url:'https://tile.loc.gov/storage-services/service/ll/llmlp/2011525363_NT_Nazi_Vol-VII/2011525363_NT_Nazi_Vol-VII.pdf',type:'Primary source reproduced in U.S. government trial-document collection',note:'Independent reproduction of same May 1944 German conference underlying RAF AHB VII/71, NOT an independent April casualty measurement.'}
  };
  const pilotApril={i:idx(1944,3),date:'April 1944',losses:489,replacements:396,officerLosses:100,officerReplacements:62,flowDifference:-93,
    alternativeMurray447:447,source:'galland44',quality:'recorded',note:'Two reports have different underlying definitions/populations; the reason for 489 versus 447 is not established. A reported reinforcement flow is not identical to net unit-strength movement.'};
  const pilotBaseline={i:idx(1943,11),date:'31 December 1943',total:2395,fullyReady:1491,partlyReady:291,notFullyOrPartly:613,
    source:'murray7',quality:'recorded-secondary',scope:'Frontline single-engine German fighter pilots, NOT all Luftwaffe aircrews'};
  const reichReadiness=[
    [1944,5,1,788,472,203,83],[1944,6,1,388,242,156,64],[1944,6,27,460,273,94,42]
  ].map(([year,month,day,seOn,seReady,teOn,teReady])=>({i:idx(year,month),date:day+' '+D.label(idx(year,month)),seOn,seReady,teOn,teReady,
    source:'murray7',quality:'recorded-secondary',scope:'Luftflotte Reich only; NOT all-front Luftwaffe strength'}));
  const fuelCapacity=[
    [1944,7,46,65],[1944,8,48,30],[1944,9,43,37],[1944,10,60,65],
    [1944,11,59,56],[1945,0,51,33],[1945,1,40,5]
  ].map(([year,month,allFuel,aviationFuel])=>({i:idx(year,month),label:D.label(idx(year,month)),allFuel,aviationFuel,
    source:'murray7',quality:'recorded-secondary',scope:'Percent of reported production capacity, NOT tonnes produced or fuel physically available at airfields'}));
  const jg53=[
    {unit:'III./JG 53',month:'April 1944',i:idx(1944,3),avgAircraft:23,avgReady:16,combatAircraftLost:9,noncombatAircraftWrittenOff:6,
      killed:5,injured:2,sorties:431,operations:38,daysActive:24,note:'Wartime unit log reproduced by Murray; 9 combat and 6 noncombat aircraft are distinct write-off causes, not total personnel losses.'},
    {unit:'II./JG 53',month:'May 1944',i:idx(1944,4),avgAircraft:34,avgReady:20,aircraftFullyDestroyed:34,aircraftDamagedOrLost:53,
      killed:7,missing:5,wounded:3,injured:7,injuredNoncombat:2,daysActive:13,engagedScrambles:15,
      note:'Original reporting separates 53 lost/damaged aircraft from 34 completely destroyed. Personnel categories may overlap and cannot be simply summed.'}
  ];
  const catalogRaw=[
    [83,'All fronts',1939,8,1940,11,'german-aircraft-losses-september-1939-december-1940'],
    [92,'All fronts',1941,0,1941,11,'german-aircraft-losses-january-1941-december-1941'],
    [150,'Mediterranean',1943,8,1943,11,'luftwaffe-losses-in-the-mediterranean-1-september-31-december-1943'],
    [147,'Mediterranean',1944,6,1944,10,'luftwaffe-losses-in-the-mediterranean-luftflotte-2-and-luftwaffe-kommando-sud-ost-1-july-30-november-1944'],
    [157,'Reich',1943,5,1943,7,'luftwaffe-losses-defence-of-the-reich-luftwaffe-befehlshaber-mitte-1-june-31-august-1943'],
    [149,'Reich',1943,8,1943,11,'luftwaffe-losses-in-the-area-of-luftflotte-reich-1-september-31-december-1943'],
    [138,'Reich',1944,0,1944,3,'luftwaffe-losses-in-the-area-of-luftflotte-reich-january-april-1944'],
    [134,'Reich',1944,4,1944,4,'luftwaffe-losses-in-the-area-of-luftflotte-reich-may-1944'],
    [139,'Reich',1944,5,1944,5,'luftwaffe-losses-in-the-area-of-luftflotte-reich-june-1944'],
    [142,'Reich',1944,6,1944,8,'luftwaffe-losses-in-the-area-of-luftflotte-reich-july-september-1944'],
    [143,'Reich',1944,9,1944,10,'luftwaffe-losses-in-the-area-of-luftflotte-reich-october-november-1944'],
    [148,'Western Front',1943,8,1943,11,'luftwaffe-losses-on-the-western-front-luftflotte-3-1st-september-31st-december-1943'],
    [135,'Western Front',1944,0,1944,3,'luftwaffe-losses-on-the-western-front-luftflotte-3-1st-january-30th-april-1944'],
    [133,'Western Front',1944,4,1944,4,'luftwaffe-losses-on-the-western-front-luftflotte-3-may-1944'],
    [136,'Western Front',1944,5,1944,5,'luftwaffe-losses-on-the-western-front-luftflotte-3-june-1944'],
    [144,'Western Front',1944,6,1944,7,'luftwaffe-losses-on-the-western-front-luftflotte-3-1st-july-31st-august-1944'],
    [145,'Western Front',1944,8,1944,10,'luftwaffe-losses-on-the-western-front-luftflotte-3-renamed-luftwaffe-kommando-west-on-20th-september-1944-1st-september-30th-november-1944'],
    [152,'Eastern Front',1943,8,1943,11,'luftwaffe-losses-on-the-eastern-front-1st-september-31st-december-1943'],
    [151,'Norway',1943,8,1943,11,'luftwaffe-losses-in-western-norway-luftflotte-5-west-1st-september-31st-december-1943'],
    [146,'Norway',1944,6,1944,10,'luftwaffe-losses-in-norway-luftwaffe-5-west-1st-july-30th-november-1944']
  ];
  const lossCatalog=catalogRaw.map(([number,theater,sy,sm,ey,em,slug])=>({id:'VII/'+number,theater,start:idx(sy,sm),end:idx(ey,em),
    from:D.label(idx(sy,sm)),to:D.label(idx(ey,em)),url:raf+slug+'/',transcribed:false,
    quality:'unavailable',status:'Archival loss return located; month/type totals not yet transcribed'}));
  const QA={version:'7.0',pilotApril:()=>({...pilotApril}),originalLossReports:()=>lossCatalog.length,
    archiveCoverage:(a,b,theater='All')=>lossCatalog.filter(r=>r.start<=b&&r.end>=a&&(theater==='All'||theater===r.theater))};
  window.AirWarV7Data={sourceIndex,pilotApril,pilotBaseline,reichReadiness,fuelCapacity,jg53,lossCatalog};
  window.AirWarV7QA=QA;
})();
