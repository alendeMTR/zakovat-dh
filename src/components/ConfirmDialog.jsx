import { useEffect, useRef } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./confirm-dialog.css";

/**
 * A modal question with two answers, built on <dialog> (focus trap, Escape and the backdrop
 * come from the browser). The cancel button takes focus first, so Enter never confirms by accident.
 */
export default function ConfirmDialog({ open, title, text, confirmLabel, onConfirm, onCancel, danger = false }) {
  const { t } = useI18n();
  const ref = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="confirm"
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onCancel();
      }}
    >
      <h2 id="confirm-title" className="confirm__title">{title}</h2>
      {text && <p className="confirm__text">{text}</p>}
      <div className="confirm__actions">
        <button ref={cancelRef} type="button" className="btn btn--secondary" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button type="button" className={`btn ${danger ? "btn--danger" : "btn--primary"}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
