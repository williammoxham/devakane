import { useMemo, useState } from 'react';
import { Slider, Segmented } from './Field.jsx';
import { fmtMoney } from '../../lib/hooks.js';

export function monthlyPI(loan, ratePct, years) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return loan / n;
  return (loan * r) / (1 - Math.pow(1 + r, -n));
}

const COLORS = ['#0F2C3A', '#4D7F86', '#A8CFC6', '#C9B79C', '#7A8E6E'];

export default function PaymentCalculator({ compact = false }) {
  const [price, setPrice] = useState(1250000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [term, setTerm] = useState(30);
  const [taxRate, setTaxRate] = useState(1.15);
  const [insurance, setInsurance] = useState(2400);
  const [hoa, setHoa] = useState(0);

  const parts = useMemo(() => {
    const loan = price * (1 - down / 100);
    const pi = monthlyPI(loan, rate, term);
    const tax = (price * taxRate) / 100 / 12;
    const ins = insurance / 12;
    const pmi = down < 20 ? (loan * 0.005) / 12 : 0;
    return [
      ['Principal and interest', pi],
      ['Property tax', tax],
      ['Insurance', ins],
      ['HOA', hoa],
      ['Mortgage insurance', pmi],
    ].filter(([, v]) => v > 0.5);
  }, [price, down, rate, term, taxRate, insurance, hoa]);

  const total = parts.reduce((s, [, v]) => s + v, 0);
  const loan = price * (1 - down / 100);

  // Donut
  const R = 70;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className={`widget calc ${compact ? 'calc--compact' : ''}`}>
      <div className="calc__inputs">
        <Slider label="Home price" value={price} onChange={setPrice} min={300000} max={4000000} step={5000} prefix="$" format={(v) => v.toLocaleString()} />
        <Slider label="Down payment" value={down} onChange={setDown} min={3} max={60} step={1} suffix="%" />
        <Slider label="Interest rate" value={rate} onChange={setRate} min={2} max={10} step={0.125} suffix="%" />
        {!compact && (
          <>
            <Segmented label="Loan term" value={term} onChange={setTerm} options={[[30, '30 years'], [15, '15 years']]} />
            <Slider label="Property tax rate" value={taxRate} onChange={setTaxRate} min={1} max={1.6} step={0.01} suffix="%" />
            <Slider label="Insurance per year" value={insurance} onChange={setInsurance} min={0} max={12000} step={100} prefix="$" />
            <Slider label="HOA per month" value={hoa} onChange={setHoa} min={0} max={1500} step={10} prefix="$" />
          </>
        )}
      </div>

      <div className="calc__out" aria-live="polite">
        <div className="donut">
          <svg viewBox="0 0 180 180" aria-hidden="true">
            <circle cx="90" cy="90" r={R} fill="none" stroke="var(--line)" strokeWidth="18" />
            {parts.map(([name, v], i) => {
              const len = (v / total) * C;
              const el = (
                <circle
                  key={name}
                  cx="90" cy="90" r={R} fill="none"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth="18"
                  strokeDasharray={`${Math.max(0, len - 2)} ${C}`}
                  strokeDashoffset={-acc}
                  transform="rotate(-90 90 90)"
                />
              );
              acc += len;
              return el;
            })}
          </svg>
          <div className="donut__center">
            <strong>{fmtMoney(total)}</strong>
            <span>per month</span>
          </div>
        </div>
        <ul className="legend">
          {parts.map(([name, v], i) => (
            <li key={name}>
              <i style={{ background: COLORS[i % COLORS.length] }} />
              <span>{name}</span>
              <b>{fmtMoney(v)}</b>
            </li>
          ))}
        </ul>
        <p className="calc__note">
          Loan amount {fmtMoney(loan)}. {down < 20 ? 'Mortgage insurance estimated at 0.5% of the loan per year. ' : ''}
          Estimates only. Use the rate from your lender.
        </p>
      </div>
    </div>
  );
}
