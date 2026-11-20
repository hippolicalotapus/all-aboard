'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../source/all-aboard-personal.html'),'utf8');
const review=fs.readFileSync(path.join(__dirname,'../source/task-review.js'),'utf8');
let count=0;
function check(name,fn){fn();count++;console.log('PASS:',name);}
check('V40 review source embedded in self-contained app',()=>{
 assert.equal(html.split('// BEGIN TASK REVIEW\n')[1].split('// END TASK REVIEW')[0],review);
});
check('review source does not redefine certificate wallet storage',()=>{
 assert(!review.includes('onboardflow-fictional-wallet-v2'));
});
check('review UI retains explicit simulated approval disclaimer',()=>{
 assert(html.includes('This is not an employer approval.'));
});
check('review and evidence controls remain accessible',()=>{
 for(const id of ['taskReviewPanel','taskReviewTask','taskReviewStatus','taskReviewNote','taskReviewLink','taskReviewSave','taskReviewMessage']){
  assert(html.includes('id="'+id+'"'),id);
 }
});
check('legacy V39 backup and workflow keys preserved',()=>{
 assert(html.includes('onboarding-fictional-workflows-v1'));
 assert(html.includes('onboardflow-fictional-wallet-v2'));
});
console.log(count+' V40 compatibility gates passed');
