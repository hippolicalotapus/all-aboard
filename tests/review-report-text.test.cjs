'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const review=require('../source/task-review'),model=require('../source/workflow-model');
const scope={kind:'onboarding',role:'field',site:'jobsite'};
const record={...scope,taskId:'training',status:'changes-requested',note:'Please attach updated training evidence.',evidenceUrl:''};
test('review draft uses task labels and includes tasks without requested reviews',()=>{
 const value={format:review.FORMAT,records:[record]};const before=JSON.stringify(value);
 const text=review.formatReviewReport(value,model,scope);
 assert.match(text,/Checklist review draft/);assert.match(text,/Onboarding · Field · Jobsite/);
 assert.match(text,/Review required training evidence — Supervisor/);
 assert.match(text,/Review: Changes requested/);assert.match(text,/Please attach updated training evidence\./);
 assert.match(text,/Review: Not requested/);assert.match(text,/1 of 8 tasks have a saved review/);
 assert.match(text,/Fictional data only\. Not an employer approval\./);
 assert.equal(JSON.stringify(value),before);
});
test('review draft excludes other workflows and renders evidence as literal text',()=>{
 const text=review.formatReviewReport({format:review.FORMAT,records:[{...record,note:'<img src=x>',evidenceUrl:'https://example.org/fictional'}, {...record,kind:'offboarding',taskId:'handover',note:'OTHER WORKFLOW'}]},model,scope);
 assert.match(text,/Evidence: https:\/\/example.org\/fictional/);assert.match(text,/<img src=x>/);
 assert.doesNotMatch(text,/OTHER WORKFLOW/);
});
test('invalid scope or records cannot generate a review draft',()=>{
 assert.throws(()=>review.formatReviewReport(review.empty(),model,{...scope,site:'unknown'}),/Unknown/);
 assert.throws(()=>review.formatReviewReport({format:review.FORMAT,records:[{...record,evidenceUrl:'javascript:alert(1)'}]},model,scope),/safe HTTPS/);
});
