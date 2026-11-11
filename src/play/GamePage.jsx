import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Flag, Volume2, VolumeX } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import { currentQuestion, pickPocket, unplayedPockets } from "../game/game.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import Legend from "./Legend.jsx";
import QuestionCard from "./QuestionCard.jsx";
import RankingPanel from "./RankingPanel.jsx";
import Wheel from "./Wheel.jsx";
import { restingRotation, spinRotation } from "./wheelGeometry.js";
import { useGame } from "./useGame.js";
import "./game.css";

const SPIN_MS = 4200; // matches .wheel__disc--spinning in wheel.css
const PAUSE_MS = 500; // the landed pocket stays lit this long before the card opens

/** Where the wheel rests when the page opens: the last question played sits under the pointer. */
function initialRotation(game) {
  const last = game?.played.at(-1);
  return last ? restingRotation(last - 1, game.pockets.length) : 0;
}

export default function GamePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [game, dispatch] = useGame();
  const [rotation, setRotation] = useState(() => initialRotation(game));
  const [spinTarget, setSpinTarget] = useState(null); // pocket number while spinning and landing
  const [spinning, setSpinning] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finishSpin = useCallback(() => {
    if (!spinning) return;
    setSpinning(false);
    const target = spinTarget;
    timers.current.push(
      setTimeout(() => {
        dispatch({ type: "OPEN_QUESTION", pocketNo: target });
        setSpinTarget(null);
      }, PAUSE_MS),
    );
  }, [spinning, spinTarget, dispatch]);

  // If the transition end is missed (tab in the background, reduced motion), finish on time anyway.
  useEffect(() => {
    if (!spinning) return undefined;
    const fallback = setTimeout(finishSpin, SPIN_MS + 300);
    return () => clearTimeout(fallback);
  }, [spinning, finishSpin]);

  const canSpin = Boolean(game) && !spinning && spinTarget === null && game.current === null && game.endedAt === null;
  const left = game ? unplayedPockets(game).length : 0;

  const spin = useCallback(() => {
    if (!canSpin) return;
    const pocketNo = pickPocket(game);
    if (pocketNo === null) return;
    setSpinTarget(pocketNo);
    setSpinning(true);
    setRotation((current) => spinRotation(current, pocketNo - 1, game.pockets.length));
  }, [canSpin, game]);

  // Space spins, unless a control has focus (it handles its own Space) or a dialog is open.
  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== "Space" || event.repeat) return;
      const target = event.target;
      if (target.closest?.("button, input, textarea, select, [role='button'], dialog")) return;
      event.preventDefault();
      spin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spin]);

  const closeCard = useCallback(() => dispatch({ type: "CLOSE_QUESTION" }), [dispatch]);

  if (!game) return <Navigate to="/" replace />;
  // M5 shows the results here; until then an ended game leads home (fixlist F12).
  if (game.endedAt !== null) return <Navigate to="/" replace />;

  const question = currentQuestion(game);
  const allPlayed = left === 0;
  const pockets = game.pockets.map((p) => ({
    no: p.no,
    type: p.question.type,
    // The open question keeps its colour; it turns grey when its card closes.
    played: game.played.includes(p.no) && p.no !== game.current,
  }));

  let hubLabel = t("game.spin");
  if (spinning || spinTarget !== null) hubLabel = t("game.spinning");
  else if (allPlayed) hubLabel = t("game.allPlayed");

  return (
    <div className="game">
      <header className="game__bar">
        <Link to="/" className="game__brand">{t("app.school")}</Link>
        <p className="game__progress num">
          {t("game.progress", { played: game.played.length, total: game.pockets.length })}
        </p>
        <div className="game__controls">
          <button
            type="button"
            className="stage-btn"
            aria-pressed={game.settings.showScores}
            onClick={() => dispatch({ type: "TOGGLE_SCORES" })}
          >
            {game.settings.showScores ? (
              <Eye aria-hidden="true" className="stage-btn__icon" />
            ) : (
              <EyeOff aria-hidden="true" className="stage-btn__icon" />
            )}
            {t("game.scores")}
          </button>
          <button
            type="button"
            className="stage-btn"
            aria-pressed={game.settings.sound}
            onClick={() => dispatch({ type: "TOGGLE_SOUND" })}
          >
            {game.settings.sound ? (
              <Volume2 aria-hidden="true" className="stage-btn__icon" />
            ) : (
              <VolumeX aria-hidden="true" className="stage-btn__icon" />
            )}
            {t("game.sound")}
          </button>
          <LanguageSwitch />
          <button
            type="button"
            className={`stage-btn${allPlayed ? " stage-btn--primary" : ""}`}
            onClick={() => setConfirmEnd(true)}
          >
            <Flag aria-hidden="true" className="stage-btn__icon" />
            {t("game.end")}
          </button>
        </div>
      </header>

      <main className="game__stage">
        <div className="game__side game__side--left">
          <Legend game={game} />
        </div>
        <div className="game__center">
          <Wheel
            pockets={pockets}
            rotation={rotation}
            spinning={spinning}
            highlight={spinTarget !== null && !spinning ? spinTarget : game.current}
            hubLabel={hubLabel}
            hubDisabled={!canSpin || allPlayed}
            onHub={spin}
            onReopen={canSpin ? (pocketNo) => dispatch({ type: "OPEN_QUESTION", pocketNo }) : null}
            onSpinEnd={finishSpin}
            label={t("game.wheel", { total: game.pockets.length, left })}
          />
          <p className="game__hint" aria-live="polite">
            {allPlayed ? t("game.hintDone") : t("game.hint", { left })}
          </p>
        </div>
        <div className="game__side game__side--right">
          {game.settings.showScores && <RankingPanel game={game} />}
        </div>
      </main>

      {question && <QuestionCard pocketNo={game.current} question={question} onClose={closeCard} />}

      <ConfirmDialog
        open={confirmEnd}
        title={t("game.endTitle")}
        text={t("game.endText")}
        confirmLabel={t("game.end")}
        onCancel={() => setConfirmEnd(false)}
        onConfirm={() => {
          setConfirmEnd(false);
          dispatch({ type: "END_GAME" });
          navigate("/"); // M5: the leaderboard
        }}
      />
    </div>
  );
}
