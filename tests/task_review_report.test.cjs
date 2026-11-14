const {test}=require('node:test');
const assert=require('node:assert/strict');
const review=require('../source/task-review.js');
const model={build:()=>[{id:'safety'},{id:'orientation'}]};
test('generates human-reviewable fictional report without approving tasks',()=>{
 const data={format:review.FORMAT,records:[{kind:'onboard',role:'worker',site:'fictional',taskId:'safety',status:'changes-requested',note:'Need updated form',evidenceUrl:''}]};
 const result=review.generateReviewReport(data,model);
 assert.equal(result.fictionalDataOnly,true);
 assert.equal(result.employerApproval,false);
 assert.equal(result.summary.missingEvidence,1);
 assert.equal(result.items[0].needsAttention,true);
});
test('rejects invalid evidence URL before generating report',()=>{
 const data={format:review.FORMAT,records:[{kind:'onboard',role:'worker',site:'fictional',taskId:'safety',status:'reviewed',note:'',evidenceUrl:'javascript:alert(1)'}]};
 assert.throws(()=>review.generateReviewReport(data,model),/safe HTTPS/);
});
test('does not alter existing backup format',()=>assert.equal(review.empty().format,'onboarding-fictional-task-reviews-v1'));

test('HTML report uses the current workflow scope, not every saved review',()=>{
 const fs=require('node:fs');
 const html=fs.readFileSync(require('node:path').join(__dirname,'../source/all-aboard-personal.html'),'utf8');
 assert.match(html,/const scope=workflowSelection\(\)/);
 assert.match(html,/record\.kind===scope\.kind&&record\.role===scope\.role&&record\.site===scope\.site/);
 assert.match(html,/generateReviewReport\(\{format:TaskReview\.FORMAT,records:scopedRecords\},WorkflowModel\)/);
});
