import { useEffect } from 'react';
import Plate from '../components/Plate.jsx';
import { photos, own, headshot } from '../data/photos.js';

export default function Credits() {
  useEffect(() => {
    document.title = 'Photo credits | Deva Kane';
  }, []);
  return (
    <div className="page credits">
      <header className="page__head container">
        <h1>Photo credits</h1>
        <p className="lede">Original photos by Will Moxham, used with permission. Others are from Wikimedia Commons under their free licenses; follow each link for the photographer and license terms.</p>
      </header>
      <section className="container">
        <ul>
          {[...Object.values(own), ...Object.values(photos).filter((p) => !p.key || !own[p.key])].filter((p, i, a) => a.indexOf(p) === i).map((p) => (
            <li key={p.key}>
              <Plate photo={p} width={600} alt={p.title} />
              <strong>{p.title}</strong>
              <span>
                {p.credit || (p.author ? `Photo by ${p.author}` : 'Photographer listed on Commons')}
                {!p.credit && p.license ? `, ${p.license}` : ''}{p.credit ? '' : '.'}
              </span>
              {p.page && <a href={p.page} target="_blank" rel="noreferrer">View on Wikimedia Commons</a>}
            </li>
          ))}
          <li>
            <Plate photo={headshot} width={600} alt="Deva Kane" />
            <strong>Deva Kane</strong>
            <span>Headshot courtesy of Deva Kane.</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
