'use strict';
// Fictional in-memory lifecycle. Production requires authenticated API and durable event storage.
(function(root,factory){const model=factory(root.DailyOperationsReport||(typeof require==='function'?require('./daily-operations-report'):null));if(typeof module==='object'&&module.exports)module.exports=model;else root.DailyReportLifecycle=model;})(typeof globalThis!=='undefined'?globalThis:this,function(reports){
 function check(state){if(!state||!Array.isArray(state.events)||!Array.isArray(state.entries)||!state.context)throw Error('Invalid lifecycle state');}
 function authorized(state,actor,roles){if(!actor||!roles.includes(actor.role)||actor.companyId!==state.context.companyId||actor.projectId!==state.context.projectId)throw Error('Role or project access denied');}
 function start(entries,context){const report=reports.build(entries,context);return Object.freeze({context:Object.freeze({...context}),entries:Object.freeze(entries.map(e=>Object.freeze({...e}))),report,events:Object.freeze([]),revision:1});}
 function action(state,actor,command){
  check(state);if(!command||!['exclude','correct','approve'].includes(command.type))throw Error('Unsupported action');
  authorized(state,actor,['foreman']);
  if(state.report.status!=='draft')throw Error('Approved report is immutable; start a new correction revision');
  if(state.events.some(e=>e.actionId===command.actionId))return state; // idempotent replay
  if(typeof command.actionId!=='string'||!command.actionId.trim())throw Error('Action ID required');
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
  const event=Object.freeze({sequence:state.events.length+1,actionId:command.actionId,type:command.type,actorId:actor.id,companyId:state.context.companyId,projectId:state.context.projectId,reportRevision:state.revision,recordId:command.recordId||null,oldQuantity:command.type==='correct'?state.entries.find(e=>e.id===command.recordId).quantity:null,newQuantity:command.type==='correct'?command.quantity:null});
  return Object.freeze({context:state.context,entries:Object.freeze([...entries]),report,events:Object.freeze([...state.events,event]),revision:state.revision});
 }
 function view(state,actor){check(state);if(!actor||actor.companyId!==state.context.companyId)throw Error('Company access denied');
  const permitted=actor.role==='foreman'&&actor.projectId===state.context.projectId||['superintendent','accounting','payroll','management'].includes(actor.role)&&Array.isArray(actor.projectIds)&&actor.projectIds.includes(state.context.projectId);
  if(!permitted)throw Error('Role or project access denied');
  return Object.freeze({report:state.report,events:Object.freeze([...state.events]),canEdit:actor.role==='foreman'&&state.report.status==='draft'});
 }
 return Object.freeze({start,action,view});
});
