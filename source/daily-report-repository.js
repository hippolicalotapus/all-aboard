'use strict';
// Fictional local-only repository. The caller must supply a server-authenticated actor;
// never accept actor claims directly from a browser request.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const lifecycle=require('./daily-report-lifecycle'),audit=require('./daily-report-audit-chain');
function validId(id){if(typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,64}$/.test(id))throw Error('Invalid repository identifier');return id;}
function clone(v){return JSON.parse(JSON.stringify(v));}
function writeAtomic(file,data){const tmp=file+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(tmp,JSON.stringify(data),{flag:'wx',mode:0o600});fs.renameSync(tmp,file);}
function create(root,trustRoot){
 if(path.resolve(root)===path.resolve(trustRoot))throw Error('Trusted-head directory must be separate');
 fs.mkdirSync(root,{recursive:true,mode:0o700});fs.mkdirSync(trustRoot,{recursive:true,mode:0o700});
 function files(companyId,projectId,reportId){const key=[companyId,projectId,reportId].map(validId).join('__');return {record:path.join(root,key+'.json'),head:path.join(trustRoot,key+'.head.json')};}
 function loadFiles(f){const state=JSON.parse(fs.readFileSync(f.record,'utf8'));const trusted=JSON.parse(fs.readFileSync(f.head,'utf8'));lifecycle.verifyAudit(state);audit.verify(state,trusted.seal,trusted.head);if(trusted.revision!==state.revision)throw Error('Trusted revision mismatch');return state;}
 function init(reportId,entries,context,actor){if(!actor||actor.role!=='foreman'||actor.companyId!==context.companyId||actor.projectId!==context.projectId)throw Error('Create access denied');const f=files(context.companyId,context.projectId,reportId);if(fs.existsSync(f.record)||fs.existsSync(f.head))throw Error('Report already exists');const state=lifecycle.start(entries,context),seal=audit.seal(state);writeAtomic(f.head,{revision:state.revision,head:seal.head,seal});try{writeAtomic(f.record,state);}catch(e){fs.rmSync(f.head,{force:true});throw e;}return clone(lifecycle.view(state,actor));}
 function read(reportId,context,actor){const f=files(context.companyId,context.projectId,reportId),state=loadFiles(f);return clone(lifecycle.view(state,actor));}
 function act(reportId,context,actor,command){const f=files(context.companyId,context.projectId,reportId),state=loadFiles(f);if(!actor||actor.companyId!==context.companyId||actor.projectId!==context.projectId||actor.role!=='foreman')throw Error('Write access denied');const next=lifecycle.action(state,actor,command);if(next===state)return clone(lifecycle.view(state,actor));const seal=audit.seal(next);writeAtomic(f.record,next);writeAtomic(f.head,{revision:next.revision,head:seal.head,seal});return clone(lifecycle.view(next,actor));}
 return Object.freeze({init,read,act});
}
module.exports=Object.freeze({create});
