'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const html=fs.readFileSync(require('node:path').join(__dirname,'../pilot/workforce-onboarding.html'),'utf8');
for(const term of ['OnboardingWorkflow.packageFor','OnboardingWorkflow.submitAcknowledgement','OnboardingWorkflow.roleView','OnboardingWorkflow.flhaReview','Read document','Acknowledge this revision','viewed.has(k)','confirmed.has(k)','document.createTextNode','FICTIONAL EXAMPLE ONLY'])assert(html.includes(term),'Missing pilot requirement: '+term);
assert(!html.includes('localStorage'),'No existing storage mutation');
assert(!html.includes('innerHTML'),'No HTML injection');
assert(!html.includes('https://'),'No external dependencies');
console.log('PASS: fictional document reading, acknowledgement gating, role views and FLHA review wiring');
