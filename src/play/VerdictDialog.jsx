import { useEffect, useRef } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { VERDICT_ICONS } from "./verdictIcons.js";
import "../components/confirm-dialog.css";

/**
 * Correcting one mark from the breakdown (D15): the three verdicts, "no mark", and Cancel.
 * Built on <dialog> like ConfirmDialog; focus starts on the current mark.
 */
export default function VerdictDialog({ target, onPick, onClear, onCancel }) {
  const { t } = useI18n();
  const ref = useRef(null);
  const open = target !== null;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      const current = dialog.querySelector("[aria-pressed='true']") ?? dialog.querySelector("button");
      current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="confirm"
      aria-labelledby="verdict-title"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onCancel();
      }}
    >
      {open && (
        <>
          <h2 id="verdict-title" className="confirm__title">
            {t("breakdown.dialogTitle", { team: target.team.name, n: target.pocketNo })}
          </h2>
          <div className="verdict-pick">
            {VERDICT_ICONS.map(({ key, Icon }) => (
              <button
                key={key}
                type="button"
                className={`verdict-pick__btn verdict-pick__btn--${key}`}
                aria-pressed={target.verdict === key}
                onClick={() => onPick(key)}
              >
                <Icon aria-hidden="true" className="verdict-pick__icon" />
                {t(`card.verdict.${key}`)}
              </button>
            ))}
          </div>
          <div className="confirm__actions">
            <button type="button" className="btn btn--text" onClick={onClear} disabled={target.verdict === null}>
              {t("breakdown.clear")}
            </button>
            <button type="button" className="btn btn--secondary" onClick={onCancel}>
              {t("common.cancel")}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
