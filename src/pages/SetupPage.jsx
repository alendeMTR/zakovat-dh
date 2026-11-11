import { useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import NumberField from "../components/NumberField.jsx";
import { TypeChip } from "../components/QuestionType.jsx";
import WizardSteps from "../components/WizardSteps.jsx";
import { LIMITS, QUESTION_TYPES } from "../game/constants.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { POINTS_MAX, hasErrors, validateSetup } from "../setup/draft.js";
import { useDraft } from "../setup/useDraft.js";
import "./wizard.css";

export default function SetupPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [draft, update] = useDraft();
  const defaultName = (n) => t("setup.teamDefault", { n });
  const errors = validateSetup(draft, defaultName);
  const { settings } = draft;

  const setSetting = (key, value) => update((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  const setPoints = (type, field, value) =>
    update((d) => ({
      ...d,
      settings: {
        ...d.settings,
        points: { ...d.settings.points, [type]: { ...d.settings.points[type], [field]: value } },
      },
    }));
  const setTeamCount = (count) =>
    update((d) => ({ ...d, teamCount: Math.min(LIMITS.teams.max, Math.max(LIMITS.teams.min, count)) }));
  const setTeamName = (index, name) =>
    update((d) => ({ ...d, teamNames: d.teamNames.map((n, i) => (i === index ? name : n)) }));

  const maxExtra = Number.isInteger(settings.timeSec) ? settings.timeSec : LIMITS.timeSec.max;
  const unit = <span>{t("common.seconds")}</span>;

  return (
    <div className="page">
      <AppHeader />
      <main className="wizard">
        <WizardSteps current="setup" />
        <h1 className="wizard__title">{t("setup.title")}</h1>

        <section className="panel" aria-labelledby="teams-title">
          <h2 id="teams-title" className="panel__title">{t("setup.teams")}</h2>
          <div className="field">
            <span className="field__label" id="team-count-label">{t("setup.teamCount")}</span>
            <div className="stepper" role="group" aria-labelledby="team-count-label">
              <button
                type="button"
                className="icon-btn stepper__btn"
                aria-label={t("setup.fewerTeams")}
                disabled={draft.teamCount <= LIMITS.teams.min}
                onClick={() => setTeamCount(draft.teamCount - 1)}
              >
                <Minus size={20} aria-hidden="true" />
              </button>
              <output className="stepper__value num" aria-live="polite">{draft.teamCount}</output>
              <button
                type="button"
                className="icon-btn stepper__btn"
                aria-label={t("setup.moreTeams")}
                disabled={draft.teamCount >= LIMITS.teams.max}
                onClick={() => setTeamCount(draft.teamCount + 1)}
              >
                <Plus size={20} aria-hidden="true" />
              </button>
              <span className="field__hint">{t("setup.teamCountHint")}</span>
            </div>
          </div>

          <ol className="team-names">
            {draft.teamNames.slice(0, draft.teamCount).map((name, i) => {
              const code = errors.team?.[i];
              return (
                <li key={i} className="team-names__row">
                  <span className="team-names__no num" aria-hidden="true">{i + 1}</span>
                  <div className="team-names__field">
                    <input
                      className="input"
                      value={name}
                      maxLength={LIMITS.teamName.max + 10}
                      placeholder={defaultName(i + 1)}
                      aria-label={t("setup.teamName", { n: i + 1 })}
                      aria-invalid={code ? "true" : undefined}
                      aria-describedby={code ? `team-error-${i}` : undefined}
                      onChange={(event) => setTeamName(i, event.target.value)}
                    />
                    {code && (
                      <p id={`team-error-${i}`} className="field__error">{t(`error.${code}`)}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="field__hint">{t("setup.teamNamesHint")}</p>
        </section>

        <section className="panel" aria-labelledby="time-title">
          <h2 id="time-title" className="panel__title">{t("setup.time")}</h2>
          <div className="panel__grid">
            <NumberField
              label={t("setup.timePerQuestion")}
              value={settings.timeSec}
              min={LIMITS.timeSec.min}
              max={LIMITS.timeSec.max}
              step={5}
              unit={unit}
              error={errors.timeSec && t(`error.${errors.timeSec}`)}
              onChange={(value) => setSetting("timeSec", value)}
            />
            <NumberField
              label={t("setup.extraWindow")}
              value={settings.extraSec}
              min={0}
              max={maxExtra}
              unit={unit}
              hint={t("setup.extraHint")}
              error={errors.extraSec && t(`error.${errors.extraSec}`, { max: maxExtra })}
              onChange={(value) => setSetting("extraSec", value)}
            />
          </div>
        </section>

        <section className="panel" aria-labelledby="screen-title">
          <h2 id="screen-title" className="panel__title">{t("setup.screen")}</h2>
          <div className="panel__stack">
            <label className="check">
              <input
                type="checkbox"
                checked={settings.showScores}
                onChange={(event) => setSetting("showScores", event.target.checked)}
              />
              <span className="check__text">
                <span>{t("setup.showScores")}</span>
                <span className="field__hint">{t("setup.showScoresHint")}</span>
              </span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={settings.sound}
                onChange={(event) => setSetting("sound", event.target.checked)}
              />
              <span className="check__text">{t("setup.sound")}</span>
            </label>
          </div>
        </section>

        <details className="panel panel--details">
          <summary className="panel__summary">
            <span className="panel__title panel__title--inline">{t("setup.points")}</span>
            <span className="field__hint">{t("setup.pointsHint")}</span>
          </summary>
          <table className="points">
            <thead>
              <tr>
                <th scope="col"><span className="visually-hidden">{t("questions.manual.type")}</span></th>
                <th scope="col">{t("setup.pointsCorrect")}</th>
                <th scope="col">{t("setup.pointsExtra")}</th>
              </tr>
            </thead>
            <tbody>
              {QUESTION_TYPES.map((type) => (
                <tr key={type}>
                  <th scope="row"><TypeChip type={type} /></th>
                  {["correct", "extra"].map((field) => (
                    <td key={field}>
                      <NumberField
                        value={settings.points[type][field]}
                        min={0}
                        max={POINTS_MAX}
                        ariaLabel={`${t(`type.${type}`)}: ${t(field === "correct" ? "setup.pointsCorrect" : "setup.pointsExtra")}`}
                        error={errors.points?.[`${type}.${field}`] && t("error.pointsRange")}
                        onChange={(value) => setPoints(type, field, value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </details>

        <div className="wizard__footer">
          {hasErrors(errors) && <p className="field__error">{t("error.fixAbove")}</p>}
          <button
            type="button"
            className="btn btn--primary btn--large"
            disabled={hasErrors(errors)}
            onClick={() => navigate("/new/questions")}
          >
            {t("setup.toQuestions")}
            <ArrowRight size={20} aria-hidden="true" />
          </button>
        </div>
      </main>
    </div>
  );
}
