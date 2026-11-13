'use strict';
// Fictional-data task review metadata. No real approvals or uploads.
const TaskReview = (() => {
 const FORMAT='onboarding-fictional-task-reviews-v1';
 const KEY='onboarding-fictional-task-reviews-v1';
 const STATUSES=['pending','reviewed','changes-requested'];
 function validate(value, model) {
  if(!value||value.format!==FORMAT||!Array.isArray(value.records)||value.records.length>250)throw Error('Invalid task review backup');
  const seen=new Set();
  const records=value.records.map(item=>{
   if(!item||typeof item!=='object')throw Error('Invalid review record');
   const {kind,role,site,taskId,status,note,evidenceUrl}=item;
   const tasks=model.build(kind,role,site);
   if(typeof taskId!=='string'||!tasks.some(t=>t.id===taskId))throw Error('Unknown review task');
   const key=JSON.stringify([kind,role,site,taskId]);
   if(seen.has(key))throw Error('Duplicate review task');
   seen.add(key);
   if(!STATUSES.includes(status)||typeof note!=='string'||note.length>500||typeof evidenceUrl!=='string'||evidenceUrl.length>500)throw Error('Invalid review details');
   if(evidenceUrl){let url;try{url=new URL(evidenceUrl)}catch{throw Error('Invalid evidence link')}
    if(url.protocol!=='https:'||!url.hostname||url.username||url.password)throw Error('Evidence must use a safe HTTPS link');
   }
   return {kind,role,site,taskId,status,note,evidenceUrl};
  });
  return {format:FORMAT,records};
 }
 function empty(){return {format:FORMAT,records:[]}}
 function connect(storage,model){return {
  read(){const raw=storage.getItem(KEY);return raw===null?empty():validate(JSON.parse(raw),model)},
  write(value){const next=validate(value,model);const before=storage.getItem(KEY);try{const raw=JSON.stringify(next);storage.setItem(KEY,raw);if(storage.getItem(KEY)!==raw)throw Error('Write not retained');return {ok:true,value:next}}catch(e){let recovered=false;try{if(before===null)storage.removeItem(KEY);else storage.setItem(KEY,before);recovered=storage.getItem(KEY)===before}catch(_){}return {ok:false,recovered}}}
 }}
 function summarize(value,model){
  const checked=validate(value,model);
  const byStatus={pending:0,reviewed:0,'changes-requested':0};
  for(const record of checked.records)byStatus[record.status]++;
  return {total:checked.records.length,byStatus,evidenceLinks:checked.records.filter(record=>Boolean(record.evidenceUrl)).length,missingEvidence:checked.records.filter(record=>record.status==='changes-requested'&&!record.evidenceUrl).length,employerApproval:false};
 }
 return Object.freeze({FORMAT,KEY,STATUSES,validate,empty,connect,summarize});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=TaskReview;
