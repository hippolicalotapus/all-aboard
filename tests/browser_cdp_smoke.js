'use strict';
/* Dependency-free Chromium CDP smoke test. Runs only with explicit invocation. */
const assert=require('node:assert/strict');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {mkdtempSync,rmSync}=require('node:fs');
const os=require('node:os');
const root=path.resolve(__dirname,'..');
const allowed=new Set(['pilot/workforce-onboarding.html','source/safety-document-model.js','source/onboarding-workflow.js','source/safety-revision-lifecycle.js','source/onboarding-completion-records.js','source/safety-audit-trail.js','source/safety-audit-consistency.js','pilot/daily-operations.html','source/daily-operations-report.js','source/daily-operations-pilot.js','source/daily-report-lifecycle.js']);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function run(){
 const server=http.createServer((req,res)=>{const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\//,'');if(!allowed.has(rel)){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',rel.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,rel)));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 const dir=mkdtempSync(path.join(os.tmpdir(),'all-aboard-cdp-'));
 const browser=spawn(process.env.CHROMIUM_BIN||'chromium',['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--remote-debugging-port=0','--remote-allow-origins=*','--user-data-dir='+dir,'about:blank'],{stdio:['ignore','ignore','pipe']});
 let browserErrors='';browser.stderr.on('data',chunk=>{browserErrors+=chunk.toString().slice(-2000);});
 try{
  let debugPort;
  for(let i=0;i<80;i++){if(browser.exitCode!==null)throw Error('Chromium exited before DevTools started');const f=path.join(dir,'DevToolsActivePort');if(fs.existsSync(f)){debugPort=Number(fs.readFileSync(f,'utf8').split('\n')[0]);break;}await delay(100);}
  assert(debugPort,'Chromium DevTools port unavailable: '+browserErrors.slice(-1200));
  const pages=await (await fetch('http://127.0.0.1:'+debugPort+'/json')).json();
  const target=pages.find(p=>p.type==='page');assert(target,'No browser page');
  const socket=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  let id=0;const pending=new Map();
  socket.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){const p=pending.get(msg.id);pending.delete(msg.id);msg.error?p.reject(Error(msg.error.message)):p.resolve(msg.result);}});
  function command(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});socket.send(JSON.stringify({id:n,method,params}));});}
  async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
  await command('Page.enable');await command('Runtime.enable');
  await command('Page.navigate',{url:'http://127.0.0.1:'+port+'/pilot/workforce-onboarding.html'});
  let ready=false;for(let i=0;i<80;i++){ready=await evaluate('typeof OnboardingWorkflow!=="undefined" && document.querySelectorAll("button").length>0');if(ready)break;await delay(100);}assert(ready,'Pilot failed to load');
  const act=async expression=>{const value=await evaluate(expression);assert.equal(value,true,expression);};
  await act('(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent==="Read document");if(!b)return false;b.click();return !!document.querySelector("input[type=checkbox]")})()');
  await act('(()=>{const c=document.querySelector("input[type=checkbox]");c.checked=true;c.dispatchEvent(new Event("change"));const b=[...document.querySelectorAll("button")].find(x=>x.textContent==="Acknowledge this revision");if(!b||b.disabled)return false;b.click();return document.body.textContent.includes("1 of 2 acknowledged")})()');
  await act('(()=>{const s=document.querySelector("#role");s.value="safety-admin";s.dispatchEvent(new Event("change"));return document.body.textContent.includes("Audit consistency: passed")})()');
  await act('(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent==="Create new draft");b.click();return !![...document.querySelectorAll("button")].find(x=>x.textContent==="Approve and publish draft")})()');
  await act('(()=>{[...document.querySelectorAll("button")].find(x=>x.textContent==="Approve and publish draft").click();return document.body.textContent.includes("1 of 3 acknowledged")})()');
  await act('(()=>{[...document.querySelectorAll("button")].find(x=>x.textContent==="Create revised draft").click();[...document.querySelectorAll("button")].find(x=>x.textContent==="Approve and publish draft").click();return document.body.textContent.includes("orientation-demo revision 2: pending")&&document.body.textContent.includes("Audit consistency: passed")})()');
  await act('(()=>{const s=document.querySelector("#role");s.value="employee";s.dispatchEvent(new Event("change"));return !document.querySelector("main")?.textContent.includes("Fictional audit events")})()');
  await act('(()=>{const s=document.querySelector("#role");s.value="foreman";s.dispatchEvent(new Event("change"));[...document.querySelectorAll("button")].find(x=>x.textContent==="Return for correction").click();return document.body.textContent.includes("returned on revision 1")})()');
  await command('Page.navigate',{url:'http://127.0.0.1:'+port+'/pilot/daily-operations.html'});
  let daily=false;for(let i=0;i<80;i++){daily=await evaluate('typeof DailyReportLifecycle!=="undefined" && document.body.textContent.includes("Items requiring attention")');if(daily)break;await delay(100);}assert(daily,'Daily operations pilot failed to load');
  await act('(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent==="Dismiss fictional plan-1");if(!b)return false;b.click();return document.body.textContent.includes("No unresolved exceptions")})()');
  await act('(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent==="Approve daily report");if(!b)return false;b.click();return document.body.textContent.includes("foreman-approved")})()');
  await act('(()=>{const b=[...document.querySelectorAll("button")].find(x=>x.textContent==="Reopen approved report");if(!b)return false;b.click();return document.body.textContent.includes("Status: draft")})()');
  await act('(()=>{const s=document.querySelector("#role");s.value="accounting";s.dispatchEvent(new Event("change"));return document.body.textContent.includes("120 metres")&&!document.body.textContent.includes("Approve daily report")})()');
  await act('(()=>{const s=document.querySelector("#role");s.value="employee";s.dispatchEvent(new Event("change"));return document.body.textContent.includes("Access restricted")&&!document.body.textContent.includes("120 metres")})()');
  socket.close();console.log('PASS: real Chromium CDP onboarding and daily operations role/approval workflows');
 }finally{browser.kill('SIGKILL');await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
