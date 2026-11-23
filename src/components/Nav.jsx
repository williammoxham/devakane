import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { site } from '../config/site.js';
import { menus } from '../data/nav.js';
import SearchPanel from './SearchPanel.jsx';
import { openContact } from './ContactModal.jsx';

export const openSearch = () => window.dispatchEvent(new CustomEvent('open-search'));


function MenuLink({ link, onGo }) {
  if (link.action === 'contact') {
    return <button type="button" className="gnav__btnlink" onClick={() => { onGo(); openContact(); }}>{link.label}</button>;
  }
  if (link.href) {
    return <a href={link.href} target="_blank" rel="noreferrer" onClick={onGo}>{link.label}</a>;
  }
  return <Link to={link.to} onClick={onGo}>{link.label}</Link>;
}

export default function Nav() {
  const { pathname, search, hash } = useLocation();
  const [menu, setMenu] = useState(null); // id of the open flyout, or 'search'
  const [mobile, setMobile] = useState(false);
  const [section, setSection] = useState(null);
  const [over, setOver] = useState(pathname === '/');
  const timer = useRef(0);

  const close = () => {
    setMenu(null);
    setMobile(false);
  };

  useEffect(close, [pathname, search, hash]);

  useEffect(() => {
    const onScroll = () => setOver(pathname === '/' && window.scrollY < window.innerHeight * 0.85);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => {
    const onOpen = () => { setMobile(false); setMenu('search'); };
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); onOpen(); }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('open-search', onOpen);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('open-search', onOpen);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('lock', Boolean(menu) || mobile);
  }, [menu, mobile]);

  const hover = (id) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMenu(id), id ? 140 : 220);
  };

  const active = menus.find((m) => m.id === menu);
  const cols = active && active.columns ? active.columns : [];
  const solid = Boolean(menu) || mobile;

  return (
    <>
      <header
        className={`gnav ${over && !solid ? 'gnav--over' : ''} ${solid ? 'gnav--solid' : ''}`}
        onMouseLeave={() => menu !== 'search' && hover(null)}
      >
        <div className="gnav__bar">
          <Link to="/" className="gnav__mark" aria-label={`${site.agent.name}, home`} onMouseEnter={() => menu !== 'search' && hover(null)}>
            <span className="wordmark">
              <span className="wordmark__name">{site.agent.name}</span>
              <span className="wordmark__tag">{site.agent.tagline}</span>
            </span>
          </Link>
          <nav className="gnav__links" aria-label="Main">
            {menus.map((m) => (
              m.columns ? (
                <NavLink
                  key={m.id}
                  to={m.to}
                  className={menu === m.id ? 'is-open' : ''}
                  aria-expanded={menu === m.id}
                  aria-haspopup="true"
                  onMouseEnter={() => hover(m.id)}
                  onFocus={() => setMenu(m.id)}
                >
                  {m.label}
                </NavLink>
              ) : (
                <NavLink key={m.id} to={m.to} onClick={close} onMouseEnter={() => menu !== 'search' && hover(null)} onFocus={() => setMenu(null)}>
                  {m.label}
                </NavLink>
              )
            ))}
          </nav>
          <button className="gnav__icon" aria-label="Search the site" aria-expanded={menu === 'search'} onClick={() => setMenu(menu === 'search' ? null : 'search')} onMouseEnter={() => menu !== 'search' && hover(null)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          </button>
          <button type="button" className="gnav__cta" onClick={() => { close(); openContact(); }}>Contact Me</button>
          <button className="gnav__burger" aria-expanded={mobile} aria-controls="gnav-sheet" onClick={() => { setMenu(null); setMobile(!mobile); }}>
            <span className="sr">{mobile ? 'Close menu' : 'Open menu'}</span>
            <i /><i />
          </button>
        </div>

        <div className={`gnav__flyout ${menu ? 'is-open' : ''}`} onMouseEnter={() => clearTimeout(timer.current)}>
          <div className="gnav__flyout-inner">
            {menu === 'search' && <SearchPanel onClose={close} />}
            {active && (
              <div className="gnav__cols" key={active.id}>
                {cols.map((c, ci) => (
                  <div key={c.title} className={`gnav__col ${c.big ? 'gnav__col--big' : ''}`} style={{ '--d': `${ci * 40}ms` }}>
                    <p>{c.title}</p>
                    <ul>
                      {c.links.map((l, li) => (
                        <li key={l.label} style={{ '--d': `${ci * 40 + li * 24}ms` }}>
                          <MenuLink link={l} onGo={close} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div id="gnav-sheet" className={`gnav__sheet ${mobile ? 'is-open' : ''}`} hidden={!mobile}>
          <button className="gnav__sheet-search" onClick={() => { setMobile(false); setMenu('search'); }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            Search
          </button>
          {menus.map((m, i) => {
            if (!m.columns) {
              return (
                <Link key={m.id} to={m.to} className="gnav__acc-plain gnav__acc-link" style={{ '--d': `${i * 35}ms` }} onClick={close}>{m.label}</Link>
              );
            }
            const mc = m.columns;
            const open = section === m.id;
            return (
              <div key={m.id} className="gnav__acc" style={{ '--d': `${i * 35}ms` }}>
                <button aria-expanded={open} onClick={() => setSection(open ? null : m.id)}>
                  {m.label}
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </button>
                <div className={`gnav__acc-body ${open ? 'is-open' : ''}`}>
                  <div>
                    {mc.flatMap((c) => c.links).map((l) => (
                      <MenuLink key={l.label} link={l} onGo={close} />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" className="gnav__acc-plain" onClick={() => { close(); openContact(); }}>Contact Me</button>
          <a href={site.agent.phoneHref} className="gnav__sheet-phone">{site.agent.phone}</a>
        </div>
      </header>
      <div className={`gnav__scrim ${menu ? 'is-on' : ''}`} onClick={close} aria-hidden="true" />
    </>
  );
}
