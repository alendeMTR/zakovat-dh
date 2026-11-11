import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./wizard-steps.css";

const STEPS = [
  { key: "setup", to: "/new" },
  { key: "questions", to: "/new/questions" },
];

/** "1 Sozlamalar · 2 Savollar": where the teacher is, and a way back to the other step. */
export default function WizardSteps({ current }) {
  const { t } = useI18n();
  return (
    <nav aria-label={t("steps.label")}>
      <ol className="steps">
        {STEPS.map((step, i) => {
          const active = step.key === current;
          return (
            <li key={step.key} className={`steps__item${active ? " steps__item--active" : ""}`}>
              <Link to={step.to} className="steps__link" aria-current={active ? "step" : undefined}>
                <span className="steps__no num">{i + 1}</span>
                {t(`steps.${step.key}`)}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
