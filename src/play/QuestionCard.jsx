import { useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./question-card.css";

// The question card over the wheel (brief). M3: type, number, question, back to the wheel.
// M4 adds the timer, the answer, team rows and verdicts.

/** A first size rule by length; M4 replaces it with a measured fit (D25). */
function questionSize(text) {
  if (text.length <= 80) return "var(--st-question-max)";
  if (text.length <= 180) return "calc(var(--u) * 5)";
  return "var(--st-question-min)";
}

export default function QuestionCard({ pocketNo, question, onClose }) {
  const { t } = useI18n();
  const ref = useRef(null);
  const Icon = TYPE_ICONS[question.type];

  useEffect(() => {
    ref.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="card-layer">
      <section
        ref={ref}
        tabIndex={-1}
        className={`qcard qcard--${question.type}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qcard-label"
      >
        <header className="qcard__band">
          <span id="qcard-label" className="qcard__type">
            <Icon aria-hidden="true" className="qcard__type-icon" />
            {t(`type.${question.type}`)}
          </span>
          <span className="qcard__no num">{t("game.pocket", { n: pocketNo })}</span>
        </header>
        <p className="qcard__text" style={{ fontSize: questionSize(question.text) }}>
          {question.text}
        </p>
        <footer className="qcard__footer">
          <button type="button" className="stage-btn" onClick={onClose}>
            <ArrowLeft aria-hidden="true" className="stage-btn__icon" />
            {t("card.back")}
          </button>
        </footer>
      </section>
    </div>
  );
}
