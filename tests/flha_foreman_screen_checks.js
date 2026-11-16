'use strict';
// Offline DOM interaction smoke tests: no browser, authentication, persistence, or work authorization.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'pilot/flha-foreman.html'),'utf8');
const workflow=require('../source/flha-workflow');
const report=require('../source/flha-foreman-report');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(Boolean);
assert.equal(scripts.length,1,'Exactly one inline controller script expected');
new vm.Script(scripts[0],{filename:'flha-foreman.html'});
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.handlers={};this.style={};this.value='';this.checked=false;this.disabled=false;this.textContent='';}
 append(...items){this.children.push(...items)}
 prepend(...items){this.children.unshift(...items)}
 replaceChildren(...items){this.children=items}
 addEventListener(type,fn){this.handlers[type]=fn}
 click(){assert.equal(this.disabled,false,'Disabled action cannot be clicked');this.handlers.click?.()}
 change(){this.handlers.change?.()}
}
const elements=new Map();
const document={createElement:tag=>new Element(tag),getElementById:id=>{if(!elements.has(id))elements.set(id,new Element('div'));return elements.get(id)}};
const el=id=>document.getElementById(id);
el('filter').value='all';
const context={document,FLHAWorkflow:workflow,FLHAForemanReport:report};
context.globalThis=context;
vm.runInNewContext(scripts[0],context,{timeout:2500});
const walk=item=>[item,...(item.children||[]).flatMap(walk)];
const queue=()=>walk(el('crew'));
const namedButton=name=>queue().find(item=>item.tagName==='button'&&item.textContent===name);
assert.match(el('counts').textContent,/Missing: 3/);
el('seed').click();
assert.match(el('counts').textContent,/Submitted: 1/);
assert.equal(namedButton('Record foreman review').disabled,true);
const checkbox=queue().find(item=>item.tagName==='input'&&item.type==='checkbox');
checkbox.checked=true;checkbox.change();
namedButton('Record foreman review').click();
assert.match(el('counts').textContent,/Reviewed: 1/);
assert.match(el('alerts').textContent,/No work authorization/);
el('change').click();
assert.match(el('counts').textContent,/Reviewed: 0/);
assert.match(el('counts').textContent,/Submitted: 0/);
el('reset').click();
assert.match(el('counts').textContent,/Missing: 3/);
el('seed').click();
const reason=queue().find(item=>item.tagName==='input'&&item.type==='text');
reason.value='Add access boundary';namedButton('Return for correction').click();
assert.match(el('counts').textContent,/Returned: 1/);
el('filter').value='returned';el('filter').change();
assert.equal(el('crew').children.length,1);
console.log('PASS: fictional foreman queue, exact-revision confirmation, stale invalidation, correction return, filter and reset');
