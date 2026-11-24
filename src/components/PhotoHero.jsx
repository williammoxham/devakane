import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSearch from './HeroSearch.jsx';
import { openContact } from './ContactModal.jsx';
import { photos } from '../data/photos.js';

// The hero: an iconic Santa Cruz sunset, shown as photographed.

export default function PhotoHero() {
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
      <div className="phero__scrim" aria-hidden="true" />


      <div className="phero__body" style={{ transform: `translateY(${scroll * -40}px)` }}>
        <h1>
          <span className="phero__line"><span>Find your</span></span>
          <span className="phero__line"><span>dream home.</span></span>
        </h1>
        <p className="phero__sub">Anyone can learn Santa Cruz. Deva has lived it his whole life.</p>
        <HeroSearch />
      </div>

      <div className="phero__foot">
        <p className="phero__caption">Iconic Santa Cruz sunsets</p>
          <div className="phero__ctas">
            <button type="button" className="btn btn--light" onClick={() => openContact('my home value')}>What’s my home worth?</button>
            <Link className="btn btn--ghost-light" to="/about">Meet Deva</Link>
          </div>
      </div>
      <Link className="phero__credit" to="/credits">Photo: Will Moxham</Link>
    </section>
  );
}
