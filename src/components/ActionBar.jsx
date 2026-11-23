import { site } from '../config/site.js';
import { openContact } from './ContactModal.jsx';

// Phones only: one tap to call, text, or write to Deva.
export default function ActionBar() {
  const a = site.agent;
  const sms = a.phoneHref.replace('tel:', 'sms:');
  return (
    <nav className="abar" aria-label="Contact Deva">
      <a href={a.phoneHref}>Call</a>
      <a href={sms}>Text</a>
      <button type="button" onClick={() => openContact()}>Message</button>
    </nav>
  );
}
