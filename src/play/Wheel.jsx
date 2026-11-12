import { Check, RotateCw } from "lucide-react";
import { TYPE_ICONS } from "../components/typeIcons.js";
import { C, R, numberSize, pocketAngle, sectorPath } from "./wheelGeometry.js";
import "./wheel.css";

/**
 * The wheel, flat 2D (references/03 structure): navy rim, a ring of numbered pockets coloured by
 * question type, a white bowl, and the hub, which is the spin button. The pointer stays at the top.
 * Only the pockets still in play are drawn (D73): a played pocket leaves when its card closes, and the
 * rest close up. A played question is reopened from the side panel instead (D34).
 *
 * pockets:   [{ no, type }] in the order they sit clockwise from the top
 * highlight: the pocket number to outline (landed or open), or null
 * rotation:  degrees; the parent animates it by changing the value while `spinning` is true.
 */
export default function Wheel({ pockets, rotation, spinning, highlight, hubLabel, hubDisabled, onHub, onSpinEnd, label }) {
  const count = pockets.length;
  const size = numberSize(Math.max(count, 1));
  const iconSize = Math.round(size * 0.72);
  // Far enough from the rim that the pointer's tip (24 units into the pockets) never covers a digit.
  const numberY = C - (R.pocketOut - Math.max(size * 1.1, 30 + size * 0.45));
  const iconY = numberY + size * 0.75; // top of the icon, below the number (towards the centre)
  const highlightIndex = pockets.findIndex((p) => p.no === highlight);

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
        {count === 0 && <path d={sectorPath(0, 1)} className="wheel__sector wheel__sector--empty" />}
        {pockets.map((pocket, i) => {
          const Icon = TYPE_ICONS[pocket.type];
          const angle = pocketAngle(i, count);
          return (
            <g key={pocket.no} className={`wheel__pocket wheel__pocket--${pocket.type}`}>
              <path d={sectorPath(i, count)} className="wheel__sector" />
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
        {highlightIndex >= 0 && (
          <path d={sectorPath(highlightIndex, count)} className="wheel__highlight" aria-hidden="true" />
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
