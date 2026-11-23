import { Link } from 'react-router-dom';
import { site } from '../config/site.js';

export default function Footer() {
  const a = site.agent;
  const socials = Object.entries(site.social).filter(([, url]) => url);
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__lead">
          <p className="footer__name">{a.name}</p>
          <p className="footer__tag">{a.tagline}</p>
          <p>{a.title}, {a.brokerage}</p>
          <p>CA DRE #{a.license}</p>
        </div>
        <div className="footer__col">
          <a href={a.phoneHref}>Direct {a.phone}</a>
          <a href={a.officePhoneHref}>Office {a.officePhone}</a>
          <a href={`mailto:${a.email}`}>{a.email}</a>
        </div>
        <nav className="footer__col" aria-label="Footer">
          <Link to="/homes">Homes</Link>
          <Link to="/neighborhoods">Neighborhoods</Link>
          <Link to="/journal">Journal</Link>
          <Link to="/tools">Tools</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/credits">Photo credits</Link>
        </nav>
        {socials.length > 0 && (
          <div className="footer__col">
            {socials.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer">{name[0].toUpperCase() + name.slice(1)}</a>
            ))}
          </div>
        )}
      </div>
      <div className="footer__legal">
        <p>
          <svg className="eho" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 2 9h3v11h14V9h3L12 2Zm-4 9h8v2H8v-2Zm0 4h8v2H8v-2Z" /></svg>
          Equal Housing Opportunity. {a.brokerage} fully supports the principles of the Fair Housing Act and the Equal Opportunity Act.
        </p>
        <p>Calculators and articles are for general information and are not financial, legal, or tax advice. Information deemed reliable but not guaranteed.</p>
        <p>&copy; {new Date().getFullYear()} {a.name}. Coldwell Banker is a registered trademark of Coldwell Banker Real Estate LLC.</p>
      </div>
    </footer>
  );
}
