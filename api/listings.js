// Deva's listings, read from a "Listings" blog page on his Squarespace site.
//
// Setup: in Vercel, Project Settings > Environment Variables, add
//   SQUARESPACE_LISTINGS_URL = https://your-squarespace-site.com/listings
// then redeploy once.
//
// How Deva adds a home on Squarespace (one blog post per home):
//   Title          the street address, e.g. 123 Seabright Ave, Santa Cruz
//   Featured image the main photo (more photos go in the post body)
//   Excerpt        one or two sentences about the home
//   Tags           price and facts, e.g.  $1,495,000   3 bd   2 ba   1,640 sqft   0.2 acres
//   Category       the status: Coming soon, Active, Pending or Sold
//   Location       optional; if set, the site uses it for the map and the neighborhood
// GET /api/listings

import { UA, strip, day, clean, bodyImages, getCollection, absolute } from './_squarespace.js';

const BASE = clean(process.env.SQUARESPACE_LISTINGS_URL);
const STATUSES = ['Coming soon', 'Active', 'Pending', 'Sold'];

const num = (s) => Number(String(s).replace(/[^\d.]/g, ''));
function facts(texts) {
  const all = texts.join(' | ');
  const f = {};
  const price = all.match(/\$\s?([\d,.]+)\s*([km])?/i);
  if (price) f.price = Math.round(num(price[1]) * (price[2] ? (price[2].toLowerCase() === 'm' ? 1e6 : 1e3) : 1));
  const beds = all.match(/(\d+(?:\.\d)?)\s*(?:bd|bed|beds|bedrooms?)\b/i); if (beds) f.beds = num(beds[1]);
  const baths = all.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath|baths|bathrooms?)\b/i); if (baths) f.baths = num(baths[1]);
  const sqft = all.match(/([\d,]{3,})\s*(?:sq\.?\s?ft|sqft|sf|square feet)\b/i); if (sqft) f.sqft = num(sqft[1]);
  const acres = all.match(/(\d*\.?\d+)\s*(?:ac|acres?)\b/i); if (acres) f.acres = num(acres[1]);
  return f;
}

function normalize(it) {
  const tags = it.tags || [];
  const cats = it.categories || [];
  const f = facts([...tags, it.title, strip(it.excerpt || '')]);
  const status = STATUSES.find((s) => cats.some((c) => c.toLowerCase() === s.toLowerCase())) || 'Active';
  const loc = it.location || {};
  const [street, cityPart] = it.title.split(/,\s*/);
  const city = cityPart || (loc.addressLine2 ? loc.addressLine2.split(',')[0].trim() : '');
  const photos = [it.assetUrl, ...bodyImages(it.body)].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  return {
    id: it.urlId,
    slug: it.urlId,
    address: street || it.title,
    city,
    ...f,
    status,
    description: strip(it.excerpt || '').slice(0, 280),
    photo: it.assetUrl ? `${it.assetUrl}?format=1500w` : photos[0] || null,
    photos: photos.slice(0, 12).map((p) => (p.includes('squarespace-cdn') && !p.includes('format=') ? `${p}?format=1500w` : p)),
    latlon: loc.mapLat && loc.mapLng ? [loc.mapLat, loc.mapLng] : null,
    url: absolute(it.fullUrl, BASE),
    date: day(it.publishOn || it.addedOn || Date.now()),
    source: 'squarespace',
  };
}

export default async function handler(req, res) {
  if (!BASE) {
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({ configured: false, listings: [] });
  }
  try {
    const items = await getCollection(BASE);
    const listings = items.map(normalize).sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status) || (a.date < b.date ? 1 : -1));
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    return res.status(200).json({ configured: true, listings });
  } catch {
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(502).json({ configured: true, error: 'Listings could not be reached.', listings: [] });
  }
}
