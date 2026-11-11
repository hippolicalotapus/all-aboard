'use strict';
const assert=require('node:assert/strict'),model=require('../source/workflow-model.js'),store=require('../source/workflow-store.js');
let count=0;function check(name,fn){fn();count++;console.log('PASS:',name)}
const today='2026-11-11',plan={kind:'onboarding',role:'field',site:'jobsite',completed:[],dueDates:{start:'2026-11-10',forms:today,policies:'2026-11-12'}};
const backup=p=>({format:store.FORMAT,plans:[p]});
check('calendar validation rejects impossible dates and accepts leap days',()=>{assert(!model.isDate('2026-02-29'));assert(!model.isDate('2026-13-01'));assert(!model.isDate('2026-04-31'));assert(model.isDate('2028-02-29'))});
check('local day uses local calendar parts',()=>{assert.equal(model.localToday(new Date(2026,10,11,0,1)),today)});
check('deadline states distinguish overdue, today, future and unscheduled',()=>{assert.equal(model.taskStatus('start',[],plan.dueDates,today),'overdue');assert.equal(model.taskStatus('forms',[],plan.dueDates,today),'today');assert.equal(model.taskStatus('policies',[],plan.dueDates,today),'upcoming');assert.equal(model.taskStatus('equipment',[],plan.dueDates,today),'unscheduled')});
check('completed task does not remain in overdue attention queue',()=>{const p={...plan,completed:['start']};const rows=model.attention([p],today);assert.deepEqual(rows.map(r=>r.id),['forms']);assert.equal(model.taskStatus('start',p.completed,p.dueDates,today),'complete')});
check('reopening a completed task restores its overdue status',()=>{assert.equal(model.taskStatus('start',[],plan.dueDates,today),'overdue')});
check('attention queue combines plans, preserves owner and sorts dates',()=>{const other={kind:'offboarding',role:'office',site:'remote',completed:[],dueDates:{handover:'2026-11-09'}};const rows=model.attention([plan,other],today);assert.deepEqual(rows.map(r=>r.due),['2026-11-09','2026-11-10',today]);assert(rows.every(r=>r.owner&&r.role&&r.site))});
check('old V1 backups load without inventing deadlines',()=>{const p={kind:'onboarding',role:'office',site:'office',completed:['start']};assert.deepEqual(store.validate(backup(p),model).plans[0],p)});
check('deadline data survives validated JSON backup roundtrip',()=>assert.deepEqual(store.validate(JSON.parse(JSON.stringify(backup(plan))),model).plans[0],plan));
check('malformed deadline maps and unknown task IDs are rejected',()=>{for(const dueDates of [null,[],3,{unknown:today},{start:'2026-02-29'},{start:''},{start:123},{start:'2026-11-11T00:00:00Z'}])assert.throws(()=>store.validate(backup({...plan,dueDates}),model))});
check('removing one deadline preserves other deadlines',()=>{const dueDates={...plan.dueDates};delete dueDates.start;const clean=store.validate(backup({...plan,dueDates}),model);assert.equal(clean.plans[0].dueDates.forms,today);assert.equal(model.taskStatus('start',[],clean.plans[0].dueDates,today),'unscheduled')});
check('invalid today and malformed direct deadline input throw',()=>{assert.throws(()=>model.attention([plan],'bad'));assert.throws(()=>model.taskStatus('start',[],{start:'bad'},today))});
console.log('PASS:',count,'deadline scenarios');
