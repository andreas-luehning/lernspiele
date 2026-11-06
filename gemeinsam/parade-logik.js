// Schneckenparade: Regeln und Zustand. Keine Zugriffe auf die Seite, damit es sich leicht prüfen lässt.
// Regeln: docs/schneckenparade.md. Gespeichert unter "lernspiele:parade".

import { lesen, schreiben } from './speicher.js';

export const COLORS = {
  rosa: { name: 'Rosa', adj: 'rosa', fill: '#ff9ec4' }, gelb: { name: 'Gelb', adj: 'gelbem', fill: '#ffd447' },
  mint: { name: 'Mint', adj: 'mintgrünem', fill: '#7fe0b8' }, blau: { name: 'Himmelblau', adj: 'himmelblauem', fill: '#7cc8ff' },
  lila: { name: 'Lila', adj: 'lila', fill: '#b79bff' }, orange: { name: 'Orange', adj: 'orangem', fill: '#ffad66' },
};
export const PATTERNS = { uni: 'Einfarbig', punkte: 'Punkte', streifen: 'Streifen', sterne: 'Sterne', herzen: 'Herzen', wellen: 'Wellen' };
export const HATS = { krone: 'Krone', zylinder: 'Zylinder', blumen: 'Blumenkranz', pirat: 'Piratenhut', zipfel: 'Zipfelmütze', party: 'Partyhut', schleife: 'Schleife', koch: 'Kochmütze' };
const HAT_ART = { krone: 'einer', zylinder: 'einem', blumen: 'einem', pirat: 'einem', zipfel: 'einer', party: 'einem', schleife: 'einer', koch: 'einer' };
export const SPECIALS = { glitzer: 'Glitzerhaus', regenbogen: 'Regenbogenhaus', kaefer: 'Marienkäfer' };
export const DECO = { pilz: 'Pilz', blume: 'Blume', teich: 'Teich', bank: 'Bank', kanne: 'Gießkanne', hotel: 'Schneckenhotel' };
export const STAGES = ['Baby', 'Klein', 'Groß', 'Glitzer'];
const GROW = [0, 2, 5, 10];              // Ausflüge, ab denen die Stufe gilt
export const SCALE = [0.6, 0.78, 1, 1];  // Größe je Stufe
const NAMES = ['Lotti', 'Paul', 'Frieda', 'Kurt', 'Mia', 'Ole', 'Wilma', 'Theo', 'Ida', 'Fritz', 'Greta', 'Emil', 'Lina', 'Bruno', 'Pia', 'Jonte', 'Rosi', 'Anton', 'Mila', 'Hugo', 'Nele', 'Otto', 'Flora', 'Max', 'Tilda', 'Leo', 'Edda', 'Moritz', 'Ronja', 'Karl'];
const KAEFER_NAMEN = ['Punkti', 'Kiki', 'Lulu'];
const SPIELE = ['zehnerweg', 'start'];

export const RUNDE_MS = 5 * 60 * 1000;
export const NACHSPIEL_MS = 3 * 60 * 1000; // so lange darf die angefangene Aufgabe nach Ablauf noch dauern
export const MAX_BEGLEITER = 3;
const MAX_NAME = 20, MAX_TIERE = 3000;

export const stageOf = runs => GROW.filter(g => runs >= g).length - 1;

/** Heutiges Datum als YYYY-MM-DD in lokaler Zeit. */
export function heute(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Beschreibung für Sprechblase und Vorlesen, z. B. "Lotti mit gelbem Haus voller Punkte und einer Krone". */
export function describe(s) {
  if (s.special === 'kaefer') return `${s.name}, der Marienkäfer`;
  let t = `${s.name} mit ${COLORS[s.color].adj} Haus`;
  if (s.pattern !== 'uni') t += ` voller ${PATTERNS[s.pattern]}`;
  if (s.special === 'regenbogen') t = `${s.name} mit Regenbogenhaus`;
  if (s.hat) t += ` und ${HAT_ART[s.hat]} ${HATS[s.hat]}`;
  return t;
}

/* ---------- Speichern und Prüfen ---------- */

const STANDARD = {
  garden: [], walkers: [], leaves: 0, cleanLeaves: true, lastRoundDay: '', rundenHeute: 0, practiceDays: 0,
  deco: [], newCount: 0, nextId: 1, runde: null,
};
const istId = v => Number.isInteger(v) && v > 0 && v < 1e9;
const istZahl = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
const istTag = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const hat = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);

/** Eine gespeicherte Schnecke prüfen. Gibt eine saubere Kopie oder null zurück. */
export function pruefeSchnecke(s) {
  if (!s || typeof s !== 'object') return null;
  if (!istId(s.id) || typeof s.name !== 'string' || !s.name.trim()) return null;
  if (!hat(COLORS, s.color) || !hat(PATTERNS, s.pattern)) return null;
  if (!(s.hat === null || hat(HATS, s.hat))) return null;
  if (!(s.special === null || s.special === 'regenbogen' || s.special === 'kaefer')) return null;
  const runs = istZahl(s.runs, 100000) ? s.runs : 0;
  return {
    id: s.id, name: s.name.trim().slice(0, MAX_NAME), color: s.color, pattern: s.pattern, hat: s.hat,
    special: s.special, runs, stage: s.special === 'kaefer' ? 0 : stageOf(runs),
    born: istTag(s.born) ? s.born : '', spiel: SPIELE.includes(s.spiel) ? s.spiel : '',
  };
}

/** Den ganzen Zustand prüfen und bereinigen. */
export function bereinigeZustand(roh) {
  const z = { ...roh };
  const ids = new Set();
  z.garden = (Array.isArray(z.garden) ? z.garden : []).slice(0, MAX_TIERE).map(pruefeSchnecke)
    .filter(s => s && !ids.has(s.id) && ids.add(s.id));
  z.walkers = [...new Set((Array.isArray(z.walkers) ? z.walkers : []).filter(id => ids.has(id)))].slice(0, MAX_BEGLEITER);
  z.leaves = istZahl(z.leaves, 2) ? z.leaves : 0;
  z.cleanLeaves = z.cleanLeaves !== false;
  z.lastRoundDay = istTag(z.lastRoundDay) ? z.lastRoundDay : '';
  z.practiceDays = istZahl(z.practiceDays, 100000) ? z.practiceDays : 0;
  z.rundenHeute = istZahl(z.rundenHeute, 10000) ? z.rundenHeute : (z.lastRoundDay ? 1 : 0);
  z.deco = Object.keys(DECO).filter(k => Array.isArray(z.deco) && z.deco.includes(k));
  z.newCount = istZahl(z.newCount, 1e6) ? z.newCount : 0;
  const maxId = z.garden.reduce((m, s) => Math.max(m, s.id), 0);
  z.nextId = istId(z.nextId) && z.nextId > maxId ? z.nextId : maxId + 1;
  const r = z.runde;
  z.runde = r && typeof r === 'object' && Number.isFinite(r.ende) ? {
    ende: r.ende, tag: istTag(r.tag) ? r.tag : '',
    pause: Number.isFinite(r.pause) && r.pause >= 0 && r.pause <= 24 * 3600 * 1000 ? r.pause : null,
    begleiter: (Array.isArray(r.begleiter) ? r.begleiter : []).filter(id => ids.has(id)).slice(0, MAX_BEGLEITER),
    neu: (Array.isArray(r.neu) ? r.neu : []).filter(id => ids.has(id)).slice(0, 200),
    zeitUm: r.zeitUm === true,
  } : null;
  return z;
}

export function ladeParade(rnd = Math.random, tag = heute()) {
  // runde ist null oder ein Objekt; speicher.js prüft nur den Typ, darum hier {} als Muster und genaue Prüfung in bereinigeZustand
  let z = bereinigeZustand(lesen('parade', { ...STANDARD, runde: {} }));
  if (!z.garden.length) z = startGarten(z, rnd, tag);
  return z;
}
export const speichereParade = z => schreiben('parade', z);

/** Neuer Garten: 3 Babyschnecken ohne Hut, die gleich mitlaufen. */
export function startGarten(z, rnd = Math.random, tag = heute()) {
  const n = { ...structuredClone(STANDARD), ...z, garden: [], walkers: [] };
  for (let i = 0; i < 3; i++) { const s = neueSchnecke(n, false, rnd, tag, 'start'); s.special = null; n.garden.push(s); n.walkers.push(s.id); }
  return n;
}

/* ---------- Regeln ---------- */

const wahl = (rnd, a) => a[Math.floor(rnd() * a.length)];

/** Neue Babyschnecke: bevorzugt eine fehlende Farbe-Muster-Kombination und (mit Hut) einen fehlenden Hut. */
export function neueSchnecke(z, mitHut, rnd = Math.random, tag = heute(), spiel = 'zehnerweg') {
  const vorhanden = new Set(z.garden.filter(s => !s.special).map(s => s.color + '|' + s.pattern));
  const frei = [];
  for (const c in COLORS) for (const p in PATTERNS) if (!vorhanden.has(c + '|' + p)) frei.push([c, p]);
  const [color, pattern] = frei.length ? wahl(rnd, frei) : [wahl(rnd, Object.keys(COLORS)), wahl(rnd, Object.keys(PATTERNS))];
  let hut = null;
  if (mitHut) {
    const da = new Set(z.garden.map(s => s.hat)); const fehlt = Object.keys(HATS).filter(k => !da.has(k));
    hut = wahl(rnd, fehlt.length ? fehlt : Object.keys(HATS));
  }
  const special = rnd() < 1 / 15 ? 'regenbogen' : null;
  const benutzt = new Set(z.garden.map(s => s.name)); const freieNamen = NAMES.filter(n => !benutzt.has(n));
  const name = freieNamen.length ? wahl(rnd, freieNamen) : wahl(rnd, NAMES) + ' ' + (z.garden.length + 1);
  return { id: z.nextId++, name, color, pattern, hat: hut, special, runs: 0, stage: 0, born: tag, spiel };
}

/** Wie viele Runden gehen heute noch? max = Runden pro Tag, 0 = unbegrenzt. */
export function nochRunden(z, tag = heute(), max = 1) {
  if (max === 0) return Infinity;
  return Math.max(0, max - (z.lastRoundDay === tag ? z.rundenHeute : 0));
}
export const kannHeuteSpielen = (z, tag = heute(), max = 1) => !!z.runde || nochRunden(z, tag, max) > 0;
export const laeuft = z => !!z.runde;

/** Runde beginnen, wenn heute noch eine geht. Gibt true zurück, wenn eine Runde läuft. */
export function rundeStarten(z, jetzt = Date.now(), dauer = RUNDE_MS, tag = heute(), max = 1) {
  if (z.runde) return true;
  if (nochRunden(z, tag, max) <= 0) return false;
  z.runde = { ende: jetzt + dauer, pause: null, tag, begleiter: [...z.walkers], neu: [], zeitUm: false };
  return true;
}

export const restzeit = (z, jetzt = Date.now()) => (!z.runde ? 0 : z.runde.pause != null ? z.runde.pause : Math.max(0, z.runde.ende - jetzt));
export const pausiert = z => !!z.runde && z.runde.pause != null;

/** Uhr anhalten (nicht mehr, wenn die Zeit schon um ist). */
export function pausieren(z, jetzt = Date.now()) {
  const r = z.runde; if (!r || r.pause != null || r.zeitUm) return false;
  r.pause = Math.max(0, r.ende - jetzt); return true;
}
/** Uhr weiterlaufen lassen. */
export function fortsetzen(z, jetzt = Date.now()) {
  const r = z.runde; if (!r || r.pause == null) return false;
  r.ende = jetzt + r.pause; r.pause = null; return true;
}

/**
 * Richtige Aufgabe: ein Salatblatt. Bei 3 Blättern kommt eine neue Schnecke (mit Hut, wenn ohne Fehler dazwischen),
 * jede 10. neue Schnecke bringt einen Marienkäfer mit.
 * @returns {{neu: object|null, kaefer: object|null}|null} null, wenn keine Runde läuft
 */
export function richtig(z, rnd = Math.random, tag = heute(), spiel = 'zehnerweg') {
  if (!z.runde) return null;
  z.leaves++;
  let neu = null, kaefer = null;
  if (z.leaves >= 3) {
    neu = neueSchnecke(z, z.cleanLeaves, rnd, tag, spiel);
    z.garden.push(neu); z.runde.neu.push(neu.id); z.newCount++;
    if (z.newCount % 10 === 0) {
      kaefer = { id: z.nextId++, name: wahl(rnd, KAEFER_NAMEN), color: 'rosa', pattern: 'uni', hat: null, special: 'kaefer', runs: 0, stage: 0, born: tag, spiel };
      z.garden.push(kaefer); z.runde.neu.push(kaefer.id);
    }
    z.leaves = 0; z.cleanLeaves = true;
  }
  return { neu, kaefer };
}

/** Falsche Aufgabe: kein Blatt, nichts geht verloren, nur der Hut für die laufenden 3 Blätter fällt weg. */
export function falsch(z) {
  if (!z.runde) return false;
  z.cleanLeaves = false;
  return true;
}

/**
 * Runde beenden: Begleiter von Anfang an zählen einen Ausflug und wachsen; alle 5 Übungstage neue Deko.
 * @returns {{neu: object[], gewachsen: object[], deko: string|null}}
 */
export function rundeBeenden(z, tag = heute()) {
  const r = z.runde; if (!r) return { neu: [], gewachsen: [], deko: null };
  // Als Übungstag zählt der Tag, an dem die Runde begann (auch wenn sie erst später abgeschlossen wird)
  // Übungstage zählen jeden Tag nur einmal, auch bei mehreren Runden
  const rundenTag = r.tag || tag, neuerTag = z.lastRoundDay !== rundenTag;
  z.runde = null;
  if (neuerTag) { z.lastRoundDay = rundenTag; z.rundenHeute = 1; z.practiceDays++; } else z.rundenHeute++;
  const byId = new Map(z.garden.map(s => [s.id, s]));
  const gewachsen = [];
  for (const id of r.begleiter) {
    const s = byId.get(id); if (!s || s.special === 'kaefer') continue;
    s.runs++; const st = stageOf(s.runs);
    if (st > s.stage) { s.stage = st; gewachsen.push(s); }
  }
  let deko = null;
  if (neuerTag && z.practiceDays % 5 === 0) { const fehlt = Object.keys(DECO).filter(k => !z.deco.includes(k)); if (fehlt.length) { deko = fehlt[0]; z.deco.push(deko); } }
  return { neu: r.neu.map(id => byId.get(id)).filter(Boolean), gewachsen, deko };
}

/** Begleiter an- oder abwählen (nicht während einer Runde). Bei mehr als 3 fällt der zuerst gewählte heraus. */
export function begleiterUmschalten(z, id) {
  if (z.runde || !z.garden.some(s => s.id === id)) return false;
  if (z.walkers.includes(id)) z.walkers = z.walkers.filter(x => x !== id);
  else { z.walkers.push(id); while (z.walkers.length > MAX_BEGLEITER) z.walkers.shift(); }
  return true;
}

/** Wer läuft gerade auf der Straße: Begleiter, dann die Neuen dieser Runde. */
export function parade(z) {
  const ids = z.runde ? [...z.runde.begleiter, ...z.runde.neu] : [...z.walkers];
  const byId = new Map(z.garden.map(s => [s.id, s]));
  return ids.map(id => byId.get(id)).filter(Boolean);
}

/** Sammelalbum: was ist schon entdeckt? */
export function album(z) {
  const hatWert = (k, v) => z.garden.some(s => s[k] === v);
  const gruppen = [
    ['Häuser', Object.fromEntries(Object.entries(COLORS).map(([k, v]) => [k, v.name])), k => hatWert('color', k)],
    ['Muster', PATTERNS, k => hatWert('pattern', k)],
    ['Hüte', HATS, k => hatWert('hat', k)],
    ['Besonderes', SPECIALS, k => (k === 'glitzer' ? z.garden.some(s => s.stage >= 3) : hatWert('special', k))],
    ['Garten-Deko', DECO, k => z.deco.includes(k)],
  ];
  return gruppen.map(([titel, dict, test]) => ({ titel, eintraege: Object.keys(dict).map(k => ({ key: k, name: dict[k], da: test(k) })) }));
}
