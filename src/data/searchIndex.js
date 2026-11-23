import { posts } from './posts/index.js';
import { neighborhoods } from './neighborhoods.js';

const pages = [
  { kind: 'Pages', title: 'Homes for sale', text: 'property search listings featured active mls', to: '/homes' },
  { kind: 'Pages', title: 'Neighborhood map', text: 'areas county map where to live', to: '/neighborhoods' },
  { kind: 'Pages', title: 'Journal', text: 'blog articles buying selling tips news', to: '/journal' },
  { kind: 'Pages', title: 'Financial calculators', text: 'tools mortgage payment calculator rent buy afford', to: '/tools' },
  { kind: 'Pages', title: 'About Deva', text: 'bio realtor coldwell banker license', to: '/about' },
  { kind: 'Pages', title: 'Contact Deva', text: 'email phone call message reach', to: '/contact' },
];

export const searchIndex = [
  ...pages,
  ...posts.map((p) => ({
    kind: 'Articles',
    title: p.title,
    text: [p.dek, p.topic, ...p.blocks.map((b) => b.text || b.title || '')].join(' '),
    to: `/journal/${p.slug}`,
  })),
  ...neighborhoods.map((n) => ({
    kind: 'Neighborhoods',
    title: n.name,
    text: [n.area, n.line, n.body, ...n.tags].join(' '),
    to: `/neighborhoods#${n.slug}`,
  })),
];

export const quickLinks = [
  { title: 'Search all homes for sale', to: '/homes' },
  { title: 'What your monthly payment really looks like', to: '/journal/what-your-monthly-payment-really-looks-like' },
  { title: 'Find your neighborhood', to: '/tools#match' },
  { title: 'Contact Deva', to: '/contact' },
];

export function search(q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return searchIndex
    .map((item) => {
      const title = item.title.toLowerCase();
      const body = item.text.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (title.startsWith(w)) score += 6;
        else if (title.includes(w)) score += 4;
        else if (body.includes(w)) score += 1;
        else return null;
      }
      return { ...item, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 9)
    .reduce((groups, item) => {
      const g = groups.find((x) => x.kind === item.kind);
      g ? g.items.push(item) : groups.push({ kind: item.kind, items: [item] });
      return groups;
    }, [])
    .flatMap((g) => g.items);
}
