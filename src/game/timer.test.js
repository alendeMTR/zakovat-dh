import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "./constants.js";
import {
  elapsedMs,
  formatElapsed,
  formatRemaining,
  handInStatus,
  hasStarted,
  remainingMs,
  timerPhase,
} from "./timer.js";

const S = DEFAULT_SETTINGS; // 60 s, extra 20 s, warn 10 s
const running = (startedAt, accumulatedMs = 0) => ({ startedAt, accumulatedMs });

describe("elapsed and remaining time", () => {
  it("counts while running and holds while paused", () => {
    expect(elapsedMs(running(1000), 4000)).toBe(3000);
    expect(elapsedMs({ startedAt: null, accumulatedMs: 3000 }, 99999)).toBe(3000);
    expect(elapsedMs(running(10000, 3000), 12000)).toBe(5000);
  });

  it("never counts backwards if the clock is behind the start", () => {
    expect(elapsedMs(running(5000), 4000)).toBe(0);
  });

  it("goes negative once time is up, so late hand-ins can be told apart", () => {
    expect(remainingMs(running(0), S, 61000)).toBe(-1000);
  });

  it("knows whether the timer was ever started", () => {
    expect(hasStarted({ startedAt: null, accumulatedMs: 0 })).toBe(false);
    expect(hasStarted({ startedAt: null, accumulatedMs: 1 })).toBe(true);
    expect(hasStarted(running(0))).toBe(true);
  });
});

describe("timer phase (three colours)", () => {
  const at = (ms) => timerPhase(running(0), S, ms);

  it("is idle before the start", () => {
    expect(timerPhase({ startedAt: null, accumulatedMs: 0 }, S, 5000)).toBe("idle");
  });

  it("is extra up to and including the threshold, then neutral", () => {
    expect(at(0)).toBe("extra");
    expect(at(20000)).toBe("extra");
    expect(at(20001)).toBe("neutral");
  });

  it("warns in the last 10 seconds and is done at zero", () => {
    expect(at(49999)).toBe("neutral");
    expect(at(50000)).toBe("warn");
    expect(at(59999)).toBe("warn");
    expect(at(60000)).toBe("done");
    expect(at(90000)).toBe("done");
  });

  it("keeps the extra colour when the extra window runs into the warning", () => {
    const short = { ...S, timeSec: 25, extraSec: 20, warnSec: 10 };
    expect(timerPhase(running(0), short, 18000)).toBe("extra");
    expect(timerPhase(running(0), short, 21000)).toBe("warn");
  });

  it("has no extra phase when the extra window is 0", () => {
    expect(timerPhase(running(0), { ...S, extraSec: 0 }, 1000)).toBe("neutral");
  });
});

describe("hand-in status", () => {
  it("puts exactly 20.0 s in the extra window and 20.001 s outside it", () => {
    expect(handInStatus(20000, S)).toBe("extra");
    expect(handInStatus(20001, S)).toBe("inTime");
  });

  it("marks hand-ins after the time as late", () => {
    expect(handInStatus(60000, S)).toBe("inTime");
    expect(handInStatus(60001, S)).toBe("late");
  });

  it("never gives extra when the window is 0", () => {
    expect(handInStatus(0, { ...S, extraSec: 0 })).toBe("inTime");
  });
});

describe("clock text", () => {
  it("rounds remaining time up and stops at 0:00", () => {
    expect(formatRemaining(60000)).toBe("1:00");
    expect(formatRemaining(59001)).toBe("1:00");
    expect(formatRemaining(59000)).toBe("0:59");
    expect(formatRemaining(1)).toBe("0:01");
    expect(formatRemaining(0)).toBe("0:00");
    expect(formatRemaining(-500)).toBe("0:00");
    expect(formatRemaining(600000)).toBe("10:00");
  });

  it("rounds a hand-in time down", () => {
    expect(formatElapsed(18900)).toBe("0:18");
    expect(formatElapsed(65000)).toBe("1:05");
  });
});
