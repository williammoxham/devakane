// Tiny Supabase REST client. No SDK, no extra dependency.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel to switch it on.
// Without them, everything falls back to localStorage so the site works on day one.

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(URL && KEY);

function headers(extra = {}) {
  return {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function insertRow(table, row) {
  if (!supabaseEnabled) {
    const key = `local:${table}`;
    const rows = safeGet(key, []);
    rows.push({ ...row, created_at: new Date().toISOString() });
    safeSet(key, rows);
    return { ok: true, local: true };
  }
  const res = await fetch(`${URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=minimal' }),
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Could not save to ${table} (${res.status})`);
  return { ok: true };
}

export async function selectRows(table, query = '') {
  if (!supabaseEnabled) return safeGet(`local:${table}`, []);
  const res = await fetch(`${URL}/rest/v1/${table}?${query}`, { headers: headers() });
  if (!res.ok) throw new Error(`Could not load ${table} (${res.status})`);
  return res.json();
}

export function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable, ignore */
  }
}
