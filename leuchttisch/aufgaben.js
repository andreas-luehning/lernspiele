// Leuchttisch: Aufgaben, Streuen der Steine, Antwort-Knöpfe, Amulett-Regeln. Ohne DOM, direkt testbar.
// Streuen und Stufen stammen aus prototypen/leuchttisch.html (addPoints, LEVELS), Numi-Figuren durch Edelsteine ersetzt.

export const STEINE = ['rubin', 'saphir', 'smaragd', 'amethyst', 'citrin', 'topas'];
export const FASSUNGEN = 5;            // Steine pro Amulett (vorläufig, siehe docs/leuchttisch.md)
export const MAX_AMULETTE = 2000;      // Obergrenze im Speicher
// Amulett-Modelle: Form × Material; das Material gehört zur Stufe (siehe docs/leuchttisch.md). Neue Materialien hier ergänzen.
export const FORMEN = ['rund', 'sechseck', 'sonne', 'bluete', 'schild', 'kissen'];
export const MATERIALIEN = ['bronze', 'silber', 'gold', 'kristall'];
export const MODELLE = MATERIALIEN.flatMap(material => FORMEN.map(form => ({ form, material })));
export const modellId = m => m.form + ':' + m.material;
export const materialDerStufe = stufe => (STUFEN[stufe] || STUFEN[0]).material;
/** Modelle, die schon in der Sammlung sind (als Menge von "form:material"). */
export const gefundeneModelle = amulette => new Set(amulette.map(modellId));
/**
 * Nächstes Modell im Material: bevorzugt eine Form, die darin noch fehlt; sonst eine andere als zuletzt.
 * Dazu eine Steinsorte für das ganze Amulett (alle Steine gleich, wie bei echtem Schmuck), nicht dieselbe wie zuletzt.
 */
export function neuesModell(amulette, material = 'bronze', r = Math.random) {
  const da = gefundeneModelle(amulette), letztes = amulette.length ? amulette[amulette.length - 1] : null;
  let wahl = FORMEN.filter(f => !da.has(f + ':' + material));
  if (!wahl.length) wahl = FORMEN.filter(f => f !== letztes?.form);
  const steine = STEINE.filter(s => s !== letztes?.stein);
  return { form: wahl[Math.floor(r() * wahl.length)], material, stein: steine[Math.floor(r() * steine.length)] };
}
// Übernahme: Ton gibt es nicht mehr (Entscheidung 08.11.), frühere Ton-Amulette werden Bronze
const ALTES_MATERIAL = { ton: 'bronze' };
const modellPruefen = m => {
  if (!m) return null;
  const material = ALTES_MATERIAL[m.material] || m.material;
  if (!FORMEN.includes(m.form) || !MATERIALIEN.includes(material)) return null;
  return { form: m.form, material, stein: STEINE.includes(m.stein) ? m.stein : null };
};

export const STUFEN = [
  // material: Das Amulett dieser Stufe ist aus diesem Material (schwerere Stufe = edleres Material)
  { name: 'Zählen', modus: 'zaehlen', min: 2, max: 6, material: 'bronze' },
  { name: 'Zerlegen bis 7', modus: 'zerlegen', min: 5, max: 7, material: 'silber' },
  { name: 'Zerlegen bis 10', modus: 'zerlegen', min: 7, max: 10, material: 'gold' },
  { name: 'Zerlegen bis 20', modus: 'zerlegen', min: 11, max: 20, maxGruppe: 10, material: 'kristall' },
];

/** Steingröße in Tisch-Einheiten (Tischbreite 1000): bei vielen Steinen kleiner, damit alle Platz haben. */
export const steinGroesse = a => (a.gesamt > 10 ? 96 : 125);

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
  const mg = st.maxGruppe || 6;               // höchstens so viele Steine pro Gruppe
  const lo = Math.max(2, gesamt - mg), hi = Math.min(gesamt - 2, mg);
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

/** Muster für lesen('leuchttisch', …). runde: {} ist nur das Typ-Muster; zustandPruefen macht daraus null oder eine geprüfte Runde. */
export const STANDARD = { stufe: 0, eingabe: 'tippen', zweiSorten: true, licht: 'ruhig', fassung: [], amulette: [], runde: {}, modell: {} };

/** Zustand aus dem Speicher prüfen und bereinigen. */
export function zustandPruefen(z) {
  const aus = { ...z };
  aus.stufe = Number.isInteger(z.stufe) && z.stufe >= 0 && z.stufe < STUFEN.length ? z.stufe : 0;
  aus.eingabe = z.eingabe === 'schreiben' ? 'schreiben' : 'tippen';
  aus.zweiSorten = z.zweiSorten !== false;
  aus.licht = z.licht === 'bewegt' ? 'bewegt' : 'ruhig';
  aus.runde = rundePruefen(z.runde);
  aus.walkers = [];                     // gemeinsam/runde.js erwartet das Feld (Begleiter gibt es nur bei den Schnecken)
  aus.fassung = steinListe(z.fassung, FASSUNGEN - 1);
  aus.amulette = (Array.isArray(z.amulette) ? z.amulette : []).map(a => {
    // Übernahme: frühere Amulette waren nur eine Liste von Steinen → rundes Gold-Amulett
    if (Array.isArray(a)) { const st = steinListe(a, FASSUNGEN); return { steine: st, form: 'rund', material: 'gold', stein: st[0] }; }
    const m = a && typeof a === 'object' ? modellPruefen(a) : null;
    if (!m) return null;
    const st = steinListe(a.steine, FASSUNGEN);
    return { steine: st, ...m, stein: m.stein || st[0] };
  }).filter(a => a && a.steine.length === FASSUNGEN).slice(-MAX_AMULETTE);
  aus.modell = modellPruefen(z.modell) || neuesModell(aus.amulette, materialDerStufe(aus.stufe));
  if (!aus.modell.stein) aus.modell.stein = aus.fassung[0] || STEINE[0];
  aus.modell.material = materialDerStufe(aus.stufe);   // das angefangene Amulett hat immer das Material der Stufe
  return aus;
}

const TAG = /^\d{4}-\d{2}-\d{2}$/;
/** Gespeicherte Runde prüfen: null oder { ende, tag, pause, zeitUm, steine }. */
export function rundePruefen(r) {
  if (!r || typeof r !== 'object' || !Number.isFinite(r.ende)) return null;
  return {
    ende: r.ende, tag: typeof r.tag === 'string' && TAG.test(r.tag) ? r.tag : '',
    pause: Number.isFinite(r.pause) && r.pause >= 0 && r.pause <= 24 * 3600 * 1000 ? r.pause : null,
    zeitUm: r.zeitUm === true,
    steine: Number.isInteger(r.steine) && r.steine >= 0 && r.steine <= 1000 ? r.steine : 0,
  };
}
/** Runde fertig (für gemeinsam/runde.js). Ergebnis: { steine } dieser Runde. */
export function rundeBeendenLT(z) {
  const steine = z.runde ? z.runde.steine || 0 : 0;
  z.runde = null;
  return { steine };
}

/**
 * Richtige Aufgabe: Stein in die nächste Fassung. Ist das Amulett voll, kommt es in die Schatzkammer, und ein neues Modell beginnt.
 * Verändert den Zustand. Ergebnis: { platz, voll }
 */
export function steinEinsetzen(z, sorte, r = Math.random) {
  // Das Amulett hat eine Steinsorte; die Sorte der Aufgabe gilt nur, wenn noch keine festgelegt ist
  sorte = STEINE.includes(z.modell?.stein) ? z.modell.stein : STEINE.includes(sorte) ? sorte : STEINE[0];
  z.fassung.push(sorte);
  const platz = z.fassung.length - 1;
  if (z.fassung.length >= FASSUNGEN) {
    z.amulette.push({ steine: z.fassung.slice(0, FASSUNGEN), ...z.modell });
    if (z.amulette.length > MAX_AMULETTE) z.amulette.shift();
    z.fassung = [];
    z.modell = neuesModell(z.amulette, materialDerStufe(z.stufe), r);
    return { platz, voll: true };
  }
  return { platz, voll: false };
}
