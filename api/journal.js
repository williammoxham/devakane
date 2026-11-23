// Reads Deva's Squarespace blog and hands it to the site as clean JSON.
//
// Setup: in Vercel, Project Settings > Environment Variables, add
//   SQUARESPACE_BLOG_URL = https://your-squarespace-site.com/blog
// (the address of the blog page on Squarespace, no trailing slash). Redeploy once.
//
// GET /api/journal            list of posts
// GET /api/journal?slug=x     one post with its full body
//
// Squarespace serves any collection as JSON when ?format=json is added to its URL.
// If that is ever switched off, the RSS feed (?format=rss) is used instead.

import { UA, strip, day, clean } from './_squarespace.js';

const BLOG = clean(process.env.SQUARESPACE_BLOG_URL);
const minutes = (html) => Math.max(2, Math.round(strip(html).split(' ').length / 220));

function normalize(it, withBody = false) {
  const body = it.body || '';
  const post = {
    slug: it.urlId,
    title: it.title,
    dek: strip(it.excerpt || '').slice(0, 240) || strip(body).slice(0, 200),
    date: day(it.publishOn || it.addedOn || Date.now()),
    topic: (it.categories && it.categories[0]) || 'Santa Cruz life',
    tags: it.tags || [],
    image: it.assetUrl ? `${it.assetUrl}?format=1500w` : null,
    url: it.fullUrl ? new URL(it.fullUrl, BLOG).href : null,
    minutes: minutes(body || it.excerpt || ''),
    author: it.author ? it.author.displayName : null,
    source: 'squarespace',
  };
  if (withBody) post.body = body;
  return post;
}

async function viaJson(slug) {
  const url = slug ? `${BLOG}/${encodeURIComponent(slug)}?format=json` : `${BLOG}?format=json`;
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`squarespace ${r.status}`);
  const j = await r.json();
  if (slug) return j.item ? normalize(j.item, true) : null;
  return (j.items || []).filter((i) => i.urlId && i.title).map((i) => normalize(i));
}

async function viaRss() {
  const r = await fetch(`${BLOG}?format=rss`, { headers: UA });
  if (!r.ok) throw new Error(`rss ${r.status}`);
  const xml = await r.text();
  const pick = (block, tag) => {
    const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : '';
  };
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, b]) => {
    const link = pick(b, 'link');
    const body = pick(b, 'description');
    const img = (b.match(/<media:content[^>]+url="([^"]+)"/) || [])[1] || null;
    return {
      slug: link.split('/').filter(Boolean).pop(),
      title: strip(pick(b, 'title')),
      dek: strip(body).slice(0, 200),
      date: day(Date.parse(pick(b, 'pubDate')) || Date.now()),
      topic: strip(pick(b, 'category')) || 'Santa Cruz life',
      tags: [],
      image: img,
      url: link,
      minutes: minutes(body),
      source: 'squarespace',
    };
  });
}

export default async function handler(req, res) {
  const slug = (req.query && req.query.slug) || null;
  if (!BLOG) {
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({ configured: false, posts: [] });
  }
  try {
    if (slug) {
      let post = null;
      try { post = await viaJson(slug); } catch { post = null; }
      if (!post) {
        const list = await viaRss();
        post = list.find((p) => p.slug === slug) || null;
      }
      if (!post) return res.status(404).json({ error: 'not found' });
      res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
      return res.status(200).json({ configured: true, post });
    }
    let posts;
    try { posts = await viaJson(); } catch { posts = await viaRss(); }
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=86400');
    return res.status(200).json({ configured: true, posts });
  } catch (e) {
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.status(502).json({ configured: true, error: 'The blog could not be reached.', posts: [] });
  }
}
