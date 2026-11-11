const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync(require('path').join(__dirname,'../source/all-aboard-personal.html'),'utf8');
function extract(name){const begin=src.indexOf('function '+name+'(');assert(begin>=0,name+' not found');let open=src.indexOf('{',begin),depth=0,quote=null,escape=false;for(let i=open;i<src.length;i++){const c=src[i];if(quote){if(escape)escape=false;else if(c==='\\')escape=true;else if(c===quote)quote=null;continue}if(c==='"'||c==="'"||c==="'"){quote=c;continue}if(c==='{')depth++;if(c==='}'&&--depth===0)return src.slice(begin,i+1)}throw Error('unclosed '+name)}
const data=new Map();let fail=false,readback=false;
const storage={setItem(k,v){if(fail)throw Error('storage full');data.set(k,v)},getItem(k){return readback?'mismatch':data.get(k)??null}};
const ctx=vm.createContext({localStorage:storage,KEY:'onboardflow-fictional-wallet-v2',wallet:[]});
for(const name of ['validate','persist','validCalendarDate','dateProblem'])vm.runInContext(extract(name),ctx);
let checks=0;function check(name,fn){fn();checks++;console.log('PASS:',name)}
const item={id:'test-1',type:'WHMIS',issuer:'Demo',expiry:'2027-02-28',issued:'2025-01-01',number:'FAKE-1'};
check('valid backup normalized',()=>assert.equal(vm.runInContext('validate('+JSON.stringify([item])+').length',ctx),1));
check('malformed backup rejected',()=>assert.throws(()=>vm.runInContext('validate({})',ctx)));
check('invalid calendar date rejected',()=>assert.equal(vm.runInContext("validCalendarDate('2027-02-29')",ctx),false));
check('leap date accepted',()=>assert.equal(vm.runInContext("validCalendarDate('2028-02-29')",ctx),true));
check('expiry before issue rejected',()=>assert.ok(vm.runInContext("dateProblem({issued:'2028-01-01',expiry:'2027-01-01'})",ctx)));
ctx.wallet=[item];
check('successful persistence readback',()=>assert.equal(vm.runInContext('persist()',ctx),true));
fail=true;
check('write failure detected',()=>assert.equal(vm.runInContext('persist()',ctx),false));
fail=false;readback=true;
check('readback mismatch detected',()=>assert.equal(vm.runInContext('persist()',ctx),false));
readback=false;
check('original storage key retained',()=>assert.ok(data.has('onboardflow-fictional-wallet-v2')));
console.log('PASS:',checks,'Node VM runtime checks');
