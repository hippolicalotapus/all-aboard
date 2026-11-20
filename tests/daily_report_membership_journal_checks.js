'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createDurableDirectory}=require('../source/daily-report-durable-memberships');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aa-membership-journal-'));
try{
 const file=path.join(dir,'membership.json'),d=createDurableDirectory(file),grant={userId:'u',companyId:'c',projectId:'p',role:'foreman'};
 d.migrateV1([grant]);assert.equal(d.revision(),1);
 d.revoke(grant);assert.equal(d.revision(),2);
 const pending={version:1,revision:3,grants:[grant]};
 fs.writeFileSync(file+'.journal',JSON.stringify(pending));
 const restarted=createDurableDirectory(file);
 assert.equal(restarted.resolve('u','c','p','foreman').role,'foreman');
 assert.equal(restarted.revision(),3);
 assert.equal(fs.existsSync(file+'.journal'),false);
 fs.writeFileSync(file+'.journal',JSON.stringify({version:1,revision:2,grants:[]}));
 assert.throws(()=>restarted.resolve('u','c','p','foreman'),/roll back/);
 fs.rmSync(file+'.journal');
 fs.writeFileSync(file+'.journal',JSON.stringify({version:1,revision:4,grants:[{...grant,role:'root'}]}));
 assert.throws(()=>restarted.revision(),/invalid membership file/);
 fs.rmSync(file+'.journal');
 assert.equal(restarted.resolve('u','c','p','foreman').role,'foreman');
 console.log('PASS: monotonic membership revisions, interrupted commit recovery, rollback and forged journal rejection');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
