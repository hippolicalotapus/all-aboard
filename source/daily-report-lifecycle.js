'use strict';
// Fictional in-memory lifecycle. Production requires authenticated API and durable event storage.
(function(root,factory){const model=factory(root.DailyOperationsReport||(typeof require==='function'?require('./daily-operations-report'):null));if(typeof module==='object'&&module.exports)module.exports=model;else root.DailyReportLifecycle=model;})(typeof globalThis!=='undefined'?globalThis:this,function(reports){
 function check(state){if(!state||!Array.isArray(state.events)||!Array.isArray(state.entries)||!state.context)throw Error('Invalid lifecycle state');}
 function authorized(state,actor,roles){if(!actor||!roles.includes(actor.role)||actor.companyId!==state.context.companyId||actor.projectId!==state.context.projectId)throw Error('Role or project access denied');}
 function start(entries,context){const report=reports.build(entries,context);return Object.freeze({context:Object.freeze({...context}),entries:Object.freeze(entries.map(e=>Object.freeze({...e}))),report,events:Object.freeze([]),revision:1});}
 function action(state,actor,command){
  check(state);if(!command||!['exclude','correct','approve','reopen'].includes(command.type))throw Error('Unsupported action');
  authorized(state,actor,['foreman']);
  if(typeof actor.id!=='string'||!actor.id.trim())throw Error('Actor identity required');
  if(typeof command.actionId!=='string'||!command.actionId.trim())throw Error('Action ID required');
  const prior=state.events.find(e=>e.actionId===command.actionId);
  if(prior){if(prior.actorId!==actor.id||prior.type!==command.type||prior.recordId!==(command.recordId||null)||prior.newQuantity!==(command.type==='correct'?command.quantity:null)||prior.reason!==(command.reason||null))throw Error('Action ID conflict');return state;}
  if(!Number.isSafeInteger(command.expectedRevision)||command.expectedRevision!==state.revision)throw Error('Report revision conflict');
  if(command.type==='reopen'){
   if(state.report.status!=='foreman-approved')throw Error('Only approved reports can be reopened');
   if(typeof command.reason!=='string'||command.reason.trim().length<5)throw Error('Reopen reason required');
   const event=Object.freeze({sequence:state.events.length+1,actionId:command.actionId,type:'reopen',actorId:actor.id,companyId:state.context.companyId,projectId:state.context.projectId,reportRevision:state.revision,recordId:null,reason:command.reason,oldQuantity:null,newQuantity:null});
   const draft=reports.build(state.entries,state.context);
   return Object.freeze({context:state.context,entries:state.entries,report:draft,events:Object.freeze([...state.events,event]),revision:state.revision+1});
  }
  if(state.report.status!=='draft')throw Error('Approved report is immutable; reopen with reason before correction');
  if(command.type!=='approve'&&(typeof command.reason!=='string'||command.reason.trim().length<5))throw Error('Correction or exclusion reason required');
  let entries=state.entries;
  if(command.type!=='approve'){
   if(typeof command.recordId!=='string'||!command.recordId.trim())throw Error('Record ID required');
   const current=entries.find(e=>e.id===command.recordId&&e.companyId===state.context.companyId&&e.projectId===state.context.projectId&&e.date===state.context.date);
   if(!current)throw Error('Record access denied');
   if(command.type==='exclude')entries=entries.filter(e=>e!==current);
   else {
    if(typeof command.quantity!=='number'||!Number.isFinite(command.quantity)||command.quantity<0)throw Error('Invalid corrected quantity');
    if(current.status!=='verified'||current.source==='flha-plan')throw Error('Unverified record cannot be corrected into actual');
    entries=entries.map(e=>e===current?Object.freeze({...e,quantity:command.quantity}):e);
   }
  }
  const report=command.type==='approve'?reports.approve(state.report,actor):reports.build(entries,state.context);
  const event=Object.freeze({sequence:state.events.length+1,actionId:command.actionId,type:command.type,actorId:actor.id,companyId:state.context.companyId,projectId:state.context.projectId,reportRevision:state.revision,recordId:command.recordId||null,reason:command.reason||null,oldQuantity:command.type==='correct'?state.entries.find(e=>e.id===command.recordId).quantity:null,newQuantity:command.type==='correct'?command.quantity:null});
  return Object.freeze({context:state.context,entries:Object.freeze([...entries]),report,events:Object.freeze([...state.events,event]),revision:state.revision+1});
 }
 function verifyAudit(state){
  check(state);let expected=1;const ids=new Set();for(const e of state.events){if(!e||e.sequence!==expected++||typeof e.actionId!=='string'||typeof e.actorId!=='string'||!e.actorId.trim()||ids.has(e.actionId)||e.companyId!==state.context.companyId||e.projectId!==state.context.projectId||!['exclude','correct','approve','reopen'].includes(e.type))throw Error('Audit integrity failed');ids.add(e.actionId);}if(state.revision!==state.events.length+1)throw Error('Audit revision mismatch');return true;
 }
 function view(state,actor){check(state);if(!actor||actor.companyId!==state.context.companyId)throw Error('Company access denied');
  const permitted=actor.role==='foreman'&&actor.projectId===state.context.projectId||['superintendent','accounting','payroll','management'].includes(actor.role)&&Array.isArray(actor.projectIds)&&actor.projectIds.includes(state.context.projectId);
  if(!permitted)throw Error('Role or project access denied');
  verifyAudit(state);return Object.freeze({report:state.report,events:Object.freeze([...state.events]),canEdit:actor.role==='foreman'&&state.report.status==='draft',canReopen:actor.role==='foreman'&&state.report.status==='foreman-approved'});
 }
 return Object.freeze({start,action,view,verifyAudit});
});
