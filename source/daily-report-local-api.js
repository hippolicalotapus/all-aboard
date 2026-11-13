'use strict';
// Local fictional test harness only. Do not deploy or use with real records.
const http=require('node:http');
function createServer(repository,actors,sessionStore){
 if(!repository||!actors)throw Error('Repository and server-owned actors required');
 return http.createServer((req,res)=>{
  const send=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
  if(req.socket.remoteAddress!=='127.0.0.1'&&req.socket.remoteAddress!=='::1'&&req.socket.remoteAddress!=='::ffff:127.0.0.1')return send(403,{error:'Loopback only'});
  const bearer=/^Bearer ([A-Za-z0-9_-]{32,256})$/.exec(req.headers.authorization||'');
  const actor=sessionStore?(bearer?sessionStore.resolve(bearer[1]):null):actors.get(req.headers['x-test-session']);if(!actor)return send(401,{error:'Authenticated test session required'});
  if(sessionStore&&req.method==='POST'&&req.headers.origin&&req.headers.origin!=='http://'+req.headers.host)return send(403,{error:'Cross-origin write denied'});
  if(req.url!=='/daily-report'||!['GET','POST'].includes(req.method))return send(404,{error:'Not found'});
  let body='';req.on('data',c=>{body+=c;if(body.length>16384)req.destroy();});req.on('end',()=>{
   try{
    const input=req.method==='POST'?JSON.parse(body):Object.fromEntries(new URL(req.url,'http://localhost').searchParams);
    // POST actions and GET reads use only server-owned actor, never client role.
    const context={companyId:actor.companyId,projectId:actor.projectId||actor.projectIds?.[0],date:'2026-11-13'};
    const result=req.method==='POST'?repository.act('pilot',context,actor,input.command):repository.read('pilot',context,actor);
    send(200,result);
   }catch(e){send(/access denied|Access denied|revision conflict|Concurrent/.test(e.message)?409:400,{error:e.message});}
  });
 });
}
module.exports=Object.freeze({createServer});
