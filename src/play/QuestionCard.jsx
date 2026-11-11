import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, Lock } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { teamTotals } from "../game/scoring.js";
import { hasStarted, isRunning, remainingMs } from "../game/timer.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import TeamRow from "./TeamRow.jsx";
import Timer from "./Timer.jsx";
import { cardKeyAction } from "./cardKeys.js";
import { playTone, primeAudio } from "./tone.js";
import { useFitText } from "./useFitText.js";
import { useNow } from "./useNow.js";
import "./question-card.css";

/**
 * The question card over the wheel (brief, plan §4 screen 5):
 * type band → timer (about a fifth of the card) → question (fitted to its space, D25) → answer → team rows.
 * Keys: Space starts or pauses the timer; 1–8 record a team's hand-in; Escape returns to the wheel.
 */
export default function QuestionCard({ game, dispatch, onClose }) {
  const { t } = useI18n();
  const pocketNo = game.current;
  const question = game.pockets.find((p) => p.no === pocketNo).question;
  const round = game.rounds[pocketNo];
  const { settings, teams } = game;
  const Icon = TYPE_ICONS[question.type];
  const running = isRunning(round.timer);
  // Tick while the clock runs and time is left; at zero the display stays at 0:00.
  const [ticking, setTicking] = useState(true);
  const now = useNow(running && ticking);
  const remaining = remainingMs(round.timer, settings, now);
  useEffect(() => setTicking(remaining > 0), [remaining]);
  const totals = teamTotals(game);
  const [confirmReset, setConfirmReset] = useState(false);

  const cardRef = useRef(null);
  const boxRef = useRef(null);
  const textRef = useRef(null);
  useFitText(boxRef, textRef, [question.text, teams.length, round.revealed]);

  // The tone plays once, when this card sees the time run out (not after a reload past zero).
  const previous = useRef(remaining);
  useEffect(() => {
    if (previous.current > 0 && remaining <= 0 && settings.sound) playTone();
    previous.current = remaining;
  }, [remaining, settings.sound]);

  useEffect(() => {
    cardRef.current?.focus();
  }, [pocketNo]);

  const start = useCallback(() => {
    primeAudio(); // a click is the gesture browsers need before they play sound
    dispatch({ type: "START_TIMER" });
  }, [dispatch]);
  const pause = useCallback(() => dispatch({ type: "PAUSE_TIMER" }), [dispatch]);
  const reset = () => {
    if (Object.keys(round.handIns).length) setConfirmReset(true);
    else dispatch({ type: "RESET_TIMER" });
  };
  const handIn = useCallback((teamId) => dispatch({ type: "HAND_IN", teamId }), [dispatch]);

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      // Any open modal — this card's reset question or End game in the top bar — owns the keyboard (F19).
      const inModal =
        confirmReset || document.querySelector("dialog[open]") !== null || Boolean(target.closest?.("dialog"));
      const inField = Boolean(target.closest?.("input, textarea, select"));
      const { action, teamIndex, preventDefault } = cardKeyAction(
        {
          key: event.key,
          code: event.code,
          repeat: event.repeat,
          inModal,
          inField,
          onButton: Boolean(target.closest?.("button")),
        },
        { running, remaining, teamCount: teams.length },
      );
      if (preventDefault) event.preventDefault();
      if (inModal || inField) return;
      primeAudio(); // a key press also counts as the gesture that allows sound
      if (action === "close") onClose();
      else if (action === "start") start();
      else if (action === "pause") pause();
      else if (action === "handIn") handIn(teams[teamIndex].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmReset, onClose, running, remaining, start, pause, handIn, teams]);

  const answerLabel = question.type === "sandiqcha" ? t("card.object") : t("card.answer");
  const twoColumns = teams.length > 4;

  return (
    <div className="card-layer">
      <section
        ref={cardRef}
        tabIndex={-1}
        className={`qcard qcard--${question.type}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qcard-label"
        onPointerDown={primeAudio /* after a reload, any tap on the card lets the zero tone play */}
      >
        <header className="qcard__band">
          <span id="qcard-label" className="qcard__type">
            <Icon aria-hidden="true" className="qcard__type-icon" />
            {t(`type.${question.type}`)}
            <span className="qcard__no num">· {t("game.pocket", { n: pocketNo })}</span>
          </span>
          <button type="button" className="qcard__back" onClick={onClose}>
            <ArrowLeft aria-hidden="true" className="stage-btn__icon" />
            {t("card.back")}
          </button>
        </header>

        <Timer timer={round.timer} settings={settings} now={now} onStart={start} onPause={pause} onReset={reset} />

        <div ref={boxRef} className="qcard__question">
          <p ref={textRef} className="qcard__text">{question.text}</p>
        </div>

        <div className="qcard__answer" aria-live="polite">
          {round.revealed ? (
            <p className="qcard__answer-text">
              <span className="qcard__answer-label">{answerLabel}:</span> {question.answer}
            </p>
          ) : (
            <button type="button" className="stage-btn stage-btn--primary" onClick={() => dispatch({ type: "REVEAL" })}>
              <Eye aria-hidden="true" className="stage-btn__icon" />
              {t("card.reveal")}
            </button>
          )}
        </div>

        <section className="qcard__teams" aria-label={t("card.teams")}>
          {!round.revealed && (
            <p className="qcard__locked">
              <Lock aria-hidden="true" className="qcard__locked-icon" />
              {t("card.locked")}
            </p>
          )}
          <ol className={`team-rows${twoColumns ? " team-rows--two" : ""}`}>
            {teams.map((team, i) => (
              <TeamRow
                key={team.id}
                team={team}
                index={i}
                round={round}
                question={question}
                settings={settings}
                total={totals[team.id].score}
                locked={!round.revealed}
                handInEnabled={hasStarted(round.timer)}
                onHandIn={() => handIn(team.id)}
                onVerdict={(verdict) => dispatch({ type: "SET_VERDICT", pocketNo, teamId: team.id, verdict })}
              />
            ))}
          </ol>
        </section>

        {/* At zero Space no longer starts or pauses (F19), so the line stops naming it. */}
        <p className="qcard__keys">{t(remaining > 0 ? "card.keys" : "card.keysDone", { n: teams.length })}</p>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title={t("timer.resetTitle")}
        text={t("timer.resetText")}
        confirmLabel={t("timer.reset")}
        danger
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          dispatch({ type: "RESET_TIMER" });
        }}
      />
    </div>
  );
}
