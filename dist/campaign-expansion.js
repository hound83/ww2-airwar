/* Project the researched campaign records into the explorer, roster and mission readers. */
(() => {
  "use strict";
  const {campaigns, sources} = window.AtlasExpansion;
  const byId = Object.fromEntries(campaigns.map(c => [c.id, c]));
  const unique = values => [...new Set(values)];
  const sourceKey = id => "expansion-" + id;
  const rosters = {}, studies = {};
  const dossiers = campaigns.map(c => {
    const moments = [], facts = [], chapters = [], populations = [], cases = [];
    const sides = unique(c.episodes.flatMap(e => e.groups.map(g => g.force)));
    const ids = unique(c.episodes.flatMap(e => e.sources));
    for (const [i,e] of c.episodes.entries()) {
      const witnesses = e.sources.map(id => sources[id]);
      const mission = "./campaign-evidence.html?campaign=" + c.id + "#mission-" + (i + 1);
      const citation = witnesses.length === 1 ? witnesses[0].url : mission;
      const locator = witnesses.map(s => s.name + " · " + s.locator).join(" / ");
      const rosterIds = [];
      for (const [j,g] of e.groups.entries()) {
        const id = c.id + "-" + (i + 1) + "-" + (j + 1);
        rosterIds.push(id);
        const members = g.members.map(unit => ({unit,place:"",role:"",parent:"",source:citation,locator,
          stations:[],strength:null,serviceable:null}));
        populations.push({id,date:e.date,force:g.force,side:g.force,label:e.title + " · " + g.force,
          scope:e.action,echelon:"Participating commands, services or formations",event:e.dating ? "Reporting period" : "Dated episode",
          total:members.length,basis:"identified lower bound",members,source:citation,sourceClass:witnesses.map(s=>s.kind).join(" / "),
          locator,note:"The names identify participants at their stated level. The map pin marks the event area. Aircraft stocks and station coordinates require separate returns."});
      }
      cases.push({date:e.date,title:e.title,mission:e.action,effect:e.outcome,limit:c.gap,sources:witnesses,rosterIds});
      moments.push({date:e.date,title:e.title,place:e.place,lat:e.lat,lng:e.lng,summary:e.action,units:e.groups.map(g=>g.force+" · "+g.members.join(", ")).join(". "),
        outcome:e.outcome,sourceIds:e.sources.map(sourceKey),dating:e.dating,confidence:c.gap});
      for (const f of e.figures) {
        const fact={...f,date:e.date,sourceId:sourceKey(f.source)};
        if (f.period === e.date) delete fact.period;
        facts.push(fact);
      }
      // A shared day is one chronology selection, including both Dragoon landings.
      const last = chapters.at(-1);
      if (last?.start === e.date) {
        last.title += " / " + e.title;
        last.airRole += " " + e.action;
        last.change += " " + e.outcome;
        last.sourceIds = unique([...last.sourceIds,...e.sources.map(sourceKey)]);
      } else {
        chapters.push({id:"episode-"+(i+1),title:e.title,start:e.date,end:e.date,location:e.place,
          situation:c.objective,airRole:e.action,change:e.outcome,limits:e.dating ? "Representative date for the reporting period. " + c.gap : c.gap,sourceIds:e.sources.map(sourceKey)});
      }
    }
    const lead = c.episodes.reduce((best,e) => e.figures.length > best.figures.length ? e : best, c.episodes[0]);
    const leadSource = sources[lead.figures[0]?.source || lead.sources[0]];
    studies[c.id] = {question:c.question,answer:c.consequence,date:lead.date,episode:lead.title,label:lead.title,gap:c.gap,source:leadSource.url,locator:leadSource.name+" · "+leadSource.locator};
    rosters[c.id] = {title:c.question,summary:c.objective,geography:unique(c.episodes.map(e=>e.place)).join(" · "),
      strength:"The lists identify selected participants at different levels. No common aircraft inventory or serviceability date is available here.",
      effort:c.turningPoint,losses:c.gap,effect:c.consequence,source:leadSource.url,locator:leadSource.locator,cases,populations,
      forces:sides.map(name=>({name,coverage:unique(populations.filter(p=>p.force===name).flatMap(p=>p.members.map(m=>m.unit))).join(", ")}))};
    return {id:c.id,name:c.name,theater:c.theater,episodeMap:true,related:c.related,intervals:c.intervals,start:c.start,end:c.end,focus:{lat:c.lat,lng:c.lng},objective:c.objective,turningPoint:c.turningPoint,
      consequence:c.consequence,participants:sides,sources:ids.map(sourceKey),uncertaintyNote:c.gap,facts,chapters,moments};
  });
  const base = window.GrandAirWarV77Campaigns;
  if (base) {
    const addedSources = Object.fromEntries(Object.entries(sources).map(([id,s])=>[sourceKey(id),{title:s.name,url:s.url}]));
    window.GrandAirWarV77Campaigns = {...base,sources:{...base.sources,...addedSources},campaigns:[...base.campaigns,...dossiers]};
  }
  if (window.AtlasForceRosters) {
    window.AtlasForceRosters = {...window.AtlasForceRosters,campaigns:{...window.AtlasForceRosters.campaigns,...rosters}};
  }
  window.AtlasExpansionIndex = {byId,studies,names:Object.fromEntries(campaigns.map(c=>[c.id,c.name]))};
})();
