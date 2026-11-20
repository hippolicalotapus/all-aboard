'use strict';
// Fictional local-only repository. The caller must supply a server-authenticated actor;
// never accept actor claims directly from a browser request.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const lifecycle=require('./daily-report-lifecycle'),audit=require('./daily-report-audit-chain');
function validId(id){if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(id))throw Error('Invalid repository identifier');return id;}
function clone(v){return JSON.parse(JSON.stringify(v));}
function writeAtomic(file,data){const tmp=file+'.'+crypto.randomUUID()+'.tmp';try{fs.writeFileSync(tmp,JSON.stringify(data),{flag:'wx',mode:0o600});fs.renameSync(tmp,file);}finally{fs.rmSync(tmp,{force:true});}}
function withLock(file,fn){let fd;try{fd=fs.openSync(file,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw Error('Concurrent report transaction');throw e;}try{return fn();}finally{fs.closeSync(fd);fs.rmSync(file,{force:true});}}
function create(root,trustRoot){
 if(path.resolve(root)===path.resolve(trustRoot))throw Error('Trusted-head directory must be separate');
 fs.mkdirSync(root,{recursive:true,mode:0o700});fs.mkdirSync(trustRoot,{recursive:true,mode:0o700});
 function files(companyId,projectId,reportId){const key=[companyId,projectId,reportId].map(validId).join('__');return {record:path.join(root,key+'.json'),head:path.join(trustRoot,key+'.head.json'),journal:path.join(root,key+'.transaction.json'),lock:path.join(root,key+'.lock')};}
 function recover(f){if(!fs.existsSync(f.journal))return;const pending=JSON.parse(fs.readFileSync(f.journal,'utf8'));if(!pending||!pending.state||!pending.trusted)throw Error('Invalid recovery journal');lifecycle.verifyAudit(pending.state);audit.verify(pending.state,pending.trusted.seal,pending.trusted.head);if(pending.state.revision!==pending.trusted.revision)throw Error('Recovery revision mismatch');if(fs.existsSync(f.head)){const head=JSON.parse(fs.readFileSync(f.head,'utf8'));if(head.revision>pending.trusted.revision)throw Error('Recovery would roll back trusted head');}writeAtomic(f.record,pending.state);writeAtomic(f.head,pending.trusted);fs.rmSync(f.journal);}
 function commit(f,state){const seal=audit.seal(state),trusted={revision:state.revision,head:seal.head,seal};writeAtomic(f.journal,{state,trusted});writeAtomic(f.record,state);writeAtomic(f.head,trusted);fs.rmSync(f.journal);}
 function loadFiles(f){if(fs.existsSync(f.journal))throw Error('Recovery required before reading');const state=JSON.parse(fs.readFileSync(f.record,'utf8'));const trusted=JSON.parse(fs.readFileSync(f.head,'utf8'));lifecycle.verifyAudit(state);audit.verify(state,trusted.seal,trusted.head);if(trusted.revision!==state.revision)throw Error('Trusted revision mismatch');return state;}
 function init(reportId,entries,context,actor){if(!actor||actor.role!=='foreman'||actor.companyId!==context.companyId||actor.projectId!==context.projectId)throw Error('Create access denied');const f=files(context.companyId,context.projectId,reportId);return withLock(f.lock,()=>{recover(f);if(fs.existsSync(f.record)||fs.existsSync(f.head))throw Error('Report already exists');const state=lifecycle.start(entries,context);commit(f,state);return clone(lifecycle.view(state,actor));});}
 function read(reportId,context,actor){const f=files(context.companyId,context.projectId,reportId);return withLock(f.lock,()=>{recover(f);return clone(lifecycle.view(loadFiles(f),actor));});}
 function act(reportId,context,actor,command){const f=files(context.companyId,context.projectId,reportId);if(!actor||actor.companyId!==context.companyId||actor.projectId!==context.projectId||actor.role!=='foreman')throw Error('Write access denied');return withLock(f.lock,()=>{recover(f);const state=loadFiles(f),next=lifecycle.action(state,actor,command);if(next===state)return clone(lifecycle.view(state,actor));commit(f,next);return clone(lifecycle.view(next,actor));});}
 return Object.freeze({init,read,act});
}
module.exports=Object.freeze({create});
