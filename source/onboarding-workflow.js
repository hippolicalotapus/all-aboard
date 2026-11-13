'use strict';
// Pure, fictional-data prototype. Not an authentication, signature or persistent storage service.
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./safety-document-model'):root.SafetyDocumentModel);if(typeof module==='object'&&module.exports)module.exports=api;else root.OnboardingWorkflow=api;})(typeof globalThis!=='undefined'?globalThis:this,function(model){
 if(!model)throw new Error('Safety document model required');
 function req(s,n){if(typeof s!=='string'||!s.trim())throw new Error('Invalid '+n);return s.trim();}
 function actor(a){if(!a||!['employee','foreman','superintendent','safety-admin'].includes(a.role))throw new Error('Invalid actor');req(a.id,'actor id');req(a.companyId,'company');return a;}
 function key(d){return d.id+'@'+d.revision;}
 function packageFor(documents,employee,acknowledgements){
  actor(employee);const assigned=model.assignments(documents,employee);
  const own=(acknowledgements||[]).filter(a=>a.companyId===employee.companyId&&a.employeeId===employee.id&&a.kind==='document-acknowledgement');
  const items=assigned.map(d=>Object.freeze({document:d,acknowledged:own.some(a=>a.documentId===d.id&&a.revision===d.revision)}));
  return Object.freeze({employeeId:employee.id,companyId:employee.companyId,total:items.length,completed:items.filter(i=>i.acknowledged).length,items:Object.freeze(items)});
 }
 function submitAcknowledgement(documents,employee,record,existing){
  actor(employee);if(employee.role!=='employee')throw new Error('Employee only');
  const id=req(record?.documentId,'document id'),revision=req(record?.revision,'revision');
  const assigned=model.assignments(documents,employee).find(d=>d.id===id&&d.revision===revision);
  if(!assigned)throw new Error('Unassigned or outdated document');
  const acknowledgement=model.acknowledge(assigned,employee,record);
  const records=(existing||[]).filter(a=>!(a.companyId===employee.companyId&&a.employeeId===employee.id&&a.documentId===id&&a.revision===revision));
  return Object.freeze([...records,acknowledgement]);
 }
 function roleView(viewer,employees,documents,acknowledgements){
  actor(viewer);
  if(viewer.role==='employee')return packageFor(documents,viewer,acknowledgements);
  if(viewer.role!=='safety-admin'&&viewer.role!=='superintendent')throw new Error('Onboarding overview not authorized');
  return Object.freeze((employees||[]).filter(e=>e.companyId===viewer.companyId&&e.role==='employee').map(e=>{const p=packageFor(documents,e,acknowledgements);return Object.freeze({employeeId:e.id,completed:p.completed,total:p.total});}));
 }
 function flhaReview(flha,foreman,decision){
  actor(foreman);if(foreman.role!=='foreman')throw new Error('Foreman only');
  if(!flha||flha.companyId!==foreman.companyId||flha.foremanId!==foreman.id)throw new Error('FLHA not assigned to foreman');
  if(flha.status!=='submitted')throw new Error('FLHA must be submitted');
  const revision=req(flha.revision,'FLHA revision');
  if(!['approved','returned'].includes(decision?.status))throw new Error('Invalid review decision');
  const reviewedAt=req(decision.reviewedAt,'review time');
  if(!Number.isFinite(Date.parse(reviewedAt))||!/^\d{4}-\d\d-\d\dT/.test(reviewedAt))throw new Error('Invalid review time');
  if(decision.status==='returned')req(decision.reason,'return reason');
  return Object.freeze({companyId:flha.companyId,flhaId:req(flha.id,'FLHA id'),revision,foremanId:foreman.id,status:decision.status,reviewedAt,reason:decision.status==='returned'?decision.reason:null});
 }
 return Object.freeze({packageFor,submitAcknowledgement,roleView,flhaReview});
});
