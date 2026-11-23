// One list of articles: Deva's Squarespace posts (read live through /api/journal)
// merged with the built-in guides that have calculators inside them.
import { useEffect, useState } from 'react';
import { posts as guides } from '../data/posts/index.js';

const API = import.meta.env.VITE_API_BASE || '';
let cache = null;

export async function fetchJournal() {
  if (cache) return cache;
  try {
    const r = await fetch(`${API}/api/journal`);
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    cache = { configured: j.configured !== false, posts: j.posts || [], error: j.error || null };
  } catch {
    cache = { configured: false, posts: [], error: null, offline: true };
  }
  return cache;
}

export async function fetchJournalPost(slug) {
  const r = await fetch(`${API}/api/journal?slug=${encodeURIComponent(slug)}`);
  if (!r.ok) return null;
  const j = await r.json();
  return j.post || null;
}

const merge = (remote) =>
  [...remote, ...guides.map((g) => ({ ...g, source: 'guide' }))].sort((a, b) => (a.date < b.date ? 1 : -1));

export function useJournal() {
  const [state, setState] = useState({ loading: !cache, posts: merge(cache ? cache.posts : []), configured: cache?.configured });
  useEffect(() => {
    let live = true;
    fetchJournal().then((c) => live && setState({ loading: false, posts: merge(c.posts), configured: c.configured, error: c.error }));
    return () => { live = false; };
  }, []);
  return state;
}
