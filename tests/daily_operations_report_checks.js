'use strict';
const assert=require('node:assert/strict'),m=require('../source/daily-operations-report');
const ctx={companyId:'a',projectId:'p',date:'2026-11-13'};
const base={...ctx,id:'hours-1',kind:'time',quantity:8,unit:'hours',sourceId:'verified-time-1',status:'verified',source:'time-entry'};
const report=m.build([base,{...base},{...base,id:'plan-1',source:'flha-plan'},{...base,id:'other-tenant',companyId:'b'}],ctx);
assert.equal(report.entries.length,1);assert.equal(report.exceptions.length,2);assert.equal(report.status,'draft');
assert.throws(()=>m.approve(report,{role:'foreman',companyId:'a',projectId:'p',id:'f'}),/Unresolved/);
const clean=m.build([base],ctx);
assert.equal(m.approve(clean,{role:'foreman',companyId:'a',projectId:'p',id:'f'}).status,'foreman-approved');
assert.throws(()=>m.approve(clean,{role:'employee',companyId:'a',projectId:'p',id:'e'}),/foreman/);
assert.throws(()=>m.approve(clean,{role:'foreman',companyId:'b',projectId:'p',id:'f'}),/foreman/);
assert.throws(()=>m.approve(clean,{role:'foreman',companyId:'a',projectId:'other',id:'f'}),/foreman/);
assert.equal(m.build([{...base,status:'draft'}],ctx).entries.length,0);
console.log('PASS: fictional enter-once daily reports, exceptions, FLHA-plan exclusion and foreman approval');

const duplicateSource=m.build([base,{...base,id:'hours-2',quantity:9}],ctx);
assert.equal(duplicateSource.entries.length,1);
assert.deepEqual(duplicateSource.exceptions,[{id:'hours-2',reason:'duplicate-source'}]);
assert.throws(()=>m.approve(duplicateSource,{role:'foreman',companyId:'a',projectId:'p',id:'f'}),/Unresolved/);
const distinctKind=m.build([base,{...base,id:'production-1',kind:'production',unit:'units'}],ctx);
assert.equal(distinctKind.entries.length,2);
console.log('PASS: duplicate source references cannot double count actuals or pass approval');


for(const id of [' hours-2 ','bad/id','bad\nnewline','x'.repeat(65),''])assert.throws(()=>m.build([{...base,id}],ctx),/Invalid record id/);
for(const sourceId of [' verified-time-1 ','bad/id','x'.repeat(65),''])assert.throws(()=>m.build([{...base,sourceId}],ctx),/Invalid source id/);
for(const date of ['2026-02-30','2026-11-31','2026-1-3','not-a-date'])assert.throws(()=>m.build([{...base,date}],{...ctx,date}),/Invalid date/);
const generated=m.build([base,{...base,id:'production-2',kind:'production',quantity:60,unit:'metres',sourceId:'field-entry-2'},{...base,id:'other-day',date:'2026-11-12'},{...base,id:'unverified-1',status:'pending'}],ctx);
assert.deepEqual(generated.entries.map(x=>x.id),['hours-1','production-2']);
assert.deepEqual(generated.exceptions,[{id:'unverified-1',reason:'not-verified-actual'}]);
assert.equal(generated.status,'draft');
assert.equal(generated.requiresForemanApproval,true);
assert.throws(()=>m.approve(generated,{role:'foreman',companyId:'a',projectId:'p',id:'f'}),/Unresolved/);
console.log('PASS: malformed identifiers, impossible dates, daily report scoping and human review gate');
