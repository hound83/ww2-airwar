/* European Air War Atlas 7.1 — captured German aircraft-loss return transcription.
 * RAF Air Historical Branch translations of contemporary German unit returns.
 * The month-end TOTAL (ALL TYPES) is source-observed. It is not an Allied claim.
 * Aircraft-type June subtotals are OCR-assisted, checked at suspect glyphs,
 * and explicitly PROVISIONAL pending independent, full line-by-line audit.
 * Never infer missing months or other theaters as zero.
 */
(function(){
  'use strict';
  const D=window.LuftData,Y=window.AirWarV7Data;
  if(!D||!Y)throw Error('Load legacy data and v7 archive index first.');
  const sourceIndex={};
  for(const [shortId,vol,description] of [
    ['reichMay','VII/134','Luftflotte Reich, May 1944, month-end TOTAL row on printed page 21 (PDF p22)'],
    ['reichJune','VII/139','Luftflotte Reich, June 1944, month-end TOTAL row on printed page 23 (PDF p24)'],
    ['westMay','VII/133','Luftflotte 3 Western Front, May 1944, month-end TOTAL row on printed page 14 (PDF p15)'],
    ['westJune','VII/136','Luftflotte 3 Western Front, June 1944, month-end TOTAL row on printed page 22 (PDF p23)']
  ]){
    const archive=Y.lossCatalog.find(x=>x.id===vol);
    sourceIndex[shortId]={short:'RAF AHB '+vol+' · German original',title:description,url:archive.url,
      type:'Primary: captured German wartime aircraft-loss table, RAF translation',
      note:'Read the final MONTH’S TOTAL / TOTAL LOSSES row. Columns are enemy-action destroyed and damaged, other operational destroyed and damaged, and non-operational destroyed and damaged. Missing aircraft are already included in enemy-action destroyed. Do not sum cause-level columns together with that subtotal.'};
  }
  const rows=[
    // theater, month (0-indexed), enemy destroyed/damaged, other operational
    // destroyed/damaged, non-operational destroyed/damaged, missing, source.
    ['Reich',4,556,180,107,157,261,349,32,'reichMay'],
    ['Western Front',4,228,71,27,51,88,147,38,'westMay'],
    ['Reich',5,208,90,42,44,183,405,18,'reichJune'],
    ['Western Front',5,818,220,113,219,67,160,313,'westJune']
  ];
  const monthlyReturns=rows.map(([theater,month,enemyDestroyed,enemyDamaged,otherOperationalDestroyed,
    otherOperationalDamaged,nonOperationalDestroyed,nonOperationalDamaged,missing,sourceId])=>({
      theater,i:D.idx(1944,month),month:D.label(D.idx(1944,month)),sourceId,
      enemyDestroyed,enemyDamaged,otherOperationalDestroyed,otherOperationalDamaged,
      nonOperationalDestroyed,nonOperationalDamaged,missing,
      destroyed:enemyDestroyed+otherOperationalDestroyed+nonOperationalDestroyed,
      damaged:enemyDamaged+otherOperationalDamaged+nonOperationalDamaged,
      quality:'recorded',scope:'All German aircraft types in this Luftflotte only; no estimates or attributed Allied kills'
    }));
  // June 1944 original registers, by aircraft type across all unit roles,
  // not just S.E. fighter units. Source is a row-wise OCR-assisted extraction
  // of the last three disjoint destruction / damage categories, with the
  // six ambiguous OCR entries and upside-down p15 manually inspected.
  // These are research transcription candidates, NOT official printed
  // month-end type totals: don't equate their precision to rows above.
  const juneTypeRows=[
    ['Reich','Bf 109',46,19,10,11,61,113,82],
    ['Reich','Fw 190',22,7,3,3,30,100,82],
    ['Western Front','Bf 109',301,81,39,92,20,58,85],
    ['Western Front','Fw 190',173,45,16,46,12,24,85]
  ];
  const juneByType=juneTypeRows.map(([theater,type,enemyDestroyed,enemyDamaged,otherOperationalDestroyed,
    otherOperationalDamaged,nonOperationalDestroyed,nonOperationalDamaged,rowsInspected])=>({
      theater,type,i:D.idx(1944,5),sourceId:theater==='Reich'?'reichJune':'westJune',
      enemyDestroyed,enemyDamaged,otherOperationalDestroyed,otherOperationalDamaged,
      nonOperationalDestroyed,nonOperationalDamaged,rowsInspected,
      destroyed:enemyDestroyed+otherOperationalDestroyed+nonOperationalDestroyed,
      damaged:enemyDamaged+otherOperationalDamaged+nonOperationalDamaged,
      quality:'provisional',scope:'OCR-assisted source-line transcription, all unit roles; not an independently reconciled month-end type total'
    }));
  const qualityNotes={
    month:'Four original printed monthly TOTAL (ALL TYPES) rows; complete only for the two listed commands and two months. They do not cover the Eastern Front, Italy, the entire Luftwaffe or all 1944.',
    type:'June aircraft-type figures are still PROVISIONAL: machine-assisted transcription of 82 Reich and 85 Western-front Bf 109/Fw 190 source lines, with the inverted page 15 and five uncertain glyphs independently read from images. Less-legible type rows could be missed or misread: treat totals as working transcription candidates, not verified exact annual/monthly historical totals or mathematically certain lower bounds.',
    definitions:'Destroyed and damaged are separate outcomes. Enemy-action, non-enemy operational and non-operational causes are disjoint. Aircraft missing is a component of enemy-action destroyed—not a fourth cause to add. Type rows include recon, fighter, ground-attack and bomber units carrying these types.',
    discrepancy:'May 1944 Western Front: printed source enemy-action subtotal is 228; a literal addition of its legible component headings appears to give 229. The dashboard preserves the original printed 228 and flags the one-aircraft discrepancy rather than silently adjusting it.'
  };
  const get=(i,theater)=>monthlyReturns.find(x=>x.i===i&&x.theater===theater)||null;
  const byType=(i,theater,type)=>juneByType.find(x=>x.i===i&&x.theater===theater&&x.type===type)||null;
  const QA={version:'7.1',get,byType,checkedMonthlyRows:()=>monthlyReturns.length,
    observedTypeRows:()=>juneByType.length,sourceIds:()=>Object.keys(sourceIndex)};
  window.AirWarV71Data={monthlyReturns,juneByType,qualityNotes,sourceIndex,get,byType};
  window.AirWarV71QA=QA;
})();
