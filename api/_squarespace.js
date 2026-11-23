// Shared helpers for reading a Squarespace blog-style collection (the Journal and the Listings page).
// Files that start with an underscore are not deployed as endpoints by Vercel.

export const UA = { 'User-Agent': 'DevaKaneSite/1.0 (+squarespace reader)' };

export const strip = (html = '') =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, '\u2019')
    .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/\s+/g, ' ').trim();

export const day = (ms) => new Date(ms).toISOString().slice(0, 10);

export const clean = (url) => (url || '').replace(/\/+$/, '');

// Every image in a post body, in order (Squarespace lazy-loads, so the real URL is in data-src or data-image).
export function bodyImages(html = '') {
  const out = [];
  for (const m of html.matchAll(/<img[^>]+>/g)) {
    const tag = m[0];
    const src = (tag.match(/data-src="([^"]+)"/) || tag.match(/data-image="([^"]+)"/) || tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (src && !out.includes(src)) out.push(src.startsWith('//') ? `https:${src}` : src);
  }
  return out;
}

export async function getCollection(base, slug) {
  const url = slug ? `${base}/${encodeURIComponent(slug)}?format=json` : `${base}?format=json`;
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`squarespace ${r.status}`);
  const j = await r.json();
  return slug ? j.item || null : (j.items || []).filter((i) => i.urlId && i.title);
}

export const absolute = (fullUrl, base) => (fullUrl ? new URL(fullUrl, base).href : null);
