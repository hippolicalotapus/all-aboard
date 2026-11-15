'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../pilot/daily-operations.html'),'utf8');
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(Boolean);assert(inline);
function element(tag){return {tag,children:[],value:'foreman',textContent:'',focus(){document.activeElement=this},setAttribute(n,v){this[n]=v},append(...xs){this.children.push(...xs)},replaceChildren(...xs){this.children=xs},addEventListener(n,f){this[n]=f}}}
const main=element('main'),role=element('select');const document={createElement:element,getElementById:id=>id==='view'?main:id==='role'?role:all(main).find(n=>n.id===id)};
const report=require('../source/daily-operations-report'),pilot=require('../source/daily-operations-pilot');
vm.runInNewContext(inline,{document,DailyOperationsReport:report,DailyOperationsPilot:pilot,DailyReportLifecycle:require('../source/daily-report-lifecycle')},{timeout:2000});
function all(n){return [n,...(n.children||[]).flatMap(all)]}
function has(t){return all(main).some(x=>String(x.textContent).includes(t))}
function press(t){const b=all(main).find(x=>x.tag==='button'&&x.textContent===t);assert(b,'Missing '+t);b.click();}
assert(has('Items requiring attention'));assert(has('Planned or unverified entry — excluded from actuals'));assert(has('No review actions yet.'));
const approval=()=>all(main).find(x=>x.tag==='button'&&x.textContent==='Approve daily report');
assert.equal(approval().disabled,true,'Approval must be disabled while exceptions need review');
assert(has('Review 1 item before approval'));

const field=id=>all(main).find(n=>n.id===id);
assert(field('correct-time-1'),'Foreman must have a correction control');
assert(!field('reopen-reason'),'Draft must not expose reopening');
field('quantity-time-1').value='';field('reason-time-1').value='Fictional shift correction';press('Save time correction');assert(has('Enter a valid non-negative quantity'));assert(has('time: 8 hours'));
field('quantity-time-1').value='7.5';field('reason-time-1').value='short';press('Save time correction');assert(has('time: 7.5 hours'));assert(has('8 → 7.5'));assert(has('correct by fictional-foreman'));assert.equal(document.activeElement.id,'correct-time-1');
field('quantity-time-1').value='9';field('reason-time-1').value='';press('Save time correction');assert(has('Give a reason of 5 to 500 characters'));assert(has('time: 7.5 hours'));
press('Cancel time correction');assert.equal(field('quantity-time-1').value,'7.5');assert.equal(field('reason-time-1').value,'');
press('Approve daily report');assert(has('Unresolved exceptions'));
press('Dismiss fictional plan-1');assert.equal(approval().disabled,false,'Resolved report must enable approval');assert(has('Ready for foreman review'));press('Approve daily report');assert(has('foreman-approved'));assert(!field('correct-time-1'),'Approved report must not expose corrections');assert(has('Fictional report history'));assert(has('exclude by fictional-foreman'));assert(has('approve by fictional-foreman'));
role.value='foreman';role.change();
const eventsBeforeReopen=all(main).filter(x=>/^\d+\. /.test(x.textContent)).length;
press('Reopen approved report');assert(has('Status: foreman-approved'),'Missing reason must retain approval');assert(has('Reopen reason required'));assert.equal(all(main).filter(x=>/^\d+\. /.test(x.textContent)).length,eventsBeforeReopen,'Invalid reason must not add events');
const reopenReason=field('reopen-reason');assert(reopenReason,'Approved foreman must have a visible reason input');assert.equal(reopenReason.value,'','Reason must start empty');assert(all(main).some(x=>x.tag==='label'&&x.htmlFor===reopenReason.id),'Reason field must have a visible label');
for(const reason of ['   ','four']){reopenReason.value=reason;press('Reopen approved report');assert(has('Status: foreman-approved'));assert(has('Reopen reason required'));assert.equal(all(main).filter(x=>/^\d+\. /.test(x.textContent)).length,eventsBeforeReopen);}
const enteredReason='  Correct verified shift hours  ';reopenReason.value=enteredReason;press('Reopen approved report');assert(has('Status: draft'));assert(has('reopen by fictional-foreman'));
assert(all(main).some(x=>x.textContent==='4. reopen by fictional-foreman — '+enteredReason),'Audit must record the exact supplied reason');assert(!field('reopen-reason'),'Draft must not expose reopening');
press('Approve daily report');assert(has('foreman-approved'));assert.equal(field('reopen-reason').value,'','Next reopen must require a fresh reason');
role.value='superintendent';role.change();assert(has('foreman-approved'));assert(!field('reopen-reason'),'Read-only view must not expose reopen input');assert(!field('correct-time-1'),'Approved report must not expose corrections');assert(has('Fictional report history'));assert(!all(main).some(x=>x.tag==='button'));
role.value='accounting';role.change();assert(has('120 metres'));assert(!all(main).some(x=>x.tag==='button'));
role.value='employee';role.change();assert(has('Access restricted'));assert(!has('120 metres'));
const ctx={companyId:'demo',projectId:'project-1',date:'2026-11-13'};
const entry={...ctx,id:'x',kind:'time',quantity:1,unit:'hour',sourceId:'s',status:'verified'};
const r=report.build([entry],ctx);
assert.throws(()=>pilot.view(r,{role:'superintendent',companyId:'other',projectIds:['project-1']}),/Company/);
assert.throws(()=>pilot.view(r,{role:'accounting',companyId:'demo',projectIds:['other']}),/Role/);
assert.throws(()=>pilot.resolve([entry],'x',{role:'foreman',companyId:'other',projectId:'project-1'}),/access/);
console.log('PASS: fictional daily operations DOM interaction, exceptions, approvals and role restrictions');
