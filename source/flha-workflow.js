'use strict';
// Fictional in-memory FLHA workflow only. NOT a work permit, production audit, or safety clearance.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FLHAWorkflow=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const ID=/^[A-Za-z0-9_-]{1,64}$/;
 function ident(v,n){if(typeof v!=='string'||!ID.test(v))throw Error('Invalid '+n);return v;}
 function words(v,n,min=1){if(typeof v!=='string'||v.trim().length<min||v.length>2000)throw Error('Invalid '+n);return v.trim();}
 function stamp(v){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(v)||!Number.isFinite(Date.parse(v))||new Date(v).toISOString()!==v.replace('Z','.000Z'))throw Error('Invalid timestamp');return v;}
 function day(v){if(typeof v!=='string'||!/^\d{4}-\d\d-\d\d$/.test(v)||!Number.isFinite(Date.parse(v+'T00:00:00Z'))||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error('Invalid work date');return v;}
 function score(v){if(!Number.isInteger(v)||v<1||v>5)throw Error('Invalid risk rating');return v;}
 function start(c){if(!c)throw Error('Missing context');const context=Object.freeze({companyId:ident(c.companyId,'company'),projectId:ident(c.projectId,'project'),workerId:ident(c.workerId,'worker'),periodId:ident(c.periodId,'period'),date:day(c.date)});return Object.freeze({context,hazards:Object.freeze([]),events:Object.freeze([]),materialRevision:0,workerReviewedRevision:null,foremanReviewedRevision:null,status:'draft',revision:1});}
 function verify(s){if(!s||!s.context||!Array.isArray(s.events)||!Array.isArray(s.hazards)||s.revision!==s.events.length+1)throw Error('Invalid FLHA state');const ids=new Set();s.events.forEach((e,i)=>{if(e.sequence!==i+1||ids.has(e.actionId)||e.companyId!==s.context.companyId||e.projectId!==s.context.projectId)throw Error('Invalid audit sequence');ids.add(e.actionId);});return true;}
 function apply(s,actor,cmd){verify(s);if(!cmd||!['add-hazard','set-controls','worker-review','foreman-approve','return-for-correction','no-changes'].includes(cmd.type))throw Error('Unsupported FLHA action');
  const foreman=['foreman-approve','return-for-correction'].includes(cmd.type),role=foreman?'foreman':'employee';
  if(!actor||actor.role!==role||actor.companyId!==s.context.companyId||actor.projectId!==s.context.projectId||!ID.test(actor.id||'')||(foreman?actor.id===s.context.workerId:actor.id!==s.context.workerId))throw Error('Role or project access denied');
  ident(cmd.actionId,'action ID');const fingerprint=JSON.stringify([actor.id,actor.role,cmd]);const old=s.events.find(e=>e.actionId===cmd.actionId);if(old){if(old.fingerprint!==fingerprint)throw Error('Action ID conflict');return s;}
  if(!Number.isSafeInteger(cmd.expectedRevision)||cmd.expectedRevision!==s.revision)throw Error('Revision conflict');
  let updates={},detail=null;
  if(cmd.type==='add-hazard'){
   if(!['draft','returned','review-pending','foreman-approved'].includes(s.status))throw Error('Invalid FLHA status');ident(cmd.hazardId,'hazard');if(s.hazards.some(h=>h.id===cmd.hazardId))throw Error('Duplicate hazard');
   detail={at:stamp(cmd.at),hazardId:cmd.hazardId};const hazard=Object.freeze({id:cmd.hazardId,task:words(cmd.task,'task'),description:words(cmd.description,'hazard',5),severity:score(cmd.severity),likelihood:score(cmd.likelihood),controls:Object.freeze([]),residualSeverity:null,residualLikelihood:null});
   updates={hazards:Object.freeze([...s.hazards,hazard]),materialRevision:s.materialRevision+1,status:'draft',workerReviewedRevision:null,foremanReviewedRevision:null};
  }else if(cmd.type==='set-controls'){
   const index=s.hazards.findIndex(h=>h.id===cmd.hazardId);if(index<0)throw Error('Unknown hazard');if(!Array.isArray(cmd.controls)||!cmd.controls.length||cmd.controls.length>20)throw Error('Controls required');
   const controls=Object.freeze(cmd.controls.map(v=>words(v,'control',5)));const updated=Object.freeze({...s.hazards[index],controls,residualSeverity:score(cmd.residualSeverity),residualLikelihood:score(cmd.residualLikelihood)});
   detail={at:stamp(cmd.at),hazardId:cmd.hazardId,before:s.hazards[index],after:updated};updates={hazards:Object.freeze(s.hazards.map((h,i)=>i===index?updated:h)),materialRevision:s.materialRevision+1,status:'draft',workerReviewedRevision:null,foremanReviewedRevision:null};
  }else if(cmd.type==='worker-review'){
   if(!['draft','returned'].includes(s.status)||cmd.reviewedConditions!==true||!s.hazards.length||s.hazards.some(h=>!h.controls.length||h.residualSeverity===null))throw Error('Incomplete hazard and controls review');
   updates={status:'review-pending',workerReviewedRevision:s.materialRevision};
  }else if(cmd.type==='foreman-approve'){
   if(s.status!=='review-pending'||s.workerReviewedRevision!==s.materialRevision||cmd.reviewedControls!==true)throw Error('Exact revision requires worker and foreman review');
   // This conservative prototype does not approve high residual-risk scores. No site-specific matrix is assumed.
   if(s.hazards.some(h=>h.residualSeverity*h.residualLikelihood>=15))throw Error('Elevated risk requires escalation outside this prototype');
   updates={status:'foreman-approved',foremanReviewedRevision:s.materialRevision};
  }else if(cmd.type==='return-for-correction'){
   if(s.status!=='review-pending')throw Error('Only submitted assessment can be returned');detail={reason:words(cmd.reason,'return reason',5)};updates={status:'returned',workerReviewedRevision:null};
  }else{
   if(s.status!=='foreman-approved'||s.foremanReviewedRevision!==s.materialRevision||cmd.reviewedConditions!==true)throw Error('No Changes requires current reviewed assessment');
   detail={noMaterialChange:true};
  }
  const event=Object.freeze({sequence:s.revision,actionId:cmd.actionId,type:cmd.type,actorId:actor.id,companyId:s.context.companyId,projectId:s.context.projectId,materialRevision:updates.materialRevision||s.materialRevision,fingerprint,detail:Object.freeze(detail||{})});
  return Object.freeze({...s,...updates,events:Object.freeze([...s.events,event]),revision:s.revision+1});
 }
 function summary(s,actor){verify(s);const c=s.context;const allowed=actor&&actor.companyId===c.companyId&&(actor.projectId===c.projectId||Array.isArray(actor.projectIds)&&actor.projectIds.includes(c.projectId))&&(['foreman','superintendent','safety-admin'].includes(actor.role)||actor.role==='employee'&&actor.id===c.workerId);if(!allowed)throw Error('Summary access denied');return Object.freeze({companyId:c.companyId,projectId:c.projectId,periodId:c.periodId,status:s.status,materialRevision:s.materialRevision,workerReviewedRevision:s.workerReviewedRevision,foremanReviewedRevision:s.foremanReviewedRevision,hazardCount:s.hazards.length,requiresForemanReview:s.status==='review-pending',unresolvedHazards:s.hazards.filter(h=>!h.controls.length||h.residualSeverity*h.residualLikelihood>=15).length,workAuthorized:false});}
 return Object.freeze({start,apply,summary,verify});
});
