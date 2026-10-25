/* European Air War Atlas v6: source-checked archive additions.
 * Original paper series are stored as dated observations, NOT a continuous
 * reconstructed monthly census. The scope of every reported number matters.
 */
(function(){
  'use strict';
  const L=window.LuftData;
  if(!L)throw Error('Load LuftData before the v6 archive');
  const index=L.idx;
  const sourceIndex={
    ahb107:{short:'RAF AHB VII/107 (1951)',title:'Captured German Luftwaffe strength and serviceability returns, August 1938–April 1945',url:'https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-strength-and-serviceability-tables-august-1938-april-1945/',type:'Original German Quartermaster records, translated and published by the RAF',note:'All-front German aircraft by aircraft CLASS. One entry per dated return. Strength is aircraft on hand; serviceable is the ready subset. This is NOT Bf 109-specific strength, fighter pilots, or the force deployed over Britain.'},
    ushistory3:{short:'Craven & Cate, official USAAF history Vol. III',title:'The Army Air Forces in World War II, Volume III: Europe, ARGUMENT to V-E Day',url:'https://www.ibiblio.org/hyperwar/AAF/III/',type:'Official USAF multi-author historical history (1951)',note:'22 chapters (January 1944–May 1945), including contemporary operation returns, tables and maps. Some wartime estimates are challenged or marked provisional by their authors.'},
    argument:{short:'USAAF official history III, ch. 2',title:'Big Week: reconciled February–March 1944 claims, sorties and losses',url:'https://www.ibiblio.org/hyperwar/AAF/III/AAF-III-2.html',type:'Official historical operational study using Allied and captured German returns',note:'Big Week 20–25 February 1944: approximate sorties and losses are CAMPAIGN totals, not monthly aircraft strength. The authors flag incompatible German loss registers and a possible February fighter revision.'},
    marshall:{short:'Eighth Fighter Command operations compilation',title:'Eighth Air Force Fighter Command, Summary of Combat Operations, WWII',url:'https://www.wwiiaircraftperformance.org/marshall/SUMMARY_OF_COMBAT_OPERATIONS.pdf',type:'Research compilation from original Victory Credits Board, MACRs, USAF 85 and Fighter Group records',note:'Group-by-group attributed 8th Fighter Command AIR/GROUND victory credits and loss classifications across its war. The compiler openly makes judgment calls on uncertain loss cause. Not all USAAF theaters, not monthly, not verified German destruction.'},
    ussbs:{short:'US Strategic Bombing Survey (1945)',title:'United States Strategic Bombing Survey, Summary Report (European War)',url:'https://www.ibiblio.org/hyperwar/AAF/USSBS/ETO-Summary.html',type:'Original postwar U.S. strategic bombing survey',note:'German production, dispersal and engine bottlenecks; accepted production is not aircraft remaining in service. Original German figures were collected from manufacturers and captured records.'},
    ahbloss:{short:'RAF AHB German aircraft-loss translations',title:'Translations from Captured German Documents: aircraft losses by theater and cause',url:'https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-german-translations/',type:'Original German records in postwar RAF archival translations',note:'1939–41 all-front returns, 1943–44 Defense of Reich, Western, Eastern and Mediterranean theaters. Coverage and reporting delays differ. Incomplete 1945 loss reports must NOT be treated as zero.'},
    wiki:{short:'Wikipedia research cross-references',title:'Wikipedia campaign and equipment articles, traced back to their cited histories',url:'https://en.wikipedia.org/wiki/Category:World_War_II_aerial_operations_and_battles',type:'Research discovery only (tertiary)',note:'Wikipedia is used to discover campaign terms, contrasting interpretations, book citations and links to original material. Its infobox counts do NOT automatically become input to the historical ledger.'},
    price:{short:'Alfred Price, The Luftwaffe Data Book (1997)',title:'Luftwaffe Serviceable Aircraft Strengths (1940–45) – Wikipedia transcription of Price',url:'https://en.wikipedia.org/wiki/Luftwaffe_serviceable_aircraft_strengths_(1940%E2%80%931945)',type:'Secondary monograph reproduced by a tertiary article',note:'Independent published comparator, NOT merged with RAF AHB VII/107: categories and dates do not match exactly; e.g. 17 August 1940 Price reports 787 compared with AHB VII/107 853 for serviceable single-engine fighters.'},
    murrayBook:{short:'Williamson Murray, Strategy for Defeat (1983)',title:'Strategy for Defeat: The Luftwaffe, 1933–1945',url:'https://www.airuniversity.af.edu/Portals/10/AUPress/Books/B_0012_MURRAY_STRATEGY_FOR_DEFEAT.pdf',type:'Air University scholarly history using BA/MA German wartime returns',note:'Tables on losses, fighter-pilot strength, production and personnel. Source of the existing Murray attrition model; cite table and dates, rather than accepting every extrapolation.'},
    ninthSep44:{short:'USAAF official history III, ch. 17',title:'Check at the Rhine: September 1944 Allied average daily air strengths',url:'https://www.ibiblio.org/hyperwar/AAF/III/AAF-III-17.html',type:'Official historical operational study / original organizational counts',note:'Table of daily average total and operational fighters for Ninth AF, 2nd Tactical AF, Eighth AF and Fifteenth AF. Also reports Luftflotte Kommando West fighter strength 431 on 25 September; cannot equate it to worldwide Luftwaffe fighter strength.'},
    digestPortal:{short:'USAAF Statistical Digest (1945)',title:'Army Air Forces Statistical Digest, World War II – official table index',url:'https://www.ibiblio.org/hyperwar/AAF/StatDigest/index.html',type:'Original USAAF Office of Statistical Control publication',note:'Personnel Tables 54–70, fighter aircraft loss Tables 104 and 159, fighter sorties Table 128 and claims Table 167 have distinct definitions; see footnotes and partial table transcriptions.'},
    ushistory2:{short:'USAAF official history Vol. II',title:'Army Air Forces in World War II, Volume II: Europe, Torch to Pointblank',url:'https://www.ibiblio.org/hyperwar/AAF/II/',type:'Official historical study of the 1942–43 European air war',note:'Research continuity for operations and escort context preceding Volume III. References need matching to source tables before numeric import.'},
    rafGerman:{short:'RAF AHB translations from German archives',title:'German wartime aerial-loss translation index, 1939–44',url:'https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-german-translations/',type:'Original German Quartermaster loss documents / RAF AHB archive',note:'Individual German reports 83/92 and 133–52, including Defense of Reich, France, Eastern Front, Scandinavia, Mediterranean. Quarter, theater and cause need to be respected.'},
    bund:{short:'German Federal Archives',title:'Bundesarchiv: researching lost aircraft and crews',url:'https://www.bundesarchiv.de/en/research-our-records/research-by-topic/the-fate-of-downed-airplanes-and-their-crews-in-the-second-world-war/',type:'Official archival finding aid',note:'Points to unit and operation-level aircraft loss documents. Not a digitized monthly German census or a direct quantitative source.'},
    nararg18:{short:'US National Archives, Record Group 18',title:'Records of the Army Air Forces, 1903–1964',url:'https://www.archives.gov/research/guide-fed-records/groups/018.html',type:'Original archival finding aid',note:'Eighth Air Force tactical mission reports, 1943–45, and Bomber Command reports are listed; archival catalog records are leads, not extracted numerical observations.'},
    afhra:{short:'Air Force Historical Research Agency',title:'US Air Force historical archives',url:'https://www.dafhistory.af.mil/',type:'Official American historical archive / finding aid',note:'Follow-up source for original unit histories and mission reports. Not yet extracted as a model-specific monthly series.'},
    boylan:{short:'Boylan, USAF Historical Study 136 (1955)',title:'Development of the Long-Range Escort Fighter',url:'https://www.dafhistory.af.mil/Portals/16/documents/Studies/101-150/AFD-090529-044.pdf',type:'Official USAF historical research monograph / 321-page study',note:'Found via the P-51 Mustang bibliography and verified in the official USAF numbered-study index. A full 1955 analysis of the long-range escort role; this PDF was indexed but could not be read in full, so no unsourced range or price figure was extracted.'},
    russell:{short:'Edward T. Russell, USAF (1999)',title:'Leaping the Atlantic Wall: Army Air Forces Campaigns in Western Europe 1942–1945',url:'https://media.defense.gov/2025/Jun/12/2003737774/-1/-1/0/LEAPING_THE_ATLANTIC_WALL.PDF',type:'Official US Air Force History and Museums campaign monograph',note:'Found via Big Week Wikipedia bibliography; an official 36-page campaign booklet with Western theater scope. Catalog and text snippets verified, but the complete linked PDF could not be fetched; no quantitative figures imported.'},
    ussbsIndustry:{short:'USSBS, Aircraft Division Industry Report (1945)',title:'Strategic Bombing of the German Aircraft Industry',url:'https://www.trumanlibrary.gov/library/federal-record/records-united-states-strategic-bombing-survey',type:'Original U.S. Strategic Bombing Survey aircraft-industry and individual plant records, RG 243',note:'Bf 109 Wikipedia cites original Aircraft Division Report Exhibit I. Truman Presidential Library catalog lists Aircraft Division Report 4 and separate Focke Wulf and Messerschmitt plant reports, Smithsonian holds the 1945 study. The original exhibit has not yet been separately transcribed.'}
  };
  // From RAF Air Historical Branch translation VII/107 (1951), individual
  // end-of-report-date columns. Transcribed from scanned 44-page ORIGINAL,
  // cross-checked against the two-column strength/serviceability layout.
  // [year, month 0-based, day, S.E. fighter strength, S.E. serviceable, scan page]
  const rows=[
    [1938,7,1,643,453,2],[1939,7,26,788,686,4],[1939,8,2,771,676,4],
    [1940,2,30,1258,817,9],[1940,7,17,1076,853,12],[1940,8,28,932,721,13],
    [1941,5,14,1500,1110,20],[1941,11,27,1298,670,24],
    [1942,5,30,1353,926,28],[1942,11,31,1360,908,31],
    [1943,3,30,1582,1040,33],[1943,4,31,1786,1255,34],
    [1943,5,30,1849,1361,34],[1943,7,31,1581,1019,35],
    [1943,11,31,1561,1095,37],[1944,2,31,1696,1188,39],
    [1944,3,30,1648,1114,39],[1944,4,31,1683,1111,40],
    [1944,5,30,1523,895,40],[1944,6,31,1937,1193,41],
    [1944,7,31,1610,1043,41],[1944,8,30,1984,1413,42],
    [1944,9,31,3055,2487,42],
    [1944,10,30,2998,2256,43],[1944,11,31,2260,1521,43],
    [1945,0,10,2265,1610,44],[1945,3,13,2173,1648,44]
  ];
  const germanFighterReadiness=rows.map(([year,month,day,strength,serviceable,page])=>({
    i:index(year,month),year,month,day,strength,serviceable,
    readyPct:100*serviceable/strength,source:'ahb107',quality:'recorded',
    scope:'Luftwaffe all-front single-engine fighter class',
    date:`${day} ${L.label(index(year,month))}`,page,
    note:`Original German all-front S.E. fighter return dated ${day} ${L.label(index(year,month))}; AHB VII/107 scan p. ${page}.`
  }));
  // Captured RAF 107 returns for *other* German aircraft categories, shown as
  // dated source snapshots, not forced into an interpolated full class history.
  // Apr 1945 original no comparable T.E. / fighter-bomber cells: leave absent.
  const germanClassSnapshots=[
    {year:1943,month:5,day:30,values:{'Single-engine fighter':[1849,1361],'Night fighter':[585,391],'Twin-engine fighter':[194,134],'Bomber':[1663,1070],'Ground attack':[220,171]}},
    {year:1944,month:3,day:30,values:{'Single-engine fighter':[1648,1114],'Night fighter':[602,413],'Twin-engine fighter':[321,153],'Bomber':[1201,803],'Dive bomber / ground attack combined':[799,585]}},
    {year:1945,month:0,day:10,values:{'Single-engine fighter':[2265,1610],'Night fighter':[1194,822],'Twin-engine fighter':[102,88],'Bomber':[772,561],'Dive bomber / ground attack combined':[872,709]}},
    {year:1945,month:3,day:13,values:{'Single-engine fighter':[2173,1648],'Night fighter':[480,344],'Bomber':[83,36],'Dive bomber / ground attack combined':[1080,930]}}
  ].map(x=>({...x,i:index(x.year,x.month),source:'ahb107',quality:'recorded'}));
  // Explicitly scope these to Eighth Air Force FIGHTER COMMAND throughout
  // operations, 1942–April 1945. Fractional credits come from shared awards.
  // The compiled loss cause classifications contain author judgment.
  const eighthFighterTypes=[
    {type:'Spitfire',air:13,ground:0,airLoss:3,strafingLoss:11},
    {type:'P-47',air:1550.5,ground:739,airLoss:214,strafingLoss:200},
    {type:'P-38',air:278.5,ground:161.5,airLoss:101,strafingLoss:109},
    {type:'P-51',air:3328,ground:3212.8,airLoss:326,strafingLoss:570}
  ].map(x=>({...x,source:'marshall',quality:'recorded-secondary',scope:'USAAF Eighth Fighter Command entire war; NOT entire ETO or MTO'}));
  // The compiler's own report has a ONE-AIRCRAFT discrepancy: its group
  // subtotals and type rows sum to 890, but the final "All types" line says
  // 889. Expose BOTH; never silently repair the original.
  const eighthAggregate={air:5170,ground:4113.3,airLoss:644,strafingLoss:890,printedStrafingLoss:889};
  const campaignCases=[
    {id:'spain',a:index(1936,6),b:index(1939,2),name:'Condor Legion / Spanish Civil War',scale:'Rotating small volunteer force',note:'A cumulative count of participants is NOT the number simultaneously deployed. No verified 1936 national pilot headcount is used here. The RAF AHB VII/107 aircraft returns begin only in August 1938, not July 1936.',source:'wiki',wiki:'https://en.wikipedia.org/wiki/Condor_Legion'},
    {id:'britain',a:index(1940,6),b:index(1940,9),name:'Battle of Britain',scale:'UK air defense vs deployed Luftflotten',note:'Luftwaffe worldwide serviceability is NOT aircraft available over southern England. Attrition of trained crews had lasting effects, but no named-cohort survival percentage exists.',source:'ahb107',wiki:'https://en.wikipedia.org/wiki/Battle_of_Britain'},
    {id:'barbarossa',a:index(1941,5),b:index(1941,11),name:'Operation Barbarossa air campaign',scale:'Eastern theater, 1941',note:'Air claims and Soviet loss records require theater-specific matching. German all-front aircraft strength cannot be labeled Eastern Front strength.',source:'ahbloss',wiki:'https://en.wikipedia.org/wiki/Operation_Barbarossa'},
    {id:'citadel',a:index(1943,6),b:index(1943,7),name:'Kursk / Operation Citadel',scale:'Eastern Front peak battle',note:'Published air losses change radically with date window and the inclusion of operational losses; no single Wikipedia figure is the universal German fighter-loss count.',source:'ahbloss',wiki:'https://en.wikipedia.org/wiki/Battle_of_Kursk'},
    {id:'schweinfurt',a:index(1943,9),b:index(1943,9),name:'Second Schweinfurt',scale:'Eighth Air Force daylight bombing',note:'Escort range and mission exposure matter more than simple aircraft superiority claims.',source:'ushistory3',wiki:'https://en.wikipedia.org/wiki/Second_Raid_on_Schweinfurt'},
    {id:'bigweek',a:index(1944,1),b:index(1944,1),name:'Big Week / Operation Argument',scale:'20–25 February 1944',note:'The official history documents 2,548 Eighth, 712 Ninth and 413 Fifteenth USAAF fighter sorties supporting heavy bombers, 28 USAAF fighter losses, and about 226 U.S. heavy bombers lost. RAF also flew nighttime raids; definitions differ.',source:'argument',wiki:'https://en.wikipedia.org/wiki/Big_Week'},
    {id:'overlord',a:index(1944,5),b:index(1944,7),name:'Overlord / Normandy',scale:'6 June–August 1944',note:'Allied strategic escort, tactical air cover and battlefield interdiction are different mission populations. UK-based U.S. and RAF fighter strengths should not be combined without scope alignment.',source:'ushistory3',wiki:'https://en.wikipedia.org/wiki/Air_war_during_Operation_Overlord'},
    {id:'bodenplatte',a:index(1945,0),b:index(1945,0),name:'Operation Bodenplatte',scale:'1 January 1945',note:'One raid and its irrecoverable combat leaders is not the entire German January pilot loss rate. The archival losses and claim definitions must be checked independently.',source:'ahbloss',wiki:'https://en.wikipedia.org/wiki/Operation_Bodenplatte'}
  ];
  // Same theater / date. The official source warns that the February German
  // fighter figure may be 456+77 = 533 due retrospective ledger revisions.
  const bigWeekOfficial={
    a:index(1944,1),b:index(1944,1),source:'argument',
    usFighterSorties:{eighth:2548,ninth:712,fifteenth:413},
    usHeavyBomberLosses:{eighth:137,fifteenth:89},
    usFighterLosses:28,rafHeavyBomberLosses:157,
    germanWesternFighterLost:[
      {i:index(1944,0),min:307,max:307,label:'Jan 1944'},
      {i:index(1944,1),min:456,max:533,label:'Feb 1944'},
      {i:index(1944,2),min:567,max:567,label:'Mar 1944'}
    ]
  };
  const chapterTitles=[
    'Winter Bombing','Big Week','Plan for Overlord','Crossbow','The Ninth Air Force',
    'Pre-Invasion Operations','Normandy','The Battle of France','The Strategic Bomber Strikes Ahead',
    'Anzio','Rome','Invasion of Southern France','Battle of Northern Italy','Air Support for the Underground',
    'Crossbow—Second Phase','Logistical Mobility','Check at the Rhine',
    'Autumn Assault on Germany','Battle of the Bulge','The Climax of Strategic Operations',
    'From the Rhine to the Elbe','Mission Accomplished'
  ];
  const historyChapters=chapterTitles.map((title,k)=>({chapter:k+1,title,source:'ushistory3',
    url:`https://www.ibiblio.org/hyperwar/AAF/III/AAF-III-${k+1}.html`,
    theatre:k+1>=10&&k+1<=14?'Mediterranean':'Western Europe / strategic'}));
  // Curated research entry points; source bibliography under each article is a
  // RESEARCH TRAIL, not a validated set of quantitative observations.
  const wikiTopics=[
    ['Campaign','Condor Legion','Condor_Legion','Caldwell / German unit histories'],
    ['Campaign','Battle of Britain','Battle_of_Britain','Mason; RAF AHB VII/83 and VII/107'],
    ['Campaign','Operation Barbarossa','Operation_Barbarossa','German Quartermaster 1941; Murray'],
    ['Campaign','Battle of Kursk','Battle_of_Kursk','Glantz; Bergström; incompatible loss periods'],
    ['Records','German aircraft production by year','German_aircraft_production_during_World_War_II','Vajda & Dancey; unsourced per-cell annual production totals'],
    ['Campaign','Defence of the Reich','Defence_of_the_Reich','Caldwell & Muller; Murray; wartime operations'],
    ['Campaign','Second Schweinfurt','Second_Raid_on_Schweinfurt','Official USAAF history Vol. II / III'],
    ['Campaign','Big Week','Big_Week','USAAF official history III, ch. 2'],
    ['Campaign','Operation Overlord','Operation_Overlord','USAAF official history III, ch. 3, 6–8'],
    ['Campaign','Air war during Overlord','Air_war_during_Operation_Overlord','USAAF III; AHB Western Front records'],
    ['Campaign','Operation Bodenplatte','Operation_Bodenplatte','Manrho & Pütz; RAF AHB loss documents'],
    ['Records','Luftwaffe serviceable aircraft strengths','Luftwaffe_serviceable_aircraft_strengths_(1940%E2%80%931945)','Alfred Price; cross-check with AHB VII/107'],
    ['Records','Operational history of Luftwaffe','Operational_history_of_the_Luftwaffe_(1939%E2%80%931945)','Murray; German archives'],
    ['Equipment','Messerschmitt Bf 109','Messerschmitt_Bf_109','Subtype production vs Jagd strength'],
    ['Equipment','Focke-Wulf Fw 190','Focke-Wulf_Fw_190','Fighter/fighter-bomber role separation'],
    ['Equipment','Messerschmitt Me 262','Messerschmitt_Me_262','Separate jet fighter accounting'],
    ['Equipment','Republic P-47 Thunderbolt','Republic_P-47_Thunderbolt','Eighth vs Ninth AF roles and claims'],
    ['Equipment','North American P-51 Mustang','North_American_P-51_Mustang','Merlin variants, theater entry and escorts'],
    ['Equipment','Lockheed P-38 Lightning','Lockheed_P-38_Lightning','Twin-engine category, ETO/MTO distinction'],
    ['Equipment','Supermarine Spitfire','Supermarine_Spitfire','RAF Command strengths and role changes'],
    ['Equipment','Hawker Typhoon','Hawker_Typhoon','2nd TAF tactical ground attack'],
    ['Equipment','Hawker Tempest','Hawker_Tempest','Late 1944/45 RAF interception'],
    ['Equipment','Boeing B-17 Flying Fortress','Boeing_B-17_Flying_Fortress','Eighth AF bomber attrition denominator'],
    ['Equipment','Consolidated B-24 Liberator','Consolidated_B-24_Liberator','Bomber-class loss and theater definitions']
  ].map(([section,name,page,bibliography])=>({section,name,bibliography,
    url:`https://en.wikipedia.org/wiki/${page}`,source:'wiki',quality:'discovery'}));
  // Which Wikipedia REFERENCES were actually inspected, and where the
  // references led. A bibliographic lead is not presented as a checked fact.
  const researchTrails=[
    {from:'Condor Legion',to:'Gordon Westwell, Condor Legion (2004)',kind:'Specialist secondary unit history',status:'bibliography',url:'https://en.wikipedia.org/wiki/Condor_Legion',role:'Rotating personnel, units and aircraft in Spain; direct text not yet consulted, so no national 1936 pilot census inferred.'},
    {from:'Condor Legion',to:'Stefanie Schüler-Springorum, Krieg und Fliegen (2010)',kind:'Scholarly German-language study',status:'bibliography',url:'https://en.wikipedia.org/wiki/Condor_Legion',role:'German combat operations in Spain, cited on the page; original pages remain to be verified.'},
    {from:'Battle of Britain',to:'RAF AHB German Quartermaster returns VII/107',kind:'Original German return checked against battle infobox',status:'verified',url:sourceIndex.ahb107.url,role:'All-front 17 Aug 1940 1,076/853, unlike Alfred Price fighter 787, suggesting source/boundary differences.'},
    {from:'Battle of Britain',to:'RAF AHB German loss translation VII/83',kind:'Original German losses index',status:'index-verified',url:'https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/german-aircraft-losses-september-1939-december-1940/',role:'German losses vs all-front strength, a needed series before any Battle of Britain veteran-cohort death rate.'},
    {from:'Operation Bodenplatte',to:'John Manrho & Ron Pütz, Bodenplatte (2004)',kind:'Specialist German-airfield raid monograph',status:'bibliography',url:'https://en.wikipedia.org/wiki/Operation_Bodenplatte',role:'Original sortie/group losses and veteran casualty data. The article cites pp. 272–295; book not independently inspected.'},
    {from:'Operation Bodenplatte',to:'Norman Franks, Fighter Command Losses Vol. 3 (2000)',kind:'Specialist RAF loss register',status:'bibliography',url:'https://en.wikipedia.org/wiki/Operation_Bodenplatte',role:'RAF aircraft and crews for the January 1945 raid; not a German loss census.'},
    {from:'Defence of the Reich',to:'Williamson Murray, Strategy for Defeat (1983)',kind:'Accessible secondary with BA/MA records',status:'verified',url:sourceIndex.murrayBook.url,role:'Pilot attrition / fighter strength / Reich defense; monthly data in existing pilot views.'},
    {from:'Defence of the Reich',to:'Craven & Cate, official USAAF history Vol. III',kind:'Accessible official history',status:'verified',url:sourceIndex.ushistory3.url,role:'Big Week, force superiority, industrial campaign and 1944–45 Western operations.'},
    {from:'Defence of the Reich',to:'Donald Caldwell & Richard Muller, The Luftwaffe Over Germany (2007)',kind:'Specialist secondary monograph',status:'bibliography',url:'https://en.wikipedia.org/wiki/Defence_of_the_Reich',role:'Detailed German day fighter operations; pages 190–229 cited. Book text not independently digitized/checked; do not infer new figures.'},
    {from:'Defence of the Reich',to:'Hans Sperling, Die Luftkriegsverluste (1956)',kind:'German federal statistics secondary study',status:'bibliography',url:'https://en.wikipedia.org/wiki/Defence_of_the_Reich',role:'Potential German aggregate loss reconciliation; primary tables have not been inspected.'},
    {from:'Defence of the Reich',to:'Germany and the Second World War, Vol. VII (Boog/Krebs/Vogel)',kind:'Authoritative scholarly secondary study',status:'bibliography',url:'https://en.wikipedia.org/wiki/Defence_of_the_Reich',role:'Air war / production / operational doctrine; volume not yet fully available here.'},
    {from:'Defence of the Reich',to:'Werner Girbig, Six Months to Oblivion (1975)',kind:'Specialist secondary monograph',status:'bibliography',url:'https://en.wikipedia.org/wiki/Defence_of_the_Reich',role:'Late-war Luftwaffe western-fighter losses; check against RAF German returns before importing.'},
    {from:'Defence of the Reich',to:'Richard Overy, Why the Allies Won and related air-war studies',kind:'Scholarly secondary synthesis',status:'bibliography',url:'https://en.wikipedia.org/wiki/Defence_of_the_Reich',role:'Pilot training, 1944 fuel shortages and strategic assessments; no unverified series imported.'},
    {from:'Air war during Operation Overlord',to:'RAF AIR 24/1496 (2nd TAF ORB)',kind:'Original RAF operations record, cited through secondary source',status:'bibliography',url:'https://en.wikipedia.org/wiki/Air_war_during_Operation_Overlord',role:'Claimed basis for Normandy Allied losses; not directly opened, caution: Wikipedia page itself warns many claims lack inline citations.'},
    {from:'Air war during Operation Overlord',to:'Jean-Bernard Frappé, La Luftwaffe Face au Débarquement (1999)',kind:'Specialist secondary unit-level study',status:'bibliography',url:'https://en.wikipedia.org/wiki/Air_war_during_Operation_Overlord',role:'Cited source of German Normandy fighter losses; cannot substitute whole-war German losses.'},
    {from:'Air war during Operation Overlord',to:'Richard G. Davis, Bombing the European Axis Powers',kind:'USAF official historical study',status:'bibliography',url:'https://en.wikipedia.org/wiki/Air_war_during_Operation_Overlord',role:'Combined bomber offensive, missions and statistical tables; source lead found, figures not yet transcribed.'},
    {from:'Air war during Operation Overlord',to:'Craven & Cate III, chapters 3 and 5–8',kind:'Accessible official history',status:'verified',url:sourceIndex.ushistory3.url,role:'Coordinated pre-invasion air campaign, tactical operations, Normandy, and Battle of France.'},
    {from:'Luftwaffe serviceable aircraft strengths',to:'Alfred Price, The Luftwaffe Data Book (1997)',kind:'Secondary monograph transcribed on Wikipedia',status:'comparison',url:sourceIndex.price.url,role:'Independent snapshot table. The page reproduces 787 in Aug 1940 whereas RAF VII/107 reports 853 on its own date/category.'},
    {from:'Republic P-47 Thunderbolt',to:'Roger A. Freeman, Thunderbolt documentary history (1978)',kind:'Specialist secondary aircraft/unit monograph',status:'bibliography',url:'https://en.wikipedia.org/wiki/Republic_P-47_Thunderbolt',role:'Airframe deployments, Eighth vs Ninth mission context; not yet verified at page level.'},
    {from:'Republic P-47 Thunderbolt',to:'Warren M. Bodie, Republic’s P-47 (1994)',kind:'Technical aircraft research monograph',status:'bibliography',url:'https://en.wikipedia.org/wiki/Republic_P-47_Thunderbolt',role:'Variants, production and airplane performance; not a pilot-attrition dataset.'},
    {from:'Republic P-47 Thunderbolt',to:'Eighth Fighter Command original group credits & MACR compilation',kind:'Source-checked archival compilation',status:'verified',url:sourceIndex.marshall.url,role:'Actual aircraft-model victory credits / loss categories for the 8th Fighter Command only.'},
    {from:'Bundesarchiv and USAAF source lists',to:'RAF AHB VII/107 captured German fighter strengths',kind:'Original German wartime returns',status:'verified',url:sourceIndex.ahb107.url,role:'Dated all-front aircraft stock and serviceability by class, 1938–Apr 1945.'},
    {from:'USAAF Statistical Digest table of contents',to:'USAAF Tables 69, 104, 128, 159, 167',kind:'Official primary statistical tables',status:'verified-partial',url:sourceIndex.digestPortal.url,role:'Existing pilot/aircraft/mission series and distinct definitions; some subseries missing, intentionally blank.'},
    {from:'German wartime Quartermaster records',to:'RAF AHB translated loss reports 83, 92, 133–52',kind:'Original German loss returns (archival translations)',status:'index-verified',url:sourceIndex.rafGerman.url,role:'War-wide theater-specific aircraft losses; digitized index verified, individual series still need transcription.'},
    {from:'Official US archive catalog',to:'NARA RG 18 and AFHRA original mission records',kind:'Original archive finding aids',status:'index-verified',url:sourceIndex.nararg18.url,role:'Future Eighth/Ninth USAAF model-specific mission and cause data; no counts imported from a mere catalog.'}
    ,{from:'Big Week',to:'Edward T. Russell, Leaping the Atlantic Wall (1999)',kind:'Official USAF 36-page campaign study',status:'index-verified',url:sourceIndex.russell.url,role:'Referenced on Big Week, official PDF located at defense.gov. Western Europe 1942–45, not whole-world aircraft losses; complete PDF not numerically transcribed.'}
    ,{from:'Big Week',to:'Arnold D. Harvey, Battle of Britain and Big Week: A Comparative Perspective (2012)',kind:'Air Power History journal analysis',status:'bibliography',url:'https://en.wikipedia.org/wiki/Big_Week',role:'Useful campaign-level trained-pilot comparison; cited journal identified, text not directly checked. Big Week article warns that it needs more citations.'}
    ,{from:'Battle of Kursk',to:'Christer Bergström, Kursk: The Air Battle (2007)',kind:'Specialist secondary Eastern Front air-war study',status:'bibliography',url:'https://en.wikipedia.org/wiki/Battle_of_Kursk',role:'Air-specific German and Soviet losses. Must first match Operation Citadel vs later Soviet offensives and destruction/write-off definitions.'}
    ,{from:'Operation Barbarossa',to:'Christer Bergström, Barbarossa: The Air Battle (2007)',kind:'Specialist secondary Eastern Front air-war study',status:'bibliography',url:'https://en.wikipedia.org/wiki/Operation_Barbarossa',role:'Early Eastern Front air strength and air claims. Wikipedia cites different incompatible estimates for Soviet initial aircraft; no entry copied uncritically.'}
    ,{from:'Second Schweinfurt',to:'Craven & Cate, official USAAF History Vol. II, pp. 704–705',kind:'Official scholarly military history',status:'index-verified',url:sourceIndex.ushistory2.url,role:'1943 bomber attack date, loss/claim reports and limited escort range; the 1943 volume is distinct from the 1944 Big Week chapter in Volume III.'}
    ,{from:'North American P-51 Mustang',to:'Bernard Boylan, Development of the Long-Range Escort Fighter (1955)',kind:'Official USAF Historical Study No. 136',status:'index-verified',url:sourceIndex.boylan.url,role:'P-51 introduction, escort doctrine and range; located via P-51 bibliography and official USAF numbered-studies index. PDF blocked on extraction, so no price/sortie series imported.'}
    ,{from:'Focke-Wulf Fw 190',to:'Donald Caldwell, JG 26 War Diary Vol. II (1943–45)',kind:'German fighter unit operations reconstructed from records',status:'bibliography',url:'https://en.wikipedia.org/wiki/Focke-Wulf_Fw_190',role:'Potential cross-check for Fw 190 type-specific unit losses and claims, not representative of the entire Luftwaffe.'}
    ,{from:'Hawker Typhoon',to:'Francis K. Mason, The Hawker Typhoon and Tempest (1988)',kind:'Specialist RAF aircraft history',status:'bibliography',url:'https://en.wikipedia.org/wiki/Hawker_Typhoon',role:'RAF tactical fighter-bomber operations, variants and squadron service; not an original month-by-month 2nd TAF aircraft ledger.'}
    ,{from:'Messerschmitt Me 262',to:'1945 US Army Air Corps debrief of German pilot Hans Fey',kind:'Contemporary Allied intelligence pilot debrief',status:'bibliography',url:'https://en.wikipedia.org/wiki/Messerschmitt_Me_262',role:'Wikipedia cites a 1945 original debrief PDF (zenoswarbirdvideos.com); original record was identified but not independently extracted or reconciled with 1945 jet inventories.'}
    ,{from:'German aircraft production during World War II',to:'Vajda & Dancey, German Aircraft Industry and Production 1939–1945 (1998)',kind:'Specialist industry history, article without inline row citations',status:'comparison',url:'https://en.wikipedia.org/wiki/German_aircraft_production_during_World_War_II',role:'Article warns its table may be inaccurate. Its Fw 190 fighter-year entries add to 13,367 but the printed line total says 13,376 (nine-aircraft error). Neither is promoted to a source figure; fighter vs fighter-bomber production must be separated.'}
    ,{from:'Messerschmitt Bf 109',to:'US Strategic Bombing Survey Aircraft Division Industry Report, Exhibit I',kind:'Original postwar analysis of German production programs',status:'index-verified',url:sourceIndex.ussbsIndustry.url,role:'Bf 109 page cites program versus actual production. Primary report and Messerschmitt/Focke-Wulf plant surveys located in Truman Library RG 243 finding aid; original exhibit not yet transcribed.'}
    ,{from:'Lockheed P-38 Lightning',to:'NASA SP-468, Quest for Performance: Illustrative Aircraft Table III',kind:'NASA aircraft technical-historical reference',status:'bibliography',url:'https://en.wikipedia.org/wiki/Lockheed_P-38_Lightning',role:'NASA aerodynamic/aircraft performance comparator cited on page; useful for equipment capability, NOT USAAF monthly loss figures.'}
    ,{from:'Supermarine Spitfire',to:'Air Ministry AP 1565B Spitfire IIA/IIB pilot notes',kind:'Original British Air Ministry technical manual',status:'bibliography',url:'https://en.wikipedia.org/wiki/Supermarine_Spitfire',role:'Aircraft flight operating envelope and equipment configuration; operational strengths require separate RAF Fighter Command returns.'}
    ,{from:'Hawker Tempest',to:'Christopher Shores & Chris Thomas, Second Tactical Air Force Vols. I–IV (2004–08)',kind:'Specialist RAF squadron operations',status:'bibliography',url:'https://en.wikipedia.org/wiki/Hawker_Tempest',role:'Covers June 1943–May 1945 by phase including Normandy and Bodenplatte, relevant to dated Tempest/Typhoon unit losses; full ledgers not extracted.'}
    ,{from:'Boeing B-17 Flying Fortress',to:'Craven & Cate, USAAF Official History Vol. I; Roger Freeman, B-17 Fortress at War',kind:'Official 1942 operational history and specialist bomber reference',status:'verified-partial',url:sourceIndex.ushistory2.url,role:'B-17 1942 England operations. Later ETO bomber losses from the USAAF Statistical Digest are aircraft-class statistics, not verified German fighter kills.'}
    ,{from:'Consolidated B-24 Liberator',to:'Craven & Cate, official USAAF History Vol. I; Roger Freeman, B-24 at War',kind:'Official campaign history and specialist aircraft monograph',status:'bibliography',url:'https://en.wikipedia.org/wiki/Consolidated_B-24_Liberator',role:'Bomber operational and technical profiles; all-theater aircraft totals cannot automatically become European B-24 combat losses.'}
    ,{from:'Operation Overlord',to:'Craven & Cate USAAF Vol. III; Boog/Krebs/Vogel Vol. VII; Terry Copp operational research',kind:'Official U.S. campaign history and scholarly Normandy sources',status:'verified-partial',url:sourceIndex.ushistory3.url,role:'Overlord official USAAF chapters 3, 6–8 checked. Wikipedia combines Allied land and air losses; air operations need separate denominators.'}
    ,{from:'Operational history of the Luftwaffe',to:'Caldwell & Muller; Bergström Eastern-air-battle books; Williamson Murray',kind:'German and Allied scholarly/specialist research',status:'verified-partial',url:sourceIndex.murrayBook.url,role:'USAF Murray loss tables checked; other books cited in this narrative remain bibliographic leads, not universal loss census.'}
  ];
  const september44Allied={source:'ninthSep44',scope:'September 1944 DAILY AVERAGE air strengths; not May 1945 or global force',
    germanWest:{date:'25 September 1944',fightersOnStrength:431},
    forces:[{name:'US Ninth AF',total:1502,operational:968},{name:'RAF Second Tactical AF',total:999,operational:879},
      {name:'US Eighth AF',total:1234,operational:904},{name:'US Fifteenth AF',total:559,operational:402}],
    reportedTotal:{total:4294,operational:3153}};
  function germanAt(i){
    const exact=germanFighterReadiness.find(p=>p.i===i);
    if(exact)return exact;
    const anchors=germanFighterReadiness;
    const before=anchors.filter(p=>p.i<i).at(-1),after=anchors.find(p=>p.i>i);
    if(!before||!after)return {i,strength:null,serviceable:null,readyPct:null,quality:'unavailable',source:'ahb107'};
    const span=after.i-before.i,t=(i-before.i)/span;
    const strength=Math.round(before.strength+(after.strength-before.strength)*t);
    const serviceable=Math.round(before.serviceable+(after.serviceable-before.serviceable)*t);
    return {i,strength,serviceable,readyPct:100*serviceable/strength,
      source:'ahb107',quality:'interpolated',
      note:`Linear interpolation between ${before.date} and ${after.date} (gap ${span} months). ${span>6?'LONG GAP / reduced confidence. ':''}Not an observed German monthly return.`};
  }
  window.AirWarV6Data={sourceIndex,germanFighterReadiness,germanClassSnapshots,germanAt,
    eighthFighterTypes,eighthAggregate,campaignCases,bigWeekOfficial,historyChapters,wikiTopics,researchTrails,september44Allied};
})();
