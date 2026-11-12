import { useEffect, useState } from "react";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * A number that counts from 0 up to `value`, starting after `delayMs` and taking `durationMs`
 * (ease-out). With reduced motion, or a value of 0, it is the final number from the first frame.
 */
export function useCountUp(value, { delayMs = 0, durationMs = 900 } = {}) {
  const [shown, setShown] = useState(() => (reducedMotion() || value <= 0 ? value : 0));

  useEffect(() => {
    if (reducedMotion() || value <= 0) {
      setShown(value);
      return undefined;
    }
    let frame = 0;
    const start = performance.now() + delayMs;
    const tick = (now) => {
      const progress = Math.min(1, Math.max(0, (now - start) / durationMs));
      setShown(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, delayMs, durationMs]);

  return shown;
}
