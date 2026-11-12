import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ListPlus, Plus, RotateCw, Trophy, Users } from "lucide-react";
import AppHeader from "../components/AppHeader.jsx";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { DEFAULT_SETTINGS, QUESTION_TYPES } from "../game/constants.js";
import { ranking } from "../game/scoring.js";
import { loadGame } from "../game/storage.js";
import { formatWhen } from "../i18n/format.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { C, R, pocketAngle, sectorPath } from "../play/wheelGeometry.js";
import "./home.css";

const STEPS = [
  { key: "setup", Icon: Users },
  { key: "questions", Icon: ListPlus },
  { key: "play", Icon: RotateCw },
  { key: "results", Icon: Trophy },
];

/**
 * The background drawing (D76, owner: "some background painting", after Axeno's home): the game's own
 * wheel — rim, twelve numbered pockets, bowl, hub, pointer — drawn faintly in the brand blue.
 */
function WheelArt() {
  const count = 12;
  return (
    <svg className="hero__art" viewBox="0 0 1000 1000" aria-hidden="true" focusable="false">
      <circle cx={C} cy={C} r={R.rimOut} className="hero__art-rim" />
      {Array.from({ length: count }, (_, i) => (
        <g key={i}>
          <path d={sectorPath(i, count)} className={`hero__art-pocket${i % 2 ? " hero__art-pocket--alt" : ""}`} />
          <text x={C} y={C - 375} transform={`rotate(${pocketAngle(i, count)} ${C} ${C})`} className="hero__art-no">
            {i + 1}
          </text>
        </g>
      ))}
      <circle cx={C} cy={C} r={R.bowl} className="hero__art-bowl" />
      <circle cx={C} cy={C} r={R.hub} className="hero__art-hub" />
      <path d={`M ${C - 30} 4 L ${C + 30} 4 L ${C} 66 Z`} className="hero__art-pointer" />
    </svg>
  );
}

/** The unfinished or the last finished game, beside the hero text (D41, D60). */
function GameStatus({ game }) {
  const { t } = useI18n();
  if (!game) return null;
  if (game.endedAt === null) {
    const total = game.pockets.length;
    return (
      <section className="home-status" aria-labelledby="status-title">
        <p className="home-status__label">{t("home.continue.title")}</p>
        <h2 id="status-title" className="home-status__title num">
          {t("home.continue.meta", { teams: game.teams.length, played: game.played.length, total })}
        </h2>
        <div className="home-status__bar" aria-hidden="true">
          <span style={{ width: `${(game.played.length / total) * 100}%` }} />
        </div>
        <p className="home-status__meta">{t("home.continue.started", { when: formatWhen(game.createdAt) })}</p>
        <Link to="/game" className="btn btn--secondary home-status__btn">
          {t("home.continue.button")}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </section>
    );
  }
  const winners = ranking(game)
    .filter((row) => row.place === 1)
    .map((row) => row.team.name)
    .join(", ");
  return (
    <section className="home-status" aria-labelledby="status-title">
      <p className="home-status__label">{t("home.last.title")}</p>
      <h2 id="status-title" className="home-status__title">
        <Trophy aria-hidden="true" className="home-status__icon" />
        {winners}
      </h2>
      <p className="home-status__meta">{t("home.last.ended", { when: formatWhen(game.endedAt) })}</p>
      <Link to="/game/results" className="btn btn--secondary home-status__btn">
        {t("home.last.button")}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </section>
  );
}

/**
 * The main page (D76, owner, after axeno.uz): a header, a left-aligned hero with one primary action over
 * a drawing of the wheel, the game in progress if there is one, and below it what a teacher needs before
 * the first game — how a game runs, the three question types with their points, and the keys.
 */
export default function HomePage() {
  const { t } = useI18n();
  const [game] = useState(() => loadGame());
  const points = DEFAULT_SETTINGS.points;

  return (
    <div className="page home-page">
      <AppHeader
        links={[
          { href: "#how", label: t("home.navHow") },
          { href: "#types", label: t("home.navTypes") },
          { href: "#keys", label: t("home.navKeys") },
        ]}
      />

      <main>
        <section className="hero">
          <WheelArt />
          <div className="home-container hero__inner">
            <div className="hero__text">
              <p className="hero__eyebrow">{t("home.eyebrow")}</p>
              <h1 className="hero__title">{t("home.heroTitle")}</h1>
              <p className="hero__lead">{t("home.heroLead")}</p>
              <div className="hero__actions">
                <Link to="/new" className="btn btn--primary btn--large">
                  <Plus size={22} aria-hidden="true" />
                  {t("home.newGame")}
                </Link>
              </div>
              <dl className="hero__facts">
                <div className="hero__fact">
                  <dt className="num">2–8</dt>
                  <dd>{t("home.factTeams")}</dd>
                </div>
                <div className="hero__fact">
                  <dt className="num">{t("home.factQuestionsValue")}</dt>
                  <dd>{t("home.factQuestions")}</dd>
                </div>
                <div className="hero__fact">
                  <dt className="num">3</dt>
                  <dd>{t("home.factTypes")}</dd>
                </div>
              </dl>
            </div>
            <GameStatus game={game} />
          </div>
        </section>

        <div className="home-below">
          <section id="how" className="home-container home-section" aria-labelledby="how-title">
            <header className="home-section__head">
              <h2 id="how-title" className="home-section__title">{t("home.how.title")}</h2>
              <p className="home-section__lead">{t("home.how.lead")}</p>
            </header>
            <ol className="how">
              {STEPS.map(({ key, Icon }, i) => (
                <li key={key} className="how__step">
                  <span className="how__top">
                    <span className="how__icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="how__no num">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <h3 className="how__title">{t(`home.how.${key}.title`)}</h3>
                  <p className="how__text">{t(`home.how.${key}.text`)}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="types" className="home-container home-section" aria-labelledby="types-title">
            <header className="home-section__head">
              <h2 id="types-title" className="home-section__title">{t("home.types.title")}</h2>
              <p className="home-section__lead">{t("home.types.lead")}</p>
            </header>
            <ul className="types">
              {QUESTION_TYPES.map((type) => {
                const Icon = TYPE_ICONS[type];
                return (
                  <li key={type} className={`type-card type-card--${type}`}>
                    <span className="type-card__icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <h3 className="type-card__title">{t(`type.${type}`)}</h3>
                    <p className="type-card__text">{t(`home.types.${type}`)}</p>
                    <dl className="type-card__points">
                      <div>
                        <dt className="num">{points[type].correct}</dt>
                        <dd>{t("home.types.correct")}</dd>
                      </div>
                      <div>
                        <dt className="num">+{points[type].extra}</dt>
                        <dd>{t("home.types.extra")}</dd>
                      </div>
                    </dl>
                  </li>
                );
              })}
            </ul>
          </section>

          <section id="keys" className="home-container home-section" aria-labelledby="keys-title">
            <header className="home-section__head">
              <h2 id="keys-title" className="home-section__title">{t("home.keys.title")}</h2>
              <p className="home-section__lead">{t("home.keys.lead")}</p>
            </header>
            <dl className="keys">
              {[
                [t("home.keys.spaceKey"), t("home.keys.space")],
                ["Enter", t("home.keys.enter")],
                ["1–8", t("home.keys.digits")],
                ["Esc", t("home.keys.esc")],
              ].map(([key, text]) => (
                <div key={key} className="keys__row">
                  <dt>
                    <kbd className="kbd">{key}</kbd>
                  </dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <footer className="home-container">
            <div className="home-footer">
              <p className="home-footer__brand">
                {t("app.school")} · {t("app.name")}
              </p>
              <p className="home-footer__note">{t("home.footer")}</p>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
