/* Grand Air War 8.0: explicitly scoped German capacity, aviation fuel and fighter attrition research. */
window.GrandAirWarV80German=Object.freeze({
  "version": "8.0-research",
  "coverage": "Discrete verified or sourced observations, NOT Germany-wide operational aircraft inventory. Distinguish front, command, unit, crew, factory and fuel.",
  "sources": {
    "murray": {
      "name": "Williamson Murray, Strategy for Defeat, chapter VII and tables LXVIII/LIX",
      "url": "https://www.ibiblio.org/hyperwar/AAF/AAF-Luftwaffe/AAF-Luftwaffe-7.html",
      "class": "USAF-supported scholarly history derived from German wartime records",
      "notes": "Fighter pilot casualties, December 1943 fighter pilot strength, Reich fighter counts, air unit JG53 records and fuel production capacity. Original individual wartime ledgers not independently reread here."
    },
    "galland": {
      "name": "RAF Air Historical Branch VII/71: Göring–Galland fighter conference, 15–16 May 1944",
      "url": "https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/notes-on-discussions-with-reichsmarschall-goering-held-on-15th-16th-may-1944-on-the-subject-of-fighters-and-fighter-personnel/",
      "class": "Primary captured German conference, English translation",
      "notes": "German leadership reports 489 April fighter pilots lost and 396 new pilots sent, apparently a different population/definition than Murray's 447. Reported replacement flow not net inventory change."
    },
    "ussbs": {
      "name": "United States Strategic Bombing Survey (1945), Summary Report, European War",
      "url": "https://www.govinfo.gov/content/pkg/GOVPUB-D301-PURL-LPS47072/pdf/GOVPUB-D301-PURL-LPS47072.pdf",
      "class": "Official postwar survey",
      "notes": "Reports 39,807 German aircraft accepted in all 1944. Do not treat production/acceptance as serviceable frontline inventory."
    },
    "ussbsarchive": {
      "name": "Truman Library, USSBS Report 2a Statistical Appendix and Aircraft Division Industry Report",
      "url": "https://www.trumanlibrary.gov/library/federal-record/records-united-states-strategic-bombing-survey",
      "class": "Primary archival locator",
      "notes": "Archive index locates statistical appendix and aircraft division industry report. Table not independently read as original scan in this implementation."
    },
    "ussbsTable": {
      "name": "Germany and the Second World War, Vol. VII, table I.I.10 (USSBS reproduced)",
      "url": "https://www.scribd.com/document/754259981/Germany-and-the-Second-World-War-Vol-VII-the-Strategic-Horst-Boog-2006-Clarendon-Press-44ac2fcc10274caa9f6e73c5d92b2e80-Anna-s-Arch",
      "class": "Secondary scholarly reproduction of USSBS figures, verification pending original page",
      "notes": "Aircraft produced 1943–45 by month, figures given in Table I.I.10. September 1944 4,103 is supported by official annual 39,807; a competing USSBS repost lists 4,130."
    },
    "rafIndustry": {
      "name": "RAF AHB Rise and Fall of the German Air Force, aircraft industry chapter",
      "url": "https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/second-world-war-thematic-studies/rise-and-fall-of-the-german-air-force-1933-1945/",
      "class": "RAF historical study",
      "notes": "Discusses fighter production peak July 1943 and Allied attack on fighter assembly, rise of escort, dispersal and aircraft production constraints."
    }
  },
  "pilotCasualties": [
    {
      "period": "1943-09",
      "losses": 343,
      "rate": 15.7,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1943-10",
      "losses": 339,
      "rate": 14.5,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1943-11",
      "losses": 245,
      "rate": 9.9,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1943-12",
      "losses": 252,
      "rate": 10.4,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1944-01",
      "losses": 292,
      "rate": 12.1,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1944-02",
      "losses": 434,
      "rate": 17.9,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1944-03",
      "losses": 511,
      "rate": 21.7,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1944-04",
      "losses": 447,
      "rate": 20.1,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    },
    {
      "period": "1944-05",
      "losses": 578,
      "rate": 25,
      "metric": "German single-engine fighter pilot losses in report's source population",
      "source": "murray",
      "quality": "scholarly transcription",
      "note": "Source fraction of nominal German fighter pilot population; not all Luftwaffe personnel and not automatically Western Front pilots."
    }
  ],
  "dec43Pilots": {
    "date": "1943-12-31",
    "all": 2395,
    "fullyCombatReady": 1491,
    "partlyCombatReady": 291,
    "remainder": 613,
    "scope": "Single-engine fighter pilots in frontline units, December 31. Not entire Luftwaffe aircrew pool.",
    "source": "murray"
  },
  "gallandApril": {
    "period": "1944-04",
    "lost": 489,
    "replacements": 396,
    "delta": -93,
    "officersLost": 100,
    "officersReplaced": 62,
    "scope": "Göring–Galland conference, April German fighter pilot losses and training-unit arrivals; other definition than 447",
    "source": "galland",
    "note": "489 reported versus scholarly table's 447 for April; do not replace or combine. Difference may reflect denominators; not resolved."
  },
  "reichFighters": [
    {
      "date": "1944-06-01",
      "period": "1944-06",
      "singleOnHand": 788,
      "singleReady": 472,
      "twinOnHand": 203,
      "twinReady": 83,
      "source": "murray",
      "scope": "Luftflotte Reich single- and twin-engine fighters only; not all-front Luftwaffe. Snapshot dates, not interpolated monthly average.",
      "quality": "secondary historical table"
    },
    {
      "date": "1944-07-01",
      "period": "1944-07",
      "singleOnHand": 388,
      "singleReady": 242,
      "twinOnHand": 156,
      "twinReady": 64,
      "source": "murray",
      "scope": "Luftflotte Reich single- and twin-engine fighters only; not all-front Luftwaffe. Snapshot dates, not interpolated monthly average.",
      "quality": "secondary historical table"
    },
    {
      "date": "1944-07-27",
      "period": "1944-07",
      "singleOnHand": 460,
      "singleReady": 273,
      "twinOnHand": 94,
      "twinReady": 42,
      "source": "murray",
      "scope": "Luftflotte Reich single- and twin-engine fighters only; not all-front Luftwaffe. Snapshot dates, not interpolated monthly average.",
      "quality": "secondary historical table"
    }
  ],
  "fuelCapacity": [
    {
      "period": "1944-08",
      "overallPercent": 46,
      "aviationPercent": 65,
      "source": "murray",
      "scope": "Production as a PERCENTAGE of reported capacity, NOT physical fuel tonnes or aircraft availability."
    },
    {
      "period": "1944-09",
      "overallPercent": 48,
      "aviationPercent": 30,
      "source": "murray",
      "scope": "Production as a PERCENTAGE of reported capacity, NOT physical fuel tonnes or aircraft availability."
    },
    {
      "period": "1944-10",
      "overallPercent": 43,
      "aviationPercent": 37,
      "source": "murray",
      "scope": "Production as a PERCENTAGE of reported capacity, NOT physical fuel tonnes or aircraft availability."
    },
    {
      "period": "1944-11",
      "overallPercent": 60,
      "aviationPercent": 65,
      "source": "murray",
      "scope": "Production as a PERCENTAGE of reported capacity, NOT physical fuel tonnes or aircraft availability."
    },
    {
      "period": "1944-12",
      "overallPercent": 59,
      "aviationPercent": 56,
      "source": "murray",
      "scope": "Production as a PERCENTAGE of reported capacity, NOT physical fuel tonnes or aircraft availability."
    },
    {
      "period": "1945-01",
      "overallPercent": 51,
      "aviationPercent": 33,
      "source": "murray",
      "scope": "Production as a PERCENTAGE of reported capacity, NOT physical fuel tonnes or aircraft availability."
    },
    {
      "period": "1945-02",
      "overallPercent": 40,
      "aviationPercent": 5,
      "source": "murray",
      "scope": "Production as a PERCENTAGE of reported capacity, NOT physical fuel tonnes or aircraft availability."
    }
  ],
  "unitStudies": [
    {
      "unit": "III./JG 53",
      "period": "1944-04",
      "avgAircraft": 23,
      "avgServiceable": 16,
      "combatAircraftLost": 9,
      "nonCombatWrittenOff": 6,
      "sorties": 431,
      "combatOperations": 38,
      "pilotsKilled": 5,
      "pilotsInjured": 2,
      "source": "murray",
      "scope": "One Gruppe, not nationwide; different figures for sorties, aircraft and personnel."
    },
    {
      "unit": "II./JG 53",
      "period": "1944-05",
      "avgAircraft": 34,
      "avgServiceable": 20,
      "completelyDestroyed": 34,
      "lostOrDamaged": 53,
      "reportedAircrewKilled": 7,
      "missing": 5,
      "source": "murray",
      "scope": "One Gruppe; 53 lost-or-damaged includes 34 destroyed; personnel categories can overlap."
    }
  ],
  "production": [
    {
      "period": "1943-01",
      "value": 1525,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-02",
      "value": 2004,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-03",
      "value": 2166,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-04",
      "value": 2100,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-05",
      "value": 2196,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-06",
      "value": 2316,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-07",
      "value": 2475,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-08",
      "value": 2337,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-09",
      "value": 2214,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-10",
      "value": 2349,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-11",
      "value": 2111,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1943-12",
      "value": 1734,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-01",
      "value": 2445,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-02",
      "value": 2015,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-03",
      "value": 2672,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-04",
      "value": 3034,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-05",
      "value": 3248,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-06",
      "value": 3626,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-07",
      "value": 4219,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-08",
      "value": 4007,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-09",
      "value": 4103,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "September 1944 alternative transcription 4,130 conflicts with this 4,103. The 4,103 series sums to official USSBS 39,807 aircraft 1944; competing sums to 39,834."
    },
    {
      "period": "1944-10",
      "value": 3586,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-11",
      "value": 3697,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1944-12",
      "value": 3155,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1945-01",
      "value": 3188,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1945-02",
      "value": 2249,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    },
    {
      "period": "1945-03",
      "value": 1930,
      "scope": "German aircraft of ALL types built, postwar production tabulation; not serviceable airpower, and not exclusively fighters",
      "source": "ussbsTable",
      "quality": "USSBS-derived postwar production reconstructed from published scholarly table",
      "note": "Monthly table requires original USSBS appendix image audit."
    }
  ],
  "productionConflict": {
    "period": "1944-09",
    "selected": 4103,
    "alternate": 4130,
    "official1944Annual": 39807,
    "alternateAnnual": 39834,
    "sourceSelected": "ussbsTable",
    "officialAnnualSource": "ussbs",
    "sourceAlternate": "reproduced USSBS Table S-D variants",
    "status": "source transcription disagreement noted; annual consistency supports 4103, but independent USSBS primary table check remains open"
  },
  "analysisNotes": [
    "Production is a flow over a month, not an inventory of available or serviceable planes.",
    "German Reich fighter counts cover one command and two fighter categories, not the entire Luftwaffe.",
    "Fighter-pilot casualty observations are whole fighter-force population, not per-front and not interchangeable with aircraft losses.",
    "Galland 489 versus Murray 447 April pilot losses are differing source populations; both shown separately, NEVER added.",
    "1944 fuel capacity percent measures production capability, not aviation fuel physically available to units.",
    "JG 53 local unit examples illustrate serviceability and attrition but are not representative national averages.",
    "USAAF factory acceptance records measure U.S. worldwide output, not direct one-to-one German 1944 production definitions."
  ]
});
