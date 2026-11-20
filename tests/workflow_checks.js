'use strict';
const assert = require('node:assert/strict');
const model = require('../source/workflow-model.js');
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../source/all-aboard-personal.html'),'utf8');
const embedded=html.split('// BEGIN WORKFLOW MODEL\n')[1].split('// END WORKFLOW MODEL')[0];
assert.equal(embedded,fs.readFileSync(path.join(__dirname,'../source/workflow-model.js'),'utf8'),'embedded model must match tested canonical source');
let count = 0;
function check(name, fn) { fn(); count++; console.log('PASS:', name); }
check('field onboarding includes training and jobsite induction', () => {
 const tasks=model.build('onboarding','field','jobsite');
 assert(tasks.some(x=>x.id==='training')); assert(tasks.some(x=>x.id==='site-induction'));
 assert(tasks.every(x=>x.owner)); assert.equal(new Set(tasks.map(x=>x.id)).size,tasks.length);
});
check('remote office workers receive the relevant orientation', () => {
 const tasks=model.build('onboarding','office','remote');
 assert(tasks.some(x=>x.label==='Complete remote work orientation'));
 assert(!tasks.some(x=>x.id==='site-induction'||x.id==='training'));
});
check('offboarding requires access closure and equipment return', () => {
 const tasks=model.build('offboarding','field','jobsite');
 assert(tasks.some(x=>x.id==='access-close')); assert(tasks.some(x=>x.id==='equipment-return'));
 assert(!tasks.some(x=>x.id==='equipment'));
});
check('reboarding and transfers preserve distinct requirements', () => {
 assert(model.build('reboarding','office','office').some(x=>x.id==='changes'));
 assert(model.build('transfer','office','office').some(x=>x.id==='new-role'));
});
check('unknown template input cannot generate a misleading empty checklist', () => {
 for(const args of [['unknown','office','office'],['toString','office','office'],['onboarding','unknown','office'],['onboarding','office','unknown']]) assert.throws(()=>model.build(...args));
});
check('missing supervisor review blocks checklist completion', () => {
 const tasks=model.build('onboarding','field','jobsite');
 const done=Object.fromEntries(tasks.filter(x=>x.id!=='approval').map(x=>[x.id,true]));
 const result=model.summarize(tasks,done);
 assert.equal(result.complete,false); assert.deepEqual(result.missing.map(x=>x.id),['approval']);
});
check('truthy strings and unrelated entries do not count as completed', () => {
 const tasks=model.build('offboarding','office','office');
 const done=Object.fromEntries(tasks.map(x=>[x.id,'true'])); done.extra=true;
 assert.equal(model.summarize(tasks,done).done,0);
});
check('fully completed checklist is counted accurately', () => {
 const tasks=model.build('onboarding','office','office');
 const result=model.summarize(tasks,Object.fromEntries(tasks.map(x=>[x.id,true])));
 assert.equal(result.complete,true); assert.equal(result.total,result.done);
});
check('templates are independent and cannot corrupt later plans', () => {
 const first=model.build('onboarding','office','office'); first[0].label='changed'; first.pop();
 const second=model.build('onboarding','office','office'); assert.notEqual(second[0].label,'changed'); assert.equal(second.length,first.length+1);
});
check('empty workflow is rejected',()=>assert.throws(()=>model.summarize([],{})));
console.log('PASS:',count,'workflow regression scenarios');
