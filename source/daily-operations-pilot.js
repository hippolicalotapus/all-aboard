'use strict';
// Fictional role-scoped operational views. Backend authorization required before production.
(function(root,factory){const api=factory(root.DailyOperationsReport||(typeof require==='function'?require('./daily-operations-report'):null));if(typeof module==='object'&&module.exports)module.exports=api;else root.DailyOperationsPilot=api;})(typeof globalThis!=='undefined'?globalThis:this,function(reportModel){
 function view(report,actor){
  if(!report||!actor||actor.companyId!==report.companyId)throw Error('Company access denied');
  const role=actor.role;
  if(role==='foreman'&&actor.projectId===report.projectId)return {role,canApprove:report.status==='draft'&&!report.exceptions.length,entries:report.entries,exceptions:report.exceptions,status:report.status};
  if(role==='superintendent'&&Array.isArray(actor.projectIds)&&actor.projectIds.includes(report.projectId))return {role,canApprove:false,entries:report.entries,exceptions:report.exceptions,status:report.status};
  if(['accounting','payroll','management'].includes(role)&&Array.isArray(actor.projectIds)&&actor.projectIds.includes(report.projectId))return {role,canApprove:false,entries:report.entries,exceptions:report.exceptions,status:report.status};
  throw Error('Role or project access denied');
 }
 function resolve(entries,id,actor){
  if(!actor||actor.role!=='foreman'||!Array.isArray(entries))throw Error('Foreman required');
  const match=entries.find(x=>x.id===id);
  if(!match||match.companyId!==actor.companyId||match.projectId!==actor.projectId)throw Error('Record access denied');
  return entries.filter(x=>x!==match);
 }
 function approve(report,actor){view(report,actor);return reportModel.approve(report,actor);}
 return Object.freeze({view,resolve,approve});
});
