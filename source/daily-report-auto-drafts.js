'use strict';
// Offline fictional-data draft preparation. A caller must explicitly invoke it;
// this is not a timer, background scheduler, employer approval or payroll export.
const lifecycle=require('./daily-report-lifecycle');
const identifier=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(v);
function generate(entries,selection){
 if(!Array.isArray(entries)||!selection||!identifier(selection.companyId)||
    !Array.isArray(selection.projectIds)||selection.projectIds.length===0||
    selection.projectIds.some(id=>!identifier(id))||
    new Set(selection.projectIds).size!==selection.projectIds.length)
  throw Error('Invalid generation scope');
 const scopes=new Map(),projects=new Set(selection.projectIds);
 for(const record of entries){
  if(!record||record.companyId!==selection.companyId||!projects.has(record.projectId))continue;
  // Validate each in-scope row before grouping. Malformed dates, IDs and
  // provenance must never disappear silently from a generated report.
  if(typeof record.date!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(record.date)||
     !Number.isFinite(Date.parse(record.date+'T00:00:00Z'))||
     new Date(record.date+'T00:00:00Z').toISOString().slice(0,10)!==record.date)
   throw Error('Invalid source date');
  if(!identifier(record.id))throw Error('Invalid record id');
  if(typeof record.sourceId!=='string'||!identifier(record.sourceId))throw Error('Invalid source id');
  const key=JSON.stringify([record.projectId,record.date]);
  if(!scopes.has(key))scopes.set(key,[]);
  scopes.get(key).push(record);
 }
 return Object.freeze([...scopes].sort(([a],[b])=>a.localeCompare(b)).map(([key,group])=>{
  const [projectId,date]=JSON.parse(key);
  const context=Object.freeze({companyId:selection.companyId,projectId,date});
  return Object.freeze({context,state:lifecycle.start(group,context)});
 }));
}
module.exports=Object.freeze({generate});
