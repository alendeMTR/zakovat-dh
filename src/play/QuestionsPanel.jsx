import { RotateCcw } from "lucide-react";
import { QUESTION_TYPES } from "../game/constants.js";
import { roundSummary } from "../game/scoring.js";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

/**
 * The left panel of the game screen (D74): how far the game is, what each colour means and how many
 * of each type are left, and the questions played so far, newest first, with how many teams got each
 * right. A played question is reopened from this list (D34): it is no longer on the wheel (D73).
 */
export default function QuestionsPanel({ game, onReopen }) {
  const { t } = useI18n();
  const total = game.pockets.length;
  const played = game.played.length;
  const ofType = (type) => game.pockets.filter((p) => p.question.type === type);
  const present = QUESTION_TYPES.filter((type) => ofType(type).length > 0);
  const history = [...game.played].reverse();

  return (
    <section className="side-panel qpanel" aria-labelledby="qpanel-title">
      <header className="side-panel__head">
        <h2 id="qpanel-title" className="side-panel__title">{t("game.questions")}</h2>
        <p className="side-panel__meta num">{t("game.playedOf", { played, total })}</p>
      </header>
      <div className="progress" aria-hidden="true">
        <span className="progress__fill" style={{ width: `${total ? (played / total) * 100 : 0}%` }} />
      </div>

      <h3 className="side-panel__sub">{t("game.legend")}</h3>
      <ul className="legend__list">
        {present.map((type) => {
          const Icon = TYPE_ICONS[type];
          const all = ofType(type);
          const left = all.filter((p) => !game.played.includes(p.no)).length;
          return (
            <li key={type} className="legend__row">
              <span className={`legend__swatch legend__swatch--${type}`} aria-hidden="true">
                <Icon className="legend__icon" />
              </span>
              <span className="legend__text">
                <span className="legend__name">{t(`type.${type}`)}</span>
                <span className="legend__count num">{t("game.leftOf", { left, total: all.length })}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <h3 className="side-panel__sub">{t("game.history")}</h3>
      {history.length === 0 ? (
        <p className="side-panel__empty">{t("game.historyEmpty")}</p>
      ) : (
        <ol className="history">
          {history.map((no) => {
            const question = game.pockets.find((p) => p.no === no).question;
            const Icon = TYPE_ICONS[question.type];
            const summary = roundSummary(game, no);
            return (
              <li key={no}>
                <button
                  type="button"
                  className="history__item"
                  disabled={!onReopen}
                  aria-label={t("game.reopen", { n: no })}
                  title={t("game.reopenHint")}
                  onClick={() => onReopen?.(no)}
                >
                  <span className={`history__no history__no--${question.type} num`}>
                    <Icon aria-hidden="true" className="history__icon" />
                    {no}
                  </span>
                  <span className="history__text">{question.text}</span>
                  <span className="history__result num">
                    {summary.judged === 0
                      ? t("game.historyUnjudged")
                      : t("game.historyCorrect", { correct: summary.correct, total: summary.total })}
                  </span>
                  <RotateCcw aria-hidden="true" className="history__reopen" />
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
