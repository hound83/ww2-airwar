(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const number = new Intl.NumberFormat("en-GB");
  const calendar = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });
  const day = value => calendar.format(new Date(value + "T00:00:00Z"));
  const interval = item => item.endDate ? day(item.date) + " – " + day(item.endDate) : day(item.date);
  const modeLabels = { day: "Daylight", night: "Night", both: "Day and night" };
  const buckets = {
    allied: "Allied mission and unit evidence",
    german: "German fighter and claim evidence",
    command: "German command loss returns · calendar days"
  };
  const monthlyMetrics = {
    enemyDestroyed: "enemyDestroyed", enemyDamaged: "enemyDamaged",
    opsDestroyed: "otherOperationalDestroyed", opsDamaged: "otherOperationalDamaged",
    nonOpsDestroyed: "nonOperationalDestroyed", nonOpsDamaged: "nonOperationalDamaged",
    enemyMissing: "missing"
  };

  const link = (source, label) => '<a href="' + escape(source.url) + '">' + escape(label || source.title) + '</a>';
  const figures = (metrics, names) => Object.keys(metrics).length
    ? '<dl class="metrics">' + Object.entries(metrics).map(([key, value]) =>
      '<div><dt>' + escape(names[key]) + '</dt><dd>' + number.format(value) + '</dd></div>').join("") + '</dl>'
    : "";

  function initMap(cases, choose) {
    if (!window.L) return () => {};
    $("reich-map").hidden = false;
    $("map-note").hidden = false;
    const map = L.map("reich-map", { scrollWheelZoom: false, minZoom: 4, maxZoom: 9 });
    const points = cases.map(item => L.latLng(item.lat, item.lng));
    const markers = cases.map((item, index) => {
      const icon = L.divIcon({ className: "reich-pin", html: String(index + 1), iconSize: [27, 27] });
      const marker = L.marker(points[index], { icon, title: item.title });
      marker.on("add", () => marker.getElement().setAttribute("aria-label", item.title));
      marker.on("click", () => choose(item, true));
      marker.bindTooltip(escape(item.title), { direction: "top" });
      return marker;
    });
    const leaders = points.map(() => L.polyline([], { color: "#537064", weight: 1, interactive: false }));
    function placeMarkers() {
      const placed = [];
      const size = map.getSize();
      const offsets = [[0, 0], [31, 0], [-31, 0], [0, -31], [0, 31], [31, -31], [-31, 31], [31, 31], [-31, -31], [62, 0], [-62, 0], [0, -62]];
      function inside(candidate) {
        const point = map.layerPointToContainerPoint(candidate);
        return point.x >= 16 && point.x <= size.x - 16 && point.y >= 16 && point.y <= size.y - 24;
      }
      markers.forEach((marker, index) => {
        if (!map.hasLayer(marker)) return;
        const point = map.latLngToLayerPoint(points[index]);
        const adjusted = offsets.map(offset => point.add(offset))
          .find(candidate => placed.every(other => other.distanceTo(candidate) >= 29)) || point;
        placed.push(adjusted);
        marker.setLatLng(map.layerPointToLatLng(adjusted));
        leaders[index].setLatLngs(adjusted.equals(point) ? [] : [points[index], marker.getLatLng()]);
      });
    }
    map.on("moveend resize", placeMarkers);
    if (window.topojson) {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-50m.json")
        .then(response => response.ok ? response.json() : null)
        .then(world => {
          if (!world) return;
          L.geoJSON(topojson.feature(world, world.objects.land), {
            interactive: false, style: { color: "#818e79", weight: 1, fillColor: "#ede7d2", fillOpacity: 1 }
          }).addTo(map).bringToBack();
          map.attributionControl.addAttribution("Natural Earth / world-atlas");
        }).catch(() => {});
    }
    return (visible, item, refit) => {
      if (refit) map.fitBounds(visible.map(raid => [raid.lat, raid.lng]), { paddingTopLeft: [38, 38], paddingBottomRight: [38, 65], maxZoom: 7 });
      markers.forEach((marker, index) => {
        if (visible.includes(cases[index])) {
          if (!map.hasLayer(marker)) {
            leaders[index].addTo(map);
            marker.addTo(map);
          }
          marker.getElement().classList.toggle("chosen", item === cases[index]);
        } else {
          map.removeLayer(marker);
          map.removeLayer(leaders[index]);
        }
      });
      placeMarkers();
    };
  }

  function json(url) {
    return fetch(url).then(response => {
      if (!response.ok) throw new Error("Source file unavailable: " + url);
      return response.json();
    });
  }

  Promise.all([
    json("./research/transcriptions/reich-defence-1943-1945.json"),
    json("./research/transcriptions/operations-january-june-1944.json")
  ]).then(([data, operations]) => {
    const terms = { ...operations.metrics, ...data.extraMetrics };
    const sources = { ...operations.sources, ...data.sources };
    const records = new Map(operations.records.map(record => [record.id, record]));
    const names = new Map(data.cases.map((item, index) => [item.id, index + 1]));
    const returns = [window.AirWarV71Data, window.AirWarV72Data];
    const viewport = window.matchMedia("(max-width: 45rem)");
    const filter = $("raid-mode");
    let visible = data.cases;
    let selected;

    function attribution(row) {
      const source = sources[row.source];
      return '<p class="locator">' + link(source) + ' · ' + escape(row.locator)
        + (source.type ? ' · ' + escape(source.type) : "") + '</p>';
    }
    function evidence(row) {
      return '<div class="evidence-row"><h4>' + escape(row.label) + '</h4>'
        + figures(row.metrics, terms) + (row.note ? '<p class="detail-note">' + escape(row.note) + '</p>' : "")
        + attribution(row) + '</div>';
    }
    function existing(row) {
      const force = operations.forces[row.force];
      return {
        ...row,
        label: force.label + " · " + row.name + (row.kind === "loss-return" ? " · " + day(row.date) : ""),
        group: row.kind === "loss-return" ? "command" : force.side
      };
    }
    function month(item) {
      const index = window.LuftData.idx(Number(item.date.slice(0, 4)), Number(item.date.slice(5, 7)) - 1);
      for (const series of returns) {
        const total = series.monthlyReturns.find(row => row.theater === "Reich" && row.i === index);
        if (!total) continue;
        const source = series.sourceIndex[total.sourceId];
        const metrics = Object.fromEntries(Object.entries(monthlyMetrics).map(([key, field]) => [key, total[field]]));
        return '<h3>Reich command · ' + escape(total.month) + '</h3>'
          + '<p class="detail-note">' + number.format(total.destroyed) + ' aircraft destroyed across all causes. Printed month-end return for all types in the reporting area. Missing aircraft are included in enemy-action destruction.</p>'
          + figures(metrics, terms) + '<p class="locator">' + link(source)
          + (total.page ? " · PDF p. " + total.page : " · " + escape(source.title)) + '</p>';
      }
      return '<h3>Reich command · monthly context</h3><p class="detail-note">No transcribed command total for this month in the Atlas.</p>';
    }

    function choose(item, navigate = false, refit = false) {
      selected = item;
      if (navigate) history.replaceState(null, "", "#" + item.id);
      $("raid-list").querySelectorAll("button").forEach(button =>
        button.setAttribute("aria-current", String(button.dataset.raid === item.id)));
      $("raid-title").textContent = item.title;
      $("raid-date").textContent = interval(item) + " · " + modeLabels[item.mode] + " · " + item.place;
      $("raid-story").textContent = item.story;
      $("raid-sources").innerHTML = (item.refs || []).map(id => link(sources[id])).join("");
      const ids = new Set(item.records || []);
      const rows = [...[...ids].map(id => existing(records.get(id))), ...(item.extra || [])];
      $("raid-records").innerHTML = Object.entries(buckets).map(([key, heading]) => {
        const entries = rows.filter(row => (row.group || "allied") === key);
        return entries.length
          ? '<section class="evidence-group" data-scope="' + key + '"><h3>' + heading + '</h3>' + entries.map(evidence).join("") + '</section>'
          : "";
      }).join("");
      const relations = operations.links.filter(relation => relation.records.every(id => ids.has(id)));
      $("raid-links").hidden = !relations.length;
      $("raid-links").innerHTML = relations.length ? '<h3>Links between records</h3>' + relations.map(relation =>
        '<div class="relation"><strong>' + escape(relation.label) + '</strong><p>' + escape(relation.note) + '</p>'
        + attribution(relation) + '</div>').join("") : "";
      $("raid-month").innerHTML = month(item);
      $("raid-detail").hidden = false;
      drawMap(visible, item, refit);
      if (navigate && viewport.matches) $("raid-detail").focus();
    }

    const drawMap = initMap(data.cases, choose);
    function renderList(preferred) {
      visible = data.cases.filter(item => !filter.value || item.mode === filter.value || item.mode === "both");
      $("raid-list").innerHTML = visible.map(item =>
        '<li><button type="button" data-raid="' + escape(item.id) + '"><strong>' + names.get(item.id) + '. '
        + escape(item.title) + '</strong><span>' + escape(interval(item) + " · " + modeLabels[item.mode]) + '</span></button></li>').join("");
      $("load-status").textContent = visible.length + (visible.length === 1 ? " case" : " cases");
      const next = visible.includes(preferred) ? preferred : visible[0];
      if (location.hash && location.hash !== "#" + next.id) history.replaceState(null, "", "#" + next.id);
      choose(next, false, true);
    }
    $("raid-list").addEventListener("click", event => {
      const button = event.target.closest("[data-raid]");
      if (button) choose(visible.find(item => item.id === button.dataset.raid), true);
    });
    filter.addEventListener("change", () => renderList(selected));
    function openHash() {
      const item = data.cases.find(raid => "#" + raid.id === location.hash);
      if (item && !visible.includes(item)) filter.value = "";
      renderList(item);
    }
    window.addEventListener("hashchange", openHash);
    openHash();
  }).catch(error => {
    $("load-status").textContent = "The source records could not load. Reload the page or open the operations archive.";
    console.error(error);
  });
})();
