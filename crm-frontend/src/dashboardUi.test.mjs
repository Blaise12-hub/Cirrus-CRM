import {
  plural, stageBarRows, mergeTasks, bucketPill, taskIconKey, taskSubline, pillPalette, PILL_TONES,
} from "./utils/dashboardUi.js";

let pass = 0, fail = 0;
const t = (name, fn) => { try { fn(); pass++; console.log("ok   ", name); } catch (e) { fail++; console.log("FAIL ", name, "-", e.message); } };
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m || ""} got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); };

const L = { prospecting: "Prospecting", qualification: "Qualification", proposal: "Proposal", negotiation: "Negotiation" };
const P = [
  { stage: "negotiation", count: 2, total_amount: 148000 },
  { stage: "prospecting", count: 1, total_amount: 80000 },
  { stage: "proposal", count: 2, total_amount: 192000 },
  { stage: "won", count: 3, total_amount: 999999 },
  { stage: "lost", count: 1, total_amount: 5 },
];

t("plural", () => { eq(plural(1, "deal", "deals"), "1 deal"); eq(plural(0, "deal", "deals"), "0 deals"); eq(plural(2, "deal", "deals"), "2 deals"); });
t("stageBarRows: open stages only, canonical order", () => eq(stageBarRows(P, L).map((r) => r.stage), ["prospecting", "proposal", "negotiation"]));
t("stageBarRows: largest = 100%", () => eq(stageBarRows(P, L).find((r) => r.stage === "proposal").pct, 100));
t("stageBarRows: proportional", () => eq(stageBarRows(P, L).find((r) => r.stage === "negotiation").pct, 77));
t("stageBarRows: tiny non-zero floor 4%", () => eq(stageBarRows([{ stage: "proposal", count: 1, total_amount: 1000000 }, { stage: "prospecting", count: 1, total_amount: 1 }], L)[0].pct, 4));
t("stageBarRows: string amounts coerced", () => eq(stageBarRows([{ stage: "proposal", count: "2", total_amount: "100.50" }], L)[0].amount, 100.5));
t("stageBarRows: count label", () => eq(stageBarRows(P, L).map((r) => r.countLabel), ["1 deal", "2 deals", "2 deals"]));
t("stageBarRows: empty / null / garbage safe", () => { eq(stageBarRows([], L), []); eq(stageBarRows(null, L), []); eq(stageBarRows([null, undefined, {}], L), []); });
t("stageBarRows: zero-amount deals no NaN", () => eq(stageBarRows([{ stage: "proposal", count: 1, total_amount: 0 }], L)[0].pct, 4));
t("stageBarRows: unknown label falls back to key", () => eq(stageBarRows([{ stage: "proposal", count: 1, total_amount: 5 }], {})[0].label, "proposal"));

t("mergeTasks: overdue first and tagged", () => eq(mergeTasks([{ activity_id: 1 }], [{ activity_id: 2 }]).map((x) => [x.activity_id, x.bucket]), [[1, "overdue"], [2, "today"]]));
t("mergeTasks: dedupes, overdue wins", () => eq(mergeTasks([{ activity_id: 1 }], [{ activity_id: 1 }, { activity_id: 2 }]).map((x) => x.bucket), ["overdue", "today"]));
t("mergeTasks: limit", () => eq(mergeTasks([{ activity_id: 1 }, { activity_id: 2 }, { activity_id: 3 }], [], 2).length, 2));
t("mergeTasks: non-array / null rows safe", () => eq(mergeTasks(null, undefined), []));
t("mergeTasks: skips null rows", () => eq(mergeTasks([null, { activity_id: 5 }], []).length, 1));
t("mergeTasks: negative limit -> empty", () => eq(mergeTasks([{ activity_id: 1 }], [], -3), []));
t("mergeTasks: does not mutate input", () => { const a = [{ activity_id: 1 }]; mergeTasks(a, []); eq(a[0].bucket, undefined); });

t("bucketPill", () => { eq(bucketPill("overdue").tone, "danger"); eq(bucketPill("today").label, "Due today"); eq(bucketPill("x").tone, "neutral"); });
t("taskIconKey: known + fallback", () => { eq(taskIconKey("call"), "call"); eq(taskIconKey("zzz"), "task"); eq(taskIconKey(undefined), "task"); });
t("taskSubline", () => { eq(taskSubline({ label: "Contact" }, "Nov 14"), "Contact · Nov 14"); eq(taskSubline(null, "Nov 14"), "Nov 14"); eq(taskSubline(null, ""), ""); });
t("pillPalette: all tones resolve, amber uses dark text", () => {
  for (const tone of PILL_TONES) { const p = pillPalette(tone); if (!p.bg || !p.fg) throw new Error(tone); }
  eq(pillPalette("amber").fg, "accent.dark");
  eq(pillPalette("danger").bg, "error.light");
  eq(pillPalette("nope").bg, "action.hover");
});

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
