/* Carry a chapter's reading context through linked Atlas records. */
(() => {
  "use strict";
  const directory = window.AtlasEurope;
  const chapter = new URLSearchParams(location.search).get("fromChapter");
  if (!directory || !Object.hasOwn(directory.titles, chapter)) return;
  window.AtlasReading = {params:{fromChapter:chapter}};
  const nav = document.createElement("nav");
  nav.id = "chapter-return";
  nav.setAttribute("aria-label", "Return to the European history");
  const link = document.createElement("a");
  link.href = "./europe.html#" + chapter;
  link.textContent = "← Return to chapter · " + directory.titles[chapter];
  nav.append(link);
  document.body.prepend(nav);
  const routes = new Set(["grand-air-war-v80.html","formations.html","operational-balance.html","operations-1944.html",
    "sicily.html","malta.html","reich-defence.html","bagration.html","bodenplatte.html","narvik.html","dieppe.html","big-week.html"]);
  const folder = new URL(".", location.href);
  function carry(event) {
    const a = event.target.closest?.("a[href]");
    if (!a || a.hasAttribute("download") || a.getAttribute("href").startsWith("#")) return;
    const url = new URL(a.getAttribute("href"), location.href);
    if (!["https:","http:"].includes(url.protocol) || url.origin !== location.origin || new URL(".",url).href !== folder.href || !routes.has(url.pathname.split("/").pop())) return;
    if (url.searchParams.get("fromChapter") !== chapter) {
      url.searchParams.set("fromChapter", chapter);
      a.setAttribute("href", url.href);
    }
  }
  for (const type of ["pointerdown","focusin","click","auxclick","contextmenu"]) document.addEventListener(type,carry,true);
})();
