import { QUESTION_TYPES } from "../game/constants.js";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { TYPE_ICONS } from "./typeIcons.js";
import "./question-type.css";

// Each type has a colour, an icon and a name; colour never stands alone (D24).

export function TypeIcon({ type, size = 18 }) {
  const Icon = TYPE_ICONS[type];
  return <Icon size={size} aria-hidden="true" className={`type-icon type-icon--${type}`} />;
}

/** The type as a label: icon + name, in the type's colour. Optional count after the name. */
export function TypeChip({ type, count }) {
  const { t } = useI18n();
  return (
    <span className={`type-chip type-chip--${type}`}>
      <TypeIcon type={type} size={16} />
      <span>{t(`type.${type}`)}</span>
      {count !== undefined && <span className="type-chip__count num">{count}</span>}
    </span>
  );
}

/** Radio group for choosing a question type. */
export function TypePicker({ name, value, onChange, legend }) {
  const { t } = useI18n();
  return (
    <fieldset className="field">
      <legend className="field__label">{legend}</legend>
      <div className="segmented">
        {QUESTION_TYPES.map((type) => (
          <label key={type} className="segmented__option">
            <input
              type="radio"
              name={name}
              value={type}
              checked={value === type}
              onChange={() => onChange(type)}
            />
            <span className={`segmented__face type-face type-face--${type}`}>
              <TypeIcon type={type} />
              {t(`type.${type}`)}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
