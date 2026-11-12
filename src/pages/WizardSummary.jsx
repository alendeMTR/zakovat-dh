import { Clock, Hourglass, ListChecks, Users } from "lucide-react";
import { TypeChip } from "../components/QuestionType.jsx";
import { QUESTION_TYPES } from "../game/constants.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { effectiveTeamNames, estimateMinutes } from "../setup/draft.js";

/**
 * The game being prepared, at a glance, beside the setup and questions steps (D77): teams, time,
 * questions by type, points, and roughly how long the game will take — so the
 * teacher sees whether it fits the lesson before starting. Read-only; it follows the draft live.
 */
export default function WizardSummary({ draft }) {
  const { t } = useI18n();
  const { settings, questions } = draft;
  const names = effectiveTeamNames(draft, (n) => t("setup.teamDefault", { n }));
  const minutes = estimateMinutes(questions.length, settings.timeSec);
  const count = (type) => questions.filter((q) => q.type === type).length;

  return (
    <aside className="summary" aria-labelledby="summary-title">
      <h2 id="summary-title" className="summary__title">{t("summary.title")}</h2>

      <div className="summary__duration">
        <Hourglass aria-hidden="true" className="summary__duration-icon" />
        <div>
          <p className="summary__label">{t("summary.duration")}</p>
          <p className="summary__big num">{minutes === null ? "—" : t("summary.durationValue", { n: minutes })}</p>
          <p className="summary__hint">{minutes === null ? t("summary.durationNone") : t("summary.durationHint")}</p>
        </div>
      </div>

      <dl className="summary__list">
        <div className="summary__row">
          <dt>
            <Users aria-hidden="true" className="summary__icon" />
            {t("summary.teams")}
          </dt>
          <dd>
            <span className="summary__value num">{names.length}</span>
            <span className="summary__names">{names.join(", ")}</span>
          </dd>
        </div>
        <div className="summary__row">
          <dt>
            <Clock aria-hidden="true" className="summary__icon" />
            {t("summary.time")}
          </dt>
          <dd className="num">
            {Number.isFinite(settings.timeSec)
              ? t("summary.timeValue", { time: settings.timeSec, extra: settings.extraSec ?? 0 })
              : "—"}
          </dd>
        </div>
        <div className="summary__row">
          <dt>
            <ListChecks aria-hidden="true" className="summary__icon" />
            {t("summary.questions")}
          </dt>
          <dd>
            {questions.length === 0 ? (
              <span className="summary__muted">{t("summary.questionsNone")}</span>
            ) : (
              <>
                <span className="summary__value num">{questions.length}</span>
                <span className="summary__chips">
                  {QUESTION_TYPES.filter((type) => count(type) > 0).map((type) => (
                    <TypeChip key={type} type={type} count={count(type)} />
                  ))}
                </span>
              </>
            )}
          </dd>
        </div>
      </dl>

      <div>
        <p className="summary__label">{t("summary.points")}</p>
        <ul className="summary__points">
          {QUESTION_TYPES.map((type) => (
            <li key={type}>
              <TypeChip type={type} />
              <span className="num">
                {settings.points[type]?.correct ?? "—"} + {settings.points[type]?.extra ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
