'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../pilot/daily-operations.html'),'utf8');
const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(x=>x[1]).find(Boolean);assert(inline);
function element(tag){return {tag,children:[],value:'foreman',textContent:'',append(...xs){this.children.push(...xs)},replaceChildren(...xs){this.children=xs},addEventListener(n,f){this[n]=f}}}
const main=element('main'),role=element('select');const document={createElement:element,getElementById:id=>id==='view'?main:role};
const report=require('../source/daily-operations-report'),pilot=require('../source/daily-operations-pilot');
vm.runInNewContext(inline,{document,DailyOperationsReport:report,DailyOperationsPilot:pilot,DailyReportLifecycle:require('../source/daily-report-lifecycle')},{timeout:2000});
function all(n){return [n,...(n.children||[]).flatMap(all)]}
function has(t){return all(main).some(x=>String(x.textContent).includes(t))}
function press(t){const b=all(main).find(x=>x.tag==='button'&&x.textContent===t);assert(b,'Missing '+t);b.click();}
assert(has('Items requiring attention'));assert(has('Planned or unverified entry — excluded from actuals'));assert(has('No review actions yet.'));
const approval=()=>all(main).find(x=>x.tag==='button'&&x.textContent==='Approve daily report');
assert.equal(approval().disabled,true,'Approval must be disabled while exceptions need review');
assert(has('Review 1 item before approval'));

press('Approve daily report');assert(has('Unresolved exceptions'));
press('Dismiss fictional plan-1');assert.equal(approval().disabled,false,'Resolved report must enable approval');assert(has('Ready for foreman review'));press('Approve daily report');assert(has('foreman-approved'));assert(has('Fictional report history'));assert(has('exclude by fictional-foreman'));assert(has('approve by fictional-foreman'));
role.value='foreman';role.change();press('Reopen approved report');assert(has('Status: draft'));assert(has('reopen by fictional-foreman'));press('Approve daily report');assert(has('foreman-approved'));
role.value='superintendent';role.change();assert(has('foreman-approved'));assert(has('Fictional report history'));assert(!all(main).some(x=>x.tag==='button'));
role.value='accounting';role.change();assert(has('120 metres'));assert(!all(main).some(x=>x.tag==='button'));
role.value='employee';role.change();assert(has('Access restricted'));assert(!has('120 metres'));
const ctx={companyId:'demo',projectId:'project-1',date:'2026-11-13'};
const entry={...ctx,id:'x',kind:'time',quantity:1,unit:'hour',sourceId:'s',status:'verified'};
const r=report.build([entry],ctx);
assert.throws(()=>pilot.view(r,{role:'superintendent',companyId:'other',projectIds:['project-1']}),/Company/);
assert.throws(()=>pilot.view(r,{role:'accounting',companyId:'demo',projectIds:['other']}),/Role/);
assert.throws(()=>pilot.resolve([entry],'x',{role:'foreman',companyId:'other',projectId:'project-1'}),/access/);
console.log('PASS: fictional daily operations DOM interaction, exceptions, approvals and role restrictions');
