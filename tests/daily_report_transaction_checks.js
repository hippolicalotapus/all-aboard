'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),audit=require('../source/daily-report-audit-chain'),lifecycle=require('../source/daily-report-lifecycle'),repository=require('../source/daily-report-repository');
const base=fs.mkdtempSync(path.join(os.tmpdir(),'aa-recovery-'));
try{
 const root=path.join(base,'data'),trusted=path.join(base,'trusted'),db=repository.create(root,trusted);
 const context={companyId:'c',projectId:'p',date:'2026-11-13'},actor={id:'f',role:'foreman',companyId:'c',projectId:'p'};
 const entries=[{...context,id:'t',kind:'time',quantity:8,unit:'hours',sourceId:'time-1',status:'verified'}];
 db.init('r',entries,context,actor);
 const state=lifecycle.start(entries,context),next=lifecycle.action(state,actor,{type:'approve',actionId:'approve',expectedRevision:1});
 const seal=audit.seal(next),trustedRecord={revision:next.revision,head:seal.head,seal};
 const file=path.join(root,'c__p__r.json'),head=path.join(trusted,'c__p__r.head.json'),journal=path.join(root,'c__p__r.transaction.json'),lock=path.join(root,'c__p__r.lock');
 fs.writeFileSync(journal,JSON.stringify({state:next,trusted:trustedRecord}));
 fs.writeFileSync(file,JSON.stringify(next));
 assert.equal(db.read('r',context,actor).report.status,'foreman-approved');
 assert.equal(JSON.parse(fs.readFileSync(head,'utf8')).revision,2);
 assert.equal(fs.existsSync(journal),false);
 fs.writeFileSync(lock,'locked');
 assert.throws(()=>db.read('r',context,actor),/Concurrent report transaction/);
 fs.unlinkSync(lock);
 const bad={...next,events:[{...next.events[0],actorId:'forged'}]};
 fs.writeFileSync(journal,JSON.stringify({state:bad,trusted:trustedRecord}));
 assert.throws(()=>db.read('r',context,actor),/Audit hash mismatch/);
 fs.unlinkSync(journal);
 assert.equal(db.read('r',context,actor).report.status,'foreman-approved');
 console.log('PASS: recover interrupted report/head transaction, reject concurrent lock and forged journal');
}finally{fs.rmSync(base,{recursive:true,force:true});}