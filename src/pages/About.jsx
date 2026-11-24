import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Plate from '../components/Plate.jsx';
import { site } from '../config/site.js';

export default function About() {
  const a = site.agent;
  useEffect(() => {
    document.title = 'About | Deva Kane';
  }, []);
  return (
    <div className="page about">
      <section className="container about__grid">
        <Plate className="about__img" scene="coast" tone={['#A8CFC6', '#0F2C3A']} photo={a.portrait} alt={`Portrait of ${a.name}`} />
        <div className="about__text">
          <h1>{a.name}</h1>
          <p className="meet__tagline">{a.tagline}.</p>
          <p className="about__role">{a.title}, {a.brokerage}</p>
          <p className="meet__also">{a.alsoKnownFor}, and a partner in <a href={site.business.url} target="_blank" rel="noreferrer">{site.business.name}</a></p>
          {site.bio.map((p) => <p key={p} className="about__p">{p}</p>)}
          <dl className="facts">
            <div><dt>Brokerage</dt><dd>{a.office}</dd></div>
            <div><dt>License</dt><dd>CA DRE #{a.license}</dd></div>
            <div><dt>Direct</dt><dd><a href={a.phoneHref}>{a.phone}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${a.email}`}>{a.email}</a></dd></div>
          </dl>
          <Link className="btn btn--dark" to="/contact">Start a conversation</Link>
        </div>
      </section>
    </div>
  );
}
