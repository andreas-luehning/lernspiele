// Burgen: Generator, Anordnung und Antworten, ohne DOM (direkt in Node testbar).
// Aus prototypen/burgen.html übernommen (makeTower, makeMiddle, makeCastle, renderCastle, makeOptions),
// nur ohne HTML-Strings und mit austauschbarem Zufall r. Regeln: docs/burgen.md.

export const PAL = ['#FF3D9A', '#22C973', '#2E9BFF', '#FFC400', '#FF6B1A', '#00C8C8'];
export const ROOF = '#FF3D5A';
export const B = 27, G = 1.5, CELL = B + G;
export const MIN = 8, MAX = 13;

const rand = (a, b, r) => Math.floor(r() * (b - a + 1)) + a;
const pick = (a, r) => a[Math.floor(r() * a.length)];
const shuffle = (a, r) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const istDach = t => ['dach', 'keil', 'keilV', 'dachW', 'keilW', 'kugel'].includes(t);

function turm(r) {
  const list = [{ t: 'wuerfel', rows: 1 }];
  const x = r();
  list.push({ t: x < 0.45 ? 'zylinder' : x < 0.75 ? 'quaderV' : 'platteV', rows: 2 });
  if (r() < 0.30) list.push({ t: 'wuerfel', rows: 1 });
  const k = r();
  if (k < 0.35) list.push({ t: 'dach', rows: 1 });
  else if (k < 0.55) list.push({ t: 'keil', rows: 1, flip: r() < 0.5 });
  else if (k < 0.75) list.push({ t: 'keilV', rows: 2, flip: r() < 0.5 });
  else list.push({ t: 'kugel', rows: 1 });
  return list;
}
function mitte(r) {
  const style = pick(['tor', 'fenster', 'mauer', 'keep'], r);
  const list = [];
  if (style === 'tor') {
    if (r() < 0.4) list.push({ t: 'platteH', rows: 0.5 });
    list.push({ t: 'bogen', rows: 1, flip: false });
    if (r() < 0.5) list.push({ t: 'quaderH', rows: 1 });
    list.push({ t: r() < 0.6 ? 'dachW' : 'keilW', rows: 1, flip: r() < 0.5 });
  } else if (style === 'fenster') {
    list.push({ t: 'quaderH', rows: 1 });
    list.push({ t: 'bogen', rows: 1, flip: true });          // Fenster: Öffnung oben
    list.push({ t: 'quaderH', rows: 1 });
    if (r() < 0.6) list.push({ t: 'dachW', rows: 1 });
  } else if (style === 'mauer') {
    const k = rand(2, 3, r);
    for (let i = 0; i < k; i++) list.push({ t: 'quaderH', rows: 1 });
    if (r() < 0.4) list.push({ t: 'platteH', rows: 0.5 });
    if (r() < 0.5) list.push({ t: 'dachW', rows: 1 });
  } else {                                                    // keep: Mitte darf höher sein
    const k = rand(3, 4, r);
    for (let i = 0; i < k; i++) list.push({ t: 'quaderH', rows: 1 });
    list.push({ t: r() < 0.7 ? 'dachW' : 'keilW', rows: 1, flip: r() < 0.5 });
  }
  return { style, list };
}

/** Neue Burg: Turm · Mitte · Turm, 8–13 Teile. vorher: dieselbe Anzahl nicht zweimal hintereinander (wenn möglich). */
export function neueBurg(r = Math.random, vorher = null) {
  for (let versuch = 0; versuch < 500; versuch++) {
    const tower = turm(r), mid = mitte(r);
    const tc = tower.length, mc = mid.list.length, total = 2 * tc + mc;
    if (total < MIN || total > MAX) continue;
    if (vorher && vorher.total === total && versuch < 50) continue;
    const [cT, cM] = shuffle(PAL, r).slice(0, 2);
    const mirror = r() < 0.6;                                 // Keile rechts gespiegelt = Spiegelsymmetrie
    return { tower, mid, cT, cM, total, mirror, parts: [tc, mc, tc] };
  }
  throw new Error('keine Burg gefunden');
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
