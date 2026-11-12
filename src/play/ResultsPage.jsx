import { Link, Navigate } from "react-router-dom";
import { Gauge, House, ListChecks, Timer as TimerIcon, Zap } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { gameInsights, ranking } from "../game/scoring.js";
import { formatElapsed } from "../game/timer.js";
import { formatWhen } from "../i18n/format.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useCountUp } from "./useCountUp.js";
import { useGame } from "./useGame.js";
import "./results.css";

const MEDAL = { 1: "gold", 2: "silver", 3: "bronze" };
// The podium rises third, second, first (D75); each step's reveal starts at these times (ms).
const RISE_AT = { 0: 1500, 1: 800, 2: 200 };
const AFTER_PODIUM = 2300;

function Score({ value, delayMs }) {
  return <>{useCountUp(value, { delayMs, durationMs: 800 })}</>;
}

/**
 * One step of the podium: the team, its score counting up, and the block with its place.
 * The reveal order follows the position (third first); the height and colour follow the place, so
 * teams that share a place stand at the same height (D16).
 */
function PodiumStep({ row, index, t }) {
  const medal = MEDAL[row.place] ?? "none";
  const delay = RISE_AT[index];
  const height = Math.min(row.place, 3);
  return (
    <li className={`podium__step podium__step--h${height} podium__step--${medal}`} style={{ "--delay": `${delay}ms` }}>
      <div className="podium__who">
        <span className="podium__name" title={row.team.name}>{row.team.name}</span>
        <span className="podium__score num">
          <Score value={row.score} delayMs={delay + 300} />
        </span>
        <span className="podium__unit">{t("results.scoreUnit")}</span>
      </div>
      <div className="podium__block">
        <span className="podium__medal num" aria-label={t("results.placeLabel", { n: row.place })}>{row.place}</span>
      </div>
    </li>
  );
}

/**
 * The leaderboard after "End game" (brief, plan §4 screen 6; D58, D75). Shared places for ties (D16).
 * Scores always show here, even when they were hidden during the game (D22).
 * The top three stand on a podium in gold, silver and bronze, revealed third → second → first; then the
 * full table and three facts about the game. With reduced motion everything is in place at once.
 */
export default function ResultsPage() {
  const { t } = useI18n();
  const [game] = useGame();

  if (!game) return <Navigate to="/" replace />;
  if (game.endedAt === null) return <Navigate to="/game" replace />;

  const rows = ranking(game);
  const top = rows.slice(0, 3);
  // Podium order on screen: second, first, third (only the steps that exist).
  const podium = [1, 0, 2].filter((i) => top[i]);
  const { fastest, hardest, extras } = gameInsights(game);

  const insights = [
    fastest && {
      key: "fastest",
      Icon: Zap,
      label: t("results.insight.fastest"),
      value: fastest.team.name,
      detail: t("results.insight.fastestDetail", { n: fastest.pocketNo, time: formatElapsed(fastest.ms) }),
    },
    hardest && {
      key: "hardest",
      Icon: Gauge,
      label: t("results.insight.hardest"),
      value: t("game.pocket", { n: hardest.pocketNo }),
      detail: t("results.insight.hardestDetail", { correct: hardest.correct, judged: hardest.judged }),
      quote: hardest.question.text,
    },
    extras && {
      key: "extras",
      Icon: TimerIcon,
      label: t("results.insight.extras"),
      value: extras.teams.map((team) => team.name).join(", "),
      detail: t("results.insight.extrasDetail", { n: extras.n }),
    },
  ].filter(Boolean);

  return (
    <div className="page results-page">
      <AppHeader />
      <main className="results">
        <header className="results__head">
          <div>
            <h1 className="results__title">{t("results.title")}</h1>
            <p className="results__meta num">
              {t("results.meta", { questions: game.played.length, teams: game.teams.length, date: formatWhen(game.endedAt) })}
            </p>
          </div>
          <div className="results__actions">
            <Link to="/" className="stage-btn">
              <House aria-hidden="true" className="stage-btn__icon" />
              {t("results.home")}
            </Link>
            <Link to="/game/breakdown" className="stage-btn stage-btn--primary">
              <ListChecks aria-hidden="true" className="stage-btn__icon" />
              {t("results.breakdown")}
            </Link>
          </div>
        </header>

        <div className="results__body">
          <ol className="podium" aria-label={t("results.podium")}>
            {podium.map((i) => (
              <PodiumStep key={top[i].team.id} row={top[i]} index={i} t={t} />
            ))}
          </ol>

          <section className="board" aria-labelledby="board-title" style={{ "--delay": `${AFTER_PODIUM}ms` }}>
            <h2 id="board-title" className="board__title">{t("results.table")}</h2>
            <table className={`board__table${rows.length > 5 ? " board__table--compact" : ""}`}>
              <thead>
                <tr>
                  <th scope="col" className="board__place">{t("results.place")}</th>
                  <th scope="col">{t("results.team")}</th>
                  <th scope="col" className="board__score">{t("results.score")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const medal = MEDAL[row.place];
                  return (
                    <tr
                      key={row.team.id}
                      className={`board__row${medal ? ` board__row--${medal}` : ""}`}
                      style={{ "--row": i }}
                    >
                      <td className="board__place">
                        <span className={`board__medal num${medal ? ` board__medal--${medal}` : ""}`}>{row.place}</span>
                      </td>
                      <th scope="row" className="board__team">
                        <span className="board__name">{row.team.name}</span>
                        <span className="board__counts num">
                          {t("results.counts", { correct: row.correct + row.extra, extra: row.extra })}
                        </span>
                      </th>
                      <td className="board__score num">{row.score}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>
        </div>

        {insights.length > 0 && (
          <ul className="insights" aria-label={t("results.insights")} style={{ "--delay": `${AFTER_PODIUM + 300}ms` }}>
            {insights.map(({ key, Icon, label, value, detail, quote }) => (
              <li key={key} className="insight">
                <span className="insight__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="insight__body">
                  <span className="insight__label">{label}</span>
                  <span className="insight__value" title={quote}>{value}</span>
                  <span className="insight__detail num">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
