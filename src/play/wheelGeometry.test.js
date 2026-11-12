import { describe, expect, it } from "vitest";
import { seeded } from "../game/testHelpers.js";
import {
  initialRotation,
  nearestTurn,
  numberSize,
  pocketAngle,
  pocketAtPointer,
  restingPocket,
  restingRotation,
  seamRotation,
  sectorPath,
  spinRotation,
  stepFor,
  wheelPockets,
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

const gameOf = (count, played, current = null) => ({
  pockets: Array.from({ length: count }, (_, i) => ({ no: i + 1, question: { type: i === 2 ? "direktor" : "oddiy" } })),
  played,
  current,
});

// D73: played pockets leave the wheel; the open one stays until its card closes.
describe("the pockets on the wheel", () => {
  it("shows every unplayed pocket in number order, with its type", () => {
    expect(wheelPockets(gameOf(5, [2, 4]))).toEqual([
      { no: 1, type: "oddiy" },
      { no: 3, type: "direktor" },
      { no: 5, type: "oddiy" },
    ]);
  });

  it("keeps the open card's pocket on the wheel, also when a played one is reopened", () => {
    expect(wheelPockets(gameOf(4, [1, 2], 2)).map((p) => p.no)).toEqual([2, 3, 4]);
  });

  it("is empty once every pocket is played and no card is open", () => {
    expect(wheelPockets(gameOf(3, [1, 2, 3]))).toEqual([]);
  });
});

// F23 regression: the pointer must agree with the card and the highlight after a reload.
describe("where the wheel rests when the game screen opens", () => {
  it("rests on the open card's pocket, even when an older one was reopened (D34)", () => {
    expect(restingPocket({ current: 1, played: [1, 2, 3] })).toBe(1);
    expect(restingPocket({ current: 3, played: [1, 2, 3] })).toBe(3);
  });

  it("names no pocket when no card is open: played pockets are off the wheel (D73)", () => {
    expect(restingPocket({ current: null, played: [4, 2] })).toBe(null);
    expect(restingPocket(null)).toBe(null);
  });

  it("puts the open card's pocket under the pointer, counting only the pockets on the wheel", () => {
    const game = gameOf(6, [1, 2, 3], 3); // wheel: 3, 4, 5, 6 → pocket 3 is index 0 of 4
    expect(pocketAtPointer(initialRotation(game), 4)).toBe(0);
    const later = gameOf(6, [1, 2, 5], 5); // wheel: 3, 4, 5, 6 → pocket 5 is index 2
    expect(pocketAtPointer(initialRotation(later), 4)).toBe(2);
  });

  it("rests on a seam, half a pocket from any centre, when no card is open", () => {
    const rotation = initialRotation(gameOf(10, [1, 2]));
    const offset = ((-rotation % 45) + 45) % 45; // 8 pockets on the wheel, 45° each
    expect(offset).toBeCloseTo(22.5);
  });
});

describe("closing up after a pocket leaves", () => {
  it("puts the seam where the removed pocket was under the pointer", () => {
    // Pocket at index 3 of 8 leaves; the 7 left close up, and the seam between new 2 and new 3 is at the top.
    const r = seamRotation(3, 7);
    expect(pocketAtPointer(r + stepFor(7) / 2 - 0.01, 7)).toBe(2);
    expect(pocketAtPointer(r - stepFor(7) / 2 + 0.01, 7)).toBe(3);
  });

  it("moves a target by whole turns only, to the turn nearest the current rotation", () => {
    expect(nearestTurn(-30, 7200)).toBe(7170);
    expect((nearestTurn(-30, 7200) + 30) % 360).toBe(0);
    expect(Math.abs(nearestTurn(100, -5000) - -5000)).toBeLessThanOrEqual(180);
  });
});
