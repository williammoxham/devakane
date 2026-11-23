import { useEffect, useMemo, useRef, useState } from 'react';
import Reader from '../components/Reader.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import Plate from '../components/Plate.jsx';
import LocalNav from '../components/LocalNav.jsx';
import SurfWatch from '../components/journal/SurfWatch.jsx';
import { useJournal } from '../lib/journal.js';
import { fmtDate } from '../data/posts/index.js';
import { breaks, camsMore, outdoors, shops, lifestyleMatch, directions } from '../data/santaCruzLife.js';
import { bySlug } from '../data/neighborhoods.js';
import { photos } from '../data/photos.js';

const SECTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'surf', label: 'Surf Watch' },
  { id: 'outdoors', label: 'Trails' },
  { id: 'shops', label: 'Local shops' },
  { id: 'live-here', label: 'Where to live' },
];

function Cover({ post, sun }) {
  if (post.cover) return <Plate scene={post.cover.scene} tone={post.cover.tone} photo={post.cover.photo} alt="" sun={sun} />;
  if (post.image) return <Plate photo={post.image} alt="" sun={sun} />;
  return <Plate scene="coast" tone={['#C7D9D2', '#3F6B67']} alt="" sun={sun} />;
}

function PostLink({ post, className, children }) {
  const [, setParams] = useSearchParams();
  if (post.source === 'squarespace' && post.url) {
    return (
      <a href={`#post-${post.slug}`} className={className} onClick={(e) => { e.preventDefault(); setParams((p) => { const n = new URLSearchParams(p); n.set('post', post.slug); return n; }); }}>
        {children}
      </a>
    );
  }
  return <Link to={`/journal/${post.slug}`} className={className}>{children}</Link>;
}

function Latest() {
  const { posts, loading } = useJournal();
  const [params, setParams] = useSearchParams();
  const topic = params.get('topic') || 'All';
  const [q, setQ] = useState('');
  const input = useRef(null);
  const topics = useMemo(() => ['All', ...Array.from(new Set(posts.map((p) => p.topic)))], [posts]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement !== input.current && !/input|textarea/i.test(document.activeElement?.tagName || '')) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return posts.filter((p) => {
      if (topic !== 'All' && p.topic !== topic) return false;
      if (!needle) return true;
      return [p.title, p.dek, p.topic, ...(p.tags || []), ...(p.blocks || []).map((b) => b.text || '')].join(' ').toLowerCase().includes(needle);
    });
  }, [q, topic, posts]);
  const [lead, ...rest] = list;
  const open = posts.find((p) => p.source === 'squarespace' && p.slug === params.get('post'));
  const closeReader = () => setParams((p) => { const n = new URLSearchParams(p); n.delete('post'); return n; });

  return (
    <section id="latest" className="jsec">
      {open && <Reader title={open.title} kicker={open.topic} url={open.url} onClose={closeReader} />}
      <div className="container journal__controls">
        <div className="chips" role="tablist" aria-label="Topics">
          {topics.map((t) => (
            <button key={t} role="tab" aria-selected={topic === t} className={`chip ${topic === t ? 'is-on' : ''}`} onClick={() => setParams(t === 'All' ? {} : { topic: t })}>
              {t}
            </button>
          ))}
        </div>
        <label className="search">
          <span className="sr">Search articles</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
          <input ref={input} type="search" placeholder="Search articles" value={q} onChange={(e) => setQ(e.target.value)} />
          <kbd aria-hidden="true">/</kbd>
        </label>
      </div>

      <div className="container">
        {!lead && !loading && (
          <div className="empty">
            <p>No articles match "{q}".</p>
            <button className="textbtn" onClick={() => { setQ(''); setParams({}); }}>Clear search and filters</button>
          </div>
        )}
        {lead && (
          <PostLink post={lead} className="feature">
            <Cover post={lead} />
            <div className="feature__text">
              <span className="topic">{lead.topic}</span>
              <h2>{lead.title}</h2>
              <p>{lead.dek}</p>
              <span className="meta">{fmtDate(lead.date)}, {lead.minutes} min read</span>
            </div>
          </PostLink>
        )}
        {rest.length > 0 && (
          <ul className="index">
            {rest.map((p) => (
              <li key={`${p.source}-${p.slug}`}>
                <PostLink post={p}>
                  <Cover post={p} sun={false} />
                  <div>
                    <span className="topic">{p.topic}{p.source === 'guide' ? <em className="topic__tool"> with calculator</em> : null}</span>
                    <h3>{p.title}</h3>
                    <p>{p.dek}</p>
                    <span className="meta">{fmtDate(p.date)}, {p.minutes} min read</span>
                  </div>
                </PostLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Breaks() {
  return (
    <div className="breaks container">
      <div className="breaks__head">
        <h3>The breaks</h3>
        <p>West to east, from the lighthouse to La Selva. Cam links open the live HD view.</p>
      </div>
      <ol className="breaks__list">
        {breaks.map((b) => (
          <li key={b.name} className="brk">
            <div className="brk__name">
              <h4>{b.name}</h4>
              <span>{b.where}</span>
            </div>
            <p className="brk__note">{b.note}</p>
            <div className="brk__meta">
              <span className={`lvl lvl--${b.level.split(' ')[0].toLowerCase()}`}>{b.level}</span>
              {b.cam && <a href={b.cam} target="_blank" rel="noreferrer" className="brk__cam">Live cam</a>}
              <Link to={`/neighborhoods#${b.near}`} className="brk__near">Living nearby: {bySlug[b.near]?.name}</Link>
            </div>
          </li>
        ))}
      </ol>
      <p className="breaks__more"><a href={camsMore.url} target="_blank" rel="noreferrer">{camsMore.label}</a></p>
    </div>
  );
}

function Outdoors() {
  const [feature, ...rest] = outdoors;
  return (
    <section id="outdoors" className="jsec outdoors">
      <div className="container">
        <div className="jsec__head">
          <h2>Trails and open space</h2>
          <p>Redwoods, bluffs and singletrack within twenty minutes of almost every front door in the county.</p>
        </div>
        <div className="trails">
          <a className="trail trail--lead" href={directions(`${feature.name}, ${feature.town}, CA`)} target="_blank" rel="noreferrer">
            <Plate photo={feature.photo || photos.westside} alt={feature.name} sun={false} />
            <div className="trail__cap">
              <span>{feature.kind}</span>
              <h3>{feature.name}</h3>
              <p>{feature.note}</p>
            </div>
          </a>
          {rest.map((t) => (
            <a key={t.name} className="trail" href={directions(`${t.name}, ${t.town}, CA`)} target="_blank" rel="noreferrer">
              <span className="trail__kind">{t.kind}</span>
              <h3>{t.name}</h3>
              <p>{t.note}</p>
              <span className="trail__town">{t.town}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Shops() {
  const groups = Object.entries(shops);
  const [tab, setTab] = useState(groups[0][0]);
  return (
    <section id="shops" className="jsec shops">
      <div className="container">
        <div className="jsec__head">
          <h2>Local shops worth knowing</h2>
          <p>Where locals buy wetsuits, tune bikes and find gear. Independent first.</p>
        </div>
        <div className="chips chips--tight" role="tablist" aria-label="Shop type">
          {groups.map(([g]) => (
            <button key={g} role="tab" aria-selected={tab === g} className={`chip ${tab === g ? 'is-on' : ''}`} onClick={() => setTab(g)}>{g}</button>
          ))}
        </div>
        <ul className="shoplist">
          {shops[tab].map((s) => (
            <li key={s.name}>
              <div>
                <h3>{s.name}</h3>
                <p>{s.note}</p>
              </div>
              <a href={directions(`${s.name}, ${s.address}`)} target="_blank" rel="noreferrer" className="shoplist__addr">{s.address}</a>
            </li>
          ))}
        </ul>
        <p className="fine">Addresses checked November 2026. Hours change, so check before you go.</p>
      </div>
    </section>
  );
}

function LiveHere() {
  return (
    <section id="live-here" className="jsec livehere">
      <div className="container">
        <div className="jsec__head">
          <h2>Choose the neighborhood by the life you want</h2>
          <p>Most people start with a budget. Locals start with the morning they want. Here is how that maps to where you buy.</p>
        </div>
        <div className="livehere__grid">
          {lifestyleMatch.map((m) => (
            <div key={m.want} className="lh">
              <h3>{m.want}</h3>
              <p>{m.note}</p>
              <ul>
                {m.areas.map((a) => (
                  <li key={a}><Link to={`/neighborhoods#${a}`}>{bySlug[a]?.name}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="livehere__cta">
          <p>Want a short list of homes near your break or your trailhead?</p>
          <Link to="/contact" className="btn">Ask Deva</Link>
        </div>
      </div>
    </section>
  );
}

export default function Journal() {
  useEffect(() => { document.title = 'Journal: Real Estate and Life in Santa Cruz | Deva Kane'; }, []);
  return (
    <div className="page journal">
      <LocalNav title="Journal" links={SECTIONS} revealAfter={360} />
      <header className="page__head container jhead">
        <h1>Journal</h1>
        <p className="lede">Real estate in Santa Cruz County, and the life that comes with it. Market notes and buying guides, plus the surf report, trails and local spots from someone who grew up here and spends his free time in the water.</p>
        <nav className="jhead__jump" aria-label="On this page">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{s.label}</a>
          ))}
        </nav>
      </header>
      <Latest />
      <section id="surf" className="jsec surf">
        <SurfWatch />
        <Breaks />
      </section>
      <Outdoors />
      <Shops />
      <LiveHere />
    </div>
  );
}
