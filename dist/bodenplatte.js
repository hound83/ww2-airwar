(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const fieldUrl = (id, filters = {}) => "?" + new URLSearchParams({ airfield: id, ...filters }) + "#airfields";
  const prettyDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
  const formatDate = date => prettyDate.format(new Date(date + "T00:00:00Z"));

  function displayValue(row) {
    if (row.value === null) return "Count unavailable";
    if (Array.isArray(row.value)) return row.quality === "wave counts" ? row.value.join(" / ") : row.value.join("–");
    const prefix = { "lower bound": "At least ", "at least": "At least ", "more than": "More than ", approximate: "About " };
    return (prefix[row.quality] || "") + row.value;
  }

  function sourceLink({ title, url, locator = "" }) {
    return '<a href="' + escape(url) + '" target="_blank" rel="noopener">' +
      escape(title) + "</a>" + (locator ? " · " + escape(locator) : "");
  }

  function renderRows(rows, headingLevel) {
    return ["Allied", "German"].map(side => {
      const records = rows.filter(row => row.side === side);
      if (!records.length) return "";
      return '<div class="loss-group"><' + headingLevel + '>' + side + ' records</' +
        headingLevel + '>' + records.map(renderRecord).join("") + '</div>';
    }).join("");
  }

  function renderRecord(row) {
    const heading = row.serial && row.category === "airframes" ? row.serial : displayValue(row);
    return '<details class="record loss-row" data-observation="' + escape(row.id) +
      '"><summary><span class="loss-summary"><strong class="loss-value">' + escape(heading) +
      '</strong><b>' + escape(row.metric) + '</b><span>' + escape(row.aircraft) +
      '</span><span>' + escape(row.population) + '</span><span class="muted">' + escape(row.setting) +
      '</span></span></summary><p>' + escape(formatDate(row.date)) + ' · ' + escape(row.quality) +
      '</p><p>' + escape(row.note) +
      (row.serial && row.category !== "airframes" ? ' <strong>' + escape(row.serial) + '</strong>' : "") +
      '</p>' + row.sources.map(source => '<p>' + sourceLink(source) +
        (source.type ? ' · ' + escape(source.type) : '') + '</p>').join("") + '</details>';
  }

  function saveCsv(field, rows) {
    const headers = ["date", "airfield", "id", "side", "population", "aircraft", "metric", "value_min",
      "value_max", "setting", "quality", "serial", "source", "source_url", "locator", "note", "category",
      "additional_sources", "additional_source_urls", "additional_locators", "reported_values"];
    const lines = rows.map(row => {
      const values = Array.isArray(row.value) ? row.value : null;
      const [min, max] = row.quality === "wave counts" ? [null, null] : values || [row.value, row.value];
      const [source, ...related] = row.sources;
      return [row.date, field.name, row.id, row.side, row.population, row.aircraft, row.metric, min, max, row.setting,
        row.quality, row.serial, source.title, source.url, source.locator, row.note, row.category,
        related.map(ref => ref.title).join(" | "), related.map(ref => ref.url).join(" | "),
        related.map(ref => ref.locator || "").join(" | "), values?.join(" | ")];
    });
    const csv = [headers, ...lines].map(line => line.map(value =>
      '"' + String(value ?? "").replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "bodenplatte-" + field.id + ".csv";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function initMap(fields, select) {
    if (!window.L) return;
    const host = $("field-map");
    host.hidden = false;
    $("map-key").hidden = false;
    const map = L.map(host, { scrollWheelZoom: false, minZoom: 4, maxZoom: 10, attributionControl: false });
    const landPane = map.createPane("airfield-land");
    landPane.style.zIndex = 350;
    L.control.attribution({ prefix: false }).addTo(map);
    map.attributionControl.addAttribution("Natural Earth / world-atlas");
    const points = fields.map(field => L.latLng(field.lat, field.lng));
    map.fitBounds(points, { paddingTopLeft: [32, 38], paddingBottomRight: [32, 36], maxZoom: 7 });

    const entries = fields.map((field, index) => {
      const icon = L.divIcon({
        className: "field-marker " + field.outcome, html: String(index + 1), iconSize: [28, 28]
      });
      const marker = L.marker(points[index], { icon, title: field.name });
      marker.on("add", () => {
        const element = marker.getElement();
        element.setAttribute("aria-label", field.name);
        element.setAttribute("aria-pressed", String(element.classList.contains("selected")));
      });
      marker.bindTooltip(escape(field.name) + " · " + escape(field.status), { direction: "top" });
      marker.on("click", () => select(field, true));
      const leader = L.polyline([], { color: "#475951", weight: 1, interactive: false });
      return { field, marker, leader, target: points[index] };
    });

    // Offset overlapping pins and draw their leaders back to the airfield positions.
    function separateMarkers() {
      const placed = [];
      const offsets = [[0, 0]];
      for (const radius of [34, 56, 78, 100, 122]) {
        for (let i = 0; i < 8; i++) offsets.push([radius * Math.sin(i * Math.PI / 4), radius * Math.cos(i * Math.PI / 4)]);
      }
      for (const { marker, leader, target } of entries) {
        if (!map.hasLayer(marker)) continue;
        const point = map.latLngToLayerPoint(target);
        const candidates = offsets.map(offset => point.add(offset));
        const position = candidates.find(candidate => placed.every(other => candidate.distanceTo(other) >= 32)) || point;
        placed.push(position);
        const adjusted = map.layerPointToLatLng(position);
        marker.setLatLng(adjusted);
        leader.setLatLngs(position === candidates[0] ? [] : [target, adjusted]);
      }
    }

    map.on("zoomend", separateMarkers);
    if (window.topojson) {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json")
        .then(response => {
          if (!response.ok) throw new Error("Land outline unavailable.");
          return response.json();
        })
        .then(world => {
          const geography = topojson.feature(world, world.objects.land);
          L.geoJSON(geography, { pane: "airfield-land", interactive: false,
            style: { color: "#78846f", weight: 1, fillColor: "#f0e9d5", fillOpacity: 1 } }).addTo(map);
        })
        .catch(() => map.attributionControl.removeAttribution("Natural Earth / world-atlas"));
    }
    return (selected, outcome) => {
      entries.forEach(({ field, marker, leader }) => {
        const visible = !outcome || field.outcome === outcome;
        if (visible) {
          marker.addTo(map);
          leader.addTo(map);
          const active = field === selected;
          const element = marker.getElement();
          element.classList.toggle("selected", active);
          element.setAttribute("aria-pressed", String(active));
          marker.setZIndexOffset(active ? 1000 : 0);
        } else {
          marker.remove();
          leader.remove();
        }
      });
      separateMarkers();
      if (selected) {
        const activeMarker = entries.find(entry => entry.field === selected).marker;
        const bounds = map.getBounds().pad(-0.05);
        if (map.hasLayer(activeMarker) && !bounds.contains(activeMarker.getLatLng())) map.panTo(activeMarker.getLatLng(), { animate: false });
      }
    };
  }

  function renderTimeline(timeline, fields) {
    return '<ol class="chronology panel">' + timeline.map(event => {
      const field = fields.find(candidate => candidate.id === event.place);
      const destination = field
        ? '<a href="' + fieldUrl(field.id) + '" data-site-link="' + field.id + '">' + escape(field.name) + '</a>'
        : event.phase === "raid" ? '<a href="#airfields">Explore the raid map</a>' : "";
      return '<li id="event-' + escape(event.id) + '"><time datetime="' + event.date + '">' +
        escape(formatDate(event.date)) + '</time><div><strong>' + escape(event.phase) +
        '</strong><p>' + escape(event.text) + '</p><p class="links">' + destination +
        event.sources.map(sourceLink).join("") + '</p>' +
        (event.records.length ? renderRows(event.records, "h4") : "") + '</div></li>';
    }).join("") + '</ol>';
  }

  function renderFormations(formations) {
    return '<details class="record"><summary>View ' + formations.rows.length + ' listed formations</summary><div class="details">' +
      '<p>' + escape(formations.scope) + '</p><p>' + formations.sources.map(sourceLink).join("") + '</p>' +
      '<div class="table-frame" tabindex="0" role="region" aria-label="German formation table"><table><thead><tr>' +
      '<th scope="col">Formation</th><th scope="col">Aircraft</th><th scope="col">Base as listed</th><th scope="col">Linked raid sectors</th>' +
      '</tr></thead><tbody>' + formations.rows.map(row =>
        '<tr><th scope="row">' + escape(row.formation) + '</th><td>' + escape(row.aircraft) + '</td><td>' +
        escape(row.baseAsListed) + '</td><td><div class="formation-sites">' + (row.sites.length
          ? row.sites.map(field => '<a href="' + fieldUrl(field.id) + '" data-site-link="' + field.id + '">' +
            escape(field.name) + '</a>').join("") : '—') + '</div></td></tr>'
      ).join("") + '</tbody></table></div></div></details>';
  }

  function renderHighlights(field, records, findings, archive, personnel) {
    const byId = id => records.find(row => row.id === id);
    const pair = (title, destroyed, damaged) =>
      '<div><strong>' + byId(destroyed).value + ' destroyed · ' + byId(damaged).value +
      ' damaged</strong>' + escape(title) + '<p>' + sourceLink(byId(destroyed).sources[0]) + '</p></div>';
    const comparison = field.id === "sinttruiden" ? '<div class="comparison">' +
      pair("XXIX Tactical Air Command annex", "a92-allied-destroyed", "a92-allied-damaged") +
      pair("A-92 tactical excerpt", "trond-destroyed", "trond-damaged") + '</div>' : "";
    const ghent = field.id === "ghent" ? '<p><strong>' + byId("gh-ground-d").value + ' destroyed and ' +
      byId("gh-ground-dmg").value + ' damaged on the ground, ' + byId("gh-air-d").value +
      ' lost in air combat</strong> · ' + sourceLink(byId("gh-ground-d").sources[0]) + '</p>' : "";
    const airframe = field.id === "melsbroek" ? '<p><button type="button" data-airframe-query="NS746">Find NS746</button> ' +
      'The aircraft register records damage on 1 January and a later change in status.</p>' : "";
    const notes = findings.filter(row => row.site === field.id).map(row =>
      '<p>' + escape(row.summary) + ' ' + row.sources.map(sourceLink).join(" · ") + '</p>').join("");
    const casualties = personnel.filter(row => row.site === field.id).map(row =>
      '<p><strong>' + escape(row.rank + " " + row.name) + '</strong> · ' + escape(row.unit) + ' · ' +
      escape(row.outcome) + ' · ' + row.sources.map(sourceLink).join(" · ") + '</p>').join("");
    const holdings = archive.filter(row => row.site === field.id);
    return comparison + ghent + airframe + notes + casualties + renderArchive(holdings);
  }

  function renderArchive(holdings) {
    return holdings.length ? '<details class="record supporting-sources"><summary>Archive references</summary><div class="details">' +
      holdings.map(row => '<p><strong>' + escape(row.reference) + '</strong> · ' +
        sourceLink(row) + ' · ' + escape(row.institution) + '. ' + escape(row.access) + '</p>').join("") +
      '</div></details>' : "";
  }

  function start({ date, fields, timeline, formations, records, airframes, findings, archive, personnel }) {
    const list = $("field-list");
    const controls = { outcome: $("raid-outcome"), side: $("side"), evidence: $("evidence"), q: $("unit-query") };
    const csv = $("field-csv");
    const filters = () => Object.fromEntries(Object.entries(controls).filter(([, control]) => control.value)
      .map(([key, control]) => [key, control.value]));
    let selected;
    let visibleRows;
    let visibleAirframes;
    list.innerHTML = fields.map((field, index) =>
      '<a class="field-choice" href="' + fieldUrl(field.id) + '" data-airfield="' + field.id +
      '"><span class="choice-name">' + (index + 1) + '. ' + escape(field.name) + '</span><small>' +
      escape(field.code) + '</small></a>').join("");
    const links = [...list.querySelectorAll("[data-airfield]")];
    const updateMarkers = initMap(fields, select);

    function filter() {
      const { side, evidence, q } = filters();
      const words = (q || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
      const matches = row => {
        const value = [row.population, row.aircraft, row.serial, row.note].join(" ").toLowerCase();
        return (!side || side === row.side) && words.every(word => value.includes(word));
      };
      visibleRows = records.filter(row => row.date === date && row.place === selected.id &&
        (!evidence || evidence === row.category) && matches(row));
      visibleAirframes = !evidence || evidence === "airframes" ? airframes.filter(row =>
        row.places.includes(selected.id) && matches(row)) : [];
      const named = visibleAirframes.length;
      $("field-rows").innerHTML = renderRows(visibleRows, "h4") + (named
        ? '<details class="record" id="airframe-results"' + (evidence === "airframes" || words.length ? ' open' : '') +
          '><summary>Named aircraft (' + named + ')</summary><div class="details">' +
          '<p class="muted">These records include aircraft tied to the wider assignment or route. Open each entry for its recorded location and relationship.</p>' +
          renderRows(visibleAirframes, "h4") + '</div></details>' : "");
      $("field-status").textContent = visibleRows.length || named
        ? [visibleRows.length && visibleRows.length + (visibleRows.length === 1 ? " source record" : " source records"),
          named && named + (named === 1 ? " named aircraft entry" : " named aircraft entries")].filter(Boolean).join(" · ")
        : "No source records for this filter.";
      csv.disabled = !visibleRows.length && !named;
    }

    function writeUrl(push) {
      const url = fieldUrl(selected.id, filters());
      if (url !== location.search + location.hash) history[push ? "pushState" : "replaceState"](null, "", url);
    }

    function select(field, pushUrl) {
      selected = field;
      if (pushUrl) writeUrl(true);
      links.forEach((link, index) => {
        const candidate = fields[index];
        link.hidden = !!controls.outcome.value && candidate.outcome !== controls.outcome.value;
        link.href = fieldUrl(candidate.id, filters());
        if (candidate === field) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      updateMarkers?.(field, controls.outcome.value);
      $("field-code").textContent = field.code + " · " + field.country + " · " + field.status;
      $("field-name").textContent = field.name;
      $("field-story").textContent = field.story || "";
      $("field-story").hidden = !field.story;
      $("field-allied").textContent = field.allied;
      $("field-german").textContent = field.german;
      $("field-gap").textContent = field.gap;
      $("field-highlights").innerHTML = renderHighlights(field, records, findings, archive, personnel);
      const position = field.positionSources.map(sourceLink).join(" · ");
      $("field-sources").innerHTML = '<p>' + escape(field.positionNote || "Approximate wartime field position.") +
        ' ' + position + '</p>' + field.sources.map(source => '<p>' + sourceLink(source) + '</p>').join("");
      filter();
    }

    function restore() {
      const params = new URLSearchParams(location.search);
      for (const [key, control] of Object.entries(controls)) {
        const value = params.get(key) || "";
        control.value = control.options && ![...control.options].some(option => option.value === value) ? "" : value;
      }
      select(fields.find(field => field.id === params.get("airfield")) || fields[0], false);
    }

    links.forEach((link, index) => link.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(fields[index], true);
      revealSelected();
    }));

    function revealSelected() {
      $("field-name").focus({ preventScroll: true });
      $("field-detail").scrollIntoView({ block: "start" });
    }

    controls.outcome.addEventListener("change", () => {
      const outcome = controls.outcome.value;
      const field = outcome && selected.outcome !== outcome ? fields.find(row => row.outcome === outcome) : selected;
      select(field, true);
    });
    for (const control of [controls.side, controls.evidence, controls.q]) {
      control.addEventListener(control === controls.q ? "input" : "change", () => {
        filter();
        writeUrl(false);
        links.forEach((link, index) => { link.href = fieldUrl(fields[index].id, filters()); });
      });
    }
    csv.addEventListener("click", () => saveCsv(selected, [...visibleRows, ...visibleAirframes]));
    window.addEventListener("popstate", restore);
    $("chronology-events").innerHTML = renderTimeline(timeline, fields);
    $("formation-list").innerHTML = renderFormations(formations);
    document.querySelector("main").addEventListener("click", event => {
      const jump = event.target.closest("[data-site-link]");
      if (jump && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
        event.preventDefault();
        Object.values(controls).forEach(control => { control.value = ""; });
        select(fields.find(field => field.id === jump.dataset.siteLink), true);
        revealSelected();
      }
      const airframe = event.target.closest("[data-airframe-query]");
      if (airframe) {
        controls.side.value = "";
        controls.evidence.value = "airframes";
        controls.q.value = airframe.dataset.airframeQuery;
        controls.q.dispatchEvent(new Event("input"));
        $("field-rows").scrollIntoView({ block: "nearest" });
      }
    });
    $("operation-rows").innerHTML = renderArchive(archive.filter(row => row.site === "operation")) +
      renderRows(records.filter(row => row.place === "operation" && row.date === date), "h3");
    $("field-detail").hidden = false;
    restore();
    $("field-error").hidden = true;
  }

  window.BodenplatteData.load().then(start).catch(error => {
    console.error(error);
    $("field-error").textContent = "The interactive ledger could not load. Use the source files under Sources and downloads.";
  });
})();
