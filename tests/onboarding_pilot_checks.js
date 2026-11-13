'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../pilot/workforce-onboarding.html'),'utf8');
for(const term of ['safety-revision-lifecycle.js','SafetyRevisionLifecycle.ingest','SafetyRevisionLifecycle.publish','SafetyRevisionLifecycle.revise','SafetyRevisionLifecycle.assignment','SafetyRevisionLifecycle.reviewStatus','OnboardingWorkflow.submitAcknowledgement','Read document','Acknowledge this revision','viewed.has(k)','confirmed.has(k)'])assert(html.includes(term),'Missing integration: '+term);
assert(!html.includes('localStorage'),'Pilot must not mutate V39 storage');
assert(!html.includes('innerHTML'),'No unsafe HTML interpolation');
assert(!html.includes('https://'),'No external dependencies');
console.log('PASS: fictional lifecycle UI wiring, acknowledgement renewal and storage isolation');
