'use strict';
// Fictional-only immutable safety-document lifecycle. No uploads, authentication or durable signatures.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SafetyRevisionLifecycle=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const TYPES=new Set(['JSA','SOP','SWP','POLICY','ORIENTATION']);
 const ROLES=new Set(['employee','foreman','superintendent','safety-admin']);
 function req(v,n){if(typeof v!=='string'||!v.trim())throw new Error('Invalid '+n);return v.trim();}
 function admin(a,company){if(!a||a.role!=='safety-admin'||a.companyId!==company)throw new Error('Safety administrator required');req(a.id,'administrator id');}
 function ingest(input,actor){
  if(!input||typeof input!=='object')throw new Error('Invalid document');
  const companyId=req(input.companyId,'company id');admin(actor,companyId);
  const id=req(input.id,'document id'),title=req(input.title,'title'),content=req(input.content,'content');
  if(content.length>100000)throw new Error('Content exceeds fictional pilot limit');
  if(!TYPES.has(input.type))throw new Error('Invalid document type');
  if(!Array.isArray(input.roles)||!input.roles.length||input.roles.some(r=>!ROLES.has(r)))throw new Error('Invalid roles');
  return Object.freeze({id,companyId,title,content,type:input.type,roles:Object.freeze([...new Set(input.roles)]),revision:1,status:'draft',approvedBy:null});
 }
 function publish(d,actor){
  admin(actor,d?.companyId);if(d.status!=='draft')throw new Error('Only draft can be published');
  return Object.freeze({...d,status:'approved',approvedBy:actor.id});
 }
 function revise(d,actor,content){
  admin(actor,d?.companyId);if(d.status!=='approved')throw new Error('Only approved document can be revised');
  const next=req(content,'revision content');if(next.length>100000)throw new Error('Content exceeds fictional pilot limit');
  return Object.freeze({...d,revision:d.revision+1,content:next,status:'draft',approvedBy:null});
 }
 function assignment(d){if(d.status!=='approved')throw new Error('Draft is not assignable');return Object.freeze({id:d.id,companyId:d.companyId,title:d.title,revision:String(d.revision),type:d.type,status:d.status,roles:d.roles,approvedBy:d.approvedBy});}
 function reviewStatus(flha,decision){
  if(!flha||!decision||flha.companyId!==decision.companyId||flha.id!==decision.flhaId||String(flha.revision)!==decision.revision)throw new Error('Review revision mismatch');
  if(decision.status!=='approved'&&decision.status!=='returned')throw new Error('Invalid review status');
  return Object.freeze({...flha,status:decision.status,reviewedRevision:decision.revision,reviewedBy:decision.foremanId});
 }
 return Object.freeze({ingest,publish,revise,assignment,reviewStatus});
});
