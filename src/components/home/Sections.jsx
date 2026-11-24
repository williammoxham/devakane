import { useState } from 'react';
import { Link } from 'react-router-dom';
import Plate from '../Plate.jsx';
import ContactForm from '../ContactForm.jsx';
import { openContact } from '../ContactModal.jsx';
import { site } from '../../config/site.js';
import { testimonials, reviewsUrl } from '../../data/testimonials.js';
import { insertRow, supabaseEnabled } from '../../lib/supabase.js';

const wide = `${import.meta.env.BASE_URL}images/deva-wide.jpg`;

// Client stories. Hidden until real reviews are added in src/data/testimonials.js.
export function Testimonials() {
  const [i, setI] = useState(0);
  if (!testimonials.length) return null;
  const t = testimonials[i];
  return (
    <section className="section tst" aria-labelledby="tst-title">
      <div className="container tst__inner">
        <h2 id="tst-title">Client stories</h2>
        <figure className="tst__quote" key={i}>
          <blockquote>{t.quote}</blockquote>
          <figcaption>{t.name}{t.role ? `, ${t.role}` : ''}{t.area ? ` in ${t.area}` : ''}</figcaption>
        </figure>
        <div className="tst__nav">
          {testimonials.length > 1 && testimonials.map((_, k) => (
            <button key={k} type="button" className={k === i ? 'is-on' : ''} onClick={() => setI(k)} aria-label={`Story ${k + 1}`} />
          ))}
          {reviewsUrl && <a className="textlink" href={reviewsUrl} target="_blank" rel="noreferrer">Read all reviews</a>}
        </div>
      </div>
    </section>
  );
}

// The agent profile: Deva, full frame, with a direct way to book time.
export function WorkWithDeva() {
  const a = site.agent;
  return (
    <section className="wwd" aria-labelledby="wwd-title">
      <div className="wwd__media"><Plate photo={wide} alt={`${a.name}, ${a.title} with ${a.brokerage}`} width={1800} sun={false} /></div>
      <div className="wwd__body">
        <p className="wwd__role">{a.title}, {a.brokerage}</p>
        <h2 id="wwd-title">Work with Deva</h2>
        <p className="wwd__lede">A Santa Cruz native who knows the county street by street, and answers his own phone.</p>
        <ul className="wwd__tags">
          <li>Born and raised local</li>
          <li>Buyers and sellers</li>
          <li>Coldwell Banker Realty</li>
          <li>Local business owner</li>
        </ul>
        <div className="wwd__ctas">
          <button type="button" className="btn btn--light" onClick={() => openContact('a consultation')}>Schedule a consultation</button>
          <a className="btn btn--ghost-light" href={a.phoneHref}>Call {a.phone}</a>
        </div>
      </div>
    </section>
  );
}

// New listings by email.
export function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle');
  const submit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S{2,}$/.test(email.trim())) { setState('bad'); return; }
    setState('sending');
    if (!supabaseEnabled) {
      window.location.href = `mailto:${site.agent.email}?subject=${encodeURIComponent('Send me new listings')}&body=${encodeURIComponent(`Please add ${email.trim()} to your new listings list.`)}`;
      setState('done');
      return;
    }
    try {
      await insertRow('leads', { name: '', email: email.trim(), phone: '', interest: 'New listings by email', timeframe: '', message: 'Newsletter signup', source: window.location.pathname });
      setState('done');
    } catch {
      setState('error');
    }
  };
  return (
    <section className="nl" aria-labelledby="nl-title">
      <div className="container nl__inner">
        <div>
          <h2 id="nl-title">New listings in your inbox</h2>
          <p>Homes for sale in Santa Cruz County, sent by Deva as they come up, often before they hit the big sites.</p>
        </div>
        {state === 'done' ? (
          <p className="nl__done" role="status">You're on the list. Deva will be in touch.</p>
        ) : (
          <form className="nl__form" onSubmit={submit} noValidate>
            <label className="sr" htmlFor="nl-email">Email address</label>
            <input id="nl-email" type="email" inputMode="email" autoComplete="email" placeholder="Your email" value={email} onChange={(e) => { setEmail(e.target.value); setState('idle'); }} aria-invalid={state === 'bad'} />
            <button className="btn btn--dark" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Adding you' : 'Sign up'}</button>
            {state === 'bad' && <p className="nl__err" role="alert">Enter a valid email address.</p>}
            {state === 'error' && <p className="nl__err" role="alert">That didn't go through. Email {site.agent.email} directly.</p>}
            <p className="nl__fine">One email when there's something worth seeing. Unsubscribe anytime.</p>
          </form>
        )}
      </div>
    </section>
  );
}

// Get in touch, on the page: contact details beside the form.
export function GetInTouch() {
  const a = site.agent;
  return (
    <section className="section git" id="contact" aria-labelledby="git-title">
      <div className="container git__grid">
        <div className="git__info">
          <h2 id="git-title">Get in touch</h2>
          <p>Thinking about a move, even a year out? The best transactions start with a conversation.</p>
          <dl>
            <div><dt>Direct</dt><dd><a href={a.phoneHref}>{a.phone}</a></dd></div>
            <div><dt>Office</dt><dd><a href={a.officePhoneHref}>{a.officePhone}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${a.email}`}>{a.email}</a></dd></div>
            <div><dt>Brokerage</dt><dd>{a.office}</dd></div>
            <div><dt>License</dt><dd>CA DRE #{a.license}</dd></div>
          </dl>
          <Link className="textlink" to="/about">More about Deva</Link>
        </div>
        <div className="git__form"><ContactForm compact /></div>
      </div>
    </section>
  );
}
