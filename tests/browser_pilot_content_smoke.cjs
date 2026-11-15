'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..');const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+(req.url||'/'));if(!p.startsWith(root+path.sep)||!fs.existsSync(p)){res.writeHead(404);res.end('not found');return;}res.setHeader('Content-Type',p.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(p))});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'aboard-browser-'));
 const browser=spawn('/usr/bin/chromium',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+temp,'about:blank'],{stdio:'ignore'});
 try{
  let port;for(let i=0;i<100;i++){const p=path.join(temp,'DevToolsActivePort');if(fs.existsSync(p)){port=Number(fs.readFileSync(p,'utf8').split('\n')[0]);break;}await wait(100)}assert(port,'Chromium debug port unavailable');
  const tabs=await(await fetch('http://localhost:'+port+'/json')).json();const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(ok=>ws.addEventListener('open',ok,{once:true}));
  let seq=0;const pending=new Map();ws.addEventListener('message',ev=>{const v=JSON.parse(ev.data);if(v.id&&pending.has(v.id)){const p=pending.get(v.id);pending.delete(v.id);v.error?p.reject(Error(v.error.message)):p.resolve(v.result)}});
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
  const evaluate=async expression=>{const v=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(v.exceptionDetails)throw Error(JSON.stringify(v.exceptionDetails));return v.result.value};
  await cmd('Page.enable');await cmd('Runtime.enable');
  let page=fs.readFileSync(path.join(root,'pilot/daily-operations.html'),'utf8');
  page=page.replace(/<script src="\.\.\/source\/([^"]+)"[^>]*><\/script>/g,(_,name)=>'<script>'+fs.readFileSync(path.join(root,'source',name),'utf8')+'</script>');
  await evaluate('document.open();document.write('+JSON.stringify(page)+');document.close()');
  for(let i=0;i<100;i++){if(await evaluate('document.readyState==="complete"&&!!document.querySelector("#view section")'))break;await wait(50)}
  const pageText=()=>evaluate('document.querySelector("#view").innerText');
  assert.match(await pageText(),/plan-1: not-verified-actual/);
  assert.match(await pageText(),/Status: draft/);
  await evaluate('Array.from(document.querySelectorAll("button")).find(x=>x.textContent==="Approve daily report").click()');
  assert.match(await pageText(),/Unresolved exceptions/);
  await evaluate('Array.from(document.querySelectorAll("button")).find(x=>x.textContent.includes("Dismiss fictional plan-1")).click()');
  assert.match(await pageText(),/No unresolved exceptions/);
  await evaluate('Array.from(document.querySelectorAll("button")).find(x=>x.textContent==="Approve daily report").click()');
  assert.match(await pageText(),/Status: foreman-approved/);
  await evaluate('document.querySelector("#role").value="accounting";document.querySelector("#role").dispatchEvent(new Event("change"))');
  assert.doesNotMatch(await pageText(),/Approve daily report/);
  assert.match(await pageText(),/Read-only operational overview/);
  await evaluate('document.querySelector("#role").value="employee";document.querySelector("#role").dispatchEvent(new Event("change"))');
  assert.match(await pageText(),/Access restricted/);
  await evaluate('document.querySelector("#role").value="foreman";document.querySelector("#role").dispatchEvent(new Event("change"))');
  await evaluate('Array.from(document.querySelectorAll("button")).find(x=>x.textContent==="Reopen approved report").click()');
  assert.match(await pageText(),/Status: draft/);
  assert.match(await pageText(),/3. reopen by fictional-foreman/);
  console.log('PASS: REAL Chromium original fictional daily operations UI: blocked exception, dismiss, approval, accounting read-only, employee denied, reopen and audit');
  ws.close();
 }finally{browser.kill('SIGKILL');await new Promise(ok=>server.close(ok));await wait(300);try{fs.rmSync(temp,{recursive:true,force:true,maxRetries:8,retryDelay:150})}catch(e){}}
})().catch(e=>{console.error(e);process.exitCode=1});
