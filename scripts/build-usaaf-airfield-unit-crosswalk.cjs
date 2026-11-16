#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
function buildCrosswalk({occupancy,headers,maurer}){
  const norm=s=>(s||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/\b(st|ste)\b/g,"saint").replace(/\b(airfield|airport|field|aerodrome|raf)\b/g,"").replace(/[^a-z0-9]/g,"");
  const hmap=new Map(headers.records.map(h=>[h.code,h]));
  const groupMap=new Map();
  for(const g of maurer.groups){const n=Number(g.unitName.match(/^\d+/)?.[0]);if(!n)continue;const v=groupMap.get(n)||[];v.push(g);groupMap.set(n,v)}
  const addMonth=s=>{const [y,m]=s.split("-").map(Number);return `${m===12?y+1:y}-${String(m===12?1:m+1).padStart(2,"0")}`};
  const sourceRows=[],monthlyCandidates=[],flagCounts={},qualityCounts={},corroborationCounts={};
  for(const r of occupancy.records){
    const h=hmap.get(r.continentalAirfieldCodeCandidate);
    const id=`usaf1988-p${r.printedOriginalPage}-l${r.physicalLineOnPrintedPage}`;
    const unit=r.unitDesignationOCR;
    const isGroup=/\bGp\b/i.test(unit),isSquadron=/\bSq\b/i.test(unit);
    const number=Number(unit.match(/^\d+/)?.[0]);
    const p=unit.toLowerCase();
    const candidates=(groupMap.get(number)||[]).filter(g=>{
      const q=g.unitName.toLowerCase();
      if(p.includes("ftr"))return q.includes("fighter");
      if(p.includes("bomb")||p.includes("barb"))return q.includes("bombardment");
      if(p.includes("trp carr"))return q.includes("troop carrier");
      if(p.includes("tac rec"))return q.includes("reconnaissance");
      if(p.includes("photo"))return q.includes("photo");
      return true;
    });
    const matches=[];
    if(isGroup&&h)for(const g of candidates){
      const stations=g.europeMediterraneanStationCandidates;
      for(let i=0;i<stations.length;i++){
        const e=stations[i];
        if(!e.withinAtlasDateScopeCandidate||norm(e.printedAirfieldOrPlace)!==norm(h.nameOCRCandidate))continue;
        const next=stations.slice(i+1).find(x=>x.startDateCandidate&&(!e.startDateCandidate||x.startDateCandidate>e.startDateCandidate));
        const from=e.startDateCandidate?.slice(0,7)||null,to=next?.startDateCandidate?.slice(0,7)||null;
        const first=r.firstMonthISOIfUnambiguous,last=r.lastMonthISOIfUnambiguous;
        const timeCompatible=!!(from&&first&&last&&from<=last&&(!to||to>=first));
        matches.push({unit:g.unitName,station:e.printedAirfieldOrPlace,sourcePdf:g.sourceUrl,sourcePdfPage:g.sourcePdfPageNumber,sourceDateAsPrinted:e.printedDate,startMonth:from,nextStationStartMonth:to,datePrecision:e.datePrecision,temporalOverlapCandidate:timeCompatible});
      }
    }
    const first=r.firstMonthISOIfUnambiguous,last=r.lastMonthISOIfUnambiguous;
    const flags=[];
    if(!first||!last||first>last)flags.push("unresolved_ocr_month_window");
    if(r.sourceRowAssociation==="physical_line_precedes_code_needs_source_visual_review")flags.push("source_line_before_airfield_header");
    if(h&&(h.layoutStatus.includes("preceding")||h.layoutStatus.includes("unverified")))flags.push("airfield_header_layout_or_country_unverified");
    if(h?.initialOperationDateISOIfClear&&first&&first<h.initialOperationDateISOIfClear.slice(0,7))flags.push("source_unit_month_precedes_airfield_initial_operation_month");
    if(h?.releaseDateISOIfClear&&last&&last>h.releaseDateISOIfClear.slice(0,7))flags.push("source_unit_month_exceeds_airfield_release_month");
    if(last&&last>"1945-05")flags.push("original_range_continues_after_1945_05_09");
    if(matches.length&&!matches.some(m=>m.temporalOverlapCandidate))flags.push("same_station_name_but_maurer_date_not_corroborated");
    const sourceMatchStatus=matches.some(m=>m.temporalOverlapCandidate)?"same_group_station_and_overlapping_month":matches.length?"same_group_station_but_date_unresolved":isGroup&&candidates.length?"maurer_group_present_without_exact_station_name":isGroup?"maurer_group_not_available":"squadron_or_other_no_group_crosscheck";
    const reviewFlags=["unresolved_ocr_month_window","source_line_before_airfield_header","airfield_header_layout_or_country_unverified","source_unit_month_precedes_airfield_initial_operation_month","source_unit_month_exceeds_airfield_release_month","same_station_name_but_maurer_date_not_corroborated"];
    const qualityTier=flags.some(f=>reviewFlags.includes(f))?"review_priority":matches.some(m=>m.temporalOverlapCandidate)?"corroborated_candidate":"ocr_candidate";
    const entry={sourceRowId:id,airfieldCode:r.continentalAirfieldCodeCandidate,airfieldNameOCRCandidate:h?.nameOCRCandidate||null,countryCandidate:h?.countryCandidate||null,unitAsPrinted:unit,unitHierarchy:isGroup?"group":isSquadron?"squadron":"other",firstMonthCandidate:first||null,lastMonthCandidate:last||null,sourceMonthDateWindowOCR:r.sourceMonthDateWindowOCRCandidate,sourcePage:r.printedOriginalPage,sourceLine:r.physicalLineOnPrintedPage,sourceRowAssociation:r.sourceRowAssociation,airfieldInitialOperationDateCandidate:h?.initialOperationDateISOIfClear||null,airfieldReleaseDateCandidate:h?.releaseDateISOIfClear||null,sourceMatchStatus,qualityTier,flags,maurerMatches:matches};
    sourceRows.push(entry);qualityCounts[qualityTier]=(qualityCounts[qualityTier]||0)+1;
    for(const f of flags)flagCounts[f]=(flagCounts[f]||0)+1;
    if(first&&last&&first<=last){let month=first,n=0;while(month<=last&&month<="1945-05"&&n++<36){
      const evidence=matches.filter(m=>m.startMonth&&m.startMonth<=month&&(!m.nextStationStartMonth||m.nextStationStartMonth>=month));
      const monthQuality=qualityTier==="review_priority"?"review_priority":evidence.length?"corroborated_candidate":"ocr_candidate";
      monthlyCandidates.push({month,airfieldCode:entry.airfieldCode,airfieldNameCandidate:entry.airfieldNameOCRCandidate,countryCandidate:entry.countryCandidate,unitAsPrinted:unit,unitHierarchy:entry.unitHierarchy,sourceRowId:id,qualityTier:monthQuality,maurerGroupIfMatched:evidence[0]?.unit||null,sourcePeriodPrecision:"month_range_OCR_not_exact_stationing_days",may1945IsNotNecessarilyBeforeVEDay:month==="1945-05"});
      corroborationCounts[monthQuality]=(corroborationCounts[monthQuality]||0)+1;month=addMonth(month);
    }}
  }
  const byUnitMonth=new Map();
  for(const r of monthlyCandidates){const key=r.month+"|"+norm(r.unitAsPrinted);const s=byUnitMonth.get(key)||new Set();s.add(r.airfieldCode);byUnitMonth.set(key,s)}
  const simultaneousMonthCandidates=[...byUnitMonth.entries()].filter(([,codes])=>codes.size>1).map(([key,codes])=>({month:key.slice(0,7),unitKeyNormalized:key.slice(8),airfieldCodes:[...codes].sort(),interpretation:"Possible move within reporting month, detached element, or OCR conflict; not automatically simultaneous deployment."}));
  const audit={sourceLineCandidates:sourceRows.length,parseableMonthLines:sourceRows.filter(r=>r.firstMonthCandidate&&r.lastMonthCandidate&&r.firstMonthCandidate<=r.lastMonthCandidate).length,monthCandidates:monthlyCandidates.length,distinctAirfieldMonths:new Set(monthlyCandidates.map(r=>r.month+"|"+r.airfieldCode)).size,distinctUnitAirfieldMonths:new Set(monthlyCandidates.map(r=>r.month+"|"+r.airfieldCode+"|"+r.unitAsPrinted)).size,sourceRowQualityCounts:qualityCounts,monthQualityCounts:corroborationCounts,sourceFlagCounts:flagCounts,unitMonthWithMoreThanOneAirfield:simultaneousMonthCandidates.length};
  return {id:"USAAF-1988-A-Y-R-UNIT-AIRFIELD-MONTH-CROSSCHECK-2026-10-30",status:"RESEARCH_ONLY_NO_GEOGRAPHIC_PINS_OR_CONFIRMED_STATION_DAYS",sources:{occupancy:"research/transcriptions/usaaf-1988-eto-a-y-r-airfield-unit-occupancy-ocr-candidates-1944-1945.json",airfieldHeaders:"research/transcriptions/usaaf-official-1988-american-a-y-r-code-continental-airfield-header-candidates-1944-1945.json",unitHistories:"research/transcriptions/usaaf-maurer-public-domain-european-group-station-candidates-1940-1945.json",originalAirfieldPDF:occupancy.source.originalPdf,originalUnitHistoryPDFs:maurer.sourceVolumes},method:["Join source line to same A/Y/R code's airfield header, never to modern coordinates.","Match GROUP number and role and strictly normalized station name to separate USAF Maurer group-history OCR.","Cross-check month-range overlap with dated station-history candidate and next recorded station month. Same-month transitions remain ambiguous.","Expand month windows only through 1945-05; May is NOT known to end on May 9.","Flag header layout uncertainty, pre-header source lines, initial-operation/release-month conflicts, and unresolved dates.","Group and squadron entries are separate hierarchical records; do not add them to obtain counts of distinct aircraft or formations."],limitations:["Both publications are official USAF histories but may share underlying records; matching is corroboration, NOT independent archival proof.","The historical code's field location is a candidate place name, not verified latitude/longitude or runway polygon.","Month-range overlap is not evidence of a full-month posting; no day-accurate moves are asserted.","A source mismatch can be caused by OCR, group headquarters vs detachments, different reporting conventions, or a genuine source disagreement.","Rows are not aircraft counts, not sortie counts, and not proof that combat missions were flown from the site.","No row is marked map-publication-ready; historical coordinates and original-page visual checks are still needed."],audit,sourceRows,monthlyCandidates,simultaneousMonthCandidates};
}
const output=buildCrosswalk({
  occupancy:read("research/transcriptions/usaaf-1988-eto-a-y-r-airfield-unit-occupancy-ocr-candidates-1944-1945.json"),
  headers:read("research/transcriptions/usaaf-official-1988-american-a-y-r-code-continental-airfield-header-candidates-1944-1945.json"),
  maurer:read("research/transcriptions/usaaf-maurer-public-domain-european-group-station-candidates-1940-1945.json")
});
const destination=path.join(root,"research/transcriptions/usaaf-1988-unit-airfield-month-crosschecked-1944-1945.json");
fs.writeFileSync(destination,JSON.stringify(output,null,2)+"\n");
console.log(JSON.stringify(output.audit,null,2));
