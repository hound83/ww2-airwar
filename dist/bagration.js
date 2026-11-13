(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const number = new Intl.NumberFormat("en-GB");
  const calendar = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
  const day = value => calendar.format(new Date(value + "T00:00:00Z"));
  const interval = (start, end) => end === start ? day(start) : end ? day(start) + " – " + day(end) : "From " + day(start);
  const link = (href, label) => '<a href="' + escape(href) + '">' + escape(label) + '</a>';
  const option = value => '<option value="' + escape(value) + '">' + escape(value) + '</option>';

  function markerMap(cases, select) {
    if (!window.L) return;
    $("campaign-map").hidden = false;
    $("map-note").hidden = false;
    const map = L.map("campaign-map", { scrollWheelZoom: false, minZoom: 4, maxZoom: 10, attributionControl: false });
    L.control.attribution({ prefix: false }).addTo(map);
    const points = cases.map(item => L.latLng(item.lat, item.lng));
    map.fitBounds(points, { padding: [37, 37], maxZoom: 7 });
    const markers = cases.map((item, i) => {
      const icon = L.divIcon({ className: "bagration-pin", html: String(i + 1), iconSize: [28, 28] });
      const marker = L.marker(points[i], { icon, title: item.title });
      marker.on("add", () => marker.getElement().setAttribute("aria-label", item.title));
      marker.bindTooltip(escape(item.title), { direction: "top" });
      marker.on("click", () => select(item, true, true));
      return marker;
    });
    const leaders = points.map(() => L.polyline([], { color: "#456054", weight: 1, interactive: false }));
    function offsetMarkers() {
      const placed = [];
      const offsets = [[0, 0]];
      for (const radius of [34, 56, 78]) {
        for (let i = 0; i < 8; i++) offsets.push([radius * Math.sin(i * Math.PI / 4), radius * Math.cos(i * Math.PI / 4)]);
      }
      markers.forEach((marker, index) => {
        if (!map.hasLayer(marker)) return;
        const point = map.latLngToLayerPoint(points[index]);
        const candidates = offsets.map(offset => point.add(offset));
        const next = candidates.find(candidate => placed.every(other => candidate.distanceTo(other) >= 32)) || point;
        placed.push(next);
        const markerPoint = map.layerPointToLatLng(next);
        marker.setLatLng(markerPoint);
        leaders[index].setLatLngs(next === candidates[0] ? [] : [points[index], markerPoint]);
      });
    }
    map.on("zoomend", offsetMarkers);
    if (window.topojson) {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json")
        .then(response => {
          if (!response.ok) throw new Error("Map outline unavailable.");
          return response.json();
        })
        .then(world => {
          L.geoJSON(topojson.feature(world, world.objects.land), {
            interactive: false, style: { color: "#7d8974", weight: 1, fillColor: "#f0e9d5", fillOpacity: 1 }
          }).addTo(map).bringToBack();
          map.attributionControl.addAttribution("Natural Earth / world-atlas");
        })
        .catch(() => {});
    }
    return (selected, phase) => {
      markers.forEach((marker, index) => {
        const item = cases[index];
        if (!phase || item.phase === phase) {
          leaders[index].addTo(map);
          marker.addTo(map);
          marker.getElement().dataset.active = String(item === selected);
          marker.getElement().setAttribute("aria-pressed", String(item === selected));
        } else {
          marker.remove();
          leaders[index].remove();
        }
      });
      offsetMarkers();
      const active = markers[cases.indexOf(selected)];
      if (active && !map.getBounds().pad(-0.05).contains(active.getLatLng())) {
        map.panTo(active.getLatLng(), { animate: false });
      }
    };
  }

  function download(rows, filename) {
    const csv = rows.map(row => row.map(value => '"' + String(value ?? "").replaceAll('"', '""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const element = document.createElement("a");
    element.href = url;
    element.download = filename;
    document.body.append(element);
    element.click();
    element.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function start({ sources, units, cases, observations, balances, stations }) {
    const byUnit = new Map(units.map(unit => [unit.id, unit]));
    const byCase = new Map(cases.map(item => [item.id, item]));
    const phase = $("phase");
    const unit = $("unit");
    const kind = $("kind");
    const csv = $("evidence-csv");
    const kinds = [...new Set(observations.map(row => row.kind)), "Movement returns"];
    let selected;
    let shown;
    let shownBalances;
    const source = (id, locator = "") => link(sources[id].url, sources[id].title) + (locator ? " · " + escape(locator) : "");
    const formatUnit = id => byUnit.get(id)?.name || "";
    const rowUnit = row => row.reporter || formatUnit(row.unit);
    const fieldUrl = (item, filters = {}) => "?" + new URLSearchParams({ case: item.id, ...filters }) + "#campaign";
    const filters = () => Object.fromEntries([["phase", phase.value], ["unit", unit.value], ["kind", kind.value]].filter(([, value]) => value));
    const chooseLink = (item, label) => '<a data-case-link="' + escape(item.id) + '" href="' + fieldUrl(item) + '">' + escape(label) + '</a>';

    phase.insertAdjacentHTML("beforeend", [...new Set(cases.map(item => item.phase))].map(option).join(""));
    kind.insertAdjacentHTML("beforeend", kinds.map(option).join(""));
    $("case-list").innerHTML = cases.map((item, i) =>
      '<a class="case-choice" data-case="' + escape(item.id) + '" href="' + fieldUrl(item) + '"><small>' +
      escape(interval(item.start, item.end)) + '</small><strong>' + (i + 1) + '. ' + escape(item.title) + '</strong></a>'
    ).join("");
    const choices = [...$("case-list").querySelectorAll("[data-case]")];
    const updateMap = markerMap(cases, select);
    const balanceColumns = [
      ["open", "Opening"], ["newBuild", "New"], ["repair", "From repair"], ["transferIn", "Transfers in"],
      ["enemy", "Enemy action"], ["nonEnemy", "Other removals"], ["overhaul", "Overhaul"],
      ["transferOut", "Transfers out"], ["close", "Closing"]
    ];

    function renderEvidence(row) {
      const scope = row.datePrecision || interval(row.date, row.end);
      return '<details class="record evidence-detail" data-evidence="' + escape(row.id) +
        '"><summary><span class="evidence-line"><strong class="evidence-value">' +
        (row.value === null ? "Count unavailable" : number.format(row.value)) +
        '</strong><b>' + escape(row.label) + '</b><span class="evidence-kind ' +
        escape(row.kind.toLowerCase().replaceAll(" ", "-")) + '">' + escape(row.kind) + '</span></span>' +
        '<span class="command">' + escape([rowUnit(row), scope].filter(Boolean).join(" · ")) + '</span></summary><p>' +
        escape(row.note) + '</p><p>' + source(row.source, row.locator) + ' · ' + escape(sources[row.source].type) +
        (row.related || []).map(id => ' · ' + source(id)).join('') + '</p></details>';
    }

    function renderBalances(rows) {
      if (!rows.length) return "";
      return '<h4>German aircraft movement returns</h4><p>Each line covers the whole calendar month. Opening and closing figures are aircraft on hand. Enemy action counts inventory removals.</p>' +
        '<div class="table-frame" tabindex="0" role="region" aria-label="German aircraft movement returns"><table><thead><tr>' +
        '<th scope="col">Formation / month</th><th scope="col">Type</th>' +
        balanceColumns.map(([, label]) => '<th scope="col">' + escape(label) + '</th>').join("") +
        '<th scope="col">Source</th></tr></thead><tbody>' + rows.map(row =>
          '<tr data-balance="' + escape(row.id) + '"><th scope="row">' + escape(formatUnit(row.unit)) + '<br>' + escape(row.period) +
          '</th><td>' + escape(row.type) + '</td>' + balanceColumns.map(([key]) => '<td>' + row[key] + '</td>').join("") +
          '<td>' + source(row.source, row.locator) + '</td></tr>'
        ).join("") + '</tbody></table></div>';
    }

    function filter() {
      const include = row => row.case === selected.id && (!unit.value || unit.value === row.unit);
      shown = observations.filter(row => include(row) && (!kind.value || kind.value === row.kind));
      shownBalances = !kind.value || kind.value === "Movement returns" ? balances.filter(include) : [];
      $("evidence").innerHTML = shown.map(renderEvidence).join("");
      $("inventory").innerHTML = renderBalances(shownBalances);
      const count = shown.length + shownBalances.length;
      $("evidence-status").textContent = count ? number.format(count) + (count === 1 ? " source record" : " source records") : "No records for this filter.";
      csv.disabled = !count;
    }

    function syncUrl(push) {
      const url = fieldUrl(selected, filters());
      if (url !== location.search + location.hash) history[push ? "pushState" : "replaceState"](null, "", url);
    }

    function select(item, push = false, reveal = false) {
      selected = item;
      const oldUnit = unit.value;
      unit.innerHTML = '<option value="">All formations</option>' + item.units.map(id =>
        '<option value="' + escape(id) + '">' + escape(formatUnit(id)) + '</option>').join("");
      unit.value = item.units.includes(oldUnit) ? oldUnit : "";
      if (phase.value && phase.value !== item.phase) phase.value = "";
      if (push) syncUrl(true);
      choices.forEach((choice, index) => {
        const candidate = cases[index];
        choice.hidden = !!phase.value && phase.value !== candidate.phase;
        if (candidate === item) choice.setAttribute("aria-current", "true");
        else choice.removeAttribute("aria-current");
      });
      updateMap?.(item, phase.value);
      $("case-context").textContent = interval(item.start, item.end) + " · " + item.phase + " · " + item.point;
      $("case-title").textContent = item.title;
      $("case-summary").textContent = item.summary;
      $("case-limit").textContent = item.limit;
      $("case-sources").innerHTML = [source(item.source, item.locator), ...(item.related || []).map(id => source(id))]
        .map(value => '<span>' + value + '</span>').join("");
      $("case-units").innerHTML = item.units.map(id => '<a href="#unit-' + escape(id) + '" data-unit-link="' +
        escape(id) + '">' + escape(formatUnit(id)) + '</a>').join("");
      filter();
      if (reveal) {
        $("case-title").focus({ preventScroll: true });
        $("case-detail").scrollIntoView({ block: "start" });
      }
    }

    function restore() {
      const params = new URLSearchParams(location.search);
      phase.value = params.get("phase") || "";
      kind.value = params.get("kind") || "";
      if (phase.selectedIndex < 0) phase.value = "";
      if (kind.selectedIndex < 0) kind.value = "";
      select(byCase.get(params.get("case")) || cases.find(item => !phase.value || phase.value === item.phase));
      if (selected.units.includes(params.get("unit"))) unit.value = params.get("unit");
      filter();
    }

    const unitCards = units.map(group => {
      const deployments = stations.filter(row => row.unit === group.id);
      const linkedCases = cases.filter(item => item.units.includes(group.id));
      return '<details class="record" id="unit-' + escape(group.id) + '"><summary><b>' + escape(group.name) +
        '</b><span class="command">' + escape(group.side) + ' · ' + escape(group.parent) +
        '</span></summary><div class="details"><p>' + escape(group.role) + '</p><p>' +
        source(group.source, group.locator) + '</p>' + (deployments.length ? '<ul>' + deployments.map(row =>
          '<li>' + escape(interval(row.date, row.end)) + ' · <strong>' + escape(row.place) + '</strong> · ' +
          source(row.source, row.locator) + '</li>').join("") + '</ul>' : "") +
        '<div class="intro-links">' + linkedCases.map(item => chooseLink(item, item.title)).join("") + '</div></div></details>';
    });
    $("unit-list").innerHTML = unitCards.join("");
    $("source-register").innerHTML = '<details class="record"><summary>Campaign source register</summary><div class="details"><ul>' +
      Object.keys(sources).map(id => '<li>' + source(id) + ' · ' + escape(sources[id].type) + '</li>').join("") +
      '</ul></div></details>';

    choices.forEach((choice, index) => choice.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(cases[index], true, true);
    }));
    phase.addEventListener("change", () => select(!phase.value || selected.phase === phase.value
      ? selected : cases.find(item => item.phase === phase.value), true));
    for (const control of [unit, kind]) control.addEventListener("change", () => { filter(); syncUrl(false); });
    document.querySelector("main").addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const unitLink = event.target.closest("[data-unit-link]");
      if (unitLink) {
        event.preventDefault();
        const card = $("unit-" + unitLink.dataset.unitLink);
        card.open = true;
        card.querySelector("summary").focus();
      }
      const caseLink = event.target.closest("[data-case-link]");
      if (caseLink) {
        event.preventDefault();
        unit.value = "";
        kind.value = "";
        select(byCase.get(caseLink.dataset.caseLink), true, true);
      }
    });

    csv.addEventListener("click", () => {
      const headers = ["id", "case", "date_start", "date_end", "reporter_or_formation", "evidence", "measure",
        "value", "unit", "source", "source_url", "locator", "scope", "related_source_urls"];
      const observationRows = shown.map(row => [
        row.id, selected.title, row.date, row.end, rowUnit(row), row.kind, row.label, row.value,
        row.measure, sources[row.source].title, sources[row.source].url, row.locator,
        [row.datePrecision, row.note].filter(Boolean).join(" · "), (row.related || []).map(id => sources[id].url).join(" | ")
      ]);
      const movementRows = shownBalances.flatMap(row => balanceColumns.map(([key, label]) => [
        row.id, selected.title, row.period, row.period, formatUnit(row.unit), "Movement returns", label,
        row[key], "aircraft", sources[row.source].title, sources[row.source].url, row.locator,
        row.type + " · whole calendar month", ""
      ]));
      download([headers, ...observationRows, ...movementRows], "bagration-" + selected.id + ".csv");
    });
    window.addEventListener("popstate", restore);
    $("case-detail").hidden = false;
    $("load-status").hidden = true;
    restore();
  }

  fetch("./research/transcriptions/bagration-air-campaign-1944.json?v=9.6.0")
    .then(response => {
      if (!response.ok) throw new Error("Campaign evidence unavailable.");
      return response.json();
    })
    .then(start)
    .catch(error => {
      console.error(error);
      $("load-status").textContent = "The explorer could not load. Use the JSON download under Sources and downloads.";
    });
})();
