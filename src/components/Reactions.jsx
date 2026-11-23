import { useEffect, useState } from 'react';
import { insertRow, selectRows, safeGet, safeSet, supabaseEnabled } from '../lib/supabase.js';

const KINDS = [
  ['helpful', 'This helped'],
  ['saved', 'Saving this'],
  ['more', 'Write more like this'],
];

// Reader reactions. Counts come from Supabase when it is connected,
// otherwise they stay in this browser.
export default function Reactions({ slug }) {
  const mineKey = `reacted:${slug}`;
  const [mine, setMine] = useState(() => safeGet(mineKey, []));
  const [counts, setCounts] = useState({});

  useEffect(() => {
    selectRows('post_reactions', `slug=eq.${encodeURIComponent(slug)}&select=kind`)
      .then((rows) => {
        const c = {};
        rows.filter((r) => !r.slug || r.slug === slug).forEach((r) => (c[r.kind] = (c[r.kind] || 0) + 1));
        setCounts(c);
      })
      .catch(() => {});
  }, [slug]);

  const react = async (kind) => {
    if (mine.includes(kind)) return;
    const next = [...mine, kind];
    setMine(next);
    safeSet(mineKey, next);
    setCounts((c) => ({ ...c, [kind]: (c[kind] || 0) + 1 }));
    try {
      await insertRow('post_reactions', { slug, kind });
    } catch {
      /* keep the optimistic count; nothing to show the reader */
    }
  };

  return (
    <div className="reactions">
      <p>Was this useful?</p>
      <div className="reactions__row">
        {KINDS.map(([k, label]) => (
          <button key={k} type="button" onClick={() => react(k)} aria-pressed={mine.includes(k)} className={mine.includes(k) ? 'is-on' : ''}>
            {label}
            {supabaseEnabled && counts[k] ? <span className="reactions__n">{counts[k]}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}
