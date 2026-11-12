// Scores are never stored: they are summed from the verdicts every time (D15).

/** Points for one verdict on one question type (D9). */
export function pointsFor(settings, type, verdict) {
  const table = settings.points[type];
  if (!table) return 0;
  if (verdict === "correct") return table.correct;
  if (verdict === "extra") return table.correct + table.extra;
  return 0;
}

const questionAt = (game, pocketNo) => game.pockets.find((p) => p.no === pocketNo)?.question;

/** { [teamId]: { score, correct, extra, wrong } } over every round played. */
export function teamTotals(game) {
  const totals = Object.fromEntries(
    game.teams.map((team) => [team.id, { score: 0, correct: 0, extra: 0, wrong: 0 }]),
  );
  for (const pocketNo of game.played) {
    const round = game.rounds[pocketNo];
    const question = questionAt(game, pocketNo);
    if (!round || !question) continue;
    for (const [teamId, verdict] of Object.entries(round.verdicts)) {
      const total = totals[teamId];
      if (!total) continue;
      total.score += pointsFor(game.settings, question.type, verdict);
      if (verdict in total) total[verdict] += 1;
    }
  }
  return totals;
}

/**
 * Teams in order of score, with shared places for ties (D16): 10, 10, 7 → places 1, 1, 3.
 * Inside a tie, teams keep their setup order; no hidden tiebreak.
 */
export function ranking(game) {
  const totals = teamTotals(game);
  const order = new Map(game.teams.map((team, index) => [team.id, index]));
  const rows = game.teams
    .map((team) => ({ team, ...totals[team.id] }))
    .sort((a, b) => b.score - a.score || order.get(a.team.id) - order.get(b.team.id));
  let place = 0;
  return rows.map((row, i) => {
    if (i === 0 || row.score !== rows[i - 1].score) place = i + 1;
    return { ...row, place };
  });
}

/** One row per played question, in the order played, for the breakdown (plan §4, screen 7). */
export function breakdownRows(game) {
  return game.played.map((pocketNo) => {
    const round = game.rounds[pocketNo];
    const question = questionAt(game, pocketNo);
    const marks = Object.fromEntries(
      game.teams.map((team) => {
        const verdict = round?.verdicts[team.id] ?? null;
        return [
          team.id,
          {
            verdict,
            points: verdict ? pointsFor(game.settings, question.type, verdict) : 0,
            handInMs: round?.handIns[team.id] ?? null,
          },
        ];
      }),
    );
    return { pocketNo, question, marks };
  });
}

// ── Live and end-of-game details (the ranking panel and the results page, D74, D75) ──

const isCorrect = (verdict) => verdict === "correct" || verdict === "extra";

/** The question the live ranking reports on: the open card's, else the last one played; null before the first. */
export const focusPocket = (game) => game.current ?? game.played.at(-1) ?? null;

/** Points each team earned on one question: { [teamId]: n }. */
export function roundPoints(game, pocketNo) {
  const round = game.rounds[pocketNo];
  const question = questionAt(game, pocketNo);
  return Object.fromEntries(
    game.teams.map((team) => {
      const verdict = round?.verdicts[team.id];
      return [team.id, verdict && question ? pointsFor(game.settings, question.type, verdict) : 0];
    }),
  );
}

/**
 * Places each team moved because of one question: { [teamId]: n }, positive = up.
 * The ranking without that question's verdicts against the ranking with them (shared places, D16).
 */
export function placeMoves(game, pocketNo) {
  const before = new Map(
    ranking({ ...game, played: game.played.filter((no) => no !== pocketNo) }).map((row) => [row.team.id, row.place]),
  );
  return Object.fromEntries(ranking(game).map((row) => [row.team.id, before.get(row.team.id) - row.place]));
}

/** One question's result: how many teams were judged and right, and the fastest correct hand-in. */
export function roundSummary(game, pocketNo) {
  const round = game.rounds[pocketNo];
  const verdicts = round?.verdicts ?? {};
  const handIns = round?.handIns ?? {};
  let fastest = null;
  for (const team of game.teams) {
    const ms = handIns[team.id];
    if (!isCorrect(verdicts[team.id]) || ms === undefined) continue;
    if (fastest === null || ms < fastest.ms) fastest = { team, ms };
  }
  return {
    judged: game.teams.filter((team) => team.id in verdicts).length,
    correct: game.teams.filter((team) => isCorrect(verdicts[team.id])).length,
    total: game.teams.length,
    fastest,
  };
}

/**
 * Three facts for the results page, each null when the game gives no answer:
 * - fastest: the quickest correct hand-in of the game { team, ms, pocketNo } (first played wins a tie);
 * - hardest: the judged question the fewest teams got right { pocketNo, question, correct, judged };
 * - extras: the team or teams with the most extra bonuses { teams, n }, when anyone earned one.
 */
export function gameInsights(game) {
  let fastest = null;
  let hardest = null;
  for (const pocketNo of game.played) {
    const summary = roundSummary(game, pocketNo);
    if (summary.fastest && (fastest === null || summary.fastest.ms < fastest.ms)) {
      fastest = { ...summary.fastest, pocketNo };
    }
    if (summary.judged > 0 && (hardest === null || summary.correct < hardest.correct)) {
      hardest = { pocketNo, question: questionAt(game, pocketNo), correct: summary.correct, judged: summary.judged };
    }
  }
  const totals = teamTotals(game);
  const most = Math.max(0, ...game.teams.map((team) => totals[team.id].extra));
  const extras = most > 0 ? { teams: game.teams.filter((team) => totals[team.id].extra === most), n: most } : null;
  return { fastest, hardest, extras };
}
