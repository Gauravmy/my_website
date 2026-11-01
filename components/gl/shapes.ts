// Point-cloud shapes. Every shape fills the same N slots so any two can morph into each other.
// World units are CSS pixels; the origin is the centre of the viewport, y up.

export type Shape = { pos: Float32Array; col: Float32Array };
export type Rect = { x: number; y: number; w: number; h: number };
type RGB = [number, number, number];

const hex = (h: string): RGB => {
  const n = parseInt(h.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const BONE = hex("#f2eee3");
export const ACID = hex("#d7f24a");
const DUST = hex("#5563cf");
const DIM = hex("#8f98de");

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

function alloc(n: number): Shape {
  return { pos: new Float32Array(n * 3), col: new Float32Array(n * 3) };
}

function put(s: Shape, i: number, x: number, y: number, z: number, c: RGB) {
  s.pos[i * 3] = x;
  s.pos[i * 3 + 1] = y;
  s.pos[i * 3 + 2] = z;
  s.col[i * 3] = c[0];
  s.col[i * 3 + 1] = c[1];
  s.col[i * 3 + 2] = c[2];
}

/** Faint particles left over in the field: most shapes keep a little atmosphere around them. */
function fillDust(s: Shape, from: number, n: number, W: number, H: number, r: () => number) {
  for (let i = from; i < n; i++) put(s, i, (r() - 0.5) * W * 1.15, (r() - 0.5) * H * 1.15, (r() - 0.5) * 260, DUST);
}

/** The untrained state: a cloud of Gaussian noise. */
export function noiseShape(n: number, W: number, H: number): Shape {
  const s = alloc(n);
  const r = rng(7);
  for (let i = 0; i < n; i++) {
    put(s, i, gauss(r) * W * 0.28, gauss(r) * H * 0.3, gauss(r) * 340, r() < 0.02 ? ACID : r() < 0.5 ? BONE : DIM);
  }
  return s;
}

export type TextLine = { text: string; font: string; letterSpacing: string; left: number; baseline: number };

/** Sample the letterforms, drawn where the DOM heading sits on the page (page coordinates at scrollY 0). */
export function textShape(n: number, W: number, H: number, lines: TextLine[], extent: Rect): Shape {
  const s = alloc(n);
  const r = rng(11);
  const scale = 1;
  const cw = Math.ceil(extent.w * scale);
  const ch = Math.ceil(extent.h * scale);
  const cv = document.createElement("canvas");
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "alphabetic";
  for (const l of lines) {
    ctx.font = l.font;
    if ("letterSpacing" in ctx) (ctx as unknown as { letterSpacing: string }).letterSpacing = l.letterSpacing;
    ctx.fillText(l.text, (l.left - extent.x) * scale, (l.baseline - extent.y) * scale);
  }
  const data = ctx.getImageData(0, 0, cw, ch).data;
  const candidates: number[] = [];
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) if (data[(y * cw + x) * 4 + 3] > 128) candidates.push(x, y);
  const count = candidates.length / 2;
  const inText = Math.floor(n * 0.93);
  for (let i = 0; i < inText; i++) {
    const k = Math.floor(r() * count) * 2;
    const px = extent.x + (candidates[k] + r()) / scale;
    const py = extent.y + (candidates[k + 1] + r()) / scale;
    put(s, i, px - W / 2, H / 2 - py, (r() - 0.5) * 6, r() < 0.018 ? ACID : BONE);
  }
  fillDust(s, inText, n, W, H, r);
  return s;
}

const scaleX = (rect: Rect, t: number) => rect.x + rect.w * t;
const scaleY = (rect: Rect, t: number) => rect.y + rect.h * t;

/** Fig. 1: one blob per real day of sales. */
export function scatterShape(n: number, W: number, H: number, rect: Rect, history: number[]): Shape {
  const s = alloc(n);
  const r = rng(21);
  const max = Math.max(...history) * 1.05;
  const inChart = Math.floor(n * 0.92);
  // A thin axis so it reads as a chart, then the data.
  const axis = Math.floor(inChart * 0.05);
  for (let i = 0; i < axis; i++) put(s, i, scaleX(rect, r()), scaleY(rect, 0), 0, DIM);
  for (let i = axis; i < inChart; i++) {
    const d = (i - axis) % history.length;
    const a = Math.sqrt(r()) * Math.max(3.1, rect.w / 210);
    const t = r() * Math.PI * 2;
    put(s, i, scaleX(rect, (d + 0.5) / history.length) + Math.cos(t) * a, scaleY(rect, history[d] / max) + Math.sin(t) * a, 0, BONE);
  }
  fillDust(s, inChart, n, W, H, r);
  return s;
}

function polyline(ys: number[], t: number) {
  const f = t * (ys.length - 1);
  const i = Math.min(ys.length - 2, Math.floor(f));
  return ys[i] + (ys[i + 1] - ys[i]) * (f - i);
}

/** Fig. 2: actual vs baseline vs random forest on the 28 holdout days. */
export function linesShape(n: number, W: number, H: number, rect: Rect, actual: number[], baseline: number[], forest: number[]): Shape {
  const s = alloc(n);
  const r = rng(31);
  const all = [...actual, ...baseline, ...forest];
  const min = Math.min(...all) * 0.82;
  const max = Math.max(...all) * 1.06;
  const norm = (v: number) => (v - min) / (max - min);
  const inChart = Math.floor(n * 0.92);
  const a = Math.floor(inChart * 0.36);
  const b = Math.floor(inChart * 0.14);
  const axis = Math.floor(inChart * 0.04);
  let i = 0;
  for (; i < axis; i++) put(s, i, scaleX(rect, r()), scaleY(rect, 0), 0, DIM);
  for (; i < axis + a; i++) {
    const t = r();
    put(s, i, scaleX(rect, t) + (r() - 0.5) * 1.5, scaleY(rect, norm(polyline(actual, t))) + (r() - 0.5) * 2, 0, BONE);
  }
  for (; i < axis + a + b; i++) {
    // Dashed: the baseline is the flat line it has to beat.
    const t = (Math.floor(r() * 30) + r() * 0.55) / 30;
    put(s, i, scaleX(rect, t), scaleY(rect, norm(polyline(baseline, t))) + (r() - 0.5) * 1.5, 0, DIM);
  }
  for (; i < inChart; i++) {
    const t = r();
    put(s, i, scaleX(rect, t) + (r() - 0.5) * 1.5, scaleY(rect, norm(polyline(forest, t))) + (r() - 0.5) * 2.4, 2, ACID);
  }
  fillDust(s, inChart, n, W, H, r);
  return s;
}

/** Fig. 3: one square per test. 94 backend, 11 frontend. */
export function testsShape(n: number, W: number, H: number, rect: Rect, a = 94, b = 11): Shape {
  const s = alloc(n);
  const r = rng(41);
  const total = a + b;
  const cols = 15;
  const rows = Math.ceil(total / cols);
  const gap = 0.26;
  const cell = Math.min(rect.w / cols, rect.h / rows);
  const size = cell * (1 - gap);
  const ox = rect.x + (rect.w - cell * cols) / 2;
  const oy = rect.y + (rect.h - cell * rows) / 2;
  const inChart = Math.floor(n * 0.92);
  for (let i = 0; i < inChart; i++) {
    const k = i % total;
    const col = k % cols;
    const row = Math.floor(k / cols);
    put(s, i, ox + col * cell + r() * size, oy + (rows - 1 - row) * cell + r() * size, (r() - 0.5) * 4, k < a ? BONE : ACID);
  }
  fillDust(s, inChart, n, W, H, r);
  return s;
}

/** Fig. 4: the real dashboard, resolved out of points. */
export async function imageShape(n: number, W: number, H: number, rect: Rect, url: string): Promise<Shape> {
  const s = alloc(n);
  const r = rng(51);
  const img = new Image();
  img.src = url;
  await img.decode();
  const cw = 360;
  const ch = Math.round((cw * img.naturalHeight) / img.naturalWidth);
  const cv = document.createElement("canvas");
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cw, ch);
  const d = ctx.getImageData(0, 0, cw, ch).data;
  // Fit the screenshot inside the region, keeping its shape.
  const k = Math.min(rect.w / cw, rect.h / ch);
  const w = cw * k;
  const h = ch * k;
  const ox = rect.x + (rect.w - w) / 2;
  const oy = rect.y + (rect.h - h) / 2;
  for (let i = 0; i < n; i++) {
    const x = r();
    const y = r();
    const p = (Math.floor(y * ch) * cw + Math.floor(x * cw)) * 4;
    put(s, i, ox + x * w, oy + (1 - y) * h, 0, [d[p] / 255, d[p + 1] / 255, d[p + 2] / 255]);
  }
  return s;
}
