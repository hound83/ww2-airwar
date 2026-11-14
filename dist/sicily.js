(() => {
  "use strict";

  const get = id => document.getElementById(id);
  const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const calendar = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
  const numbers = new Intl.NumberFormat("en-GB");
  const dateLabel = date => calendar.format(new Date(date + "T00:00:00Z"));
  const dateRange = item => dateLabel(item.date) + (item.end ? " – " + dateLabel(item.end) : "");
  const option = (value, label) => '<option value="' + escape(value) + '">' + escape(label) + '</option>';
  const anchor = (href, title) => '<a href="' + escape(href) + '">' + escape(title) + '</a>';

  function createMap(sites, cover) {
    if (!window.L) return;
    get("map-panel").hidden = false;
    const map = L.map("campaign-map", { scrollWheelZoom: false, minZoom: 4, maxZoom: 12 });
    map.setView([37, 14], 6);
    const overlay = L.layerGroup().addTo(map);
    if (window.topojson) {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json")
        .then(response => response.ok ? response.json() : null)
        .then(world => {
          if (!world) return;
          L.geoJSON(topojson.feature(world, world.objects.land), {
            interactive: false,
            style: { color: "#788c79", weight: 1, fillColor: "#eee5c9", fillOpacity: 1 }
          }).addTo(map).bringToBack();
          map.attributionControl.addAttribution("Natural Earth / world-atlas");
        })
        .catch(() => {});
    }

    let markers = [];
    function spreadMarkers() {
      const placed = [];
      const offsets = [[0, 0], [34, 0], [-34, 0], [0, 34], [0, -34], [34, 34], [-34, -34]];
      for (const { marker, point, leader } of markers) {
        const pixel = map.latLngToLayerPoint(point);
        const target = offsets.map(offset => pixel.add(offset))
          .find(candidate => placed.every(other => candidate.distanceTo(other) >= 32)) || pixel;
        placed.push(target);
        const displaced = map.layerPointToLatLng(target);
        marker.setLatLng(displaced);
        leader.setLatLngs(target.equals(pixel) ? [] : [point, displaced]);
      }
    }
    map.on("zoomend", spreadMarkers);

    return (visible, selected, chapter, caseLink, refit) => {
      overlay.clearLayers();
      const grouped = new Map();
      for (const item of visible) {
        if (!grouped.has(item.site)) grouped.set(item.site, []);
        grouped.get(item.site).push(item);
      }
      const isLanding = chapter === "land" && visible.some(item => item.id === "landing-cover");
      if (isLanding) {
        for (const id of ["malta", "gozo", "pantelleria", "licata-beach", "scoglitti"]) {
          if (!grouped.has(id)) grouped.set(id, []);
        }
      }
      markers = [...grouped].map(([id, items]) => {
        const site = sites.get(id);
        const point = L.latLng(site.lat, site.lng);
        const active = items.includes(selected);
        const marker = L.marker(point, {
          title: site.name,
          icon: L.divIcon({
            className: "sicily-pin" + (active ? " active" : "") + (items.length ? "" : " reference"),
            html: items.length ? String(items.length) : "•", iconSize: [28, 28]
          })
        }).addTo(overlay);
        marker.getElement().setAttribute("aria-label", site.name);
        marker.bindPopup('<strong>' + escape(site.name) + '</strong><p>' + escape(site.precision) + '</p>' +
          items.map(item => caseLink(item, item.title)).join(""));
        const leader = L.polyline([], { color: "#4d635c", weight: 1, interactive: false }).addTo(overlay);
        return { marker, point, leader };
      });
      if (isLanding) {
        for (const [from, to, label] of cover) {
          const points = [from, to].map(id => { const s = sites.get(id); return [s.lat, s.lng]; });
          L.polyline(points, { color: "#185869", weight: 2, dashArray: "5 6" })
            .addTo(overlay).bindTooltip(escape(label));
        }
      }
      if (markers.length && refit) {
        map.fitBounds(markers.map(item => item.point), { padding: [30, 30], maxZoom: 9, animate: false });
      }
      spreadMarkers();
      get("map-note").textContent = isLanding
        ? "Dashed lines link bases to planned cover sectors. Pins mark reference locations, including all three western assault sectors."
        : "Select a location to see its dated cases. Some pins represent a wider area rather than an exact event position.";
    };
  }

  function start(data) {
    const sites = new Map(data.sites.map(item => [item.id, item]));
    const cases = new Map(data.cases.map(item => [item.id, item]));
    const formations = new Map(data.formations.map(item => [item.id, item]));
    const chapters = new Map(data.phases.map(item => [item.id, item]));
    const chapter = get("chapter");
    const formation = get("formation");
    const updateMap = createMap(sites, data.cover);
    let selected;

    const caseUrl = (item, unit = "") => "?" + new URLSearchParams({ case: item.id, ...(unit ? { formation: unit } : {}) }) + "#campaign";
    const caseLink = (item, label) => '<a href="' + escape(caseUrl(item, formation.value)) +
      '" data-case="' + escape(item.id) + '">' + escape(label) + '</a>';
    const source = id => anchor(data.sources[id][1], data.sources[id][0]);

    function record(row) {
      const figures = Object.entries(row.figures);
      return '<div class="source-record"><h4>' + escape(row.title) + '</h4>' +
        (figures.length ? '<dl class="metrics">' + figures.map(([label, value]) =>
          '<div><dt>' + escape(label) + '</dt><dd>' + numbers.format(value) + '</dd></div>').join("") + '</dl>' : "") +
        '<p>' + escape(row.note) + '</p><p>' + source(row.source) + ' · ' + escape(row.locator) + '</p></div>';
    }

    function render(preferred, { updateUrl = false, reveal = false, refit = true } = {}) {
      const visible = data.cases.filter(item => item.phase === chapter.value &&
        (!formation.value || item.formations.includes(formation.value)));
      selected = visible.includes(preferred) ? preferred : visible[0];
      get("chapter-summary").textContent = chapters.get(chapter.value).summary;
      get("case-count").textContent = visible.length
        ? visible.length + (visible.length === 1 ? " dated case" : " dated cases")
        : "No cases for this formation in this chapter. Choose another chapter or formation.";
      get("case-list").innerHTML = visible.map(item =>
        '<a class="case-link" href="' + escape(caseUrl(item, formation.value)) + '" data-case="' + escape(item.id) + '"' +
        (item === selected ? ' aria-current="true"' : "") + '><time datetime="' + item.date + '">' +
        escape(dateRange(item)) + '</time><strong>' + escape(item.title) + '</strong></a>').join("");
      updateMap?.(visible, selected, chapter.value, caseLink, refit);
      get("case-detail").hidden = !selected;
      if (!selected) {
        if (updateUrl) history.pushState(null, "", "?" + new URLSearchParams({
          chapter: chapter.value, formation: formation.value
        }) + "#campaign");
        return;
      }
      if (updateUrl) history.pushState(null, "", caseUrl(selected, formation.value));
      const site = sites.get(selected.site);
      get("case-context").textContent = dateRange(selected) + " · " + site.name;
      get("case-title").textContent = selected.title;
      get("case-summary").textContent = selected.summary;
      get("case-formations").innerHTML = selected.formations.map(id =>
        '<a href="#formation-' + id + '" data-formation="' + id + '">' + escape(formations.get(id).name) + '</a>').join("");
      const historyRows = data.stations.filter(row => row.site === selected.site);
      get("station-history").innerHTML = historyRows.length ? '<h4>Airfield history</h4><ol>' +
        historyRows.map(row => '<li><time datetime="' + row.date + '">' + dateLabel(row.date) + '</time> · ' +
          (row.caseId === selected.id ? escape(row.status) : caseLink(cases.get(row.caseId), row.status)) + '</li>').join("") + '</ol>' : "";
      get("case-evidence").innerHTML = selected.evidence.map(record).join("");
      if (reveal) {
        get("case-title").focus({ preventScroll: true });
        get("case-detail").scrollIntoView({ block: "start" });
      }
    }

    function restore() {
      const params = new URLSearchParams(location.search);
      const item = cases.get(params.get("case"));
      const namedChapter = chapters.has(params.get("chapter"));
      const preferred = item || (!namedChapter ? cases.get(data.initial) : undefined);
      const unit = params.get("formation");
      chapter.value = preferred?.phase || params.get("chapter");
      formation.value = formations.has(unit) ? unit : "";
      render(preferred);
    }

    chapter.innerHTML = data.phases.map(item => option(item.id, item.title)).join("");
    formation.innerHTML = option("", "All formations") + data.formations.map(item => option(item.id, item.name)).join("");
    get("formation-list").innerHTML = data.formations.map(unit =>
      '<details class="record" id="formation-' + unit.id + '"><summary><strong>' + escape(unit.name) +
      '</strong><span class="command">' + escape(unit.role) + '</span></summary><div class="details"><p>' +
      escape(unit.summary) + '</p><ul>' + data.cases.filter(item => item.formations.includes(unit.id)).map(item =>
        '<li>' + escape(dateRange(item)) + ' · <a href="' + escape(caseUrl(item, unit.id)) +
        '" data-case="' + item.id + '" data-set-formation="' + unit.id + '">' + escape(item.title) + '</a></li>').join("") +
      '</ul></div></details>').join("");
    get("source-register").innerHTML = record(data.totals) +
      '<details class="record"><summary>Campaign source register</summary><ul>' +
      Object.keys(data.sources).map(id => '<li>' + source(id) + '</li>').join("") + '</ul></details>';

    document.querySelector("main").addEventListener("click", event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest("[data-case], [data-formation]");
      if (!link) return;
      event.preventDefault();
      if (link.dataset.formation) {
        const card = get("formation-" + link.dataset.formation);
        card.open = true;
        card.querySelector("summary").focus();
        return;
      }
      const next = cases.get(link.dataset.case);
      const changedChapter = chapter.value !== next.phase;
      chapter.value = next.phase;
      if (link.dataset.setFormation) formation.value = link.dataset.setFormation;
      if (formation.value && !next.formations.includes(formation.value)) formation.value = "";
      render(next, { updateUrl: true, reveal: true, refit: changedChapter });
    });
    chapter.addEventListener("change", () => render(selected, { updateUrl: true }));
    formation.addEventListener("change", () => render(selected, { updateUrl: true }));
    window.addEventListener("popstate", restore);
    document.querySelector(".campaign-controls").hidden = false;
    get("formations").hidden = false;
    get("load-status").hidden = true;
    restore();
  }

  fetch("./research/transcriptions/sicily-air-campaign-1943.json?v=9.9")
    .then(response => {
      if (!response.ok) throw new Error("Campaign records unavailable.");
      return response.json();
    })
    .then(start)
    .catch(error => {
      console.error(error);
      get("load-status").hidden = false;
      get("load-status").textContent = "Campaign records could not load. Try reloading, or use the JSON download under Sources and download.";
    });
})();
