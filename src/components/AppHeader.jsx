import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";
import LanguageSwitch from "./LanguageSwitch.jsx";
import "./app-header.css";

// The PDP School logo goes in the brand slot once the official file is in public/ (fixlist F1, D26).
// Until then the slot holds the school's name as plain text, not a drawn logo.
export default function AppHeader() {
  const { t } = useI18n();
  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand">
        {t("app.school")}
      </Link>
      <LanguageSwitch />
    </header>
  );
}
