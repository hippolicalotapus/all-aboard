'use strict';
// Node-only fictional audit seal; hashes detect modification, not malicious chain replacement.
// A trusted externally stored head/signature is required for production tamper evidence.
const crypto=require('node:crypto');
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
function hash(v){return crypto.createHash('sha256').update(v).digest('hex');}
function seal(state){if(!state||!Array.isArray(state.events))throw Error('Invalid state');let previous='GENESIS';const chain=state.events.map(event=>{const digest=hash(previous+'|'+canonical(event));const record=Object.freeze({event:Object.freeze({...event}),previous,hash:digest});previous=digest;return record;});return Object.freeze({chain:Object.freeze(chain),head:previous});}
function verify(state,sealed,expectedHead){if(!sealed||!Array.isArray(sealed.chain)||typeof expectedHead!=='string')throw Error('Trusted audit head required');const actual=seal(state);if(actual.chain.length!==sealed.chain.length||actual.head!==sealed.head||actual.head!==expectedHead)throw Error('Audit hash mismatch');for(let i=0;i<actual.chain.length;i++)if(actual.chain[i].hash!==sealed.chain[i].hash||actual.chain[i].previous!==sealed.chain[i].previous)throw Error('Audit chain mismatch');return true;}
module.exports=Object.freeze({seal,verify});
