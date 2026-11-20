"use strict";
// V40 fictional-data review adapter. Does not change V39 storage or backup formats.
const STATES=Object.freeze(["not_requested","pending","approved","changes_requested"]);
function normalizeReview(value,knownTaskIds){
 if(value==null)return {ok:true,review:{state:"not_requested",evidence:[]}};
 if(!value||typeof value!=="object"||Array.isArray(value)||!STATES.includes(value.state))return {ok:false,error:"invalid_review"};
 if(!Array.isArray(value.evidence)||value.evidence.length>10)return {ok:false,error:"invalid_evidence"};
 const evidence=[];
 for(const item of value.evidence){
  if(!item||typeof item!=="object"||Array.isArray(item)||typeof item.label!=="string"||item.label.trim().length<1||item.label.length>80||!["note","reference"].includes(item.type))return {ok:false,error:"invalid_evidence"};
  if(item.taskId!==undefined&&(!Array.isArray(knownTaskIds)||!knownTaskIds.includes(item.taskId)))return {ok:false,error:"unknown_task"};
  if(item.url!==undefined){try{const u=new URL(item.url);if(u.protocol!=="https:"||u.username||u.password)throw Error("invalid");}catch{return {ok:false,error:"invalid_url"};}}
  evidence.push({label:item.label.trim(),type:item.type,...(item.taskId===undefined?{}:{taskId:item.taskId}),...(item.url===undefined?{}:{url:item.url})});
 }
 return {ok:true,review:{state:value.state,evidence}};
}
function migrateV39(taskIds,oldChecklist,reviewByTask={}){
 if(!Array.isArray(taskIds)||!oldChecklist||typeof oldChecklist!=="object"||!reviewByTask||typeof reviewByTask!=="object"||Array.isArray(reviewByTask))return {ok:false,error:"invalid_input"};
 const result={};
 for(const [taskId,value] of Object.entries(reviewByTask)){
  if(!taskIds.includes(taskId))return {ok:false,error:"unknown_task"};
  const normalized=normalizeReview(value,taskIds);
  if(!normalized.ok)return normalized;
  result[taskId]=normalized.review;
 }
 // Return a separate V40 overlay. Never mutate or rewrite the original V39 checklist.
 return {ok:true,v39:oldChecklist,reviewOverlay:result};
}
module.exports={STATES,normalizeReview,migrateV39};
