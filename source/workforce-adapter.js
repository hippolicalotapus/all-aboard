'use strict';
const WorkforceAdapter=(()=>{
 const SCHEMA='workforce.integration.v1';
 const TYPES=Object.freeze(['assignment.offered','task.progress.submitted','safety.observation.submitted']);
 const ORIGINS=Object.freeze(['all-aboard','ai-focus','ai-exec']);
 const FIELDS={'assignment.offered':['title','requiredTrainingIds'],'task.progress.submitted':['taskId','status'],'safety.observation.submitted':['observationId','summary']};
 const text=(s,max=160)=>typeof s==='string'&&s.length>0&&s.length<=max&&!/[\u0000-\u001f]/.test(s);
 const allowed=(obj,keys)=>Object.keys(obj).every(k=>keys.includes(k));
 function validate(event){
  if(!event||typeof event!=='object'||Array.isArray(event)||!allowed(event,['schema','eventId','type','origin','subject','assignmentId','occurredAt','payload']))throw Error('Invalid envelope');
  if(event.schema!==SCHEMA||!TYPES.includes(event.type)||!ORIGINS.includes(event.origin))throw Error('Unsupported integration event');
  for(const key of ['eventId','subject','assignmentId'])if(!text(event[key]))throw Error('Invalid identifier');
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(event.occurredAt)||!Number.isFinite(Date.parse(event.occurredAt)))throw Error('Invalid timestamp');
  if((event.type==='assignment.offered'&&event.origin!=='all-aboard')||(event.type==='safety.observation.submitted'&&event.origin!=='ai-focus')||(event.type==='task.progress.submitted'&&event.origin!=='ai-exec'))throw Error('Unauthorized origin');
  const p=event.payload;
  if(!p||typeof p!=='object'||Array.isArray(p)||!allowed(p,FIELDS[event.type]))throw Error('Invalid payload');
  if(event.type==='assignment.offered'){if(!text(p.title)||!Array.isArray(p.requiredTrainingIds)||p.requiredTrainingIds.length>30||!p.requiredTrainingIds.every(id=>text(id)))throw Error('Invalid assignment')}
  else if(event.type==='task.progress.submitted'){if(!text(p.taskId)||!['started','blocked','completed-claim'].includes(p.status))throw Error('Invalid progress')}
  else if(!text(p.observationId)||!text(p.summary,500))throw Error('Invalid observation');
  return JSON.parse(JSON.stringify(event));
 }
 function createDemoBridge(){
  const seen=new Set(),queue=[];
  return Object.freeze({
   submit(event,consent=false){
    if(consent!==true)throw Error('Explicit fictional-data consent required');
    const clean=validate(event);
    if(!clean.subject.startsWith('fictional-')||!clean.assignmentId.startsWith('fictional-'))throw Error('Fictional identifiers only');
    if(seen.has(clean.eventId))return {accepted:false,reason:'duplicate'};
    seen.add(clean.eventId);queue.push(clean);return {accepted:true};
   },
   inspect(){return queue.map(event=>JSON.parse(JSON.stringify(event)))}
  });
 }
 return Object.freeze({SCHEMA,TYPES,validate,createDemoBridge});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=WorkforceAdapter;
