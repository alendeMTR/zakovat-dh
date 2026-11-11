import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./home.css";

// M0 shell. M2 adds the one-line description, "Continue game" and recent games (docs/plan.md §4).
export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <AppHeader />
      <main className="home">
        <h1 className="home__title">{t("home.title")}</h1>
        <Link to="/new" className="btn btn--primary btn--large">
          <Plus size={22} aria-hidden="true" />
          {t("home.newGame")}
        </Link>
      </main>
    </div>
  );
}
