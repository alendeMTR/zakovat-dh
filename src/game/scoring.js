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
