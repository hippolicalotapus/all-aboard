'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../pilot/workforce-onboarding.html'),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean);
assert.equal(scripts.length,1,'Pilot must contain one inline controller');
const source=scripts[0];
for(const required of ['OnboardingCompletionRecords.completion(employee,employee,docs,records)','OnboardingCompletionRecords.completion(safety,employee,docs,records)','SafetyRevisionLifecycle.publish','SafetyRevisionLifecycle.revise','OnboardingWorkflow.flhaReview'])assert(source.includes(required),'Missing interaction: '+required);
assert(!source.includes('localStorage')&&!source.includes('innerHTML'),'Pilot must not mutate existing storage or interpolate HTML');
const listeners={};function element(tag){return {tag,children:[],value:'employee',checked:false,disabled:false,textContent:'',append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},addEventListener(name,fn){this[name]=fn}}}
const main=element('main'),role=element('select');
const document={createElement:element,createTextNode:s=>({textContent:s}),getElementById:id=>id==='view'?main:role};
const context={document,Set,Date,OnboardingWorkflow:require('../source/onboarding-workflow'),SafetyRevisionLifecycle:require('../source/safety-revision-lifecycle'),OnboardingCompletionRecords:require('../source/onboarding-completion-records')};
vm.runInNewContext(source,context,{timeout:2000});
function flatten(n){return [n,...(n.children||[]).flatMap(flatten)]}
function findButton(label){return flatten(main).find(n=>n.tag==='button'&&n.textContent===label)}
assert(findButton('Read document'),'Employee can open document');
findButton('Read document').click();
let checkbox=flatten(main).find(n=>n.tag==='input'&&n.type==='checkbox');
assert(checkbox,'Reading reveals confirmation');
checkbox.checked=true;checkbox.change();
assert.equal(findButton('Acknowledge this revision').disabled,false);
findButton('Acknowledge this revision').click();
role.value='safety-admin';role.change();
assert(flatten(main).some(n=>String(n.textContent).includes('1 of 2 acknowledged')),'Admin sees completion');
findButton('Create new draft').click();
assert(findButton('Approve and publish draft'),'Admin sees publication control');
findButton('Approve and publish draft').click();
assert(flatten(main).some(n=>String(n.textContent).includes('1 of 3 acknowledged')),'New publication adds assignment');
findButton('Create revised draft').click();findButton('Approve and publish draft').click();
assert(flatten(main).some(n=>String(n.textContent).includes('orientation-demo revision 2: pending')),'New revision requires renewal');
role.value='foreman';role.change();findButton('Return for correction').click();
assert(flatten(main).some(n=>String(n.textContent).includes('returned on revision 1')),'Foreman review binds revision');
console.log('PASS: simulated DOM interactions for employee acknowledgement, admin publication, renewal and FLHA review');
