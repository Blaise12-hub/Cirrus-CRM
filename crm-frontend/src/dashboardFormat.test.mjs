import assert from "node:assert/strict";
import { compactMoney, greetingFor, longDate } from "./utils/dashboardFormat.js";

const tests = [];
const test = (n, f) => tests.push({ n, f });
const at = (h, m = 0) => new Date(2026, 10, 9, h, m);

// compactMoney (chart axes)
test("zero and sub-1000 stay whole dollars (fixes '$0k' repeated ticks)", () => {
  assert.equal(compactMoney(0), "$0");
  assert.equal(compactMoney(850), "$850");
  assert.equal(compactMoney(999.4), "$999");
});
test("thousands use k, trimming .0", () => {
  assert.equal(compactMoney(1000), "$1k");
  assert.equal(compactMoney(1500), "$1.5k");
  assert.equal(compactMoney(4000), "$4k");
  assert.equal(compactMoney(175800), "$175.8k");
});
test("millions use M", () => {
  assert.equal(compactMoney(1_200_000), "$1.2M");
  assert.equal(compactMoney(2_000_000), "$2M");
});
test("numeric strings from Postgres work", () => assert.equal(compactMoney("1500.00"), "$1.5k"));
test("null / undefined / NaN / empty fall back to $0, no throw", () => {
  for (const v of [null, undefined, NaN, "", "abc", Infinity]) assert.equal(compactMoney(v), "$0", String(v));
});
test("negatives keep the sign", () => {
  assert.equal(compactMoney(-500), "-$500");
  assert.equal(compactMoney(-2500), "-$2.5k");
});
test("999.6 rounds up to $1k, never prints $1000", () => assert.equal(compactMoney(999.6), "$1k"));

// greeting
test("hour boundaries", () => {
  assert.equal(greetingFor(at(0)), "Good morning");
  assert.equal(greetingFor(at(11, 59)), "Good morning");
  assert.equal(greetingFor(at(12)), "Good afternoon");
  assert.equal(greetingFor(at(17, 59)), "Good afternoon");
  assert.equal(greetingFor(at(18)), "Good evening");
  assert.equal(greetingFor(at(23, 59)), "Good evening");
});
test("longDate formats weekday, month, day", () =>
  assert.equal(longDate(new Date(2026, 9, 30), "en-US"), "Friday, October 30"));

let failed = 0;
for (const { n, f } of tests) {
  try { f(); console.log("PASS", n); } catch (e) { failed++; console.error("FAIL", n, "-", e.message); }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
