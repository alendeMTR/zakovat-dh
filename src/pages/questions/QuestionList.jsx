import { useState } from "react";
import { Pencil, Trash2, TriangleAlert } from "lucide-react";
import { TypeChip } from "../../components/QuestionType.jsx";
import { QUESTION_TYPES } from "../../game/constants.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { isLongQuestion } from "../../setup/draft.js";
import QuestionEditor from "./QuestionEditor.jsx";

/** The questions of this game: counts per type, the boxes to prepare, and each question with edit and delete. */
export default function QuestionList({ questions, onEdit, onDelete, onClear }) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(null);
  const count = (type) => questions.filter((q) => q.type === type).length;
  const boxes = questions.filter((q) => q.type === "sandiqcha").map((q) => q.answer);

  return (
    <section className="panel" aria-labelledby="list-title">
      <div className="list-head">
        <h2 id="list-title" className="panel__title panel__title--inline">
          {t("questions.list")} <span className="list-head__count num">· {t("questions.count", { n: questions.length })}</span>
        </h2>
        {questions.length > 0 && (
          <button type="button" className="btn btn--text" onClick={onClear}>
            {t("questions.clear")}
          </button>
        )}
      </div>

      {questions.length === 0 ? (
        <p className="field__hint list-empty">{t("questions.empty")}</p>
      ) : (
        <>
          <div className="list-summary">
            {QUESTION_TYPES.map((type) => (
              <TypeChip key={type} type={type} count={count(type)} />
            ))}
          </div>
          {boxes.length > 0 && (
            <p className="list-boxes">
              <span className="list-boxes__label">{t("questions.boxes")}:</span> {boxes.join(", ")}
            </p>
          )}
          {questions.length >= 30 && <p className="notice notice--ok">{t("questions.limit")}</p>}

          <ol className="q-list">
            {questions.map((q, i) => (
              <li key={q.id} className="q-list__item">
                <span className="q-list__no num" aria-hidden="true">{i + 1}</span>
                {editing === q.id ? (
                  <div className="q-list__body">
                    <QuestionEditor
                      initial={q}
                      submitLabel={t("common.save")}
                      onCancel={() => setEditing(null)}
                      onSubmit={(changed) => {
                        onEdit(q.id, changed);
                        setEditing(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <div className="q-list__body">
                      <TypeChip type={q.type} />
                      <p className="q-list__text">{q.text}</p>
                      {isLongQuestion(q.text) && (
                        <p className="q-list__flag">
                          <TriangleAlert aria-hidden="true" className="q-list__flag-icon" />
                          {t("questions.long", { n: q.text.trim().length })}
                        </p>
                      )}
                      <p className="q-list__answer">
                        <span className="q-list__answer-label">{t("questions.answer")}:</span> {q.answer}
                      </p>
                    </div>
                    <div className="q-list__actions">
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`${t("common.edit")}: ${i + 1}`}
                        title={t("common.edit")}
                        onClick={() => setEditing(q.id)}
                      >
                        <Pencil size={18} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label={`${t("common.delete")}: ${i + 1}`}
                        title={t("common.delete")}
                        onClick={() => onDelete(q.id)}
                      >
                        <Trash2 size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
