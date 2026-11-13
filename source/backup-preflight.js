'use strict';
// Read-only V40 import preflight. Never writes to storage or upgrades V39 backups.
const BackupPreflight=(()=>{
 function inspect(raw,workflowStore,reviewStore,model){
  const result={workflow:{present:false,valid:false,plans:0},review:{present:false,valid:false,records:0},safeToImport:false,errors:[],writes:false};
  for(const [name,store,field,count] of [['workflow',workflowStore,'plans','plans'],['review',reviewStore,'records','records']]){
   const value=raw&&Object.hasOwn(raw,name)?raw[name]:undefined;
   if(value===undefined||value===null)continue;
   result[name].present=true;
   try{
    const validated=store.validate(value,model);
    result[name].valid=true;
    result[name][count]=validated[field].length;
   }catch(_){result.errors.push(name+': invalid backup');}
  }
  result.safeToImport=result.errors.length===0&&(result.workflow.present||result.review.present);
  return result;
 }
 return Object.freeze({inspect});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=BackupPreflight;
