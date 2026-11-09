// Pure helpers for dashboard display. No React, no imports.

// "$0", "$850", "$1.5k", "$4k", "$1.2M". Used for chart axes so a flat series
// reads "$0 ... $0" instead of "$0k" repeated on every tick.
export function compactMoney(value) {
  const n = Number(value);
  if (value === null || value === undefined || value === "" || !Number.isFinite(n)) return "$0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const rounded = Math.round(abs);
  if (rounded < 1000) return `${sign}$${rounded}`;
  const trim = (x) => x.toFixed(1).replace(/\.0$/, "");
  if (abs < 1_000_000) return `${sign}$${trim(abs / 1000)}k`;
  return `${sign}$${trim(abs / 1_000_000)}M`;
}

// Hour-of-day greeting: 00-11 morning, 12-17 afternoon, 18-23 evening.
export function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// "Friday, October 30" in the viewer's locale.
export function longDate(date = new Date(), locale) {
  return date.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" });
}