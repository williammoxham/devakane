import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { areas, county, areaSources } from '../../data/areas.js';
import { neighborhoods, bySlug } from '../../data/neighborhoods.js';
import { openContact } from '../ContactModal.jsx';
import { fmtMoney, usePrefersReducedMotion } from '../../lib/hooks.js';

const num = (n) => n.toLocaleString('en-US');
const short = (n) => (n >= 1e6 ? `$${(n / 1e6).toFixed(2)}M` : `$${Math.round(n / 1000)}K`);

// The info bubble that rises from a pin. On phones it docks to the bottom of the map.
function Bubble({ slug, onClose, innerRef }) {
  const a = areas[slug];
  const n = bySlug[slug];
  return (
    <article className="bubble" ref={innerRef} role="dialog" aria-label={`${n.name} details`}>
      <div className="bubble__media">
        {n.photo && <img src={n.photo.src(1200)} alt={n.photo.title || n.name} style={{ objectPosition: n.photo.focus }} />}
        <div className="bubble__shade" />
        <button type="button" className="bubble__x" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="bubble__title">
          <p>{n.area}</p>
          <h3>{n.name}</h3>
        </div>
      </div>
      <div className="bubble__body">
        <p className="bubble__lede">{n.line}</p>
        <dl className="bubble__stats">
          <div>
            <dt>Home value</dt>
            <dd>{short(a.homeValue.value)}{a.homeValue.change != null && <em className={a.homeValue.change >= 0 ? 'is-up' : 'is-down'}>{a.homeValue.change >= 0 ? '+' : ''}{a.homeValue.change}%</em>}</dd>
            <span>{a.homeValue.note}</span>
          </div>
          <div>
            <dt>Rent</dt>
            <dd>{fmtMoney(a.rent.value)}<small>/mo</small></dd>
            <span>{a.rent.note}</span>
          </div>
          <div>
            <dt>Population</dt>
            <dd>{num(a.population.value)}</dd>
            <span>{a.population.note}</span>
          </div>
        </dl>
        <div className="bubble__cols">
          <section>
            <h4>Public schools</h4>
            <p className="bubble__district">{a.schools.district}</p>
            <ul>{a.schools.names.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
          <section>
            <h4>Good to know</h4>
            <ul>{a.facts.map((f) => <li key={f}>{f}</li>)}</ul>
          </section>
        </div>
        <p className="bubble__about">{n.body}</p>
        <div className="bubble__tags">{n.tags.map((t) => <span key={t}>{t}</span>)}</div>
        <div className="bubble__ctas">
          <button type="button" className="btn btn--dark" onClick={() => openContact(n.name)}>Ask Deva about {n.name}</button>
          <Link className="textlink" to={`/neighborhoods#${slug}`}>Full guide</Link>
        </div>
        <p className="bubble__fine">School boundaries vary by address. Figures are the latest public data for the area named.</p>
      </div>
    </article>
  );
}

// Scale bar lengths that read cleanly.
const NICE = [0.25, 0.5, 1, 2, 5, 10, 20];

// Loading: survey contour rings that draw themselves and turn, with the real build progress.
// Everything animates with transforms and opacity so it stays smooth while the map is computed.
function MapLoader({ progress, label, done }) {
  const rings = [
    'M50 14 C70 12 88 28 86 50 C85 70 68 88 48 86 C28 84 12 68 14 48 C16 30 32 15 50 14 Z',
    'M50 24 C65 22 77 34 76 50 C75 65 63 77 49 76 C34 75 23 63 24 49 C25 35 36 25 50 24 Z',
    'M51 34 C61 33 67 41 66 51 C65 60 58 66 49 66 C40 65 34 58 35 49 C36 40 42 34 51 34 Z',
    'M50 43 C55 43 58 47 57 51 C57 56 53 58 49 57 C45 57 42 53 43 49 C44 45 46 43 50 43 Z',
  ];
  return (
    <div className={`mload ${done ? 'is-done' : ''}`} role="status" aria-live="polite" aria-hidden={done}>
      <svg className="mload__mark" viewBox="0 0 100 100" aria-hidden="true">
        <g className="mload__grid">
          {[20, 35, 50, 65, 80].map((v) => <g key={v}><line x1={v} y1="4" x2={v} y2="96" /><line x1="4" y1={v} x2="96" y2={v} /></g>)}
        </g>
        {rings.map((d, i) => (
          <g key={i} className="mload__ring" style={{ '--i': i }}>
            <path d={d} pathLength="1" />
          </g>
        ))}
        <g className="mload__sweep"><line x1="50" y1="50" x2="50" y2="3" /></g>
        <circle cx="50" cy="50" r="1.8" className="mload__pin" />
      </svg>
      <p className="mload__label">{label || 'Drafting the county'}</p>
      <div className="mload__bar"><i style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} /></div>
      <p className="mload__pct">{Math.round(progress * 100)}%</p>
    </div>
  );
}

export default function CountyMap() {
  const box = useRef(null);
  const stage = useRef(null);
  const api = useRef(null);
  const bubble = useRef(null);
  const tail = useRef(null);
  const arrow = useRef(null);
  const scale = useRef(null);
  const scaleKm = useRef(0);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [source, setSource] = useState('model');
  const [load, setLoad] = useState({ p: 0, label: '' }); // real elevation data, or the spot-elevation model
  const [sel, setSel] = useState(null);
  const selRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  const data = useMemo(
    () => Object.fromEntries(Object.entries(areas).map(([s, a]) => [s, { ...a, name: bySlug[s].name }])),
    []
  );

  // Every frame: keep the bubble glued to its pin, turn the north arrow, size the scale bar.
  const place = () => {
    const m = api.current;
    if (!m) return;
    if (m.north && arrow.current) arrow.current.style.transform = `rotate(${m.north()}deg)`;
    if (m.pxPerKm && scale.current) {
      const px = m.pxPerKm();
      const km = NICE.find((k) => k * px >= 70) || NICE[NICE.length - 1];
      scale.current.style.width = `${Math.round(km * px)}px`;
      if (scaleKm.current !== km) {
        scaleKm.current = km;
        scale.current.dataset.km = km < 1 ? `${km * 1000} m` : `${km} km`;
      }
    }
    const el = bubble.current, s = selRef.current;
    if (!el || !s || window.innerWidth < 700) return;
    const pt = m.screenOf(s);
    if (!pt) return;
    const W = stage.current.clientWidth, H = stage.current.clientHeight;
    const bw = el.offsetWidth, bh = el.offsetHeight;
    const gap = 90; // clear the name label
    const right = pt.x + gap + bw <= W - 16;
    const x = right ? pt.x + gap : Math.max(16, pt.x - gap - bw);
    const y = Math.max(84, Math.min(H - bh - 84, pt.y - bh * 0.35)); // clear the top controls and the rail
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (tail.current) {
      const ty = Math.max(y + 30, Math.min(y + bh - 30, pt.y));
      const tx = right ? x - 13 : x + bw - 5;
      tail.current.style.transform = `translate3d(${tx}px, ${ty - 9}px, 0) rotate(${right ? 90 : -90}deg)`;
    }
  };

  const disposed = useRef(false);
  useEffect(() => {
    disposed.current = false;
    const el = box.current;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || api.current) return;
      io.disconnect();
      const test = document.createElement('canvas');
      if (!(test.getContext('webgl2') || test.getContext('webgl'))) { setState('error'); return; }
      try {
        const { createMap } = await import('./scene.js');
        if (disposed.current) return;
        const m = await createMap(el, {
          areas: data,
          reducedMotion: reduced,
          onSelect: (s) => { selRef.current = s; setSel(s); },
          onFrame: place,
          onProgress: (p, label) => setLoad({ p, label }),
          onReady: ({ terrain }) => { setSource(terrain); setState('ready'); },
        });
        if (disposed.current) { m.dispose(); return; }
        api.current = m;
      } catch {
        setState('error');
      }
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => { disposed.current = true; io.disconnect(); api.current?.dispose(); api.current = null; };
  }, []);

  useLayoutEffect(place, [sel]);

  const pick = (slug) => { api.current?.select(slug); };
  const close = () => pick(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && selRef.current) close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const drawing = true;

  return (
    <section className="map3d" aria-labelledby="map3d-title">
      <div className="map3d__head container">
        <h2 id="map3d-title">Explore Santa Cruz County</h2>
        <p className="map3d__how map3d__how--fine">Drag to turn the county, scroll or pinch to zoom, and tap a neighborhood to see what life there costs.</p>
        <p className="map3d__how map3d__how--touch">One finger turns the county, pinch to zoom, two fingers move the map. Tap a neighborhood to see what life there costs.</p>
      </div>

      <div className={`map3d__stage ${sel ? 'has-sel' : ''} is-draw`} ref={stage}>
        <div className="map3d__canvas" ref={box} role="application" aria-label="3D map of Santa Cruz County. Use the neighborhood buttons below the map to explore." />
        {state === 'error'
          ? <div className="map3d__status">This device cannot show the 3D map. Use the neighborhood buttons below.</div>
          : <MapLoader progress={state === 'ready' ? 1 : load.p} label={state === 'ready' ? 'Ready' : load.label} done={state === 'ready'} />}

        {!sel && state === 'ready' && (
          <div className="mcard">
            <p className="mcard__eyebrow">Santa Cruz County, California</p>
            <div className="mcard__stats">
              <div><strong>{num(county.population.value)}</strong><span>residents</span></div>
              <div><strong>{short(county.homeValue.value)}</strong><span>typical home</span></div>
              <div><strong>{fmtMoney(county.rent.value)}</strong><span>average rent</span></div>
            </div>
            {drawing && (
              <div className="mcard__legend">
                <span><i className="lg lg--contour" />Contours every 50 m</span>
                <span><i className="lg lg--border" />County line</span>
                <span><i className="lg lg--road" />Highways 1 and 17</span>
                <span><i className="lg lg--river" />San Lorenzo River</span>
              </div>
            )}
            <p className="mcard__fine">
              {source === 'real' ? 'USGS elevation, heights drawn 3x. ' : 'Terrain modeled from known elevations, heights drawn 3x. '}2020 Census, Zillow. Tap a neighborhood for local numbers.
            </p>
          </div>
        )}

        {drawing && state === 'ready' && (
          <>
            <div className="map3d__tools" role="group" aria-label="Map controls">
              <button type="button" onClick={() => api.current.zoomIn()} aria-label="Zoom in">+</button>
              <button type="button" onClick={() => api.current.zoomOut()} aria-label="Zoom out">−</button>
            </div>
            <svg className="map3d__north" viewBox="0 0 48 48" aria-label="North arrow">
              <g ref={arrow} style={{ transformOrigin: '24px 24px' }}>
                <circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M24 6 L29 26 L24 23 L19 26 Z" fill="currentColor" />
                <path d="M24 42 L29 22 L24 25 L19 22 Z" fill="none" stroke="currentColor" strokeWidth="1" />
                <text x="24" y="4.5" textAnchor="middle" fontSize="7" fill="currentColor">N</text>
              </g>
            </svg>
            <div className="map3d__scale" aria-hidden="true"><span ref={scale} data-km="1 km" /></div>
          </>
        )}

        {sel && (
          <>
            <i className="bubble__tail" ref={tail} aria-hidden="true" />
            <Bubble key={sel} slug={sel} onClose={close} innerRef={bubble} />
          </>
        )}

        <nav className="mrail" aria-label="Neighborhoods">
          <button type="button" className={!sel ? 'is-on' : ''} onClick={close}>Whole county</button>
          {neighborhoods.map((n) => (
            <button key={n.slug} type="button" className={sel === n.slug ? 'is-on' : ''} onClick={() => pick(n.slug)}>{n.name}</button>
          ))}
        </nav>
      </div>

      <p className="map3d__sources container">
        {source === 'real'
          ? 'Drawing: county boundary from the U.S. Census atlas; elevation from USGS and SRTM data via Mapzen Terrain Tiles on AWS. '
          : 'Drawing: county boundary from the U.S. Census atlas; terrain modeled from known peak, valley and town elevations. '}
        Data:{' '}
        {areaSources.map((s, i) => (
          <span key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>{i < areaSources.length - 1 ? ', ' : '.'}</span>
        ))}
      </p>
    </section>
  );
}
