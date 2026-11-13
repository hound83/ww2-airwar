(() => {
  "use strict";

  const base = "./research/transcriptions/";
  const inputFiles = {
    ledger: "bodenplatte-1945-01-01.json",
    scope: "bodenplatte-operation-scope-1944-1945.json",
    archival: "bodenplatte-archival-evidence-1945-01-01.json",
    map: "bodenplatte-map.json",
    units: "bodenplatte-unit-airframes-1945-01-01.csv",
    order: "wikipedia-followup-evidence-2026-11-12.json"
  };

  const repeatedScope = new Set(["trond-alt-d", "trond-alt-dmg", "trond-all-d", "trond-all-dmg", "op-german-d", "op-german-dmg", "op-ground-d", "op-ground-dmg"]);
  const repeatedArchival = new Set(["b58-franks-d", "b58-franks-severe"]);

  // Scope and archival ledgers reuse short source IDs. Resolve them within their own file.
  function references(data, entries) {
    return entries.map(ref => {
      const { source, locator, url } = typeof ref === "string" ? { source: ref } : ref;
      const record = data.sources[source];
      if (!record) throw new Error("Missing source " + source);
      return { ...record, url: url || record.url, locator: locator || record.locator || "" };
    });
  }

  function scopeRecord(row, scope) {
    const german = /^(gh-de-loss|op-(ahb-force|german-(killed|pow|wounded)|aaf-force|9-force))$/.test(row.id);
    const category = row.qualifier === "claim" || row.id.startsWith("op-raf-july") ? "claims"
      : row.unit === "people" ? "personnel"
      : /attacker|aircraft in attack|fighters involved|takeoffs|dispatched|scrambled|in the formation/.test(row.measure.toLowerCase()) ? "strength"
      : row.unit !== "aircraft" || row.id === "op-9-bomb" ? "other" : "outcomes";
    return {
      id: row.id, date: row.date, place: row.place, side: german || row.qualifier === "opponent estimate" ? "German" : "Allied",
      metric: row.measure, population: row.force, aircraft: row.unit, value: row.value, category,
      quality: row.id.startsWith("op-raf-july") ? "alternative credited claims" : row.qualifier,
      setting: row.id === "gh-de-loss" ? "Gruppe mission" : row.id === "op-9-bomb" ? "Wider theatre" : "",
      note: row.scope, sources: references(scope, [row])
    };
  }

  function archivalRecord(row, archival) {
    const claim = /claimed/.test(row.metric);
    const assessment = row.id.startsWith("op-german-estimate");
    const personnel = /personnel|soldier/.test(row.metric);
    const count = row.metric === "Attackers observed" || row.id === "b58-180-ground";
    const quality = assessment ? "opponent estimate" : claim ? "claim" : row.source === "lowe" || row.source === "bergstrom" ? "secondary" : "reported";
    return {
      id: row.id, date: archival.raidDate, place: row.site, side: assessment ? "German" : "Allied",
      metric: row.metric, population: row.unit, aircraft: personnel ? "people" : "aircraft", value: row.value,
      category: claim ? "claims" : personnel ? "personnel" : count ? "strength" : "outcomes",
      setting: assessment ? "Air and ground assessment" : "",
      quality,
      note: row.scope, sources: references(archival, [row])
    };
  }

  const unitLinks = {
    "Eindhoven airfield": ["eindhoven"], "Eindhoven area": ["eindhoven"], "JG 3 assignment": ["eindhoven"],
    "Asch/Ophoven assignment": ["asch", "ophoven"], "I./JG 26, Grimbergen route attribution to check": ["grimbergen"],
    "II./JG 26 Evere assignment": ["evere"], "III./JG 54 Grimbergen assignment": ["grimbergen"],
    "IV./JG 54 Melsbroek assignment": ["melsbroek"], "Brussels sector, target depends on Gruppe": ["evere", "grimbergen", "melsbroek"],
    "JG 27 Melsbroek assignment": ["melsbroek"]
  };
  const operationLinks = {
    "Gilze-Rijen": ["gilze"], "JG 1 western Belgian assignments": ["maldegem", "ursel", "ghent"],
    "JG 2 Sint-Truiden assignment and route": ["sinttruiden"],
    "JG 4 Le Culot assignment and diversions": ["leculot", "asch", "ophoven", "sinttruiden"],
    "JG 6 Volkel assignment and diversions": ["volkel", "heesch", "eindhoven", "helmond"],
    "SG 4 Sint-Truiden assignment and diversions": ["sinttruiden"],
    "JG 77 Deurne/Woensdrecht assignment": ["antwerp", "woensdrecht"],
    "One of the two Polish air losses in the combined combat report": ["ghent"],
    "Metz–Frescaty assignment, en route": ["metz"]
  };

  function aircraftRecord(row, places, sources) {
    if (!places) throw new Error("Missing aircraft context for " + row.serial);
    return {
      id: "airframe-" + row.serial, date: row.date, places, side: row.side,
      metric: row.disposition, population: row.unit || "Unit unconfirmed",
      aircraft: row.aircraft, serial: row.serial, value: null, category: "airframes",
      quality: "individual aircraft", setting: row.location || "",
      note: [row.context, row.clock && "Time as recorded: " + row.clock, row.pilot, row.note].filter(Boolean).join(" · "),
      sources
    };
  }

  function parseUnits(csv, scope) {
    return csv.trim().split(/\r?\n/).slice(1).map(line => {
      // The register extract quotes every cell. Quoted commas and escaped quotes are data.
      const cells = [...line.matchAll(/"((?:[^"]|"")*)"(?:,|$)/g)].map(match => match[1].replaceAll('""', '"'));
      if (cells.length !== 16) throw new Error("Unexpected unit register row.");
      const [date, side, unit, aircraft, serial, printed, clock, location, pilot, disposition,
        context, cause, note, page, related, url] = cells;
      const provenance = references(scope, [{ source: "sglo", locator: "Printed p. " + page, url }]);
      if (related.startsWith("https://")) provenance.push({ title: "Additional aircraft reference", url: related });
      return aircraftRecord({
        date, side, unit, aircraft, serial, clock, location, pilot, disposition, context,
        note: [printed !== serial && "As printed: " + printed, cause, note].filter(Boolean).join(" · ")
      }, unitLinks[context], provenance);
    });
  }

  function defenceRecord(row, scope) {
    const measures = [
      ["Rounds fired", row.rounds], ["Claimed destroyed", row.claimedDestroyed], ["Claimed damaged", row.claimedDamaged],
      ["Observed hits", row.observedHits], ["Personnel killed", row.personnelKilled],
      ["Personnel wounded", row.personnelWounded], ["Enemy pilots captured", row.enemyPilotsCaptured]
    ];
    const metrics = measures.filter(([, value]) => value !== null).map(([label, value]) => label + ": " + value);
    return {
      id: "defence-" + row.site, date: row.date, place: row.site, side: "Allied", metric: "Attacking aircraft observed",
      population: row.unit, aircraft: "aircraft", value: row.aircraft, category: "defence", setting: row.window || "Time unavailable",
      quality: row.qualifier, note: [row.scope, ...metrics].join(" · "), sources: references(scope, [row])
    };
  }

  function compile({ ledger, scope, archival, map, units, order }) {
    const oldFields = new Map(ledger.fields.map(field => [field.id, field]));
    const fields = scope.sites.map(site => {
      const old = oldFields.get(site.id);
      const position = map.sites[site.id];
      const { lat, lng, note } = position;
      const outcome = site.status === "attacked" ? "attacked" : site.status.includes("intercepted") ? "intercepted" : "disputed";
      return {
        ...site, lat, lng, outcome, story: old?.story,
        gap: [site.scope, old?.gap].filter(Boolean).join(" "),
        sources: [...references(scope, site.sources), ...references(ledger, old?.sources || [])],
        positionSources: references(map, [position, ...(position.relatedSource ? [position.relatedSource] : [])]),
        positionNote: note
      };
    });
    const fieldOrder = ["eindhoven", "asch", "evere", "melsbroek", "metz"];
    const rank = id => fieldOrder.includes(id) ? fieldOrder.indexOf(id) : fieldOrder.length;
    fields.sort((a, b) => rank(a.id) - rank(b.id));
    // Preserve old deep links and the default Eindhoven entry. The remaining fields follow the scope ledger order.
    const byId = new Map(fields.map(field => [field.id, field]));
    const legacy = ledger.observations.map(row => ({
      ...row, date: ledger.date, place: row.id === "evere-grimbergen-ff" ? "grimbergen" : row.place,
      category: row.quality === "claim" ? "claims" : row.metric.startsWith("Personnel") ? "personnel"
        : ["Participating", "Present"].includes(row.metric) ? "strength" : "outcomes",
      sources: references(ledger, [row, ...(row.relatedSources || [])])
    }));
    const archivalRows = archival.observations.filter(row => !repeatedArchival.has(row.id)).map(row => archivalRecord(row, archival));
    const scopeRows = scope.observations.filter(row => !repeatedScope.has(row.id)).map(row => scopeRecord(row, scope));
    const airframes = [
      ...parseUnits(units, scope),
      ...scope.airframes.map(row => aircraftRecord(row, operationLinks[row.context], references(scope, [row, ...(row.relatedSources || [])]))),
      ...archival.airframes.map(row => aircraftRecord({
        ...row, date: archival.raidDate, aircraft: row.type, location: byId.get(row.site).name
      }, [row.site], references(archival, row.sources)))
    ];
    const jg53 = [
      ["metz", "II./JG 53", 9, "II. Gruppe, 1945", "The count covers the Frescaty mission."],
      ["metz", "IV./JG 53", 9, "IV. Gruppe, 1945", "The count covers the Frescaty mission."],
      ["etain", "III./JG 53", 10, "III. Gruppe, 1945", "The unit history describes an attack. Lowe reports that U.S. fighters intercepted the Gruppe before it reached the field. The German loss count covers the mission."]
    ].map(([place, population, value, locator, note]) => ({
      id: "jg53-" + population.split(".")[0].toLowerCase(), date: scope.raidDate, place, side: "German",
      metric: "Aircraft lost", aircraft: "Bf 109", population, value, category: "outcomes",
      quality: "secondary", setting: "Formation mission", note,
      sources: references(scope, [{ source: "jg53", locator }])
    }));
    const metz = legacy.find(row => row.id === "metz-368-loss");
    metz.population = "395th Fighter Squadron, 368th Fighter Group";
    metz.note += " The group chronology identifies the 395th and reports destroyed or seriously damaged aircraft without an exact count.";
    metz.sources.push(...references(scope, [{ source: "fg368", locator: "1 January 1945" }]));
    const records = [...legacy, ...archivalRows, ...scopeRows, ...jg53, ...scope.airDefence.map(row => defenceRecord(row, scope))];
    const timeline = scope.timeline.map(event => ({
      ...event, sources: references(scope, [event]),
      records: event.date === scope.raidDate ? [] : scopeRows.filter(row => row.date === event.date && row.place === event.place && !event.id.endsWith("alternative"))
    }));
    const orderOfBattle = order.formationListings.find(list => list.campaign === "bodenplatte");
    const formations = {
      scope: orderOfBattle.scope,
      sources: references(order, [orderOfBattle.source]),
      rows: orderOfBattle.rows.map(row => {
        const match = row.formation.match(/\b(?:JG|SG) \d+\b/);
        const group = row.formation.match(/^(?:I|II|III|IV)\.\/JG 53$/);
        const sites = group ? [byId.get(row.formation.startsWith("III.") ? "etain" : "metz")]
          : fields.filter(field => match && new RegExp("\\b" + match[0] + "\\b").test(field.german));
        return { ...row, sites };
      })
    };
    return {
      date: scope.raidDate, fields, timeline, formations, records, airframes,
      findings: archival.findings.map(row => ({ ...row, sources: references(archival, row.sources) })),
      archive: archival.archive, personnel: archival.personnel.map(row => ({ ...row, sources: references(archival, row.sources) }))
    };
  }

  async function load() {
    const entries = await Promise.all(Object.entries(inputFiles).map(async ([key, name]) => {
      const response = await fetch(base + name + "?v=9.5.0");
      if (!response.ok) throw new Error("Evidence file unavailable: " + name);
      return [key, key === "units" ? await response.text() : await response.json()];
    }));
    return compile(Object.fromEntries(entries));
  }

  if (typeof module === "object" && module.exports) module.exports = { compile, inputFiles };
  else window.BodenplatteData = { load };
})();
