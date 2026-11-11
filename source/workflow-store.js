'use strict';
// Separate from certificate wallet storage and backup formats. Fictional data only.
const WorkflowStore = (() => {
 const KEY = 'onboarding-fictional-workflows-v1';
 const FORMAT = 'onboarding-fictional-workflows-v1';
 function validate(value, model) {
  if (!value || value.format !== FORMAT || !Array.isArray(value.plans) || value.plans.length > 24) throw Error('Invalid checklist backup');
  const seen = new Set();
  const plans = value.plans.map(plan => {
   if (!plan || !Array.isArray(plan.completed)) throw Error('Invalid checklist plan');
   const tasks = model.build(plan.kind, plan.role, plan.site);
   const allowed = new Set(tasks.map(task=>task.id));
   const key = [plan.kind,plan.role,plan.site].join(':');
   if (seen.has(key) || plan.completed.length > tasks.length || new Set(plan.completed).size !== plan.completed.length || plan.completed.some(id=>typeof id !== 'string' || !allowed.has(id))) throw Error('Invalid checklist steps or duplicate plan');
   seen.add(key);
   // Allowlist fields: imported names, notes, credentials and unrelated data are discarded.
   return {kind:plan.kind, role:plan.role, site:plan.site, completed:[...plan.completed]};
  });
  return {format:FORMAT,plans};
 }
 function empty() { return {format:FORMAT,plans:[]}; }
 function connect(storage, model) {
  return {
   read() { const raw=storage.getItem(KEY); return raw === null ? empty() : validate(JSON.parse(raw),model); },
   write(value) {
    const next=validate(value,model); // Validation never mutates storage.
    let previous, captured=false;
    try {
     previous=storage.getItem(KEY); captured=true;
     const raw=JSON.stringify(next);
     storage.setItem(KEY,raw);
     if(storage.getItem(KEY)!==raw) throw Error('Checklist storage readback failed');
     return {ok:true,value:next};
    } catch(error) {
     let recovered=false;
     if(captured) try {
      if(previous===null) storage.removeItem(KEY); else storage.setItem(KEY,previous);
      recovered=storage.getItem(KEY)===previous;
     } catch (_) { /* UI must report uncertain storage rather than claim recovery. */ }
     return {ok:false,recovered};
    }
   }
  };
 }
 return Object.freeze({KEY,FORMAT,validate,empty,connect});
})();
if (typeof module !== 'undefined' && module.exports) module.exports = WorkflowStore;
