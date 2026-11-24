import { Link } from 'react-router-dom';
import Plate from '../Plate.jsx';
import { headshotCloseUp } from '../../data/photos.js';
import { openContact } from '../ContactModal.jsx';
import { site } from '../../config/site.js';
import { useInView } from '../../lib/hooks.js';

// The agent card from Deva's current site, given room to breathe.
export default function MeetDeva() {
  const a = site.agent;
  const [ref, seen] = useInView({ threshold: 0.25 });
  const socials = Object.entries(site.social).filter(([, url]) => url);
  return (
    <section className={`meet ${seen ? 'is-in' : ''}`} ref={ref} aria-labelledby="meet-title">
      <div className="container meet__grid">
        <div className="meet__photo">
          <Plate scene="coast" tone={['#A8CFC6', '#0F2C3A']} photo={headshotCloseUp} alt={`Portrait of ${a.name}`} />
        </div>
        <div className="meet__text">
          <h2 id="meet-title">Meet {a.name.split(' ')[0]}.</h2>
          <p className="meet__tagline">{a.tagline}.</p>
          <p className="meet__role">{a.title}, {a.brokerage}</p>
          <p className="meet__also">{a.alsoKnownFor}, and a partner in <a href={site.business.url} target="_blank" rel="noreferrer">{site.business.name}</a></p>
          <p className="meet__lede">{site.bio[0]}</p>
          <div className="meet__ctas">
            <button className="btn btn--dark" onClick={() => openContact()}>Contact Me</button>
            <Link className="textlink" to="/about">My bio</Link>
          </div>
          <dl className="meet__facts">
            <div><dt>Direct</dt><dd><a href={a.phoneHref}>{a.phone}</a></dd></div>
            <div><dt>Office</dt><dd><a href={a.officePhoneHref}>{a.officePhone}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${a.email}`}>{a.email}</a></dd></div>
            <div><dt>License</dt><dd>CA DRE #{a.license}</dd></div>
          </dl>
          {socials.length > 0 && (
            <p className="meet__social">
              Follow me on{' '}
              {socials.map(([name, url], i) => (
                <span key={name}>
                  <a href={url} target="_blank" rel="noreferrer">{name[0].toUpperCase() + name.slice(1)}</a>
                  {i < socials.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
