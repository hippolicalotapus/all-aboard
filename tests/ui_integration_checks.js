'use strict';
// Executes the complete shipped inline script against a small DOM double.
// This verifies event wiring/state, not browser layout, native downloads or Android.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../source/all-aboard-personal.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
class Element {
 constructor(tag='div'){this.tag=tag;this.children=[];this.listeners={};this.value='';this.checked=false;this.disabled=false;this.hidden=false;this.style={};this.attrs={};this.textContent='';this.files=[];}
 append(...nodes){this.children.push(...nodes)}
 replaceChildren(...nodes){this.children=[...nodes]}
 addEventListener(name,fn){(this.listeners[name]??=[]).push(fn)}
 setAttribute(name,value){this.attrs[name]=value}
 removeAttribute(name){delete this.attrs[name]}
 remove(){}
 click(){return this.dispatch('click')}
 async dispatch(name){for(const fn of this.listeners[name]||[])await fn({target:this,preventDefault(){}})}
}
function boot(data=new Map(),fault={}){
 const elements=new Map(),copied=[];
 for(const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)){
  const [,tag,attrs,id]=match;assert(!elements.has(id),'duplicate DOM id: '+id);
  const e=new Element(tag);e.value=attrs.match(/\bvalue="([^"]*)"/)?.[1]||'';e.disabled=/\bdisabled\b/.test(attrs);e.hidden=/\bhidden\b/.test(attrs);
  if(tag==='select'){const options=html.slice(match.index+match[0].length).split('</select>')[0];e.value=options.match(/<option[^>]*value="([^"]*)"/)?.[1]||''}
  elements.set(id,e);
 }
 const context={console,Blob,URL,setTimeout(){},clearTimeout(){},navigator:fault.clipboardUnavailable?{}:{clipboard:{async writeText(text){if(fault.clipboardDenied)throw Error('denied');copied.push(text)}}},confirm:()=>!fault.cancel,localStorage:{getItem(k){return data.get(k)??null},setItem(k,v){if(fault.quota)throw Error('full');data.set(k,v)},removeItem(k){data.delete(k)}},document:{getElementById:id=>{assert(elements.has(id),'missing element '+id);return elements.get(id)},createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),body:new Element('body')}};
 context.window=context;vm.runInNewContext(script,context,{timeout:2000});
 return {el:id=>elements.get(id),data,fault,copied};
}
function firstTask(ui){return ui.el('workflowTasks').children[0].children[0]}
let count=0;async function check(name,fn){await fn();count++;console.log('PASS:',name)}
(async()=>{
 const data=new Map([['onboardflow-fictional-wallet-v2','[]']]);let ui=boot(data);
 await check('complete page script initializes the wallet workspace',()=>{assert(!ui.el('walletWorkspace').hidden);assert(ui.el('companyWorkspace').hidden);assert.match(ui.el('storage').textContent,/Storage works/)});
 await check('workspace buttons switch panels without changing saved data',async()=>{await ui.el('openCompany').click();assert(ui.el('walletWorkspace').hidden);assert(!ui.el('companyWorkspace').hidden);assert.equal(data.get('onboardflow-fictional-wallet-v2'),'[]');await ui.el('openTesting').click();assert(!ui.el('testingWorkspace').hidden);await ui.el('openWallet').click();assert(!ui.el('walletWorkspace').hidden)});
 await check('real checkbox handler saves progress and survives script restart',async()=>{const input=firstTask(ui);input.checked=true;await input.dispatch('change');assert.match(ui.el('workflowStorageStatus').textContent,/saved and read back/);ui=boot(data);assert(firstTask(ui).checked)});
 const backup=data.get('onboarding-fictional-workflows-v1');
 await check('role changes keep progress isolated',async()=>{ui.el('workflowRole').value='field';await ui.el('workflowRole').dispatch('change');assert(!firstTask(ui).checked);ui.el('workflowRole').value='office';await ui.el('workflowRole').dispatch('change');assert(firstTask(ui).checked)});
 await check('restore preview does not replace data and cancellation is effective',async()=>{ui.el('workflowImport').files=[{size:10,text:async()=>'{"format":"onboarding-fictional-workflows-v1","plans":[]}'}];await ui.el('workflowImport').dispatch('change');assert(!ui.el('workflowRestore').disabled);assert.equal(data.get('onboarding-fictional-workflows-v1'),backup);await ui.el('workflowCancelRestore').click();assert(ui.el('workflowRestore').disabled)});
 await check('failed checkbox save is rolled back in the displayed checklist',async()=>{ui.fault.quota=true;const input=firstTask(ui);input.checked=false;await input.dispatch('change');assert(firstTask(ui).checked);assert.match(ui.el('workflowStorageStatus').textContent,/SAVE FAILED/);assert.equal(data.get('onboarding-fictional-workflows-v1'),backup);ui.fault.quota=false});
 await check('corrupt saved progress blocks edits and confirmed recovery preserves wallet',async()=>{data.set('onboarding-fictional-workflows-v1','broken');ui=boot(data);assert(firstTask(ui).disabled);assert.equal(data.get('onboarding-fictional-workflows-v1'),'broken');await ui.el('workflowRecover').click();assert(!firstTask(ui).disabled);assert.equal(data.get('onboardflow-fictional-wallet-v2'),'[]')});
 await check('validated backup restores through actual UI handlers',async()=>{ui.el('workflowImport').files=[{size:backup.length,text:async()=>backup}];await ui.el('workflowImport').dispatch('change');assert.match(ui.el('workflowRestorePreview').textContent,/Inspected 1 checklist/);await ui.el('workflowRestore').click();assert(firstTask(ui).checked);assert(ui.el('workflowRestore').disabled)});
 await check('invalid backup is rejected through UI without overwriting progress',async()=>{const before=data.get('onboarding-fictional-workflows-v1');ui.el('workflowImport').files=[{size:3,text:async()=>'bad'}];await ui.el('workflowImport').dispatch('change');assert.match(ui.el('workflowRestorePreview').textContent,/Backup rejected/);assert(ui.el('workflowRestore').disabled);assert.equal(data.get('onboarding-fictional-workflows-v1'),before)});
 await check('reset cancellation preserves current progress',async()=>{ui.fault.cancel=true;await ui.el('workflowReset').click();assert(firstTask(ui).checked);ui.fault.cancel=false});
 await check('deadline event saves a date without losing acknowledged progress',async()=>{const date=ui.el('workflowTasks').children[1].children[1];date.value='2000-01-01';await date.dispatch('change');assert(firstTask(ui).checked);ui=boot(data);assert.equal(ui.el('workflowTasks').children[1].children[1].value,'2000-01-01');assert(firstTask(ui).checked)});
 await check('reopening a task preserves its deadline and adds attention',async()=>{const input=firstTask(ui);input.checked=false;await input.dispatch('change');assert.equal(ui.el('workflowTasks').children[1].children[1].value,'2000-01-01');assert.match(ui.el('workflowAttentionSummary').textContent,/1 overdue/)});
 await check('deadline filters show only matching tasks with an empty state',async()=>{ui.el('workflowTaskFilter').value='overdue';await ui.el('workflowTaskFilter').dispatch('change');assert.equal(ui.el('workflowTasks').children.length,3);ui.el('workflowTaskFilter').value='today';await ui.el('workflowTaskFilter').dispatch('change');assert.equal(ui.el('workflowTasks').children[0].textContent,'No steps match this filter.');ui.el('workflowTaskFilter').value='all';await ui.el('workflowTaskFilter').dispatch('change')});
 await check('attention item navigates to a different saved checklist',async()=>{ui.el('workflowKind').value='offboarding';await ui.el('workflowKind').dispatch('change');const date=ui.el('workflowTasks').children[1].children[1];date.value='2000-01-02';await date.dispatch('change');ui.el('workflowKind').value='onboarding';await ui.el('workflowKind').dispatch('change');const row=ui.el('workflowAttention').children.find(row=>row.children[0]?.textContent.includes('(offboarding,'));assert(row);await row.children[1].click();assert.equal(ui.el('workflowKind').value,'offboarding');assert.equal(ui.el('workflowTaskFilter').value,'all')});
 await check('invalid deadline import is rejected without replacing saved checklists',async()=>{const before=data.get('onboarding-fictional-workflows-v1');const bad={format:'onboarding-fictional-workflows-v1',plans:[{kind:'onboarding',role:'office',site:'office',completed:[],dueDates:{start:'2026-02-29'}}]};ui.el('workflowImport').files=[{size:300,text:async()=>JSON.stringify(bad)}];await ui.el('workflowImport').dispatch('change');assert.match(ui.el('workflowRestorePreview').textContent,/Backup rejected/);assert.equal(data.get('onboarding-fictional-workflows-v1'),before)});
 await check('generated review draft is readable, scoped and invalidated after saving or switching',async()=>{
  ui=boot(new Map());ui.el('taskReviewTask').value='start';ui.el('taskReviewNote').value='Fictional start note';ui.el('taskReviewStatus').value='pending';
  await ui.el('taskReviewSave').click();const saved=new Map(ui.data);
  await ui.el('taskReviewReport').click();let text=ui.el('taskReviewReportOutput').textContent;
  assert.match(text,/Checklist review draft/);assert.match(text,/Confirm start arrangements — Manager/);assert.match(text,/Fictional start note/);assert.match(text,/Review: Not requested/);assert.doesNotMatch(text,/\"format\"/);assert.deepEqual(ui.data,saved);
  ui.el('taskReviewNote').value='Changed saved note';await ui.el('taskReviewSave').click();assert.doesNotMatch(ui.el('taskReviewReportOutput').textContent,/Fictional start note/);
  await ui.el('taskReviewReport').click();assert.match(ui.el('taskReviewReportOutput').textContent,/Changed saved note/);
  ui.el('workflowKind').value='offboarding';await ui.el('workflowKind').dispatch('change');assert.doesNotMatch(ui.el('taskReviewReportOutput').textContent,/Changed saved note/);
  await ui.el('taskReviewReport').click();text=ui.el('taskReviewReportOutput').textContent;assert.match(text,/Offboarding/);assert.doesNotMatch(text,/Changed saved note/);
 });
 await check('copy uses the visible draft and blocks stale or absent reports',async()=>{
  ui=boot(new Map());assert(ui.el('taskReviewCopy').disabled);await ui.el('taskReviewCopy').click();assert.equal(ui.copied.length,0);
  await ui.el('taskReviewReport').click();assert(!ui.el('taskReviewCopy').disabled);const draft=ui.el('taskReviewReportOutput').textContent;await ui.el('taskReviewCopy').click();assert.deepEqual(ui.copied,[draft]);assert.match(ui.el('taskReviewCopyStatus').textContent,/copied/);
  ui.el('workflowRole').value='field';await ui.el('workflowRole').dispatch('change');assert(ui.el('taskReviewCopy').disabled);await ui.el('taskReviewCopy').click();assert.equal(ui.copied.length,1);
 });
 await check('clipboard refusal keeps the readable draft and offers manual copy',async()=>{
  ui=boot(new Map(),{clipboardDenied:true});await ui.el('taskReviewReport').click();const draft=ui.el('taskReviewReportOutput').textContent;await ui.el('taskReviewCopy').click();assert.match(ui.el('taskReviewCopyStatus').textContent,/Select the report text/);assert.equal(ui.el('taskReviewReportOutput').textContent,draft);assert.deepEqual(ui.copied,[]);
  ui=boot(new Map(),{clipboardUnavailable:true});await ui.el('taskReviewReport').click();await ui.el('taskReviewCopy').click();assert.match(ui.el('taskReviewCopyStatus').textContent,/Select the report text/);
 });
 console.log('PASS:',count,'full-script DOM integration scenarios (not browser E2E)');
})().catch(error=>{console.error(error);process.exitCode=1});
