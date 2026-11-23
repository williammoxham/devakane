import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import Plate from '../Plate.jsx';
import { services } from '../../data/services.js';
import { site } from '../../config/site.js';

function Modal({ item, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = ref.current.querySelectorAll('a, button');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    document.documentElement.classList.add('lock');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('lock');
      prev?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="modal" onClick={onClose}>
      <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <p className="modal__eyebrow">{item.eyebrow}</p>
        <h2 id="modal-title">{item.title}</h2>
        <Plate scene={item.scene} tone={item.tone} photo={item.photo} width={1800} alt="" className="modal__plate" />
        {item.body.map((p) => <p key={p} className="modal__p">{p}</p>)}
        <ul className="modal__points">
          {item.points.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <div className="modal__ctas">
          <Link className="btn btn--dark" to={item.cta.to} onClick={onClose}>{item.cta.label}</Link>
          {item.link && <a className="textlink" href={site.brokerage[item.link.key]} target="_blank" rel="noreferrer">{item.link.label}</a>}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Apple-style card gallery: scroll-snapped cards, paddle buttons, and a detail view for each card.
export default function ServiceCards() {
  const scroller = useRef(null);
  const [open, setOpen] = useState(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = scroller.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const page = (dir) => {
    const el = scroller.current;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  const item = services.find((s) => s.id === open);

  return (
    <section className="cards" aria-labelledby="cards-title">
      <div className="container">
        <h2 id="cards-title" className="cards__title">Get to know working with Deva</h2>
      </div>
      <div className="cards__scroller" ref={scroller} onScroll={update}>
        <ul className="cards__list">
          {services.map((s) => (
            <li key={s.id}>
              <button className={`card ${s.dark ? 'card--dark' : ''}`} onClick={() => setOpen(s.id)} aria-haspopup="dialog">
                <Plate scene={s.scene} tone={s.tone} photo={s.photo} alt="" sun={false} />
                <span className="card__text">
                  <span className="card__eyebrow">{s.eyebrow}</span>
                  <span className="card__title">{s.title}</span>
                </span>
                <span className="card__plus" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" /></svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="container paddles">
        <button onClick={() => page(-1)} disabled={edges.start} aria-label="Previous cards">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
        </button>
        <button onClick={() => page(1)} disabled={edges.end} aria-label="Next cards">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
        </button>
      </div>
      {item && <Modal item={item} onClose={() => setOpen(null)} />}
    </section>
  );
}
