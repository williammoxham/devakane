import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Plate from '../components/Plate.jsx';
import HoverList from '../components/home/HoverList.jsx';
import { neighborhoods, neighborhoodTags, bySlug } from '../data/neighborhoods.js';

// Abstract county outline on a 1000 x 640 canvas. Ocean is below and left of the coast.
const COAST = 'M40 96 C120 170 210 300 300 404 C340 428 380 418 420 414 C470 412 520 440 560 444 C610 452 660 476 700 492 C760 520 790 560 830 640';
const LAND = `${COAST} L1000 640 L1000 0 L0 0 L0 60 Z`;

export default function Neighborhoods() {
  const { hash } = useLocation();
  const [sel, setSel] = useState(neighborhoods[0].slug);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    document.title = 'Neighborhoods | Deva Kane';
  }, []);

  useEffect(() => {
    const s = hash.replace('#', '');
    if (bySlug[s]) {
      setSel(s);
      document.getElementById('map')?.scrollIntoView({ block: 'start' });
    }
  }, [hash]);

  const matches = useMemo(
    () => new Set(neighborhoods.filter((n) => tags.every((t) => n.tags.includes(t))).map((n) => n.slug)),
    [tags]
  );
  const n = bySlug[sel];
  const toggle = (t) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);

  return (
    <div className="page hoods">
      <header className="page__head container">
        <h1>Neighborhoods</h1>
        <p className="lede">From the cliffs of the Westside to the farm fields of the Pajaro Valley. Filter by what matters to you, then pick a spot on the map.</p>
      </header>

      <div className="container">
        <div className="chips" aria-label="Filter neighborhoods">
          {neighborhoodTags.map((t) => (
            <button key={t} className={`chip ${tags.includes(t) ? 'is-on' : ''}`} aria-pressed={tags.includes(t)} onClick={() => toggle(t)}>{t}</button>
          ))}
          {tags.length > 0 && <button className="textbtn" onClick={() => setTags([])}>Clear</button>}
        </div>
        <p className="hoods__count" aria-live="polite">{matches.size} of {neighborhoods.length} match</p>
      </div>

      <section id="map" className="container hoods__stage">
        <div className="map">
          <svg viewBox="0 0 1000 640" role="group" aria-label="Map of Santa Cruz County neighborhoods, not to scale">
            <rect width="1000" height="640" className="map__sea" />
            <path d={LAND} className="map__land" />
            <path d={COAST} className="map__coast" />
            <path d="M380 372 C400 300 430 240 470 120" className="map__road" />
            <text x="482" y="140" className="map__roadlab">Hwy 17</text>
            <text x="120" y="520" className="map__sealab">Monterey Bay</text>
            {[...neighborhoods].sort((a, b) => (a.slug === sel) - (b.slug === sel)).map((h) => {
              const on = matches.has(h.slug);
              const isSel = h.slug === sel;
              return (
                <g
                  key={h.slug}
                  className={`pin ${on ? '' : 'is-dim'} ${isSel ? 'is-sel' : ''}`}
                  transform={`translate(${h.pos[0]} ${h.pos[1]})`}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSel}
                  aria-label={h.name}
                  onClick={() => setSel(h.slug)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setSel(h.slug))}
                >
                  <g className="pin__inner">
                    <circle r={isSel ? 22 : 14} className="pin__halo" />
                    <circle r="7" className="pin__dot" />
                    <text y="-22" textAnchor="middle" className="pin__lab">{h.name}</text>
                  </g>
                </g>
              );
            })}
          </svg>
          <p className="map__note">Not to scale</p>
        </div>

        <aside className="hood" key={n.slug} aria-live="polite">
          <Plate scene={n.scene} tone={n.tone} photo={n.photo} alt={n.name} />
          <div className="hood__body">
            <p className="hood__area">{n.area}</p>
            <h2>{n.name}</h2>
            <p className="hood__line">{n.line}</p>
            <p>{n.body}</p>
            <ul className="tags">{n.tags.map((t) => <li key={t}>{t}</li>)}</ul>
            <Link className="btn btn--dark" to={`/contact?about=${encodeURIComponent(n.name)}`}>Ask Deva about {n.name}</Link>
          </div>
        </aside>
      </section>

      <HoverList />
    </div>
  );
}
