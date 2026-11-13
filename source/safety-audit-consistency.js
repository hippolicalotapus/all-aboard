'use strict';
// Fictional-only consistency checks. Server-side authorization and durable audit storage required in production.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SafetyAuditConsistency=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function key(e){return [e.companyId,e.type,e.actorId,e.subjectId,e.revision].join('|');}
 function validate(events,documents,acknowledgements,history=[]){
  if(!Array.isArray(events)||!Array.isArray(documents)||!Array.isArray(acknowledgements)||!Array.isArray(history))throw new Error('Invalid consistency inputs');
  const problems=[],seen=new Set();
  events.forEach((e,i)=>{
   if(e.sequence!==i+1)problems.push('Invalid event sequence at '+(i+1));
   if(!e.companyId||!e.actorId||!e.subjectId||!e.revision)problems.push('Incomplete event at '+(i+1));
   if(e.type==='employee-acknowledged'){
    const id=key(e);
    if(seen.has(id))problems.push('Duplicate acknowledgement event '+id);seen.add(id);
    if(!acknowledgements.some(a=>a.kind==='document-acknowledgement'&&a.companyId===e.companyId&&a.employeeId===e.actorId&&a.documentId===e.subjectId&&a.revision===e.revision))problems.push('Missing acknowledgement record '+id);
   }
   if(e.type==='document-published'&&![...documents,...history].some(d=>d.companyId===e.companyId&&d.id===e.subjectId&&String(d.revision)===e.revision&&d.status==='approved'))problems.push('Published revision not current '+e.subjectId+'@'+e.revision);
  });
  return Object.freeze({valid:problems.length===0,problems:Object.freeze(problems)});
 }
 function canReview(flha,foreman,prior){
  if(!flha||!foreman||foreman.role!=='foreman'||flha.companyId!==foreman.companyId||flha.foremanId!==foreman.id||flha.status!=='submitted')return false;
  return !(prior||[]).some(r=>r.companyId===flha.companyId&&r.flhaId===flha.id&&r.revision===flha.revision);
 }
 return Object.freeze({validate,canReview});
});
