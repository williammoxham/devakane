import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { neighborhoods } from '../../data/neighborhoods.js';
import { usePrefersReducedMotion } from '../../lib/hooks.js';

const Wave = () => <span className="marquee__dot" aria-hidden="true" />;

// A surf-shop banner of every neighborhood. It drifts on its own,
// speeds up with your scroll, and flips direction when you scroll back up.
export default function Marquee() {
  const track = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = track.current;
    let x = 0;
    let dir = -1;
    let boost = 0;
    let lastY = window.scrollY;
    let raf;
    let hover = false;
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      if (dy !== 0) dir = dy > 0 ? -1 : 1;
      boost = Math.min(18, boost + Math.abs(dy) * 0.12);
    };
    const enter = () => (hover = true);
    const leave = () => (hover = false);
    const tick = () => {
      const half = el.scrollWidth / 2;
      const speed = hover ? 0.15 : 0.6 + boost;
      x += dir * speed;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
      boost *= 0.92;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    };
  }, [reduced]);

  const group = (hidden) => (
    <div className="marquee__group" aria-hidden={hidden || undefined}>
      {neighborhoods.map((n) => (
        <span key={n.slug} style={{ display: 'contents' }}>
          <Link to={`/neighborhoods#${n.slug}`} tabIndex={hidden ? -1 : 0}>{n.name}</Link>
          <Wave />
        </span>
      ))}
    </div>
  );

  return (
    <nav className="marquee" aria-label="Neighborhoods">
      <div className="marquee__track" ref={track}>
        {group(false)}
        {group(true)}
      </div>
    </nav>
  );
}
