import { useEffect, useRef, useState } from "react";

// Easing function — decelerate toward end for a satisfying "settle" feel
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

/**
 * Animated count-up from 0 → value.
 *
 * @param {number}  value     Target number
 * @param {"money"|"percent"|"number"} format  Display format
 * @param {number}  duration  Animation length in ms (default 1200)
 * @param {string}  prefix    Optional prefix (e.g. "$")
 * @param {string}  suffix    Optional suffix (e.g. "%")
 */
export default function AnimatedCounter({
  value,
  format = "number",
  duration = 1200,
  prefix = "",
  suffix = "",
}) {
  const [display, setDisplay] = useState(formatValue(0, format, prefix, suffix));
  const prevValue = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = prevValue.current;
    const to = Number(value) || 0;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = from + (to - from) * eased;

      setDisplay(formatValue(current, format, prefix, suffix));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, format, duration, prefix, suffix]);

  return display;
}

function formatValue(n, format, prefix, suffix) {
  switch (format) {
    case "money":
      return prefix + "$" + Math.round(n).toLocaleString("en-US") + suffix;
    case "percent":
      return prefix + Math.round(n) + "%" + suffix;
    default:
      return prefix + Math.round(n).toLocaleString("en-US") + suffix;
  }
}
