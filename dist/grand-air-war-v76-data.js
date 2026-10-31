/* Grand Air War v7.6 Normandy storyboard: bounded, source-labeled historical sample. */
window.GrandAirWarV76Data = {
  "version": "7.6-preview",
  "status": "source-scoped-demonstration",
  "bounds": {
    "first": "1936-07",
    "last": "1945-05"
  },
  "focus": {
    "start": "1944-05",
    "end": "1944-08",
    "initial": "1944-06"
  },
  "sources": {
    "johnson": {
      "name": "USAF Historical Research Center, Johnson, Continental Airfields (1988), pp.13–14",
      "url": "https://www.dafhistory.af.mil/Portals/16/documents/Timelines/World%20War%20II/usaaf_european_airfields.pdf",
      "note": "Original airfield-code listings; headings and unit occupancy are separate date fields; unit-month resolution is approximate."
    },
    "maurer": {
      "name": "USAF combat group station histories, Maurer",
      "url": "https://www.airforcehistoryindex.org/data/000/000/019.xml",
      "note": "Cross-check of official retrospective group station histories, not fully independent of Johnson."
    },
    "digest": {
      "name": "USAAF Statistical Digest, 1945, Table 2 (ETO)",
      "url": "https://www.ibiblio.org/hyperwar/AAF/StatDigest/aafsd-1.html",
      "note": "Combat groups in ETO by month, including bomber, fighter, transport and reconnaissance groups. NOT aircraft or Normandy-only units."
    },
    "german": {
      "name": "RAF AHB captured German losses, Luftflotte 3, May–August 1944",
      "url": "https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-western-front-luftflotte-3-1st-july-31st-august-1944/",
      "note": "All-aircraft destroyed from all reported causes in Luftflotte 3 / Western Front report, not just Normandy combat losses. May and June are in separate AHB reports."
    },
    "westMay": {
      "name": "RAF AHB VII/133 — Luftflotte 3, May 1944",
      "url": "https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-western-front-luftflotte-3-may-1944/",
      "note": "May 1944 all-aircraft destroyed (all report causes)."
    },
    "westJun": {
      "name": "RAF AHB VII/136 — Luftflotte 3, June 1944",
      "url": "https://www.raf.mod.uk/what-we-do/our-history/air-historical-branch/ahb-translations-from-captured-german-documents/luftwaffe-losses-on-the-western-front-luftflotte-3-june-1944/",
      "note": "June 1944 all-aircraft destroyed (all report causes)."
    },
    "rafmuseum": {
      "name": "RAF Museum, British military aviation timeline — 6 June 1944",
      "url": "https://www.rafmuseum.org.uk/research/research-enquiries/history-of-aviation-timeline/british-military-aviation/1944-2/",
      "note": "RAF Museum reports 14,674 Allied sorties on D-Day, including 5,656 flown by RAF aircraft; sorties are flights, not aircraft strength or confirmed victories."
    },
    "usafmuseum": {
      "name": "National Museum of the United States Air Force — Operation Overlord",
      "url": "https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196668/operation-overlord-the-d-day-invasion/",
      "note": "Official USAF museum historical summary of Ninth, Eighth USAAF and RAF support for the D-Day invasion and subsequent move to the continent."
    },
    "armyCherbourg": {
      "name": "U.S. Army CMH, Utah Beach to Cherbourg, 6–27 June 1944",
      "url": "https://history.army.mil/Publications/Publications-Catalog/Utah-Beach-to-Cherbourg/",
      "note": "U.S. Army Center of Military History dates the capture of Cherbourg to 27 June 1944, not 26 June."
    },
    "armyCobra": {
      "name": "U.S. Army V Corps — World War II campaign chronology",
      "url": "https://www.vcorps.army.mil/History/World-War-II/",
      "note": "Official U.S. Army V Corps retrospective: Operation Cobra 25 July 1944 and Falaise–Argentan encirclement mid–late August."
    }
  },
  "monthly": [
    {
      "month": "1944-05",
      "etoCombatGroups": 102,
      "etoFighterGroups": 33,
      "germanWestDestroyed": 343,
      "germanWestSource": "westMay"
    },
    {
      "month": "1944-06",
      "etoCombatGroups": 102,
      "etoFighterGroups": 33,
      "germanWestDestroyed": 998,
      "germanWestSource": "westJun"
    },
    {
      "month": "1944-07",
      "etoCombatGroups": 103,
      "etoFighterGroups": 33,
      "germanWestDestroyed": 783,
      "germanWestSource": "german"
    },
    {
      "month": "1944-08",
      "etoCombatGroups": 103,
      "etoFighterGroups": 33,
      "germanWestDestroyed": 868,
      "germanWestSource": "german"
    }
  ],
  "events": [
    {
      "id": "build-up",
      "month": "1944-05",
      "date": "May 1944",
      "day": null,
      "title": "Build-up across the Channel",
      "place": "Southern England / English Channel",
      "lat": 50.7,
      "lon": -1.6,
      "kind": "context",
      "summary": "Allied preparations and air operations intensified ahead of the landings. The USAAF ETO group counts shown here cover the entire European theater, not just those assigned to Normandy.",
      "evidence": "contextual",
      "sourceKeys": [
        "digest"
      ]
    },
    {
      "id": "overlord",
      "month": "1944-06",
      "date": "6 Jun 1944",
      "day": 6,
      "title": "Operation Overlord begins",
      "place": "Normandy coast",
      "lat": 49.37,
      "lon": -0.72,
      "kind": "operation",
      "summary": "The invasion opened on 6 June. The RAF Museum reports 14,674 Allied sorties on D-Day, including 5,656 RAF sorties. Those are flights, not aircraft or aerial victories. The later USAAF ALG records trace only a small, selected sample of units moving onto the continent.",
      "evidence": "dated-historical-event",
      "sourceKeys": [
        "rafmuseum",
        "usafmuseum",
        "johnson"
      ],
      "dayMetric": {
        "quantity": 14674,
        "unit": "Allied sorties",
        "date": "1944-06-06",
        "RAFSorties": 5656,
        "denominator": "D-Day air support; all participating Allied forces per RAF Museum",
        "sourceKey": "rafmuseum"
      }
    },
    {
      "id": "alg-a1",
      "month": "1944-06",
      "date": "13 Jun 1944",
      "day": 13,
      "title": "A-1 Saint-Pierre-du-Mont operational",
      "place": "Cotentin / western Normandy",
      "lat": 49.36,
      "lon": -1.12,
      "kind": "airfield",
      "summary": "USAF field study dates A-1's initial operational use to 13 June. Its June–August entry names the 366th Fighter Group. The regional marker is illustrative, not a surveyed runway coordinate.",
      "evidence": "official-retrospective",
      "sourceKeys": [
        "johnson",
        "maurer"
      ],
      "airfieldCode": "A-1"
    },
    {
      "id": "alg-a2",
      "month": "1944-06",
      "date": "19 Jun 1944",
      "day": 19,
      "title": "A-2 Criqueville operational",
      "place": "Western Cotentin",
      "lat": 49.36,
      "lon": -1.48,
      "kind": "airfield",
      "summary": "USAF code A-2's initial-operation record is 19 June; its occupancy table lists the 354th Fighter Group through August. The position is a region-level marker, not a verified airstrip coordinate.",
      "evidence": "official-retrospective",
      "sourceKeys": [
        "johnson",
        "maurer"
      ],
      "airfieldCode": "A-2"
    },
    {
      "id": "cherbourg",
      "month": "1944-06",
      "date": "27 Jun 1944",
      "day": 27,
      "title": "Cherbourg falls to Allied forces",
      "place": "Cherbourg, Cotentin",
      "lat": 49.64,
      "lon": -1.62,
      "kind": "operation",
      "summary": "The capture of Cherbourg on 27 June expanded the Allied beachhead, although its port needed repairs. This is land-campaign context, not a sortie or fighter-strength observation.",
      "evidence": "dated-historical-event",
      "sourceKeys": [
        "armyCherbourg"
      ]
    },
    {
      "id": "cobra",
      "month": "1944-07",
      "date": "25 Jul 1944",
      "day": 25,
      "title": "Operation Cobra",
      "place": "Saint-Lô sector",
      "lat": 49.11,
      "lon": -1.08,
      "kind": "operation",
      "summary": "Operation Cobra opened on 25 July west of Saint-Lô following concentrated air attacks. German monthly Luftflotte 3 losses in the chart are command-wide and do not isolate Cobra.",
      "evidence": "dated-historical-event",
      "sourceKeys": [
        "armyCobra"
      ]
    },
    {
      "id": "brittany",
      "month": "1944-08",
      "date": "Aug 1944",
      "day": null,
      "title": "Breakout beyond Normandy",
      "place": "Southern Normandy / Brittany approaches",
      "lat": 48.84,
      "lon": -1.42,
      "kind": "operation",
      "summary": "The campaign moved beyond the beachhead. Early ALG records also start to be followed by later French airfield stations; monthly source intervals should not be interpreted as exact movement days.",
      "evidence": "contextual",
      "sourceKeys": [
        "johnson"
      ]
    },
    {
      "id": "falaise",
      "month": "1944-08",
      "date": "17–21 Aug 1944",
      "day": 17,
      "title": "Falaise pocket",
      "place": "Falaise, Normandy",
      "lat": 48.9,
      "lon": -0.2,
      "kind": "operation",
      "summary": "The Falaise–Argentan pocket fighting during mid-to-late August marked the closing phase of the Normandy campaign. The Atlas does not have a reliable all-air-force loss total for this pocket.",
      "evidence": "dated-historical-event",
      "sourceKeys": [
        "armyCobra"
      ]
    }
  ],
  "airfields": [
    {
      "code": "A-1",
      "name": "Saint-Pierre-du-Mont",
      "sector": "Cotentin",
      "opened": "1944-06-13",
      "units": [
        {
          "name": "366th Fighter Group",
          "first": "1944-06",
          "last": "1944-08",
          "sourceRowId": "usaf1988-p13-l7"
        }
      ]
    },
    {
      "code": "A-2",
      "name": "Criqueville",
      "sector": "Cotentin",
      "opened": "1944-06-19",
      "units": [
        {
          "name": "354th Fighter Group",
          "first": "1944-06",
          "last": "1944-08",
          "sourceRowId": "usaf1988-p13-l10"
        }
      ]
    },
    {
      "code": "A-3",
      "name": "Cardonville",
      "sector": "Cotentin",
      "opened": "1944-06-14",
      "units": [
        {
          "name": "368th Fighter Group",
          "first": "1944-06",
          "last": "1944-08",
          "sourceRowId": "usaf1988-p13-l15"
        }
      ]
    },
    {
      "code": "A-6",
      "name": "Beuzeville",
      "sector": "Cotentin",
      "opened": "1944-06-15",
      "units": [
        {
          "name": "371st Fighter Group",
          "first": "1944-06",
          "last": "1944-09",
          "sourceRowId": "usaf1988-p13-l26"
        },
        {
          "name": "367th Fighter Group",
          "first": "1944-07",
          "last": "1944-08",
          "sourceRowId": "usaf1988-p13-l27"
        }
      ]
    },
    {
      "code": "A-7",
      "name": "Azeville",
      "sector": "Cotentin",
      "opened": "1944-06-24",
      "units": [
        {
          "name": "365th Fighter Group",
          "first": "1944-06",
          "last": "1944-08",
          "sourceRowId": "usaf1988-p13-l29"
        }
      ]
    },
    {
      "code": "A-8",
      "name": "Picauville",
      "sector": "Cotentin",
      "opened": "1944-06-26",
      "units": [
        {
          "name": "405th Fighter Group",
          "first": "1944-06",
          "last": "1944-09",
          "sourceRowId": "usaf1988-p13-l32"
        }
      ]
    },
    {
      "code": "A-9",
      "name": "Le Molay",
      "sector": "Bessin",
      "opened": "1944-06-30",
      "units": [
        {
          "name": "67th Tactical Reconnaissance Group",
          "first": "1944-07",
          "last": "1944-08",
          "sourceRowId": "usaf1988-p14-l6"
        }
      ]
    },
    {
      "code": "A-10",
      "name": "Carentan",
      "sector": "Cotentin",
      "opened": "1944-06-19",
      "units": [
        {
          "name": "50th Fighter Group",
          "first": "1944-06",
          "last": "1944-08",
          "sourceRowId": "usaf1988-p14-l8"
        }
      ]
    }
  ],
  "limitations": [
    "Regional markers denote a locality, not the exact 1944 airfield coordinate.",
    "Monthly station data do not prove the group was present on every day of that month.",
    "USAAF ETO group totals cover the entire European theater, not Normandy.",
    "German Luftflotte 3 monthly all-cause aircraft destructions are command-report totals, not enemy claims, RAF victories, or Normandy-only losses.",
    "Reported German losses and USAAF group totals have different denominators and must never be summed or presented as a matched loss-exchange ratio.",
    "This preview covers May–Aug 1944 in depth; all other dates remain navigable but deliberately show incomplete coverage.",
    "Crosswalk station candidates originate in separate unmerged research PR #5, are not exact geo-verified airfield assignments.",
    "14,674 is a dated 6 June Allied SORTIE count (RAF Museum), and is not interchangeable with June monthly USAAF combat groups or German aircraft losses."
  ]
};
