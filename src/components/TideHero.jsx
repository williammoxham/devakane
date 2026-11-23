import { useEffect, useMemo, useState } from 'react';
import { usePacificTime } from '../lib/hooks.js';
import { site } from '../config/site.js';
import HeroSearch from './HeroSearch.jsx';

// The sky over the bay follows the actual time in Santa Cruz.
// Add ?hour=18.5 to the URL to preview any time of day.
import { skyAt, lerpC, lum, bodyAt, fmtHour } from '../lib/sky.js';

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

function wave(amp, len, y, w = 2880, h = 420) {
  let d = `M0 ${y}`;
  for (let x = 0, up = true; x < w; x += len / 2, up = !up) {
    d += ` Q${x + len / 4} ${up ? y - amp : y + amp} ${x + len / 2} ${y}`;
  }
  return `${d} L${w} ${h} L0 ${h} Z`;
}

export default function TideHero() {
  const now = usePacificTime();
  const override = useMemo(() => {
    const v = new URLSearchParams(window.location.search).get('hour');
    return v !== null && !Number.isNaN(Number(v)) ? Math.min(23.99, Math.max(0, Number(v))) : null;
  }, []);
  const h = override ?? now.decimal;
  const sky = skyAt(h);
  const dark = lum(sky.top) < 0.42;

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
    document.documentElement.dataset.hero = dark ? 'dark' : 'light';
    return () => delete document.documentElement.dataset.hero;
  }, [dark]);

  // Sun travels an arc from 6:30 to 19:30. Moon takes the night shift.
  const { day, x: bodyX, y: bodyY } = bodyAt(h);

  const timeLabel = fmtHour(h);

  const seaLight = lerpC(sky.sea, sky.bot, 0.5);
  const seaDeep = lerpC(sky.sea, '#000000', 0.25);

  return (
    <section
      className={`tide ${dark ? 'tide--dark' : 'tide--light'}`}
      style={{
        '--sky-top': sky.top,
        '--sky-bot': sky.bot,
        '--sea': sky.sea,
        // Apple-style zoom out: the scene shrinks into a card as you scroll past it.
        transform: `scale(${1 - Math.max(0, scroll - 0.15) * 0.1})`,
        borderRadius: `${Math.max(0, scroll - 0.15) * 48}px`,
      }}
      aria-label="Introduction"
    >
      <div className="tide__sky" />
      <div
        className={`tide__body ${day ? 'is-sun' : 'is-moon'}`}
        style={{ left: `${bodyX}%`, top: `${bodyY}%`, transform: `translate(-50%, ${scroll * 40}px)` }}
        aria-hidden="true"
      />
      <div className="tide__fog" style={{ opacity: sky.fog }} aria-hidden="true" />

      <p className="tide__clock">
        <span className="tide__dot" aria-hidden="true" />
        {timeLabel} in Santa Cruz. {phase(h)}.
      </p>

      <div className="tide__waves tide__waves--back" style={{ transform: `translateY(${-scroll * 30}px)`, boxShadow: `0 200px 0 0 ${seaLight}` }} aria-hidden="true">
        <svg viewBox="0 0 2880 420" preserveAspectRatio="none"><path d={wave(14, 480, 120)} fill={seaLight} /></svg>
      </div>

      <div className="tide__waves tide__waves--mid" style={{ transform: `translateY(${-scroll * 70}px)`, boxShadow: `0 200px 0 0 ${sky.sea}` }} aria-hidden="true">
        <svg viewBox="0 0 2880 420" preserveAspectRatio="none"><path d={wave(18, 720, 150)} fill={sky.sea} /></svg>
      </div>

      <div className="tide__title" style={{ transform: `translateY(${scroll * 26}vh)` }}>
        <h1>
          <span className="tide__line">Find your</span>
          <span className="tide__line">dream home.</span>
        </h1>
      </div>
      <div className="tide__waves tide__waves--front" style={{ transform: `translateY(${-scroll * 120}px)`, boxShadow: `0 200px 0 0 ${seaDeep}` }} aria-hidden="true">
        <svg viewBox="0 0 2880 420" preserveAspectRatio="none"><path d={wave(22, 960, 190)} fill={seaDeep} /></svg>
      </div>

      <div className="tide__foot">
        <HeroSearch />
      </div>
    </section>
  );
}
