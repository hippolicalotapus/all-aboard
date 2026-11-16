'use strict';
// Fictional-data-only enter-once draft assembly. No scheduling, payroll, or auto-approval.
(function(root,factory){
 const api=factory(root.DailyReportLifecycle||(typeof require==='function'?require('./daily-report-lifecycle'):null));
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.DailyReportAutomation=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(lifecycle){
 const groups=Object.freeze({
  timeEntries:Object.freeze({kind:'time',source:'time-entry'}),
  productionEntries:Object.freeze({kind:'production',source:'field-entry'}),
  equipmentEntries:Object.freeze({kind:'equipment',source:'equipment-log'}),
  materialEntries:Object.freeze({kind:'material',source:'material-log'})
 });
 function collect(sources){
  if(!sources||typeof sources!=='object'||Array.isArray(sources))throw Error('Invalid daily report sources');
  for(const key of Object.keys(sources))if(!Object.hasOwn(groups,key))throw Error('Unknown daily report source');
  const records=[];
  for(const [key,{kind,source}] of Object.entries(groups)){
   const items=sources[key]??[];
   if(!Array.isArray(items))throw Error('Invalid daily report source collection');
   for(const item of items){
    if(!item||typeof item!=='object'||Array.isArray(item))throw Error('Invalid daily report record');
    // Preserve the original source identity and verified/planned classification.
    // A FLHA plan is never upgraded to an actual by its collection name.
    records.push({...item,kind,source:item.source==='flha-plan'?'flha-plan':source});
   }
  }
  return records;
 }
 function start(sources,context){return lifecycle.start(collect(sources),context);}
 return Object.freeze({collect,start});
});
