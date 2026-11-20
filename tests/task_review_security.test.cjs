const {test}=require('node:test');
const assert=require('node:assert/strict');
const TaskReview=require('../source/task-review.js');
const model={build:()=>[{id:'task-1'}]};
const record=(evidenceUrl='')=>({kind:'onboarding',role:'worker',site:'demo',taskId:'task-1',status:'changes-requested',note:'fictional',evidenceUrl});
const backup=records=>({format:TaskReview.FORMAT,records});
test('HTTPS evidence and attention counts',()=>{
 const withEvidence=backup([record('https://example.org/evidence')]);
 assert.equal(TaskReview.summarize(withEvidence,model).evidenceLinks,1);
 assert.equal(TaskReview.summarize(withEvidence,model).missingEvidence,0);
 assert.equal(TaskReview.summarize(backup([record()]),model).missingEvidence,1);
});
test('unsafe evidence links fail closed',()=>{
 for(const url of ['http://example.org','javascript:alert(1)','https://user:pass@example.org'])
  assert.throws(()=>TaskReview.validate(backup([record(url)]),model));
});
test('duplicate reviews rejected',()=>assert.throws(()=>TaskReview.validate(backup([record(),record()]),model)));
