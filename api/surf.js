// Surf Watch: live ocean conditions for Santa Cruz from public NOAA and National Weather Service data.
// GET /api/surf  ->  { waves, water, tides, weather, updated }
// Cached at the edge for 20 minutes so the site never hammers the sources.
//
// Sources (all U.S. government, free to use):
//   Waves and water temperature: NDBC buoy 46236, Monterey Canyon Outer (CDIP 156); 46042 as a backup
//   Tides: NOAA CO-OPS station 9413745, Santa Cruz, Monterey Bay
//   Wind and weather: api.weather.gov hourly forecast for the Santa Cruz waterfront

const UA = { 'User-Agent': 'DevaKaneSite/1.0 (surf watch; contact via site)', Accept: 'application/json' };
const BUOYS = [
  { id: '46236', name: 'Monterey Canyon Outer buoy' },
  { id: '46042', name: 'Monterey buoy, 27 nm WNW of Monterey' },
];
const TIDE_STATION = '9413745';
const POINT = [36.9615, -122.0236]; // Santa Cruz waterfront, between the wharf and Cowell's

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = (deg) => (Number.isFinite(deg) ? COMPASS[Math.round(deg / 22.5) % 16] : null);
const num = (v) => (v === undefined || v === 'MM' ? null : Number(v));

async function withTimeout(p, ms = 6000) {
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);
}

async function buoy() {
  for (const b of BUOYS) {
    try {
      const r = await withTimeout(fetch(`https://www.ndbc.noaa.gov/data/realtime2/${b.id}.txt`, { headers: UA }));
      if (!r.ok) continue;
      const lines = (await r.text()).split('\n').filter((l) => l && !l.startsWith('#'));
      // columns: YY MM DD hh mm WDIR WSPD GST WVHT DPD APD MWD PRES ATMP WTMP DEWP VIS PTDY TIDE
      let wave = null, water = null;
      for (const l of lines.slice(0, 24)) {
        const c = l.trim().split(/\s+/);
        const when = Date.UTC(+c[0], +c[1] - 1, +c[2], +c[3], +c[4]);
        if (!wave && num(c[8]) !== null) {
          wave = { heightFt: +(num(c[8]) * 3.28084).toFixed(1), periodS: num(c[9]), direction: compass(num(c[11])), directionDeg: num(c[11]), at: new Date(when).toISOString() };
        }
        if (!water && num(c[14]) !== null) water = { tempF: Math.round(num(c[14]) * 9 / 5 + 32), at: new Date(when).toISOString() };
        if (wave && water) break;
      }
      if (wave || water) return { wave, water, buoy: b };
    } catch { /* try the next buoy */ }
  }
  return { wave: null, water: null, buoy: null };
}

async function tides() {
  const ymd = (d) => d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }).replace(/-/g, '');
  const now = new Date();
  const end = new Date(now.getTime() + 2 * 86400000);
  const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=deva_kane_site&begin_date=${ymd(now)}&end_date=${ymd(end)}&datum=MLLW&station=${TIDE_STATION}&time_zone=lst_ldt&units=english&interval=hilo&format=json`;
  try {
    const r = await withTimeout(fetch(url, { headers: UA }));
    const j = await r.json();
    return (j.predictions || []).map((p) => ({ time: p.t, ft: +Number(p.v).toFixed(1), type: p.type === 'H' ? 'high' : 'low' }));
  } catch {
    return [];
  }
}

async function weather() {
  try {
    const p = await withTimeout(fetch(`https://api.weather.gov/points/${POINT[0]},${POINT[1]}`, { headers: UA }));
    const pj = await p.json();
    const f = await withTimeout(fetch(pj.properties.forecastHourly, { headers: UA }));
    const fj = await f.json();
    const h = fj.properties.periods[0];
    return { tempF: h.temperature, wind: h.windSpeed, windFrom: h.windDirection, sky: h.shortForecast, at: h.startTime };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  const [b, t, w] = await Promise.all([buoy(), tides(), weather()]);
  const ok = b.wave || b.water || t.length || w;
  res.setHeader('Cache-Control', ok ? 's-maxage=1200, stale-while-revalidate=3600' : 's-maxage=60');
  res.status(ok ? 200 : 502).json({
    waves: b.wave,
    water: b.water,
    buoy: b.buoy,
    tides: t,
    weather: w,
    tideStation: { id: TIDE_STATION, name: 'Santa Cruz, Monterey Bay' },
    updated: new Date().toISOString(),
  });
}
