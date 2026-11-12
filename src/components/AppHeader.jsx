import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";
import LanguageSwitch from "./LanguageSwitch.jsx";
import "./app-header.css";

/**
 * The bar at the top of every UI page: the school's mark and name, the product, optional links to
 * sections of the page, and the language switch.
 * The mark is the owner's file, `public/pdp-mark.png`, used as given (D80; never redrawn). Its alt is
 * empty because the school's name follows it as text.
 *
 * links: [{ href, label }] — in-page anchors (the main page uses them)
 */
export default function AppHeader({ links = [] }) {
  const { t } = useI18n();
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand">
          <img className="app-header__mark" src="/pdp-mark.png" alt="" width="40" height="40" />
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
