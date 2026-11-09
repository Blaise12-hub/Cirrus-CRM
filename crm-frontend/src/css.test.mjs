// Usage: node css.test.mjs path/to/index.css
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { tokens } from "./design/tokens.js";
import { contrast } from "./design/contrast.js";
import { STAT_ACCENTS } from "./design/palette.js";

const file = process.argv[2] || "./index.css";
const css = readFileSync(file, "utf8");

const block = (re) => {
  const m = css.match(re);
  assert.ok(m, `block not found: ${re}`);
  return m[0];
};
const vars = (b) => Object.fromEntries([...b.matchAll(/(--[\w-]+):\s*(#[0-9A-Fa-f]{6})\s*;/g)].map((m) => [m[1], m[2].toUpperCase()]));
const light = vars(block(/:root \{[\s\S]*?\n\}/));
const dark = { ...light, ...vars(block(/\[data-theme="dark"\] \{[\s\S]*?\n\}/)) };

const tests = [];
const test = (n, f) => tests.push({ n, f });

test("no legacy blue / navy hexes remain", () => {
  const legacy = ["#1160B7", "#0A3E7A", "#4A9EFF", "#7AB8FF", "#002050", "#6FA8E0", "#C9D6E8", "#8FA6C4",
    "#0176D3", "#E8F2FD", "#0B5CAB", "#E1EBF7", "#B6C2D1", "#3E4556", "#E5E9F0", "#252A36", "#D8DDE6", "#8C9BAE", "#5E7CE2"];
  const found = legacy.filter((h) => new RegExp(h, "i").test(css));
  assert.deepEqual(found, [], `legacy colors still present: ${found.join(", ")}`);
});

test("every var(--x) used is defined in :root", () => {
  const used = new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]));
  const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const extra = new Set(["--accent", "--accent-from", "--accent-to"]); // set inline by components
  const missing = [...used].filter((u) => !defined.has(u) && !extra.has(u));
  assert.deepEqual(missing, [], `undefined vars: ${missing.join(", ")}`);
});

test("dark block overrides every color var that :root defines", () => {
  const darkOnly = vars(block(/\[data-theme="dark"\] \{[\s\S]*?\n\}/));
  const missing = Object.keys(light).filter((k) => !(k in darkOnly));
  assert.deepEqual(missing, [], `not overridden in dark: ${missing.join(", ")}`);
});

test("no per-component dark overrides left that variables already cover", () => {
  const leftovers = [...css.matchAll(/\[data-theme="dark"\]\s+[.\w-]/g)];
  assert.equal(leftovers.length, 0, `${leftovers.length} component-level dark overrides remain`);
});

test("CSS variables match design tokens (no drift)", () => {
  const pairs = (mode, v) => [
    ["--color-bg", tokens[mode].background.default], ["--color-surface", tokens[mode].background.paper],
    ["--color-border", tokens[mode].divider], ["--color-primary", tokens[mode].primary.main],
    ["--color-primary-tint", tokens[mode].primary.light], ["--color-on-primary", tokens[mode].primary.contrastText],
    ["--color-text", tokens[mode].text.primary], ["--color-text-muted", tokens[mode].text.secondary],
    ["--color-faint", tokens[mode].faint], ["--color-track", tokens[mode].track],
    ["--color-track-strong", tokens[mode].trackStrong], ["--color-accent", tokens[mode].accent.main],
    ["--color-success", tokens[mode].success.main], ["--color-success-bg", tokens[mode].success.light],
    ["--color-warning", tokens[mode].warning.main], ["--color-error", tokens[mode].error.main],
    ["--color-error-bg", tokens[mode].error.light], ["--color-error-border", tokens[mode].error.border],
    ["--sidebar-bg", tokens[mode].sidebar.bg], ["--sidebar-text", tokens[mode].sidebar.text],
    ["--sidebar-text-muted", tokens[mode].sidebar.textMuted], ["--sidebar-active", tokens[mode].sidebar.active],
  ].map(([k, want]) => [mode, k, v[k], want.toUpperCase()]);
  for (const [mode, k, got, want] of [...pairs("light", light), ...pairs("dark", dark)]) {
    assert.equal(got, want, `${mode} ${k}: css=${got} tokens=${want}`);
  }
});

for (const [mode, v] of [["light", light], ["dark", dark]]) {
  test(`[${mode}] css text pairs meet AA`, () => {
    const chk = (a, b, label) => assert.ok(contrast(v[a], v[b]) >= 4.5, `${label}: ${v[a]} on ${v[b]} = ${contrast(v[a], v[b]).toFixed(2)}`);
    chk("--color-text", "--color-bg", "text/bg");
    chk("--color-text", "--color-surface", "text/surface");
    chk("--color-text-muted", "--color-surface", "muted/surface");
    chk("--color-text-muted", "--color-bg", "muted/bg");
    chk("--color-primary", "--color-surface", "primary link/surface");
    chk("--color-primary", "--color-primary-tint", "primary on tint (active tab)");
    chk("--color-on-primary", "--color-primary", "button label");
    chk("--color-error", "--color-error-bg", "error banner");
    chk("--color-success", "--color-success-bg", "active toggle");
    chk("--color-warning", "--color-surface", "warning text");
    chk("--sidebar-text", "--sidebar-bg", "sidebar text");
    chk("--sidebar-text-muted", "--sidebar-bg", "sidebar muted");
    chk("--sidebar-text", "--sidebar-active", "sidebar active item");
  });
}

test("sf timeline badges keep white icon contrast >= 4.5", () => {
  for (const cls of ["green", "teal", "orange", "blue", "purple", "red"]) {
    const m = css.match(new RegExp(`\\.sf-timeline-badge\\.${cls} \\{ background: (#[0-9A-Fa-f]{6}); \\}`));
    assert.ok(m, `badge ${cls} missing`);
    assert.ok(contrast("#FFFFFF", m[1]) >= 4.5, `${cls} ${m[1]} = ${contrast("#FFFFFF", m[1]).toFixed(2)}`);
  }
});

test("class selectors preserved (nothing deleted by accident)", () => {
  for (const sel of [".sidebar", ".nav-item.active", ".btn-primary", ".kpi-card", ".chart-card", ".data-table", ".column.drag-over",
    ".sf-tab.active", ".login-root", ".stat-card-accent::before", ".skeleton-bar", ".status-toggle.active", ".alert-banner"]) {
    assert.ok(css.includes(sel), `missing selector ${sel}`);
  }
});

test("every CSS variable referenced by STAT_ACCENTS is defined", () => {
  const defined = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
  const used = Object.values(STAT_ACCENTS).flat().flatMap((v) => [...v.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]));
  assert.ok(used.length > 0);
  const missing = used.filter((u) => !defined.has(u));
  assert.deepEqual(missing, [], `undefined: ${missing.join(", ")}`);
});

test("braces balance", () => {
  assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length);
});

let failed = 0;
for (const { n, f } of tests) {
  try { f(); console.log("PASS", n); } catch (e) { failed++; console.error("FAIL", n, "-", e.message); }
}
console.log(`\n${tests.length - failed}/${tests.length} passed`);
process.exit(failed ? 1 : 0);
