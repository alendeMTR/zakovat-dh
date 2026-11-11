import { Link, Navigate } from "react-router-dom";
import { House, ListChecks } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { ranking } from "../game/scoring.js";
import { formatWhen } from "../i18n/format.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useGame } from "./useGame.js";
import "./results.css";

/**
 * The leaderboard after "End game" (brief, plan §4 screen 6). Shared places for ties (D16).
 * Scores always show here, even when they were hidden during the game (D22).
 */
export default function ResultsPage() {
  const { t } = useI18n();
  const [game] = useGame();

  if (!game) return <Navigate to="/" replace />;
  if (game.endedAt === null) return <Navigate to="/game" replace />;

  const rows = ranking(game);

  return (
    <div className="page results-page">
      <AppHeader />
      <main className="results">
        <header className="results__head">
          <h1 className="results__title">{t("results.title")}</h1>
          <p className="results__meta num">
            {t("results.meta", {
              questions: game.played.length,
              teams: game.teams.length,
              date: formatWhen(game.endedAt),
            })}
          </p>
        </header>

        {/* Six or more teams: tighter rows, so all eight fit one 720-high screen with the buttons. */}
        <table className={`board${rows.length > 5 ? " board--compact" : ""}`}>
          <thead>
            <tr>
              <th scope="col" className="board__place">{t("results.place")}</th>
              <th scope="col">{t("results.team")}</th>
              <th scope="col" className="board__score">{t("results.score")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.team.id} className={row.place === 1 ? "board__row board__row--first" : "board__row"}>
                <td className="board__place num">{row.place}</td>
                <th scope="row" className="board__team">
                  <span className="board__team-inner">
                    <span className="board__name">{row.team.name}</span>
                    <span className="board__counts num">
                      {t("results.counts", { correct: row.correct + row.extra, extra: row.extra })}
                    </span>
                  </span>
                </th>
                <td className="board__score num">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
      </main>
    </div>
  );
}
