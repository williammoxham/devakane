import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { headshotCloseUp } from '../../data/photos.js';
import { openContact } from '../ContactModal.jsx';
import { site } from '../../config/site.js';
import { useInView } from '../../lib/hooks.js';

// Meet Deva: one full-width block, split evenly.
// Left half is the portrait, edge to edge, drifting slightly as you scroll.
// Right half is everything you need to know and how to reach him.
export default function MeetDeva() {
  const a = site.agent;
  const [ref, seen] = useInView({ threshold: 0.2 });
  const photo = useRef(null);
  const [shift, setShift] = useState(0);
  const socials = Object.entries(site.social).filter(([, url]) => url);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = photo.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // -1 as the block enters from below, 0 centered, 1 as it leaves at the top
        const t = (vh / 2 - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
        setShift(Math.max(-1, Math.min(1, t)));
      });
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className={`mdv ${seen ? 'is-in' : ''}`} ref={ref} aria-labelledby="meet-title">
      <div className="mdv__photo" ref={photo}>
        <img
          src={headshotCloseUp}
          alt={`Portrait of ${a.name}`}
          loading="lazy"
          style={{ transform: `translateY(${shift * 6}%) scale(1.14)` }}
        />
        <span className="mdv__badge" aria-hidden="true">Lifelong Santa Cruz surfer</span>
      </div>

      <div className="mdv__panel">
        <div className="mdv__inner">
          <h2 id="meet-title">Meet {a.name.split(' ')[0]}.</h2>
          <p className="mdv__tagline">{a.tagline}.</p>

          <ul className="mdv__creds">
            <li><span>Realtor</span>{a.brokerage}</li>
            <li><span>Local business owner</span>Partner in <a href={site.business.url} target="_blank" rel="noreferrer">{site.business.name}</a></li>
          </ul>

          <p className="mdv__lede">{site.bio[0]}</p>

          <div className="mdv__ctas">
            <button className="btn mdv__go" onClick={() => openContact()}>Contact Me</button>
            <Link className="mdv__bio" to="/about">Read my story</Link>
          </div>

          <dl className="mdv__facts">
            <div><dt>Direct</dt><dd><a href={a.phoneHref}>{a.phone}</a></dd></div>
            <div><dt>Office</dt><dd><a href={a.officePhoneHref}>{a.officePhone}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${a.email}`}>{a.email}</a></dd></div>
            <div><dt>License</dt><dd>CA DRE #{a.license}</dd></div>
          </dl>

          {socials.length > 0 && (
            <p className="mdv__social">
              Follow me on{' '}
              {socials.map(([name, url], i) => (
                <span key={name}>
                  <a href={url} target="_blank" rel="noreferrer">{name[0].toUpperCase() + name.slice(1)}</a>
                  {i < socials.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
