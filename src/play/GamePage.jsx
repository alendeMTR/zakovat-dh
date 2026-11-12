import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Flag, Volume2, VolumeX } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import LanguageSwitch from "../components/LanguageSwitch.jsx";
import { currentQuestion, pickPocket, unplayedPockets } from "../game/game.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import QuestionCard from "./QuestionCard.jsx";
import QuestionsPanel from "./QuestionsPanel.jsx";
import RankingPanel from "./RankingPanel.jsx";
import SpinResult from "./SpinResult.jsx";
import Wheel from "./Wheel.jsx";
import {
  initialRotation,
  nearestTurn,
  restingRotation,
  seamRotation,
  spinRotation,
  wheelPockets,
} from "./wheelGeometry.js";
import { useGame } from "./useGame.js";
import "./game.css";
import "./side-panels.css";

const SPIN_MS = 4200; // matches .wheel__disc--spinning in wheel.css
const PAUSE_MS = 500; // the landed pocket stays lit this long before its result shows

export default function GamePage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [game, dispatch] = useGame();
  const [rotation, setRotation] = useState(() => (game ? initialRotation(game) : 0));
  const [spinTarget, setSpinTarget] = useState(null); // pocket number from the spin until open or keep
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null); // { no, type } while the result dialog shows (D73)
  const [confirmEnd, setConfirmEnd] = useState(false);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finishSpin = useCallback(() => {
    if (!spinning) return;
    setSpinning(false);
    const target = spinTarget;
    const type = game.pockets.find((p) => p.no === target)?.question.type ?? "oddiy";
    timers.current.push(setTimeout(() => setResult({ no: target, type }), PAUSE_MS));
  }, [spinning, spinTarget, game]);

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
    const shown = wheelPockets(game);
    const index = shown.findIndex((p) => p.no === pocketNo);
    setSpinTarget(pocketNo);
    setSpinning(true);
    setRotation((current) => spinRotation(current, index, shown.length));
  }, [canSpin, game]);

  // The result dialog: open the question (it leaves the wheel when its card closes), or keep it.
  const openResult = useCallback(() => {
    if (!result) return;
    dispatch({ type: "OPEN_QUESTION", pocketNo: result.no });
    setResult(null);
    setSpinTarget(null);
  }, [result, dispatch]);
  const keepResult = useCallback(() => {
    setResult(null);
    setSpinTarget(null);
  }, []);

  // Space spins, unless a control has focus (it handles its own Space) or a dialog is open.
  useEffect(() => {
    const onKey = (event) => {
      if (event.code !== "Space" || event.repeat) return;
      if (game?.current !== null) return; // the open card uses Space for its timer
      if (document.querySelector("dialog[open]") !== null) return; // a modal owns the keyboard (F19)
      const target = event.target;
      if (target.closest?.("button, input, textarea, select, [role='button'], dialog")) return;
      event.preventDefault();
      spin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [spin, game]);

  // Closing a card takes its pocket off the wheel (D73). The rest close up, and the pointer rests on the
  // seam where it was, so no pocket looks picked.
  const closeCard = useCallback(() => {
    const shown = wheelPockets(game);
    const index = shown.findIndex((p) => p.no === game.current);
    const count = shown.length - 1;
    if (index >= 0 && count > 0) setRotation((current) => nearestTurn(seamRotation(index, count), current));
    dispatch({ type: "CLOSE_QUESTION" });
  }, [game, dispatch]);

  // A played question is reopened from the side panel (D34); it comes back on the wheel while open.
  const reopen = useCallback(
    (pocketNo) => {
      const shown = wheelPockets({ ...game, current: pocketNo });
      const index = shown.findIndex((p) => p.no === pocketNo);
      setRotation((current) => nearestTurn(restingRotation(index, shown.length), current));
      dispatch({ type: "OPEN_QUESTION", pocketNo });
    },
    [game, dispatch],
  );

  if (!game) return <Navigate to="/" replace />;
  if (game.endedAt !== null) return <Navigate to="/game/results" replace />;

  const cardOpen = currentQuestion(game) !== null;
  const allPlayed = left === 0;
  const pockets = wheelPockets(game);

  let hubLabel = t("game.spin");
  if (spinning || (spinTarget !== null && result === null)) hubLabel = t("game.spinning");
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
          <QuestionsPanel game={game} onReopen={canSpin ? reopen : null} />
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
            onSpinEnd={finishSpin}
            label={t("game.wheel", { total: game.pockets.length, left })}
          />
          <p className="game__hint" aria-live="polite">
            {allPlayed ? t("game.hintDone") : t("game.hint", { left })}
          </p>
        </div>
        <div className="game__side game__side--right">
          <RankingPanel game={game} />
        </div>
      </main>

      {cardOpen && <QuestionCard game={game} dispatch={dispatch} onClose={closeCard} />}

      <SpinResult result={result} onOpen={openResult} onKeep={keepResult} />

      <ConfirmDialog
        open={confirmEnd}
        title={t("game.endTitle")}
        text={t("game.endText")}
        confirmLabel={t("game.end")}
        onCancel={() => setConfirmEnd(false)}
        onConfirm={() => {
          setConfirmEnd(false);
          dispatch({ type: "END_GAME" });
          navigate("/game/results");
        }}
      />
    </div>
  );
}
