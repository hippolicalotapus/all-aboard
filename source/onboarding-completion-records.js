'use strict';
// Fictional audit projection; callers must authenticate and authorize on a real server.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.OnboardingCompletionRecords=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 function required(v,n){if(typeof v!=='string'||!v.trim())throw new Error('Invalid '+n);return v;}
 function completion(viewer,employee,documents,acknowledgements){
  if(!viewer||!employee||viewer.companyId!==employee.companyId)throw new Error('Company mismatch');
  if(viewer.role==='employee'&&viewer.id!==employee.id)throw new Error('Not own record');
  if(!['employee','safety-admin','superintendent'].includes(viewer.role))throw new Error('Unauthorized completion view');
  const assigned=(documents||[]).filter(d=>d.companyId===employee.companyId&&d.status==='approved'&&Array.isArray(d.roles)&&d.roles.includes(employee.role));
  const records=assigned.map(d=>{const match=(acknowledgements||[]).find(a=>a.kind==='document-acknowledgement'&&a.companyId===employee.companyId&&a.employeeId===employee.id&&a.documentId===d.id&&a.revision===d.revision);
   return Object.freeze({documentId:required(d.id,'document'),revision:required(d.revision,'revision'),acknowledged:!!match,acknowledgedAt:match?match.acknowledgedAt:null});
  });
  return Object.freeze({employeeId:employee.id,companyId:employee.companyId,completed:records.filter(r=>r.acknowledged).length,total:records.length,records:Object.freeze(records)});
 }
 return Object.freeze({completion});
});
