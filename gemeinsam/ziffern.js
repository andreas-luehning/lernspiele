// Zahlenerkennung im Browser: Striche → Zahl (0–20). Kein Server, keine Bibliothek.
// Netz 784 → 256 (ReLU) → 10 (Softmax), Gewichte int8 + Skalierungsfaktor, siehe werkzeuge/ziffern-modell/.
// Die Vorverarbeitung entspricht genau dem Prototyp (rasterize, groupStrokes, readNumber).

import { erkennung } from './einstellungen.js';

let W1, B1, W2, B2, HID = 0;
let laden = null;

function dq(o) {
  const bin = atob(o.d); const a = new Float32Array(bin.length);
  for (let i = 0; i < bin.length; i++) { let v = bin.charCodeAt(i); if (v > 127) v -= 256; a[i] = v * o.s; }
  return a;
}

/** Lädt das Modell einmal (gleiche Herkunft, siehe CSP connect-src 'self') und prüft die Größen. */
export function ladeModell(url = new URL('ziffern-modell.json', import.meta.url)) {
  if (!laden) {
    laden = fetch(url, { credentials: 'omit', referrerPolicy: 'no-referrer' })
      .then(r => { if (!r.ok) throw new Error('Modell nicht gefunden (' + r.status + ')'); return r.json(); })
      .then(m => {
        const w1 = dq(m.W1), b1 = dq(m.b1), w2 = dq(m.W2), b2 = dq(m.b2);
        const hid = b1.length;
        if (w1.length !== 784 * hid || w2.length !== hid * 10 || b2.length !== 10) throw new Error('Modell hat falsche Größe');
        W1 = w1; B1 = b1; W2 = w2; B2 = b2; HID = hid;
      })
      .catch(e => { laden = null; throw e; });
  }
  return laden;
}

export const modellBereit = () => HID > 0;

function predict(x) {
  const h = new Float32Array(B1);
  for (let i = 0; i < 784; i++) { const v = x[i]; if (!v) continue; const r = i * HID; for (let j = 0; j < HID; j++) h[j] += v * W1[r + j]; }
  const z = new Float32Array(10);
  for (let k = 0; k < 10; k++) { let s = B2[k]; for (let j = 0; j < HID; j++) if (h[j] > 0) s += h[j] * W2[j * 10 + k]; z[k] = s; }
  const m = Math.max(...z); let sum = 0;
  for (let k = 0; k < 10; k++) { z[k] = Math.exp(z[k] - m); sum += z[k]; }
  for (let k = 0; k < 10; k++) z[k] /= sum;
  return z;
}

let R1, R2, R3;
function leinwand(n) { const c = document.createElement('canvas'); c.width = c.height = n; return c; }

/** Eine Zifferngruppe auf 28×28 bringen wie bei MNIST: längere Seite 20 px, nach Schwerpunkt zentriert. */
function rasterize(strokes) {
  if (!R1) { R1 = leinwand(112); R2 = leinwand(56); R3 = leinwand(28); }
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (const s of strokes) for (const p of s) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const w = x1 - x0, h = y1 - y0, size = Math.max(w, h, 1);
  const sc = 80 / size, ox = (112 - w * sc) / 2 - x0 * sc, oy = (112 - h * sc) / 2 - y0 * sc;
  const c = R1.getContext('2d'); c.clearRect(0, 0, 112, 112);
  c.strokeStyle = c.fillStyle = '#000'; c.lineWidth = 11; c.lineCap = 'round'; c.lineJoin = 'round';
  for (const s of strokes) {
    if (s.length === 1) { c.beginPath(); c.arc(s[0].x * sc + ox, s[0].y * sc + oy, 5.5, 0, 7); c.fill(); continue; }
    c.beginPath(); c.moveTo(s[0].x * sc + ox, s[0].y * sc + oy);
    for (let i = 1; i < s.length; i++) c.lineTo(s[i].x * sc + ox, s[i].y * sc + oy);
    c.stroke();
  }
  const c2 = R2.getContext('2d'); c2.imageSmoothingQuality = 'high'; c2.clearRect(0, 0, 56, 56); c2.drawImage(R1, 0, 0, 56, 56);
  const c3 = R3.getContext('2d', { willReadFrequently: true }); c3.imageSmoothingQuality = 'high'; c3.clearRect(0, 0, 28, 28); c3.drawImage(R2, 0, 0, 28, 28);
  const d = c3.getImageData(0, 0, 28, 28).data, a = new Float32Array(784);
  let m = 0, mx = 0, my = 0;
  for (let i = 0; i < 784; i++) { const v = Math.min(1, d[i * 4 + 3] / 255 * 1.15); a[i] = v; m += v; mx += v * (i % 28); my += v * Math.floor(i / 28); }
  if (!m) return a;
  const dx = Math.round(13.5 - mx / m), dy = Math.round(13.5 - my / m), out = new Float32Array(784);
  for (let y = 0; y < 28; y++) for (let x = 0; x < 28; x++) {
    const sx = x - dx, sy = y - dy; if (sx >= 0 && sx < 28 && sy >= 0 && sy < 28) out[y * 28 + x] = a[sy * 28 + sx];
  }
  return out;
}

/** Striche nach waagerechter Überlappung zu Ziffern gruppieren. */
export function groupStrokes(strokes, fieldW) {
  const items = strokes.map(s => { let a = 1e9, b = -1e9; for (const p of s) { a = Math.min(a, p.x); b = Math.max(b, p.x); } return { s, a, b }; })
    .sort((p, q) => p.a - q.a);
  const groups = []; const tol = Math.max(3, fieldW * 0.012);
  for (const it of items) {
    const g = groups[groups.length - 1];
    if (g && it.a <= g.b + tol) { g.strokes.push(it.s); g.b = Math.max(g.b, it.b); }
    else groups.push({ strokes: [it.s], a: it.a, b: it.b });
  }
  return groups;
}

/* ---------- Formprüfung 1 / 7 ----------
   Das Modell kennt die amerikanische 1 (ein senkrechter Strich). In Deutschland lernen Kinder die 1 mit
   langem Anstrich von links unten; die sieht für das Modell aus wie eine 7 ohne Querstrich. Umgekehrt wird
   eine schmale 7 mit kurzem Balken manchmal als 1 gelesen. Darum wird nach dem Modell die Form geprüft. */

function punkteVon(strokes) { const pts = []; for (const s of strokes) for (const p of s) pts.push(p); return pts; }
const median = a => { const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };

/** Deutsche 1: schmaler Stamm unten, Spitze über dem Stamm, Anstrich fällt nach links ab, keine Schlaufe. */
export function istDeutscheEins(strokes) {
  const pts = punkteVon(strokes); if (pts.length < 3) return false;
  let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const h = y1 - y0; if (h < 8) return false;
  // Ein Fußstrich ganz unten (manche schreiben die 1 mit Sockel) zählt nicht zum Stamm
  const ohneFuss = pts.filter(p => p.y < y0 + 0.9 * h);
  const unten = ohneFuss.filter(p => p.y > y0 + 0.72 * h);                 // unterhalb des Anstrichs
  if (unten.length < 2) return false;
  const ux = unten.map(p => p.x);
  if (Math.max(...ux) - Math.min(...ux) > 0.25 * h) return false;          // unten nur ein schmaler Stamm
  const stamm = median(ux);
  const spitze = ohneFuss.reduce((a, p) => (p.y < a.y ? p : a));
  if (Math.abs(spitze.x - stamm) > 0.18 * h) return false;                  // Spitze sitzt über dem Stamm
  if (ohneFuss.some(p => p.x > stamm + 0.18 * h && p.y < y0 + 0.9 * h)) return false; // nichts weit rechts (kein Balken)
  const links = ohneFuss.filter(p => p.x < stamm - 0.1 * h);
  if (!links.length) return false;                                          // ohne Anstrich: das Modell kann das
  if (links.some(p => p.y > y0 + 0.7 * h)) return false;                    // Anstrich bleibt oben
  // Anstrich ist eine Linie, die nach links abfällt: in jedem Abschnitt nur eine Höhe, links tiefer als rechts
  const xs = links.map(p => p.x), xMin = Math.min(...xs), xMax = stamm - 0.1 * h, n = 4;
  const fach = Array.from({ length: n }, () => []);
  for (const p of links) fach[Math.min(n - 1, Math.floor((p.x - xMin) / Math.max(1, xMax - xMin) * n))].push(p.y);
  let vorher = -Infinity;
  for (let i = n - 1; i >= 0; i--) {                                        // von rechts (Spitze) nach links
    if (!fach[i].length) continue;
    if (Math.max(...fach[i]) - Math.min(...fach[i]) > 0.15 * h) return false; // zwei Höhen = Schlaufe (z. B. 9)
    const m = fach[i].reduce((a, b) => a + b, 0) / fach[i].length;
    if (m < vorher - 0.03 * h) return false;
    vorher = m;
  }
  const anfang = links.reduce((a, p) => (p.x < a.x ? p : a));
  return anfang.y - spitze.y >= 0.12 * h;                                   // Anstrich fällt deutlich ab
}

/** Querstrich der 7: ein eigener, flacher Strich in der mittleren Höhe (nicht der Fuß einer 1 ganz unten). */
export function hatQuerstrich(strokes) {
  if (strokes.length < 2) return false;
  const pts = punkteVon(strokes);
  let y0 = Infinity, y1 = -Infinity; for (const p of pts) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const h = y1 - y0; if (h < 8) return false;
  return strokes.some(s => {
    if (s.length < 2) return false;
    let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity; for (const p of s) { a = Math.min(a, p.x); b = Math.max(b, p.x); c = Math.min(c, p.y); d = Math.max(d, p.y); }
    const my = (c + d) / 2, breit = b - a, hoch = d - c;
    return breit > 0.08 * h && hoch < 0.2 * h && breit > 1.5 * hoch && my > y0 + 0.25 * h && my < y0 + 0.78 * h;
  });
}

/** 7 (ohne die Querstrich-Regel): Querstrich in der Mitte, oder flacher Balken oben. */
export function istSieben(strokes) {
  const pts = punkteVon(strokes); if (pts.length < 3) return false;
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
  const h = y1 - y0; if (h < 8) return false;
  if (hatQuerstrich(strokes)) return true;
  // Flacher Balken oben: Punkte im obersten Zehntel reichen weit nach links und rechts
  const oben = pts.filter(p => p.y <= y0 + 0.1 * h);
  const ox = oben.map(p => p.x);
  return oben.length > 1 && Math.max(...ox) - Math.min(...ox) >= 0.18 * h && !istDeutscheEins(strokes);
}

/**
 * Wahrscheinlichkeiten des Modells nach der Form korrigieren.
 * Mit der Regel „7 nur mit Querstrich“ (Standard): 7 ohne Querstrich → 1, 1 mit Querstrich → 7.
 * @returns {{p: Float32Array|number[], hinweis: string|null}}
 */
function formKorrektur(p, strokes, siebenMitQuerstrich) {
  const top = p.indexOf(Math.max(...p));
  const zu = z => { const q = p.map(v => v * 0.1); q[z] += 0.9; return q; };
  if (siebenMitQuerstrich) {
    const quer = hatQuerstrich(strokes);
    if (top === 7 && !quer) return { p: zu(1), hinweis: 'siebenOhneQuerstrich' };
    if (top === 1 && quer) return { p: zu(7), hinweis: null };
    if (top !== 1 && top !== 7 && istDeutscheEins(strokes)) return { p: zu(1), hinweis: null };
    return { p, hinweis: null };
  }
  if (top !== 1 && istDeutscheEins(strokes)) return { p: zu(1), hinweis: null };
  if (top === 1 && istSieben(strokes)) return { p: zu(7), hinweis: null };
  return { p, hinweis: null };
}

/**
 * Liest eine Zahl aus den Strichen eines Feldes.
 * @param {{x:number,y:number}[][]} strokes  Striche in Feld-Koordinaten (Pixel)
 * @returns {{value:number, conf:number, hinweis:string|null} | null}  hinweis: 'siebenOhneQuerstrich', wenn eine 7 ohne Querstrich als 1 gelesen wurde
 */
export function leseZahl(strokes, fieldW, fieldH) {
  if (!modellBereit()) return null;
  const real = strokes.filter(s => s.length > 0);
  if (!real.length) return null;
  let groups = groupStrokes(real, fieldW);
  // Winzige Tupfer verwerfen
  groups = groups.filter(g => {
    let y0 = 1e9, y1 = -1e9; for (const s of g.strokes) for (const p of s) { y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    return Math.max(g.b - g.a, y1 - y0) > fieldH * 0.06;
  });
  if (!groups.length) return null;
  const regel = erkennung().siebenMitQuerstrich;
  const korr = groups.map(g => formKorrektur(predict(rasterize(g.strokes)), g.strokes, regel));
  const probs = korr.map(k => k.p);
  const hinweis = korr.find(k => k.hinweis)?.hinweis || null;
  const pick = (p, allowed) => { let bi = allowed[0]; for (const k of allowed) if (p[k] > p[bi]) bi = k; return bi; };
  const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  let digits, conf = 1;
  if (probs.length === 2) {
    // Auf dem Blatt kommen nur Zahlen bis 20 vor: erste Ziffer ist 1 oder 2, nach der 2 nur die 0.
    const d0 = pick(probs[0], [1, 2]);
    const d1 = d0 === 2 ? pick(probs[1], [0]) : pick(probs[1], all);
    const p0 = probs[0][d0] / (probs[0][1] + probs[0][2]);
    digits = [d0, d1]; conf = Math.min(p0, probs[1][d1]);
    if (d0 === 2 && probs[1][0] < 0.3) { digits = [1, pick(probs[1], all)]; conf = probs[1][digits[1]]; }
  } else {
    digits = probs.map(p => pick(p, all)); conf = Math.min(...probs.map((p, i) => p[digits[i]]));
  }
  return { value: parseInt(digits.join(''), 10), conf, hinweis };
}

/** Unter dieser Sicherheit zeigt die App die Zahl mit Fragezeichen. */
export const UNSICHER = 0.4;
