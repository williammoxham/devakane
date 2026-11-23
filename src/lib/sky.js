// Sky colors over Monterey Bay by hour (0 to 24). Shared by the hero and the day scrub.
export const KEYS = [
  { h: 0, top: '#08131C', bot: '#1B3344', sea: '#0B2230', fog: 0.08 },
  { h: 5, top: '#1A2741', bot: '#5E6380', sea: '#1D3244', fog: 0.2 },
  { h: 6.5, top: '#4F6E92', bot: '#EBC3A2', sea: '#3B5A6E', fog: 0.45 },
  { h: 9, top: '#7F98A3', bot: '#CBD6D6', sea: '#4D707B', fog: 0.55 },
  { h: 12, top: '#3E86AE', bot: '#BFDDE8', sea: '#245F78', fog: 0.12 },
  { h: 16, top: '#4C88AE', bot: '#E2DCC6', sea: '#265E74', fog: 0.1 },
  { h: 18, top: '#56698F', bot: '#EFAE7C', sea: '#34566C', fog: 0.08 },
  { h: 19.5, top: '#28345A', bot: '#B76F66', sea: '#1D3850', fog: 0.12 },
  { h: 21, top: '#0B1A28', bot: '#22394C', sea: '#0D2535', fog: 0.08 },
  { h: 24, top: '#08131C', bot: '#1B3344', sea: '#0B2230', fog: 0.08 },
];

const hex = (c) => c.match(/\w\w/g).map((x) => parseInt(x, 16));
export const lerpC = (a, b, t) =>
  '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
export const lum = (c) => {
  const [r, g, b] = hex(c).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export function skyAt(h) {
  h = ((h % 24) + 24) % 24;
  let i = KEYS.findIndex((k) => k.h > h) - 1;
  if (i < 0) i = 0;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = (h - a.h) / (b.h - a.h);
  return {
    top: lerpC(a.top, b.top, t),
    bot: lerpC(a.bot, b.bot, t),
    sea: lerpC(a.sea, b.sea, t),
    fog: a.fog + (b.fog - a.fog) * t,
  };
}

// Where the sun (day) or moon (night) sits, in percent of the scene.
export function bodyAt(h) {
  const day = h >= 6.5 && h <= 19.5;
  const t = day ? (h - 6.5) / 13 : ((h < 6.5 ? h + 24 : h) - 19.5) / 11;
  return { day, x: 12 + t * 76, y: 62 - Math.sin(t * Math.PI) * 46 };
}

// 0 in daylight, 1 at full night. Drives window lights, stars, the lighthouse.
export function nightAt(h) {
  if (h >= 7.5 && h <= 18) return 0;
  if (h > 18 && h < 20.5) return (h - 18) / 2.5;
  if (h > 5 && h < 7.5) return (7.5 - h) / 2.5;
  return 1;
}

export function fmtHour(h) {
  const hh = Math.floor(h) % 24;
  const mm = Math.floor((h - Math.floor(h)) * 60);
  return new Date(2000, 0, 1, hh, mm).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
