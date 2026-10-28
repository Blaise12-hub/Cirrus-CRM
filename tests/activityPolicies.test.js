import assert from "node:assert/strict";
import {
  isValidId,
  validateCreate,
  validateUpdate,
  getListParent,
  getBucketClause,
} from "../utils/activityPolicies.js";

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

// ids
test("isValidId accepts positive ints (number or string)", () => {
  assert.equal(isValidId(5), true);
  assert.equal(isValidId("42"), true);
});
test("isValidId rejects junk", () => {
  for (const v of ["abc", "-1", "0", "1.5", "", null, undefined, "99999999999", "1; DROP TABLE x"]) {
    assert.equal(isValidId(v), false, String(v));
  }
});

// create
test("create: valid note with one parent", () => {
  const r = validateCreate({ type: "note", subject: "Hi", contact_id: 3 });
  assert.deepEqual(r, { parentCol: "contact_id", parentId: 3 });
});
test("create: bad type rejected", () => {
  assert.ok(validateCreate({ type: "sms", subject: "x", contact_id: 1 }).error);
});
test("create: missing or blank subject rejected", () => {
  assert.ok(validateCreate({ type: "call", contact_id: 1 }).error);
  assert.ok(validateCreate({ type: "call", subject: "   ", contact_id: 1 }).error);
});
test("create: bad status rejected", () => {
  assert.ok(validateCreate({ type: "call", subject: "x", status: "done", contact_id: 1 }).error);
});
test("create: zero parents rejected", () => {
  assert.ok(validateCreate({ type: "call", subject: "x" }).error);
});
test("create: two parents rejected", () => {
  assert.ok(validateCreate({ type: "call", subject: "x", contact_id: 1, lead_id: 2 }).error);
});
test("create: null parent counts as unset", () => {
  const r = validateCreate({ type: "call", subject: "x", contact_id: null, lead_id: 2 });
  assert.deepEqual(r, { parentCol: "lead_id", parentId: 2 });
});
test("create: non-numeric parent id rejected", () => {
  assert.ok(validateCreate({ type: "call", subject: "x", contact_id: "abc" }).error);
});
test("create: undefined body rejected, no throw", () => {
  assert.ok(validateCreate(undefined).error);
  assert.ok(validateCreate(null).error);
});

// update
test("update: picks only allowed fields", () => {
  const r = validateUpdate({ subject: "s", owner_id: 9, contact_id: 2 });
  assert.deepEqual(r.updates, ["subject"]);
});
test("update: empty rejected", () => {
  assert.ok(validateUpdate({}).error);
  assert.ok(validateUpdate(undefined).error);
});
test("update: bad status rejected", () => {
  assert.ok(validateUpdate({ status: "nope" }).error);
});
test("update: blank subject rejected", () => {
  assert.ok(validateUpdate({ subject: "  " }).error);
});
test("update: completing is accepted", () => {
  assert.deepEqual(validateUpdate({ status: "completed" }).updates, ["status"]);
});

// list parent
test("list: finds the parent column", () => {
  assert.deepEqual(getListParent({ account_id: "7" }), { parentCol: "account_id", parentId: "7" });
});
test("list: no parent rejected", () => {
  assert.ok(getListParent({}).error);
});
test("list: invalid id rejected", () => {
  assert.ok(getListParent({ contact_id: "x" }).error);
});

// buckets
test("bucket: known values return SQL, all/undefined return empty", () => {
  assert.ok(getBucketClause("overdue").includes("<"));
  assert.ok(getBucketClause("today").includes("="));
  assert.ok(getBucketClause("upcoming").includes(">"));
  assert.equal(getBucketClause("all"), "");
  assert.equal(getBucketClause(undefined), "");
});
test("bucket: unknown value returns null (caller sends 400)", () => {
  assert.equal(getBucketClause("yesterday"), null);
  assert.equal(getBucketClause("overdue; DROP TABLE x"), null);
});

let failed = 0;
for (const { name, fn } of tests) {
  try { fn(); console.log("PASS", name); }
  catch (e) { failed++; console.error("FAIL", name, "-", e.message); }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
