'use strict';
// Explicitly invoked V40 recovery transaction. Never touches wallet keys.
const BackupRecoveryTransaction=(()=>{
 function apply(stage,storage,workflowStore,reviewStore,model,confirmed){
  const result={ok:false,rolledBack:false,rollbackVerified:false,errors:[],writes:false};
  if(confirmed!==true||!stage||stage.ready!==true||!stage.replacements||!Object.keys(stage.replacements).length){
   result.errors.push('Recovery requires a validated stage and explicit confirmation');return result;
  }
  const sections=[['workflow',workflowStore],['review',reviewStore]].filter(([name])=>Object.hasOwn(stage.replacements,name));
  const snapshots=new Map();
  try{
   for(const [name,store] of sections){
    store.validate(stage.replacements[name],model);
    snapshots.set(store.KEY,storage.getItem(store.KEY));
   }
  }catch(_){result.errors.push('Recovery validation or snapshot failed');return result;}
  // A staged preview must not overwrite data changed by another tab.
  if(stage.originals){
   for(const [name,store] of sections){
    if(!Object.hasOwn(stage.originals,name)||snapshots.get(store.KEY)!==stage.originals[name]){
     result.errors.push('Saved data changed since inspection; inspect backup again');
     return result;
    }
   }
  }
  const expected=new Map();
  try{
   for(const [name,store] of sections){
    const raw=JSON.stringify(store.validate(stage.replacements[name],model));
    expected.set(store.KEY,raw);
    result.writes=true;
    storage.setItem(store.KEY,raw);
    if(storage.getItem(store.KEY)!==raw)throw Error('Recovery readback mismatch');
   }
   result.ok=true;
   return result;
  }catch(_){
   result.errors.push('Recovery failed; rollback attempted');
   let restored=true;
   for(const [key,raw] of snapshots){
    try{
     if(raw===null)storage.removeItem(key);else storage.setItem(key,raw);
     if(storage.getItem(key)!==raw)restored=false;
    }catch(_){restored=false;}
   }
   result.rolledBack=restored;
   result.rollbackVerified=restored;
   if(!restored)result.errors.push('Rollback could not be verified; do not retry until storage is inspected');
   return result;
  }
 }
 return Object.freeze({apply});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=BackupRecoveryTransaction;
