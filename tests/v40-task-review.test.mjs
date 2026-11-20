import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const {normalizeReview,migrateV39}=createRequire(import.meta.url)("../source/v40-task-review.cjs");
test("legacy V39 tasks default to unrequested without changing data",()=>{const original={done:true,dueDates:{task1:"2026-11-20"}};const copy=JSON.stringify(original);const r=migrateV39(["task1"],original);assert.equal(r.ok,true);assert.deepEqual(r.reviewOverlay,{});assert.equal(JSON.stringify(original),copy);assert.equal(normalizeReview(undefined,["task1"]).review.state,"not_requested")});
test("review state and fictional evidence validate independently",()=>{const r=normalizeReview({state:"pending",evidence:[{label:"Sample training reference",type:"reference",taskId:"task1",url:"https://example.org/sample"}]},["task1"]);assert.equal(r.ok,true);assert.equal(r.review.evidence.length,1)});
test("invalid review and unsafe evidence fail closed",()=>{for(const value of [{state:"signed",evidence:[]},{state:"approved",evidence:[{label:"X",type:"reference",url:"javascript:alert(1)"}]},{state:"approved",evidence:[{label:"X",type:"note",taskId:"unknown"}]}])assert.equal(normalizeReview(value,["task1"]).ok,false)});
test("invalid overlay never mutates legacy checklist",()=>{const original={dueDates:{task1:"2026-11-20"},checked:["task1"]};const before=JSON.stringify(original);const r=migrateV39(["task1"],original,{unknown:{state:"approved",evidence:[]}});assert.equal(r.ok,false);assert.equal(JSON.stringify(original),before)});
