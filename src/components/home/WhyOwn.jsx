import { Link } from 'react-router-dom';
import { own } from '../../data/photos.js';
import { openContact } from '../ContactModal.jsx';

// Reasons to own, as cards that stack on top of each other while you scroll.
const REASONS = [
  {
    fig: 'Equity',
    figNote: 'paid to yourself, every month',
    title: 'Rent pays down your landlord’s loan. A mortgage pays down yours.',
    text: 'Part of every payment reduces what you owe. Over time that becomes wealth you can borrow against, sell, or pass on.',
    tone: 'paper',
  },
  {
    fig: 'Fixed',
    figNote: 'principal and interest on a fixed-rate loan',
    title: 'Your payment stops climbing.',
    text: 'Rent can reset with every lease. With a fixed-rate mortgage, principal and interest stay the same for the life of the loan. Taxes and insurance can still change.',
    tone: 'ink',
  },
  {
    fig: '2%',
    figNote: 'yearly cap on assessed value increases',
    title: 'Property tax you can plan around.',
    text: 'Under California’s Proposition 13, your home’s assessed value can rise by no more than 2% a year while you own it, no matter what the market does.',
    tone: 'sand',
  },
  {
    fig: '+40%',
    figNote: 'Santa Cruz median sale price, Feb 2019 to Feb 2026 (Redfin)',
    title: 'Ownership here has paid off.',
    text: 'Limited land between the mountains and the bay has kept demand strong. Past growth is no promise of future gains, but owners here have built real wealth.',
    tone: 'photo',
    photo: own.liveOak,
  },
  {
    fig: '$500K',
    figNote: 'gain a married couple can exclude from tax',
    title: 'Your gains can be tax-free.',
    text: 'When you sell a home you have lived in for two of the last five years, up to $250,000 of profit ($500,000 for married couples) is generally excluded from federal income tax.',
    tone: 'paper',
  },
  {
    fig: 'Deductions',
    figNote: 'that renters do not get',
    title: 'Tax breaks come with the keys.',
    text: 'Mortgage interest and property taxes may be deductible if you itemize, within IRS limits. A tax professional can tell you what applies to you.',
    tone: 'ink',
  },
  {
    fig: 'Yours',
    figNote: 'to paint, plant, and remodel',
    title: 'Make it home on your terms.',
    text: 'Keep the dog. Plant the lemon tree. Knock out the wall. No lease renewals, no surprise move-out notices, and a place your kids can grow up in.',
    tone: 'photo',
    photo: own.aptos,
  },
];

export default function WhyOwn() {
  return (
    <section className="why" aria-labelledby="why-title">
      <div className="container why__grid">
        <div className="why__intro">
          <div className="why__sticky">
            <h2 id="why-title">Why owning beats renting in Santa Cruz.</h2>
            <p>Seven reasons buyers here end up glad they made the move.</p>
            <div className="why__ctas">
              <button className="btn btn--dark" onClick={() => openContact('buying my first home')}>Talk through buying</button>
              <Link className="textlink" to="/tools#rent-or-buy">Run rent vs. buy</Link>
            </div>
          </div>
        </div>

        <ol className="why__stack">
          {REASONS.map((r, k) => (
            <li key={r.title} className={`wcard wcard--${r.tone}`} style={{ '--k': k }}>
              {r.photo && <img className="wcard__bg" src={r.photo.src(1400)} alt="" loading="lazy" style={{ objectPosition: r.photo.focus }} />}
              <div className="wcard__fig">
                <strong>{r.fig}</strong>
                <span>{r.figNote}</span>
              </div>
              <div className="wcard__text">
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            </li>
          ))}
          <li className="wcard wcard--honest" style={{ '--k': REASONS.length }}>
            <div className="wcard__text">
              <h3>And when renting makes more sense.</h3>
              <p>If you may move within a few years, closing and selling costs can outweigh the gains. Deva will tell you that straight, then help you plan for when buying does fit.</p>
              <Link className="textlink" to="/tools#rent-or-buy">See where your numbers cross</Link>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
