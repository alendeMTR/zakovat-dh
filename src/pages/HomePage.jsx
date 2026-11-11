import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { loadGame } from "../game/storage.js";
import { formatWhen } from "../i18n/format.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import "./home.css";

// One primary action (brief, axeno.uz). The "Continue" block appears only when a game is unfinished.
// Recent games for signed-in teachers come in M6 (plan §4).
export default function HomePage() {
  const { t } = useI18n();
  const [game] = useState(() => loadGame());
  const unfinished = game && game.endedAt === null ? game : null;

  return (
    <div className="page">
      <AppHeader />
      <main className="home">
        <div className="home__intro">
          <h1 className="home__title">{t("home.title")}</h1>
          <p className="home__tagline">{t("home.tagline")}</p>
        </div>
        <Link to="/new" className="btn btn--primary btn--large">
          <Plus size={22} aria-hidden="true" />
          {t("home.newGame")}
        </Link>

        {unfinished && (
          <section className="home-continue" aria-labelledby="continue-title">
            <div>
              <h2 id="continue-title" className="home-continue__title">{t("home.continue.title")}</h2>
              <p className="home-continue__meta">
                {t("home.continue.meta", {
                  teams: unfinished.teams.length,
                  played: unfinished.played.length,
                  total: unfinished.pockets.length,
                })}
              </p>
              <p className="home-continue__meta">
                {t("home.continue.started", { when: formatWhen(unfinished.createdAt) })}
              </p>
            </div>
            <Link to="/game" className="btn btn--secondary">
              {t("home.continue.button")}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
