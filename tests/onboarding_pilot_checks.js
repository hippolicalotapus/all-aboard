'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../pilot/workforce-onboarding.html'),'utf8');
for(const x of ['safety-document-model.js','onboarding-workflow.js','OnboardingWorkflow.packageFor','OnboardingWorkflow.submitAcknowledgement','OnboardingWorkflow.roleView','OnboardingWorkflow.flhaReview','textContent','new Date().toISOString()'])assert(html.includes(x),'Missing UI integration: '+x);
assert(!html.includes('localStorage'),'Pilot must not touch existing localStorage');
assert(!html.includes('innerHTML'),'Pilot must avoid HTML injection');
assert(html.includes('Fictional data only'),'Pilot must be visibly marked fictional');
console.log('PASS: standalone fictional onboarding UI integration and non-persistence contract');
