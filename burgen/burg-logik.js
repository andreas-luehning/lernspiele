// Burgen: Generator, Anordnung und Antworten, ohne DOM (direkt in Node testbar).
// Anordnung und Antworten aus prototypen/burgen.html (renderCastle, makeOptions). Der Generator ist seit 28.11.
// erweitert (mehr Abwechslung, 8–20 Teile, kein Muster aus den letzten 5 Burgen). Regeln: docs/burgen.md.

export const PAL = ['#FF3D9A', '#22C973', '#2E9BFF', '#FFC400', '#FF6B1A', '#00C8C8'];
export const ROOF = '#FF3D5A';
export const B = 27, G = 1.5, CELL = B + G;
export const MIN = 8, MAX = 20;
export const TURM = [2, 6], MITTE = [1, 8];   // Teile pro Turm bzw. Mitte
export const MERKEN = 5;                       // so viele letzte Muster kommen nicht wieder

const rand = (a, b, r) => Math.floor(r() * (b - a + 1)) + a;
const shuffle = (a, r) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const istDach = t => ['dach', 'keil', 'keilV', 'dachW', 'keilW', 'kugel'].includes(t);

/** Turm aus k Teilen: unten beliebige Körper (höchstens zwei hohe), oben Dach, Keil oder Kugel. */
function turm(k, r) {
  const list = [];
  let hohe = 0;
  for (let i = 0; i < k - 1; i++) {
    const x = r();
    if (hohe < 2 && x < 0.5) { hohe++; list.push({ t: x < 0.22 ? 'zylinder' : x < 0.38 ? 'quaderV' : 'platteV', rows: 2 }); }
    else list.push({ t: 'wuerfel', rows: 1 });
  }
  const d = r();
  if (d < 0.35) list.push({ t: 'dach', rows: 1 });
  else if (d < 0.55) list.push({ t: 'keil', rows: 1, flip: r() < 0.5 });
  else if (d < 0.75) list.push({ t: 'keilV', rows: 2, flip: r() < 0.5 });
  else list.push({ t: 'kugel', rows: 1 });
  return list;
}
/** Mitte aus k Teilen: unten Tor oder Quader, darüber Quader, Platten, Fenster; oft ein breites Dach oder ein Keil. */
function mitte(k, r) {
  const dach = k >= 2 && r() < 0.65, n = k - (dach ? 1 : 0), tor = r() < 0.4;
  const list = [tor ? { t: 'bogen', rows: 1, flip: false } : { t: 'quaderH', rows: 1 }];
  while (list.length < n) {
    const vor = list.at(-1).t, x = r();
    if (x < 0.2 && vor === 'quaderH') list.push({ t: 'bogen', rows: 1, flip: true });          // Fenster: Öffnung oben
    else if (x < 0.38 && vor !== 'platteH') list.push({ t: 'platteH', rows: 0.5 });
    else list.push({ t: 'quaderH', rows: 1 });
  }
  if (dach) list.push(r() < 0.7 ? { t: 'dachW', rows: 1 } : { t: 'keilW', rows: 1, flip: r() < 0.5 });
  const style = tor ? 'tor' : list.some(p => p.t === 'bogen') ? 'fenster' : 'mauer';
  return { style, list };
}
export const muster = c => c.parts.join('-');

/**
 * Neue Burg: Turm · Mitte · Turm, 8–20 Teile, jede Anzahl gleich wahrscheinlich.
 * verlauf: die bisherigen Burgen (neueste zuletzt). Kein Muster aus den letzten 5, nie zweimal dieselbe Anzahl hintereinander.
 */
export function neueBurg(r = Math.random, verlauf = []) {
  const alt = new Set(verlauf.slice(-MERKEN).map(muster)), letzte = verlauf.at(-1)?.total;
  const moeglich = [];
  for (let t = TURM[0]; t <= TURM[1]; t++) for (let m = MITTE[0]; m <= MITTE[1]; m++) {
    const total = 2 * t + m;
    if (total >= MIN && total <= MAX && total !== letzte && !alt.has(`${t}-${m}-${t}`)) moeglich.push({ t, m, total });
  }
  const anzahlen = [...new Set(moeglich.map(x => x.total))];
  const ziel = anzahlen[Math.floor(r() * anzahlen.length)];
  const passend = moeglich.filter(x => x.total === ziel);
  const { t, m, total } = passend[Math.floor(r() * passend.length)];
  const tower = turm(t, r), mid = mitte(m, r);
  const [cT, cM] = shuffle(PAL, r).slice(0, 2);
  const mirror = r() < 0.6;                                 // Keile rechts gespiegelt = Spiegelsymmetrie
  return { tower, mid, cT, cM, total, mirror, parts: [t, m, t] };
}

/**
 * Anordnung wie renderCastle im Prototyp: jedes Teil mit Lage (x, y, w, h), Farbe und Bereich
 * (0 = linker Turm, 1 = Mitte, 2 = rechter Turm), in Zählreihenfolge (links unten nach oben, Mitte, rechts).
 */
export function anordnen(c) {
  const towerRows = c.tower.reduce((s, p) => s + p.rows, 0);
  const midRows = c.mid.list.reduce((s, p) => s + p.rows, 0);
  const rows = Math.max(towerRows, midRows);
  const gap = 6, midW = 2 * CELL - G;
  const W = 12 + B + gap + midW + gap + B + 12;
  const H = Math.ceil(rows * CELL) + 36, groundY = H - 6;   // +36: Kopffreiheit für Zählplaketten
  const teile = [];
  const stapel = (liste, x, w, farbe, bereich, spiegeln) => {
    let rr = 0;
    for (const p of liste) {
      const y = groundY - (rr + p.rows) * CELL + G, h = p.rows * CELL - G;
      const flip = spiegeln && (p.t === 'keil' || p.t === 'keilV') ? !p.flip : p.flip;
      teile.push({ t: p.t, x, y, w, h, flip: !!flip, farbe: istDach(p.t) ? ROOF : farbe, bereich });
      rr += p.rows;
    }
  };
  stapel(c.tower, 12, B, c.cT, 0, false);
  stapel(c.mid.list, 12 + B + gap, midW, c.cM, 1, false);
  stapel(c.tower, 12 + B + gap + midW + gap, B, c.cT, 2, c.mirror);   // rechter Turm: Keile gespiegelt
  return { W, H, groundY, teile };
}

/** Vier Antworten wie makeOptions im Prototyp: die richtige und nahe Nachbarn, alle mindestens 1. */
export function antworten(total, r = Math.random) {
  const set = new Set([total]);
  for (const c of shuffle([total + 1, total - 1, total + 2, total - 2, total + 3], r)) { if (set.size >= 4) break; if (c > 0) set.add(c); }
  while (set.size < 4) set.add(rand(6, 20, r));
  return shuffle([...set], r);
}

/* ---------- Statistik (vorläufig statt Belohnung) ---------- */
export const STANDARD = { geloest: 0, gleichRichtig: 0, mitHilfe: 0, fehlversuche: 0 };
/** Nur nicht-negative ganze Zahlen übernehmen. */
export function statistikPruefen(z) {
  const aus = {};
  for (const k of Object.keys(STANDARD)) aus[k] = Number.isInteger(z?.[k]) && z[k] >= 0 ? z[k] : 0;
  return aus;
}
/** Eine Burg gelöst: gleich richtig nur ohne Fehlversuch und ohne „Zeig mir's“. */
export function geloestZaehlen(stat, { fehler, hilfe }) {
  stat.geloest++;
  if (hilfe) stat.mitHilfe++;
  if (!fehler && !hilfe) stat.gleichRichtig++;
  return stat;
}
