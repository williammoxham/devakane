import { useEffect, useRef, useState } from 'react';
import Plate from '../Plate.jsx';
import { highlights } from '../../data/services.js';
import { useInView, usePrefersReducedMotion } from '../../lib/hooks.js';

const DURATION = 6000;

// Autoplaying gallery with progress pills and a play/pause control.
export default function Highlights() {
  const reduced = usePrefersReducedMotion();
  const [ref, seen] = useInView({ threshold: 0.4 });
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const last = useRef(0);

  const running = playing && seen && !reduced;

  const acc = useRef(0);
  const idx = useRef(0);
  idx.current = i;

  useEffect(() => {
    if (!running) return;
    let raf;
    last.current = performance.now();
    const tick = (t) => {
      acc.current += t - last.current;
      last.current = t;
      if (acc.current >= DURATION) {
        acc.current = 0;
        if (idx.current === highlights.length - 1) {
          setPlaying(false);
          setElapsed(0);
          return;
        }
        setI(idx.current + 1);
      }
      setElapsed(acc.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const goTo = (n) => {
    setI(n);
    acc.current = 0;
    setElapsed(0);
  };

  const toggle = () => {
    if (!playing && i === highlights.length - 1) goTo(0);
    setPlaying(!playing);
  };

  return (
    <section className="hl" ref={ref} aria-roledescription="carousel" aria-label="How Deva works">
      <div className="container">
        <h2 className="hl__title">How a sale comes together</h2>
      </div>
      <div className="hl__viewport">
        <ul className="hl__track" style={{ '--i': i }}>
          {highlights.map((h, n) => (
            <li
              key={h.title}
              className={`hl__slide ${n === i ? 'is-on' : ''}`}
              aria-roledescription="slide"
              aria-label={`${n + 1} of ${highlights.length}`}
              aria-hidden={n !== i}
              onClick={() => n !== i && goTo(n)}
            >
              <Plate scene={h.scene} tone={h.tone} photo={h.photo} width={2000} alt="" />
              <div className="hl__cap">
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="hl__controls">
        <div className="hl__dots" role="tablist" aria-label="Choose a slide">
          {highlights.map((h, n) => (
            <button
              key={h.title}
              role="tab"
              aria-selected={n === i}
              aria-label={h.title}
              className={n === i ? 'is-on' : ''}
              onClick={() => goTo(n)}
            >
              <i style={{ transform: `scaleX(${n === i ? (reduced ? 1 : elapsed / DURATION) : n < i ? 1 : 0})` }} />
            </button>
          ))}
        </div>
        <button className="hl__play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="1" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" /></svg>
          )}
        </button>
      </div>
    </section>
  );
}
