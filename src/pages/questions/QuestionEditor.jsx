import { useId, useState } from "react";
import { TypePicker } from "../../components/QuestionType.jsx";
import { useI18n } from "../../i18n/I18nProvider.jsx";

/**
 * One question's form: type, text, answer. Used to add a question and to edit one in the list.
 * For a Zakovat sandiqchasi the answer field is labelled as the object in the box (D11).
 */
export default function QuestionEditor({ initial, submitLabel, onSubmit, onCancel, keepTypeAfterSubmit = false }) {
  const { t } = useI18n();
  const id = useId();
  const [type, setType] = useState(initial?.type ?? "oddiy");
  const [text, setText] = useState(initial?.text ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [missing, setMissing] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim() || !answer.trim()) {
      setMissing(true);
      return;
    }
    setMissing(false);
    onSubmit({ type, text: text.trim(), answer: answer.trim() });
    if (keepTypeAfterSubmit) {
      setText("");
      setAnswer("");
    }
  };

  return (
    <form className="q-editor" onSubmit={submit} noValidate>
      <TypePicker name={`${id}-type`} value={type} onChange={setType} legend={t("questions.manual.type")} />
      <div className="field">
        <label htmlFor={`${id}-text`} className="field__label">{t("questions.manual.text")}</label>
        <textarea
          id={`${id}-text`}
          className="textarea"
          rows={3}
          value={text}
          aria-invalid={missing && !text.trim() ? "true" : undefined}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-answer`} className="field__label">
          {t(type === "sandiqcha" ? "questions.manual.object" : "questions.manual.answer")}
        </label>
        <input
          id={`${id}-answer`}
          className="input"
          value={answer}
          aria-invalid={missing && !answer.trim() ? "true" : undefined}
          onChange={(event) => setAnswer(event.target.value)}
        />
      </div>
      {missing && <p className="field__error" role="alert">{t("questions.manual.missing")}</p>}
      <div className="q-editor__actions">
        {onCancel && (
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            {t("common.cancel")}
          </button>
        )}
        <button type="submit" className="btn btn--primary">{submitLabel}</button>
      </div>
    </form>
  );
}
