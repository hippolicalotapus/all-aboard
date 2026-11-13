'use strict';
const assert=require('node:assert/strict');
const model=require('../source/workflow-model.js');
const reviews=require('../source/task-review.js');
let n=0;const check=(label,fn)=>{fn();n++;console.log('PASS:',label)};
const item={kind:'onboarding',role:'field',site:'jobsite',taskId:'training',status:'pending',note:'Check fictional training evidence',evidenceUrl:'https://example.org/sample'};
const valid={format:reviews.FORMAT,records:[item]};
check('valid task metadata',()=>assert.deepEqual(reviews.validate(valid,model),valid));
check('unknown task rejected',()=>assert.throws(()=>reviews.validate({...valid,records:[{...item,taskId:'missing'}]},model)));
check('invalid status rejected',()=>assert.throws(()=>reviews.validate({...valid,records:[{...item,status:'approved'}]},model)));
check('duplicate task review rejected',()=>assert.throws(()=>reviews.validate({...valid,records:[item,item]},model)));
check('non-HTTPS and credential URLs rejected',()=>{for(const evidenceUrl of ['javascript:alert(1)','http://example.org','https://u:p@example.org'])assert.throws(()=>reviews.validate({...valid,records:[{...item,evidenceUrl}]},model))});
check('oversized note rejected',()=>assert.throws(()=>reviews.validate({...valid,records:[{...item,note:'x'.repeat(501)}]},model)));
check('unknown fields stripped without mutation',()=>{const input={...valid,records:[{...item,secret:'discard'}]};assert(!('secret' in reviews.validate(input,model).records[0]));assert('secret' in input.records[0])});
const map=new Map([['onboardflow-fictional-wallet-v2','WALLET'],['onboarding-fictional-workflows-v1','WORKFLOWS']]);
let fail=false;const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(fail)throw Error('quota');map.set(k,v)},removeItem:k=>map.delete(k)};
const repo=reviews.connect(storage,model);
check('review save/load and isolation from wallet and workflow',()=>{assert(repo.write(valid).ok);assert.deepEqual(repo.read(),valid);assert.equal(map.get('onboardflow-fictional-wallet-v2'),'WALLET');assert.equal(map.get('onboarding-fictional-workflows-v1'),'WORKFLOWS')});
check('failed save preserves prior review',()=>{fail=true;const result=repo.write(reviews.empty());fail=false;assert.equal(result.ok,false);assert.deepEqual(repo.read(),valid)});

check('silent dropped review write is detected without losing prior review',()=>{
 const original=map.get(reviews.KEY);
 const dropping={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(k!==reviews.KEY)map.set(k,v)},removeItem:k=>map.delete(k)};
 const result=reviews.connect(dropping,model).write(reviews.empty());
 assert.equal(result.ok,false);
 assert.equal(result.recovered,true);
 assert.equal(map.get(reviews.KEY),original);
});
check('invalid imported review leaves existing wallet, workflow and reviews intact',()=>{
 const before=new Map(map);
 assert.throws(()=>repo.write({...valid,records:[{...item,status:'approved'}]}));
 assert.deepEqual(map,before);
});
check('review summary and attention do not change stored data',()=>{
 const before=map.get(reviews.KEY);
 const snapshot=repo.read();
 reviews.summarize(snapshot,model);
 reviews.reviewAttention(snapshot,model);
 assert.equal(map.get(reviews.KEY),before);
});
console.log(n+' task review checks passed');
