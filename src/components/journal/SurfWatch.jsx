import { useEffect, useMemo, useState } from 'react';
import { loadSurf } from '../../lib/surf.js';

const parseLocal = (t) => { const [d, hm] = t.split(' '); const [y, m, day] = d.split('-').map(Number); const [h, mi] = hm.split(':').map(Number); return new Date(y, m - 1, day, h, mi); };
const clock = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const dayName = (d) => d.toLocaleDateString('en-US', { weekday: 'short' });

// Wetsuit guidance from water temperature, the way locals talk about it.
const suit = (f) => (f == null ? null : f < 52 ? '5/4 with booties' : f < 56 ? '4/3, booties optional' : f < 60 ? '4/3' : f < 64 ? '3/2' : 'Spring suit');

// Smooth tide curve between NOAA's highs and lows (cosine interpolation, the standard approximation).
function tideAt(points, t) {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    if (t >= a.at && t <= b.at) {
      const k = (t - a.at) / (b.at - a.at);
      return a.ft + (b.ft - a.ft) * (1 - Math.cos(Math.PI * k)) / 2;
    }
  }
  return null;
}

function TideChart({ tides }) {
  const pts = useMemo(() => tides.map((p) => ({ ...p, at: parseLocal(p.time).getTime() })), [tides]);
  const now = Date.now();
  const narrow = typeof window !== 'undefined' && window.innerWidth < 600;
  const W = narrow ? 400 : 760, H = narrow ? 190 : 170, P = { l: 8, r: 8, t: 30, b: 30 };
  const t0 = Math.max(pts[0].at, now - (narrow ? 2 : 3) * 3600e3), t1 = Math.min(pts[pts.length - 1].at, now + (narrow ? 20 : 33) * 3600e3);
  const lo = Math.min(...pts.map((p) => p.ft)) - 0.6, hi = Math.max(...pts.map((p) => p.ft)) + 0.6;
  const x = (t) => P.l + ((t - t0) / (t1 - t0)) * (W - P.l - P.r);
  const y = (ft) => P.t + (1 - (ft - lo) / (hi - lo)) * (H - P.t - P.b);
  const path = [];
  for (let t = t0; t <= t1; t += 10 * 60e3) { const v = tideAt(pts, t); if (v != null) path.push(`${path.length ? 'L' : 'M'}${x(t).toFixed(1)} ${y(v).toFixed(1)}`); }
  const nowFt = tideAt(pts, now);
  const midnights = [];
  const m = new Date(t0); m.setHours(24, 0, 0, 0);
  for (let t = m.getTime(); t < t1; t += 864e5) midnights.push(t);
  return (
    <svg className="tchart" viewBox={`0 0 ${W} ${H}`} style={{ aspectRatio: `${W} / ${H}` }} role="img" aria-label="Tide height over the next day and a half">
      <line x1={P.l} x2={W - P.r} y1={y(0)} y2={y(0)} className="tchart__zero" />
      {midnights.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={P.t - 10} y2={H - P.b + 4} className="tchart__day" />
          <text x={x(t) + 6} y={P.t - 14} className="tchart__daylbl">{dayName(new Date(t))}</text>
        </g>
      ))}
      <path d={`${path.join(' ')} L${x(t1)} ${H - P.b} L${x(t0)} ${H - P.b} Z`} className="tchart__fill" />
      <path d={path.join(' ')} className="tchart__line" />
      {pts.filter((p) => p.at >= t0 && p.at <= t1).map((p) => (
        <g key={p.time} transform={`translate(${x(p.at)},${y(p.ft)})`}>
          <circle r="3.5" className="tchart__pt" />
          <text y={p.type === 'high' ? -10 : 20} className="tchart__lbl">{clock(new Date(p.at))}, {p.ft} ft</text>
        </g>
      ))}
      {nowFt != null && (
        <g transform={`translate(${x(now)},0)`}>
          <line y1={P.t - 6} y2={H - P.b} className="tchart__now" />
          <circle cy={y(nowFt)} r="5.5" className="tchart__nowpt" />
          <text y={H - 10} className="tchart__nowlbl">Now</text>
        </g>
      )}
    </svg>
  );
}

export default function SurfWatch() {
  const [d, setD] = useState(null);
  const [state, setState] = useState('loading');
  useEffect(() => {
    let live = true;
    loadSurf()
      .then((j) => { if (live) { setD(j); setState('ok'); } })
      .catch(() => live && setState('off'));
    return () => { live = false; };
  }, []);

  const tideNow = useMemo(() => {
    if (!d?.tides?.length) return null;
    const pts = d.tides.map((p) => ({ ...p, at: parseLocal(p.time).getTime() }));
    const now = Date.now();
    const ft = tideAt(pts, now);
    const next = pts.find((p) => p.at > now);
    return next ? { ft, next, rising: next.type === 'high' } : null;
  }, [d]);

  const w = d?.waves, water = d?.water, wx = d?.weather;
  const dash = state === 'loading' ? '…' : '–';
  // Once loaded, a missing reading says why instead of showing a bare dash.
  const missing = (what) => (state === 'loading' ? what : 'Offshore buoy not reporting right now');

  return (
    <div className="sw">
      <div className="container">
        <div className="sw__head">
          <div>
            <h2>Surf Watch</h2>
            <p>Live ocean conditions off Santa Cruz from NOAA buoys and tide gauges, refreshed every 20 minutes.</p>
          </div>
          {state === 'ok' && <span className="sw__stamp"><i aria-hidden="true" />Live, updated {clock(new Date(d.updated))}</span>}
        </div>

        <div className="sw__grid">
          <div className="sw__cell">
            <span className="sw__k">Swell at the buoy</span>
            <strong className="sw__v">{w ? <>{w.heightFt}<small>ft</small></> : dash}</strong>
            <span className="sw__s">{w ? `${w.periodS ?? '–'} sec${w.direction ? `, from ${w.direction}` : ''}` : missing('Offshore wave height and period')}</span>
          </div>
          <div className="sw__cell">
            <span className="sw__k">Water</span>
            <strong className="sw__v">{water ? <>{water.tempF}<small>°F</small></> : dash}</strong>
            <span className="sw__s">{water ? suit(water.tempF) : missing('Sea surface temperature')}</span>
          </div>
          <div className="sw__cell">
            <span className="sw__k">Wind and sky</span>
            <strong className="sw__v sw__v--txt">{wx ? `${wx.wind} ${wx.windFrom}` : dash}</strong>
            <span className="sw__s">{wx ? `${wx.sky}, ${wx.tempF}°F on the beach` : 'National Weather Service forecast'}</span>
          </div>
          <div className="sw__cell">
            <span className="sw__k">Tide</span>
            <strong className="sw__v">{tideNow ? <>{tideNow.ft.toFixed(1)}<small>ft {tideNow.rising ? 'rising' : 'falling'}</small></> : dash}</strong>
            <span className="sw__s">{tideNow ? `${tideNow.next.type === 'high' ? 'High' : 'Low'} of ${tideNow.next.ft} ft at ${clock(new Date(tideNow.next.at))}` : 'Santa Cruz tide station'}</span>
          </div>
        </div>

        {d?.tides?.length > 2 && <TideChart tides={d.tides} />}

        {state === 'off' && (
          <p className="sw__off">
            Live conditions could not be reached from this page. See the{' '}
            <a href="https://tidesandcurrents.noaa.gov/noaatidepredictions.html?id=9413745" target="_blank" rel="noreferrer">NOAA tide predictions for Santa Cruz</a> and the{' '}
            <a href="https://www.ndbc.noaa.gov/station_page.php?station=46236" target="_blank" rel="noreferrer">Monterey Canyon buoy</a>.
          </p>
        )}
        {state === 'ok' && (
          <p className="sw__src">
            {d.buoy ? <>Swell and water: NDBC {d.buoy.name} ({d.buoy.id}), measured offshore, so breaking waves in town are usually smaller. </> : <>Swell: the offshore buoys are not reporting at the moment, so check the cams below. </>}
            Tide: NOAA station {d.tideStation.id}. Wind: National Weather Service.
          </p>
        )}
      </div>
    </div>
  );
}
