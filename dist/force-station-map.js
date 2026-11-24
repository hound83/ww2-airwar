/* The Atlas coastline uses x=(longitude+16)*480/72 and y=(72-latitude)*9.
   The two close-up rectangles use Natural Earth 1:50m physical land in the same projection. */
(function () {
  "use strict";
  const ns = "http://www.w3.org/2000/svg";
  const coastURL = new URL("europe-coast.svg", document.currentScript.src).href;
  const charts = new WeakMap();
  let coastPromise;

  function svg(tag, attributes) {
    const node = document.createElementNS(ns, tag);
    for (const [k,v] of Object.entries(attributes)) node.setAttribute(k, v);
    return node;
  }
  function html(tag, className) {
    const node = document.createElement(tag);
    node.className = className;
    return node;
  }
  function coastlines() {
    if (!coastPromise) {
      coastPromise = fetch(coastURL).then(response => {
        if (!response.ok) throw Error("Coastline unavailable");
        return response.text();
      }).then(xml => Array.from(new DOMParser().parseFromString(xml, "image/svg+xml").querySelectorAll("path"), path => path.getAttribute("d")));
    }
    return coastPromise;
  }
  function makeButton(text, label) {
    const button = html("button", "fsm-control");
    button.type = "button";
    button.textContent = text;
    button.title = button.ariaLabel = label;
    return button;
  }
  function chart(container) {
    const canvas = html("div", "fsm-chart");
    const coast = svg("svg", {class: "fsm-coast", "aria-hidden":"true", preserveAspectRatio:"none"});
    const land = svg("g", {});
    coast.append(land);
    for (const tile of regionalLand) {
      const inset = svg("svg", {x:tile.x, y:tile.y, width:tile.w, height:tile.h, viewBox:[tile.x,tile.y,tile.w,tile.h].join(" "), overflow:"hidden"});
      inset.append(svg("rect", {x:tile.x, y:tile.y, width:tile.w, height:tile.h, fill:"#dbe9eb"}));
      inset.append(...tile.land.map(d => svg("path", {d,"vector-effect":"non-scaling-stroke"})));
      coast.append(inset);
    }
    coastlines().then(paths => land.replaceChildren(...paths.map(d => svg("path", {d, "vector-effect":"non-scaling-stroke"})))).catch(() => {
      land.replaceChildren(svg("image", {href:coastURL, x:0, y:0, width:480, height:360}));
    });
    const grid = svg("svg", {class:"fsm-grid","aria-hidden":"true"});
    const markers = html("div", "fsm-markers");
    markers.setAttribute("role", "group");
    markers.setAttribute("aria-label", "Airfield locations");
    const controls = html("div", "fsm-controls");
    const plus = makeButton("+","Zoom in on stations");
    const minus = makeButton("−","Zoom out from stations");
    const fit = makeButton("Fit","Show all station locations");
    controls.append(minus,plus,fit);
    canvas.append(coast,grid,markers,controls);
    container.replaceChildren(canvas);
    const state = {points:[], selected:"", zoom:1, x:0, y:0, onSelect: null};
    let frame;
    function fitFrame() {
      const w = Math.max(100,canvas.clientWidth), h = Math.max(100,canvas.clientHeight);
      const xs = state.points.map(p=>p.x), ys = state.points.map(p=>p.y);
      const left = Math.min(...xs), right = Math.max(...xs), top = Math.min(...ys), bottom = Math.max(...ys);
      const units = Math.max(11 / w, 7 / h, (right-left)/Math.max(1,w-100), (bottom-top)/Math.max(1,h-100));
      return {x:(left+right)/2, y:(top+bottom)/2, units, w, h};
    }
    function draw() {
      if (!state.points.length) return;
      const base = fitFrame();
      const scale = base.units/state.zoom;
      const w = base.w, h = base.h;
      const x = base.x + state.x - w*scale/2, y = base.y + state.y - h*scale/2;
      frame = {x,y,scale};
      coast.setAttribute("viewBox", [x,y,w*scale,h*scale].join(" "));
      grid.setAttribute("viewBox", "0 0 "+w+" "+h);
      grid.replaceChildren();
      drawGrid(grid,x,y,scale,w,h);
      const tooltip = new Set();
      const occupied = [];
      const pins = state.points.map(p=>({...p,px:(p.x-x)/scale,py:(p.y-y)/scale}));
      const active = pins.find(p=>p.id===state.selected);
      const candidates = active ? [active,...pins.filter(p=>p!==active)] : pins;
      for (const p of candidates) {
        const labelWidth = Math.min(150, p.name.length*6.6+10);
        const mirror = p.px+labelWidth+12>w;
        const left = mirror?p.px-labelWidth-10:p.px+10;
        const overlaps = occupied.some(r=>left<r.right && left+labelWidth>r.left && Math.abs(p.py-r.y)<19);
        const hidesPin = pins.some(q=>q!==p && q.px>=left-4 && q.px<=left+labelWidth+4 && Math.abs(q.py-p.py)<12);
        if (p.px>=8 && p.px<=w-8 && p.py>=12 && p.py<h-28 && (!overlaps && !hidesPin || p===active)) {
          tooltip.add(p.id);
          occupied.push({left,right:left+labelWidth,y:p.py});
        }
      }
      for (const p of pins) {
        const b = p.button;
        b.style.left = p.px+"px"; b.style.top = p.py+"px";
        b.hidden = p.px<0 || p.px>w || p.py<0 || p.py>h;
        b.classList.toggle("fsm-label-left", p.px + Math.min(150,p.name.length*6.6+10) + 12 > w);
        b.classList.toggle("fsm-label-show", tooltip.has(p.id));
        b.setAttribute("aria-pressed", String(p.id===state.selected));
      }
      minus.disabled = fit.disabled = state.zoom===1;
      plus.disabled = state.zoom>=8;
      canvas.classList.toggle("fsm-can-pan", state.zoom>1);
    }
    function zoom(factor) {
      const base = fitFrame(), point = state.points.find(p=>p.id===state.selected);
      state.zoom = Math.max(1,Math.min(8,state.zoom*factor));
      if (state.zoom===1) { state.x=0; state.y=0; }
      else if (point) { state.x=point.x-base.x; state.y=point.y-base.y; }
      draw();
    }
    plus.addEventListener("click",()=>zoom(2));
    minus.addEventListener("click",()=>zoom(.5));
    fit.addEventListener("click",()=>zoom(1/state.zoom));
    let drag;
    canvas.addEventListener("pointerdown",e=>{
      if (e.button!==0 || state.zoom===1 || e.target.closest("button")) return;
      drag={x:e.clientX,y:e.clientY,ox:state.x,oy:state.y};
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointermove",e=>{
      if (!drag || !frame) return;
      state.x=drag.ox-(e.clientX-drag.x)*frame.scale;
      state.y=drag.oy-(e.clientY-drag.y)*frame.scale;
      draw();
    });
    canvas.addEventListener("lostpointercapture",()=>{drag=null;});
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    function update(points, selected, onSelect) {
      const changedStation = selected !== state.selected;
      state.selected=selected; state.onSelect=onSelect;
      const same = points.length===state.points.length && points.every((p,i)=>{
        const old=state.points[i];
        return p.id===old.id && p.lat===old.lat && p.lon===old.lon && p.name===old.name && p.count===old.count;
      });
      if (!same) {
        state.zoom=1;state.x=0;state.y=0;
        state.points=points.map(p=>{
          const button=html("button","fsm-pin");
          button.type="button"; button.dataset.station=p.id;
          const label=html("span","fsm-name"); label.textContent=p.name;
          button.append(label);
          const title = p.name + (Number.isFinite(p.count) ? " · "+p.count+(p.count===1?" roster entry":" roster entries") : "");
          button.title=button.ariaLabel=title;
          button.addEventListener("click", e => {
            if (!e.detail || !frame) { state.onSelect(p.id); return; }
            // Overlapping touch targets can receive the adjacent field's click.
            // Resolve a pointer against the drawn station centres; keyboard focus
            // always selects its own button.
            const rect=canvas.getBoundingClientRect();
            const x=frame.x+(e.clientX-rect.left)*frame.scale;
            const y=frame.y+(e.clientY-rect.top)*frame.scale;
            const distance=q=>(q.x-x)**2+(q.y-y)**2;
            const nearest=state.points.reduce((best,q)=>distance(q)<distance(best)?q:best);
            state.onSelect(nearest.id);
          });
          return {...p,x:(p.lon+16)*480/72,y:(72-p.lat)*9,button};
        });
        markers.replaceChildren(...state.points.map(p=>p.button));
      } else if (changedStation && state.zoom>1) {
        const point=state.points.find(p=>p.id===selected);
        if (point) {
          const base=fitFrame();
          state.x=point.x-base.x;
          state.y=point.y-base.y;
        }
      }
      draw();
    }
    return {canvas,update,dispose:()=>observer.disconnect()};
  }
  function drawGrid(grid,x,y,scale,w,h) {
    const steps=[.1,.25,.5,1,2,5,10,20];
    const degree=steps.find(s=>s*7/scale>=85)||20;
    function axis(first,last,toPixel,horizontal) {
      for(let value=Math.ceil(first/degree)*degree; value<=last; value+=degree) {
        const pixel=toPixel(value);
        const line=horizontal?{x1:0,x2:w,y1:pixel,y2:pixel}:{x1:pixel,x2:pixel,y1:0,y2:h};
        grid.append(svg("line",line));
        if((horizontal && (pixel<12 || pixel>h-21)) || (!horizontal && (pixel<28 || pixel>w-28))) continue;
        const text=svg("text",horizontal?{x:5,y:pixel-4}:{x:pixel+4,y:h-7});
        const hemisphere=horizontal?(value<0?"S":"N"):(value<0?"W":"E");
        text.textContent=Number(Math.abs(value).toFixed(2))+"°"+(value===0?"":hemisphere);
        grid.append(text);
      }
    }
    axis(x*72/480-16,(x+w*scale)*72/480-16,v=>((v+16)*480/72-x)/scale,false);
    axis(72-(y+h*scale)/9,72-y/9,v=>((72-v)*9-y)/scale,true);
  }
  function render(container,stations,selectedId,onSelect) {
    if (!container) return;
    let instance=charts.get(container);
    const points=stations.filter(p=>p.id && Number.isFinite(p.lat) && Number.isFinite(p.lon));
    if (instance && (!points.length || !container.contains(instance.canvas))) {
      instance.dispose(); charts.delete(container); instance=null;
    }
    if (!points.length) {
      const message=html("p","fsm-empty");
      message.textContent="No station coordinates are documented for this selection.";
      container.replaceChildren(message);
      return;
    }
    if (!instance) { instance=chart(container); charts.set(container,instance); }
    instance.update(points,selectedId,onSelect);
  }
  // Natural Earth land, public domain, via world-atlas@2.0.2/land-50m.json.
  // Clip windows (west,south,east,north): [9,34,18,42] and [-6,48,8,55.5].
  // The paths extend 0.15 degrees outside each window to hide clip-edge strokes.
  // Vertices were simplified at 0.075 projection units and rounded to 0.01.
  const regionalLand = [
    {x:166.67, y:270, w:60, h:72, land:[
      "M170.88,280.06L171.22,280.64L172.03,283.5L171.89,284.03L170.95,285.58L171.07,286.56L171.34,287.17L171.38,287.84L170.78,293.81L170.42,295.5L169.92,295.75L168.43,295.05L167.66,295.23L167.04,294.84L166.82,296.61L166.44,297.33L165.89,297.78L165.67,297.79L165.67,279.22L166.66,278L167.38,277.72L167.76,277.33L167.88,276.81L168.19,276.69L168.55,277.19L169.01,277.24L169.7,277.64L170.26,278.52L170.76,278.85L170.81,278.95L170.59,279.06L170.35,279.61Z",
      "M170.36,268.65L169.34,270.66L169.3,272.42L169.15,272.89L168.86,273.36L168.36,274.86L167.9,275.53L166.68,274.71L165.96,274.36L165.67,274.02L165.67,273.2L165.86,272.99L165.91,272.69L165.67,272.59L165.67,268.65Z",
      "M210.5,304.02L209.83,305.44L208.22,307.94L207.34,310.87L207.46,311.98L208.2,312.8L207.82,313.12L208.58,314.12L208.63,314.5L208.63,314.87L207.62,315.97L207.43,316.45L207.41,317.81L206.69,317.75L205.92,317.48L205.18,317.61L203.35,316.81L202.44,315.25L201.72,314.58L200.95,314.06L199.37,314.09L198.67,313.78L197.26,312.72L195.74,311.86L194.47,310.69L193.61,310.44L192.82,309.86L191.33,309.86L190.94,309.66L190.18,308.97L189.58,307.62L190.32,305.53L191.09,305.03L191.57,304.36L192.34,305.42L192.7,305.69L193.03,305.62L193.66,305.25L193.7,304.83L194.4,304.28L195.67,304.38L195.89,304.86L196.61,305.08L197.88,306L198.6,306.17L199.58,305.78L200.33,305.64L201.91,305.84L202.78,305.61L203.38,305.59L204.24,305.23L204.91,304.64L205.27,304.5L206.54,304.48L207.46,304.63L207.84,304.48L208.15,304.09L208.54,303.92L208.94,304.05L210,303.38L210.46,303.34L210.89,303.59Z",
      "M227.67,268.65L227.67,343.35L165.67,343.35L165.67,314.85L167.06,313.59L167.62,313.25L171.26,311.94L172.25,312.22L171.89,313.09L172.2,313.78L172.63,313.36L172.51,312.72L173.93,312.73L174.65,313.14L174.6,314.7L175.56,316.22L175.3,316.97L176.09,317.42L176.78,316.87L177.14,316.08L178.44,315.62L179.69,314.47L180.36,314.34L180.5,315.3L180.84,316.14L180.38,316.42L179.78,317.31L178.66,319.56L177.62,320.22L176.83,321.09L176.59,321.7L176.52,322.42L176.71,323.7L177.26,325.01L177.94,325.81L178.56,326.05L180.02,327.3L180,328.03L180.22,328.92L180.29,329.98L180.79,330.84L179.71,332.7L179.11,334.05L177.94,335.89L176.9,337.09L174.67,338.89L174.12,339.48L173.76,340.09L173.59,340.73L173.66,341.5L174.38,343.35L227.67,343.35L227.67,268.65L204.68,268.65L205.78,269.53L207.79,270.6L209.38,270.78L213.1,270.55L213.74,270.64L214.44,270.94L214.58,271.67L214.34,272.17L213.55,272.69L212.76,273.41L212.66,274.39L213.41,275.08L217.01,276.91L220.68,278.44L221.83,279.22L223.15,280.44L226.37,282.11L226.9,282.92L227.67,283.6L227.67,288.96L227.18,288.56L225.77,285.49L223.18,285.17L221.71,284.41L221.66,284.06L221.42,283.63L221.21,283.47L220.2,283.38L219.53,283.88L218.71,285.06L217.8,286.77L216.86,289.27L216.82,290.27L217.32,291.25L218.83,291.8L219.98,292.67L220.75,293.58L220.82,295.77L221.16,297.02L220.66,297.72L219.67,297.55L218.38,298L217.44,298.8L217.06,299.56L217.15,301.56L216.96,302.31L215.21,303.75L214.3,305.22L213.72,306.53L211.49,306.55L210.98,305.69L210.96,304.42L211.34,303.64L212.16,303.27L212.69,301.64L212.52,300.47L212.86,299.95L213.14,299.59L214.66,299.17L214.73,297.53L214.06,296.78L213.48,293.81L212.35,291.36L211.75,289.17L211.3,288.09L210.58,287.52L209.28,287.53L208.63,287.38L206.33,285.84L206.18,285.61L206.18,285.22L206.57,284.6L206.33,283.78L206.04,283L205.61,282.33L205.1,281.99L203.71,282.36L203.06,282.3L202.56,282.6L202.27,282.61L203.06,281.44L202.85,281.17L202.06,280.69L200.69,280.55L200.5,280.86L200.3,280.69L200.33,280.17L199.06,277.83L198.22,276.88L197.81,276.7L197.04,276.91L195.74,276.49L194.98,276.39L193.92,276.8L193.61,276.61L193.49,276.3L192.34,275.31L190.87,274.77L188.04,271.69L187.18,270.53L185.38,269.27L185,268.65Z",
      "M202.08,323.75L201.7,323.89L201.19,323.45L201.74,323.31L202.03,323.44Z",
      "M199.58,281.64L199.3,281.72L199.13,281.63L199.03,281.49L199.15,281.14L199.75,281.35Z",
      "M187.01,317.19L186.7,317.28L186.26,316.98L186.31,316.41L186.84,316.61Z",
      "M181.85,335.22L180.82,335.86L181.03,335.29L181.7,334.62L181.87,334.78Z",
      "M178.22,343.35L178.3,343L179.47,342.97L179.87,343.35Z",
      "M203.78,325.33L203.54,325.62L202.92,325.61L202.34,325.16L202.34,324.2L202.99,324.39Z"
    ]},
    {x:66.67, y:148.5, w:93.33, h:67.5, land:[
      "M94.74,147.15L95.64,147.87L95.93,148.51L97.17,152.76L98.06,155.04L98.45,155.67L98.97,156.1L101.61,157.13L102.19,157.46L104.21,159.49L105.12,160.29L106.1,160.93L105.62,161.27L105.29,161.81L105.93,163.21L107.45,165.52L106.92,165.24L106.17,165.21L104.85,164.37L103.58,164.56L102.26,164.48L103.44,164.74L104.71,164.77L107.52,166.79L108.48,167.98L109.03,169.56L108.65,170.27L108.05,170.73L106.97,171.85L108.53,172.73L109.22,172.57L110.4,171.31L111.36,171.21L112.99,171.41L113.71,171.37L115.15,171.68L115.87,171.96L117.72,173.21L118.1,173.9L118.29,174.79L118.32,175.77L117.65,177.49L117.43,178.54L117.07,179.21L116.09,180.05L115.44,180.38L115.17,180.24L114.89,180.26L114.86,180.46L115.15,180.88L115.17,181.4L114.6,181.77L114,181.93L113.04,181.73L111.67,182.43L112.65,182.79L112.85,183.18L112.61,183.85L112.01,184.16L110.04,184.49L109.49,184.8L110.18,184.63L110.66,184.79L110.97,185.35L111.24,185.52L112.61,185.76L115.05,185.62L116.11,185.73L115.99,187.37L115.77,187.6L113.64,188.57L113.18,189.26L113.06,189.66L111.81,189.6L111.24,190.02L110.21,190.32L108.67,191.02L108.02,191.13L105.31,190.66L103.65,190.71L101.42,191.12L100.85,191.04L99.12,190.4L98.11,190.29L97.22,189.93L97.77,190.62L96.55,191.27L94.22,191.57L93.12,191.48L93.57,192.35L93.09,192.57L91.01,192.26L90.69,192.32L90.45,192.6L89.69,192.46L88.94,191.98L88.15,191.65L87.33,191.49L86.66,191.55L83.97,192.3L83.42,193.07L83.16,194.15L82.77,195.1L82.13,195.83L81.38,195.94L80.66,195.43L79.32,194.87L78.69,194.46L78.02,194.77L76.63,194.93L75.14,195.38L73.27,196.55L73.01,196.79L72.55,197.65L71.83,197.8L71.18,197.26L70.44,197.05L69.67,197.26L69.19,197.54L68.97,197.3L68.95,196.82L69.53,196.23L71.06,195.79L72.38,194.63L73.29,193.54L73.63,193.29L74.04,193.19L74.25,192.76L76.1,191.01L76.27,190.62L76.51,189.21L78.02,188.76L78.74,187.3L78.93,187.19L81.05,186.93L82.61,186.94L84.17,187.23L85.75,187.15L86.37,186.76L87.45,185.35L89.4,183.52L90.45,182.34L89.73,182.74L88.39,183.77L86.81,184.15L84.72,185.49L82.92,185.27L81.57,184.15L80.73,183.68L80.37,183.62L79.22,183.9L78.43,183.88L78.84,183.35L79.39,183.05L78.17,182.85L77.81,182.7L77.42,182.34L76.46,182.27L76.01,182.37L75.21,182.85L73.99,183.37L72.5,182.65L72.21,182.34L72.21,181.73L72,181.24L71.59,181.09L72.12,180.46L72.74,180.04L74.13,179.62L77.45,178.23L78.55,177.51L79.01,177.07L79.65,175.73L80.13,175.12L79.68,174.98L79.46,174.52L79.73,173.66L79.22,172.62L79.32,171.76L77.61,171.93L76.1,172.66L75.45,172.74L75.45,172.4L75.74,171.98L77.3,170.88L77.81,170.06L78.21,169.7L79.27,169.02L81.26,168.27L82.37,168.32L83.13,168.21L83.81,167.93L84.5,167.87L86.01,168.66L85.56,167.45L86.23,167.16L87.21,168.26L87.57,168.37L88.34,168.21L88.03,168.02L87.24,167.85L86.88,167.49L86.23,166.38L86.28,165.73L87.17,164.4L86.45,164.04L86.37,163.4L86.49,162.85L87.33,162.35L87.69,160.77L87.55,160.4L86.71,160.46L85.94,160.87L85.56,160.85L84.53,159.93L82.87,157.79L82.73,156.92L83.57,155.04L84.89,153.84L86.42,153.42L83.78,153.32L82.99,153.48L82.27,153.96L81.45,154.17L80.28,154.98L79.1,154.99L78.62,154.46L78.31,154.38L76.56,155.18L74.54,154.38L74.06,155.06L73.92,155.79L73.13,155.15L72.43,154.27L72.19,153.74L72.19,153.13L72.55,152.88L72.96,153.1L73.56,151.65L75.19,149.21L75.48,148.49L75.43,148.01L75.17,147.62L74.59,147.15L70.4,147.15L69.62,149.49L69.41,149.84L69.02,150.06L68.47,149.99L68.21,149.73L68.21,149.45L68.89,147.15Z",
      "M65.67,151.04L65.81,151.04L66.43,151.7L66.77,152.73L67.53,153.76L68.57,154.65L68.59,155.18L68.23,155.48L67.46,155.84L67.49,156.23L68.4,155.95L69.45,156.02L69.81,156.43L70.2,157.49L70.1,158.02L69.84,157.85L69.55,157.38L68.85,157.06L69.02,157.7L68.95,158.57L69.62,158.67L69.29,159.54L68.61,159.79L67.82,159.88L67.08,161.2L66.55,161.54L65.67,161.39L65.67,165.73L65.81,167.48L65.67,167.72L66.36,170.18L66.48,171.65L65.67,173.06Z",
      "M161,147.15L161,217.35L77.71,217.35L77.49,217.1L77.16,216.29L75.48,215.65L75.81,215.22L76.58,215.13L77.47,214.83L77.81,214.47L77.11,214.04L76.58,213.93L76.15,213.4L76.46,213.21L77.3,213.37L78.38,213.27L78,212.88L77.37,212.69L76.51,212.65L76.1,212.79L75.21,212.72L74.93,211.94L75.19,211.15L76.46,210.43L79.61,209.63L80.95,209.74L81.91,209.6L83.04,209.12L83.52,208.68L85.13,208.43L86.64,208.88L88.05,210.58L88.73,211.16L90.36,210.16L92.81,210.19L93.31,210.76L93.5,210.29L93.96,209.72L94.32,209.97L94.51,210.32L97.49,210.13L96.79,209.72L96.24,208.76L96.12,205.18L95.4,204.18L94.58,202.58L94.2,201.65L94.29,200.85L96.07,200.99L97.56,200.63L98.28,200.88L98.23,201.62L98.45,202.55L99.07,203.51L100.27,203.46L101.57,203.76L103.2,203.8L105.57,204.33L106.58,204.02L107.57,203.38L109.44,202.96L109.61,202.74L108.53,202.83L107.52,202.43L107.4,201.98L107.9,200.68L110.78,199.24L112.82,198.8L114.96,198.02L116.04,197.21L116.76,196.15L117.29,195.73L117,195.35L117.19,191.35L117.41,190.63L117.81,190.04L118.46,189.59L119.42,189.09L122.97,188.4L126.41,186.62L128.16,185.84L129.5,185.46L130.61,185.4L131.45,185.68L132.55,185.8L133.41,185.43L134.09,185.76L134.83,185.52L133.37,185.01L132.14,185.32L131.28,184.94L130.58,184.91L129.67,184.13L130.01,183.8L130.32,183.7L131.61,183.63L132.57,183.84L134.28,184.9L135.17,184.76L134.93,184.46L133.87,184.04L133.37,183.63L134.54,183.51L134.23,182.95L132.98,181.71L133.51,180.65L133.89,180.05L134.73,179.48L135.84,178.23L136.56,177.21L137.09,176.02L137.85,172.71L138.45,171.52L139.25,171.82L140.4,171.35L142.39,170.13L142.97,169.07L143.54,168.59L145.82,167.62L147.07,167.34L152.11,167.02L153.12,168.06L154.66,168.46L154.34,168.06L153.7,167.62L153.84,166.7L154.06,165.99L154.7,165.1L155.23,164.87L157.54,164.73L160.06,164.79L161,165.96L161,166.3L160.73,166.79L161,166.93L161,147.67L160.87,147.6Z",
      "M148.9,166.4L147.96,166.71L147.72,166.65L148.61,166.37Z",
      "M146.21,166.87L144.89,167.01L144.36,166.81L145.85,166.73Z",
      "M140.74,168.23L139.49,168.88L139.39,168.79L140.18,168.21Z",
      "M142.18,167.52L141.55,167.6L141.26,167.48L142.78,167.12L143.88,167.06Z",
      "M89.93,202.55L89.69,203.15L89.06,202.94L89.01,202.79L89.71,202.44Z",
      "M93.21,204.91L93.26,205.37L92.97,205.47L92.73,205.32L91.75,205.41L91.87,204.6L92.78,204.71Z",
      "M77.25,160.34L75.91,161.48L75.36,161.27L74.76,161.34L75.02,160.93L75.33,159.98L75.91,159.6L76.61,158.6L77.16,158.34L77.49,158.46L77.76,159.57L77.37,159.98Z",
      "M72.62,148.96L71.78,148.96L71.13,148.67L70.73,147.43L70.82,147.15L72.33,147.15L72.62,147.84Z",
      "M65.67,147.15L65.92,147.15L65.67,147.26Z",
      "M78.69,168.1L78.96,168.27L79.68,168.24L79.44,168.62L77.52,169.79L77.21,169.4L76.85,169.41L76.32,168.65L76.22,167.52L76.92,167.23L77.9,167.24Z",
      "M99.57,191.79L99,192.1L98.69,192.6L98.33,192.69L97.97,192.71L96.57,191.98L96.24,192.01L96.55,191.66L97.44,191.4L97.92,191.04L99.05,191.38Z",
      "M139.25,170.37L138.57,171.01L138.07,170.68L138.26,170.18L139.25,169.35Z",
      "M132.98,182.35L133.65,182.84L133.82,183.16L133.01,183.35L132.12,182.76L131.54,182.9L131.33,182.62L131.33,182.43L131.93,182.29Z",
      "M151.56,165.76L150.96,165.79L151.13,165.56L152.02,165.37Z"
    ]}
  ];
  window.AtlasStationMap=Object.freeze({render});
})();
