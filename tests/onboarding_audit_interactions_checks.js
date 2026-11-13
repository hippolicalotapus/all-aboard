'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../pilot/workforce-onboarding.html'),'utf8');
const source=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(Boolean)[0];
assert(source,'Inline pilot controller missing');
function element(tag){return {tag,children:[],value:'employee',checked:false,disabled:false,textContent:'',append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},addEventListener(name,fn){this[name]=fn}}}
const main=element('main'),role=element('select');
const document={createElement:element,createTextNode:s=>({textContent:s}),getElementById:id=>id==='view'?main:role};
vm.runInNewContext(source,{document,Set,Date,OnboardingWorkflow:require('../source/onboarding-workflow'),SafetyRevisionLifecycle:require('../source/safety-revision-lifecycle'),OnboardingCompletionRecords:require('../source/onboarding-completion-records'),SafetyAuditTrail:require('../source/safety-audit-trail')},{timeout:2000});
function flat(n){return [n,...(n.children||[]).flatMap(flat)}
function button(label){const x=flat(main).find(n=>n.tag==='button'&&n.textContent===label);assert(x,'Missing button '+label);return x}
function visible(s){return flat(main).some(n=>String(n.textContent).includes(s))}
button('Read document').click();const checkbox=flat(main).find(n=>n.tag==='input');checkbox.checked=true;checkbox.change();button('Acknowledge this revision').click();
role.value='safety-admin';role.change();
assert(visible('employee-acknowledged — swp-1 revision 1'));
button('Create new draft').click();assert(visible('draft-created — orientation-demo revision 1'));
button('Approve and publish draft').click();assert(visible('document-published — orientation-demo revision 1'));
button('Create revised draft').click();assert(visible('revision-created — orientation-demo revision 2'));
button('Approve and publish draft').click();assert(visible('document-published — orientation-demo revision 2'));
role.value='foreman';role.change();button('Return for correction').click();assert(visible('returned on revision 1'));
role.value='safety-admin';role.change();assert(visible('flha-reviewed — flha-1 revision 1 (returned)'));
console.log('PASS: fictional audit event integration through simulated employee, admin and foreman interactions');
