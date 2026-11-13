'use strict';
// Fictional, in-memory event ledger. NOT a tamper-proof production audit log.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SafetyAuditTrail=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const TYPES=new Set(['draft-created','document-published','revision-created','employee-acknowledged','flha-reviewed']);
 function req(v,name){if(typeof v!=='string'||!v.trim())throw new Error('Invalid '+name);return v;}
 function append(events,entry){
  if(!Array.isArray(events)||!entry||!TYPES.has(entry.type))throw new Error('Invalid audit event');
  const companyId=req(entry.companyId,'company'),actorId=req(entry.actorId,'actor'),subjectId=req(entry.subjectId,'subject'),revision=req(entry.revision,'revision'),at=req(entry.at,'time');
  if(!Number.isFinite(Date.parse(at))||!/^\d{4}-\d\d-\d\dT/.test(at))throw new Error('Invalid event time');
  if(events.some(e=>e.companyId!==companyId))throw new Error('Mixed company ledger');
  if(entry.type==='flha-reviewed'&&!['approved','returned'].includes(entry.decision))throw new Error('Invalid review decision');
  const item=Object.freeze({sequence:events.length+1,type:entry.type,companyId,actorId,subjectId,revision,at,decision:entry.type==='flha-reviewed'?entry.decision:null});
  return Object.freeze([...events,item]);
 }
 function forViewer(events,viewer){
  if(!viewer||!['safety-admin','superintendent'].includes(viewer.role))throw new Error('Audit view forbidden');
  req(viewer.companyId,'company');return Object.freeze(events.filter(e=>e.companyId===viewer.companyId));
 }
 return Object.freeze({append,forViewer});
});
