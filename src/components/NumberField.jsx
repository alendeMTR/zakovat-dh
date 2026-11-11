import { useId } from "react";

/** A whole-number input with a visible label, a unit, an optional hint and an error. */
export default function NumberField({ label, value, onChange, min, max, step = 1, unit, hint, error, ariaLabel }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="field">
      {label && (
        <label htmlFor={id} className="field__label">
          {label}
        </label>
      )}
      <span className="input-unit">
        <input
          id={id}
          className="input input--number"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={step}
          value={value ?? ""}
          aria-label={ariaLabel}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          onChange={(event) => {
            const raw = event.target.value;
            onChange(raw === "" ? null : Number(raw));
          }}
        />
        {unit}
      </span>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
