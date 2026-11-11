import { ranking } from "../game/scoring.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

/** Live team ranking (brief); shared places for ties (D16). Hidden when scores are hidden (D22). */
export default function RankingPanel({ game }) {
  const { t } = useI18n();
  const rows = ranking(game);
  return (
    <section className="ranking" aria-labelledby="ranking-title">
      <h2 id="ranking-title" className="stage-panel__title">{t("game.ranking")}</h2>
      <ol className="ranking__list">
        {rows.map((row) => (
          <li key={row.team.id} className="ranking__row">
            <span className="ranking__place num">{row.place}</span>
            <span className="ranking__name" title={row.team.name}>{row.team.name}</span>
            <span className="ranking__score num" aria-label={t("game.scoreLabel", { score: row.score })}>
              {row.score}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
