import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { search, quickLinks } from '../data/searchIndex.js';

export default function SearchPanel({ onClose }) {
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef(null);
  const navigate = useNavigate();
  const results = useMemo(() => (q.trim() ? search(q) : quickLinks.map((l) => ({ ...l, kind: 'Quick links' }))), [q]);

  useEffect(() => {
    input.current?.focus();
  }, []);
  useEffect(() => setI(0), [q]);

  const go = (r) => {
    onClose();
    navigate(r.to);
  };

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((v) => Math.min(results.length - 1, v + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setI((v) => Math.max(0, v - 1)); }
    if (e.key === 'Enter' && results[i]) go(results[i]);
  };

  let lastKind = null;
  return (
    <div className="searchp">
      <div className="searchp__field">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
        <input
          ref={input}
          type="search"
          placeholder="Search homes, neighborhoods, articles"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results[i] ? `sr-${i}` : undefined}
          aria-label="Search the site"
        />
      </div>
      {q.trim() && results.length === 0 ? (
        <p className="searchp__empty">Nothing matches "{q}". Try a neighborhood name, "payment", or "selling".</p>
      ) : (
        <ul id="search-results" role="listbox" className="searchp__list">
          {results.map((r, idx) => {
            const head = r.kind !== lastKind ? (lastKind = r.kind) : null;
            return (
              <li key={r.to + r.title} role="presentation">
                {head && <p className="searchp__kind">{head}</p>}
                <button
                  id={`sr-${idx}`}
                  role="option"
                  aria-selected={idx === i}
                  className={idx === i ? 'is-on' : ''}
                  onMouseEnter={() => setI(idx)}
                  onClick={() => go(r)}
                >
                  {r.title}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
