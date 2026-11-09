import assert from "node:assert/strict";
import { validateLogin, showDemoLogins, DEMO_ACCOUNTS, DEMO_PASSWORD } from "./utils/loginForm.js";

const tests = [];
const test = (n, f) => tests.push({ n, f });

test("valid email + password -> no error", () => assert.equal(validateLogin("a@b.co", "pw"), ""));
test("blank / whitespace email rejected", () => {
  assert.match(validateLogin("", "pw"), /email/i);
  assert.match(validateLogin("   ", "pw"), /email/i);
});
test("missing password rejected", () => assert.match(validateLogin("a@b.co", ""), /password/i));
test("email checked before password", () => assert.match(validateLogin("", ""), /email/i));
test("null / undefined inputs do not throw", () => {
  assert.match(validateLogin(null, undefined), /email/i);
  assert.match(validateLogin("a@b.co", null), /password/i);
});
test("password with only spaces is still a password (not trimmed)", () => assert.equal(validateLogin("a@b.co", "   "), ""));

test("demo logins: shown in dev", () => assert.equal(showDemoLogins({ DEV: true }), true));
test("demo logins: shown when flag is exactly 'true'", () => assert.equal(showDemoLogins({ VITE_DEMO_LOGINS: "true" }), true));
test("demo logins: hidden in production by default", () => {
  assert.equal(showDemoLogins({ DEV: false }), false);
  assert.equal(showDemoLogins({}), false);
  assert.equal(showDemoLogins(undefined), false);
});
test("demo logins: other flag values do not enable", () => {
  for (const v of ["false", "1", "TRUE", ""]) assert.equal(showDemoLogins({ DEV: false, VITE_DEMO_LOGINS: v }), false, v);
});
test("demo accounts are the three seeded roles", () => {
  assert.deepEqual(DEMO_ACCOUNTS.map((a) => a.email), ["admin@cirrus.local", "manager@cirrus.local", "rep@cirrus.local"]);
  assert.ok(DEMO_PASSWORD.length > 0);
});

let failed = 0;
for (const { n, f } of tests) {
  try { f(); console.log("PASS", n); } catch (e) { failed++; console.error("FAIL", n, "-", e.message); }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
