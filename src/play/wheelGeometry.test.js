import { describe, expect, it } from "vitest";
import { seeded } from "../game/testHelpers.js";
import {
  numberSize,
  pocketAngle,
  pocketAtPointer,
  restingPocket,
  restingRotation,
  sectorPath,
  spinRotation,
  stepFor,
} from "./wheelGeometry.js";

describe("pockets", () => {
  it("puts pocket 1 at the top and spaces pockets evenly", () => {
    expect(pocketAngle(0, 10)).toBe(0);
    expect(pocketAngle(5, 10)).toBe(180);
    expect(stepFor(30)).toBe(12);
  });

  it("draws a closed ring sector", () => {
    const path = sectorPath(0, 10);
    expect(path.startsWith("M ")).toBe(true);
    expect(path.endsWith("Z")).toBe(true);
    expect(path.match(/A /g)).toHaveLength(2);
  });

  it("draws a whole ring for a one-question game (a 360° arc would draw nothing)", () => {
    const path = sectorPath(0, 1);
    expect(path.match(/A /g)).toHaveLength(4);
    expect(path).not.toContain("NaN");
  });

  it("sizes pocket numbers to the pocket width", () => {
    expect(numberSize(10)).toBe(64);
    expect(numberSize(30)).toBeGreaterThanOrEqual(30);
    expect(numberSize(30)).toBeLessThan(numberSize(20));
  });
});

describe("spinning", () => {
  it("reads the pocket under the pointer from the resting rotation", () => {
    for (const count of [10, 20, 30]) {
      for (let i = 0; i < count; i += 1) {
        expect(pocketAtPointer(restingRotation(i, count), count)).toBe(i);
      }
    }
  });

  it("always lands on the chosen pocket, inside it, after at least 5 forward turns", () => {
    const rng = seeded(11);
    for (const count of [10, 17, 30]) {
      let rotation = 0;
      for (let k = 0; k < 50; k += 1) {
        const target = Math.floor(rng() * count);
        const next = spinRotation(rotation, target, count, { rng });
        expect(next - rotation).toBeGreaterThanOrEqual(5 * 360);
        expect(next - rotation).toBeLessThan(6 * 360);
        expect(pocketAtPointer(next, count)).toBe(target);
        // Never closer than 20% of a pocket to its edge.
        const offset = (((next + pocketAngle(target, count)) % 360) + 540) % 360 - 180;
        expect(Math.abs(offset)).toBeLessThanOrEqual(0.3 * stepFor(count) + 1e-9);
        rotation = next;
      }
    }
  });
});

// F23 regression: the pointer must agree with the card and the highlight after a reload.
describe("where the wheel rests when the game screen opens", () => {
  it("rests on the open card's pocket, even when an older one was reopened (D34)", () => {
    expect(restingPocket({ current: 1, played: [1, 2, 3] })).toBe(1);
    expect(restingPocket({ current: 3, played: [1, 2, 3] })).toBe(3);
  });

  it("rests on the last pocket played when no card is open, and nowhere before the first spin", () => {
    expect(restingPocket({ current: null, played: [4, 2] })).toBe(2);
    expect(restingPocket({ current: null, played: [] })).toBe(null);
    expect(restingPocket(null)).toBe(null);
  });

  it("puts that pocket under the pointer", () => {
    const game = { current: 1, played: [1, 2, 3] };
    expect(pocketAtPointer(restingRotation(restingPocket(game) - 1, 6), 6)).toBe(0);
  });
});
