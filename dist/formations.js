"use strict";
(() => {
  const views = new Map([...document.querySelectorAll("[data-view]")].map(el => [el.id, el]));
  const unknown = document.getElementById("unknown");
  function show(focus) {
    const id = location.hash.slice(1) || "directory";
    const view = views.get(id) || views.get("directory");
    for (const el of views.values()) el.hidden = el !== view;
    unknown.hidden = views.has(id);
    const heading = view.querySelector("h1");
    document.title = heading.textContent + " · European Air War Atlas";
    if (focus) {
      heading.focus({preventScroll: true});
      window.scrollTo(0, 0);
    }
  }
  document.querySelector(".skip").addEventListener("click", event => {
    event.preventDefault();
    document.querySelector("[data-view]:not([hidden]) h1").focus();
  });
  window.addEventListener("hashchange", () => show(true));
  show(false);
})();
