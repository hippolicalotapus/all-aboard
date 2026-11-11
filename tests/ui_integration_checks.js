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
 const elements=new Map();
 for(const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/gi)){
  const [,tag,attrs,id]=match;assert(!elements.has(id),'duplicate DOM id: '+id);
  const e=new Element(tag);e.value=attrs.match(/\bvalue="([^"]*)"/)?.[1]||'';e.disabled=/\bdisabled\b/.test(attrs);e.hidden=/\bhidden\b/.test(attrs);
  if(tag==='select'){const options=html.slice(match.index+match[0].length).split('</select>')[0];e.value=options.match(/<option[^>]*value="([^"]*)"/)?.[1]||''}
  elements.set(id,e);
 }
 const context={console,Blob,URL,setTimeout(){},clearTimeout(){},navigator:{},confirm:()=>!fault.cancel,localStorage:{getItem(k){return data.get(k)??null},setItem(k,v){if(fault.quota)throw Error('full');data.set(k,v)},removeItem(k){data.delete(k)}},document:{getElementById:id=>{assert(elements.has(id),'missing element '+id);return elements.get(id)},createElement:tag=>new Element(tag),createTextNode:text=>({textContent:text}),body:new Element('body')}};
 context.window=context;vm.runInNewContext(script,context,{timeout:2000});
 return {el:id=>elements.get(id),data,fault};
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
 console.log('PASS:',count,'full-script DOM integration scenarios (not browser E2E)');
})().catch(error=>{console.error(error);process.exitCode=1});
