import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Full-screen frame for a page on Deva's Squarespace site (a blog post or a listing).
export default function Reader({ title, kicker, url, onClose, action }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.documentElement.classList.add('lock');
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.classList.remove('lock'); };
  }, [onClose]);
  return createPortal(
    <div className="reader" role="dialog" aria-modal="true" aria-label={title}>
      <div className="reader__bar">
        <button type="button" className="reader__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="reader__title">
          {kicker && <span>{kicker}</span>}
          <strong>{title}</strong>
        </div>
        <div className="reader__actions">
          {action}
          <a className="reader__out" href={url} target="_blank" rel="noreferrer">Open in a new tab</a>
        </div>
      </div>
      <div className="reader__frame">
        {!loaded && <p className="reader__loading">Loading</p>}
        <iframe src={url} title={title} onLoad={() => setLoaded(true)} />
      </div>
    </div>,
    document.body
  );
}
