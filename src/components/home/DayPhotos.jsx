import { Link } from 'react-router-dom';
import { useScrollProgress, usePrefersReducedMotion } from '../../lib/hooks.js';
import { skyAt, fmtHour } from '../../lib/sky.js';
import { photos, own } from '../../data/photos.js';

// One pinned scene: scrolling moves the clock through a day in Santa Cruz,
// crossfading real photos and grading them to the hour.
const STAGES = [
  { hour: 7, label: 'Morning', photo: own.bluffMorning, title: 'Mornings start under the marine layer.', text: 'Cool and gray down by the water. Climb a few hundred feet and you are often above it.' },
  { hour: 11, label: 'Late morning', photo: photos['downtown-midtown'], title: 'Downtown wakes up.', text: 'Coffee, bookstores, and the farmers market, all within a few blocks of Pacific Avenue.' },
  { hour: 14.5, label: 'Afternoon', photo: own.northCoast, title: 'Afternoons belong to the water.', text: 'Surf checks, long beach walks, and a breeze that keeps the heat away.' },
  { hour: 18, label: 'Golden hour', photo: own.davenportSunset, title: 'Then the bay turns gold.', text: 'Every west-facing window in the county earns its keep at this hour.' },
  { hour: 19.5, label: 'Evening', photo: own.cliffSunset, title: 'And the sky puts on a show.', text: 'Every hour looks different here. So does every neighborhood.' },
];

export default function DayPhotos() {
  const [ref, p] = useScrollProgress('pinned');
  const reduced = usePrefersReducedMotion();
  const n = STAGES.length;
  const i = Math.min(n - 1, Math.floor(p * n));
  const local = p * n - i;
  const st = STAGES[i];
  const next = STAGES[Math.min(n - 1, i + 1)];
  const hour = st.hour + (next.hour - st.hour) * Math.min(1, local);
  const sky = skyAt(hour);

  const jump = (k) => {
    const el = ref.current;
    if (!el) return;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + total * ((k + 0.15) / n), behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section className="dayp" ref={ref} style={{ height: `${n * 90 + 100}vh` }} aria-label="A day in Santa Cruz">
      <div className="dayp__sticky">
        {STAGES.map((s, k) => (
          <div key={s.label} className={`dayp__frame ${k === i ? 'is-on' : ''}`} aria-hidden={k !== i}>
            <img
              src={s.photo.src(2000)}
              alt=""
              loading={k < 2 ? 'eager' : 'lazy'}
              style={{ objectPosition: s.photo.focus, transform: `scale(${1.06 - (k === i ? local : 0) * 0.06})` }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        ))}
        <div className="dayp__grade" style={{ background: `linear-gradient(180deg, ${sky.top}, ${sky.bot})` }} aria-hidden="true" />
        <div className="dayp__scrim" aria-hidden="true" />

        <Link className="dayp__credit" to="/credits">{st.photo.title}</Link>

        <div className="dayp__copy" aria-live="polite">
          <p className="dayp__clock">{fmtHour(hour)}</p>
          <h2 key={st.title}>{st.title}</h2>
          <p key={st.text}>{st.text}</p>
        </div>

        <div className="dayp__track">
          <i style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
          {STAGES.map((s, k) => (
            <button
              key={s.label}
              style={{ left: `${(k / (n - 1)) * 100}%` }}
              className={k <= i ? 'is-past' : ''}
              onClick={() => jump(k)}
              aria-label={`Jump to ${s.label}`}
            >
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
