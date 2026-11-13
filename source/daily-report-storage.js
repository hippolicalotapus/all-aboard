'use strict';
// Fictional unified storage boundary, preserving v1 report and membership formats.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const reports=require('./daily-report-repository'),members=require('./daily-report-durable-memberships');
function open(base){
 const root=path.resolve(base),reportDir=path.join(root,'reports'),trustedDir=path.join(root,'trusted-heads'),memberFile=path.join(root,'memberships.v1.json'),manifest=path.join(root,'storage-manifest.json');
 fs.mkdirSync(root,{recursive:true,mode:0o700});
 function atomic(file,value){const tmp=file+'.'+crypto.randomUUID()+'.tmp';try{fs.writeFileSync(tmp,JSON.stringify(value),{flag:'wx',mode:0o600});fs.renameSync(tmp,file);}finally{fs.rmSync(tmp,{force:true});}}
 if(!fs.existsSync(manifest))atomic(manifest,{version:1,reportFormat:1,membershipFormat:1});
 function verifySchema(){const m=JSON.parse(fs.readFileSync(manifest,'utf8'));if(m.version!==1||m.reportFormat!==1||m.membershipFormat!==1)throw Error('Unsupported storage schema');return m;}
 verifySchema();
 const reportStore=reports.create(reportDir,trustedDir),membershipStore=members.createDurableDirectory(memberFile);
 function inspect(reportId,context,actor){verifySchema();if(!membershipStore.resolve(actor.id,context.companyId,context.projectId,actor.role))throw Error('Membership access denied');return reportStore.read(reportId,context,actor);}
 function change(reportId,context,actor,command){verifySchema();if(!membershipStore.resolve(actor.id,context.companyId,context.projectId,actor.role))throw Error('Membership access denied');return reportStore.act(reportId,context,actor,command);}
 function init(reportId,entries,context,actor){verifySchema();if(!membershipStore.resolve(actor.id,context.companyId,context.projectId,actor.role))throw Error('Membership access denied');return reportStore.init(reportId,entries,context,actor);}
 function migrateLegacyMemberships(grants){verifySchema();membershipStore.migrateV1(grants);}
 function verify(reportId,context,actor){inspect(reportId,context,actor);return Object.freeze({schemaVersion:1,reportVerified:true,membershipVerified:true});}
 return Object.freeze({reports:Object.freeze({init,read:inspect,act:change}),memberships:membershipStore,verify,verifySchema,migrateLegacyMemberships,paths:Object.freeze({reportDir,trustedDir,memberFile,manifest})});
}
module.exports=Object.freeze({open});
