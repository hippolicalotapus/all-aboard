'use strict';
// Fictional-data contract for a future safety-document onboarding adapter.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SafetyDocumentModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 const TYPES=new Set(['JSA','SOP','SWP','POLICY','ORIENTATION']);
 const ROLES=new Set(['employee','foreman','superintendent','safety-admin']);
 function required(value,label){if(typeof value!=='string'||!value.trim())throw new Error('Invalid '+label);return value.trim();}
 function validateDocument(d){
  if(!d||typeof d!=='object'||Array.isArray(d))throw new Error('Invalid document');
  const id=required(d.id,'document id'),companyId=required(d.companyId,'company id');
  const title=required(d.title,'title'),revision=required(d.revision,'revision');
  if(!TYPES.has(d.type))throw new Error('Invalid document type');
  if(d.status!=='draft'&&d.status!=='approved')throw new Error('Invalid publication status');
  if(!Array.isArray(d.roles)||!d.roles.length||d.roles.some(r=>!ROLES.has(r)))throw new Error('Invalid roles');
  if(d.status==='approved'&&!d.approvedBy)throw new Error('Approved document requires approver');
  return Object.freeze({id,companyId,title,revision,type:d.type,status:d.status,roles:Object.freeze([...new Set(d.roles)]),approvedBy:d.status==='approved'?required(d.approvedBy,'approver'):null});
 }
 function assignments(documents,employee){
  const companyId=required(employee?.companyId,'company id'),role=required(employee?.role,'employee role');
  if(!ROLES.has(role))throw new Error('Invalid employee role');
  return documents.map(validateDocument).filter(d=>d.companyId===companyId&&d.status==='approved'&&d.roles.includes(role));
 }
 function acknowledge(document,employee,record){
  const d=validateDocument(document),employeeId=required(employee?.id,'employee id');
  if(d.status!=='approved'||d.companyId!==employee?.companyId||!d.roles.includes(employee?.role))throw new Error('Document not assigned');
  if(!record||record.reviewed!==true)throw new Error('Document must be reviewed before acknowledgement');
  const acknowledgedAt=required(record.acknowledgedAt,'acknowledgement time');
  if(!Number.isFinite(Date.parse(acknowledgedAt))||!/^\d{4}-\d\d-\d\dT/.test(acknowledgedAt))throw new Error('Invalid timestamp');
  return Object.freeze({companyId:d.companyId,employeeId,documentId:d.id,revision:d.revision,acknowledgedAt,kind:'document-acknowledgement'});
 }
 return Object.freeze({validateDocument,assignments,acknowledge});
});
