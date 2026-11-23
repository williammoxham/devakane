import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ContactForm from '../components/ContactForm.jsx';
import { site } from '../config/site.js';

export default function Contact() {
  const [params] = useSearchParams();
  const about = params.get('about');
  const a = site.agent;

  useEffect(() => {
    document.title = 'Contact | Deva Kane';
  }, []);

  return (
    <div className="page contact">
      <div className="container contact__grid">
        <div className="contact__intro">
          <h1>Let's talk</h1>
          <p className="lede">Tell Deva a little about what you are looking for. A short note is plenty.</p>
          <dl className="facts">
            <div><dt>Direct</dt><dd><a href={a.phoneHref}>{a.phone}</a></dd></div>
            <div><dt>Office</dt><dd><a href={a.officePhoneHref}>{a.officePhone}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${a.email}`}>{a.email}</a></dd></div>
            <div><dt>License</dt><dd>CA DRE #{a.license}</dd></div>
          </dl>
        </div>
        <ContactForm key={about || 'none'} about={about} />
      </div>
    </div>
  );
}
