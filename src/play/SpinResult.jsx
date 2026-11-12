import { useEffect, useId, useRef } from "react";
import { ArrowRight, X } from "lucide-react";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./spin-result.css";

/**
 * What the wheel picked (D73, owner; after the "The result is…" box of popular wheel apps).
 * The teacher opens the question — it leaves the wheel when its card closes — or keeps it on the wheel
 * for later, for example when the director has not arrived yet (D10). Escape and × keep it.
 * Built on <dialog>, so the wheel's Space and the card's keys stay out while it is open (D62).
 *
 * result: { no, type } | null
 */
export default function SpinResult({ result, onOpen, onKeep }) {
  const { t } = useI18n();
  const titleId = useId();
  const ref = useRef(null);
  const openRef = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (result && !dialog.open) {
      dialog.showModal();
      openRef.current?.focus(); // Enter or Space opens the question: the usual path is one key away
    } else if (!result && dialog.open) {
      dialog.close();
    }
  }, [result]);

  const type = result?.type ?? "oddiy";
  const Icon = TYPE_ICONS[type];

  return (
    <dialog
      ref={ref}
      className={`spin-result spin-result--${type}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onKeep();
      }}
    >
      {result && (
        <>
          <header className="spin-result__band">
            <span id={titleId}>{t("result.title")}</span>
            <button type="button" className="spin-result__close" aria-label={t("result.keep")} title={t("result.keep")} onClick={onKeep}>
              <X aria-hidden="true" />
            </button>
          </header>
          <div className="spin-result__body">
            <p className="spin-result__no num">{t("game.pocket", { n: result.no })}</p>
            <p className="spin-result__type">
              <Icon aria-hidden="true" className="spin-result__type-icon" />
              {t(`type.${type}`)}
            </p>
            <p className="spin-result__note">{t(`result.note.${type}`)}</p>
          </div>
          <footer className="spin-result__foot">
            <p className="spin-result__hint">{t("result.hint")}</p>
            <div className="spin-result__actions">
              <button type="button" className="stage-btn" onClick={onKeep}>
                {t("result.keep")}
              </button>
              <button ref={openRef} type="button" className="stage-btn stage-btn--primary" onClick={onOpen}>
                {t("result.open")}
                <ArrowRight aria-hidden="true" className="stage-btn__icon" />
              </button>
            </div>
          </footer>
        </>
      )}
    </dialog>
  );
}
