import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";
import LanguageSwitch from "./LanguageSwitch.jsx";
import "./app-header.css";

/**
 * The bar at the top of every UI page: the school and the product, optional links to sections of the
 * page, and the language switch.
 * The PDP School logo goes in the brand slot once the official file is in public/ (fixlist F1, D26).
 * Until then the slot holds the school's name as plain text, not a drawn logo.
 *
 * links: [{ href, label }] — in-page anchors (the main page uses them)
 */
export default function AppHeader({ links = [] }) {
  const { t } = useI18n();
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand">
          <span className="app-header__school">{t("app.school")}</span>
          <span className="app-header__sep" aria-hidden="true" />
          <span className="app-header__product">{t("app.name")}</span>
        </Link>
        {links.length > 0 && (
          <nav className="app-header__nav" aria-label={t("home.nav")}>
            {links.map((link) => (
              <a key={link.href} href={link.href} className="app-header__link">
                {link.label}
              </a>
            ))}
          </nav>
        )}
        <LanguageSwitch />
      </div>
    </header>
  );
}
