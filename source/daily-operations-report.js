'use strict';
// Fictional, in-memory daily-report projection; not an approval or payroll engine.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DailyOperationsReport=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const kinds=new Set(['time','production','equipment','material']);
 function str(v,n){if(typeof v!=='string'||!v.trim())throw Error('Invalid '+n);return v.trim();}
 // Record and provenance identifiers must not be silently normalized.
 // Match the repository's identifier alphabet so IDs remain stable across layers.
 function identifier(v,n){if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(v))throw Error('Invalid '+n);return v;}
 function validDate(value){return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T00:00:00Z'))&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;}
 function build(entries,context){
  if(!Array.isArray(entries)||!context)throw Error('Invalid inputs');
  const companyId=identifier(context.companyId,'company'),projectId=identifier(context.projectId,'project'),date=str(context.date,'date');
  if(!validDate(date))throw Error('Invalid date');
  const seen=new Set(),sources=new Set(),included=[],exceptions=[];
  for(const e of entries){
   if(!e||e.companyId!==companyId||e.projectId!==projectId||e.date!==date)continue;
   const id=identifier(e.id,'record id');
   if(seen.has(id)){exceptions.push({id,reason:'duplicate-record'});continue;}seen.add(id);
   if(!kinds.has(e.kind)){exceptions.push({id,reason:'unsupported-kind'});continue;}
   if(e.source==='flha-plan'||e.status!=='verified'){exceptions.push({id,reason:'not-verified-actual'});continue;}
   if(typeof e.quantity!=='number'||!Number.isFinite(e.quantity)||e.quantity<0){exceptions.push({id,reason:'invalid-quantity'});continue;}
   const sourceId=identifier(e.sourceId,'source id'),sourceKey=JSON.stringify([e.kind,sourceId]);
   if(sources.has(sourceKey)){exceptions.push({id,reason:'duplicate-source'});continue;}
   sources.add(sourceKey);
   included.push(Object.freeze({id,kind:e.kind,quantity:e.quantity,unit:str(e.unit,'unit'),sourceId}));
  }
  return Object.freeze({companyId,projectId,date,status:'draft',entries:Object.freeze(included),exceptions:Object.freeze(exceptions),requiresForemanApproval:true});
 }
 function approve(report,actor){if(!report||report.status!=='draft'||!actor||actor.role!=='foreman'||actor.companyId!==report.companyId||actor.projectId!==report.projectId)throw Error('Assigned foreman approval required');if(report.exceptions.length)throw Error('Unresolved exceptions');return Object.freeze({...report,status:'foreman-approved',approvedBy:str(actor.id,'actor id')});}
 return Object.freeze({build,approve});
});
