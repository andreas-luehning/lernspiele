// Leuchttisch: Aufgaben, Streuen der Steine, Antwort-Knöpfe, Amulett-Regeln. Ohne DOM, direkt testbar.
// Streuen und Stufen stammen aus prototypen/leuchttisch.html (addPoints, LEVELS), Numi-Figuren durch Edelsteine ersetzt.

export const STEINE = ['rubin', 'saphir', 'smaragd', 'amethyst', 'bernstein', 'topas'];
export const FASSUNGEN = 5;            // Steine pro Amulett (vorläufig, siehe docs/leuchttisch.md)
export const MAX_AMULETTE = 2000;      // Obergrenze im Speicher

export const STUFEN = [
  { name: 'Zählen', modus: 'zaehlen', min: 2, max: 6 },
  { name: 'Zerlegen bis 7', modus: 'zerlegen', min: 5, max: 7 },
  { name: 'Zerlegen bis 10', modus: 'zerlegen', min: 7, max: 10 },
];

const rand = (a, b, r = Math.random) => Math.floor(r() * (b - a + 1)) + a;
const mischen = (a, r = Math.random) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/**
 * Streut n Punkte überlappungsfrei in ein Rechteck. Wird es eng, sinkt der Mindestabstand schrittweise.
 * Liefert immer genau n Punkte, sonst wäre die richtige Antwort falsch.
 */
export function streuen(alle, n, x0, x1, y0, y1, minStart, minEnde, r = Math.random) {
  const schritt = (minStart - minEnde) / 4;
  for (let minD = minStart; minD >= minEnde - 0.001; minD -= schritt) {
    const neu = [], probe = alle.slice(); let t = 0;
    while (neu.length < n && t < 2000) {
      const p = { x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0) };
      if (probe.every(q => Math.hypot(q.x - p.x, q.y - p.y) > minD)) { probe.push(p); neu.push(p); }
      t++;
    }
    if (neu.length === n) { alle.push(...neu); return neu; }
  }
  const neu = [];
  while (neu.length < n) { const p = { x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0) }; alle.push(p); neu.push(p); }
  return neu;
}

/**
 * Neue Aufgabe für eine Stufe (noch ohne Lage der Steine, siehe verteilen).
 * Ergebnis: { modus, gesamt, links, rechts, sorteL, sorteR, steine: [] }
 */
export function neueAufgabe(stufeIdx, { zweiSorten = true, vorher = null } = {}, r = Math.random) {
  const st = STUFEN[stufeIdx] || STUFEN[0];
  let gesamt = rand(st.min, st.max, r);
  if (vorher && vorher.modus === st.modus && vorher.gesamt === gesamt && st.max > st.min) gesamt = gesamt === st.max ? st.min : gesamt + 1;
  const [s1, s2] = mischen(STEINE, r);
  if (st.modus === 'zaehlen') return { modus: 'zaehlen', gesamt, links: gesamt, rechts: 0, sorteL: s1, sorteR: s1, steine: [] };
  const lo = Math.max(2, gesamt - 6), hi = Math.min(gesamt - 2, 6);
  const links = rand(lo, hi, r);
  return { modus: 'zerlegen', gesamt, links, rechts: gesamt - links, sorteL: s1, sorteR: zweiSorten ? s2 : s1, steine: [] };
}

/**
 * Steine auf dem Tisch verteilen (B × H Einheiten, Steingröße g). Beim Zerlegen: linke und rechte Hälfte.
 * Wird auch nach dem Drehen des Tablets aufgerufen; Anzahl und Sorten bleiben gleich.
 */
export function verteilen(a, B, H, g, r = Math.random) {
  const rand0 = g * 0.75, minStart = g * 1.45, minEnde = g * 1.05, alle = [];
  const dreh = () => Math.round(r() * 50 - 25);
  const mit = (pts, sorte, gruppe) => pts.map(p => ({ ...p, sorte, gruppe, dreh: dreh() }));
  if (a.modus === 'zaehlen') {
    a.steine = mit(streuen(alle, a.gesamt, rand0, B - rand0, rand0, H - rand0, minStart, minEnde, r), a.sorteL, 0);
  } else {
    a.steine = [
      ...mit(streuen(alle, a.links, rand0, B * 0.46, rand0, H - rand0, minStart, minEnde, r), a.sorteL, 0),
      ...mit(streuen(alle, a.rechts, B * 0.54, B - rand0, rand0, H - rand0, minStart, minEnde, r), a.sorteR, 1),
    ];
  }
  return a;
}

/** Vier Antworten: die richtige und nahe Nachbarn, alle mindestens 1. */
export function antworten(gesamt, r = Math.random) {
  const set = new Set([gesamt]);
  for (const c of mischen([gesamt + 1, gesamt - 1, gesamt + 2, gesamt - 2], r)) { if (set.size >= 4) break; if (c >= 1) set.add(c); }
  let k = 3; while (set.size < 4) set.add(gesamt + k++);
  return mischen([...set], r);
}

/** Tipp nach einer falschen Antwort. Verrät nie das Ergebnis. */
export function tipp(a) {
  return a.modus === 'zaehlen'
    ? 'Fast! Zeig auf jeden Stein und zähl langsam mit.'
    : 'Fast! Zähl erst die eine Seite, dann die andere.';
}

/** Gespeicherte Steinliste prüfen: nur bekannte Steine, höchstens n. */
export const steinListe = (x, n) => (Array.isArray(x) ? x.filter(s => STEINE.includes(s)).slice(0, n) : []);

/** Zustand aus dem Speicher prüfen und bereinigen. */
export function zustandPruefen(z) {
  const aus = { ...z };
  aus.stufe = Number.isInteger(z.stufe) && z.stufe >= 0 && z.stufe < STUFEN.length ? z.stufe : 0;
  aus.eingabe = z.eingabe === 'schreiben' ? 'schreiben' : 'tippen';
  aus.zweiSorten = z.zweiSorten !== false;
  aus.fassung = steinListe(z.fassung, FASSUNGEN - 1);
  aus.amulette = (Array.isArray(z.amulette) ? z.amulette : [])
    .map(a => steinListe(a, FASSUNGEN)).filter(a => a.length === FASSUNGEN).slice(-MAX_AMULETTE);
  return aus;
}

/**
 * Richtige Aufgabe: Stein in die nächste Fassung. Ist das Amulett voll, kommt es in die Schatzkiste.
 * Verändert den Zustand. Ergebnis: { platz, voll }
 */
export function steinEinsetzen(z, sorte) {
  if (!STEINE.includes(sorte)) sorte = STEINE[0];
  z.fassung.push(sorte);
  const platz = z.fassung.length - 1;
  if (z.fassung.length >= FASSUNGEN) {
    z.amulette.push(z.fassung.slice(0, FASSUNGEN));
    if (z.amulette.length > MAX_AMULETTE) z.amulette.shift();
    z.fassung = [];
    return { platz, voll: true };
  }
  return { platz, voll: false };
}
