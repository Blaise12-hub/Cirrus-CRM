import assert from "node:assert/strict";
import { tokens, stages, leadStatus } from "./design/tokens.js";
import { buildPalette, stageColors, leadStatusColors, chartChrome, STAT_ACCENTS } from "./design/palette.js";
import { contrast } from "./design/contrast.js";

const tests = [];
const test = (n, f) => tests.push({ n, f });
const AA = 4.5, UI = 3;
const atLeast = (a, b, min, label) => {
  const r = contrast(a, b);
  assert.ok(r >= min, `${label}: ${a} on ${b} = ${r.toFixed(2)} (< ${min})`);
};
const hue = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return 0;
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};

for (const mode of ["light", "dark"]) {
  const t = tokens[mode];
  test(`[${mode}] body text on page + paper`, () => {
    atLeast(t.text.primary, t.background.default, AA, "primary/default");
    atLeast(t.text.primary, t.background.paper, AA, "primary/paper");
    atLeast(t.text.secondary, t.background.default, AA, "secondary/default");
    atLeast(t.text.secondary, t.background.paper, AA, "secondary/paper");
  });
  test(`[${mode}] button label on every filled color`, () => {
    for (const k of ["primary", "accent", "success", "warning", "error", "info"]) atLeast(t[k].contrastText, t[k].main, AA, `${k} button`);
  });
  test(`[${mode}] colored text readable on paper`, () => {
    for (const k of ["primary", "success", "warning", "error", "info"]) atLeast(t[k].main, t.background.paper, AA, `${k} text on paper`);
  });
  test(`[${mode}] chip text on tinted backgrounds`, () => {
    for (const k of ["primary", "success", "warning", "error", "info"]) atLeast(t[k].main, t[k].light, AA, `${k} on its tint`);
    atLeast(t.accent.dark, t.accent.light, AA, "accent text on accent tint");
  });
  test(`[${mode}] sidebar text`, () => {
    atLeast(t.sidebar.text, t.sidebar.bg, AA, "sidebar text");
    atLeast(t.sidebar.textMuted, t.sidebar.bg, AA, "sidebar muted");
    atLeast(t.sidebar.text, t.sidebar.active, AA, "sidebar active");
    atLeast(t.accent.main, t.sidebar.bg, UI, "accent bar/brand on sidebar");
  });
  test(`[${mode}] stage colors visible on paper (>=3:1)`, () => {
    for (const [k, v] of Object.entries(stages)) atLeast(v, t.background.paper, UI, `stage ${k}`);
    const c = chartChrome(mode);
    atLeast(c.forecastWon, t.background.paper, UI, "forecast won");
    atLeast(c.forecastWeighted, t.background.paper, mode === "light" ? 2 : UI, "forecast weighted (fill, labeled)");
  });
}

test("stage colors carry white text (stage-btn.active) at >=4.5:1", () => {
  for (const [k, v] of Object.entries(stages)) atLeast("#FFFFFF", v, AA, `white on ${k}`);
});
test("won is not confusable with brand or proposal (>=30deg hue gap)", () => {
  for (const mode of ["light", "dark"]) {
    assert.notEqual(stages.won.toLowerCase(), tokens[mode].primary.main.toLowerCase());
  }
  assert.ok(Math.abs(hue(stages.won) - hue(stages.proposal)) >= 30, "won vs proposal hue too close");
  assert.ok(Math.abs(hue(tokens.light.success.main) - hue(tokens.light.primary.main)) >= 30, "success vs primary hue too close");
});
test("accent amber is never required as text on white (documented: fills only)", () => {
  assert.ok(contrast(tokens.light.accent.main, "#FFFFFF") < AA);
});
test("buildPalette shape is MUI-compatible", () => {
  for (const m of ["light", "dark"]) {
    const p = buildPalette(m);
    for (const k of ["mode", "primary", "secondary", "success", "warning", "error", "info", "background", "text", "divider"]) assert.ok(p[k] !== undefined, `${m}.${k}`);
    assert.equal(p.mode, m);
    assert.ok(p.primary.main && p.primary.contrastText);
  }
});
test("unknown mode falls back to light", () => assert.equal(buildPalette("sepia").mode, "light"));
test("stage + lead keys match existing app keys", () => {
  assert.deepEqual(Object.keys(stageColors()), ["prospecting", "qualification", "proposal", "negotiation", "won", "lost"]);
  assert.deepEqual(Object.keys(leadStatusColors()), ["new", "contacted", "qualified", "converted", "disqualified"]);
  assert.equal(leadStatus.converted, stages.won);
});
test("stageColors returns a copy (callers cannot mutate the source)", () => {
  const a = stageColors(); a.won = "#000000";
  assert.notEqual(stageColors().won, "#000000");
});
test("STAT_ACCENTS: the keys the dashboards use exist, each a [from, to] pair", () => {
  for (const k of ["brand", "success", "danger", "warning", "info", "neutral"]) {
    assert.ok(Array.isArray(STAT_ACCENTS[k]) && STAT_ACCENTS[k].length === 2, k);
    assert.ok(STAT_ACCENTS[k].every((v) => typeof v === "string" && v.length > 3), k);
  }
});
test("chartChrome.brandFill is the mode's primary color", () => {
  assert.equal(chartChrome("light").brandFill, tokens.light.primary.main);
  assert.equal(chartChrome("dark").brandFill, tokens.dark.primary.main);
});
test("all token colors are valid #RRGGBB", () => {
  const re = /^#[0-9A-Fa-f]{6}$/;
  const walk = (o) => Object.values(o).forEach((v) => (typeof v === "string" ? assert.match(v, re) : walk(v)));
  walk(tokens); walk(stages);
});

let failed = 0;
for (const { n, f } of tests) {
  try { f(); console.log("PASS", n); } catch (e) { failed++; console.error("FAIL", n, "-", e.message); }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
