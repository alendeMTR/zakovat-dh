import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, House, Minus, Printer } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { TypeChip } from "../components/QuestionType.jsx";
import { breakdownRows, ranking, teamTotals } from "../game/scoring.js";
import { formatElapsed } from "../game/timer.js";
import { formatWhen } from "../i18n/format.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import VerdictDialog from "./VerdictDialog.jsx";
import { VERDICT_ICONS } from "./verdictIcons.js";
import { useGame } from "./useGame.js";
import "./breakdown.css";

const ICON = Object.fromEntries(VERDICT_ICONS.map(({ key, Icon }) => [key, Icon]));
const MEDAL = { 1: "gold", 2: "silver", 3: "bronze" };

/**
 * The breakdown (brief: "like a graded test"; plan §4 screen 7): every question played, in the order
 * played, with its answer and each team's mark. A click on a mark corrects it (D15); totals follow.
 */
export default function BreakdownPage() {
  const { t } = useI18n();
  const [game, dispatch] = useGame();
  const [target, setTarget] = useState(null); // { pocketNo, team, verdict }

  if (!game) return <Navigate to="/" replace />;
  if (game.endedAt === null) return <Navigate to="/game" replace />;

  const rows = breakdownRows(game);
  const totals = teamTotals(game);
  const places = Object.fromEntries(ranking(game).map((row) => [row.team.id, row.place]));
  const unplayed = game.pockets.length - game.played.length;

  const markLabel = (verdict) => (verdict ? t(`card.verdict.${verdict}`) : t("breakdown.none"));
  const setVerdict = (verdict) => {
    // SET_VERDICT clears a mark when it is set again, so re-picking the current mark changes nothing.
    if (verdict !== target.verdict) {
      dispatch({ type: "SET_VERDICT", pocketNo: target.pocketNo, teamId: target.team.id, verdict });
    }
    setTarget(null);
  };
  const clearVerdict = () => {
    if (target.verdict) {
      dispatch({ type: "SET_VERDICT", pocketNo: target.pocketNo, teamId: target.team.id, verdict: target.verdict });
    }
    setTarget(null);
  };

  return (
    <div className="page breakdown-page">
      <AppHeader />
      <main className="breakdown">
        <header className="breakdown__head">
          <div>
            <h1 className="breakdown__title">{t("breakdown.title")}</h1>
            <p className="breakdown__meta num">
              {t("results.meta", { questions: game.played.length, teams: game.teams.length, date: formatWhen(game.endedAt) })}
            </p>
          </div>
          <div className="breakdown__actions">
            <Link to="/game/results" className="btn btn--secondary">
              <ArrowLeft size={18} aria-hidden="true" />
              {t("breakdown.back")}
            </Link>
            <button type="button" className="btn btn--secondary" onClick={() => window.print()}>
              <Printer size={18} aria-hidden="true" />
              {t("breakdown.print")}
            </button>
            <Link to="/" className="btn btn--secondary">
              <House size={18} aria-hidden="true" />
              {t("results.home")}
            </Link>
          </div>
        </header>

        <p className="breakdown__hint">{t("breakdown.hint")}</p>
        {unplayed > 0 && <p className="breakdown__hint">{t("breakdown.unplayed", { n: unplayed })}</p>}

        <div className="breakdown__scroll">
          <table className="sheet">
            <thead>
              <tr>
                <th scope="col" className="sheet__no">{t("breakdown.no")}</th>
                <th scope="col" className="sheet__question">{t("breakdown.question")}</th>
                <th scope="col" className="sheet__answer">{t("breakdown.answer")}</th>
                {game.teams.map((team) => {
                  const place = places[team.id];
                  return (
                    <th key={team.id} scope="col" className="sheet__team" title={team.name}>
                      <span className="sheet__team-name">{team.name}</span>
                      <span className="sheet__team-meta num">
                        <span className={`sheet__medal${MEDAL[place] ? ` sheet__medal--${MEDAL[place]}` : ""}`}>{place}</span>
                        {t("breakdown.teamTotal", { n: totals[team.id].score })}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.pocketNo}>
                  <td className="sheet__no num">
                    {i + 1}
                    <span className="sheet__pocket">{t("game.pocket", { n: row.pocketNo })}</span>
                  </td>
                  <td className="sheet__question">
                    <TypeChip type={row.question.type} />
                    <span className="sheet__text">{row.question.text}</span>
                  </td>
                  <td className="sheet__answer">{row.question.answer}</td>
                  {game.teams.map((team) => {
                    const mark = row.marks[team.id];
                    const Icon = mark.verdict ? ICON[mark.verdict] : Minus;
                    return (
                      <td key={team.id} className="sheet__mark">
                        <button
                          type="button"
                          className={`mark mark--${mark.verdict ?? "none"}`}
                          aria-label={t("breakdown.edit", { team: team.name, n: row.pocketNo, mark: markLabel(mark.verdict) })}
                          title={mark.handInMs !== null ? t("breakdown.handIn", { time: formatElapsed(mark.handInMs) }) : undefined}
                          onClick={() => setTarget({ pocketNo: row.pocketNo, team, verdict: mark.verdict })}
                        >
                          <Icon aria-hidden="true" className="mark__icon" />
                          {mark.points > 0 && <span className="mark__points num">+{mark.points}</span>}
                        </button>
                        {mark.handInMs !== null && <span className="mark__time num">{formatElapsed(mark.handInMs)}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colSpan={3} className="sheet__total-label">{t("breakdown.total")}</th>
                {game.teams.map((team) => (
                  <td key={team.id} className="sheet__total num">{totals[team.id].score}</td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </main>

      <VerdictDialog target={target} onPick={setVerdict} onClear={clearVerdict} onCancel={() => setTarget(null)} />
    </div>
  );
}
