/* Shared by the build and the reader so CSV exports retain the same reporting populations. */
(function (root) {
  "use strict";
  const labelDate = value => {
    const format = part => {
      if (!/^\d{4}-\d{2}(-\d{2})?$/.test(part)) return part;
      const full = part.length === 10;
      return new Intl.DateTimeFormat("en-GB", {day: full ? "numeric" : undefined, month: "short", year: "numeric", timeZone:"UTC"})
        .format(new Date((full ? part : part + "-01") + "T12:00:00Z"));
    };
    return value.split("/").map(format).join(" – ");
  };
  function coverage(population) {
    const named = population.members.length;
    if (population.basis === "identified lower bound") return "At least " + population.total + " identified";
    if (!named) return population.total + " reported · names unresolved";
    return named + " of " + population.total + " named";
  }
  function csv(items, gazetteer) {
    const headings = ["campaign","population","date","force","echelon","status","scope","count_basis","reported_count","named_in_roster","record_kind","unit","parent_or_sector","base_or_area","on_strength","serviceable","roster_source","roster_locator","unit_source","unit_locator","station_ids","station_coordinates_and_sources","activity","activity_source","activity_locator","interpretation"];
    const rows = [headings];
    for (const {campaign, population:p, members} of items) {
      for (const m of members.length ? members : [null]) {
        const coords = (m?.stations || []).map(id => {
          const s = gazetteer[id];
          return [s.name, s.lat, s.lon, s.source, s.locator].join(" | ");
        }).join(" / ");
        rows.push([campaign,p.id,p.date,p.force,p.echelon,p.event,p.scope,p.basis,p.total,p.members.length,
          m ? "named member" : "reported total only", m?.unit,m?.parent,m?.place,m?.strength,m?.serviceable,
          p.source,p.locator,m?.source,m?.locator,(m?.stations || []).join(" | "),coords,m?.activity,m?.activitySource,m?.activityLocator,p.note]);
      }
    }
    const cell = v => '"' + String(v ?? "").replaceAll('"','""') + '"';
    return rows.map(row => row.map(cell).join(",")).join("\n") + "\n";
  }
  const api = {labelDate, coverage, csv};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AtlasRosterTools = api;
})(typeof window === "undefined" ? globalThis : window);
