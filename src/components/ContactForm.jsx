import { useState } from 'react';
import { insertRow, supabaseEnabled } from '../lib/supabase.js';
import { site } from '../config/site.js';

const INTERESTS = ['Buying', 'Selling', 'Both', 'Just curious'];
const TIMEFRAMES = ['Now', 'In 3 to 6 months', 'In 6 to 12 months', 'More than a year'];

// Live hints echo the ones on Deva's current contact form.
function hint(field, value) {
  const v = value.trim();
  if (field === 'name') return v.length >= 2 ? ['ok', 'Name looks great'] : null;
  if (field === 'email') {
    if (!v) return null;
    return /^\S+@\S+\.\S{2,}$/.test(v) ? ['ok', 'Looks like a valid email'] : ['bad', 'Check the email address'];
  }
  if (field === 'message') return v.length > 0 && v.length < 40 ? ['tip', 'The more detail the better'] : v.length >= 40 ? ['ok', 'Perfect, that helps'] : null;
  return null;
}

function Hint({ field, value, touched }) {
  const h = touched ? hint(field, value) : null;
  return (
    <span className={`hint ${h ? `hint--${h[0]}` : ''}`} aria-live="polite">
      {h ? h[1] : ''}
    </span>
  );
}

export default function ContactForm({ about, onDone, compact = false }) {
  const a = site.agent;
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'Buying',
    timeframe: 'In 3 to 6 months',
    message: about ? `I'd like to know more about ${about}.` : '',
  });

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    setTouched({ ...touched, [k]: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (form.name.trim().length < 2 || !/^\S+@\S+\.\S{2,}$/.test(form.email.trim())) {
      setStatus('error');
      setError('Add your name and a valid email so Deva can reply.');
      return;
    }
    setStatus('sending');
    // Until Supabase is connected, hand the message to the visitor's email app so no lead is lost.
    if (!supabaseEnabled) {
      const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nInterested in: ${form.interest}\nTimeframe: ${form.timeframe}\n\n${form.message}`;
      window.location.href = `mailto:${a.email}?subject=${encodeURIComponent(`Website inquiry from ${form.name}`)}&body=${encodeURIComponent(body)}`;
      setStatus('sent');
      return;
    }
    try {
      await insertRow('leads', { ...form, source: window.location.pathname });
      setStatus('sent');
    } catch {
      setStatus('error');
      setError(`The message did not send. Email ${a.email} directly, or try again.`);
    }
  };

  if (status === 'sent') {
    return (
      <div className="form form--done" role="status">
        <svg className="form__check" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24" /><path d="M15 27l7 7 15-16" /></svg>
        <h2>{supabaseEnabled ? 'Thank you for your inquiry' : 'Almost there'}</h2>
        <p>
          {supabaseEnabled
            ? `Deva will reply to ${form.email}.`
            : `Your email app should open with the message ready. Press send there and it goes to ${a.email}.`}
        </p>
        {onDone && <button className="btn btn--dark" onClick={onDone}>Done</button>}
      </div>
    );
  }

  return (
    <form className={`form ${compact ? 'form--compact' : ''}`} onSubmit={submit} noValidate>
      <div className="form__row">
        <label>
          <span className="form__lab">Name <Hint field="name" value={form.name} touched={touched.name} /></span>
          <input value={form.name} onChange={set('name')} autoComplete="name" required />
        </label>
        <label>
          <span className="form__lab">Email <Hint field="email" value={form.email} touched={touched.email} /></span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
        </label>
      </div>
      {!compact && (
        <label>
          <span className="form__lab">Phone <span className="opt">optional</span></span>
          <input type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
        </label>
      )}
      <fieldset>
        <legend>I'm interested in</legend>
        <div className="seg">
          {INTERESTS.map((i) => (
            <button key={i} type="button" className={form.interest === i ? 'is-on' : ''} aria-pressed={form.interest === i} onClick={() => setForm({ ...form, interest: i })}>{i}</button>
          ))}
        </div>
      </fieldset>
      {!compact && (
        <label>
          <span className="form__lab">Timeframe</span>
          <select value={form.timeframe} onChange={set('timeframe')}>
            {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      )}
      <label>
        <span className="form__lab">Message <Hint field="message" value={form.message} touched={touched.message} /></span>
        <textarea rows={compact ? 4 : 5} value={form.message} onChange={set('message')} />
      </label>
      {status === 'error' && <p className="form__error" role="alert">{error}</p>}
      <button className="btn btn--dark" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending' : 'Send'}
      </button>
    </form>
  );
}
