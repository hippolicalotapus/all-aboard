'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {open}=require('../source/daily-report-storage');
const base=fs.mkdtempSync(path.join(os.tmpdir(),'aa-storage-'));
try{
 const a=open(base),grant={userId:'f',companyId:'c',projectId:'p',role:'foreman'},actor={id:'f',companyId:'c',projectId:'p',role:'foreman'},ctx={companyId:'c',projectId:'p',date:'2026-11-13'};
 a.migrateLegacyMemberships([grant]);assert.throws(()=>a.migrateLegacyMemberships([]),/already initialized/);
 const entries=[{...ctx,id:'t',kind:'time',quantity:8,unit:'hours',sourceId:'clock',status:'verified'}];
 a.reports.init('r',entries,ctx,actor);
 const b=open(base);assert.equal(b.reports.read('r',ctx,actor).report.entries[0].quantity,8);
 assert.equal(b.verify('r',ctx,actor).reportVerified,true);
 assert.throws(()=>b.reports.read('r',ctx,{...actor,id:'stranger'}),/Membership access denied/);
 assert.throws(()=>b.reports.read('r',{...ctx,projectId:'other'},actor),/Membership access denied/);
 b.memberships.revoke(grant);
 assert.throws(()=>a.reports.read('r',ctx,actor),/Membership access denied/);
 b.memberships.grant(grant);
 assert.equal(a.reports.read('r',ctx,actor).report.status,'draft');
 fs.writeFileSync(a.paths.manifest,JSON.stringify({version:2,reportFormat:1,membershipFormat:1}));
 assert.throws(()=>open(base),/Unsupported storage schema/);
 console.log('PASS: versioned unified storage, restart persistence, migration, membership revocation and schema gate');
}finally{fs.rmSync(base,{recursive:true,force:true});}
