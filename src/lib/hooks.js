import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

// Progress (0..1) of an element scrolling through the viewport.
// 0 when its top hits the bottom of the viewport... 1 when its bottom leaves the top.
// For sticky "scenes", pass mode 'pinned': 0 when top reaches viewport top, 1 when bottom reaches viewport bottom.
export function useScrollProgress(mode = 'pinned') {
  const ref = useRef(null);
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let v;
      if (mode === 'pinned') {
        const total = r.height - vh;
        v = total > 0 ? -r.top / total : 0;
      } else {
        v = (vh - r.top) / (vh + r.height);
      }
      setP(Math.min(1, Math.max(0, v)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [mode]);
  return [ref, p];
}

export function useInView(options = { threshold: 0.2 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

// Current time in Santa Cruz, refreshed every minute.
export function usePacificTime() {
  const get = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const h = Number(parts.find((x) => x.type === 'hour').value) % 24;
    const m = Number(parts.find((x) => x.type === 'minute').value);
    return { hour: h, minute: m, decimal: h + m / 60 };
  };
  const [t, setT] = useState(get);
  useEffect(() => {
    const id = setInterval(() => setT(get()), 60000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export const fmtMoney = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
