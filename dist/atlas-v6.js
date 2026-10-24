/* European Air War Atlas v6 — audit helpers; historical modeling stays in v3–v6 data engines. */
(function(){
  'use strict';
  const H=window.AirWarV6Data;
  const D=window.LuftData;
  if(!H||!D)throw Error('v6 archival series not initialized');
  function audit(i){
    const g=H.germanAt(i);
    return {month:D.label(i),onStrength:g.strength,serviceable:g.serviceable,
      classification:g.quality,source:g.source,recordDate:g.date||null,
      warning:g.quality==='unavailable'?'No verified source or bounded interpolation for this month':
        g.quality==='recorded'?'Original German Quartermaster source point':
        'Derived interpolation, NOT an actual German monthly observation'};
  }
  function sourcesFor(page){
    const needle=page.toLowerCase();
    return H.researchTrails.filter(p=>p.from.toLowerCase().includes(needle)).map(p=>({...p}));
  }
  window.AirWarV6QA={version:'6.0',audit,
    sourceCount:()=>Object.keys(H.sourceIndex).length,
    returnCount:()=>H.germanFighterReadiness.length,
    wikiCount:()=>H.wikiTopics.length,
    chapterCount:()=>H.historyChapters.length,
    bibliographyCount:()=>H.researchTrails.length,
    sourcesFor};
  // Keep the main atlas's chart inspector, including keyboard and touch tools.
  window.AirWarAtlasV5?.enhanceAll();
})();
