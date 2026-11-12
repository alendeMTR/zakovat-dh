import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import WizardSteps from "../components/WizardSteps.jsx";
import { LIMITS } from "../game/constants.js";
import { GameError, createGame } from "../game/game.js";
import { normalizeUz } from "../game/paste.js";
import { loadGame, saveGame } from "../game/storage.js";
import { LANGUAGES } from "../i18n/translate.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { effectiveTeamNames, newQuestionId } from "../setup/draft.js";
import { useDraft } from "../setup/useDraft.js";
import AddQuestions from "./questions/AddQuestions.jsx";
import QuestionList from "./questions/QuestionList.jsx";
import WizardSummary from "./WizardSummary.jsx";
import "./wizard.css";
import "./questions/questions.css";

// Which setting a GameError points the teacher to.
const START_ERROR = {
  teamCount: "questions.startError.teams",
  teamName: "questions.startError.teams",
  teamNameDuplicate: "questions.startError.teams",
  timeSec: "questions.startError.settings",
  extraSec: "questions.startError.settings",
  warnSec: "questions.startError.settings",
  points: "questions.startError.settings",
  questionCount: "questions.startError.questions",
  questionType: "questions.startError.questions",
  questionEmpty: "questions.startError.questions",
};

/** The first words of a question, for the delete confirmation. */
const excerpt = (text, max = 90) => (text.length > max ? `${text.slice(0, max).trimEnd()}…` : text);

export default function QuestionsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [draft, update] = useDraft();
  const [confirm, setConfirm] = useState(null); // 'clear' | 'replace' | null
  const [startError, setStartError] = useState(null);
  const [deleting, setDeleting] = useState(null); // the question waiting for its delete confirmation

  const clean = (text) => (draft.lang === "uz" ? normalizeUz(text) : text).trim();

  const addQuestions = (list) => {
    const room = LIMITS.questions.max - draft.questions.length;
    if (list.length > room) return { code: "overLimit", room };
    const added = list.map((q) => ({ id: newQuestionId(), type: q.type, text: clean(q.text), answer: clean(q.answer) }));
    update((d) => ({ ...d, questions: [...d.questions, ...added] }));
    setStartError(null);
    return null;
  };

  const editQuestion = (id, changed) =>
    update((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id === id ? { ...q, type: changed.type, text: clean(changed.text), answer: clean(changed.answer) } : q,
      ),
    }));

  const deleteQuestion = (id) => update((d) => ({ ...d, questions: d.questions.filter((q) => q.id !== id) }));

  const start = (replace = false) => {
    const existing = loadGame();
    if (!replace && existing && existing.endedAt === null) {
      setConfirm("replace");
      return;
    }
    setConfirm(null);
    let game;
    try {
      game = createGame({
        teamNames: effectiveTeamNames(draft, (n) => t("setup.teamDefault", { n })),
        questions: draft.questions,
        lang: draft.lang,
        settings: draft.settings,
        now: Date.now(),
      });
    } catch (error) {
      if (!(error instanceof GameError)) throw error;
      setStartError(START_ERROR[error.code] ?? "questions.startError.questions");
      return;
    }
    if (!saveGame(game)) {
      setStartError("questions.startError.storage");
      return;
    }
    navigate("/game");
  };

  return (
    <div className="page backdrop backdrop--grid">
      <AppHeader />
      <main className="wizard wizard--split">
        <div className="wizard__head">
          <WizardSteps current="questions" />
          <h1 className="wizard__title">{t("questions.title")}</h1>
        </div>
        <div className="wizard__main">

          <section className="panel" aria-labelledby="set-lang-title">
            <fieldset className="field">
              <legend id="set-lang-title" className="panel__title">{t("questions.lang")}</legend>
              <div className="segmented">
                {LANGUAGES.map((code) => (
                  <label key={code} className="segmented__option">
                    <input
                      type="radio"
                      name="set-lang"
                      value={code}
                      checked={draft.lang === code}
                      onChange={() => update((d) => ({ ...d, lang: code }))}
                    />
                    <span className="segmented__face">{t(`lang.${code}`)}</span>
                  </label>
                ))}
              </div>
              <p className="field__hint">{t("questions.langHint")}</p>
            </fieldset>
          </section>

          <AddQuestions lang={draft.lang} onAdd={addQuestions} />

          <QuestionList
            questions={draft.questions}
            onEdit={editQuestion}
            onDelete={(id) => setDeleting(draft.questions.find((q) => q.id === id) ?? null)}
            onClear={() => setConfirm("clear")}
          />

          <div className="wizard__footer wizard__footer--split">
            <Link to="/new" className="btn btn--secondary">
              <ArrowLeft size={18} aria-hidden="true" />
              {t("steps.setup")}
            </Link>
            <div className="start">
              {startError && (
                <p className="field__error" role="alert">
                  {startError.endsWith(".teams") || startError.endsWith(".settings") ? (
                    <Link to="/new">{t(startError)}</Link>
                  ) : (
                    t(startError)
                  )}
                </p>
              )}
              <button
                type="button"
                className="btn btn--primary btn--large"
                disabled={draft.questions.length === 0}
                onClick={() => start(false)}
              >
                <Play size={20} aria-hidden="true" />
                {t("questions.start")}
              </button>
            </div>
          </div>
        </div>
        <WizardSummary draft={draft} />
      </main>

      <ConfirmDialog
        open={confirm === "clear"}
        title={t("questions.clearTitle")}
        text={t("questions.clearText", { n: draft.questions.length })}
        confirmLabel={t("questions.clear")}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          update((d) => ({ ...d, questions: [] }));
          setConfirm(null);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={t("questions.deleteTitle")}
        text={deleting ? t("questions.deleteText", { text: excerpt(deleting.text) }) : ""}
        confirmLabel={t("common.delete")}
        danger
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          deleteQuestion(deleting.id);
          setDeleting(null);
        }}
      />
      <ConfirmDialog
        open={confirm === "replace"}
        title={t("questions.replaceTitle")}
        text={t("questions.replaceText")}
        confirmLabel={t("questions.replaceConfirm")}
        danger
        onCancel={() => setConfirm(null)}
        onConfirm={() => start(true)}
      />
    </div>
  );
}
