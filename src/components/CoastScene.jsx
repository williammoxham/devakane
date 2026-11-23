import { useId } from 'react';
import { skyAt, bodyAt, nightAt, lerpC } from '../lib/sky.js';

// A cliffside home above the bay, with the Santa Cruz Mountains behind
// and a lighthouse on the point. Every color follows the hour.
const STARS = Array.from({ length: 70 }, (_, i) => [
  (i * 397) % 1600,
  (i * 211) % 520,
  ((i * 7) % 3) * 0.6 + 0.8,
]);

const RIDGE = (() => {
  let d = 'M0 560';
  for (let x = 0; x <= 1600; x += 20) {
    const base = 520 - Math.sin(x / 260) * 70 - Math.sin(x / 90) * 18;
    const tooth = x % 40 === 0 ? -14 : 4;
    d += ` L${x} ${(base + tooth).toFixed(1)}`;
  }
  return d + ' L1600 640 L0 640 Z';
})();

export default function CoastScene({ hour = 17, className = '', viewBox = '0 0 1600 1000', label = 'Illustration of a home on the cliffs above Monterey Bay' }) {
  const u = useId().replace(/:/g, '');
  const sky = skyAt(hour);
  const night = nightAt(hour);
  const body = bodyAt(hour);
  const land = lerpC('#4A6650', '#0C1A1F', night * 0.85);
  const land2 = lerpC('#36503F', '#081318', night * 0.85);
  const ridge = lerpC(lerpC(sky.bot, '#2E463A', 0.55), '#0E1E28', night * 0.7);
  const wall = lerpC('#EDE6DA', '#2A3640', night * 0.8);
  const roof = lerpC('#2C3B40', '#0A1216', night * 0.6);
  const glass = lerpC(lerpC(sky.top, '#ffffff', 0.35), '#F6C77E', night);
  const sx = body.x * 16;
  const sy = body.y * 10;
  const sunLow = body.day && body.y > 40;

  return (
    <svg className={`coast ${className}`} viewBox={viewBox} preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
      <defs>
        <linearGradient id={`cs-sky-${u}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1000">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="0.7" stopColor={sky.bot} />
        </linearGradient>
        <linearGradient id={`cs-sea-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lerpC(sky.sea, sky.bot, 0.35)} />
          <stop offset="1" stopColor={lerpC(sky.sea, '#000000', 0.35)} />
        </linearGradient>
        <radialGradient id={`cs-glow-${u}`}>
          <stop offset="0" stopColor={body.day ? '#FFF1C9' : '#E8EEF4'} stopOpacity=".55" />
          <stop offset="1" stopColor={body.day ? '#FFF1C9' : '#E8EEF4'} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`cs-beam-${u}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`cs-beam-l-${u}`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#FFF4D6" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`cs-fog-${u}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#E7ECEC" stopOpacity="0" />
          <stop offset="0.62" stopColor="#E7ECEC" stopOpacity=".9" />
          <stop offset="0.8" stopColor="#E7ECEC" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect y="-700" width="1600" height="1700" fill={`url(#cs-sky-${u})`} />
      <g opacity={night}>
        {STARS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={0.4 + (i % 4) * 0.15} />)}
      </g>
      <circle cx={sx} cy={sy} r="150" fill={`url(#cs-glow-${u})`} />
      <circle cx={sx} cy={sy} r="44" fill={body.day ? '#FDEBC0' : '#E3E9EE'} />

      <path d={RIDGE} fill={ridge} />
      <rect y="600" width="1600" height="400" fill={`url(#cs-sea-${u})`} />
      {sunLow && (
        <path d={`M${sx - 60} 606 L${sx + 60} 606 L${sx + 160} 1000 L${sx - 160} 1000 Z`} fill="#FFE6B8" opacity={0.18 * (1 - night)} />
      )}
      {[640, 690, 760, 850].map((y, i) => (
        <path key={y} className={`coast__swell coast__swell--${i}`} d={`M-100 ${y} Q 200 ${y - 6} 500 ${y} T 1100 ${y} T 1700 ${y}`} stroke={lerpC(sky.bot, '#ffffff', 0.4)} strokeOpacity={0.35 - i * 0.05} strokeWidth="2" fill="none" />
      ))}

      {/* Lighthouse point */}
      <path d="M0 700 L0 640 Q120 610 250 640 L330 700 Z" fill={land2} />
      <g transform="translate(150 548)">
        <rect x="-14" y="20" width="28" height="74" fill={wall} />
        <rect x="-20" y="88" width="40" height="10" fill={roof} />
        <rect x="-18" y="6" width="36" height="16" fill={roof} />
        <rect x="-10" y="-8" width="20" height="16" fill={lerpC('#D9E2E6', '#FFE7A8', night)} />
        <path d="M-14 -8 L0 -22 L14 -8 Z" fill={roof} />
        <g opacity={night} className="coast__beam">
          <path d="M0 0 L700 -46 L700 46 Z" fill={`url(#cs-beam-${u})`} />
          <path d="M0 0 L-700 -46 L-700 46 Z" fill={`url(#cs-beam-l-${u})`} />
        </g>
      </g>

      {/* Cliff and home */}
      <path d="M760 1000 L820 760 Q880 690 1000 680 L1600 650 L1600 1000 Z" fill={land} />
      <path d="M820 760 Q880 690 1000 680 L1060 678" stroke={lerpC(land, '#ffffff', 0.25)} strokeWidth="3" fill="none" />
      <g transform="translate(1060 520)">
        <rect x="0" y="40" width="360" height="122" fill={wall} />
        <rect x="-20" y="22" width="400" height="20" fill={roof} />
        <rect x="250" y="-30" width="150" height="70" fill={wall} />
        <rect x="236" y="-46" width="178" height="18" fill={roof} />
        <rect x="24" y="62" width="200" height="80" fill={glass} />
        <rect x="270" y="-14" width="110" height="42" fill={glass} />
        <rect x="262" y="74" width="54" height="88" fill={roof} />
        <line x1="124" y1="62" x2="124" y2="142" stroke={wall} strokeWidth="4" />
        <rect x="24" y="62" width="200" height="80" fill="#FFC872" opacity={night * 0.35} />
      </g>
      {[1480, 1530, 1575].map((x, i) => (
        <path key={x} d={`M${x} ${520 - i * 26} L${x + 34} 690 L${x - 34} 690 Z`} fill={land2} />
      ))}
      <path d="M0 1000 L0 900 Q400 860 760 920 L840 1000 Z" fill={land2} opacity=".9" />

      <rect width="1600" height="1000" fill={`url(#cs-fog-${u})`} opacity={sky.fog} />
    </svg>
  );
}
