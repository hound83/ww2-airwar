(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const fmt = new Intl.NumberFormat("en-GB");
  const dates = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
  const day = date => dates.format(new Date(date + "T00:00:00Z"));
  const interval = item => day(item.date) + (item.end ? " – " + day(item.end) : "");
  const esc = value => String(value).replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const sourceLink = source => '<a href="' + esc(source.url) + '">' + esc(source.title) + '</a>';

  function initMap(sites, choose) {
    if (!window.L) return () => {};
    $("malta-map").hidden = false;
    $("map-note").hidden = false;
    const map = L.map("malta-map", { scrollWheelZoom: false, minZoom: 4, maxZoom: 13 });
    const bounds = L.latLngBounds([30.1, 1.5], [39.2, 31.3]);
    const island = L.latLngBounds([35.793, 14.373], [35.935, 14.55]);
    const markers = L.layerGroup().addTo(map);
    let islandOnly = false;
    if (window.topojson) {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json")
        .then(response => response.ok ? response.json() : null)
        .then(world => {
          if (!world) return;
          L.geoJSON(topojson.feature(world, world.objects.land), {
            interactive: false,
            style: { color: "#7d8b76", weight: 1, fillColor: "#e9debd", fillOpacity: 1 }
          }).addTo(map).bringToBack();
          map.attributionControl.addAttribution("Natural Earth / world-atlas");
        }).catch(() => {});
    }
    $("malta-map").addEventListener("click", event => {
      const target = event.target.closest("button[data-map-case]");
      if (target) choose(target.dataset.mapCase, true);
    });
    const fit = target => map.fitBounds(target, { padding: [28, 28], maxZoom: 11, animate: false });
    const controls = L.control({ position: "topright" });
    controls.onAdd = () => {
      const button = L.DomUtil.create("button", "malta-map-view");
      button.type = "button";
      button.textContent = "Zoom to Malta";
      L.DomEvent.disableClickPropagation(button);
      button.addEventListener("click", () => {
        islandOnly = !islandOnly;
        fit(islandOnly ? island : bounds);
        button.textContent = islandOnly ? "Show Mediterranean" : "Zoom to Malta";
      });
      return button;
    };
    controls.addTo(map);
    fit(bounds);
    let visibleCases = [];
    let selectedCase;
    function drawMarkers() {
      const visible = visibleCases;
      const selected = selectedCase;
      markers.clearLayers();
      // On the regional view, one pin represents the whole island. Separate the
      // airfield markers as the reader zooms towards Malta.
      const groups = new Map();
      for (const item of visible) {
        const site = map.getZoom() < 10 && sites[item.site].area === "island" ? "island" : item.site;
        if (!groups.has(site)) groups.set(site, []);
        groups.get(site).push(item);
      }
      for (const [id, items] of groups) {
        const site = id === "island" ? { lat: 35.882, lng: 14.45, name: "Malta" } : sites[id];
        const icon = L.divIcon({
          className: "map-pin" + (items.includes(selected) ? " selected" : ""),
          html: String(items.length), iconSize: [26, 26]
        });
        const marker = L.marker([site.lat, site.lng], { icon, title: site.name }).addTo(markers);
        marker.getElement().setAttribute("aria-label", site.name + ", " + items.length + " cases");
        marker.bindPopup('<strong>' + esc(site.name) + '</strong>' + items.map(item =>
          '<button type="button" data-map-case="' + esc(item.id) + '">' + esc(item.title) + '</button>').join(""));
      }
    }
    map.on("zoomend", drawMarkers);
    return (visible, selected, refit) => {
      visibleCases = visible;
      selectedCase = selected;
      if (refit) {
        islandOnly = visible.every(item => sites[item.site].area === "island");
        fit(islandOnly ? island : bounds);
        $("malta-map").querySelector(".malta-map-view").textContent = islandOnly ? "Show Mediterranean" : "Zoom to Malta";
      }
      drawMarkers();
    };
  }

  function renderSeries(series, sources) {
    const section = $("spring-series");
    section.innerHTML = '<h2 id="spring-heading">' + esc(series.title) + '</h2>'
      + '<div class="table-wrap"><table aria-labelledby="spring-heading"><thead><tr>'
      + ['1942', 'Bomber', 'Fighter', 'Reconnaissance', 'Reported total'].map(title => '<th scope="col">' + title + '</th>').join("")
      + '</tr></thead><tbody>' + series.rows.map(([month, ...figures]) =>
        '<tr><th scope="row">' + esc(month) + '</th>' + figures.map(value => '<td>' + fmt.format(value) + '</td>').join("") + '</tr>').join("")
      + '</tbody></table></div><p class="detail-note">' + esc(series.note) + '</p>'
      + '<p class="locator">' + sourceLink(sources[series.source]) + ' · ' + esc(series.locator) + '</p>';
    section.hidden = false;
  }

  fetch("./research/transcriptions/malta-air-campaign-1940-1942.json").then(response => {
    if (!response.ok) throw new Error("Case records unavailable.");
    return response.json();
  }).then(data => {
    const filter = $("topic");
    const viewport = window.matchMedia("(max-width: 45rem)");
    const ids = new Map(data.cases.map((item, index) => [item.id, index + 1]));
    const byId = new Map(data.cases.map(item => [item.id, item]));
    let visible;
    let selected;

    function evidence(row) {
      const source = data.sources[row.source];
      const entries = Object.entries(row.metrics);
      return '<section class="evidence-row"><h3>' + esc(row.label) + '</h3>'
        + (entries.length ? '<dl class="metrics">' + entries.map(([id, value]) =>
          '<div><dt>' + esc(data.metrics[id]) + '</dt><dd>' + fmt.format(value) + '</dd></div>').join("") + '</dl>' : "")
        + '<p class="detail-note">' + esc(row.note) + '</p><p class="locator">'
        + sourceLink(source) + ' · ' + esc(row.locator) + ' · ' + esc(source.kind) + '</p></section>';
    }
    function choose(id, navigate = false, refit = false) {
      const item = byId.get(id);
      selected = item;
      if (navigate) history.replaceState(null, "", "#" + id);
      for (const button of $("raid-list").querySelectorAll("[data-case]")) {
        button.setAttribute("aria-current", String(button.dataset.case === id));
      }
      $("raid-date").textContent = interval(item) + " · " + (item.place || data.sites[item.site].name);
      $("raid-title").textContent = item.title;
      $("raid-story").textContent = item.story;
      $("raid-records").innerHTML = item.evidence.map(evidence).join("");
      $("case-references").innerHTML = (item.refs || []).map(ref => sourceLink(data.sources[ref])).join("");
      $("case-references").hidden = !item.refs?.length;
      $("raid-detail").hidden = false;
      map(visible, item, refit);
      if (navigate && viewport.matches) $("raid-detail").focus();
    }
    const map = initMap(data.sites, choose);

    function renderList(preferred) {
      visible = data.cases.filter(item => !filter.value || item.topics.includes(filter.value));
      $("raid-list").innerHTML = visible.map(item =>
        '<li><button type="button" data-case="' + esc(item.id) + '"><strong>' + ids.get(item.id) + '. ' + esc(item.title)
        + '</strong><span>' + esc(interval(item)) + '</span></button></li>').join("");
      $("load-status").textContent = visible.length + " cases";
      const next = visible.includes(preferred) ? preferred : visible[0];
      if (byId.has(location.hash.slice(1)) && location.hash !== "#" + next.id) history.replaceState(null, "", "#" + next.id);
      choose(next.id, false, true);
    }
    $("raid-list").addEventListener("click", event => {
      const button = event.target.closest("button[data-case]");
      if (button) choose(button.dataset.case, true);
    });
    filter.addEventListener("change", () => renderList(selected));
    function openHash() {
      const item = byId.get(location.hash.slice(1));
      if (item && filter.value && !item.topics.includes(filter.value)) filter.value = "";
      renderList(item || selected);
    }
    window.addEventListener("hashchange", openHash);
    renderSeries(data.series, data.sources);
    openHash();
  }).catch(error => {
    $("load-status").textContent = "The campaign records could not load. Reload the page to retry.";
    console.error(error);
  });
})();
