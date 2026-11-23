// Deva's listings: read live from his Squarespace "Listings" page through /api/listings,
// plus anything added by hand in src/data/listings.js.
import { useEffect, useState } from 'react';
import { listings as local } from '../data/listings.js';
import { areas } from '../data/areas.js';
import { neighborhoods } from '../data/neighborhoods.js';

const API = import.meta.env.VITE_API_BASE || '';
let cache = null;

// Match a listing to one of the site's neighborhoods: by map location if Deva set one, else by town name.
function hoodFor(l) {
  if (l.neighborhood) return l.neighborhood;
  if (l.latlon) {
    let best = null, bd = Infinity;
    Object.entries(areas).forEach(([slug, a]) => {
      const d = Math.hypot(a.latlon[0] - l.latlon[0], (a.latlon[1] - l.latlon[1]) * 0.8);
      if (d < bd) { bd = d; best = slug; }
    });
    return best;
  }
  const c = (l.city || '').toLowerCase();
  const byName = neighborhoods.find((n) => c && n.name.toLowerCase().includes(c));
  if (byName) return byName.slug;
  if (/felton|ben lomond|boulder creek|brookdale/.test(c)) return 'san-lorenzo-valley';
  if (/rio del mar|la selva|seacliff/.test(c)) return 'aptos';
  return null;
}

export async function fetchListings() {
  if (cache) return cache;
  try {
    const r = await fetch(`${API}/api/listings`);
    const j = r.ok ? await r.json() : { listings: [] };
    cache = j.listings || [];
  } catch {
    cache = [];
  }
  return cache;
}

export function useListings() {
  const [state, setState] = useState({ loading: !cache, listings: withHoods([...(cache || []), ...local]) });
  useEffect(() => {
    let live = true;
    fetchListings().then((remote) => live && setState({ loading: false, listings: withHoods([...remote, ...local]) }));
    return () => { live = false; };
  }, []);
  return state;
}

const withHoods = (list) => list.map((l) => ({ ...l, slug: l.slug || l.id, neighborhood: hoodFor(l) }));
