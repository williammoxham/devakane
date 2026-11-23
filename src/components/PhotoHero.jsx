import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSearch from './HeroSearch.jsx';
import { usePacificTime } from '../lib/hooks.js';
import { skyAt, nightAt, fmtHour } from '../lib/sky.js';
import { photos } from '../data/photos.js';

// Steamer Lane, color-graded to the actual time of day in Santa Cruz.
// Add ?hour=18.5 to the URL to preview any hour.

function phase(h) {
  if (h < 5) return 'Late night';
  if (h < 7) return 'First light';
  if (h < 11) return 'Morning';
  if (h < 15) return 'Midday';
  if (h < 17) return 'Afternoon';
  if (h < 19.5) return 'Golden hour';
  if (h < 21) return 'Dusk';
  return 'Evening';
}

export default function PhotoHero() {
  const now = usePacificTime();
  const override = useMemo(() => {
    const v = new URLSearchParams(window.location.search).get('hour');
    return v !== null && !Number.isNaN(Number(v)) ? Math.min(23.99, Math.max(0, Number(v))) : null;
  }, []);
  const h = override ?? now.decimal;
  const sky = skyAt(h);
  const night = nightAt(h);
  const [failed, setFailed] = useState(false);

  const [scroll, setScroll] = useState(0);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScroll(Math.min(1, window.scrollY / window.innerHeight));
      });
    };
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.hero = 'dark';
    return () => delete document.documentElement.dataset.hero;
  }, []);

  const p = Math.max(0, scroll - 0.12);
  const hero = photos.hero;

  return (
    <section
      className="phero"
      aria-label="Find your dream home"
      style={{ transform: `scale(${1 - p * 0.1})`, borderRadius: `${p * 48}px` }}
    >
      <div className="phero__img" style={{ transform: `translateY(${scroll * 12}%) scale(${1 + scroll * 0.08})` }}>
        {!failed && (
          <img
            src={hero.src(2400)}
                        alt="Sunset over the water on the Santa Cruz coast"
            fetchpriority="high"
            style={{ objectPosition: hero.focus }}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <div className="phero__grade" style={{ background: `linear-gradient(180deg, ${sky.top}, ${sky.bot})` }} aria-hidden="true" />
      <div className="phero__night" style={{ opacity: night * 0.55 }} aria-hidden="true" />
      <div className="phero__scrim" aria-hidden="true" />

      <p className="phero__clock">
        <span className="phero__dot" aria-hidden="true" />
        {fmtHour(h)} in Santa Cruz. {phase(h)}.
      </p>

      <div className="phero__body" style={{ transform: `translateY(${scroll * -40}px)` }}>
        <h1>
          <span className="phero__line"><span>Find your</span></span>
          <span className="phero__line"><span>dream home.</span></span>
        </h1>
        <HeroSearch />
      </div>

      <Link className="phero__credit" to="/credits">Photo: Will Moxham</Link>
    </section>
  );
}
