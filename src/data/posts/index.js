// To add a post: create a file in this folder like the others, then add it to the list below.
// Block types: p, h2, list, quote, callout, link, widget, steps, checklist, figure
// Widgets: PaymentCalculator, RentVsBuy, NeighborhoodMatch
import { photos } from '../photos.js';
import realMonthlyPayment from './real-monthly-payment.js';
import findingNeighborhood from './finding-your-neighborhood.js';
import sellingFirst30 from './selling-first-30-days.js';
import rentOrBuy from './rent-or-buy.js';

const raw = [realMonthlyPayment, findingNeighborhood, sellingFirst30, rentOrBuy];

// Cover photos by slug. Any post can also set cover.photo directly.
const COVERS = {
  'what-your-monthly-payment-really-looks-like': photos['downtown-midtown'],
  'finding-your-santa-cruz-neighborhood': photos.westside,
  'selling-your-home-the-first-30-days': photos.soquel,
  'rent-or-buy-in-santa-cruz': photos['san-lorenzo-valley'],
};
raw.forEach((p) => {
  if (!p.cover.photo && COVERS[p.slug]) p.cover = { ...p.cover, photo: COVERS[p.slug] };
});

function readMinutes(post) {
  const words = post.blocks
    .map((b) => [b.text, b.title, ...(b.items || []).map((i) => (typeof i === 'string' ? i : `${i.title} ${i.text}`))].join(' '))
    .join(' ')
    .split(/\s+/).length;
  const widgets = post.blocks.filter((b) => b.type === 'widget').length;
  return Math.max(2, Math.round(words / 220 + widgets * 1.5));
}

export const posts = raw
  .map((p) => ({ ...p, minutes: readMinutes(p) }))
  .sort((a, b) => (a.date < b.date ? 1 : -1));

export const topics = ['All', ...Array.from(new Set(posts.map((p) => p.topic)))];

export const postBySlug = Object.fromEntries(posts.map((p) => [p.slug, p]));

export const fmtDate = (d) =>
  new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
