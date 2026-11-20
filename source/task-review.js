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
 function reviewAttention(value,model){
  const checked=validate(value,model);
  return checked.records.filter(record=>record.status==='changes-requested'&&!record.evidenceUrl).map(record=>({kind:record.kind,role:record.role,site:record.site,taskId:record.taskId,needsEvidence:true,employerApproval:false}));
 }
 function summarize(value,model){
  const checked=validate(value,model);
  const byStatus={pending:0,reviewed:0,'changes-requested':0};
  for(const record of checked.records)byStatus[record.status]++;
  return {total:checked.records.length,byStatus,evidenceLinks:checked.records.filter(record=>Boolean(record.evidenceUrl)).length,missingEvidence:checked.records.filter(record=>record.status==='changes-requested'&&!record.evidenceUrl).length,employerApproval:false};
 }
 function generateReviewReport(value,model){
  const checked=validate(value,model);
  const summary=summarize(checked,model);
  return Object.freeze({format:'onboarding-fictional-review-report-v1',fictionalDataOnly:true,employerApproval:false,summary,items:checked.records.map(({kind,role,site,taskId,status,note,evidenceUrl})=>Object.freeze({kind,role,site,taskId,status,note,evidenceUrl,needsAttention:status==='changes-requested'&&!evidenceUrl}))});
 }
 function formatReviewReport(value,model,scope){
  if(!scope)throw Error('Unknown workflow scope');
  const tasks=model.build(scope.kind,scope.role,scope.site);
  const checked=validate(value,model),records=checked.records.filter(r=>r.kind===scope.kind&&r.role===scope.role&&r.site===scope.site);
  const labels={onboarding:'Onboarding',reboarding:'Reboarding',transfer:'Transfer',offboarding:'Offboarding',field:'Field',office:'Office',remote:'Remote',jobsite:'Jobsite'};
  const states={pending:'Pending review',reviewed:'Reviewed (not employer approval)','changes-requested':'Changes requested'};
  const lines=['Checklist review draft',[scope.kind,scope.role,scope.site].map(v=>labels[v]).join(' · '),'Fictional data only. Not an employer approval.','Review status is separate from checklist acknowledgement.','',records.length+' of '+tasks.length+' tasks have a saved review.'];
  for(const [index,task] of tasks.entries()){
   const record=records.find(r=>r.taskId===task.id);
   lines.push('',(index+1)+'. '+task.label+' — '+task.owner,'Review: '+(record?states[record.status]:'Not requested'),'Note: '+(record&&record.note||'No review note.'),'Evidence: '+(record&&record.evidenceUrl||'No evidence link.'));
  }
  return lines.join('\n');
 }
 return Object.freeze({FORMAT,KEY,STATUSES,validate,empty,connect,summarize,reviewAttention,generateReviewReport,formatReviewReport});
})();
if(typeof module!=='undefined'&&module.exports)module.exports=TaskReview;
