'use strict';
const assert=require('node:assert/strict');
const flow=require('../source/daily-report-lifecycle');
const context={companyId:'demo',projectId:'project-1',date:'2026-11-13'};
const actor={id:'foreman-1',role:'foreman',companyId:'demo',projectId:'project-1'};
const entries=[{...context,id:'time-1',kind:'time',quantity:8,unit:'hours',sourceId:'clock-1',status:'verified'}];
let state=flow.start(entries,context);
state=flow.action(state,actor,{type:'approve',actionId:'approval-1',expectedRevision:1});
assert.equal(flow.verifyAudit(state),true);
for(const invalid of ['', '  ', null, undefined]){
 const forged={...state,events:[{...state.events[0],actorId:invalid}]};
 assert.throws(()=>flow.verifyAudit(forged),/Audit integrity failed/,`invalid actor ID: ${String(invalid)}`);
}
console.log('PASS: audit events require a nonblank actor ID');
