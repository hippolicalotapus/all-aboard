'use strict';
const assert=require('node:assert/strict');
const planner=require('../source/backup-recovery-plan.js');
global.BackupRecoveryPlan=planner;
const stage=require('../source/backup-recovery-stage.js');
const workflow=require('../source/workflow-store.js');
const review=require('../source/task-review.js');
const model=require('../source/workflow-model.js');
const v39={format:workflow.FORMAT,plans:[{kind:'onboarding',role:'field',site:'jobsite',completed:['start']}]};
const v40={format:review.FORMAT,records:[{kind:'onboarding',role:'field',site:'jobsite',taskId:'training',status:'pending',note:'fictional',evidenceUrl:''}]};
const raw={workflow:v39,review:v40};
const before=JSON.stringify(raw);
const result=stage.stage(raw,{workflow:workflow.empty(),review:review.empty()},workflow,review,model);
assert.equal(result.ready,true);
assert.equal(result.writes,false);
assert.equal(result.replacements.workflow.plans.length,1);
assert.equal(result.replacements.review.records.length,1);
assert.equal(JSON.stringify(raw),before);
result.replacements.workflow.plans[0].completed.push('training');
assert.equal(JSON.stringify(raw),before,'staging must not alias source records');
for(const invalid of [null,[],{}, {workflow:v39,review:{format:review.FORMAT,records:[{bad:true}]}}]){
 const rejected=stage.stage(invalid,{},workflow,review,model);
 assert.equal(rejected.ready,false);
 assert.deepEqual(rejected.replacements,{});
}
assert.equal(stage.stage({workflow:v39},{},workflow,review,model).ready,true,'V39 only supported');
console.log('V40 atomic read-only staging and V39 compatibility passed');
