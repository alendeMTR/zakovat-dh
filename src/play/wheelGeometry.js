// Wheel geometry in a 1000 × 1000 SVG box (structure from references/03: outer rim, ring of
// numbered pockets, inner bowl, centre hub). Angles are in degrees, 0 at the top (where the
// pointer is), growing clockwise. Pocket i (0-based, pocket number i + 1) is centred at i × step.

export const C = 500;
export const R = {
  rimOut: 496,
  rimIn: 458,
  pocketOut: 458,
  pocketIn: 232,
  bowl: 232,
  hub: 118,
};

export const stepFor = (count) => 360 / count;

export const pocketAngle = (index, count) => index * stepFor(count);

export function polar(radius, angle) {
  const rad = (angle * Math.PI) / 180;
  return [C + radius * Math.sin(rad), C - radius * Math.cos(rad)];
}

const fmt = (n) => Math.round(n * 100) / 100;

/** SVG path of one pocket: a ring sector between rIn and rOut. */
export function sectorPath(index, count, rIn = R.pocketIn, rOut = R.pocketOut) {
  const step = stepFor(count);
  // One question: a whole ring. A single 360° arc has the same start and end and draws nothing,
  // so the ring is two half arcs, outside clockwise and inside back.
  if (count === 1) {
    return [
      `M ${C} ${C - rOut}`,
      `A ${rOut} ${rOut} 0 1 1 ${C} ${C + rOut}`,
      `A ${rOut} ${rOut} 0 1 1 ${C} ${C - rOut}`,
      `M ${C} ${C - rIn}`,
      `A ${rIn} ${rIn} 0 1 0 ${C} ${C + rIn}`,
      `A ${rIn} ${rIn} 0 1 0 ${C} ${C - rIn}`,
      "Z",
    ].join(" ");
  }
  const a0 = pocketAngle(index, count) - step / 2;
  const a1 = a0 + step;
  const large = step > 180 ? 1 : 0;
  const [x0, y0] = polar(rOut, a0);
  const [x1, y1] = polar(rOut, a1);
  const [x2, y2] = polar(rIn, a1);
  const [x3, y3] = polar(rIn, a0);
  return [
    `M ${fmt(x0)} ${fmt(y0)}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${fmt(x1)} ${fmt(y1)}`,
    `L ${fmt(x2)} ${fmt(y2)}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${fmt(x3)} ${fmt(y3)}`,
    "Z",
  ].join(" ");
}

/**
 * Size of the pocket number, in SVG units: as large as the pocket's width allows, between 30 and 64.
 * 10 pockets → 64, 20 → about 52, 30 → about 35 (a two-digit number still fits its pocket).
 */
export function numberSize(count) {
  const width = (2 * Math.PI * (R.pocketOut - 60)) / count;
  return Math.round(Math.max(30, Math.min(64, width * 0.42)));
}

/** The rotation (degrees) at which `index` sits under the pointer. */
export const restingRotation = (index, count) => -pocketAngle(index, count);

/**
 * The pockets drawn on the wheel, in number order: every pocket not played yet, plus the one whose
 * card is open. A played pocket leaves the wheel when its card closes (D73, owner; replaces D23).
 * Numbers stay with their questions; only the positions close up.
 */
export function wheelPockets(game) {
  return game.pockets
    .filter((p) => !game.played.includes(p.no) || p.no === game.current)
    .map((p) => ({ no: p.no, type: p.question.type }));
}

/**
 * The rotation that puts the seam *before* pocket `index` under the pointer, so no pocket is named.
 * Used when a pocket has just left the wheel and when the screen opens with no card open.
 */
export const seamRotation = (index, count) => -pocketAngle(index, count) + stepFor(count) / 2;

/** `target` moved by whole turns to lie within half a turn of `current`, so the wheel does not race. */
export const nearestTurn = (target, current) => target + 360 * Math.round((current - target) / 360);

/**
 * The pocket the wheel rests on when the game screen opens: the one whose card is open (F23, D69),
 * else none — a played pocket is no longer on the wheel (D73). Null when no card is open.
 */
export const restingPocket = (game) => game?.current ?? null;

/** Where the wheel rests when the game screen opens: on the open card's pocket, else on a seam. */
export function initialRotation(game) {
  const shown = wheelPockets(game);
  if (shown.length === 0) return 0;
  const resting = restingPocket(game);
  const index = shown.findIndex((p) => p.no === resting);
  return index >= 0 ? restingRotation(index, shown.length) : seamRotation(0, shown.length);
}

/**
 * The next rotation for a spin that ends with pocket `index` under the pointer.
 * Always turns forward, at least `turns` full turns, and stops at a random spot inside the
 * pocket (never on its edge), so the landing looks natural. `rng` returns [0, 1).
 */
export function spinRotation(current, index, count, { turns = 5, rng = Math.random } = {}) {
  const step = stepFor(count);
  const jitter = (rng() - 0.5) * 0.6 * step; // within ±30% of the pocket's width
  const base = restingRotation(index, count) + jitter;
  const delta = (((base - current) % 360) + 360) % 360;
  return current + turns * 360 + delta;
}

/** Which pocket (0-based) is under the pointer at a given rotation. */
export function pocketAtPointer(rotation, count) {
  const step = stepFor(count);
  const angle = (((-rotation) % 360) + 360) % 360;
  return Math.round(angle / step) % count;
}
