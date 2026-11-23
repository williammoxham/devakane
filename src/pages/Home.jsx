import { Link, useNavigate } from 'react-router-dom';
import PhotoHero from '../components/PhotoHero.jsx';
import Marquee from '../components/home/Marquee.jsx';
import Plate from '../components/Plate.jsx';
import DayPhotos from '../components/home/DayPhotos.jsx';
import Bento from '../components/home/Bento.jsx';
import ServiceCards from '../components/home/ServiceCards.jsx';
import Highlights from '../components/home/Highlights.jsx';
import MeetDeva from '../components/home/MeetDeva.jsx';
import Market from '../components/home/Market.jsx';
import CountyMap from '../components/map3d/CountyMap.jsx';
import WhyOwn from '../components/home/WhyOwn.jsx';
import { openContact } from '../components/ContactModal.jsx';
import { own } from '../data/photos.js';
import { neighborhoods } from '../data/neighborhoods.js';
import { fmtDate } from '../data/posts/index.js';
import { useJournal } from '../lib/journal.js';
import { useListings } from '../lib/listings.js';
import ListingCard from '../components/listings/ListingCard.jsx';
import { useScrollProgress } from '../lib/hooks.js';
import { site } from '../config/site.js';

function NeighborhoodRail() {
  const [ref, p] = useScrollProgress('pinned');
  return (
    <section className="rail" ref={ref} aria-labelledby="rail-title" style={{ height: `${neighborhoods.length * 32 + 100}vh` }}>
      <div className="rail__sticky">
        <div className="rail__head">
          <h2 id="rail-title">Eleven ways to live here</h2>
          <Link className="textlink" to="/neighborhoods">Open the map</Link>
        </div>
        <div className="rail__viewport">
          <ul className="rail__track" style={{ '--p': p }}>
            {neighborhoods.map((n) => (
              <li key={n.slug} className="rail__item">
                <Link to={`/neighborhoods#${n.slug}`}>
                  <Plate scene={n.scene} tone={n.tone} photo={n.photo} alt={n.name} />
                  <div className="rail__cap">
                    <h3>{n.name}</h3>
                    <p>{n.line}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="rail__progress" aria-hidden="true"><i style={{ transform: `scaleX(${p})` }} /></div>
      </div>
    </section>
  );
}

// Squarespace posts open in the Journal's reader; built-in guides have their own page.
const postHref = (p) => (p.source === 'squarespace' ? `/journal?post=${encodeURIComponent(p.slug)}` : `/journal/${p.slug}`);

function HomeListings() {
  const { listings } = useListings();
  const navigate = useNavigate();
  const live = listings.filter((l) => l.status !== 'Sold').slice(0, 3);
  if (!live.length) return null;
  return (
    <section className="section home-listings" aria-labelledby="hl-title">
      <div className="container">
        <div className="section__head">
          <h2 id="hl-title">Deva’s listings</h2>
          <Link className="textlink" to="/homes#featured">See all</Link>
        </div>
        <ul className="listings">
          {live.map((l) => (
            <li key={l.id}><ListingCard l={l} onOpen={(x) => navigate(`/homes?home=${encodeURIComponent(x.slug)}`)} /></li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function JournalPreview() {
  const { posts } = useJournal();
  const [lead, ...rest] = posts;
  if (!lead) return null;
  return (
    <section className="section journal-preview" aria-labelledby="jp-title">
      <div className="container">
        <div className="section__head">
          <h2 id="jp-title">Blog</h2>
          <Link className="textlink" to="/journal">View blog</Link>
        </div>
        <div className="jp">
          <Link to={postHref(lead)} className="jp__lead">
            {lead.cover ? <Plate scene={lead.cover.scene} tone={lead.cover.tone} photo={lead.cover.photo} alt="" /> : <Plate photo={lead.image} scene="coast" alt="" />}
            <span className="topic">{lead.topic}</span>
            <h3>{lead.title}</h3>
            <p>{lead.dek}</p>
          </Link>
          <ul className="jp__list">
            {rest.slice(0, 3).map((p) => (
              <li key={p.slug}>
                <Link to={postHref(p)}>
                  <span className="topic">{p.topic}</span>
                  <h3>{p.title}</h3>
                  <span className="meta">{fmtDate(p.date)}, {p.minutes} min</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <div className="zoom"><PhotoHero /></div>
      <MeetDeva />
      <HomeListings />
      <CountyMap />
      <DayPhotos />
      <Market />
      <Bento />
      <WhyOwn />
      <NeighborhoodRail />
      <ServiceCards />
      <Highlights />
      <JournalPreview />
      <section className="value" aria-labelledby="value-title">
        <div className="value__media">
          <Plate photo={own.cliffSunset} alt="" width={1600} />
        </div>
        <div className="value__body">
          <h2 id="value-title">What is your home worth today?</h2>
          <p>Get a personal estimate from Deva, based on recent sales on your street and what buyers are paying right now. No pressure, and no obligation to list.</p>
          <div className="value__ctas">
            <button className="btn btn--light" onClick={() => openContact('my home value')}>Request my home value</button>
            <a className="btn btn--ghost-light" href={site.agent.phoneHref}>Call {site.agent.phone}</a>
          </div>
        </div>
      </section>
    </>
  );
}
