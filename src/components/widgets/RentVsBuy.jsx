import { useMemo, useState } from 'react';
import { Slider } from './Field.jsx';
import { monthlyPI } from './PaymentCalculator.jsx';
import { fmtMoney } from '../../lib/hooks.js';

const MAX_YEARS = 15;

export function model({ rent, price, down, rate, appreciation, rentGrowth, invest }) {
  const loan = price * (1 - down / 100);
  const r = rate / 100 / 12;
  const M = monthlyPI(loan, rate, 30);
  const upfront = price * (down / 100) + price * 0.02;
  const rows = [];
  let buyRunning = upfront;
  let rentRunning = 0;
  for (let y = 1; y <= MAX_YEARS; y++) {
    const value = price * Math.pow(1 + appreciation / 100, y);
    const tax = price * 0.0115 * Math.pow(1.02, y - 1);
    const ins = 2400 * Math.pow(1.03, y - 1);
    const upkeep = value * 0.01;
    buyRunning += M * 12 + tax + ins + upkeep;
    rentRunning += rent * 12 * Math.pow(1 + rentGrowth / 100, y - 1);
    const k = y * 12;
    const balance = r === 0 ? loan - (loan / 360) * k : loan * Math.pow(1 + r, k) - (M * (Math.pow(1 + r, k) - 1)) / r;
    const proceeds = value * 0.94 - balance;
    const opportunity = upfront * (Math.pow(1 + invest / 100, y) - 1);
    rows.push({ y, buy: buyRunning + opportunity - proceeds, rent: rentRunning });
  }
  return rows;
}

export default function RentVsBuy() {
  const [rent, setRent] = useState(4200);
  const [price, setPrice] = useState(1100000);
  const [down, setDown] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(7);
  const [appreciation, setAppreciation] = useState(3);
  const [rentGrowth, setRentGrowth] = useState(3);
  const [invest, setInvest] = useState(5);

  const rows = useMemo(
    () => model({ rent, price, down, rate, appreciation, rentGrowth, invest }),
    [rent, price, down, rate, appreciation, rentGrowth, invest]
  );
  const at = rows[years - 1];
  const breakEven = rows.find((r) => r.buy < r.rent);
  const buyWins = at.buy < at.rent;

  // Chart
  const W = 580, H = 240, P = 40;
  const all = rows.flatMap((r) => [r.buy, r.rent]);
  const lo = Math.min(0, ...all);
  const hi = Math.max(...all);
  const x = (y) => P + ((y - 1) / (MAX_YEARS - 1)) * (W - P * 2 - 10);
  const yv = (v) => H - P - ((v - lo) / (hi - lo || 1)) * (H - P * 2);
  const line = (k) => rows.map((r, i) => `${i ? 'L' : 'M'}${x(r.y).toFixed(1)} ${yv(r[k]).toFixed(1)}`).join(' ');

  return (
    <div className="widget rvb">
      <div className="rvb__inputs">
        <Slider label="Your monthly rent" value={rent} onChange={setRent} min={1500} max={12000} step={50} prefix="$" />
        <Slider label="Home price" value={price} onChange={setPrice} min={300000} max={4000000} step={5000} prefix="$" />
        <Slider label="Down payment" value={down} onChange={setDown} min={3} max={60} suffix="%" />
        <Slider label="Interest rate" value={rate} onChange={setRate} min={2} max={10} step={0.125} suffix="%" />
        <Slider label="Years you plan to stay" value={years} onChange={setYears} min={1} max={MAX_YEARS} />
        <details className="rvb__more">
          <summary>Assumptions</summary>
          <Slider label="Home value growth per year" value={appreciation} onChange={setAppreciation} min={-2} max={8} step={0.5} suffix="%" />
          <Slider label="Rent growth per year" value={rentGrowth} onChange={setRentGrowth} min={0} max={8} step={0.5} suffix="%" />
          <Slider label="Return on invested savings" value={invest} onChange={setInvest} min={0} max={10} step={0.5} suffix="%" />
        </details>
      </div>

      <div className="rvb__out" aria-live="polite">
        <p className="rvb__verdict">
          Over {years} {years === 1 ? 'year' : 'years'}, <strong>{buyWins ? 'buying' : 'renting'}</strong> comes out about{' '}
          <strong>{fmtMoney(Math.abs(at.rent - at.buy))}</strong> ahead.
        </p>
        <p className="rvb__sub">
          {breakEven ? `With these numbers, buying pulls ahead in year ${breakEven.y}.` : `With these numbers, renting stays cheaper for all ${MAX_YEARS} years.`}
        </p>
        <svg className="rvb__chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Total cost of renting and buying by year">
          {[1, 5, 10, 15].map((t) => (
            <text key={t} x={x(t)} y={H - 10} textAnchor="middle">Year {t}</text>
          ))}
          {lo < 0 && <line x1={P} x2={W - P} y1={yv(0)} y2={yv(0)} className="rvb__zero" />}
          <line x1={x(years)} x2={x(years)} y1={P - 10} y2={H - P} className="rvb__marker" />
          <path d={line('rent')} className="rvb__rent" />
          <path d={line('buy')} className="rvb__buy" />
          <circle cx={x(years)} cy={yv(at.rent)} r="5" className="rvb__dot-rent" />
          <circle cx={x(years)} cy={yv(at.buy)} r="5" className="rvb__dot-buy" />
          {(() => {
            const end = rows[MAX_YEARS - 1];
            const ry = yv(end.rent), by = yv(end.buy);
            const rentTop = ry <= by;
            const mid = (ry + by) / 2;
            const gap = Math.max(Math.abs(ry - by) / 2, 14);
            return (
              <>
                <text x={W - P + 6} y={(rentTop ? mid - gap : mid + gap) + 4} className="rvb__lab-rent">Rent</text>
                <text x={W - P + 6} y={(rentTop ? mid + gap : mid - gap) + 4} className="rvb__lab-buy">Buy</text>
              </>
            );
          })()}
        </svg>
        <p className="calc__note">Total cost if you left after that many years. Includes 2% closing costs to buy and 6% to sell. Simplified model.</p>
      </div>
    </div>
  );
}
