'use strict';
// Fictional, read-only foreman safety report. Never approves an FLHA or authorizes work.
(function(root,factory){const api=factory(root.FLHAWorkflow||(typeof require==='function'?require('./flha-workflow'):null));if(typeof module==='object'&&module.exports)module.exports=api;else root.FLHAForemanReport=api;})(typeof globalThis!=='undefined'?globalThis:this,function(flha){
 const ID=/^[A-Za-z0-9_-]{1,64}$/;
 function ident(value,label){if(typeof value!=='string'||!ID.test(value))throw Error('Invalid '+label);return value;}
 function validDay(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
 function build(states,scope,actor){
  if(!flha||typeof flha.summary!=='function'||typeof flha.verify!=='function')throw Error('FLHA model unavailable');
  if(!Array.isArray(states)||!scope||!actor)throw Error('Invalid report inputs');
  const companyId=ident(scope.companyId,'company'),projectId=ident(scope.projectId,'project'),periodId=ident(scope.periodId,'period');
  if(!validDay(scope.date))throw Error('Invalid report date');
  const foreman=actor.role==='foreman'&&actor.projectId===projectId;
  const superintendent=actor.role==='superintendent'&&Array.isArray(actor.projectIds)&&actor.projectIds.includes(projectId);
  if(actor.companyId!==companyId||!(foreman||superintendent)||!ID.test(actor.id||''))throw Error('Report access denied');
  if(!Array.isArray(scope.workerIds)||scope.workerIds.length===0||scope.workerIds.length>200)throw Error('Crew assignments required');
  const workers=scope.workerIds.map(x=>ident(x,'crew worker'));
  if(new Set(workers).size!==workers.length)throw Error('Duplicate assigned worker');
  if(foreman&&(!Array.isArray(actor.crewWorkerIds)||workers.some(w=>!actor.crewWorkerIds.includes(w))))throw Error('Unassigned worker access denied');
  const roster=new Set(workers),observed=new Map();
  for(const state of states){
   // Reject foreign/unassigned documents rather than silently hiding potentially mixed sensitive data.
   if(!state||!state.context)throw Error('Malformed FLHA record');
   const c=state.context;
   if(c.companyId!==companyId||c.projectId!==projectId||c.periodId!==periodId||c.date!==scope.date||!roster.has(c.workerId))throw Error('FLHA scope mismatch');
   if(observed.has(c.workerId))throw Error('Duplicate worker FLHA for work period');
   flha.verify(state);observed.set(c.workerId,state);
  }
  const entries=workers.map(workerId=>{
   const state=observed.get(workerId);
   if(!state)return Object.freeze({workerId,status:'missing',materialRevision:null,hazardCount:0,unresolvedHazards:null,requiresForemanReview:false,needsAttention:true});
   const value=flha.summary(state,actor);
   const currentApproval=value.status==='foreman-approved'&&value.foremanReviewedRevision===value.materialRevision&&value.workerReviewedRevision===value.materialRevision;
   const needsAttention=!currentApproval||value.unresolvedHazards>0;
   return Object.freeze({workerId,status:value.status,materialRevision:value.materialRevision,hazardCount:value.hazardCount,unresolvedHazards:value.unresolvedHazards,requiresForemanReview:value.requiresForemanReview,needsAttention});
  });
  const counts={missing:0,draft:0,returned:0,'review-pending':0,'foreman-approved':0};
  entries.forEach(x=>{if(!Object.hasOwn(counts,x.status))throw Error('Unexpected FLHA status');counts[x.status]++;});
  const attention=entries.filter(x=>x.needsAttention);
  return Object.freeze({companyId,projectId,periodId,date:scope.date,status:'draft-safety-report',
   entries:Object.freeze(entries),counts:Object.freeze(counts),attention:Object.freeze(attention),
   requiresHumanReview:true,workAuthorized:false,approved:false,
   note:'Read-only prototype. Current FLHA sign-off is not authorization to work.'});
 }
 return Object.freeze({build});
});
