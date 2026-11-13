'use strict';
// V40 recovery impact preview. Pure computation: never reads or writes browser storage.
const BackupRecoveryPlan=(()=>{
 function plan(incoming,current,workflowStore,reviewStore,model){
  const sections=[['workflow',workflowStore,'plans'],['review',reviewStore,'records']];
  const result={safeToRestore:false,sections:{},errors:[],writes:false};
  if(!incoming||typeof incoming!=='object'||Array.isArray(incoming)){
   result.errors.push('bundle: expected JSON object');return result;
  }
  for(const [name,store,key] of sections){
   const present=Object.hasOwn(incoming,name);
   const section={present,existing:0,incoming:0,delta:0,willReplace:false};
   result.sections[name]=section;
   if(!present)continue;
   try{
    const next=store.validate(incoming[name],model);
    const existing=current&&Object.hasOwn(current,name)?store.validate(current[name],model):store.empty();
    section.existing=existing[key].length;
    section.incoming=next[key].length;
    section.delta=section.incoming-section.existing;
    section.willReplace=true;
   }catch(_){result.errors.push(name+': invalid recovery data');}
  }
  result.safeToRestore=result.errors.length===0&&sections.some(([name])=>result.sections[name].present);
  if(!result.safeToRestore)for(const section of Object.values(result.sections))section.willReplace=false;
  return result;
 }
 return Object.freeze({plan});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=BackupRecoveryPlan;
