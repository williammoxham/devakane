import { useEffect, useState } from 'react';
import CoastScene from '../CoastScene.jsx';
import { useScrollProgress, usePrefersReducedMotion } from '../../lib/hooks.js';
import { fmtHour } from '../../lib/sky.js';

// One pinned set piece in two acts.
// Act one: the page is paper with "Santa Cruz" cut out of it. Scrolling zooms through the letters.
// Act two: scrolling scrubs a full day over a home on the cliffs, from morning fog to the lighthouse at night.

const CHAPTERS = [
  { from: 0, title: 'Mornings often start under the marine layer.', text: 'Cool, gray, and quiet. Summer on the coast can feel like autumn until lunch.' },
  { from: 10.5, title: 'By midday, the fog usually lifts.', text: 'Neighborhoods a few miles inland often see sun hours earlier than the cliffs.' },
  { from: 14.5, title: 'Afternoons belong to the water.', text: 'Surf checks, dog walks on the bluff, and a breeze that keeps the heat away.' },
  { from: 17.6, title: 'Then the bay turns gold.', text: 'Every west-facing window in the county earns its keep at this hour.' },
  { from: 20.2, title: 'And the lighthouse takes over.', text: 'Every hour looks different here. So does every neighborhood.' },
];

const clamp = (v) => Math.min(1, Math.max(0, v));
const START = 6.6;
const END = 22.5;

function useViewport() {
  const get = () => ({ w: window.innerWidth, h: window.innerHeight });
  const [v, setV] = useState(get);
  useEffect(() => {
    const on = () => setV(get());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return v;
}

export default function DaySection() {
  const [ref, p] = useScrollProgress('pinned');
  const reduced = usePrefersReducedMotion();
  const { w, h } = useViewport();

  const zoomP = clamp(p / 0.26);
  const dayP = clamp((p - 0.3) / 0.68);
  const hour = START + dayP * (END - START);

  const scale = 1 + Math.pow(zoomP, 2.6) * 14;
  const paper = 1 - clamp((zoomP - 0.55) / 0.4);
  const sceneScale = 1.18 - zoomP * 0.18;
  const ch = [...CHAPTERS].reverse().find((c) => hour >= c.from) || CHAPTERS[0];
  const showDay = zoomP > 0.92;

  const portrait = h > w;
  const fs = portrait ? Math.min(w * 0.36, h * 0.2) : Math.min(w * 0.2, h * 0.36);
  const lines = portrait ? ['Santa', 'Cruz'] : ['Santa Cruz'];

  if (reduced) {
    return (
      <section className="day day--static" aria-label="A day in Santa Cruz">
        <CoastScene hour={18} />
        <div className="day__copy is-on"><p className="day__clock">Golden hour</p><h2>{CHAPTERS[3].title}</h2><p>{CHAPTERS[4].text}</p></div>
      </section>
    );
  }

  return (
    <section className="day" ref={ref} aria-label="A day in Santa Cruz">
      <div className="day__sticky">
        <div className="day__scene" style={{ transform: `scale(${sceneScale})` }}>
          <CoastScene hour={hour} viewBox={portrait ? '880 -260 720 1260' : undefined} />
        </div>

        <svg
          className="day__mask"
          viewBox={`0 0 ${w} ${h}`}
          style={{ transform: `scale(${scale})`, opacity: paper, visibility: paper <= 0.001 ? 'hidden' : 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <mask id="day-mask">
              <rect width={w} height={h} fill="#fff" />
              <text x={w / 2} y={h / 2 + fs * (lines.length === 1 ? 0.35 : -0.08)} textAnchor="middle" fontSize={fs} className="day__mask-text" fill="#000">
                {lines.map((l, i) => <tspan key={l} x={w / 2} dy={i ? fs * 0.88 : 0}>{l}</tspan>)}
              </text>
            </mask>
          </defs>
          <rect width={w} height={h} fill="var(--paper)" mask="url(#day-mask)" />
        </svg>

        <p className="day__hint" style={{ opacity: 1 - zoomP * 4 }}>Scroll to step inside</p>

        <div className={`day__copy ${showDay ? 'is-on' : ''}`} aria-live="polite">
          <p className="day__clock">{fmtHour(hour)}</p>
          <h2 key={ch.title}>{ch.title}</h2>
          <p key={ch.text}>{ch.text}</p>
        </div>

        <div className="day__track" aria-hidden="true" style={{ opacity: showDay ? 1 : 0 }}>
          <i style={{ transform: `scaleX(${dayP})` }} />
          <span>Morning</span><span>Noon</span><span>Evening</span><span>Night</span>
        </div>
      </div>
    </section>
  );
}
