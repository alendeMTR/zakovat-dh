import { Check, RotateCw } from "lucide-react";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { C, R, numberSize, pocketAngle, sectorPath } from "./wheelGeometry.js";
import "./wheel.css";

/**
 * The wheel, flat 2D (references/03 structure): navy rim, a ring of numbered pockets coloured by
 * question type, a white bowl, and the hub, which is the spin button. The pointer stays at the top.
 * Played pockets turn grey and stay in place (D23); a played pocket can be reopened (D34).
 *
 * pockets:  [{ no, type, played }]
 * rotation: degrees; the parent animates it by changing the value while `spinning` is true.
 */
export default function Wheel({ pockets, rotation, spinning, highlight, hubLabel, hubDisabled, onHub, onReopen, onSpinEnd, label }) {
  const { t } = useI18n();
  const count = pockets.length;
  const size = numberSize(count);
  const iconSize = Math.round(size * 0.72);
  // Far enough from the rim that the pointer's tip (24 units into the pockets) never covers a digit.
  const numberY = C - (R.pocketOut - Math.max(size * 1.1, 30 + size * 0.45));
  const iconY = numberY + size * 0.75; // top of the icon, below the number (towards the centre)

  return (
    <div className="wheel">
      <svg
        className={`wheel__disc${spinning ? " wheel__disc--spinning" : ""}`}
        viewBox="0 0 1000 1000"
        style={{ transform: `rotate(${rotation}deg)` }}
        onTransitionEnd={(event) => {
          if (event.propertyName === "transform") onSpinEnd();
        }}
        role="img"
        aria-label={label}
      >
        <circle cx={C} cy={C} r={R.rimOut} className="wheel__rim" />
        {pockets.map((pocket, i) => {
          const Icon = TYPE_ICONS[pocket.type];
          const angle = pocketAngle(i, count);
          const reopen = pocket.played && !spinning && onReopen;
          return (
            <g key={pocket.no} className={`wheel__pocket wheel__pocket--${pocket.played ? "played" : pocket.type}`}>
              <path
                d={sectorPath(i, count)}
                className="wheel__sector"
                {...(reopen
                  ? {
                      role: "button",
                      tabIndex: 0,
                      "aria-label": t("game.reopen", { n: pocket.no }),
                      onClick: () => onReopen(pocket.no),
                      onKeyDown: (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onReopen(pocket.no);
                        }
                      },
                    }
                  : {})}
              />
              <g transform={`rotate(${angle} ${C} ${C})`} className="wheel__label" aria-hidden="true">
                <text x={C} y={numberY} fontSize={size} className="wheel__number num">
                  {pocket.no}
                </text>
                {pocket.type !== "oddiy" && (
                  <Icon x={C - iconSize / 2} y={iconY} size={iconSize} strokeWidth={2.4} className="wheel__icon" />
                )}
              </g>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={R.bowl} className="wheel__bowl" />
        {highlight !== null && (
          <path
            d={sectorPath(highlight - 1, count)}
            className="wheel__highlight"
            aria-hidden="true"
          />
        )}
      </svg>

      <svg className="wheel__pointer" viewBox="0 0 1000 1000" aria-hidden="true">
        <path d={`M ${C - 30} 4 L ${C + 30} 4 L ${C} 66 Z`} />
      </svg>

      <button type="button" className="wheel__hub" onClick={onHub} disabled={hubDisabled}>
        {hubDisabled && !spinning ? (
          <Check aria-hidden="true" className="wheel__hub-icon" />
        ) : (
          <RotateCw aria-hidden="true" className="wheel__hub-icon" />
        )}
        <span>{hubLabel}</span>
      </button>
    </div>
  );
}
