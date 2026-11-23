import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentCalculator from '../widgets/PaymentCalculator.jsx';
import RentVsBuy from '../widgets/RentVsBuy.jsx';
import NeighborhoodMatch from '../widgets/NeighborhoodMatch.jsx';
import Plate from '../Plate.jsx';
import { safeGet, safeSet } from '../../lib/supabase.js';
import { useScrollProgress } from '../../lib/hooks.js';

export const WIDGETS = { PaymentCalculator, RentVsBuy, NeighborhoodMatch };

export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Steps: a sticky progress rail on the left, steps scroll past on the right.
function Steps({ items }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number(e.target.dataset.i));
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  const pct = ((active + 1) / items.length) * 100;
  return (
    <div className="steps wide">
      <div className="steps__rail" aria-hidden="true">
        <div className="steps__sticky">
          <svg viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" className="steps__track" />
            <circle cx="60" cy="60" r="52" className="steps__fill" style={{ strokeDashoffset: 327 - (327 * pct) / 100 }} />
          </svg>
          <span className="steps__num">{active + 1}<small>/{items.length}</small></span>
          <span className="steps__when">{items[active].when}</span>
        </div>
      </div>
      <ol className="steps__list">
        {items.map((s, i) => (
          <li key={s.title} data-i={i} ref={(el) => (refs.current[i] = el)} className={i === active ? 'is-active' : ''}>
            <span className="steps__when-inline">{s.when}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Checklist({ id, items }) {
  const key = `checklist:${id}`;
  const [done, setDone] = useState(() => safeGet(key, []));
  useEffect(() => safeSet(key, done), [key, done]);
  const toggle = (i) => setDone(done.includes(i) ? done.filter((x) => x !== i) : [...done, i]);
  const pct = Math.round((done.length / items.length) * 100);
  return (
    <div className="checklist">
      <div className="checklist__bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Checklist progress">
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="checklist__count">{done.length} of {items.length} done</p>
      <ul>
        {items.map((t, i) => (
          <li key={t}>
            <label className={done.includes(i) ? 'is-done' : ''}>
              <input type="checkbox" checked={done.includes(i)} onChange={() => toggle(i)} />
              <span className="checklist__box" aria-hidden="true" />
              {t}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Pull quote whose ink fills in as it moves up the screen.
function Pull({ text }) {
  const [ref, p] = useScrollProgress('through');
  const fill = Math.min(100, Math.max(0, (p - 0.2) / 0.35 * 100));
  return <blockquote ref={ref} className="pull" style={{ '--fill': `${fill}%` }}>{text}</blockquote>;
}

export default function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    switch (b.type) {
      case 'p':
        return <p key={i}>{b.text}</p>;
      case 'h2':
        return <h2 key={i} id={slugify(b.text)}>{b.text}</h2>;
      case 'list':
        return <ul key={i} className="prose-list">{b.items.map((t) => <li key={t}>{t}</li>)}</ul>;
      case 'quote':
        return <Pull key={i} text={b.text} />;
      case 'callout':
        return (
          <aside key={i} className="callout">
            <strong>{b.title}</strong>
            <p>{b.text}</p>
          </aside>
        );
      case 'link':
        return <p key={i}><Link className="btn btn--dark" to={b.to}>{b.text}</Link></p>;
      case 'figure':
        return (
          <figure key={i} className="wide">
            <Plate scene={b.scene} tone={b.tone} photo={b.photo} alt={b.alt} />
            {b.caption && <figcaption>{b.caption}</figcaption>}
          </figure>
        );
      case 'widget': {
        const W = WIDGETS[b.name];
        return W ? <div key={i} className="wide"><W {...(b.props || {})} /></div> : null;
      }
      case 'steps':
        return <Steps key={i} items={b.items} />;
      case 'checklist':
        return <Checklist key={i} id={b.id} items={b.items} />;
      default:
        return null;
    }
  });
}
