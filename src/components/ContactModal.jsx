import { useEffect, useRef, useState } from 'react';
import ContactForm from './ContactForm.jsx';
import Plate from './Plate.jsx';
import { site } from '../config/site.js';

// Open from anywhere: openContact('Seabright')
export const openContact = (about = '') => window.dispatchEvent(new CustomEvent('open-contact', { detail: about }));

export default function ContactModal() {
  const ref = useRef(null);
  const [about, setAbout] = useState('');
  const [n, setN] = useState(0); // remount the form each time it opens
  const a = site.agent;

  useEffect(() => {
    const on = (e) => {
      setAbout(e.detail || '');
      setN((x) => x + 1);
      ref.current?.showModal();
      document.documentElement.classList.add('lock');
    };
    window.addEventListener('open-contact', on);
    return () => window.removeEventListener('open-contact', on);
  }, []);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="cmodal"
      aria-labelledby="cmodal-title"
      onClose={() => document.documentElement.classList.remove('lock')}
      onClick={(e) => e.target === ref.current && close()}
    >
      <div className="cmodal__inner">
        <button className="cmodal__x" onClick={close} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <header className="cmodal__head">
          <Plate className="cmodal__img" scene="coast" tone={['#A8CFC6', '#0F2C3A']} photo={a.portrait} alt="" sun={false} />
          <div>
            <h2 id="cmodal-title">Contact {a.name}</h2>
            <p>{a.title}, {a.brokerage}. Or call <a href={a.phoneHref}>{a.phone}</a>.</p>
          </div>
        </header>
        <ContactForm key={n} about={about} onDone={close} compact />
      </div>
    </dialog>
  );
}
