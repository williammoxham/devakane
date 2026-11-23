import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { neighborhoods } from '../../data/neighborhoods.js';

// A neighborhood index. On desktop, a photo follows the cursor and
// trails slightly behind it as you move down the list.
export default function HoverList() {
  const peek = useRef(null);
  const [active, setActive] = useState(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.14;
      pos.current.y += (target.current.y - pos.current.y) * 0.14;
      if (peek.current) peek.current.style.left = `${pos.current.x}px`;
      if (peek.current) peek.current.style.top = `${pos.current.y}px`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const move = (e) => {
    target.current = { x: e.clientX + 170, y: e.clientY };
    if (!active) pos.current = { ...target.current };
  };

  const current = neighborhoods.find((n) => n.slug === active);

  return (
    <section className="hover-list" aria-labelledby="hl-title" onMouseMove={move} onMouseLeave={() => setActive(null)}>
      <div className="container">
        <h2 id="hl-title">Every neighborhood</h2>
        <ol>
          {neighborhoods.map((n) => (
            <li key={n.slug}>
              <Link to={`/neighborhoods#${n.slug}`} onMouseEnter={() => setActive(n.slug)} onFocus={() => setActive(null)}>
                <strong>{n.name}</strong>
                <span>{n.line}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <div ref={peek} className={`hover-list__peek ${current?.photo ? 'is-on' : ''}`} aria-hidden="true">
        {neighborhoods.filter((n) => n.photo).map((n) => (
          <img key={n.slug} src={n.photo.src(600)} alt="" loading="lazy" style={{ display: n.slug === active ? 'block' : 'none', objectPosition: n.photo.focus }} />
        ))}
      </div>
    </section>
  );
}
