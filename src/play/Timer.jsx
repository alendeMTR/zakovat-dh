import { Clock, Pause, Play, RotateCcw } from "lucide-react";
import { formatRemaining, hasStarted, isRunning, remainingMs, timerPhase } from "../game/timer.js";
import { useI18n } from "../i18n/I18nProvider.jsx";

/**
 * The timer block at the top of the card (brief): clock icon, large digits, a bar, and a line that names
 * the phase, so colour is never the only signal (D24). Colours: extra window (green), neutral (navy),
 * little time left and time up (red-pink).
 */
export default function Timer({ timer, settings, now, judged = false, onStart, onPause, onReset }) {
  const { t } = useI18n();
  const phase = timerPhase(timer, settings, now);
  const remaining = remainingMs(timer, settings, now);
  const total = settings.timeSec * 1000;
  const left = Math.max(0, Math.min(1, remaining / total));
  const extraShare = settings.extraSec / settings.timeSec;
  const running = isRunning(timer);
  const started = hasStarted(timer);
  const done = phase === "done";

  let label = t(`timer.phase.${phase}`);
  // Stopped because every team has a verdict (D72): say so, so it is not read as a pause by mistake.
  if (!running && started && !done) label = judged ? t("timer.judged") : t("timer.paused");

  return (
    <section className={`timer timer--${phase}`} aria-label={t("timer.label")}>
      <div className="timer__face">
        <Clock aria-hidden="true" className="timer__icon" />
        <span className="timer__digits num" role="timer" aria-live="off">
          {formatRemaining(remaining)}
        </span>
      </div>
      <div className="timer__bar" aria-hidden="true">
        {extraShare > 0 && <span className="timer__bar-extra" style={{ width: `${extraShare * 100}%` }} />}
        <span className="timer__bar-fill" style={{ width: `${(1 - left) * 100}%` }} />
        {extraShare > 0 && <span className="timer__bar-mark" style={{ left: `${extraShare * 100}%` }} />}
      </div>
      <p className="timer__phase">{label}</p>
      <div className="timer__controls">
        {/* At zero the clock keeps counting (late hand-ins, D33), so there is nothing to start or pause. */}
        {done ? null : running ? (
          <button type="button" className="stage-btn" onClick={onPause}>
            <Pause aria-hidden="true" className="stage-btn__icon" />
            {t("timer.pause")}
          </button>
        ) : (
          <button type="button" className="stage-btn stage-btn--primary" onClick={onStart}>
            <Play aria-hidden="true" className="stage-btn__icon" />
            {started ? t("timer.resume") : t("timer.start")}
          </button>
        )}
        <button type="button" className="stage-btn" onClick={onReset} disabled={!started}>
          <RotateCcw aria-hidden="true" className="stage-btn__icon" />
          {t("timer.reset")}
        </button>
      </div>
    </section>
  );
}
