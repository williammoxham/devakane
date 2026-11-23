import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { neighborhoods } from '../data/neighborhoods.js';
import { site } from '../config/site.js';

// Approximate centers, only used to answer "which neighborhood am I near?"
const CENTERS = {
  westside: [36.958, -122.045],
  'downtown-midtown': [36.974, -122.026],
  seabright: [36.965, -122.008],
  'live-oak': [36.975, -121.985],
  'pleasure-point': [36.96, -121.968],
  capitola: [36.975, -121.953],
  soquel: [36.988, -121.957],
  aptos: [36.977, -121.899],
  'scotts-valley': [37.051, -122.015],
  'san-lorenzo-valley': [37.09, -122.09],
  watsonville: [36.91, -121.757],
};

function km([a, b], [c, d]) {
  const r = Math.PI / 180;
  const x = (d - b) * r * Math.cos(((a + c) / 2) * r);
  const y = (c - a) * r;
  return Math.sqrt(x * x + y * y) * 6371;
}

const openMls = () => window.open(site.idxSearchUrl, '_blank', 'noopener');

// The "Find your dream home" search from Deva's current site, rebuilt:
// search by location with suggestions, by drive time, or near me.
export default function HeroSearch() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('location');
  const [q, setQ] = useState('');
  const [focus, setFocus] = useState(false);
  const [sel, setSel] = useState(0);
  const [place, setPlace] = useState('');
  const [minutes, setMinutes] = useState(20);
  const [near, setNear] = useState(null); // { state, text, slug }
  const box = useRef(null);

  const suggestions = useMemo(() => {
    const v = q.trim().toLowerCase();
    if (!v) return [];
    const hoods = neighborhoods
      .filter((n) => `${n.name} ${n.area} ${n.tags.join(' ')}`.toLowerCase().includes(v))
      .slice(0, 4)
      .map((n) => ({ label: n.name, sub: n.area, go: () => navigate(`/neighborhoods#${n.slug}`) }));
    return [...hoods, { label: `Search all homes for "${q.trim()}"`, sub: 'Opens the MLS search', go: openMls }];
  }, [q, navigate]);

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'location' && suggestions[sel]) suggestions[sel].go();
    else openMls();
  };

  const onKey = (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(suggestions.length - 1, s + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
  };

  const findNear = () => {
    if (!navigator.geolocation) {
      setNear({ state: 'error', text: 'Location is not available in this browser.' });
      return;
    }
    setNear({ state: 'busy', text: 'Finding you' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const me = [coords.latitude, coords.longitude];
        const [slug, d] = Object.entries(CENTERS)
          .map(([s, c]) => [s, km(me, c)])
          .sort((a, b) => a[1] - b[1])[0];
        const n = neighborhoods.find((x) => x.slug === slug);
        setNear(
          d < 12
            ? { state: 'ok', text: `You're near ${n.name}.`, slug }
            : { state: 'ok', text: `You're about ${Math.round(d * 0.621)} miles from ${n.name}, the closest area Deva covers.`, slug }
        );
      },
      () => setNear({ state: 'error', text: 'Location was blocked. Search by name instead.' }),
      { timeout: 8000, maximumAge: 600000 }
    );
  };

  return (
    <form className="hsearch" onSubmit={submit} ref={box} role="search" aria-label="Find a home">
      <div className="hsearch__modes" role="radiogroup" aria-label="Search by">
        {[['location', 'Search by location'], ['drive', 'Search by drive time']].map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={mode === v} className={mode === v ? 'is-on' : ''} onClick={() => setMode(v)}>{l}</button>
        ))}
      </div>

      <div className="hsearch__bar">
        {mode === 'location' ? (
          <div className="hsearch__field">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setSel(0); }}
              onFocus={() => setFocus(true)}
              onBlur={() => setTimeout(() => setFocus(false), 150)}
              onKeyDown={onKey}
              placeholder="Neighborhood, city, or ZIP"
              aria-label="Neighborhood, city, or ZIP"
              role="combobox"
              aria-expanded={focus && suggestions.length > 0}
              aria-controls="hsearch-list"
              aria-autocomplete="list"
              aria-activedescendant={focus && suggestions[sel] ? `hs-${sel}` : undefined}
            />
            {focus && suggestions.length > 0 && (
              <ul id="hsearch-list" role="listbox" className="hsearch__list">
                {suggestions.map((s, i) => (
                  <li key={s.label} id={`hs-${i}`} role="option" aria-selected={i === sel} className={i === sel ? 'is-on' : ''} onMouseDown={(e) => { e.preventDefault(); s.go(); }} onMouseEnter={() => setSel(i)}>
                    <strong>{s.label}</strong>
                    <span>{s.sub}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="hsearch__field hsearch__field--drive">
            <label>
              <span className="sr">Minutes</span>
              <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {[10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
              </select>
            </label>
            <span className="hsearch__from">from</span>
            <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Work, school, or the beach" aria-label="Drive to" />
          </div>
        )}
        <button type="submit" className="hsearch__go">Search</button>
      </div>

      <div className="hsearch__near">
        <button type="button" onClick={findNear} disabled={near?.state === 'busy'}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          {near?.state === 'busy' ? 'Finding you' : 'Search near me'}
        </button>
        {near && near.state !== 'busy' && (
          <span className="hsearch__near-out" aria-live="polite">
            {near.text}{' '}
            {near.slug && <button type="button" className="hsearch__link" onClick={() => navigate(`/neighborhoods#${near.slug}`)}>See the area</button>}
          </span>
        )}
      </div>
    </form>
  );
}
