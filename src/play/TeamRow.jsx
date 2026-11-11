import { Circle, CircleCheck } from "lucide-react";
import { pointsFor } from "../game/scoring.js";
import { formatElapsed, handInStatus } from "../game/timer.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { VERDICT_ICONS as VERDICTS } from "./verdictIcons.js";

/**
 * One team on the card (brief): name, answered or not, three verdict buttons as icons, points.
 * - Tapping the name records the hand-in time; tapping again removes it (D6).
 * - Verdict buttons are locked until the answer is shown (D8).
 * - A team that handed in inside the extra window gets "correct + extra" suggested, not set (D7, D31).
 */
export default function TeamRow({ team, index, round, question, settings, total, locked, handInEnabled, onHandIn, onVerdict }) {
  const { t } = useI18n();
  const handInMs = round.handIns[team.id];
  const handedIn = handInMs !== undefined;
  const status = handedIn ? handInStatus(handInMs, settings) : null;
  const verdict = round.verdicts[team.id] ?? null;
  const suggestExtra = !locked && !verdict && status === "extra";
  const points = verdict ? pointsFor(settings, question.type, verdict) : null;
  const time = handedIn ? formatElapsed(handInMs) : "";

  return (
    <li className={`team-row${verdict ? ` team-row--${verdict}` : ""}`}>
      <button
        type="button"
        className={`team-row__handin${handedIn ? " team-row__handin--done" : ""}`}
        aria-pressed={handedIn}
        aria-label={handedIn ? t("card.handInUndo", { team: team.name, time }) : t("card.handIn", { team: team.name })}
        disabled={!handInEnabled}
        onClick={onHandIn}
      >
        <span className="team-row__key num" aria-hidden="true">{index + 1}</span>
        {handedIn ? (
          <CircleCheck aria-hidden="true" className="team-row__mark" />
        ) : (
          <Circle aria-hidden="true" className="team-row__mark" />
        )}
        {/* Name first; the status sits on a second line so it never cuts the name short. */}
        <span className="team-row__text">
          <span className="team-row__name">{team.name}</span>
          <span className={`team-row__time num team-row__time--${status ?? "waiting"}`}>
            {handedIn ? (
              <>
                {time}
                {status === "extra" && <span className="team-row__tag"> · {t("card.status.extra")}</span>}
                {status === "late" && <span className="team-row__tag"> · {t("card.status.late")}</span>}
              </>
            ) : (
              t("card.waiting")
            )}
          </span>
        </span>
      </button>

      <div className="team-row__verdicts" role="group" aria-label={team.name}>
        {VERDICTS.map(({ key, Icon }) => {
          const suggested = key === "extra" && suggestExtra;
          return (
            <button
              key={key}
              type="button"
              className={`verdict verdict--${key}${verdict === key ? " verdict--on" : ""}${suggested ? " verdict--suggested" : ""}`}
              aria-pressed={verdict === key}
              aria-label={`${team.name}: ${t(`card.verdict.${key}`)}`}
              title={suggested ? `${t(`card.verdict.${key}`)} — ${t("card.suggested")}` : t(`card.verdict.${key}`)}
              disabled={locked}
              onClick={() => onVerdict(key)}
            >
              <Icon aria-hidden="true" className="verdict__icon" />
            </button>
          );
        })}
      </div>

      {settings.showScores && (
        <div className="team-row__score num">
          <span className="team-row__points" title={points ? t("card.points", { n: points }) : undefined}>
            {points ? `+${points}` : ""}
          </span>
          <span className="team-row__total" aria-label={t("game.scoreLabel", { score: total })}>{total}</span>
        </div>
      )}
    </li>
  );
}
