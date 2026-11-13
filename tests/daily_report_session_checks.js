'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {createDirectory}=require('../source/daily-report-memberships'),{createSessionStore}=require('../source/daily-report-session-store'),{create}=require('../source/daily-report-repository'),{createServer}=require('../source/daily-report-local-api');
(async()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'aa-session-'));let server;try{
 let clock=1000;const sessions=createSessionStore({ttlMs:2000,now:()=>clock}),ctx={companyId:'tenantA',projectId:'siteA',date:'2026-11-13'},foreman={id:'f',role:'foreman',companyId:'tenantA',projectId:'siteA'},office={id:'a',role:'accounting',companyId:'tenantA',projectIds:['siteA']},other={id:'b',role:'accounting',companyId:'tenantB',projectIds:['siteA']};
 const db=create(path.join(dir,'data'),path.join(dir,'heads'));db.init('pilot',[{...ctx,id:'t',kind:'time',quantity:8,unit:'hours',sourceId:'clock',status:'verified'}],ctx,foreman);
 const ft=sessions.issue(foreman),ot=sessions.issue(office),bt=sessions.issue(other);assert.notEqual(ft,ot);assert.equal(sessions.resolve(ft).id,'f');
 const memberships=createDirectory();memberships.grant({userId:'f',companyId:'tenantA',projectId:'siteA',role:'foreman'});memberships.grant({userId:'a',companyId:'tenantA',projectId:'siteA',role:'accounting'});server=createServer(db,new Map([['foreman',foreman]]),sessions,memberships);await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port+'/daily-report';
 const call=(token,method='GET',command,headers={})=>fetch(url,{method,headers:{authorization:'Bearer '+token,'content-type':'application/json',...headers},body:command?JSON.stringify({command}):undefined});
 let r=await fetch(url,{headers:{'x-test-session':'foreman'}});assert.equal(r.status,401);
 r=await call(bt);assert.notEqual(r.status,200);
 r=await call(ot);assert.equal(r.status,200);assert.equal((await r.json()).report.entries[0].quantity,8);
 r=await call(ot,'POST',{type:'approve',actionId:'bad',expectedRevision:1});assert.notEqual(r.status,200);
 r=await call(ft,'POST',{type:'approve',actionId:'cross-origin',expectedRevision:1},{origin:'http://evil.example'});assert.equal(r.status,403);
 r=await call(ft,'POST',{type:'approve',actionId:'good',expectedRevision:1});assert.equal(r.status,200);
 memberships.revoke({userId:'f',companyId:'tenantA',projectId:'siteA',role:'foreman'});r=await call(ft);assert.equal(r.status,403);sessions.revoke(ft);r=await call(ft);assert.equal(r.status,401);
 clock=4000;r=await call(ot);assert.equal(r.status,401);
 console.log('PASS: opaque sessions, expiration, revocation, tenant isolation, role restrictions and cross-origin write rejection');
 }finally{if(server)await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}})().catch(e=>{console.error(e);process.exitCode=1;});
