import { useId, useRef, useState } from "react";
import { ClipboardPaste, Keyboard, ListPlus } from "lucide-react";
import { parsePaste } from "../../game/paste.js";
import { SAMPLE_SETS } from "../../game/sampleSets.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import QuestionEditor from "./QuestionEditor.jsx";

const TABS = [
  { key: "paste", icon: ClipboardPaste },
  { key: "manual", icon: Keyboard },
  { key: "sample", icon: ListPlus },
];

/**
 * The three ways to add questions (D18, D19). `onAdd(list)` returns null on success or
 * { code: 'overLimit', room } when the list has no room for them.
 * Saved sets and AI generation join these tabs in M6 and M7.
 */
export default function AddQuestions({ lang, onAdd }) {
  const { t } = useI18n();
  const id = useId();
  const [tab, setTab] = useState("paste");
  const [pasteText, setPasteText] = useState("");
  const [notice, setNotice] = useState(null);
  const tabRefs = useRef({});

  const report = (result, count) => {
    if (result?.code === "overLimit") setNotice({ kind: "error", text: t("questions.overLimit", { n: result.room }) });
    else setNotice({ kind: "ok", text: t("questions.paste.added", { n: count }) });
    return !result;
  };

  const submitPaste = () => {
    if (!pasteText.trim()) {
      setNotice({ kind: "error", text: t("questions.paste.empty") });
      return;
    }
    const { questions, errors } = parsePaste(pasteText, { lang });
    if (errors.length) {
      setNotice({
        kind: "error",
        text: t("questions.paste.failed"),
        items: errors.map((e) => t(`paste.error.${e.code}`, { line: e.line })),
      });
      return;
    }
    if (report(onAdd(questions), questions.length)) setPasteText("");
  };

  const onTabKey = (event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = (index + (event.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next].key);
    setNotice(null);
    tabRefs.current[TABS[next].key]?.focus();
  };

  return (
    <section className="panel" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="panel__title">{t("questions.add")}</h2>
      <div role="tablist" className="tabs" aria-labelledby={`${id}-title`}>
        {TABS.map(({ key, icon: Icon }, index) => (
          <button
            key={key}
            ref={(el) => (tabRefs.current[key] = el)}
            role="tab"
            type="button"
            id={`${id}-tab-${key}`}
            aria-selected={tab === key}
            aria-controls={`${id}-panel`}
            tabIndex={tab === key ? 0 : -1}
            className="tabs__tab"
            onClick={() => {
              setTab(key);
              setNotice(null);
            }}
            onKeyDown={(event) => onTabKey(event, index)}
          >
            <Icon size={18} aria-hidden="true" />
            {t(`questions.source.${key}`)}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${tab}`} className="tabs__panel">
        {tab === "paste" && (
          <div className="paste">
            <div className="field">
              <label htmlFor={`${id}-paste`} className="field__label">{t("questions.paste.label")}</label>
              <textarea
                id={`${id}-paste`}
                className="textarea paste__input"
                rows={10}
                value={pasteText}
                aria-describedby={`${id}-paste-help`}
                onChange={(event) => setPasteText(event.target.value)}
              />
              <p id={`${id}-paste-help`} className="field__hint">{t("questions.paste.help")}</p>
            </div>
            <figure className="paste__example">
              <figcaption className="field__hint">{t("questions.paste.exampleTitle")}</figcaption>
              <pre>{t("questions.paste.example")}</pre>
            </figure>
            <div className="paste__actions">
              <button type="button" className="btn btn--primary" onClick={submitPaste}>
                {t("questions.paste.submit")}
              </button>
            </div>
          </div>
        )}

        {tab === "manual" && (
          <QuestionEditor
            submitLabel={t("questions.manual.submit")}
            keepTypeAfterSubmit
            onSubmit={(question) => report(onAdd([question]), 1)}
          />
        )}

        {tab === "sample" && (
          <div className="panel__stack">
            <p>{t("questions.sample.help")}</p>
            <div>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  const list = SAMPLE_SETS[lang].questions;
                  report(onAdd(list), list.length);
                }}
              >
                {t("questions.sample.submit")}
              </button>
            </div>
          </div>
        )}

        <div aria-live="polite">
          {notice && (
            <div className={`notice notice--${notice.kind}`}>
              {notice.text}
              {notice.items && (
                <ul>
                  {notice.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
