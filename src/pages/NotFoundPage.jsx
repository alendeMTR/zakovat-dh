import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./home.css";

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="page backdrop backdrop--grid">
      <AppHeader />
      <main className="home">
        <h1 className="home__title">{t("notFound.title")}</h1>
        <Link to="/" className="btn btn--secondary">
          {t("notFound.back")}
        </Link>
      </main>
    </div>
  );
}
