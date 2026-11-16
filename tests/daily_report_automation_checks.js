'use strict';
const assert=require('node:assert/strict');
const automation=require('../source/daily-report-automation');
const lifecycle=require('../source/daily-report-lifecycle');
const ctx={companyId:'demo',projectId:'site',date:'2026-11-13'};
const actor={id:'fictional-foreman',role:'foreman',companyId:'demo',projectId:'site'};
const raw={
 timeEntries:[{...ctx,id:'time-1',sourceId:'timesheet-1',quantity:8,unit:'hours',status:'verified'},
              {...ctx,id:'time-2',sourceId:'timesheet-1',quantity:9,unit:'hours',status:'verified'},
              {...ctx,id:'wrong-date',date:'2026-11-12',sourceId:'old-time',quantity:9,unit:'hours',status:'verified'}],
 productionEntries:[{...ctx,id:'prod-1',sourceId:'field-1',quantity:120,unit:'metres',status:'verified'}],
 equipmentEntries:[{...ctx,id:'equip-1',sourceId:'equipment-1',quantity:6,unit:'hours',status:'verified'}],
 materialEntries:[{...ctx,id:'plan-1',source:'flha-plan',sourceId:'flha-1',quantity:30,unit:'units',status:'planned'},
                  {...ctx,id:'pending-1',sourceId:'material-2',quantity:12,unit:'units',status:'pending'}]
};
const rawBefore=JSON.stringify(raw);
let state=automation.start(raw,ctx);
assert.equal(state.report.status,'draft');
assert.equal(state.report.requiresForemanApproval,true);
assert.deepEqual(state.report.entries.map(x=>x.id),['time-1','prod-1','equip-1']);
assert.deepEqual(state.report.exceptions,[{id:'time-2',reason:'duplicate-source'},{id:'plan-1',reason:'not-verified-actual'},{id:'pending-1',reason:'not-verified-actual'}]);
assert.equal(JSON.stringify(raw),rawBefore,'Original source records cannot be modified by report generation');
assert.throws(()=>lifecycle.action(state,actor,{type:'approve',actionId:'approve-early',expectedRevision:1}),/Unresolved/);
assert.throws(()=>lifecycle.action(state,{...actor,role:'employee'},{type:'exclude',recordId:'plan-1',actionId:'wrong-role',reason:'Not an actual record',expectedRevision:1}),/access denied/);
for(const id of ['time-2','plan-1','pending-1'])state=lifecycle.action(state,actor,{type:'exclude',recordId:id,actionId:'remove-'+id,reason:'Fictional reviewed exception',expectedRevision:state.revision});
assert.equal(state.report.exceptions.length,0);
state=lifecycle.action(state,actor,{type:'approve',actionId:'approve-final',expectedRevision:state.revision});
assert.equal(state.report.status,'foreman-approved');
assert.equal(state.events.length,4);
assert.equal(lifecycle.view(state,{role:'accounting',companyId:'demo',projectIds:['site']}).canEdit,false);
assert.throws(()=>lifecycle.action(state,actor,{type:'correct',recordId:'time-1',quantity:5,actionId:'unreviewed-change',reason:'Unverified new change',expectedRevision:state.revision}),/immutable/);
for(const bad of [{randomEntries:[]},{timeEntries:{}},{materialEntries:[null]}])assert.throws(()=>automation.start(bad,ctx),/Invalid|Unknown/);
assert.throws(()=>automation.start({timeEntries:[{...ctx,id:' invalid ',sourceId:'s',quantity:1,unit:'hours',status:'verified'}]},ctx),/Invalid record id/);
assert.throws(()=>automation.start({timeEntries:[{...ctx,id:'x',sourceId:'s',quantity:1,unit:'hours',status:'verified'}]},{...ctx,date:'2026-02-30'}),/Invalid date/);
console.log('PASS: fictional enter-once daily aggregation, duplicates, planned exclusions, tenant/date scoping, foreman review and audit');
