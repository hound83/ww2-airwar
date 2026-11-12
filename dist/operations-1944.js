(() => {
  "use strict";
  const full = ["1944-01-01", "1944-06-30"];
  const ranges = {full, "big-week": ["1944-02-19", "1944-02-26"], "d-day": ["1944-06-05", "1944-06-10"],
    june: ["1944-06-01", "1944-06-30"]};
  const form = document.getElementById("filters");
  const field = name => form.elements.namedItem(name);
  const days = document.getElementById("days");
  const status = document.getElementById("filter-status");
  const csv = document.getElementById("csv-download");
  const more = document.getElementById("more");
  const coverageForce = document.getElementById("coverage-force");
  const presets = Array.from(document.querySelectorAll("[data-range]"));
  const dateLabel = new Intl.DateTimeFormat("en-GB", {day: "numeric", month: "short", timeZone: "UTC"});
  const monthLabel = new Intl.DateTimeFormat("en-GB", {month: "long", timeZone: "UTC"});
  const number = new Intl.NumberFormat("en-GB");
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt = value => value == null ? "—" : number.format(value);
  const dateText = day => dateLabel.format(new Date(day + "T00:00:00Z"));
  let data, byId, linksById, bilateral, filtered = [], limit = 12;

  function sourceUrl(id, page) {
    return data.sources[id].url + (page ? "#page=" + page : "");
  }

  function sourceLink(id, locator, page) {
    const source = data.sources[id];
    return '<a href="' + escape(sourceUrl(id, page)) + '">' + escape(source.title) + '</a>' +
      (locator ? " · " + escape(locator) : "");
  }

  function displayTitle(record) {
    return record.localities?.length ? record.name + " · " + record.localities.slice(0, 3).join(", ") : record.name;
  }

  function evidenceFor(record) {
    return (linksById.get(record.id) || []).map(link => {
      const peerId = link.records.find(id => id !== record.id);
      const peer = byId.get(peerId);
      return '<p class="link-note"><strong>' + escape(link.label) + '</strong> · ' +
        escape(displayTitle(peer)) + '. ' + escape(link.note) + ' ' + sourceLink(link.source, link.locator) + '</p>';
    }).join("");
  }

  function card(record) {
    const metrics = Object.entries(record.metrics).map(([key, value]) =>
      '<div><dt>' + escape(data.metrics[key]) + '</dt><dd>' + escape(record.qualifiers?.[key] || "") + fmt(value) +
      (record.derivedMetrics?.includes(key) ? ' <small>(derived)</small>' : '') + '</dd></div>').join("");
    const details = [record.units, record.aircraft].filter(Boolean).join(" · ");
    const refs = (record.references || []).map(ref => '<p>' + sourceLink(ref.source, ref.locator) + '</p>').join("");
    return '<details class="record"><summary><span class="title">' + escape(displayTitle(record)) +
      '</span><span class="command">' + escape(data.forces[record.force].label) + ' · ' + escape(data.kinds[record.kind]) +
      (record.endDate ? ' · through ' + dateText(record.endDate) : '') + '</span></summary><div class="details">' +
      (details ? '<p>' + escape(details) + '</p>' : '') +
      (record.localities?.length > 3 ? '<p>Reported locations · ' + escape(record.localities.join(", ")) + '</p>' : '') +
      (metrics ? '<dl class="metrics">' + metrics + '</dl>' : '<p class="muted">Aircraft counts unavailable in this entry.</p>') +
      (record.note ? '<p>' + escape(record.note) + '</p>' : '') + evidenceFor(record) +
      '<p>' + sourceLink(record.source, record.locator, record.sourcePage) + ' · ' + escape(data.sources[record.source].type) + '</p>' + refs + '</div></details>';
  }

  function side(records, side) {
    const group = records.filter(r => data.forces[r.force].side === side);
    if (!group.length) return "";
    return '<div class="day-side"><h4>' + (side === "allied" ? "Allied" : "German") + '</h4>' + group.map(card).join("") + '</div>';
  }

  function currentRange() {
    return [field("from").value || full[0], field("to").value || full[1]];
  }

  function updateURL() {
    const params = new URLSearchParams();
    const [from, to] = currentRange();
    if (from !== full[0]) params.set("from", from);
    if (to !== full[1]) params.set("to", to);
    for (const name of ["force", "evidence", "q"]) {
      if (field(name).value.trim()) params.set(name, field(name).value.trim());
    }
    const query = params.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
    for (const button of presets) {
      const [start, end] = ranges[button.dataset.range];
      button.setAttribute("aria-pressed", String(start === from && end === to));
    }
  }

  function renderDays() {
    const byDate = new Map();
    for (const r of filtered) {
      const bucket = byDate.get(r.date) || [];
      bucket.push(r);
      byDate.set(r.date, bucket);
    }
    days.innerHTML = Array.from(byDate).slice(0, limit).map(([date, records]) =>
      '<article class="day"><header><h3><time datetime="' + date + '">' + dateText(date) +
      '</time></h3>' + (records.some(hasBilateral) ? '<span class="muted">Evidence from both sides on this date or night</span>' : '') +
      '</header><div class="day-columns">' + side(records, "allied") + side(records, "german") + '</div></article>').join("");
    more.hidden = byDate.size <= limit;
    csv.disabled = filtered.length === 0;
    status.textContent = filtered.length ? number.format(filtered.length) + " records across " + byDate.size + " start dates. Showing " +
      Math.min(limit, byDate.size) + " dates." : currentRange()[0] > currentRange()[1] ?
      "Choose an end date on or after the start date." : "No records match these filters.";
  }

  function hasBilateral(record) {
    return bilateral.has(record.date) || Boolean(record.endDate && bilateral.has(record.endDate));
  }

  function applyFilters() {
    const [from, to] = currentRange();
    const force = field("force").value;
    const evidence = field("evidence").value;
    const q = field("q").value.trim().toLocaleLowerCase();
    filtered = from <= to ? data.records.filter(record =>
      record.date <= to && (record.endDate || record.date) >= from &&
      (!force || force === record.force) &&
      (evidence !== "both" || hasBilateral(record)) &&
      (evidence !== "linked" || linksById.has(record.id)) &&
      (evidence !== "returns" || ["loss-return", "loss-type"].includes(record.kind)) &&
      (!q || [record.name, record.units, record.aircraft, ...(record.localities || [])]
        .filter(Boolean).join(" ").toLocaleLowerCase().includes(q))) : [];
    limit = 12;
    updateURL();
    renderDays();
  }

  function causeComparison(row) {
    if (!row.capturedByCause) return "";
    const causes = Object.entries(row.capturedByCause).map(([key, captured]) =>
      '<li>' + escape(data.metrics[key]) + ' · ' + fmt(captured) + ' / ' + fmt(row.publishedByCause[key]) + '</li>').join("");
    return '<details><summary>Daily sum and printed total by cause</summary><ul>' + causes + '</ul></details>';
  }

  function renderCoverage() {
    const id = coverageForce.value;
    const body = document.getElementById("coverage-rows");
    const rows = data.reconciliation.filter(row => row.force === id);
    body.innerHTML = rows.length ? rows.map(row =>
      '<tr role="row"><th scope="row" role="rowheader">' + monthLabel.format(new Date(row.month + "-01T00:00:00Z")) +
      '</th><td role="cell">' + fmt(row.captured) + '</td><td role="cell">' + fmt(row.published) + '</td><td role="cell">' + escape(row.scope) +
      (row.note ? '<br>' + escape(row.note) : '') + causeComparison(row) +
      '<div>' + sourceLink(row.source, row.locator) + '</div></td></tr>').join("") :
      '<tr role="row"><td role="cell" colspan="4">Monthly command returns are unavailable for this selection.</td></tr>';
  }

  function downloadCsv() {
    const columns = Object.keys(data.metrics);
    const fieldNames = ["id", "start_date", "end_date", "command", "record_type", "title", "reported_locations", "unit", "aircraft",
      ...columns, "number_qualifiers", "source_type", "source_url", "source_locator", "additional_sources", "evidence_links", "notes", "derived_metrics"];
    const cell = value => '"' + String(value ?? "").replaceAll('"', '""') + '"';
    const lines = [fieldNames.map(cell).join(",")];
    for (const r of filtered) {
      const source = data.sources[r.source];
      const refs = (r.references || []).map(ref => data.sources[ref.source].url + " · " + ref.locator).join(" | ");
      const links = (linksById.get(r.id) || []).map(link => link.label + " · " + link.records.join(" + ") +
        " · " + data.sources[link.source].url + " · " + link.locator + " · " + link.note).join(" | ");
      lines.push([r.id, r.date, r.endDate, data.forces[r.force].label, data.kinds[r.kind], r.name,
        r.localities?.join(" | "), r.units, r.aircraft, ...columns.map(key => r.metrics[key]),
        Object.entries(r.qualifiers || {}).map(([key, value]) => key + " " + value).join(" | "),
        source.type, sourceUrl(r.source, r.sourcePage), r.locator, refs, links, r.note,
        r.derivedMetrics?.join(" | ")].map(cell).join(","));
    }
    const url = URL.createObjectURL(new Blob([lines.join("\r\n") + "\r\n"], {type: "text/csv;charset=utf-8"}));
    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas-air-operations-1944.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function initialize(result) {
    data = result;
    byId = new Map(data.records.map(r => [r.id, r]));
    linksById = new Map();
    for (const link of data.links) {
      for (const id of link.records) linksById.set(id, [...(linksById.get(id) || []), link]);
    }
    const alliedDates = new Set(), germanDates = new Set();
    for (const record of data.records) {
      const allied = data.forces[record.force].side === "allied";
      if (!allied && ["estimate", "strength"].includes(record.kind)) continue;
      const dates = allied ? alliedDates : germanDates;
      dates.add(record.date);
      if (record.endDate) dates.add(record.endDate);
    }
    bilateral = new Set([...germanDates].filter(date => alliedDates.has(date)));

    const options = Object.entries(data.forces).map(([id, force]) => '<option value="' + escape(id) + '">' + escape(force.label) + '</option>').join("");
    field("force").insertAdjacentHTML("beforeend", options);
    coverageForce.innerHTML = options;
    coverageForce.value = "rafbc";
    const params = new URLSearchParams(location.search);
    const [start, end] = ranges[params.get("preset")] || full;
    const validDate = (value, fallback) => /^1944-0[1-6]-\d{2}$/.test(value || "") && value >= full[0] && value <= full[1] ? value : fallback;
    field("from").value = validDate(params.get("from"), start);
    field("to").value = validDate(params.get("to"), end);
    for (const name of ["force", "evidence", "q"]) {
      if (params.has(name)) field(name).value = params.get(name);
    }
    for (const button of presets) {
      button.addEventListener("click", () => {
        [field("from").value, field("to").value] = ranges[button.dataset.range];
        applyFilters();
      });
    }
    form.addEventListener("submit", event => event.preventDefault());
    form.addEventListener("input", applyFilters);
    coverageForce.addEventListener("change", renderCoverage);
    more.addEventListener("click", () => { limit += 12; renderDays(); });
    csv.addEventListener("click", downloadCsv);
    renderCoverage();
    applyFilters();
  }

  fetch(document.getElementById("json-download").href)
    .then(response => {
      if (!response.ok) throw new Error("Unable to load source dataset");
      return response.json();
    })
    .then(initialize)
    .catch(() => { status.textContent = "The mission dataset could not be loaded. Try the JSON download above."; });
})();
