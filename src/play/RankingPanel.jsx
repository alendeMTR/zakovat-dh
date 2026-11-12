import { ArrowDown, ArrowUp, Check, CheckCheck, EyeOff } from "lucide-react";
import { focusPocket, placeMoves, ranking, roundPoints, roundSummary } from "../game/scoring.js";
import { formatElapsed } from "../game/timer.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

const MEDAL = { 1: "gold", 2: "silver", 3: "bronze" };

/**
 * The right panel of the game screen (D74): the live ranking with shared places (D16), each team's
 * right answers and extra bonuses, what the last question changed (points and places moved), and a
 * short summary of that question. With scores hidden (D22) it lists the teams only, so nothing about
 * the standings shows, and the screen keeps its shape.
 */
export default function RankingPanel({ game }) {
  const { t } = useI18n();

  if (!game.settings.showScores) {
    return (
      <section className="side-panel rank" aria-labelledby="rank-title">
        <header className="side-panel__head">
          <h2 id="rank-title" className="side-panel__title">{t("game.teams")}</h2>
          <p className="side-panel__meta num">{t("game.teamCount", { n: game.teams.length })}</p>
        </header>
        <ol className="rank__plain">
          {game.teams.map((team, i) => (
            <li key={team.id} className="rank__plain-row">
              <span className="rank__plain-no num">{i + 1}</span>
              <span className="rank__name">{team.name}</span>
            </li>
          ))}
        </ol>
        <p className="rank__hidden">
          <EyeOff aria-hidden="true" className="rank__hidden-icon" />
          {t("game.scoresHidden")}
        </p>
      </section>
    );
  }

  const rows = ranking(game);
  const focus = focusPocket(game);
  const points = focus ? roundPoints(game, focus) : {};
  const moves = focus ? placeMoves(game, focus) : {};
  const summary = focus ? roundSummary(game, focus) : null;

  return (
    <section className={`side-panel rank${rows.length > 5 ? " rank--compact" : ""}`} aria-labelledby="rank-title">
      <header className="side-panel__head">
        <h2 id="rank-title" className="side-panel__title">{t("game.ranking")}</h2>
        <p className="side-panel__meta num">
          {game.played.length === 0 ? t("game.rankingStart") : t("game.rankingAfter", { n: game.played.length })}
        </p>
      </header>

      <div className="rank__cols" aria-hidden="true">
        <span>{t("results.place")}</span>
        <span>{t("results.team")}</span>
        <span className="rank__cols-last">{t("game.lastQuestionShort")}</span>
        <span className="rank__cols-score">{t("results.score")}</span>
      </div>
      <ol className="rank__list">
        {rows.map((row) => {
          const medal = row.score > 0 ? MEDAL[row.place] : undefined;
          const move = moves[row.team.id] ?? 0;
          const gained = points[row.team.id] ?? 0;
          return (
            <li key={row.team.id} className={`rank__row${medal ? ` rank__row--${medal}` : ""}`}>
              <span className={`rank__place num${medal ? ` rank__place--${medal}` : ""}`}>{row.place}</span>
              <span className="rank__name" title={row.team.name}>{row.team.name}</span>
              {/* The card's own verdict icons: ✓ right answers, ✓✓ of them with the extra bonus (D55). */}
              <span
                className="rank__counts num"
                title={t("game.counts", { correct: row.correct + row.extra, extra: row.extra })}
              >
                <span className="visually-hidden">{t("game.counts", { correct: row.correct + row.extra, extra: row.extra })}</span>
                <span className="rank__count" aria-hidden="true">
                  <Check />
                  {row.correct + row.extra}
                </span>
                <span className="rank__count" aria-hidden="true">
                  <CheckCheck />
                  {row.extra}
                </span>
              </span>
              <span className="rank__change num">
                {move !== 0 && (
                  <span
                    className={`rank__move rank__move--${move > 0 ? "up" : "down"}`}
                    title={t(move > 0 ? "game.moveUp" : "game.moveDown", { n: Math.abs(move) })}
                  >
                    {move > 0 ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" />}
                    {Math.abs(move)}
                    <span className="visually-hidden">{t(move > 0 ? "game.moveUp" : "game.moveDown", { n: Math.abs(move) })}</span>
                  </span>
                )}
                {gained > 0 && (
                  <span className="rank__gained" title={t("game.lastPoints", { n: gained })}>
                    +{gained}
                  </span>
                )}
              </span>
              <span className="rank__score num" aria-label={t("game.scoreLabel", { score: row.score })}>
                {row.score}
              </span>
            </li>
          );
        })}
      </ol>

      {summary && (
        <div className="rank__last">
          <h3 className="side-panel__sub num">{t("game.lastQuestion", { n: focus })}</h3>
          <p className="rank__last-line num">
            {summary.judged === 0
              ? t("game.lastUnjudged")
              : t("game.lastCorrect", { correct: summary.correct, total: summary.total })}
          </p>
          {summary.fastest && (
            <p className="rank__last-line num">
              {t("game.lastFastest", { team: summary.fastest.team.name, time: formatElapsed(summary.fastest.ms) })}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
