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
const repository=require('../source/daily-report-repository'),localApi=require('../source/daily-report-local-api'),sessionsModule=require('../source/daily-report-session-store');
const allowed=new Set(['pilot/workforce-onboarding.html','source/safety-document-model.js','source/onboarding-workflow.js','source/safety-revision-lifecycle.js','source/onboarding-completion-records.js','source/safety-audit-trail.js','source/safety-audit-consistency.js','pilot/daily-operations.html','source/daily-operations-report.js','source/daily-operations-pilot.js','source/daily-report-lifecycle.js','pilot/persistent-daily-operations.html']);
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function run(){
 const dbdir=mkdtempSync(path.join(os.tmpdir(),'aa-browser-db-'));
 const db=repository.create(path.join(dbdir,'data'),path.join(dbdir,'trusted'));
 const ctx={companyId:'demo',projectId:'project-1',date:'2026-11-13'},foreman={id:'browser-foreman',role:'foreman',companyId:'demo',projectId:'project-1'},office={id:'browser-office',role:'accounting',companyId:'demo',projectIds:['project-1']};
 db.init('pilot',[{...ctx,id:'time-1',kind:'time',quantity:8,unit:'hours',sourceId:'clock-1',status:'verified'}],ctx,foreman);
 const api=localApi.createServer(db,new Map([['foreman',foreman],['office',office]]));
 const sessions=sessionsModule.createSessionStore(),secureForeman=sessions.issue(foreman),secureOffice=sessions.issue(office);
 const secureApi=localApi.createServer(db,new Map(),sessions);
 const server=http.createServer((req,res)=>{if(req.url==='/daily-report'){api.emit('request',req,res);return;}if(req.url==='/secure-daily-report'){req.url='/daily-report';secureApi.emit('request',req,res);return;}const rel=decodeURIComponent((req.url||'/').split('?')[0]).replace(/^\//,'');if(!allowed.has(rel)){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',rel.endsWith('.html')?'text/html; charset=utf-8':'text/javascript; charset=utf-8');res.end(fs.readFileSync(path.join(root,rel)));});
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
  await act('(()=>{const s=document.querySelector("#role");s.value="accounting";s.dispatchEvent(new Event("change"));return document.querySelector("main").textContent.includes("120 metres")&&![...document.querySelectorAll("main button")].some(b=>b.textContent==="Approve daily report")})()');
  await act('(()=>{const s=document.querySelector("#role");s.value="employee";s.dispatchEvent(new Event("change"));return document.querySelector("main").textContent.includes("Access restricted")&&!document.querySelector("main").textContent.includes("120 metres")})()');
  await command('Page.navigate',{url:'http://127.0.0.1:'+port+'/pilot/persistent-daily-operations.html'});
  let persistent=false;for(let i=0;i<80;i++){persistent=await evaluate('document.querySelector("#result")?.textContent.includes("Status: draft")');if(persistent)break;await delay(100);}assert(persistent,'Persistent browser pilot failed');
  await act('(async()=>{document.querySelector("#approve").click();for(let i=0;i<40;i++){if(document.querySelector("#result").textContent.includes("foreman-approved"))return true;await new Promise(r=>setTimeout(r,50));}return false})()');
  await command('Page.reload',{ignoreCache:true});let reloaded=false;for(let i=0;i<80;i++){reloaded=await evaluate('document.querySelector("#result")?.textContent.includes("foreman-approved")');if(reloaded)break;await delay(100);}assert(reloaded,'Approved report did not survive reload');
  await act('(async()=>{document.querySelector("#stale").click();for(let i=0;i<40;i++){if(document.querySelector("#result").textContent.includes("revision conflict"))return true;await new Promise(r=>setTimeout(r,50));}return false})()');
  await act('(async()=>{const s=document.querySelector("#session");s.value="office";s.dispatchEvent(new Event("change"));for(let i=0;i<40;i++){if(document.querySelector("#result").textContent.includes("foreman-approved"))break;await new Promise(r=>setTimeout(r,50));}document.querySelector("#approve").click();for(let i=0;i<40;i++){if(document.querySelector("#result").textContent.includes("Request denied"))return true;await new Promise(r=>setTimeout(r,50));}return false})()');
  await act('(async()=>{const s=document.querySelector("#session");s.value="employee";s.dispatchEvent(new Event("change"));for(let i=0;i<40;i++){if(document.querySelector("#result").textContent.includes("Request denied"))return true;await new Promise(r=>setTimeout(r,50));}return false})()');
  // Simulate an on-disk modification without updating the separately stored trusted audit head.
  const recordFile=path.join(dbdir,'data','demo__project-1__pilot.json');
  const original=fs.readFileSync(recordFile,'utf8'),forged=JSON.parse(original);
  forged.events[0].actorId='forged-actor';
  fs.writeFileSync(recordFile,JSON.stringify(forged));
  await act('(async()=>{const s=document.querySelector("#session");s.value="foreman";s.dispatchEvent(new Event("change"));for(let i=0;i<40;i++){if(document.querySelector("#result").textContent.includes("Audit hash mismatch"))return true;await new Promise(r=>setTimeout(r,50));}return false})()');
  fs.writeFileSync(recordFile,original);
  // Browser-to-server checks with opaque bearer tokens; role claims in the request are ignored.
  const secureUrl='http://127.0.0.1:'+port+'/secure-daily-report';
  await act('(async()=>{const r=await fetch('+JSON.stringify(secureUrl)+',{headers:{"x-test-session":"foreman"}});return r.status===401})()');
  await act('(async()=>{const r=await fetch('+JSON.stringify(secureUrl)+',{headers:{authorization:"Bearer '+secureOffice+'"}});return r.status===200})()');
  await act('(async()=>{const r=await fetch('+JSON.stringify(secureUrl)+',{method:"POST",headers:{authorization:"Bearer '+secureOffice+'","content-type":"application/json"},body:JSON.stringify({role:"foreman",command:{type:"reopen",actionId:"forged-office",expectedRevision:2,reason:"Office impersonation"}})});return r.status!==200})()');
  sessions.revoke(secureOffice);
  await act('(async()=>{const r=await fetch('+JSON.stringify(secureUrl)+',{headers:{authorization:"Bearer '+secureOffice+'"}});return r.status===401})()');
  socket.close();console.log('PASS: real Chromium CDP onboarding, daily operations, persisted approval, reload and role restrictions');
 }finally{browser.kill('SIGKILL');await new Promise(resolve=>server.close(resolve));await delay(250);try{rmSync(dbdir,{recursive:true,force:true});}catch(e){console.warn('Browser DB cleanup warning:',e.message);}try{rmSync(dir,{recursive:true,force:true,maxRetries:8,retryDelay:150});}catch(e){console.warn('Browser profile cleanup warning:',e.message);}}
}
run().catch(e=>{console.error(e);process.exitCode=1;});
