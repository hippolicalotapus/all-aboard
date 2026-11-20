'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createDurableDirectory}=require('../source/daily-report-durable-memberships');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aa-durable-memberships-'));
try{
 const file=path.join(dir,'members.json'),a=createDurableDirectory(file),b=createDurableDirectory(file);
 const foreman={userId:'u',companyId:'company1',projectId:'project1',role:'foreman'},office={userId:'u',companyId:'company1',projectId:'project2',role:'accounting'};
 a.migrateV1([foreman]);
 assert.equal(b.resolve('u','company1','project1','foreman').id,'u');
 assert.equal(b.resolve('u','company1','project2','foreman'),null);
 assert.equal(b.resolve('u','company2','project1','foreman'),null);
 b.grant(office);
 assert.equal(a.resolve('u','company1','project2','accounting').role,'accounting');
 assert.throws(()=>a.grant(office),/Duplicate/);
 assert.throws(()=>a.migrateV1([]),/already initialized/);
 fs.writeFileSync(file+'.lock','occupied');
 assert.throws(()=>a.revoke(foreman),/write locked/);
 fs.rmSync(file+'.lock');
 b.revoke(foreman);
 assert.equal(a.resolve('u','company1','project1','foreman'),null);
 assert.equal(a.resolve('u','company1','project2','accounting').role,'accounting');
 const before=fs.readFileSync(file,'utf8');
 fs.writeFileSync(file,JSON.stringify({version:99,grants:[]}));
 assert.throws(()=>a.resolve('u','company1','project2','accounting'),/Unsupported/);
 fs.writeFileSync(file,before);
 assert.equal(a.resolve('u','company1','project2','accounting').role,'accounting');
 console.log('PASS: durable memberships across instances, migration, tenant isolation, locks and schema validation');
}finally{fs.rmSync(dir,{recursive:true,force:true});}
