import { describe, expect, it } from "vitest";
import { cardKeyAction } from "./cardKeys.js";

const state = { running: false, remaining: 30000, teamCount: 3 };
const press = (event, over = {}) => cardKeyAction(event, { ...state, ...over });

describe("keys on the question card", () => {
  it("Escape returns to the wheel; Space starts and pauses; a number records a hand-in", () => {
    expect(press({ key: "Escape" }).action).toBe("close");
    expect(press({ key: " ", code: "Space" })).toEqual({ action: "start", preventDefault: true });
    expect(press({ key: " ", code: "Space" }, { running: true })).toEqual({ action: "pause", preventDefault: true });
    expect(press({ key: "3" })).toEqual({ action: "handIn", teamIndex: 2, preventDefault: false });
    expect(press({ key: "4" }).action).toBe(null); // only three teams
    expect(press({ key: "0" }).action).toBe(null);
  });

  it("F19: a modal owns the keyboard, so Escape closes only the modal", () => {
    // Escape in the End game confirmation used to close the card under it and stop its timer.
    for (const key of ["Escape", " ", "1"]) {
      expect(press({ key, code: key === " " ? "Space" : undefined, inModal: true })).toEqual({
        action: null,
        preventDefault: false,
      });
    }
  });

  it("F19: after zero Space does not pause, so the elapsed clock keeps running for late slips", () => {
    // Pause is hidden at zero (D53); the clock must keep counting so a late hand-in gets its time (D33).
    for (const remaining of [0, -1, -45000]) {
      for (const running of [true, false]) {
        expect(press({ key: " ", code: "Space" }, { remaining, running })).toEqual({
          action: null,
          preventDefault: true, // still swallowed: Space must not scroll the page
        });
      }
    }
    // A hand-in after zero is still recorded.
    expect(press({ key: "2" }, { remaining: -5000, running: true }).action).toBe("handIn");
  });

  it("leaves typing alone, and never fires twice while a key is held", () => {
    expect(press({ key: " ", code: "Space", inField: true }).action).toBe(null);
    expect(press({ key: "2", inField: true }).action).toBe(null);
    expect(press({ key: " ", code: "Space", repeat: true })).toEqual({ action: null, preventDefault: true });
    expect(press({ key: "2", repeat: true }).action).toBe(null);
    // Space on a focused button is the button's own key, not the timer's.
    expect(press({ key: " ", code: "Space", onButton: true }).action).toBe(null);
  });
});
