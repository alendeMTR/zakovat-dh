// What a key press on the question card means (D52), as a pure rule so the locks can be tested.
//
// Two locks matter in a real lesson (fixlist F19):
//   * While a modal is open it owns the keyboard. Escape there closes the modal; it must not also
//     close the card under it, which would stop that question's timer.
//   * After zero the clock keeps running, so a slip that arrives late still gets a time (D33).
//     Pause is hidden at zero (D53), so Space must not pause either: a paused clock freezes the
//     elapsed time and every later hand-in is stamped with the same wrong moment.

/** `{ action, teamIndex?, preventDefault }`; `action` is null when the key does nothing. */
export function cardKeyAction(
  { key, code, repeat = false, inModal = false, inField = false, onButton = false },
  { running = false, remaining = 0, teamCount = 0 } = {},
) {
  const nothing = { action: null, preventDefault: false };
  if (inModal || inField) return nothing;

  if (key === "Escape") return { action: "close", preventDefault: false };

  if (code === "Space" && !onButton) {
    // Space scrolls the page by default, so it is swallowed even when it changes nothing.
    if (repeat || remaining <= 0) return { action: null, preventDefault: true };
    return { action: running ? "pause" : "start", preventDefault: true };
  }

  const n = Number(key);
  if (!repeat && Number.isInteger(n) && n >= 1 && n <= teamCount)
    return { action: "handIn", teamIndex: n - 1, preventDefault: false };

  return nothing;
}
