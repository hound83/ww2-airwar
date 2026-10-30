#!/usr/bin/env python3
"""Quantitative archival-derived French campaign 1940 source audit.

Only numerical facts and definitions extracted from Buffotot & Ogier's 1975
historical study, not its scans or copyrighted narrative/article tables.
"""
import json
from pathlib import Path

OUT=Path(__file__).resolve().parents[1]/"research/transcriptions/french-air-force-metropole-campaign-strength-replenishment-losses-1940.json"
url="https://www.persee.fr/doc/rharm_0035-3299_1975_num_2_3_7869"
result={
 "researchOnly":True,"sourceUrl":url,
 "bibliography":"Buffotot, Patrice and Jacques Ogier. 1975. L’Armée de l’air française dans la campagne de France (10 mai–25 juin 1940), Revue historique des armées 2(3):88–117",
 "sourceClass":"Secondary scholarly quantitative reconstruction using contemporary Service historique de l'Air archives, particularly SHAA D1-115 and D1-116",
 "countsAt1940May10":{
   "allFrenchAirForceAircraftWorldwide":5026,
   "inNorthAfricaColoniesLevant":550,
   "internalSchoolsFactoriesWarehousesAndMetropolitanAirDefense":2300,
   "inTheFieldWithFrenchArmiesMetropolitanFrance":2176,
   "firstLineAvailableForOperations":1368,
   "unavailableAircraftOfSelectedReportingPopulation":717,
   "caveat":"1,368 and 717 do not add to 2,176; publication describes distinct first-line/depot/second-line/credit-to-armies classification. Never treat 717 as all non-operational French aircraft."
 },
 "comparisonWithLuftwaffeMay1940_asAuthorsPresented":{
   "frenchAtFront":2176,"germanWithFieldForcesApproximate":4500,
   "frenchAvailableFirstLine":1368,"germanAvailableFirstLineApproximate":3500,
   "caveat":"German counts are broader than just forces attacking France and use British Air Ministry 1948 source, rounded, not same field as Appendix20 of The Narrow Margin."
 },
 "replenishment1940May10ToJune10":{
   "allAircraftAdministrativelyDeliveredToFieldArmySystem":1024,
   "actuallyAcceptedByCombatUnitsToJune05":581,
   "receivedIntoMilitarySupplySystemByJune05":852,
   "remainingInWarehouseNotCompletedOrEquippedByJune05":271,
   "publishedJune10InventoryOnBooksWithArmies":2343,
   "caveat":"852 is administrative delivery-to-supply count, NOT aircraft losses; 581 of those reached units. June 10 stock includes uncompleted/unavailable aircraft."
 },
 "losses1940May10ToJune09":{
   "irreplaceableOwnFrenchAircraftLosses":852,
   "ofWhichLostInAerialCombatOrGermanFlak":410,
   "countingPeriodEndsBeforeJune25Ceasefire":True,
   "caveat":"852 is a French own-aircraft loss total through June 9 from the last surviving daily report; includes air combat, aircraft destroyed on ground, and accidents. Do not use as all May–June campaign losses."
 },
 "frenchReportedGermanAircraftVictoryClaims":{
   "fighterCredits1940May10ToJune24":733,
   "armyAntiAircraftCreditsThroughJune05":120,
   "authorCombinedCredits":853,
   "caveat":"These are French claimant-side credited victories, NOT matched or verified Luftwaffe aircraft actually lost. Authors explicitly warn anti-aircraft and fighter claims may overlap. German losses attributed to RAF are separate and cannot be summed without reconciliation."
 },
 "crewCasualties":{
   "pilotsOutOfActionByJune25Approximate":500,
   "caveat":"Out of action includes killed and wounded/injured or otherwise incapacitated; 500 NOT all killed. Separate officer and NCO pilot loss percentage given, underlying population not fully reproduced here."
 },
 "qualityWarnings":[
   "This is Metropolitan French air force, not French Naval Aviation, RAF aircraft serving in France, or German forces in France.",
   "The original authors reject simple comparisons between all aircraft on books and actually available first-line aircraft; categories require strict labels.",
   "A French victory claim is not identical to a German confirmed destroyed aircraft.",
   "Detailed source tables are reproduced as images in the viewer; type/cause loss subdivision requires independent manual verification before import."
 ]
}
assert result["countsAt1940May10"]["allFrenchAirForceAircraftWorldwide"]==550+2300+2176
assert result["replenishment1940May10ToJune10"]["receivedIntoMilitarySupplySystemByJune05"]==581+271
assert result["frenchReportedGermanAircraftVictoryClaims"]["authorCombinedCredits"]==733+120
OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
print("French 1940 field stock, aircraft availability, replenishments, own losses, claimed enemy losses and pilot out-of-action recorded")
