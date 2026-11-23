import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Plate from '../Plate.jsx';
import { monthlyPI } from '../widgets/PaymentCalculator.jsx';
import { model } from '../widgets/RentVsBuy.jsx';
import { QUESTIONS, score } from '../widgets/NeighborhoodMatch.jsx';
import { openSearch } from '../Nav.jsx';
import { fmtMoney } from '../../lib/hooks.js';
import { safeGet } from '../../lib/supabase.js';
import { site } from '../../config/site.js';

// Starts with a question, not a number. The visitor picks what they want to know.
function PaymentTile({ rate, term }) {
  const [mode, setMode] = useState(null); // null | 'cost' | 'afford'
  const [price, setPrice] = useState(1200000);
  const [budget, setBudget] = useState(6000);
  const [down, setDown] = useState(20);
  const perDollar = monthlyPI(1, rate, term) * (1 - down / 100) + 0.0115 / 12;
  const pay = price * perDollar + 200;
  const maxPrice = Math.max(0, (budget - 200) / perDollar);
  const pricePct = ((price - 500000) / (3000000 - 500000)) * 100;
  const budgetPct = ((budget - 2000) / (15000 - 2000)) * 100;
  const presets = [[800000, '$800K'], [1200000, '$1.2M'], [1800000, '$1.8M'], [2500000, '$2.5M']];

  return (
    <div className={`tile tile--pay ${mode ? 'is-open' : ''}`}>
      <p className="tile__label">Payment planner</p>
      {!mode && (
        <div className="choose">
          <h3>What would you like to figure out?</h3>
          <div className="choose__opts">
            <button type="button" onClick={() => setMode('afford')}>
              <strong>What can I afford?</strong>
              <span>Start from a monthly budget</span>
            </button>
            <button type="button" onClick={() => setMode('cost')}>
              <strong>What would a home cost me?</strong>
              <span>Start from a price</span>
            </button>
          </div>
        </div>
      )}

      {mode && (
        <div className="choose__result">
          <div className="seg seg--small" role="radiogroup" aria-label="What to figure out">
            <button type="button" role="radio" aria-checked={mode === 'afford'} className={mode === 'afford' ? 'is-on' : ''} onClick={() => setMode('afford')}>Afford</button>
            <button type="button" role="radio" aria-checked={mode === 'cost'} className={mode === 'cost' ? 'is-on' : ''} onClick={() => setMode('cost')}>Monthly cost</button>
          </div>

          {mode === 'cost' ? (
            <>
              <div className="chips chips--tight" role="radiogroup" aria-label="Home price">
                {presets.map(([v, l]) => (
                  <button key={v} type="button" role="radio" aria-checked={price === v} className={`chip ${price === v ? 'is-on' : ''}`} onClick={() => setPrice(v)}>{l}</button>
                ))}
              </div>
              <label className="tile__slider">
                <span>Home price {fmtMoney(price)}</span>
                <input className="range" type="range" min={500000} max={3000000} step={25000} value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ '--pct': `${pricePct}%` }} aria-label="Home price" />
              </label>
              <p className="tile__big" aria-live="polite">{fmtMoney(pay)}<small>/mo</small></p>
            </>
          ) : (
            <>
              <label className="tile__slider">
                <span>Comfortable monthly payment {fmtMoney(budget)}</span>
                <input className="range" type="range" min={2000} max={15000} step={100} value={budget} onChange={(e) => setBudget(Number(e.target.value))} style={{ '--pct': `${budgetPct}%` }} aria-label="Monthly budget" />
              </label>
              <p className="tile__big" aria-live="polite"><small className="tile__pre">Homes up to</small>{fmtMoney(Math.round(maxPrice / 5000) * 5000)}</p>
            </>
          )}

          <div className="seg seg--small" role="radiogroup" aria-label="Down payment">
            {[10, 20, 30].map((d) => (
              <button key={d} type="button" role="radio" aria-checked={down === d} className={down === d ? 'is-on' : ''} onClick={() => setDown(d)}>{d}% down</button>
            ))}
          </div>
          <p className="tile__fine">{rate}% {term}-year fixed, property tax, insurance, and an HOA allowance included. Example only, not a loan offer.</p>
          <Link className="textlink" to="/tools#payment">Open the full calculator</Link>
        </div>
      )}
    </div>
  );
}

function RentTile() {
  const rows = useMemo(() => model({ rent: 4200, price: 1100000, down: 20, rate: 6.5, appreciation: 3, rentGrowth: 3, invest: 5 }), []);
  const W = 300, H = 120;
  const vals = rows.flatMap((r) => [r.buy, r.rent]);
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const pt = (r, k, i) => `${(i / (rows.length - 1)) * W},${H - ((r[k] - lo) / (hi - lo)) * H}`;
  return (
    <Link to="/tools#rent-or-buy" className="tile tile--rent">
      <p className="tile__label">Rent or buy</p>
      <h3>Where do the lines cross for you?</h3>
      <p className="tile__verdict">{(() => {
        const cross = rows.find((r) => r.buy < r.rent);
        return cross
          ? `Example: $4,200 rent against a $1.1M home. Buying pulls ahead in year ${cross.y}.`
          : `Example: $4,200 rent against a $1.1M home. Renting stays cheaper for ${rows.length} years. Your numbers may differ.`;
      })()}</p>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" preserveAspectRatio="none">
        <polyline points={rows.map((r, i) => pt(r, 'rent', i)).join(' ')} className="rvb__rent" />
        <polyline points={rows.map((r, i) => pt(r, 'buy', i)).join(' ')} className="rvb__buy" />
      </svg>
      <span className="textlink">Run your numbers</span>
    </Link>
  );
}

function MatchTile() {
  const [pick, setPick] = useState(null);
  const q = QUESTIONS[0];
  const top = pick ? score([pick]).slice(0, 1)[0].n : null;
  return (
    <div className="tile tile--match">
      <p className="tile__label">Find your neighborhood</p>
      <h3>{q.q}</h3>
      <div className="tile__opts">
        {q.options.map(([label, w]) => (
          <button key={label} className={pick === w ? 'is-on' : ''} onClick={() => setPick(w)}>{label}</button>
        ))}
      </div>
      {!top && <p className="tile__wait">Pick one to see where to start.</p>}
      <div className={`tile__result ${top ? 'is-on' : ''}`} aria-live="polite" hidden={!top}>
        {top && (
          <>
            <Plate scene={top.scene} tone={top.tone} alt="" sun={false} />
            <p>Start with <strong>{top.name}</strong>. <Link to="/tools#match">Take the full quiz</Link></p>
          </>
        )}
      </div>
    </div>
  );
}

function SearchTile() {
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <button className="tile tile--search" onClick={openSearch}>
      <p className="tile__label">Search everything</p>
      <span className="tile__keys" aria-hidden="true"><kbd>{mac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd></span>
      <span className="tile__fake">Try "Seabright" or "septic"</span>
    </button>
  );
}

function ChecklistTile() {
  const done = safeGet('checklist:seller-prep-v1', []).length;
  const total = 9;
  const C = 2 * Math.PI * 34;
  return (
    <Link to="/journal/selling-your-home-the-first-30-days" className="tile tile--check">
      <p className="tile__label">Seller prep checklist</p>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="40" r="34" className="steps__track" />
        <circle cx="40" cy="40" r="34" className="steps__fill" style={{ strokeDasharray: C, strokeDashoffset: C - (C * done) / total }} transform="rotate(-90 40 40)" />
        <text x="40" y="46" textAnchor="middle">{done}/{total}</text>
      </svg>
      <span className="textlink">{done ? 'Pick up where you left off' : 'Start the checklist'}</span>
    </Link>
  );
}

function RatesTile({ active, onPick }) {
  const r = site.sampleRates;
  const date = new Date(`${r.asOf}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="tile tile--rates">
      <p className="tile__label">Sample mortgage rates</p>
      <ul className="rates" role="radiogroup" aria-label="Use a sample rate in the payment estimate">
        {r.rows.map((row, i) => (
          <li key={row.label}>
            <button role="radio" aria-checked={active === i} className={active === i ? 'is-on' : ''} onClick={() => onPick(i)}>
              <span>{row.label}</span>
              <strong>{row.rate}%</strong>
            </button>
          </li>
        ))}
      </ul>
      <p className="tile__fine">Pick a rate to use it in the payment estimate. Samples as of {date}, for general information only. Your rate depends on your lender, income, credit, location, and the property.</p>
    </div>
  );
}

function LinksTile() {
  return (
    <div className="tile tile--links">
      <p className="tile__label">Useful links</p>
      <ul>
        {site.usefulLinks.map((l) => (
          <li key={l.href}><a href={l.href} target="_blank" rel="noreferrer">{l.label}</a></li>
        ))}
      </ul>
    </div>
  );
}

function VideoTile({ id }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="tile tile--video">
      {play ? (
        <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title="Featured video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      ) : (
        <button onClick={() => setPlay(true)} aria-label="Play the featured video">
          <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="tile__play" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default function Bento() {
  const [rateIdx, setRateIdx] = useState(0);
  const row = site.sampleRates.rows[rateIdx];
  return (
    <section className="bento-wrap" aria-labelledby="bento-title">
      <div className="container">
        <h2 id="bento-title" className="bento__title">Run the numbers before you fall in love.</h2>
        <div className="bento">
          <PaymentTile rate={row.rate} term={row.term} />
          <RatesTile active={rateIdx} onPick={setRateIdx} />
          <MatchTile />
          <RentTile />
          {site.featuredVideo && <VideoTile id={site.featuredVideo} />}
          <SearchTile />
          <ChecklistTile />
          <LinksTile />
        </div>
      </div>
    </section>
  );
}
