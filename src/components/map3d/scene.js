// Santa Cruz County as a 3D survey drawing.
// Real county boundary (U.S. Census atlas) with a hand-traced coastline. Terrain comes from real
// elevation tiles when they load, otherwise from a model fitted to known elevations. It is drawn like a landscape architect's sheet: ink contours, slope hatching, a section-cut
// edge and bathymetry lines, with a painted, realistic window that follows wherever you look.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import outline from '../../data/countyOutline.json';

const LAT0 = 37.03, LON0 = -121.95, K = 160;
const COS = Math.cos((LAT0 * Math.PI) / 180);
export const project = ([lat, lon]) => [(lon - LON0) * COS * K, -(lat - LAT0) * K];
export const KM = K / 111; // scene units per km
export const EXAGGERATION = 3;
const VERT = (KM / 1000) * EXAGGERATION; // scene units per meter: real scale, heights x3
const CONTOUR_M = 50;

const ring = outline.ring.map(([lon, lat]) => project([lat, lon]));
const coast = outline.coast.map(([lon, lat]) => project([lat, lon]));

// Drawing palette. These go to the shaders as raw sRGB.
const HEX = { paper: '#e9eae4', ink: '#1c2a2e', water: '#2b5b6e', shallow: '#3f7f8c', deep: '#173f4d', bronze: '#9c5634' };
const v3 = (hex) => new THREE.Vector3(parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255);
const rawColor = (hex) => { const v = v3(hex); return new THREE.Color().setRGB(v.x, v.y, v.z, THREE.LinearSRGBColorSpace); };

function inside([x, z], poly = ring) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1)));
  const x = a[0] + t * dx, z = a[1] + t * dz;
  return [Math.hypot(p[0] - x, p[1] - z), [x, z], t];
}
function lineDist(p, line, closed = false) {
  let best = [Infinity, null, 0, 0];
  const n = closed ? line.length : line.length - 1;
  for (let i = 0; i < n; i++) {
    const r = segDist(p, line[i], line[(i + 1) % line.length]);
    if (r[0] < best[0]) best = [r[0], r[1], r[2], i];
  }
  return best;
}
const inland = ring.filter((p) => !coast.some((c) => Math.hypot(c[0] - p[0], c[1] - p[1]) < 0.01));

function hash(x, z) { const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, z) => vnoise(x, z) * 0.55 + vnoise(x * 2.1, z * 2.1) * 0.28 + vnoise(x * 4.3, z * 4.3) * 0.17;
const ridged = (x, z) => { const n = 1 - Math.abs(2 * vnoise(x, z) - 1); return n * n; };

const g = (p, c, r) => Math.exp(-((p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2) / (2 * r * r));
const toLatLon = ([x, z]) => [LAT0 - z / K, x / (COS * K) + LON0];
const slvRiver = [[36.964, -122.012], [36.975, -122.025], [37.0, -122.05], [37.04, -122.065], [37.07, -122.08], [37.1, -122.1], [37.131, -122.124], [37.16, -122.14]].map(project);
const PAJARO = project([36.91, -121.76]);

// ---------- terrain source 1: real elevation (live site) ----------
// Terrarium tiles derived from USGS and SRTM elevation, public on AWS. Loaded once per visit.
let DEM = null;
export const terrain = { source: 'model' };
async function loadDEM(timeout = 7000) {
  if (DEM) return true;
  const Z = 10, N2 = 2 ** Z;
  const tx = (lon) => ((lon + 180) / 360) * N2;
  const ty = (lat) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * N2; };
  const x0 = Math.floor(tx(-122.36)), x1 = Math.floor(tx(-121.56));
  const y0 = Math.floor(ty(37.31)), y1 = Math.floor(ty(36.83));
  const W = (x1 - x0 + 1) * 256, Hh = (y1 - y0 + 1) * 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = Hh;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  const jobs = [];
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      jobs.push(
        fetch(`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${Z}/${x}/${y}.png`, { mode: 'cors' })
          .then((r) => { if (!r.ok) throw new Error('tile'); return r.blob(); })
          .then((b) => createImageBitmap(b))
          .then((img) => ctx.drawImage(img, (x - x0) * 256, (y - y0) * 256))
      );
    }
  }
  try {
    await Promise.race([Promise.all(jobs), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), timeout))]);
    const px = ctx.getImageData(0, 0, W, Hh).data;
    const E = new Float32Array(W * Hh);
    for (let i = 0; i < E.length; i++) E[i] = px[i * 4] * 256 + px[i * 4 + 1] + px[i * 4 + 2] / 256 - 32768;
    DEM = (lat, lon) => {
      const fx = (tx(lon) - x0) * 256 - 0.5, fy = (ty(lat) - y0) * 256 - 0.5;
      const i = Math.max(0, Math.min(W - 2, Math.floor(fx))), j = Math.max(0, Math.min(Hh - 2, Math.floor(fy)));
      const u = Math.min(1, Math.max(0, fx - i)), v = Math.min(1, Math.max(0, fy - j));
      const k = j * W + i;
      return (E[k] * (1 - u) + E[k + 1] * u) * (1 - v) + (E[k + W] * (1 - u) + E[k + W + 1] * u) * v;
    };
    terrain.source = 'real';
    return true;
  } catch {
    return false;
  }
}

// ---------- terrain source 2: a model built from known elevations ----------
// Approximate spot elevations in meters for peaks, ridges, valleys and towns across the county. A smooth surface is fitted
// through them, creek valleys are cut in, and the coast is held to its low marine terraces.
const SPOTS = [
  // coast and the flat towns
  [36.974, -122.026, 10], [36.958, -122.045, 25], [36.965, -122.008, 15], [36.98, -121.98, 30], [36.975, -121.953, 20],
  [36.988, -121.957, 40], [36.977, -121.9, 45], [36.966, -121.89, 25], [36.93, -121.86, 35], [36.91, -121.757, 10],
  [36.93, -121.79, 25], [36.89, -121.73, 8], [36.95, -121.745, 40], [36.945, -121.78, 45], [37.011, -122.196, 30],
  [37.0, -122.12, 60], [36.98, -122.08, 45], [37.06, -122.24, 60], [37.097, -122.275, 20], [36.87, -121.8, 5],
  // Santa Cruz hills and Scotts Valley
  [37.0, -122.06, 250], [37.012, -122.068, 330], [36.995, -122.04, 140], [37.05, -122.013, 170], [37.02, -122.0, 190],
  [37.07, -122.0, 290], [37.035, -121.99, 230],
  // San Lorenzo Valley and Ben Lomond Mountain
  [37.051, -122.073, 85], [37.089, -122.086, 120], [37.126, -122.122, 150], [37.106, -122.105, 140], [37.11, -122.05, 330],
  [37.09, -122.04, 210], [37.04, -122.15, 450], [37.08, -122.17, 760], [37.12, -122.2, 690], [37.05, -122.13, 480],
  [37.06, -122.1, 300], [37.15, -122.16, 520],
  // north county, Big Basin and the Skyline crest along the county line
  [37.172, -122.222, 300], [37.15, -122.27, 330], [37.2, -122.2, 520], [37.25, -122.15, 720], [37.27, -122.13, 700],
  [37.22, -122.09, 950], [37.2, -122.04, 830], [37.18, -122.07, 600], [37.15, -122.1, 420], [37.14, -122.02, 520],
  [37.12, -121.98, 560], [37.15, -121.99, 700],
  // Soquel and Aptos hills, the Forest of Nisene Marks, the Loma Prieta side
  [37.02, -121.95, 190], [37.05, -121.96, 340], [37.1, -121.95, 450], [37.0, -121.88, 190], [37.03, -121.9, 380],
  [37.06, -121.89, 590], [37.08, -121.92, 520], [37.11, -121.86, 900], [37.09, -121.83, 780],
  // Corralitos, Mount Madonna side, the Pajaro gap
  [36.99, -121.8, 90], [36.97, -121.77, 70], [37.01, -121.71, 520], [36.99, -121.73, 300], [37.04, -121.76, 560],
  [37.06, -121.8, 680], [36.97, -121.68, 250], [36.94, -121.63, 120], [36.91, -121.6, 50], [36.92, -121.66, 60],
];
const RIVERS = [
  slvRiver,
  [[36.972, -121.952], [36.99, -121.956], [37.01, -121.95], [37.04, -121.93], [37.07, -121.92]], // Soquel Creek
  [[36.97, -121.905], [36.99, -121.9], [37.02, -121.9], [37.05, -121.895]], // Aptos Creek
  [[37.05, -122.07], [37.07, -122.05], [37.1, -122.04], [37.13, -122.03]], // Zayante Creek
  [[36.975, -122.02], [37.0, -122.01], [37.03, -121.995]], // Branciforte Creek
  [[37.035, -122.23], [37.07, -122.22], [37.1, -122.2]], // Scott Creek
  [[37.097, -122.278], [37.13, -122.26], [37.16, -122.24]], // Waddell Creek
  [[36.92, -121.77], [36.96, -121.79], [36.99, -121.8], [37.02, -121.79]], // Corralitos Creek
].map((r, i) => (i === 0 ? r : r.map(project)));

// Thin-plate spline through the spot elevations (coordinates in km).
const TPS = (() => {
  const P = SPOTS.map(([la, lo]) => project([la, lo]).map((v) => v / KM));
  const n = P.length, m = n + 3;
  const phi = (r) => (r < 1e-9 ? 0 : r * r * Math.log(r));
  const A = Array.from({ length: m }, () => new Float64Array(m + 1));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) A[i][j] = phi(Math.hypot(P[i][0] - P[j][0], P[i][1] - P[j][1])) + (i === j ? 2 : 0);
    A[i][n] = 1; A[i][n + 1] = P[i][0]; A[i][n + 2] = P[i][1];
    A[n][i] = 1; A[n + 1][i] = P[i][0]; A[n + 2][i] = P[i][1];
    A[i][m] = SPOTS[i][2];
  }
  for (let c = 0; c < m; c++) {
    let piv = c;
    for (let r = c + 1; r < m; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    for (let r = 0; r < m; r++) {
      if (r === c || !A[r][c]) continue;
      const f = A[r][c] / A[c][c];
      for (let k = c; k <= m; k++) A[r][k] -= f * A[c][k];
    }
  }
  const w = Array.from({ length: m }, (_, i) => A[i][m] / A[i][i]);
  return (p) => {
    const x = p[0] / KM, z = p[1] / KM;
    let h = w[n] + w[n + 1] * x + w[n + 2] * z;
    for (let i = 0; i < n; i++) h += w[i] * phi(Math.hypot(x - P[i][0], z - P[i][1]));
    return h;
  };
})();

function modelMeters(p) {
  let h = TPS(p);
  // gentle texture: ravines and spur ridges in the hills, nothing on the flats
  const hillness = Math.min(1, Math.max(0, (h - 60) / 250));
  h += hillness * (h * 0.14 * (ridged(p[0] * 0.55, p[1] * 0.55) - 0.45) + 22 * (vnoise(p[0] * 1.7, p[1] * 1.7) - 0.5));
  // creeks carve their valleys
  for (const r of RIVERS) {
    const d = lineDist(p, r)[0] / KM;
    if (d < 2) h -= (h - 10) * 0.5 * Math.exp(-(d * d) / 0.35);
  }
  // marine terraces along the shore
  const dc = lineDist(p, coast)[0] / KM;
  h = Math.min(h, 10 + dc * 120);
  return h;
}

export function heightAt(p) {
  const m = DEM ? DEM(...toLatLon(p)) : modelMeters(p);
  return Math.max(2, m) * VERT;
}

// ---------- shared GLSL ----------
const GLSL_COMMON = /* glsl */ `
uniform vec2 uFocus; uniform float uRadius; uniform vec3 uPaper; uniform vec3 uInk;
uniform float uFadeNear; uniform float uFadeFar;
float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(h21(i),h21(i+vec2(1.0,0.0)),u.x), mix(h21(i+vec2(0.0,1.0)),h21(i+vec2(1.0,1.0)),u.x), u.y); }
// The painted window: soft, slightly ragged like a watercolor wash.
float realMask(vec2 xz){
  float n = vn(xz*0.09)*0.7 + vn(xz*0.35)*0.3;
  float d = length(xz - uFocus) + (n - 0.5) * uRadius * 0.4;
  return 1.0 - smoothstep(uRadius*0.72, uRadius, d);
}
// Antialiased line at every integer of s, w = half width in pixels.
float lineAA(float s, float w){ float d = abs(fract(s + 0.5) - 0.5) / max(fwidth(s), 1e-5); return 1.0 - smoothstep(w - 0.5, w + 0.5, d); }
float denseFade(float s, float a, float b){ return 1.0 - smoothstep(a, b, fwidth(s)); }
`;

const sharedUniforms = () => ({
  uFocus: { value: new THREE.Vector2() },
  uRadius: { value: 28 },
  uPaper: { value: v3(HEX.paper) },
  uInk: { value: v3(HEX.ink) },
  uFadeNear: { value: 110 },
  uFadeFar: { value: 240 },
});

// ---------- terrain ----------
const CITIES = [
  [[36.975, -122.03], 3.2], [[36.972, -121.965], 2.8], [[36.975, -121.895], 2.0], [[37.05, -122.013], 1.7],
  [[36.913, -121.757], 2.6], [[37.055, -122.072], 0.9], [[37.126, -122.122], 0.8], [[36.97, -122.06], 1.4],
  [[36.972, -121.99], 1.6], [[36.972, -121.925], 1.5], [[36.955, -121.87], 1.3], [[36.94, -121.85], 1.0], [[37.09, -122.087], 0.7],
].map(([ll, r]) => [project(ll), r * KM]);

function buildTerrain(uniforms, sunDir) {
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  ring.forEach(([x, z]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minZ = Math.min(minZ, z); maxZ = Math.max(maxZ, z); });
  const N = 300;
  const sx = (maxX - minX) / N, sz = (maxZ - minZ) / N;
  const V = (N + 1) * (N + 1);
  const pos = new Float32Array(V * 3), uv = new Float32Array(V * 2);
  const H = new Float32Array(V), DC = new Float32Array(V), RV = new Float32Array(V), ins = new Uint8Array(V);
  for (let j = 0, k = 0; j <= N; j++) {
    for (let i = 0; i <= N; i++, k++) {
      let p = [minX + i * sx, minZ + j * sz];
      const isIn = inside(p);
      if (!isIn) p = lineDist(p, ring, true)[1];
      const h = heightAt(p);
      H[k] = h; DC[k] = lineDist(p, coast)[0] / KM; RV[k] = Math.exp(-((lineDist(p, slvRiver)[0] / KM) ** 2) / 0.8); ins[k] = isIn ? 1 : 0;
      pos[k * 3] = p[0]; pos[k * 3 + 1] = h; pos[k * 3 + 2] = p[1];
      uv[k * 2] = (p[0] - minX) / (maxX - minX); uv[k * 2 + 1] = (p[1] - minZ) / (maxZ - minZ);
    }
  }
  const idx = [];
  const id = (i, j) => j * (N + 1) + i;
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const a = id(i, j), b = id(i + 1, j), c = id(i, j + 1), d = id(i + 1, j + 1);
      if (ins[a] || ins[b] || ins[d]) idx.push(a, c, b);
      if (ins[b] || ins[c] || ins[d]) idx.push(b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const tex = new THREE.CanvasTexture(paintLand({ N, H, DC, RV, minX, maxX, minZ, maxZ, sx, sz }));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.anisotropy = 8;

  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95, metalness: 0 });
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms, { uSun: { value: sunDir }, uMinor: { value: CONTOUR_M * VERT } });
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vWP; varying vec3 vWN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vWN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWP; varying vec3 vWN; uniform vec3 uSun; uniform float uMinor;\n${GLSL_COMMON}`)
      .replace('#include <dithering_fragment>', /* glsl */ `#include <dithering_fragment>
        vec3 realC = gl_FragColor.rgb;
        float m = realMask(vWP.xz);
        float ndl = clamp(dot(normalize(vWN), uSun), 0.0, 1.0);
        // Paper side: soft wash plus pen hatching on the shaded slopes.
        vec3 paper = uPaper * (0.84 + 0.16 * ndl);
        float sa = (vWP.x - vWP.z) * 2.4, sb = (vWP.x + vWP.z) * 2.4;
        float hf = denseFade(sa, 0.22, 0.55);
        paper = mix(paper, uInk, lineAA(sa, 0.5) * smoothstep(0.66, 0.3, ndl) * 0.38 * hf);
        paper = mix(paper, uInk, lineAA(sb, 0.5) * smoothstep(0.42, 0.14, ndl) * 0.32 * hf);
        vec3 col = mix(paper, realC, m);
        // Contours: every 50 m, with a heavier index line every 250 m.
        float s1 = vWP.y / uMinor, s5 = vWP.y / (uMinor * 5.0);
        float c1 = lineAA(s1, 0.45) * denseFade(s1, 0.2, 0.5);
        float c5 = lineAA(s5, 0.85) * denseFade(s5, 0.08, 0.22);
        float above = step(uMinor * 0.6, vWP.y);
        vec3 inkHere = mix(uInk, realC * 0.5, m);
        col = mix(col, inkHere, c1 * mix(0.42, 0.22, m) * above);
        col = mix(col, inkHere, c5 * mix(0.85, 0.45, m) * above);
        gl_FragColor.rgb = mix(col, uPaper, smoothstep(uFadeNear, uFadeFar, length(vViewPosition)));`);
  };
  mat.extensions = { derivatives: true };
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  return mesh;
}

// The realistic land layer, painted once into a texture: golden grass on sun-facing slopes,
// redwood and oak on the shady ones, beaches, towns, and the Pajaro Valley's field patchwork.
function paintLand({ N, H, DC, RV, minX, maxX, minZ, maxZ, sx, sz }) {
  const T = window.innerWidth < 700 ? 1536 : 2048;
  const cv = document.createElement('canvas');
  cv.width = cv.height = T;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(T, T);
  const d = img.data;
  const at = (A, gx, gz) => {
    const i = Math.min(N - 1, Math.floor(gx)), j = Math.min(N - 1, Math.floor(gz));
    const fx = gx - i, fz = gz - j, r = N + 1;
    const a = A[j * r + i], b = A[j * r + i + 1], c = A[(j + 1) * r + i], e = A[(j + 1) * r + i + 1];
    return (a * (1 - fx) + b * fx) * (1 - fz) + (c * (1 - fx) + e * fx) * fz;
  };
  const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const C = {
    gold: [184, 166, 118], gold2: [162, 152, 106], dry: [146, 140, 104],
    forest: [38, 60, 42], forest2: [56, 80, 54], oak: [84, 98, 64],
    chap: [106, 106, 80], sand: [220, 210, 182], town: [178, 175, 164], town2: [156, 154, 146], roof: [160, 124, 102],
  };
  const FIELDS = [[104, 140, 72], [140, 160, 86], [170, 156, 108], [86, 114, 62], [194, 178, 128], [122, 132, 70]];
  const rot = Math.cos(0.42), rsn = Math.sin(0.42);
  for (let py = 0; py < T; py++) {
    const z = minZ + ((py + 0.5) / T) * (maxZ - minZ);
    const gz = (z - minZ) / sz;
    for (let px = 0; px < T; px++) {
      const x = minX + ((px + 0.5) / T) * (maxX - minX);
      const gx = (x - minX) / sx;
      const h = at(H, gx, gz), hm = h / VERT;
      const hx = at(H, Math.min(N, gx + 0.5), gz) - at(H, Math.max(0, gx - 0.5), gz);
      const hz = at(H, gx, Math.min(N, gz + 0.5)) - at(H, gx, Math.max(0, gz - 0.5));
      const slope = Math.hypot(hx / sx, hz / sz);
      const south = slope > 1e-4 ? (-hz / sz) / slope : 0; // +1 faces south (into the sun)
      const n1 = fbm(x * 0.5, z * 0.5) * 0.6 + fbm(x * 2.2, z * 2.2) * 0.4, n2 = vnoise(x * 6, z * 6), n3 = vnoise(x * 22, z * 22);
      const dc = at(DC, gx, gz);
      const p = [x, z];
      const river = at(RV, gx, gz);
      let forest = 0.6 - south * 0.45 * Math.min(1, slope * 1.4) + (n1 - 0.5) * 1.3 + (hm > 90 ? 0.12 : -0.4) + river * 0.5 - (hm > 820 ? 0.3 : 0) - Math.max(0, 1 - dc / 2.5) * 0.35;
      forest = Math.max(0, Math.min(1, (forest - 0.4) * 2.0 + 0.5));
      const grass = mix3(mix3(C.gold, C.gold2, n2), C.dry, Math.max(0, n3 - 0.6));
      const trees = mix3(mix3(C.forest, C.forest2, n2), C.oak, Math.max(0, 0.6 - forest) * 0.8);
      let c = mix3(grass, trees, forest);
      c = mix3(c, C.chap, Math.max(0, Math.min(1, (hm - 650) / 300)) * 0.55);
      // Fields in the Pajaro Valley
      const farm = g(p, PAJARO, 7 * KM) * (hm < 90 ? 1 : 0);
      if (farm > 0.05) {
        const u = (x * rot - z * rsn) / 0.85, w = (x * rsn + z * rot) / 0.55;
        const fu = Math.floor(u), fw = Math.floor(w);
        const fc = FIELDS[Math.floor(hash(fu, fw) * FIELDS.length)];
        const edge = Math.min(u - fu, 1 - (u - fu), w - fw, 1 - (w - fw)) < 0.05 ? 0.78 : 1;
        const rows = 0.93 + 0.07 * Math.sin((x * rot - z * rsn) * 90);
        c = mix3(c, fc.map((v) => v * edge * rows), Math.min(1, farm * 1.6));
      }
      // Towns
      let urban = 0;
      for (const [cp, r] of CITIES) urban = Math.max(urban, g(p, cp, r * 0.75));
      urban *= hm < 260 ? 1 : 0;
      urban = Math.max(0, Math.min(1, (urban - 0.25) * 1.8 + (n1 - 0.5) * 0.4));
      if (urban > 0.02) {
        const bx = Math.floor(x * 5), bz = Math.floor(z * 5), hb = hash(bx, bz);
        const blk = hb < 0.07 ? C.roof : hb < 0.55 ? C.town : C.town2;
        const street = (Math.abs(((x * 3.2) % 1 + 1) % 1 - 0.5) < 0.05 || Math.abs(((z * 3.2) % 1 + 1) % 1 - 0.5) < 0.05) ? 0.82 : 1;
        const tree = n2 > 0.6 ? mix3(blk, C.forest2, 0.6) : blk;
        c = mix3(c, tree.map((v) => v * street), urban * 0.75);
      }
      // Beach
      const beach = Math.max(0, 1 - dc / 0.25) * (hm < 40 ? 1 : 0);
      c = mix3(c, C.sand, beach);
      const k = (py * T + px) * 4;
      const shade = 0.94 + 0.08 * (n3 - 0.5);
      d[k] = c[0] * shade; d[k + 1] = c[1] * shade; d[k + 2] = c[2] * shade; d[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}

// ---------- sea and drafting sheet ----------
function buildSheet(uniforms) {
  // Coast extended at both ends so the sea side and the depth lines carry on past the county.
  const ext = (a, b, len) => { const dx = a[0] - b[0], dz = a[1] - b[1], L = Math.hypot(dx, dz); return [a[0] + (dx / L) * len, a[1] + (dz / L) * len]; };
  const line = [ext(coast[0], coast[1], 80), ...coast, ext(coast[coast.length - 1], coast[coast.length - 2], 80)];
  const side = (p) => {
    const [, , , i] = lineDist(p, line);
    const a = line[i], b = line[i + 1];
    return Math.sign((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]));
  };
  const seaSign = side(project([36.85, -122.0]));
  const S = 320, R = 220;
  const geo = new THREE.PlaneGeometry(S, S, R, R);
  geo.rotateX(-Math.PI / 2);
  const P = geo.attributes.position;
  const sea = new Float32Array(P.count), dist = new Float32Array(P.count);
  for (let i = 0; i < P.count; i++) {
    const p = [P.getX(i), P.getZ(i)];
    const isSea = !inside(p) && side(p) === seaSign;
    sea[i] = isSea ? 1 : 0;
    dist[i] = lineDist(p, line)[0] / KM;
  }
  geo.setAttribute('aSea', new THREE.BufferAttribute(sea, 1));
  geo.setAttribute('aDist', new THREE.BufferAttribute(dist, 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uKm: { value: KM }, uWaterInk: { value: v3(HEX.water) }, uShallow: { value: v3(HEX.shallow) }, uDeep: { value: v3(HEX.deep) } },
    extensions: { derivatives: true },
    vertexShader: /* glsl */ `
      attribute float aSea; attribute float aDist;
      varying vec3 vWP; varying float vSea; varying float vDist; varying float vDepth;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWP = w.xyz; vSea = aSea; vDist = aDist;
        vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `
      ${GLSL_COMMON}
      uniform float uKm; uniform vec3 uWaterInk; uniform vec3 uShallow; uniform vec3 uDeep;
      varying vec3 vWP; varying float vSea; varying float vDist; varying float vDepth;
      void main(){
        vec3 col = uPaper;
        // Drafting grid: 1 km squares with a stronger line every 5 km.
        vec2 g1 = vWP.xz / uKm, g5 = g1 / 5.0;
        float f1 = denseFade(g1.x, 0.12, 0.35), f5 = denseFade(g5.x, 0.12, 0.4);
        col = mix(col, uInk, max(lineAA(g1.x, 0.5), lineAA(g1.y, 0.5)) * 0.06 * f1);
        col = mix(col, uInk, max(lineAA(g5.x, 0.5), lineAA(g5.y, 0.5)) * 0.14 * f5);
        // Sea: a pale ink wash with depth lines every kilometer offshore.
        float m = realMask(vWP.xz);
        float near = 1.0 - smoothstep(0.0, 16.0, vDist);
        vec3 draw = mix(col, uWaterInk, 0.10 * near + 0.03);
        float b = vDist;
        float bl = lineAA(b, 0.5) * denseFade(b, 0.18, 0.45) * (1.0 - smoothstep(6.0, 18.0, vDist)) * step(0.5, vDist);
        draw = mix(draw, uWaterInk, bl * 0.5);
        vec3 water = mix(uShallow, uDeep, smoothstep(0.0, 6.0, vDist));
        water *= 0.97 + 0.03 * vn(vWP.xz * 3.0) + 0.02 * vn(vWP.xz * 14.0);
        water = mix(water, vec3(0.86, 0.92, 0.9), (1.0 - smoothstep(0.0, 0.35, vDist)) * 0.55); // surf
        vec3 seaCol = mix(draw, water, m);
        seaCol = mix(seaCol, vec3(1.0), bl * 0.1 * m);
        col = mix(col, seaCol, vSea);
        gl_FragColor = vec4(mix(col, uPaper, smoothstep(uFadeNear, uFadeFar, vDepth)), 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = false;
  return mesh;
}

// The county's inland edge, cut like an architectural section with poché hatching.
function buildSection(uniforms) {
  const pos = [];
  const base = -3;
  const pts = [];
  for (let i = 0; i < ring.length - 1; i++) {
    const a = ring[i], b = ring[i + 1];
    const n = Math.max(2, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5));
    for (let k = 0; k < n; k++) pts.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  pts.push(pts[0]);
  const top = pts.map((p) => heightAt(p));
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, z0] = pts[i], [x1, z1] = pts[i + 1];
    pos.push(x0, top[i], z0, x0, base, z0, x1, base, z1, x0, top[i], z0, x1, base, z1, x1, top[i + 1], z1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const mat = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.DoubleSide,
    extensions: { derivatives: true },
    vertexShader: /* glsl */ `varying vec3 vWP; varying float vDepth;
      void main(){ vec4 w = modelMatrix * vec4(position,1.0); vWP = w.xyz; vec4 mv = viewMatrix * w; vDepth = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: /* glsl */ `${GLSL_COMMON}
      varying vec3 vWP; varying float vDepth;
      void main(){
        vec3 col = mix(uPaper, uInk, 0.16);
        float s = (vWP.x + vWP.z + vWP.y * 1.4) * 3.0;
        col = mix(col, uInk, lineAA(s, 0.5) * 0.55 * denseFade(s, 0.25, 0.6));
        gl_FragColor = vec4(mix(col, uPaper, smoothstep(uFadeNear, uFadeFar, vDepth)), 1.0);
      }`,
  });
  return { mesh: new THREE.Mesh(geo, mat), edge: pts.map((p, i) => new THREE.Vector3(p[0], top[i] + 0.04, p[1])) };
}

// A line laid over the terrain.
function drape(latlons, lift = 0.07, step = 0.35, smooth = true) {
  const pts = latlons.map((ll) => { const [x, z] = Array.isArray(ll[0]) ? ll : project(ll); return new THREE.Vector3(x, 0, z); });
  const curve = smooth && pts.length > 2 ? new THREE.CatmullRomCurve3(pts, false, 'centripetal') : null;
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += pts[i].distanceTo(pts[i - 1]);
  const n = Math.max(2, Math.ceil(len / step));
  const out = [];
  for (let i = 0; i <= n; i++) {
    let v;
    if (curve) v = curve.getPoint(i / n);
    else {
      let t = (i / n) * len, k = 1;
      while (k < pts.length - 1 && t > pts[k].distanceTo(pts[k - 1])) { t -= pts[k].distanceTo(pts[k - 1]); k++; }
      v = pts[k - 1].clone().lerp(pts[k], Math.min(1, t / (pts[k].distanceTo(pts[k - 1]) || 1)));
    }
    const p = [v.x, v.z];
    out.push(new THREE.Vector3(v.x, (inside(p) ? heightAt(p) : 0.02) + lift, v.z));
  }
  return out;
}

const HWY1 = [[37.098, -122.279], [37.06, -122.235], [37.011, -122.196], [36.985, -122.135], [36.958, -122.08], [36.968, -122.045], [36.983, -122.02], [36.986, -121.99], [36.982, -121.96], [36.974, -121.93], [36.962, -121.9], [36.945, -121.865], [36.925, -121.825], [36.905, -121.79], [36.89, -121.77]];
const HWY17 = [[36.983, -122.02], [37.01, -122.018], [37.035, -122.016], [37.055, -122.012], [37.08, -121.998], [37.1, -121.985], [37.113, -121.978]];

export async function createMap(container, { areas, onSelect, onReady, onFrame, reducedMotion }) {
  await loadDEM();
  const w = () => container.clientWidth, h = () => container.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(w(), h());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const labels = new CSS2DRenderer();
  labels.setSize(w(), h());
  labels.domElement.className = 'map3d__labels';
  container.appendChild(labels.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(HEX.paper);
  scene.fog = new THREE.Fog(rawColor(HEX.paper), 110, 240);

  const camera = new THREE.PerspectiveCamera(36, w() / h(), 0.5, 700);
  const HOME = { pos: new THREE.Vector3(10, 66, 82), target: new THREE.Vector3(-4, 0, 4) };
  camera.position.copy(HOME.pos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 7;
  controls.maxDistance = 170;
  controls.maxPolarAngle = Math.PI * 0.45;
  // Touch: one finger turns and tilts, pinch zooms, two fingers slide the map along the ground.
  // Mouse: drag to turn, right-drag or shift-drag to slide; the wheel is handled by onWheel below.
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.screenSpacePanning = false;
  controls.zoomSpeed = 1.1;
  controls.rotateSpeed = matchMedia('(pointer: coarse)').matches ? 0.7 : 1;
  controls.panSpeed = 0.9;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.3;

  const sunDir = new THREE.Vector3(-60, 80, 40).normalize();
  scene.add(new THREE.HemisphereLight('#f4f6f1', '#5a5040', 1.0));
  const sun = new THREE.DirectionalLight('#fff3e0', 2.2);
  sun.position.copy(sunDir).multiplyScalar(110);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 60, bottom: -60, near: 1, far: 280 });
  sun.shadow.bias = -0.0006;
  scene.add(sun);

  const uniforms = sharedUniforms();
  scene.add(buildSheet(uniforms));
  const land = buildTerrain(uniforms, sunDir);
  scene.add(land);
  const section = buildSection(uniforms);
  scene.add(section.mesh);

  // Linework
  const ink = (opacity = 1, color = HEX.ink) => new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  const lineFrom = (pts, mat) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
  scene.add(lineFrom(drape(coast, 0.05, 0.25, false), ink(0.95)));
  // A second, finer line just offshore, the classic chart coastline
  const off = coast.map((p, i) => {
    const a = coast[Math.max(0, i - 1)], b = coast[Math.min(coast.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), nz = b[0] - a[0];
    const L = Math.hypot(nx, nz) || 1; nx /= L; nz /= L;
    const test = [p[0] + nx * 0.3, p[1] + nz * 0.3];
    const s = inside(test) ? -1 : 1;
    return new THREE.Vector3(p[0] + nx * 0.32 * s, 0.03, p[1] + nz * 0.32 * s);
  });
  scene.add(lineFrom(off, ink(0.45, HEX.water)));
  const border = new THREE.Line(new THREE.BufferGeometry().setFromPoints(section.edge), new THREE.LineDashedMaterial({ color: HEX.ink, dashSize: 0.9, gapSize: 0.35 }));
  border.computeLineDistances();
  scene.add(border);
  scene.add(lineFrom(drape(slvRiver.slice().reverse(), 0.06, 0.25), ink(0.9, HEX.water)));
  [HWY1, HWY17].forEach((r) => scene.add(lineFrom(drape(r, 0.1, 0.3), ink(0.55))));

  // Map lettering: water in italic, land features in roman, the cartographer's convention.
  const letter = (text, ll, cls, y) => {
    const el = document.createElement('span');
    el.className = `map3d__geo ${cls}`;
    el.textContent = text;
    const [x, z] = project(ll);
    const o = new CSS2DObject(el);
    o.position.set(x, y ?? (inside([x, z]) ? heightAt([x, z]) + 0.5 : 0.1), z);
    scene.add(o);
  };
  letter('Monterey Bay', [36.86, -121.95], 'is-water is-big');
  letter('Pacific Ocean', [36.93, -122.27], 'is-water is-big');
  letter('Santa Cruz Mountains', [37.16, -122.06], 'is-land');
  letter('Pajaro Valley', [36.96, -121.68], 'is-land');
  const shield = (n, ll) => {
    const el = document.createElement('span');
    el.className = 'map3d__shield';
    el.textContent = n;
    const [x, z] = project(ll);
    const o = new CSS2DObject(el);
    o.position.set(x, heightAt([x, z]) + 0.3, z);
    scene.add(o);
  };
  shield('1', [37.03, -122.215]);
  shield('1', [36.94, -121.855]);
  shield('17', [37.075, -122.0]);

  // Pins: a surveyor's target ring on the ground, a leader line, and the place name.
  const pinGroup = new THREE.Group();
  scene.add(pinGroup);
  const pins = {};
  const LIFT = { westside: 4, 'downtown-midtown': 7.5, seabright: 3, 'live-oak': 5.2, 'pleasure-point': 2.6, capitola: 3.2, soquel: 9.5, aptos: 4.5, 'scotts-valley': 5, 'san-lorenzo-valley': 5, watsonville: 4.5 };
  const ringGeo = new THREE.RingGeometry(0.38, 0.5, 40).rotateX(-Math.PI / 2);
  const dotGeo = new THREE.CircleGeometry(0.14, 20).rotateX(-Math.PI / 2);
  const pulseGeo = new THREE.RingGeometry(0.9, 0.98, 48).rotateX(-Math.PI / 2);
  Object.entries(areas).forEach(([slug, a]) => {
    const [x, z] = project(a.latlon);
    const y = heightAt([x, z]);
    const lift = LIFT[slug] || 4;
    const mat = new THREE.MeshBasicMaterial({ color: HEX.ink, side: THREE.DoubleSide });
    const ringM = new THREE.Mesh(ringGeo, mat);
    const dot = new THREE.Mesh(dotGeo, mat);
    ringM.position.set(x, y + 0.12, z);
    dot.position.set(x, y + 0.12, z);
    const pulse = new THREE.Mesh(pulseGeo, new THREE.MeshBasicMaterial({ color: HEX.bronze, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    pulse.position.set(x, y + 0.14, z);
    const stemMat = new THREE.LineBasicMaterial({ color: HEX.ink, transparent: true, opacity: 0.75 });
    const stem = lineFrom([new THREE.Vector3(x, y + 0.12, z), new THREE.Vector3(x, y + lift, z)], stemMat);
    pinGroup.add(ringM, dot, pulse, stem);

    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'map3d__pin';
    el.innerHTML = `<span>${a.name}</span>`;
    el.setAttribute('aria-label', `Show ${a.name}`);
    el.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.addEventListener('click', (e) => { e.stopPropagation(); select(slug); });
    const label = new CSS2DObject(el);
    label.position.set(x, y + lift, z);
    pinGroup.add(label);
    pins[slug] = { x, y, z, el, mat, stemMat, pulse };
  });

  // Camera flights
  let flight = null, current = null;
  function flyTo(pos, target, ms = 1600) {
    if (reducedMotion) ms = 1;
    flight = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos, t1: target, start: performance.now(), ms };
  }
  function select(slug) {
    current = slug;
    Object.entries(pins).forEach(([s, p]) => {
      const on = s === slug;
      p.el.classList.toggle('is-on', on);
      p.mat.color.set(on ? HEX.bronze : HEX.ink);
      p.stemMat.color.set(on ? HEX.bronze : HEX.ink);
    });
    controls.autoRotate = false;
    if (!slug) { shiftTarget = [0, 0]; flyTo(HOME.pos.clone(), HOME.target.clone()); onSelect?.(null); return; }
    shiftTarget = w() < 700 ? [0, 0.33] : [0.17, 0];
    const p = pins[slug];
    const target = new THREE.Vector3(p.x, p.y, p.z);
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target).setY(0).normalize();
    if (dir.lengthSq() < 0.01) dir.set(0.3, 0, 1).normalize();
    flyTo(target.clone().addScaledVector(dir, 32).setY(p.y + 26), target);
    onSelect?.(slug);
  }

  const zoomBy = (f) => {
    controls.autoRotate = false;
    const off2 = new THREE.Vector3().subVectors(camera.position, controls.target);
    const len = THREE.MathUtils.clamp(off2.length() * f, controls.minDistance, controls.maxDistance);
    flyTo(controls.target.clone().add(off2.setLength(len)), controls.target.clone(), 450);
  };
  // Two-finger scroll on a trackpad (or a mouse wheel) zooms; a pinch arrives as ctrl+wheel.
  // A sideways two-finger swipe turns the county. At full zoom in or out the page scrolls again.
  const onWheel = (e) => {
    e.stopPropagation(); // keep OrbitControls' own wheel zoom out of it
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const dx = e.deltaX * unit, dy = e.deltaY * unit;
    if (Math.abs(dx) > Math.abs(dy) * 1.2 && !e.ctrlKey) {
      e.preventDefault();
      controls.autoRotate = false;
      const off3 = new THREE.Vector3().subVectors(camera.position, controls.target);
      off3.applyAxisAngle(new THREE.Vector3(0, 1, 0), dx * 0.004);
      camera.position.copy(controls.target).add(off3);
      return;
    }
    const off3 = new THREE.Vector3().subVectors(camera.position, controls.target);
    const len = off3.length();
    const zoomingIn = dy < 0;
    const atLimit = zoomingIn ? len <= controls.minDistance + 0.01 : len >= controls.maxDistance - 0.01;
    if (atLimit && !e.ctrlKey) return; // let the page scroll
    e.preventDefault();
    controls.autoRotate = false;
    flight = null;
    const k = Math.exp(THREE.MathUtils.clamp(dy, -120, 120) * (e.ctrlKey ? 0.01 : 0.0022));
    const next = THREE.MathUtils.clamp(len * k, controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(off3.setLength(next));
  };
  container.addEventListener('wheel', onWheel, { passive: false, capture: true });
  renderer.domElement.addEventListener('pointerdown', () => { controls.autoRotate = false; });

  const v = new THREE.Vector3(), v2 = new THREE.Vector3();
  const toScreen = (vec) => { vec.project(camera); return [(vec.x * 0.5 + 0.5) * w(), (-vec.y * 0.5 + 0.5) * h()]; };
  const ray = new THREE.Raycaster();
  let down = null;
  renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  // A tap (not a drag) selects the nearest place: first by its name or ground marker on screen,
  // which is what a finger aims at, then by where it lands on the terrain.
  renderer.domElement.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > (e.pointerType === 'touch' ? 10 : 5)) return;
    const r = renderer.domElement.getBoundingClientRect();
    const px = e.clientX - r.left, py = e.clientY - r.top;
    const reach = e.pointerType === 'touch' ? 44 : 28;
    let best = null, bd = reach;
    Object.entries(pins).forEach(([s, p]) => {
      const [lx, ly] = toScreen(v.set(p.x, p.y + (LIFT[s] || 4), p.z));
      const [gx, gy] = toScreen(v.set(p.x, p.y, p.z));
      const d = Math.min(Math.hypot(lx - px, ly - 12 - py), Math.hypot(gx - px, gy - py));
      if (d < bd) { bd = d; best = s; }
    });
    if (best) { select(best); return; }
    ray.setFromCamera(new THREE.Vector2((px / r.width) * 2 - 1, -(py / r.height) * 2 + 1), camera);
    const hit = ray.intersectObject(land)[0];
    if (!hit) return;
    let near = null, nd = 3.2;
    Object.entries(pins).forEach(([s, p]) => { const d = Math.hypot(p.x - hit.point.x, p.z - hit.point.z); if (d < nd) { nd = d; near = s; } });
    if (near) select(near);
  });

  let shift = [0, 0], shiftTarget = [0, 0];
  const frame = () => {
    camera.aspect = w() / h();
    if (Math.abs(shift[0]) + Math.abs(shift[1]) > 0.001) camera.setViewOffset(w(), h(), shift[0] * w(), shift[1] * h(), w(), h());
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  };
  frame();
  const ro = new ResizeObserver(() => { frame(); renderer.setSize(w(), h()); labels.setSize(w(), h()); });
  ro.observe(container);

  let raf = 0, visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(container);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const focus = new THREE.Vector2(HOME.target.x, HOME.target.z);
  let radius = 30;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    if (flight) {
      const k = Math.min(1, (now - flight.start) / flight.ms), e = ease(k);
      camera.position.lerpVectors(flight.p0, flight.p1, e);
      controls.target.lerpVectors(flight.t0, flight.t1, e);
      if (k === 1) flight = null;
    }
    if (Math.abs(shift[0] - shiftTarget[0]) + Math.abs(shift[1] - shiftTarget[1]) > 0.0005) {
      const k = reducedMotion ? 1 : 0.06;
      shift = [shift[0] + (shiftTarget[0] - shift[0]) * k, shift[1] + (shiftTarget[1] - shift[1]) * k];
      frame();
    }
    // The painted window follows the view and scales with distance.
    const dist = camera.position.distanceTo(controls.target);
    const k = reducedMotion ? 1 : 0.08;
    // centered a little past the target, so the painted area sits around it on screen
    const ahead = new THREE.Vector2(controls.target.x - camera.position.x, controls.target.z - camera.position.z).normalize().multiplyScalar(radius * 0.3);
    focus.x += (controls.target.x + ahead.x - focus.x) * k;
    focus.y += (controls.target.z + ahead.y - focus.y) * k;
    radius += (dist * 0.32 - radius) * k;
    uniforms.uFocus.value.copy(focus);
    uniforms.uRadius.value = radius;
    uniforms.uFadeNear.value = dist * 1.15;
    uniforms.uFadeFar.value = dist * 2.5;
    scene.fog.near = dist * 1.15;
    scene.fog.far = dist * 2.5;

    const t = now / 1000;
    Object.entries(pins).forEach(([s, p]) => {
      if (s === current && !reducedMotion) {
        const ph = (t * 0.7) % 1;
        p.pulse.scale.setScalar(0.6 + ph * 2.4);
        p.pulse.material.opacity = 0.7 * (1 - ph);
      } else p.pulse.material.opacity = 0;
    });
    // keep the county in view however far it is slid
    const tx = THREE.MathUtils.clamp(controls.target.x, -55, 50), tz = THREE.MathUtils.clamp(controls.target.z, -45, 35);
    if (tx !== controls.target.x || tz !== controls.target.z) {
      const dx = tx - controls.target.x, dz = tz - controls.target.z;
      controls.target.x = tx; controls.target.z = tz;
      camera.position.x += dx; camera.position.z += dz;
    }
    controls.update();
    renderer.render(scene, camera);
    labels.render(scene, camera);
    onFrame?.();
  };
  raf = requestAnimationFrame(loop);
  onReady?.({ terrain: terrain.source });

  return {
    kind: 'stylized',
    select,
    screenOf(slug) {
      const p = pins[slug];
      if (!p) return null;
      const [x, y] = toScreen(v.set(p.x, p.y + (LIFT[slug] || 4), p.z));
      return { x, y: y - 14 };
    },
    // Screen angle of north, in degrees, for the north arrow.
    north() {
      const a = toScreen(v.copy(controls.target));
      const b = toScreen(v2.copy(controls.target).add(new THREE.Vector3(0, 0, -5)));
      return (Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 180) / Math.PI;
    },
    // Pixels per kilometer at the center of view, for the scale bar.
    pxPerKm() {
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize().multiplyScalar(KM);
      const a = toScreen(v.copy(controls.target));
      const b = toScreen(v2.copy(controls.target).add(right));
      return Math.hypot(b[0] - a[0], b[1] - a[1]);
    },
    zoomIn: () => zoomBy(0.75),
    zoomOut: () => zoomBy(1.33),
    reset: () => select(null),
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      container.removeEventListener('wheel', onWheel, { capture: true });
      controls.dispose();
      scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.map?.dispose?.(); o.material?.dispose?.(); });
      renderer.dispose();
      container.innerHTML = '';
    },
  };
}
