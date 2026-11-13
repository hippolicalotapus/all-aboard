'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {open}=require('../source/daily-report-storage');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'aa-coordination-'));
try{
 const a=open(root),b=open(root),grant={userId:'f',companyId:'c',projectId:'p',role:'foreman'},actor={id:'f',companyId:'c',projectId:'p',role:'foreman'},ctx={companyId:'c',projectId:'p',date:'2026-11-13'};
 a.migrateLegacyMemberships([grant]);assert.equal(b.memberships.revision(),1);
 const lock=path.join(root,'coordinated-access.lock');fs.writeFileSync(lock,'occupied');
 assert.throws(()=>b.memberships.revoke(grant),/Coordinated storage busy/);
 assert.throws(()=>b.reports.init('r',[],ctx,actor),/Coordinated storage busy/);
 fs.rmSync(lock);
 const entries=[{...ctx,id:'t',kind:'time',quantity:8,unit:'hours',sourceId:'clock',status:'verified'}];
 a.reports.init('r',entries,ctx,actor);
 assert.equal(b.reports.read('r',ctx,actor).report.entries[0].quantity,8);
 b.memberships.revoke(grant);assert.equal(a.memberships.revision(),2);
 assert.throws(()=>a.reports.act('r',ctx,actor,{type:'approve',actionId:'approval',expectedRevision:1}),/Membership access denied/);
 b.memberships.grant(grant);assert.equal(a.memberships.revision(),3);
 assert.equal(a.reports.act('r',ctx,actor,{type:'approve',actionId:'approval',expectedRevision:1}).report.status,'foreman-approved');
 assert.equal(open(root).reports.read('r',ctx,actor).report.status,'foreman-approved');
 console.log('PASS: coordinated storage locks, membership revisions, revocation, report persistence');
}finally{fs.rmSync(root,{recursive:true,force:true});}
