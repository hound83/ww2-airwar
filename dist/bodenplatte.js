(() => {
  "use strict";

  const ledgerUrl = "./research/transcriptions/bodenplatte-1945-01-01.json";
  const $ = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const fieldUrl = id => "?airfield=" + encodeURIComponent(id) + "#airfields";
  const sideNames = ["Allied", "German"];

  function category(row) {
    if (row.quality === "claim") return "claims";
    if (row.metric.startsWith("Personnel")) return "personnel";
    if (["Participating", "Present"].includes(row.metric)) return "strength";
    return "outcomes";
  }

  function displayValue(row) {
    if (row.value === null) return "Count unavailable";
    if (Array.isArray(row.value)) return row.value.join("–");
    if (row.quality === "lower bound") return "At least " + row.value;
    if (row.quality === "approximate") return "About " + row.value;
    return String(row.value);
  }

  function sourceLink(source, locator = "") {
    return '<a href="' + escape(source.url) + '" target="_blank" rel="noopener">' +
      escape(source.title) + '</a>' + (locator ? " · " + escape(locator) : "");
  }

  function renderRows(rows, sources, headingLevel) {
    return sideNames.map(side => {
      const records = rows.filter(row => row.side === side);
      if (!records.length) return "";
      const contents = records.map(row => {
        const source = sources[row.source];
        return '<details class="record loss-row" data-observation="' + escape(row.id) +
          '"><summary><span class="loss-summary"><strong class="loss-value">' +
          escape(displayValue(row)) + '</strong><b>' + escape(row.metric) +
          '</b><span>' + escape(row.aircraft) + '</span><span>' + escape(row.population) +
          '</span><span class="muted">' + escape(row.setting) + '</span></span></summary><p>' +
          escape(row.note) + (row.serial ? ' <strong>' + escape(row.serial) + '</strong>' : "") +
          '</p><p>' + sourceLink(source, row.locator) + ' · ' + escape(source.type) +
          ' · ' + escape(row.quality) + '</p>' + (row.relatedSources || []).map(reference =>
            '<p>' + sourceLink(sources[reference.source], reference.locator) + '</p>').join("") +
          '</details>';
      }).join("");
      return '<div class="loss-group"><' + headingLevel + '>' + side + ' records</' +
        headingLevel + '>' + contents + '</div>';
    }).join("");
  }

  function saveCsv(date, field, rows, sources) {
    const headers = ["date", "airfield", "id", "side", "population", "aircraft", "metric",
      "value_min", "value_max", "setting", "quality", "serial", "source", "source_url", "locator", "note"];
    const lines = rows.map(row => {
      const [min, max] = Array.isArray(row.value) ? row.value : [row.value, row.value];
      const source = sources[row.source];
      return [date, field.name, row.id, row.side, row.population, row.aircraft, row.metric,
        min, max, row.setting, row.quality, row.serial, source.title, source.url, row.locator, row.note];
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
    const map = L.map(host, { scrollWheelZoom: false, minZoom: 5, maxZoom: 10 });
    const landPane = map.createPane("airfield-land");
    landPane.style.zIndex = 350;
    L.control.attribution({ prefix: false }).addTo(map);
    map.attributionControl.addAttribution("Natural Earth / world-atlas");
    map.fitBounds(fields.map(field => [field.lat, field.lng]), {
      paddingTopLeft: [30, 30], paddingBottomRight: [30, 46], maxZoom: 7
    });
    const markers = fields.map((field, index) => {
      const icon = L.divIcon({ className: "field-marker", html: String(index + 1), iconSize: [32, 32] });
      const marker = L.marker([field.lat, field.lng], { icon, title: field.name }).addTo(map);
      marker.getElement().setAttribute("aria-label", field.name);
      marker.bindTooltip(escape(field.name), { direction: "top" });
      marker.on("click", () => select(field, true));
      return marker;
    });
    // Keep the two Brussels airfields individually reachable at regional zoom.
    const brussels = fields.filter(field => ["evere", "melsbroek"].includes(field.id));
    const leaders = brussels.map(() => L.polyline([], {
      color: "#475951", weight: 1, interactive: false
    }).addTo(map));
    function separateBrusselsMarkers() {
      const points = brussels.map(field => map.latLngToLayerPoint([field.lat, field.lng]));
      const separate = points[0].distanceTo(points[1]) < 42;
      brussels.forEach((field, index) => {
        const target = [field.lat, field.lng];
        const offset = index === 0 ? [-24, -10] : [0, 27];
        const position = separate ? map.layerPointToLatLng(points[index].add(offset)) : target;
        markers[fields.indexOf(field)].setLatLng(position);
        leaders[index].setLatLngs(separate ? [target, position] : []);
      });
    }
    map.on("zoomend", separateBrusselsMarkers);
    separateBrusselsMarkers();
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
    return field => markers.forEach((marker, index) => {
      const selected = fields[index] === field;
      const element = marker.getElement();
      element.classList.toggle("selected", selected);
      element.setAttribute("aria-pressed", String(selected));
      marker.setZIndexOffset(selected ? 1000 : 0);
    });
  }

  function start({ date, fields, sources, observations }) {
    const list = $("field-list");
    const side = $("side");
    const evidence = $("evidence");
    const csv = $("field-csv");
    const fieldFromUrl = () => fields.find(field =>
      field.id === new URLSearchParams(location.search).get("airfield")) || fields[0];
    let selected;
    let visibleRows;
    list.innerHTML = fields.map((field, index) =>
      '<a class="field-choice" href="' + fieldUrl(field.id) + '" data-airfield="' + field.id +
      '"><span>' + (index + 1) + '. ' + escape(field.name) + '</span><small>' +
      escape(field.code) + '</small></a>').join("");
    const markers = initMap(fields, select);
    const links = [...list.querySelectorAll("[data-airfield]")];

    function filter() {
      visibleRows = observations.filter(row => row.place === selected.id &&
        (!side.value || side.value === row.side) && (!evidence.value || evidence.value === category(row)));
      $("field-rows").innerHTML = renderRows(visibleRows, sources, "h4");
      $("field-status").textContent = visibleRows.length
        ? visibleRows.length + (visibleRows.length === 1 ? " source record" : " source records")
        : "No source records for this filter.";
      csv.disabled = !visibleRows.length;
    }

    function select(field, updateUrl) {
      selected = field;
      if (updateUrl && fieldFromUrl() !== field) history.pushState(null, "", fieldUrl(field.id));
      links.forEach(link => {
        if (link.dataset.airfield === field.id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      markers?.(field);
      $("field-code").textContent = field.code + " · " + field.country;
      $("field-name").textContent = field.name;
      $("field-story").textContent = field.story;
      $("field-allied").textContent = field.allied;
      $("field-german").textContent = field.german;
      $("field-gap").textContent = field.gap;
      $("field-sources").innerHTML = field.sources.map(id => sourceLink(sources[id])).join("");
      filter();
    }

    links.forEach((link, index) => link.addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      select(fields[index], true);
    }));
    side.addEventListener("change", filter);
    evidence.addEventListener("change", filter);
    csv.addEventListener("click", () => saveCsv(date, selected, visibleRows, sources));
    window.addEventListener("popstate", () => select(fieldFromUrl(), false));
    $("operation-rows").innerHTML = renderRows(observations.filter(row => row.place === "operation"), sources, "h3");
    select(fieldFromUrl(), false);
    $("field-detail").hidden = false;
    $("field-error").hidden = true;
  }

  fetch(ledgerUrl)
    .then(response => {
      if (!response.ok) throw new Error("Ledger unavailable.");
      return response.json();
    })
    .then(start)
    .catch(() => {
      $("field-error").textContent = "The interactive ledger could not load. Use the full JSON download above.";
    });
})();
