import Plate from '../Plate.jsx';
import { bySlug } from '../../data/neighborhoods.js';
import { fmtMoney } from '../../lib/hooks.js';

export const factsLine = (l) =>
  [l.beds != null && `${l.beds} bd`, l.baths != null && `${l.baths} ba`, l.sqft && `${l.sqft.toLocaleString()} sq ft`, l.acres && `${l.acres} acres`].filter(Boolean).join(', ');

export default function ListingCard({ l, onOpen }) {
  const hood = bySlug[l.neighborhood];
  const body = (
    <>
      <div className="listing__media">
        <Plate scene={hood?.scene} tone={hood?.tone} photo={l.photo} alt={l.address} />
        <span className={`listing__status listing__status--${l.status.toLowerCase().replace(/\s+/g, '-')}`}>{l.status}</span>
      </div>
      <strong className="listing__price">{l.price ? fmtMoney(l.price) : 'Price on request'}</strong>
      <span className="listing__addr">{l.address}{l.city ? `, ${l.city}` : ''}</span>
      {factsLine(l) && <span className="meta">{factsLine(l)}</span>}
      {hood && <span className="listing__hood">{hood.name}</span>}
    </>
  );
  if (l.source === 'squarespace' && l.url) {
    return <a href={l.url} onClick={(e) => { e.preventDefault(); onOpen(l); }}>{body}</a>;
  }
  return <a href={l.url} target="_blank" rel="noreferrer">{body}</a>;
}
