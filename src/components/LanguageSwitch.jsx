import { useI18n } from "../i18n/I18nProvider.jsx";
import { LANGUAGES } from "../i18n/translate.js";
import "./language-switch.css";

export default function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label={t("lang.label")}>
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className="lang-switch__option"
          aria-pressed={lang === code}
          title={t(`lang.${code}`)}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
