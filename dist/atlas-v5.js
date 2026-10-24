/* European Air War Atlas v5: chart inspection and dated event overlays.
   Draws on the existing v3/v4 series registry; never changes simulation data. */
(function(){
  'use strict';
  const registry=window.AirWarGraphRegistry;
  const historical=window.LuftV4Data;
  const base=window.LuftData;
  let showMarkers=true;
  const attached=new WeakMap();
  const fmt=(n,d=0)=>Number(n).toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const names={
    'experience-chart':['75+ combat encounters','200+ encounters','Tracked cohort active'],
    'claims-chart':['1+ credited claim','5+ credited claims','20+ credited claims'],
    'service-chart':['Mean sorties','Median sorties'],
    'loss-chart':['Simulated pilot casualty rate'],
    'cohort-chart':['Tracked cohort active'],
    'force-chart':['Simulated pilots on duty','Historically constrained/model population'],
    'aircraft-chart':['Modeled serviceable German fighter aircraft'],
    'production-chart':['Production / acceptance','German fighter write-offs']
  };
  const countKeys={
    'experience-chart':['experienced75','experienced200','cohort'],
    'claims-chart':['claim1','claim5','claim20'],
    'cohort-chart':['cohort']
  };
  const labelOf=r=>r.label||r.month||(r.i!=null?base.label(r.i):'Unknown month');
  const valid=v=>typeof v==='number'&&Number.isFinite(v);
  function seriesValue(s,r){return (s.value||s.f)(r);}
  function describe(id,r,s,j,opts,origin){
    const value=seriesValue(s,r);
    if(!valid(value))return null;
    const decimals=opts.percent?1:((Math.abs(value)%1)>0?2:0);
    let amount=fmt(value,decimals)+(opts.percent?'%':'');
    const countKey=countKeys[id]?.[j];
    if(countKey&&valid(r[countKey]))amount+=' · '+fmt(r[countKey])+' pilots';
    let evidence=origin==='simulator'?'Scenario calculation':'Reporting basis in chart notes';
    const d=s.detail?.(r);
    if(d?.quality){
      evidence={recorded:'Recorded source point',documented:'Recorded source point',
        'recorded-secondary':'Recorded / compiled from wartime records',
        'estimated-high':'Nearby-point interpolation · higher confidence',
        'estimated-low':'Estimate · lower confidence',unavailable:'Unavailable',
        interpolated:'Interpolation',reference:'Sourced snapshot',derived:'Derived from source' }[d.quality]||d.quality;
    }else if(s.source){
      evidence='Recorded · '+(historical?.SOURCES?.[s.source]?.short||s.source);
    }else if(r.rateQuality){
      evidence=r.rateQuality==='documented'?'Source-based input · simulation':'Modeled assumption';
    }else if(r.wq&&j===1){
      evidence=r.wq==='unavailable'?'Unavailable':'Estimated / allocated from other totals';
    }
    return {name:s.name||names[id]?.[j]||'Series '+(j+1),amount,evidence,color:s.color};
  }
  function dimensions(el,id){
    const newer=id.startsWith('v4-')||id.startsWith('v5-')||id.startsWith('v6-');
    const vb=el.viewBox?.baseVal;
    const w=vb?.width|| (newer?980:600);
    return {w,l:newer?62:52,r:newer?24:18,y1:newer?18:12,y2:newer?216:226};
  }
  function svgLine(className){
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('class',className);line.setAttribute('pointer-events','none');
    return line;
  }
  function applyMarkers(el,id,entry,geom){
    el.querySelectorAll('.atlas-event-marker').forEach(x=>x.remove());
    if(!showMarkers||!historical?.milestones?.length||entry.rows.length<2)return;
    const first=entry.rows[0].i,last=entry.rows.at(-1).i;
    if(first==null||last==null||first===last)return;
    historical.milestones.filter(m=>m.i>=first&&m.i<=last).forEach(m=>{
      const k=entry.rows.findIndex(row=>row.i===m.i);
      if(k<0)return;
      const x=geom.l+(geom.w-geom.l-geom.r)*k/(entry.rows.length-1);
      const line=svgLine('atlas-event-marker');
      for(const [name,value] of Object.entries({x1:x,x2:x,y1:geom.y1,y2:geom.y2}))line.setAttribute(name,String(value));
      const title=document.createElementNS('http://www.w3.org/2000/svg','title');
      title.textContent=m.title+' · '+m.detail;line.appendChild(title);el.appendChild(line);
    });
  }
  function enhance(id){
    const entry=registry?.get(id),el=document.getElementById(id);
    if(!el||!entry?.rows?.length||!el.getBoundingClientRect)return;
    // v3 rewrites the SVG contents on each recompute; registered handlers only
    // once per element, while their referenced data are read live each time.
    let state=attached.get(el);
    if(!state){
      const parent=el.parentElement;
      if(!parent)return;
      parent.classList.add('atlas-chart-anchor');
      const tip=document.createElement('div');tip.className='atlas-tooltip';
      tip.setAttribute('role','status');tip.setAttribute('aria-live','polite');tip.hidden=true;
      parent.appendChild(tip);
      el.setAttribute('tabindex','0');
      el.setAttribute('aria-keyshortcuts','ArrowLeft ArrowRight');
      state={tip,current:0,cross:null};attached.set(el,state);
      const hide=()=>{tip.hidden=true;if(state.cross)state.cross.style.display='none';};
      const move=(x,indexOverride)=>{
        const data=registry?.get(id);if(!data?.rows?.length)return;
        const rect=el.getBoundingClientRect(),geom=dimensions(el,id);
        const frac=(x-rect.left)/Math.max(1,rect.width),pos=frac*geom.w;
        const fracData=(pos-geom.l)/(geom.w-geom.l-geom.r);
        const index=indexOverride??Math.max(0,Math.min(data.rows.length-1,Math.round(fracData*(data.rows.length-1))));
        state.current=index;
        const r=data.rows[index],present=data.series.map((s,j)=>describe(id,r,s,j,data.opts||{},data.origin)).filter(Boolean);
        if(!present.length){hide();return;}
        const xSvg=geom.l+(geom.w-geom.l-geom.r)*(data.rows.length===1?.5:index/(data.rows.length-1));
        if(!state.cross||!state.cross.isConnected){state.cross=svgLine('atlas-crosshair');el.appendChild(state.cross);}
        for(const [key,val] of Object.entries({x1:xSvg,x2:xSvg,y1:geom.y1,y2:geom.y2}))state.cross.setAttribute(key,String(val));
        state.cross.style.display='';
        const sourceLine=data.origin==='simulator'?'Illustrative simulation · not individual service records':
          'Figures follow the source and confidence definitions shown in the panels';
        const event=historical?.milestones?.find(x=>x.i===r.i);
        tip.innerHTML='<strong class="atlas-tooltip-title">'+esc(labelOf(r))+'</strong>'+
          (event?'<p class="atlas-tooltip-event">◆ '+esc(event.title)+'</p>':'')+
          present.map(p=>'<div class="atlas-tooltip-row"><i style="background:'+esc(p.color||'#c3b389')+'"></i><span>'+esc(p.name)+'</span><b>'+esc(p.amount)+'</b><small>'+esc(p.evidence)+'</small></div>').join('')+
          '<span class="atlas-tooltip-foot">'+esc(sourceLine)+'</span>';
        tip.hidden=false;
        const parentRect=parent.getBoundingClientRect();
        const overlayX=rect.left-parentRect.left+(xSvg/geom.w)*rect.width;
        const maxX=Math.max(8,parentRect.width-302);
        tip.style.left=Math.min(maxX,Math.max(8,overlayX-135))+'px';
        tip.style.top=Math.max(0,rect.top-parentRect.top+8)+'px';
      };
      el.addEventListener('pointermove',e=>move(e.clientX));
      el.addEventListener('pointerleave',e=>{if(e.pointerType!=='touch')hide();});
      el.addEventListener('click',e=>move(e.clientX));
      el.addEventListener('focus',()=>move(el.getBoundingClientRect().left,Math.min(state.current,(registry?.get(id)?.rows.length||1)-1)));
      el.addEventListener('blur',hide);
      el.addEventListener('keydown',e=>{
        if(e.key==='Escape'){hide();return;}
        if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
          e.preventDefault();const n=registry?.get(id)?.rows.length||1;
          move(el.getBoundingClientRect().left,Math.max(0,Math.min(n-1,state.current+(e.key==='ArrowRight'?1:-1))));
        }
      });
    }
    const g=dimensions(el,id);
    applyMarkers(el,id,entry,g);
    // Marker rerenders replace elements but do not invalidate tooltip listeners.
  }
  function enhanceAll(){
    if(!registry)return;
    registry.forEach((_,id)=>enhance(id));
  }
  function setMarkers(value){showMarkers=!!value;enhanceAll();}
  window.AirWarAtlasV5={enhance,enhanceAll,setMarkers,markers:()=>showMarkers,
    registrySize:()=>registry?.size||0};
  // Correct the legacy claim percentage caption without altering its data.
  const graph=document.getElementById('claims-chart');
  if(graph){
    const caption=graph.parentElement?.querySelector('.chart-summary');
    if(caption)caption.textContent='Share of active simulated pilots with 1+, 5+ and 20+ cumulative credited victory claims. Hover or tap for percentages and absolute counts.';
  }
  enhanceAll();
})();
