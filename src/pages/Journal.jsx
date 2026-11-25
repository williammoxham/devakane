import { useEffect, useMemo, useRef, useState } from 'react';
import Reader from '../components/Reader.jsx';
import { Link, useSearchParams } from 'react-router-dom';
import Plate from '../components/Plate.jsx';
import LocalNav from '../components/LocalNav.jsx';
import SurfWatch from '../components/journal/SurfWatch.jsx';
import { useJournal } from '../lib/journal.js';
import { fmtDate } from '../data/posts/index.js';
import { breaks, camsMore, outdoors, shops, lifestyleMatch, directions, dayPlan, coffee, breweries, aroundTown } from '../data/santaCruzLife.js';
import { bySlug } from '../data/neighborhoods.js';
import { photos, own } from '../data/photos.js';
import { site } from '../config/site.js';
import { openContact } from '../components/ContactModal.jsx';
import { useHeroScroll, useDarkHero } from '../lib/hooks.js';

const SECTIONS = [
  { id: 'woodhouse', label: 'Woodhouse' },
  { id: 'latest', label: 'Latest posts' },
  { id: 'day', label: 'A day in Santa Cruz' },
  { id: 'coffee-beer', label: 'Coffee and beer' },
  { id: 'outdoors', label: 'Trails' },
  { id: 'shops', label: 'Local shops' },
  { id: 'live-here', label: 'Where to live' },
  { id: 'surf', label: 'Surf Watch' },
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
      <div className="container jsec__head">
        <h2>Deva’s Journal</h2>
        <p>Deva’s market notes, buying and selling advice, and life in Santa Cruz County.</p>
      </div>
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

function BreakList({ items }) {
  return (
    <ol className="brx__list">
      {items.map((b) => (
        <li key={b.name} className="brx">
          <div className="brx__top">
            <h5>{b.name}</h5>
            {b.cam && <a href={b.cam} target="_blank" rel="noreferrer" className="brx__cam">Live cam</a>}
          </div>
          <span className="brx__where">{b.where}</span>
          <p>{b.note}</p>
          {b.near && <Link to={`/neighborhoods#${b.near}`} className="brx__near">Living nearby: {bySlug[b.near]?.name}</Link>}
        </li>
      ))}
    </ol>
  );
}

function Breaks() {
  const easy = breaks.filter((b) => b.tier === 'easy');
  const hard = breaks.filter((b) => b.tier === 'advanced');
  return (
    <div className="breaks container">
      <div className="breaks__head">
        <h3>Every break in the county</h3>
        <p>North to south, Waddell Creek to Sunset Beach, sorted by who should paddle out.</p>
      </div>
      <div className="brx__grid">
        <section className="brx__col brx__col--easy" aria-labelledby="brx-easy">
          <header>
            <h4 id="brx-easy">Beginner to intermediate</h4>
            <p>{easy.length} spots where you can learn and progress.</p>
          </header>
          <BreakList items={easy} />
        </section>
        <section className="brx__col brx__col--hard" aria-labelledby="brx-hard">
          <header>
            <h4 id="brx-hard">Advanced only</h4>
            <p>{hard.length} spots with reef, rock, rips or heavy water. Watch first.</p>
          </header>
          <BreakList items={hard} />
        </section>
      </div>
      <p className="breaks__more">
        Ratings are for an ordinary day. Any break gets dangerous on a big swell.{' '}
        <a href={camsMore.url} target="_blank" rel="noreferrer">{camsMore.label}</a>
      </p>
    </div>
  );
}

// The opener: Deva as a local business owner and one of the newest partners in Woodhouse.
// Full screen, with the same scroll parallax as the home page hero.
function Woodhouse() {
  const b = site.business;
  const scroll = useHeroScroll();
  useDarkHero();
  const p = Math.max(0, scroll - 0.12);
  return (
    <>
      <section
        id="woodhouse"
        className="whx"
        aria-labelledby="whx-title"
        style={{ transform: `scale(${1 - p * 0.1})`, borderRadius: `${p * 48}px` }}
      >
        <div className="whx__img" style={{ transform: `translateY(${scroll * 12}%) scale(${1 + scroll * 0.08})` }}>
          <img src={own.woodhouse.src()} alt="A can of Woodhouse Blending & Brewing beer on a log at sunset above Santa Cruz" fetchpriority="high" style={{ objectPosition: '50% 40%' }} />
        </div>
        <div className="whx__shade" aria-hidden="true" />
        <div className="container whx__body" style={{ transform: `translateY(${scroll * -40}px)`, opacity: 1 - scroll * 0.9 }}>
          <h1 className="whx__label">The Journal</h1>
          <h2 id="whx-title">He doesn’t just sell Santa Cruz. He’s invested in it.</h2>
          <p className="whx__lede">Realtor, lifelong surfer and one of the newest partners in {b.name}.</p>
          <div className="whx__ctas">
            <a className="btn whx__go" href={b.url} target="_blank" rel="noreferrer">Visit Woodhouse</a>
            <button type="button" className="btn btn--ghost-light" onClick={() => openContact('meeting up at Woodhouse')}>Meet Deva for a pint</button>
          </div>
        </div>
      </section>
      <div className="container whx__after">
        <dl className="whx__facts">
          <div><dt>Where</dt><dd>119 Madrone St, Santa Cruz</dd></div>
          <div><dt>What</dt><dd>Small batch beer, live music, art and events</dd></div>
          <div><dt>Deva’s role</dt><dd>Partner and investor</dd></div>
        </dl>
        <p className="whx__note">
          Owning a business here means he knows the town the way buyers want to: which blocks are busy on a Friday,
          what the parking is really like, and which corners are about to change. Ask him over a pint.
        </p>
      </div>
    </>
  );
}

const pic = (k) => own[k] || photos[k];

// "Make a day of it": one day, in order, so the numbers mean something.
function DayPlan() {
  return (
    <section id="day" className="jsec sday">
      <div className="container">
        <div className="jsec__head">
          <h2>A day in Santa Cruz</h2>
          <p>The day Deva would plan for a friend in town for the first time. Six stops from first light to last call, none more than twenty minutes apart.</p>
        </div>
        <ol className="sday__list">
          {dayPlan.map((d, i) => (
            <li key={d.title} className={`dstop ${i === 0 ? 'dstop--lead' : ''}`}>
              <a href={directions(d.place)} target="_blank" rel="noreferrer" aria-label={`${d.title}: directions to ${d.place}`}>
                <Plate photo={pic(d.photo)} alt="" sun={false} />
                <div className="dstop__shade" aria-hidden="true" />
                <div className="dstop__cap">
                  <span className="dstop__when"><b>{i + 1}</b>{d.when}</span>
                  <h3>{d.title}</h3>
                  <p>{d.note}</p>
                </div>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PlaceList({ items }) {
  return (
    <ul className="plist">
      {items.map((c) => (
        <li key={c.name}>
          <a href={directions(c.q)} target="_blank" rel="noreferrer">
            <span className="plist__top"><h4>{c.name}</h4><span className="plist__area">{c.area}</span></span>
            <p>{c.note}</p>
          </a>
        </li>
      ))}
    </ul>
  );
}

function CoffeeBeer() {
  return (
    <section id="coffee-beer" className="jsec cb">
      <div className="container">
        <div className="jsec__head">
          <h2>Coffee in the morning, beer at sundown</h2>
          <p>Santa Cruz roasts and brews far above its size. These are the places locals actually go, from a guy who now pours beer in town himself.</p>
        </div>
        <div className="cb__grid">
          <article className="cbp cbp--coffee">
            <header>
              <h3>The coffee scene</h3>
              <p>Seven cups worth crossing town for.</p>
            </header>
            <PlaceList items={coffee} />
          </article>
          <article className="cbp cbp--beer">
            <header>
              <h3>The beer trail</h3>
              <p>Scotts Valley to Watsonville, with one stop that’s personal.</p>
            </header>
            <a className="cbp__home" href={directions('Woodhouse Blending & Brewing, 119 Madrone St, Santa Cruz')} target="_blank" rel="noreferrer">
              <span className="cbp__homebadge">Deva’s place</span>
              <h4>Woodhouse Blending & Brewing</h4>
              <p>Small batch fermentation, music and art on Madrone Street. Deva is one of the newest partners.</p>
            </a>
            <PlaceList items={breweries} />
          </article>
        </div>
        <div className="town">
          <h3>Around town, week to week</h3>
          <ul>
            {aroundTown.map((e) => (
              <li key={e.what}>
                <strong>{e.what}</strong>
                <span>{e.when}</span>
                <em>{e.where}</em>
              </li>
            ))}
          </ul>
          <p className="fine">Places checked November 2026. Hours change, so check before you go.</p>
        </div>
      </div>
    </section>
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
      <LocalNav title="Journal" links={SECTIONS} revealAfter={typeof window !== "undefined" ? window.innerHeight * 0.85 : 700} />
      <Woodhouse />
      <nav className="container jhead__jump" id="journal-jump" aria-label="On this page">
        {SECTIONS.slice(1).map((s) => (
          <a key={s.id} href={`#${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' }); }}>{s.label}</a>
        ))}
      </nav>
      <Latest />
      <DayPlan />
      <CoffeeBeer />
      <Outdoors />
      <Shops />
      <LiveHere />
      <section id="surf" className="jsec surf">
        <SurfWatch />
        <Breaks />
      </section>
    </div>
  );
}
