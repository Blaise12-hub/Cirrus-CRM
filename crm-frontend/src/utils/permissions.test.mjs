import assert from "node:assert/strict";
import { canReassignOwner, canModifyActivity } from "./permissions.js";

const tests = [];
const test = (n, f) => tests.push({ n, f });

test("admin can reassign", () => assert.equal(canReassignOwner("admin"), true));
test("manager can reassign", () => assert.equal(canReassignOwner("manager"), true));
test("rep cannot reassign", () => assert.equal(canReassignOwner("sales_rep"), false));
test("undefined role cannot reassign", () => assert.equal(canReassignOwner(undefined), false));
test("unknown role cannot reassign", () => assert.equal(canReassignOwner("superuser"), false));

test("rep can modify own activity", () =>
  assert.equal(canModifyActivity({ role: "sales_rep", user_id: 1 }, { owner_id: 1 }), true));
test("rep cannot modify another owner's activity", () =>
  assert.equal(canModifyActivity({ role: "sales_rep", user_id: 1 }, { owner_id: 2 }), false));
test("manager can modify any activity", () =>
  assert.equal(canModifyActivity({ role: "manager", user_id: 5 }, { owner_id: 2 }), true));
test("admin can modify any activity", () =>
  assert.equal(canModifyActivity({ role: "admin", user_id: 9 }, { owner_id: 2 }), true));
test("null user or activity is denied", () => {
  assert.equal(canModifyActivity(null, { owner_id: 1 }), false);
  assert.equal(canModifyActivity({ role: "admin", user_id: 1 }, null), false);
});

let failed = 0;
for (const { n, f } of tests) {
  try { f(); console.log("PASS", n); } catch (e) { failed++; console.error("FAIL", n, "-", e.message); }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
