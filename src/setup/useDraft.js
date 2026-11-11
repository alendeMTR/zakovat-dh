import { useCallback, useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { loadDraft, saveDraft } from "./draft.js";

/** The draft game, read once from the browser and saved after every change. */
export function useDraft() {
  const { lang } = useI18n();
  const [draft, setDraft] = useState(() => loadDraft(lang));

  useEffect(() => {
    saveDraft(draft);
  }, [draft]);

  const update = useCallback((change) => setDraft((current) => change(current)), []);
  return [draft, update];
}
