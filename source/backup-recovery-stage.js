'use strict';
// V40 recovery staging: validates every section before returning any replacement data.
// This module never touches storage. Applying a recovery remains a separate, explicit action.
const BackupRecoveryStage=(()=>{
 function stage(raw,current,workflowStore,reviewStore,model){
  const result={ready:false,replacements:{},impact:null,errors:[],writes:false};
  const impact=BackupRecoveryPlan.plan(raw,current,workflowStore,reviewStore,model);
  result.impact=impact;
  if(!impact.safeToRestore){result.errors=[...impact.errors];if(!result.errors.length)result.errors=['bundle: no supported sections'];return result;}
  try{
   if(Object.hasOwn(raw,'workflow'))result.replacements.workflow=workflowStore.validate(raw.workflow,model);
   if(Object.hasOwn(raw,'review'))result.replacements.review=reviewStore.validate(raw.review,model);
   result.ready=true;
  }catch(_){
   result.replacements={};
   result.errors=['bundle: recovery staging failed'];
  }
  return result;
 }
 return Object.freeze({stage});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=BackupRecoveryStage;
