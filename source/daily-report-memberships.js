'use strict';
// Fictional server-owned identity directory. Not an authentication provider.
const ALLOWED=new Set(['employee','foreman','superintendent','safety-admin','hr','payroll','accounting','management','company-admin']);
const id=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(x);
function createDirectory(){
 const identities=new Map();
 function grant({userId,companyId,projectId,role}){
  if(!id(userId)||!id(companyId)||!id(projectId)||!ALLOWED.has(role))throw Error('Invalid membership grant');
  const entries=identities.get(userId)||[];
  if(entries.some(e=>e.companyId===companyId&&e.projectId===projectId&&e.role===role))throw Error('Duplicate membership grant');
  entries.push(Object.freeze({companyId,projectId,role}));identities.set(userId,entries);
 }
 function resolve(userId,companyId,projectId,role){
  if(!id(userId)||!id(companyId)||!id(projectId)||!ALLOWED.has(role))return null;
  const membership=(identities.get(userId)||[]).find(e=>e.companyId===companyId&&e.projectId===projectId&&e.role===role);
  if(!membership)return null;
  return Object.freeze({id:userId,companyId,projectId,role});
 }
 function revoke({userId,companyId,projectId,role}){
  const entries=identities.get(userId)||[];
  identities.set(userId,entries.filter(e=>!(e.companyId===companyId&&e.projectId===projectId&&e.role===role)));
 }
 return Object.freeze({grant,resolve,revoke});
}
module.exports=Object.freeze({createDirectory});
