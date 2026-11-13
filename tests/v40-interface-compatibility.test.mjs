import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../source/all-aboard-personal.html",import.meta.url),"utf8");
test("V40 read-only adapter is embedded and existing V39 review storage is retained",()=>{
 assert.ok(html.includes("const V40ReviewPresentation=Object.freeze"));
 assert.ok(html.includes("const FORMAT='onboarding-fictional-task-reviews-v1'"));
 assert.ok(html.includes("const KEY='onboarding-fictional-task-reviews-v1'"));
 assert.ok(html.includes("const STATUSES=['pending','reviewed','changes-requested']"));
 assert.ok(html.includes("const BackupRecoveryTransaction"));
});
test("V40 presentation does not pretend a review is employer approval",()=>{
 assert.ok(html.includes("Reviewed (not employer approval)"));
 assert.ok(html.includes("Not requested"));
});

test("backup restore remains explicitly staged and guarded by confirmation",()=>{
 assert.ok(html.includes("BackupRecoveryTransaction.apply"));
 assert.ok(html.includes("stagedBackupRecovery"));
 assert.ok(html.includes("window.confirm("));
 assert.ok(html.includes("rollbackVerified"));
});
