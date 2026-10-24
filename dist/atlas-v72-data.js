/* European Air War Atlas 7.2 — individually checked contemporary German returns.
 * Twenty-six NEW monthly month-end TOTAL LOSSES entries, supplementing the four
 * May/June 1944 entries established in v7.1. Each six-number set was manually
 * checked against the original scanned RAF AHB page, not copied from OCR.
 * Missing aircraft are INCLUDED in enemy-action destroyed, never added again.
 * No dates beyond these source universes are estimated in this module.
 */
(function(){
  'use strict';
  const D=window.LuftData,Y=window.AirWarV7Data;
  if(!D||!Y)throw Error('Load historical data and the original loss catalog first.');
  const catalog=[
    ['reich43','VII/149','Luftflotte Reich, September–December 1943',
      'September 18, October 38, November 54, December 72'],
    ['west43','VII/148','Luftflotte 3 Western Front, September–December 1943',
      'September 20, October 36, November 50, December 63'],
    ['reich44early','VII/138','Luftflotte Reich, January–April 1944',
      'January 18, February 38, March 61, April 87'],
    ['west44early','VII/135','Luftflotte 3 Western Front, January–April 1944',
      'January 14, February 29, March 45, April 62'],
    ['reich44summer','VII/142','Luftflotte Reich, July–September 1944',
      'July 29, August 56, September 80'],
    ['west44summer','VII/144','Luftflotte 3 Western Front, July–August 1944',
      'July 28, August 56'],
    ['reich44fall','VII/143','Luftflotte Reich, October–November 1944',
      'October 23, November 46'],
    ['west44fall','VII/145','Luftflotte 3 / Luftwaffenkommando West, September–November 1944',
      'September 14, October 30, November 42']
  ];
  const sourceIndex=Object.fromEntries(catalog.map(([id,vol,title,pages])=>{
    const archive=Y.lossCatalog.find(r=>r.id===vol);
    if(!archive)throw Error('Missing RAF AHB archive catalog entry: '+vol);
    return [id,{short:'RAF AHB '+vol+' · original monthly return',title,
      url:archive.url,type:'Primary: wartime German aircraft-loss ledger, captured and translated by RAF AHB',
      note:'Read the six rightmost categories in the month-end TOTAL LOSSES row, scanned PDF pages: '+pages+'. Destroyed and damaged are distinct. Three nonoverlapping cause categories; missing aircraft are included within enemy-action destroyed. Visual transcription checked against the original page.'}];
  }));
  // Year, 0-indexed month, theater, ENEMY (destroyed, damaged), OTHER-OP
  // (destroyed, damaged), NON-OP (destroyed, damaged), MISSING, PDF page, source ID.
  // February/December 1943 source cells and correction overlays were read from
  // the scan, including a March 1944 REICH correction 304 -> 202 for non-op damage.
  const transcription=[
    [1943,8,'Reich',82,18,68,39,117,114,21,18,'reich43'],
    [1943,9,'Reich',177,61,78,86,92,149,50,38,'reich43'],
    [1943,10,'Reich',142,34,77,67,113,91,47,54,'reich43'],
    [1943,11,'Reich',120,30,72,56,102,91,33,72,'reich43'],
    [1943,8,'Western Front',140,77,22,55,71,136,40,20,'west43'],
    [1943,9,'Western Front',107,26,20,29,73,121,48,36,'west43'],
    [1943,10,'Western Front',70,36,14,42,68,81,23,50,'west43'],
    [1943,11,'Western Front',129,48,21,30,44,63,37,63,'west43'],
    [1944,0,'Reich',223,64,127,81,94,102,34,18,'reich44early'],
    [1944,1,'Reich',359,94,74,89,104,148,41,38,'reich44early'],
    [1944,2,'Reich',389,138,95,96,178,202,46,61,'reich44early'],
    [1944,3,'Reich',580,193,83,92,177,268,45,87,'reich44early'],
    [1944,0,'Western Front',159,62,46,58,84,158,60,14,'west44early'],
    [1944,1,'Western Front',192,86,38,80,78,164,72,29,'west44early'],
    [1944,2,'Western Front',288,110,41,47,79,163,66,45,'west44early'],
    [1944,3,'Western Front',260,104,38,57,78,208,59,62,'west44early'],
    [1944,6,'Reich',383,119,76,102,181,420,45,29,'reich44summer'],
    [1944,7,'Reich',431,125,55,99,170,365,42,56,'reich44summer'],
    [1944,8,'Reich',600,158,74,115,172,251,86,80,'reich44summer'],
    [1944,6,'Western Front',602,126,135,215,46,116,247,28,'west44summer'],
    [1944,7,'Western Front',715,98,102,152,51,130,234,56,'west44summer'],
    [1944,8,'Western Front',204,23,26,35,10,30,58,14,'west44fall'],
    [1944,9,'Reich',171,52,50,83,162,241,28,23,'reich44fall'],
    [1944,10,'Reich',413,109,94,117,165,218,73,46,'reich44fall'],
    [1944,9,'Western Front',157,30,40,57,25,58,47,30,'west44fall'],
    [1944,10,'Western Front',155,36,43,48,22,34,49,42,'west44fall']
  ];
  const monthlyReturns=transcription.map(([year,month,theater,enemyDestroyed,enemyDamaged,
    otherOperationalDestroyed,otherOperationalDamaged,nonOperationalDestroyed,
    nonOperationalDamaged,missing,page,sourceId])=>({
      i:D.idx(year,month),month:D.label(D.idx(year,month)),theater,sourceId,page,
      enemyDestroyed,enemyDamaged,otherOperationalDestroyed,otherOperationalDamaged,
      nonOperationalDestroyed,nonOperationalDamaged,missing,
      destroyed:enemyDestroyed+otherOperationalDestroyed+nonOperationalDestroyed,
      damaged:enemyDamaged+otherOperationalDamaged+nonOperationalDamaged,
      quality:'recorded',scope:'Original German command month-end all-aircraft TOTAL LOSSES row, not all-theater Luftwaffe totals or Allied claims'
  }));
  const qualityNotes={
    month:'Thirty exact month-end all-aircraft source-total entries, covering September 1943–November 1944 separately for the Reich and Western commands. Four are v7.1; twenty-six are new in v7.2. Data for earlier and later periods, Eastern/Italian fronts and individual aircraft types remain unverified here — not zero.',
    definitions:'The three source cause categories partition destroyed and damaged airframes. “Missing” is a INCLUDED subset of enemy-action destroyed, not a fourth loss category. Damaged aircraft must not be added to written-off aircraft.',
    corrected:'For Luftflotte Reich, March 1944, the printed non-operational DAMAGED total 304 was overwritten/corrected to 202 on the original scan (RAF AHB VII/138 PDF p61). V7.2 uses the corrected 202. The OCR reads the superseded 304.',
    boundary:'The Western command is Luftflotte 3 through August 1944 and Luftwaffenkommando West thereafter (renamed September 1944). This is a reporting-command series, NOT an identical geographical region or a total of all German losses in western Europe at every date. Abrupt changes must not be interpreted as direct evidence of the war-wide trend.',
    reportLevel:'The monthly TOTAL rows are checked; individual daily Bf 109/Fw 190 source lines have not undergone a comparable complete independent audit. The separate June 1944 type tabulation remains provisional.'
  };
  const QA={version:'7.2',monthlyRows:()=>monthlyReturns.length,
    scannedReports:()=>catalog.length,
    get:(i,theater)=>monthlyReturns.find(p=>p.i===i&&p.theater===theater)||null};
  window.AirWarV72Data={monthlyReturns,qualityNotes,sourceIndex,reportIds:catalog.map(p=>p[1])};
  window.AirWarV72QA=QA;
})();
