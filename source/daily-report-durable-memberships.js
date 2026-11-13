'use strict';
// Fictional local-only durable memberships. File format v1; no production credentials.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {createDirectory}=require('./daily-report-memberships');
const VALID=/^[a-zA-Z0-9_-]{1,64}$/;
const ROLES=new Set(['employee','foreman','superintendent','safety-admin','hr','payroll','accounting','management','company-admin']);
function valid(g){return g&&['userId','companyId','projectId'].every(k=>typeof g[k]==='string'&&VALID.test(g[k]))&&ROLES.has(g.role);}
function createDurableDirectory(filename){
 const file=path.resolve(filename),lock=file+'.lock';
 fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});
 function locked(fn){let fd;try{fd=fs.openSync(lock,'wx',0o600);}catch(e){if(e.code==='EEXIST')throw Error('Membership write locked');throw e;}try{return fn();}finally{fs.closeSync(fd);fs.rmSync(lock,{force:true});}}
 function load(){if(!fs.existsSync(file))return {version:1,grants:[]};const data=JSON.parse(fs.readFileSync(file,'utf8'));if(data.version!==1||!Array.isArray(data.grants)||!data.grants.every(valid))throw Error('Unsupported or invalid membership file');const keys=new Set(data.grants.map(g=>[g.userId,g.companyId,g.projectId,g.role].join(':')));if(keys.size!==data.grants.length)throw Error('Duplicate membership records');return data;}
 function save(data){const tmp=file+'.'+crypto.randomUUID()+'.tmp';try{fs.writeFileSync(tmp,JSON.stringify(data),{flag:'wx',mode:0o600});fs.renameSync(tmp,file);}finally{fs.rmSync(tmp,{force:true});}}
 function grant(g){if(!valid(g))throw Error('Invalid membership grant');return locked(()=>{const data=load(),d=createDirectory();for(const item of data.grants)d.grant(item);d.grant(g);data.grants.push({userId:g.userId,companyId:g.companyId,projectId:g.projectId,role:g.role});save(data);});}
 function revoke(g){if(!valid(g))throw Error('Invalid membership grant');return locked(()=>{const data=load();data.grants=data.grants.filter(x=>!['userId','companyId','projectId','role'].every(k=>x[k]===g[k]));save(data);});}
 function resolve(userId,companyId,projectId,role){const data=load();return data.grants.some(g=>g.userId===userId&&g.companyId===companyId&&g.projectId===projectId&&g.role===role)?Object.freeze({id:userId,companyId,projectId,role}):null;}
 function migrateV1(grants){if(!Array.isArray(grants)||!grants.every(valid))throw Error('Invalid migration grants');return locked(()=>{if(fs.existsSync(file))throw Error('Membership store already initialized');const d=createDirectory();for(const g of grants)d.grant(g);save({version:1,grants:grants.map(g=>({userId:g.userId,companyId:g.companyId,projectId:g.projectId,role:g.role}))});});}
 return Object.freeze({grant,revoke,resolve,migrateV1});
}
module.exports=Object.freeze({createDurableDirectory});
