import { useId, useState } from 'react';

// A labeled slider with a typed value. Both stay in sync.
export function Slider({ label, value, onChange, min, max, step = 1, format = (v) => v, suffix = '', prefix = '' }) {
  const id = useId();
  const [editing, setEditing] = useState(null);
  const shown = editing ?? (Number.isInteger(value) && Math.abs(value) >= 1000 ? value.toLocaleString('en-US') : String(value));
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <div className="field__row">
        <label htmlFor={id}>{label}</label>
        <span className="field__value">
          {prefix}
          <input
            type="text"
            inputMode="decimal"
            aria-label={`${label} value`}
            value={shown}
            onFocus={() => setEditing(String(value))}
            onBlur={() => setEditing(null)}
            onChange={(e) => {
              setEditing(e.target.value);
              const v = Number(e.target.value.replace(/[^0-9.\-]/g, ''));
              if (e.target.value.trim() !== '' && !Number.isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            style={{ width: `${shown.length + 0.6}ch` }}
          />
          {suffix}
        </span>
      </div>
      <input
        id={id}
        className="range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` }}
        aria-valuetext={`${prefix}${format(value)}${suffix}`}
      />
    </div>
  );
}

export function Segmented({ label, value, onChange, options }) {
  return (
    <div className="field">
      <div className="field__row"><span className="field__label">{label}</span></div>
      <div className="seg" role="radiogroup" aria-label={label}>
        {options.map(([v, text]) => (
          <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'is-on' : ''} onClick={() => onChange(v)}>
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}
