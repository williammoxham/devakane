import { useEffect, useRef, useState } from 'react';
// An illustrated "plate" used wherever a photo will eventually go.
// Pass photo to show a real image instead. Same aspect, same crop.

function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map((x) => parseInt(x, 16));
  const pb = b.match(/\w\w/g).map((x) => parseInt(x, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

const scenes = {
  coast: (l, d) => (
    <>
      <rect y="170" width="400" height="130" fill={mix(l, d, 0.55)} />
      <path d="M0 176 Q100 168 200 176 T400 174" stroke={mix(l, '#ffffff', 0.5)} strokeWidth="2" fill="none" opacity=".7" />
      <path d="M0 210 Q120 202 240 212 T400 206" stroke={mix(l, '#ffffff', 0.4)} strokeWidth="1.5" fill="none" opacity=".5" />
      <path d="M250 300 L260 160 Q300 120 340 150 L400 140 L400 300 Z" fill={d} />
      <path d="M262 170 Q300 140 336 158" stroke={mix(d, l, 0.35)} strokeWidth="2" fill="none" />
    </>
  ),
  harbor: (l, d) => (
    <>
      <rect y="190" width="400" height="110" fill={mix(l, d, 0.5)} />
      {[60, 110, 150, 230, 290, 330].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={190} x2={x} y2={110 + (i % 3) * 18} stroke={d} strokeWidth="2" />
          <path d={`M${x - 22} 190 L${x + 22} 190 L${x + 16} 202 L${x - 16} 202 Z`} fill={d} />
        </g>
      ))}
      <rect y="230" width="400" height="70" fill={mix(l, d, 0.7)} />
    </>
  ),
  village: (l, d) => (
    <>
      <rect y="220" width="400" height="80" fill={mix(l, d, 0.6)} />
      {[
        [20, 60], [80, 80], [150, 64], [214, 90], [290, 70], [350, 84],
      ].map(([x, h], i) => (
        <g key={x}>
          <rect x={x} y={220 - h} width="54" height={h} fill={mix(d, l, (i % 3) * 0.18)} />
          <path d={`M${x - 4} ${220 - h} L${x + 27} ${190 - h} L${x + 58} ${220 - h} Z`} fill={mix(d, '#000000', 0.15)} />
          <rect x={x + 20} y={220 - h * 0.55} width="14" height="16" fill={mix(l, '#ffffff', 0.6)} opacity=".8" />
        </g>
      ))}
    </>
  ),
  redwoods: (l, d) => (
    <>
      <path d="M0 220 Q200 180 400 214 L400 300 L0 300 Z" fill={mix(l, d, 0.45)} />
      {[20, 70, 115, 170, 230, 275, 330, 372].map((x, i) => {
        const h = 150 + ((i * 37) % 70);
        return <path key={x} d={`M${x} ${300 - h} L${x + 22} 300 L${x - 22} 300 Z`} fill={mix(d, '#000000', (i % 3) * 0.12)} />;
      })}
    </>
  ),
  hills: (l, d) => (
    <>
      <path d="M0 190 Q90 140 190 180 T400 160 L400 300 L0 300 Z" fill={mix(l, d, 0.4)} />
      <path d="M0 230 Q120 190 230 226 T400 210 L400 300 L0 300 Z" fill={mix(l, d, 0.7)} />
      <path d="M0 270 Q150 240 280 268 T400 258 L400 300 L0 300 Z" fill={d} />
    </>
  ),
  farm: (l, d) => (
    <>
      <path d="M0 170 Q200 150 400 168 L400 300 L0 300 Z" fill={mix(l, d, 0.35)} />
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={i} d={`M${200 - 10 * i} 172 L${-300 + i * 110} 300`} stroke={d} strokeWidth={2 + i * 0.6} opacity=".8" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <path key={`r${i}`} d={`M${200 + 10 * i} 172 L${700 - i * 110} 300`} stroke={d} strokeWidth={2 + i * 0.6} opacity=".8" />
      ))}
    </>
  ),
};

// A photo, revealed as it scrolls into view. Falls back to the illustration if it cannot load.
function Photo({ photo, alt, className, width, fallback }) {
  const ref = useRef(null);
  const [state, setState] = useState('loading'); // loading | ok | error
  const [inView, setInView] = useState(false);
  const src = typeof photo === 'string' ? photo : photo.src(width);
  const focus = typeof photo === 'string' ? '50% 22%' : photo.focus; // plain URLs are headshots: favor the face

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setInView(true);
        io.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (state === 'error') return fallback;
  return (
    <span ref={ref} className={`plate plate--photo ${state === 'ok' && inView ? 'is-in' : ''} ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ objectPosition: focus }}
        onLoad={() => setState('ok')}
        onError={() => setState('error')}
      />
    </span>
  );
}

export default function Plate({ scene = 'coast', tone = ['#C7D9D2', '#3F6B67'], photo, alt = '', className = '', sun = true, width = 1200 }) {
  const [l, d] = tone;
  const id = `g${scene}${l.slice(1)}${d.slice(1)}`;
  const art = (
    <svg className={`plate ${className}`} viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label={alt || `${scene} illustration`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix(l, '#ffffff', 0.45)} />
          <stop offset="1" stopColor={l} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id})`} />
      {sun && <circle cx="252" cy="92" r="22" fill={mix(l, '#ffffff', 0.7)} />}
      {(scenes[scene] || scenes.coast)(l, d)}
    </svg>
  );
  if (photo) return <Photo photo={photo} alt={alt} className={className} width={width} fallback={art} />;
  return art;
}
