'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||process.cwd()]}));
const html=fs.readFileSync(path.join(__dirname,'../source/all-aboard-personal.html'));
const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)});
(async()=>{
 let browser;
 try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const executablePath=process.env.WORKFLOW_CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
  browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
  const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('#openCompany').click();
  // V39 browser smoke: deadline filters and attention refresh must remain usable.
  await page.locator('#workflowTaskFilter').selectOption('overdue');
  assert.equal(await page.locator('#workflowTaskFilter').inputValue(),'overdue');
  await page.locator('#workflowRefresh').click();
  await page.locator('#workflowTaskFilter').selectOption('upcoming');
  assert.equal(await page.locator('#workflowTaskFilter').inputValue(),'upcoming');
  await page.locator('#workflowTaskFilter').selectOption('all');
  assert.equal(await page.locator('#workflowTaskFilter').inputValue(),'all');
  console.log('PASS: V39 deadline filter and attention refresh controls respond');
  await page.locator('#workflowRole').selectOption('field');await page.locator('#workflowSite').selectOption('jobsite');
  // V39 integration: saving a past deadline updates both the filter and attention queue.
  const yesterday=await page.evaluate(()=>{
    const d=new Date();d.setDate(d.getDate()-1);
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  });
  const firstDeadline=page.locator('#workflowTasks input[type="date"]').first();
  await firstDeadline.fill(yesterday);
  assert.match(await page.locator('#workflowAttention').innerText(),/Confirm start arrangements/);
  await page.locator('#workflowTaskFilter').selectOption('overdue');
  assert.match(await page.locator('#workflowTasks').innerText(),/Confirm start arrangements/);
  await page.reload();await page.locator('#openCompany').click();
  await page.locator('#workflowRole').selectOption('field');await page.locator('#workflowSite').selectOption('jobsite');
  await page.locator('#workflowTaskFilter').selectOption('overdue');
  assert.equal(await page.locator('#workflowTasks input[type="date"]').first().inputValue(),yesterday);
  await page.locator('#workflowTasks input[type="date"]').first().fill('');
  await page.locator('#workflowTaskFilter').selectOption('all');
  console.log('PASS: V39 deadline persists across reload, filters overdue tasks, and appears in attention queue');
  await page.getByRole('checkbox',{name:/Confirm start arrangements/}).check();
  assert.match(await page.locator('#workflowStorageStatus').innerText(),/saved and read back/);
  await page.reload();await page.locator('#openCompany').click();await page.locator('#workflowRole').selectOption('field');await page.locator('#workflowSite').selectOption('jobsite');
  assert(await page.getByRole('checkbox',{name:/Confirm start arrangements/}).isChecked());
  console.log('PASS: checklist acknowledgement survives browser reload');
  await page.locator('#workflowKind').selectOption('offboarding');
  assert(!await page.getByRole('checkbox',{name:/Complete work handover/}).isChecked());
  console.log('PASS: lifecycle checklists retain independent progress');
  const exportPromise=page.waitForEvent('download');await page.locator('#workflowExport').click();
  const download=await exportPromise;const raw=fs.readFileSync(await download.path(),'utf8');assert.equal(JSON.parse(raw).plans[0].completed[0],'start');
  await page.locator('#workflowRecover').click();
  await page.locator('#workflowImport').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await page.getByText(/Inspected 1 checklist/).waitFor();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('onboarding-fictional-workflows-v1')).plans.length),0);
  await page.locator('#workflowRestore').click();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('onboarding-fictional-workflows-v1')).plans.length),1);
  console.log('PASS: exported backup previews before confirmed restore');
  // V40 bundle inspector: read-only, including stale and malformed selection.
  const preflightBefore=await page.evaluate(()=>({
   workflow:localStorage.getItem('onboarding-fictional-workflows-v1'),
   wallet:localStorage.getItem('onboardflow-fictional-wallet-v2'),
   review:localStorage.getItem('onboarding-fictional-task-reviews-v1')
  }));
  const v39Backup=JSON.parse(raw);
  const v40Review={format:'onboarding-fictional-task-reviews-v1',records:[{kind:'onboarding',role:'field',site:'jobsite',taskId:'training',status:'changes-requested',note:'Fictional',evidenceUrl:''}]};
  const selectBundle=async (name,body)=>page.locator('#backupPreflightFile').setInputFiles({name,mimeType:'application/json',buffer:Buffer.from(body)});
  await selectBundle('v39.json',JSON.stringify({workflow:v39Backup}));
  await page.getByText(/Valid bundle: 1 workflow plan\(s\), 0 review record\(s\)/).waitFor();
  await selectBundle('v40.json',JSON.stringify({review:v40Review}));
  await page.getByText(/Valid bundle: 0 workflow plan\(s\), 1 review record\(s\)/).waitFor();
  await selectBundle('combined.json',JSON.stringify({workflow:v39Backup,review:v40Review}));
  await page.getByText(/Valid bundle: 1 workflow plan\(s\), 1 review record\(s\)/).waitFor();
  await selectBundle('invalid-review.json',JSON.stringify({workflow:v39Backup,review:{...v40Review,records:[{...v40Review.records[0],status:'approved'}]}}));
  await page.getByText(/Bundle not ready: review: invalid backup/).waitFor();
  await selectBundle('malformed.json','{invalid');
  await page.getByText(/Inspection rejected: invalid JSON/).waitFor();
  await page.locator('#backupPreflightFile').setInputFiles([]);
  await page.getByText('No bundle inspected.').waitFor();
  assert.deepEqual(await page.evaluate(()=>({
   workflow:localStorage.getItem('onboarding-fictional-workflows-v1'),
   wallet:localStorage.getItem('onboardflow-fictional-wallet-v2'),
   review:localStorage.getItem('onboarding-fictional-task-reviews-v1')
  })),preflightBefore);
  console.log('PASS: V40 inspector accepts V39/V40/combined backups, rejects malformed data, and never writes storage');
  // Interrupted restore: switching scope or cancelling must revoke pending confirmation.
  await page.locator('#workflowImport').setInputFiles({name:'valid-again.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await page.getByText(/Inspected 1 checklist/).waitFor();
  await page.locator('#workflowKind').selectOption('onboarding');
  assert(await page.locator('#workflowRestore').isDisabled());
  assert.equal(await page.locator('#workflowImport').inputValue(),'');
  await page.locator('#workflowImport').setInputFiles({name:'cancel.json',mimeType:'application/json',buffer:Buffer.from(raw)});
  await page.getByText(/Inspected 1 checklist/).waitFor();
  await page.locator('#workflowCancelRestore').click();
  assert(await page.locator('#workflowRestore').isDisabled());
  assert.match(await page.locator('#workflowRestorePreview').innerText(),/No checklist restore pending/);
  console.log('PASS: scope change and cancel invalidate pending V39 restore');
  // Simulate a slow file read, then change scope before it resolves.
  await page.evaluate(()=>{
   window.__releaseSlowBackup=null;
   window.__originalFileText=File.prototype.text;
   File.prototype.text=function(){
    if(this.name==='slow-v39.json')return new Promise(resolve=>{window.__releaseSlowBackup=()=>resolve(window.__slowBackupContents)});
    return window.__originalFileText.call(this);
   };
   window.__slowBackupContents=JSON.stringify({format:'onboarding-fictional-workflows-v1',plans:[]});
  });
  await page.locator('#workflowImport').setInputFiles({name:'slow-v39.json',mimeType:'application/json',buffer:Buffer.from('{}')});
  await page.waitForFunction(()=>typeof window.__releaseSlowBackup==='function');
  await page.locator('#workflowRole').selectOption('office');
  await page.evaluate(()=>window.__releaseSlowBackup());
  await page.waitForTimeout(50);
  assert(await page.locator('#workflowRestore').isDisabled());
  assert.match(await page.locator('#workflowRestorePreview').innerText(),/No checklist restore pending/);
  await page.evaluate(()=>{File.prototype.text=window.__originalFileText;delete window.__originalFileText;delete window.__releaseSlowBackup;delete window.__slowBackupContents});
  console.log('PASS: stale asynchronous V39 backup read cannot re-enable restore after scope change');
  // V40: a slow, obsolete inspection must never overwrite a newer valid result.
  await page.evaluate(()=>{
   window.__originalV40Text=File.prototype.text;
   window.__releaseV40Read=null;
   File.prototype.text=function(){
    if(this.name==='slow-v40.json')return new Promise(resolve=>{window.__releaseV40Read=()=>resolve('{invalid')});
    return window.__originalV40Text.call(this);
   };
  });
  await page.locator('#backupPreflightFile').setInputFiles({name:'slow-v40.json',mimeType:'application/json',buffer:Buffer.from('{}')});
  await page.waitForFunction(()=>typeof window.__releaseV40Read==='function');
  await selectBundle('newer-v40.json',JSON.stringify({review:v40Review}));
  await page.getByText(/Valid bundle: 0 workflow plan/).waitFor();
  await page.evaluate(()=>window.__releaseV40Read());
  await page.waitForTimeout(50);
  assert.match(await page.locator('#backupPreflightResult').innerText(),/Valid bundle: 0 workflow plan/);
  await page.evaluate(()=>{File.prototype.text=window.__originalV40Text;delete window.__originalV40Text;delete window.__releaseV40Read});
  console.log('PASS: obsolete V40 asynchronous inspection cannot replace newer result');
  const before=await page.evaluate(()=>localStorage.getItem('onboarding-fictional-workflows-v1'));
  await page.locator('#workflowImport').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"format":"wrong","plans":[]}')});
  await page.getByText(/Backup rejected:/).waitFor();assert(await page.locator('#workflowRestore').isDisabled());
  assert.equal(await page.evaluate(()=>localStorage.getItem('onboarding-fictional-workflows-v1')),before);
  console.log('PASS: malformed restore leaves saved checklist unchanged');
  await page.evaluate(()=>{localStorage.setItem('onboardflow-fictional-wallet-v2','[]');localStorage.setItem('onboarding-fictional-workflows-v1','corrupted')});
  await page.reload();await page.locator('#openCompany').click();assert(await page.getByRole('checkbox',{name:/Confirm start arrangements/}).isDisabled());
  assert.match(await page.locator('#workflowStorageStatus').innerText(),/not been overwritten/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('onboarding-fictional-workflows-v1')),'corrupted');
  await page.locator('#workflowRecover').click();assert(!await page.getByRole('checkbox',{name:/Confirm start arrangements/}).isDisabled());
  assert.equal(await page.evaluate(()=>localStorage.getItem('onboardflow-fictional-wallet-v2')),'[]');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.deepEqual(errors,[]);
  console.log('PASS: corrupt checklist recovery preserves certificate storage; mobile width and page errors checked');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
})().catch(error=>{console.error(error);process.exitCode=1});
