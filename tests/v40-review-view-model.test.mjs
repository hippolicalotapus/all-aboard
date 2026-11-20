import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const {reviewSummary}=createRequire(import.meta.url)("../source/v40-review-view-model.cjs");
test("V39 records remain unchanged and missing reviews default to not requested",()=>{
 const legacy={dueDates:{a:"2026-11-20"},done:["a"]};const before=JSON.stringify(legacy);
 const r=reviewSummary(["a","b"],{a:{state:"pending",evidence:[]}});
 assert.equal(r.ok,true);
 assert.deepEqual(r.rows,[{taskId:"a",state:"pending",evidenceCount:0},{taskId:"b",state:"not_requested",evidenceCount:0}]);
 assert.equal(JSON.stringify(legacy),before);
});
test("rejects unknown task and invalid review states",()=>{
 assert.equal(reviewSummary(["a"],{b:{state:"approved",evidence:[]}}).ok,false);
 assert.equal(reviewSummary(["a"],{a:{state:"signed",evidence:[]}}).ok,false);
});
