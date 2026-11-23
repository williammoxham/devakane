import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Reader from '../components/Reader.jsx';
import ListingCard from '../components/listings/ListingCard.jsx';
import { useListings } from '../lib/listings.js';
import { openContact } from '../components/ContactModal.jsx';
import Plate from '../components/Plate.jsx';
import { site } from '../config/site.js';

const AREAS = ['Anywhere in the county', 'Santa Cruz', 'Capitola', 'Aptos', 'Soquel', 'Scotts Valley', 'San Lorenzo Valley', 'Watsonville'];

function PropertySearch() {
  const [mode, setMode] = useState('location');
  const [area, setArea] = useState(AREAS[0]);
  const [minutes, setMinutes] = useState(20);
  const [beds, setBeds] = useState('Any');
  const submit = (e) => {
    e.preventDefault();
    window.open(site.idxSearchUrl, '_blank', 'noopener');
  };
  return (
    <form className="psearch" onSubmit={submit}>
      <div className="seg" role="radiogroup" aria-label="Search by">
        {[['location', 'Location'], ['drive', 'Drive time']].map(([v, l]) => (
          <button key={v} type="button" role="radio" aria-checked={mode === v} className={mode === v ? 'is-on' : ''} onClick={() => setMode(v)}>{l}</button>
        ))}
      </div>
      <div className="psearch__row">
        {mode === 'location' ? (
          <label>Where<select value={area} onChange={(e) => setArea(e.target.value)}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></label>
        ) : (
          <label>Within<select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>{[10, 20, 30, 45].map((m) => <option key={m} value={m}>{m} minutes of work or school</option>)}</select></label>
        )}
        <label>Bedrooms<select value={beds} onChange={(e) => setBeds(e.target.value)}>{['Any', '1+', '2+', '3+', '4+'].map((b) => <option key={b}>{b}</option>)}</select></label>
        <button className="btn btn--dark" type="submit">Search homes</button>
      </div>
      <p className="psearch__note">Opens the full MLS search in a new tab, where you can refine everything.</p>
    </form>
  );
}

const GROUPS = [['Available', (l) => l.status !== 'Sold'], ['Recently sold', (l) => l.status === 'Sold']];

function Featured() {
  const { listings, loading } = useListings();
  const [params, setParams] = useSearchParams();
  const open = listings.find((l) => l.slug === params.get('home'));
  const show = (l) => setParams((p) => { const n = new URLSearchParams(p); n.set('home', l.slug); return n; });
  const close = () => setParams((p) => { const n = new URLSearchParams(p); n.delete('home'); return n; });
  const ask = (l) => (
    <button type="button" className="reader__ask" onClick={() => { close(); openContact(`${l.address}${l.city ? `, ${l.city}` : ''}`); }}>Ask about this home</button>
  );
  return (
    <section id="featured" className="container" aria-labelledby="featured-title">
      {open && <Reader title={`${open.address}${open.city ? `, ${open.city}` : ''}`} kicker={open.status} url={open.url} onClose={close} action={ask(open)} />}
      <h2 id="featured-title" className="h-section">Deva’s listings</h2>
      {!loading && listings.length === 0 && (
        <div className="empty empty--panel">
          <p>No featured listings right now. New ones often go to people on Deva's list first.</p>
          <Link className="btn btn--dark" to="/contact?about=New%20listings">Get new listings first</Link>
        </div>
      )}
      {GROUPS.map(([label, test]) => {
        const group = listings.filter(test);
        if (!group.length) return null;
        return (
          <div key={label} className="listings__group">
            {listings.some((l) => l.status === 'Sold') && <h3 className="listings__label">{label}</h3>}
            <ul className="listings">
              {group.map((l) => <li key={l.id}><ListingCard l={l} onOpen={show} /></li>)}
            </ul>
          </div>
        );
      })}
    </section>
  );
}

export default function Homes() {
  useEffect(() => {
    document.title = 'Properties | Deva Kane';
  }, []);

  return (
    <div className="page homes">
      <header id="search" className="page__head container">
        <h1>Properties</h1>
        <p className="lede">Search every home for sale on the MLS, or see Deva's active listings.</p>
        <PropertySearch />
      </header>

      <Featured />

      <section className="section section--fog">
        <div className="container split">
          <div className="split__text">
            <h2>Thinking about selling?</h2>
            <p className="lede">See how the first month of a sale comes together, with a prep checklist you can keep.</p>
            <Link className="btn btn--dark" to="/journal/selling-your-home-the-first-30-days">Read the seller guide</Link>
          </div>
          <Plate scene="village" tone={['#E3D3C4', '#8A5A48']} alt="" />
        </div>
      </section>
    </div>
  );
}
