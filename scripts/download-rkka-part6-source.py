#!/usr/bin/env python3
"""Retrieve original HTML pages for local, offline Soviet operations research.

Use only with approval for network access. Keep downloaded webpages in temporary
research storage; later commit structured numeric transcriptions, not full pages.
"""
import sys
import time
import urllib.request
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit("Usage: python3 scripts/download-rkka-part6-source.py <temporary-output-directory>")
root = Path(sys.argv[1])
root.mkdir(parents=True, exist_ok=True)
base = "https://www.rkka.es/Estadisticas/VVS_stat/06/"
success, failures = [], []
for i in range(1, 37):
    filename = f"06_{i:02d}.html"
    try:
        req = urllib.request.Request(base + f"06_{i:02d}.htm", headers={"User-Agent": "HistoricalResearch/1.0"})
        with urllib.request.urlopen(req, timeout=20) as response:
            data = response.read(2_000_000)
        if b"<table" not in data.lower() and b"<TABLE" not in data:
            raise ValueError("no HTML table in downloaded response")
        (root / filename).write_bytes(data)
        success.append(i)
    except Exception as ex:
        failures.append({"number": i, "error": str(ex)[:130]})
    time.sleep(0.25)
print("Part 6 source downloads:", len(success), "successes,", len(failures), "failures")
if failures:
    print(failures)
