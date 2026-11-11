import { useLayoutEffect } from "react";

// The stage unit, as in tokens.css: --u = min(1vh, 0.5625vw). Keep the two in step.
const stageUnit = () => Math.min(window.innerHeight / 100, (window.innerWidth * 0.5625) / 100);

// Question text limits (tokens.css --st-question-min / --st-question-max, plan §5).
const MIN_U = 3.7;
const MAX_U = 6.6;

/**
 * Sets the question text to the largest size that fits its box, never below the floor (D25).
 * Re-fits when the box changes size (window, team rows, answer shown).
 * If even the floor overflows, the box scrolls rather than shrinking the text further.
 */
export function useFitText(boxRef, textRef, deps) {
  useLayoutEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return undefined;

    const fit = () => {
      const u = stageUnit();
      const fits = () => text.scrollHeight <= box.clientHeight + 1 && text.scrollWidth <= box.clientWidth + 1;
      box.classList.remove("is-scrolling");
      let lo = MIN_U * u;
      let hi = MAX_U * u;
      text.style.fontSize = `${hi}px`;
      if (fits()) return;
      for (let i = 0; i < 8; i += 1) {
        const mid = (lo + hi) / 2;
        text.style.fontSize = `${mid}px`;
        if (fits()) lo = mid;
        else hi = mid;
      }
      text.style.fontSize = `${lo}px`;
      // Too long even at the floor: start at the top and let the teacher scroll, never clip.
      if (!fits()) box.classList.add("is-scrolling");
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
