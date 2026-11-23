import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Apple-style secondary bar: page title on the left, section links and one action on the right.
// Pass revealAfter (px) to keep it hidden until the reader scrolls past the page header.
export default function LocalNav({ title, links = [], cta, revealAfter = 0 }) {
  const [shown, setShown] = useState(revealAfter === 0);
  const [active, setActive] = useState(links[0]?.id);

  useEffect(() => {
    if (!revealAfter) return;
    const on = () => setShown(window.scrollY > revealAfter);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [revealAfter]);

  useEffect(() => {
    if (!links.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' }
    );
    links.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [links.map((l) => l.id).join()]);

  const jump = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`lnav ${shown ? 'is-shown' : ''}`} aria-hidden={!shown}>
      <div className="lnav__inner">
        <p className="lnav__title">{title}</p>
        {links.length > 0 && (
          <nav className="lnav__links" aria-label="On this page">
            {links.map((l) => (
              <a key={l.id} href={`#${l.id}`} className={active === l.id ? 'is-on' : ''} onClick={(e) => jump(e, l.id)} tabIndex={shown ? 0 : -1}>
                {l.label}
              </a>
            ))}
          </nav>
        )}
        {cta && (cta.to ? (
          <Link className="lnav__cta" to={cta.to} tabIndex={shown ? 0 : -1}>{cta.label}</Link>
        ) : (
          <button className="lnav__cta" onClick={cta.onClick} tabIndex={shown ? 0 : -1}>{cta.label}</button>
        ))}
      </div>
    </div>
  );
}
