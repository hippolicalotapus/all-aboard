'use strict';
const assert=require('node:assert/strict');
const preflight=require('../source/backup-preflight.js');
const workflow=require('../source/workflow-store.js');
const review=require('../source/task-review.js');
const model=require('../source/workflow-model.js');
const legacy={format:workflow.FORMAT,plans:[{kind:'onboarding',role:'field',site:'jobsite',completed:['start']}]};
const task={kind:'onboarding',role:'field',site:'jobsite',taskId:'training',status:'changes-requested',note:'fictional',evidenceUrl:''};
const v40={format:review.FORMAT,records:[task]};
const input={workflow:legacy,review:v40};
const before=JSON.stringify(input);
const valid=preflight.inspect(input,workflow,review,model);
assert.deepEqual(valid,{workflow:{present:true,valid:true,plans:1},review:{present:true,valid:true,records:1},safeToImport:true,errors:[],writes:false});
assert.equal(JSON.stringify(input),before,'preflight must never alter legacy backups');
assert.equal(preflight.inspect({workflow:legacy},workflow,review,model).safeToImport,true,'V39-only backup remains supported');
assert.equal(preflight.inspect({review:v40},workflow,review,model).safeToImport,true,'review-only backup supported');
assert.equal(preflight.inspect({},workflow,review,model).safeToImport,false);
const invalid={workflow:legacy,review:{...v40,records:[{...task,status:'approved'}]}};
const bad=preflight.inspect(invalid,workflow,review,model);
assert.equal(bad.safeToImport,false);
assert.deepEqual(bad.errors,['review: invalid backup']);
assert.equal(bad.workflow.valid,true);
assert.equal(preflight.inspect({workflow:{...legacy,plans:[{...legacy.plans[0],completed:['missing']}]},review:v40},workflow,review,model).safeToImport,false);
for(const value of [null,[],42,'invalid']){
 const result=preflight.inspect(value,workflow,review,model);
 assert.equal(result.safeToImport,false,'non-object bundle rejected');
 assert.deepEqual(result.errors,['bundle: expected JSON object']);
}
for(const section of ['workflow','review']){
 for(const value of [null,undefined]){
  const result=preflight.inspect({[section]:value},workflow,review,model);
  assert.equal(result.safeToImport,false,section+' null/undefined section rejected');
  assert.deepEqual(result.errors,[section+': invalid backup']);
 }
}
console.log('V40 read-only preflight: V39-only, review-only, combined and invalid backups verified');
