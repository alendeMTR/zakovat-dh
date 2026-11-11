import { QUESTION_TYPES } from "../game/constants.js";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

/** What the colours mean, and how many of each type are left (plan §4, screen 4). */
export default function Legend({ game }) {
  const { t } = useI18n();
  const left = (type) =>
    game.pockets.filter((p) => p.question.type === type && !game.played.includes(p.no)).length;
  const present = QUESTION_TYPES.filter((type) => game.pockets.some((p) => p.question.type === type));

  return (
    <section className="legend" aria-labelledby="legend-title">
      <h2 id="legend-title" className="stage-panel__title">{t("game.legend")}</h2>
      <ul className="legend__list">
        {present.map((type) => {
          const Icon = TYPE_ICONS[type];
          return (
            <li key={type} className="legend__row">
              <span className={`legend__swatch legend__swatch--${type}`} aria-hidden="true">
                <Icon className="legend__icon" />
              </span>
              <span className="legend__text">
                <span className="legend__name">{t(`type.${type}`)}</span>
                <span className="legend__count num">{t("game.left", { n: left(type) })}</span>
              </span>
            </li>
          );
        })}
        <li className="legend__row">
          <span className="legend__swatch legend__swatch--played" aria-hidden="true" />
          <span className="legend__text">
            <span className="legend__name">{t("game.played")}</span>
            <span className="legend__count num">{game.played.length}</span>
          </span>
        </li>
      </ul>
    </section>
  );
}
