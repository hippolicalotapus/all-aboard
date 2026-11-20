"use strict";
// Optional V40 review overlay view-model. Does not modify V39 checklist records.
const states=new Set(["not_requested","pending","approved","changes_requested"]);
function reviewSummary(taskIds,reviews){
 if(!Array.isArray(taskIds)||!reviews||typeof reviews!=="object"||Array.isArray(reviews))return {ok:false,error:"invalid_input"};
 const rows=[];
 for(const id of taskIds){
  if(typeof id!=="string"||!id)return {ok:false,error:"invalid_task"};
  const r=reviews[id];
  if(r!==undefined&&(!r||typeof r!=="object"||!states.has(r.state)||!Array.isArray(r.evidence)))return {ok:false,error:"invalid_review"};
  rows.push({taskId:id,state:r?r.state:"not_requested",evidenceCount:r?r.evidence.length:0});
 }
 for(const id of Object.keys(reviews))if(!taskIds.includes(id))return {ok:false,error:"unknown_task"};
 return {ok:true,rows};
}
module.exports={reviewSummary};
