#!/usr/bin/env python3
"""Auditably transcribe USAAF Statistical Digest 1945, pp. 232, Tables 130–131.

Values read against scanned original PDF (archive.org item
ArmyAirForcesStatisticalDigestWorldWarII, image/PDF page 253).
Records are NON-effective sorties still flown, classified by abort reason.
"""
import json
from pathlib import Path

quarters_eto = ["1942-Q3 (Aug-Sep)", "1942-Q4", "1943-Q1", "1943-Q2", "1943-Q3",
                "1943-Q4", "1944-Q1", "1944-Q2", "1944-Q3", "1944-Q4",
                "1945-Q1", "1945-Q2 (Apr-May)"]
quarters_mto = ["1943-Q1", "1943-Q2", "1943-Q3", "1943-Q4", "1944-Q1",
                "1944-Q2", "1944-Q3", "1944-Q4", "1945-Q1", "1945-Q2 (Apr-May)"]

# The four series per aircraft role are [total, weather, mechanical, other].
# None is used for *unreported* quarters; the absence of medium/light bombers
# in ETO before 1943-Q3 was printed as a dash, not a published zero.
data_eto = {
    "all_types": [
        [142,607,510,1399,4336,7521,13018,35289,28258,19107,17960,7147],
        [48,235,192,395,1416,3088,4363,17074,14248,8721,3946,3647],
        [36,131,140,360,1159,1964,3686,8742,7322,5429,6084,1601],
        [58,241,178,644,1761,2469,4969,9473,6688,4957,7930,1899],
    ],
    "heavy_bomber": [
        [122,577,464,1140,2303,3326,6529,16581,11707,5610,7268,2356],
        [44,229,184,358,433,1826,2645,9345,6798,2702,982,1384],
        [26,116,113,256,660,876,1550,2604,2247,1594,1574,223],
        [52,232,167,526,1210,624,2334,4632,2662,1314,4712,749],
    ],
    "medium_light_bomber": [
        [None,None,None,None,1196,2578,3162,8308,6815,6254,4481,1734],
        [None,None,None,None,883,1065,1439,5345,4371,3821,1412,953],
        [None,None,None,None,119,154,282,748,462,363,1187,249],
        [None,None,None,None,194,1359,1441,2215,1982,2070,1882,532],
    ],
    "fighter": [
        [20,30,46,259,837,1617,3327,10400,9736,7243,6211,3057],
        [4,6,8,37,100,197,279,2384,3079,2198,1552,1310],
        [10,15,27,104,380,934,1854,5390,4613,3472,3323,1129],
        [6,9,11,118,357,486,1194,2626,2044,1573,1336,618],
    ],
}
data_mto = {
    "all_types": [
        [1752,3079,3833,6512,10365,13380,11187,15273,11823,6644],
        [683,644,379,2643,3790,4171,3013,6669,5238,4176],
        [374,315,1534,1591,2871,4768,4961,4003,3825,1172],
        [695,2120,1920,2278,3704,4441,3213,4601,2760,1296],
    ],
    "heavy_bomber": [
        [381,610,1153,1727,4304,6706,4798,8649,5992,4071],
        [122,134,164,698,1822,2585,1056,4280,2964,2934],
        [111,79,359,567,1177,2214,2272,1973,1806,564],
        [148,397,630,462,1305,1907,1470,2396,1222,573],
    ],
    "medium_light_bomber": [
        [427,679,849,1851,2650,2647,2839,3078,2697,1200],
        [219,242,40,601,738,738,1091,1191,1168,504],
        [50,35,248,198,361,374,528,419,537,214],
        [158,402,561,1052,1551,1535,1220,1468,992,482],
    ],
    "fighter": [
        [944,1790,1831,2934,3411,4027,3550,3546,3134,1373],
        [342,268,175,1344,1230,848,866,1198,1106,738],
        [213,201,927,826,1333,2180,2161,1611,1482,394],
        [389,1321,729,764,848,999,523,737,546,241],
    ],
}
printed_totals = {
    "ETO": {"all_types": [135294,57373,36654,41267],
            "heavy_bomber": [57983,26930,11839,19214],
            "medium_light_bomber": [34528,19289,3564,11675],
            "fighter": [42783,11154,21251,10378]},
    "MTO": {"all_types": [83848,31406,25414,27028],
            "heavy_bomber": [38391,16759,11122,10510],
            "medium_light_bomber": [18917,6532,2964,9421],
            "fighter": [26540,8115,11328,7097]}
}

dimensions = ["total", "weather", "mechanical", "other"]
theaters, exceptions = [], []
for theater, data, quarters in [("ETO", data_eto, quarters_eto), ("MTO", data_mto, quarters_mto)]:
    parsed = {role: [] for role in data}
    for role, arrays in data.items():
        if any(len(arr) != len(quarters) for arr in arrays):
            raise AssertionError("Wrong number of quarterly cells")
        for i, q in enumerate(quarters):
            values = {name: arrays[j][i] for j, name in enumerate(dimensions)}
            if values["total"] is not None and sum(values[k] for k in dimensions[1:]) != values["total"]:
                exceptions.append({"theater": theater, "role": role, "quarter": q, "issue": "cause_components"})
            parsed[role].append({"quarter": q, **values})
        for j, name in enumerate(dimensions):
            actual = sum(v for v in arrays[j] if v is not None)
            if actual != printed_totals[theater][role][j]:
                exceptions.append({"theater": theater, "role": role, "metric": name,
                                   "sourceGrandTotal": printed_totals[theater][role][j], "computed": actual})
    for i, q in enumerate(quarters):
        for name in dimensions:
            # A missing printed role has no contribution to the all-type total
            # for the specific *reported* period, not a fabricated zero.
            reported = parsed["all_types"][i][name]
            component_sum = sum(parsed[role][i][name] or 0 for role in data if role != "all_types")
            if component_sum != reported:
                exceptions.append({"theater": theater, "quarter": q, "metric": name,
                                   "issue": "aircraft_role_components", "reported": reported,
                                   "computed": component_sum})
    theaters.append({"theater": theater, "sourceTable": 130 if theater == "ETO" else 131,
                     "quarterly": parsed, "printedGrandTotals": {role: dict(zip(dimensions, vals))
                                                                for role, vals in printed_totals[theater].items()}})

out = {
    "sourceTitle": "Army Air Forces Statistical Digest, World War II (1945), Tables 130 and 131",
    "sourceUrl": "https://archive.org/details/ArmyAirForcesStatisticalDigestWorldWarII",
    "printedPage": 232, "scanPdfPage": 253,
    "sourceClass": "USAAF official primary statistical digest, verified against printed scan",
    "definition": "Non-effective combat sorties flown, by cause and aircraft role: not aircraft losses, pilot casualties, or all attempted missions.",
    "scopeNotes": [
        "ETO 1942-Q3 covers August–September only, not the entire quarter; 1945-Q2 covers April–May only.",
        "MTO starts in 1943-Q1, excludes 1942 from non-effective series; 1945-Q2 covers April–May only.",
        "ETO medium/light bomber returns before 1943-Q3 printed dash; retain nulls instead of zeros.",
        "The category 'other' is published without finer causes in these tables; do not interpret as enemy action.",
        "Do not add these non-effective counts on top of airborne totals: non-effective sorties are a subset of airborne sorties."
    ],
    "theaters": theaters,
    "arithmeticExceptions": exceptions
}
path = Path(__file__).resolve().parents[1] / "research/transcriptions/usaaf-eto-mto-non-effective-sorties-by-role-and-cause-quarterly-1942-1945.json"
path.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n")
print("Official Table 130/131", sum(len(data["quarterly"]["all_types"]) for data in theaters), "theater-quarter records", len(exceptions), "reconciliation exceptions")
