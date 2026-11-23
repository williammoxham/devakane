import { useEffect, useRef, useState } from 'react';
import { stats, priceSeries, marketAsOf } from '../../data/market.js';
import { useInView, usePrefersReducedMotion, fmtMoney } from '../../lib/hooks.js';

const fmt = (v, f) => (f === 'money' ? `$${(v / 1e6).toFixed(2)}M` : f === 'pct' ? `+${v.toFixed(1)}%` : Math.round(v).toLocaleString('en-US'));

// Counts up once when it scrolls into view.
function CountUp({ value, format, run }) {
  const reduced = usePrefersReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reduced) { setV(value); return; }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 1600);
      setV(value * (1 - Math.pow(1 - k, 4)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, value, reduced]);
  return <>{fmt(format === 'pct' ? v : Math.round(v), format)}</>;
}

const monthName = (ym) => new Date(`${ym}-15T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

// Median listing price over the last year. Hover or drag to read any month.
function PriceChart({ run }) {
  const box = useRef(null);
  const [w, setW] = useState(800);
  const [i, setI] = useState(priceSeries.points.length - 1);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const H = 260, P = 24;
  const pts = priceSeries.points;
  const vals = pts.map((p) => p[1]);
  const lo = Math.min(...vals) * 0.97, hi = Math.max(...vals) * 1.02;
  const x = (k) => P + (k / (pts.length - 1)) * (w - 2 * P);
  const y = (v) => H - P - ((v - lo) / (hi - lo)) * (H - 2 * P);
  const line = pts.map((p, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(' ');
  const area = `${line} L${x(pts.length - 1)} ${H - P} L${x(0)} ${H - P} Z`;
  const pick = (clientX) => {
    const r = box.current.getBoundingClientRect();
    const k = Math.round(((clientX - r.left - P) / (w - 2 * P)) * (pts.length - 1));
    setI(Math.max(0, Math.min(pts.length - 1, k)));
  };
  const first = vals[0], cur = vals[i];
  const change = ((cur - first) / first) * 100;

  return (
    <figure className="mchart">
      <figcaption className="mchart__read" aria-live="polite">
        <span>Median listing price, {monthName(pts[i][0])}</span>
        <strong>{fmtMoney(cur)}</strong>
        <em className={change >= 0 ? 'is-up' : 'is-down'}>{change >= 0 ? '+' : ''}{change.toFixed(1)}% since {monthName(pts[0][0])}</em>
      </figcaption>
      <div
        className="mchart__plot"
        ref={box}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        tabIndex={0}
        role="slider"
        aria-label="Month"
        aria-valuemin={0}
        aria-valuemax={pts.length - 1}
        aria-valuenow={i}
        aria-valuetext={`${monthName(pts[i][0])}: ${fmtMoney(cur)}`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setI((k) => Math.max(0, k - 1));
          if (e.key === 'ArrowRight') setI((k) => Math.min(pts.length - 1, k + 1));
        }}
      >
        <svg width={w} height={H} aria-hidden="true">
          <defs>
            <linearGradient id="mfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d9b48f" stopOpacity="0.35" />
              <stop offset="1" stopColor="#d9b48f" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#mfill)" className={run ? 'mchart__area is-in' : 'mchart__area'} />
          <path d={line} className={run ? 'mchart__line is-in' : 'mchart__line'} pathLength="1" />
          <line x1={x(i)} x2={x(i)} y1={P - 8} y2={H - P} className="mchart__cursor" />
          <circle cx={x(i)} cy={y(cur)} r="6" className="mchart__dot" />
        </svg>
        <div className="mchart__axis" aria-hidden="true">
          <span>{monthName(pts[0][0])}</span>
          <span>{monthName(pts[pts.length - 1][0])}</span>
        </div>
      </div>
    </figure>
  );
}

export default function Market() {
  const [ref, seen] = useInView({ threshold: 0.2 });
  return (
    <section className="market" ref={ref} aria-labelledby="market-title">
      <div className="container">
        <div className="market__head">
          <h2 id="market-title">The Santa Cruz market, in numbers.</h2>
          <p>Where prices and sales stand right now. Updated {marketAsOf}.</p>
        </div>
        <ul className="market__stats">
          {stats.map((s) => (
            <li key={s.label}>
              <strong><CountUp value={s.value} format={s.format} run={seen} /></strong>
              <span className="market__label">{s.label}</span>
              <p>{s.detail}</p>
              <a href={s.url} target="_blank" rel="noreferrer">{s.source}</a>
            </li>
          ))}
        </ul>
        <PriceChart run={seen} />
        <p className="market__note">
          Chart: <a href={priceSeries.url} target="_blank" rel="noreferrer">{priceSeries.source}</a>. Figures cover different areas and periods; see each source. Ask Deva for numbers on your street.
        </p>
      </div>
    </section>
  );
}
