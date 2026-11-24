// Surf Watch data for the browser.
// First choice is the site's own /api/surf (buoy, tides and weather, cached at the edge).
// If that is unavailable or comes back partial, the tide and the forecast are fetched straight
// from NOAA and the National Weather Service, which both allow requests from any website.
// The buoy file does not, so swell and water temperature need /api/surf.

const API = import.meta.env.VITE_API_BASE || '';
const TIDE_STATION = '9413745';
const POINT = [36.9615, -122.0236];

function timeout(ms) {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function getJSON(url, ms = 8000) {
  const r = await fetch(url, { signal: timeout(ms), headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

export async function tidesDirect() {
  const ymd = (d) => d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }).replace(/-/g, '');
  const now = new Date();
  const end = new Date(now.getTime() + 2 * 864e5);
  const j = await getJSON(`https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=deva_kane_site&begin_date=${ymd(now)}&end_date=${ymd(end)}&datum=MLLW&station=${TIDE_STATION}&time_zone=lst_ldt&units=english&interval=hilo&format=json`);
  return (j.predictions || []).map((p) => ({ time: p.t, ft: +Number(p.v).toFixed(1), type: p.type === 'H' ? 'high' : 'low' }));
}

export async function weatherDirect() {
  const p = await getJSON(`https://api.weather.gov/points/${POINT[0]},${POINT[1]}`);
  const f = await getJSON(p.properties.forecastHourly);
  const h = f.properties.periods[0];
  return { tempF: h.temperature, wind: h.windSpeed, windFrom: h.windDirection, sky: h.shortForecast, at: h.startTime };
}

export async function loadSurf() {
  let d = null;
  try { d = await getJSON(`${API}/api/surf`, 12000); } catch { /* fall through to direct sources */ }
  d = d || { waves: null, water: null, buoy: null, tides: [], weather: null, direct: true };
  const [t, w] = await Promise.all([
    d.tides?.length ? d.tides : tidesDirect().catch(() => []),
    d.weather ? d.weather : weatherDirect().catch(() => null),
  ]);
  const out = { ...d, tides: t, weather: w, tideStation: { id: TIDE_STATION, name: 'Santa Cruz, Monterey Bay' }, updated: d.updated || new Date().toISOString() };
  const any = out.waves || out.water || out.tides.length || out.weather;
  if (!any) throw new Error('no surf data');
  return out;
}
