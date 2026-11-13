'use strict';
// Server-side, in-memory fictional session foundation. No passwords or production identity.
const crypto=require('node:crypto');
function createSessionStore({ttlMs=15*60*1000,now=Date.now}={}){
 if(!Number.isSafeInteger(ttlMs)||ttlMs<1000)throw Error('Invalid session TTL');
 const sessions=new Map();
 const digest=token=>crypto.createHash('sha256').update(token).digest('hex');
 function issue(actor){if(!actor||!actor.id||!actor.companyId||!actor.role)throw Error('Invalid authenticated actor');const token=crypto.randomBytes(32).toString('base64url');sessions.set(digest(token),{actor:Object.freeze({...actor,projectIds:actor.projectIds?Object.freeze([...actor.projectIds]):undefined}),expires:now()+ttlMs});return token;}
 function resolve(token){if(typeof token!=='string'||token.length<32||token.length>256)return null;const key=digest(token),s=sessions.get(key);if(!s)return null;if(now()>=s.expires){sessions.delete(key);return null;}return s.actor;}
 function revoke(token){if(typeof token==='string')sessions.delete(digest(token));}
 return Object.freeze({issue,resolve,revoke});
}
module.exports=Object.freeze({createSessionStore});
