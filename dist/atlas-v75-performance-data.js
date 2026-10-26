/* Generated from research/transcriptions/aircraft-performance.json; do not edit. */
window.AirWarV75PerformanceData = {
  "schemaVersion": 1,
  "auditedOn": "2026-10-26",
  "sources": {
    "aaee-spitfire-ix": {
      "title": "A&AEE Spitfire IX tests: BS.543 / Merlin 66 and BS.551 / Merlin 70",
      "url": "https://www.wwiiaircraftperformance.com/org/spitcom/mk9/spitLF-HF-mkIX.html",
      "provenance": "primary_report_transcription",
      "verification": "html_tables_checked; original scans not independently reconciled",
      "locator": "Sections 2–4: corrected summary tables in 4.2 and 4.4",
      "note": "RAF test aircraft; standard-atmosphere and boost-corrected report results. Not raw instrument readings or a universal mark-level envelope. Report date not established from the HTML."
    },
    "wright-p51b-6883": {
      "title": "USAAF Eng-47-1734-A, P-51B-5-NA 43-6883, 24 April 1944",
      "url": "https://www.wwiiaircraftperformance.com/org/p-51/p-51b-6883.html",
      "provenance": "primary_report_transcription",
      "verification": "html_tables_checked; original scans not independently reconciled",
      "locator": "Sections III, VI.B.2 and VI.D; detailed speed and climb tables",
      "note": "Faired speed results and standard-condition corrections; carburettor malfunction caused scatter. Detailed table takes precedence over rounded summary; differences retained in conflicts. BHP from charts is not measured engine power."
    },
    "wright-p47d10-75035": {
      "title": "USAAF Eng-47-1652-A, P-47D-10 43-75035, 11 October 1943",
      "url": "https://wwiiaircraftperformance.com/org/p-47/p-47.html",
      "provenance": "primary_report_transcription",
      "verification": "html_tables_checked; original scans not independently reconciled",
      "locator": "11 October 1943 report, B.1 high speed and B.2 climbs",
      "note": "Manufacturer-plant trials reported by Wright Field. Water injection and Curtiss 714-1C2-12 propeller; not the later propeller or 44-1-fuel tests on this page. Serial retained as printed in the transcription."
    }
  },
  "configurations": [
    {
      "id": "spitfire-lfix-bs543",
      "force": "RAF",
      "family": "Spitfire",
      "variant": "LF Mk IX",
      "specimen": "BS.543",
      "engine": "Merlin 66",
      "sourceId": "aaee-spitfire-ix",
      "conditions": "Combat rating, nominal +18 lb/in² gauge boost, 3000 rpm; take-off 7485 lb. Speed corrected to 7110 lb, radiator closed; climb radiator open. Rotol XH54D-RM-S5. Sealed gun ports. Five-minute combat limit waived for test climbs.",
      "correction": "Report-corrected to standard atmosphere and +18 lb/in²; speed at 95% take-off weight.",
      "speed": [
        [
          0,
          336,
          "MS"
        ],
        [
          10800,
          384,
          "MS"
        ],
        [
          22000,
          407,
          "FS"
        ],
        [
          30000,
          395,
          "FS"
        ]
      ],
      "climb": [
        [
          0,
          4620,
          "MS"
        ],
        [
          7000,
          4700,
          "MS"
        ],
        [
          18000,
          3860,
          "FS"
        ],
        [
          30000,
          2125,
          "FS"
        ]
      ]
    },
    {
      "id": "spitfire-hfix-bs551",
      "force": "RAF",
      "family": "Spitfire",
      "variant": "HF Mk IX",
      "specimen": "BS.551",
      "engine": "Merlin 70",
      "sourceId": "aaee-spitfire-ix",
      "conditions": "Combat rating, nominal +18 lb/in² gauge boost, 3000 rpm; take-off 7470 lb. Speed corrected to 95% take-off weight, radiator closed; climb radiator open. Rotol R5/4F5/4. Sealed gun ports. Five-minute combat limit waived for test climbs.",
      "correction": "Use corrected summary, not original overboosted readings; boost-gauge correction matters. Report attributes altitude fall-off to carburettor richness.",
      "speed": [
        [
          0,
          329,
          "MS"
        ],
        [
          15900,
          396,
          "MS"
        ],
        [
          27800,
          415.5,
          "FS"
        ],
        [
          30000,
          413,
          "FS"
        ]
      ],
      "climb": [
        [
          0,
          4390,
          "MS"
        ],
        [
          11900,
          4530,
          "MS"
        ],
        [
          24700,
          3480,
          "FS"
        ],
        [
          30000,
          2600,
          "FS"
        ]
      ]
    },
    {
      "id": "p51b5-436883",
      "force": "USAAF",
      "family": "P-51",
      "variant": "P-51B-5-NA",
      "specimen": "43-6883",
      "engine": "Packard V-1650-3",
      "sourceId": "wright-p51b-6883",
      "conditions": "WEP 3000 rpm, up to 67 inHg absolute manifold pressure (falls above critical height), auto-rich; take-off 9205 lb including 180 US gal fuel. Speed table weights vary by altitude. Hamilton Standard J-6523A-24; gear/flaps up, cooling shutters automatic; no bomb racks.",
      "correction": "Standard atmosphere; speed points from report faired curve. Carburettor scatter is unresolved; no numerical uncertainty invented. Detailed tables used, not rounded summary.",
      "speed": [
        [
          0,
          370.5,
          "Low"
        ],
        [
          10000,
          406.5,
          "Low"
        ],
        [
          16600,
          430,
          "Low"
        ],
        [
          25000,
          418,
          "Low"
        ],
        [
          20000,
          415.5,
          "High"
        ],
        [
          29400,
          442.5,
          "High"
        ],
        [
          35000,
          417.5,
          "High"
        ],
        [
          40000,
          377.5,
          "High"
        ]
      ],
      "climb": [
        [
          0,
          3187,
          "Low"
        ],
        [
          5000,
          3282,
          "Low"
        ],
        [
          10000,
          3380,
          "Low"
        ],
        [
          13800,
          3450,
          "Low"
        ],
        [
          19500,
          2715,
          "Low"
        ],
        [
          19500,
          2715,
          "High"
        ],
        [
          25500,
          2658,
          "High"
        ],
        [
          30000,
          2025,
          "High"
        ],
        [
          35000,
          1300,
          "High"
        ],
        [
          40000,
          500,
          "High"
        ]
      ]
    },
    {
      "id": "p47d10-4375035",
      "force": "USAAF",
      "family": "P-47",
      "variant": "P-47D-10",
      "specimen": "43-75035 (as transcribed)",
      "engine": "R-2800-63 / A-17 turbo regulator",
      "sourceId": "wright-p47d10-75035",
      "conditions": "2700 rpm with water injection; up to 56 inHg absolute manifold pressure, falling at high altitude. Take-off 13234 lb, 305 US gal gasoline, 15 gal water; six guns simulated. Curtiss 714-1C2-12. Speed: cowl closed, oil/intercooler neutral. Climb: cooling flaps wide open.",
      "correction": "Reported test results. Climb critical altitude 25000 ft from A-17 regulator; turbo limit 22000 rpm reached at 28000 ft. Do not mix with other P-47 test configurations.",
      "speed": [
        [
          0,
          333,
          "Turbo"
        ],
        [
          5000,
          353,
          "Turbo"
        ],
        [
          10000,
          372,
          "Turbo"
        ],
        [
          15000,
          390,
          "Turbo"
        ],
        [
          20000,
          406,
          "Turbo"
        ],
        [
          25000,
          421,
          "Turbo"
        ],
        [
          30000,
          433,
          "Turbo"
        ],
        [
          31000,
          435,
          "Turbo"
        ],
        [
          33000,
          430,
          "Turbo"
        ],
        [
          35000,
          422,
          "Turbo"
        ],
        [
          38000,
          404,
          "Turbo"
        ]
      ],
      "climb": [
        [
          0,
          2870,
          "Turbo"
        ],
        [
          5000,
          2810,
          "Turbo"
        ],
        [
          10000,
          2680,
          "Turbo"
        ],
        [
          15000,
          2460,
          "Turbo"
        ],
        [
          20000,
          2180,
          "Turbo"
        ],
        [
          25000,
          1860,
          "Turbo"
        ],
        [
          28000,
          1520,
          "Turbo"
        ],
        [
          30000,
          1400,
          "Turbo"
        ],
        [
          34000,
          950,
          "Turbo"
        ],
        [
          38000,
          500,
          "Turbo"
        ]
      ]
    }
  ],
  "conflicts": [
    {
      "configurationId": "p51b5-436883",
      "metric": "speed",
      "altitudeFt": 0,
      "summary": 371,
      "detail": 370.5,
      "unit": "mph TAS",
      "resolution": "Retain detailed VI.B.2 table; summary differs by 0.5 mph."
    },
    {
      "configurationId": "p51b5-436883",
      "metric": "speed",
      "altitudeFt": 29400,
      "summary": 442,
      "detail": 442.5,
      "unit": "mph TAS",
      "resolution": "Retain detailed VI.B.2 table; summary differs by 0.5 mph."
    },
    {
      "configurationId": "p51b5-436883",
      "metric": "climb",
      "altitudeFt": 25500,
      "summary": 2660,
      "detail": 2658,
      "unit": "ft/min",
      "resolution": "Retain detailed VI.D table; summary differs by 2 ft/min."
    }
  ]
};
