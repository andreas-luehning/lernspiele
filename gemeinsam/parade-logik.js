// Schneckenparade: Regeln und Zustand. Keine Zugriffe auf die Seite, damit es sich leicht prüfen lässt.
// Regeln: docs/schneckenparade.md. Gespeichert unter "lernspiele:parade".
//
// Modell: Eine fertig geübte 5-Minuten-Runde bringt eine neue Schnecke (Durchhalten).
// Richtige Aufgaben bringen Salatblätter; 5 Blätter = eine Kopfbedeckung in der Hutschachtel (Richtigrechnen).
// Das Kind setzt Kopfbedeckungen im Garten selbst auf. Wie lange geübt wird, regelt die gemeinsame Lernzeit (lernzeit.js).

import { lesen, schreiben } from './speicher.js';

export const COLORS = {
  rosa: { name: 'Rosa', adj: 'rosa', fill: '#ff9ec4' }, gelb: { name: 'Gelb', adj: 'gelbem', fill: '#ffd447' },
  mint: { name: 'Mint', adj: 'mintgrünem', fill: '#7fe0b8' }, blau: { name: 'Himmelblau', adj: 'himmelblauem', fill: '#7cc8ff' },
  lila: { name: 'Lila', adj: 'lila', fill: '#b79bff' }, orange: { name: 'Orange', adj: 'orangem', fill: '#ffad66' },
};
export const PATTERNS = { uni: 'Einfarbig', punkte: 'Punkte', streifen: 'Streifen', sterne: 'Sterne', herzen: 'Herzen', wellen: 'Wellen' };
export const HATS = {
  krone: 'Krone', zylinder: 'Zylinder', blumen: 'Blumenkranz', pirat: 'Piratenhut', zipfel: 'Zipfelmütze', party: 'Partyhut',
  schleife: 'Schleife', koch: 'Kochmütze', bommel: 'Bommelmütze', sonne: 'Sonnenhut', zauber: 'Zaubererhut',
  kapitaen: 'Kapitänsmütze', kopfhoerer: 'Kopfhörer', cowboy: 'Cowboyhut',
};
const HAT_ART = {
  krone: 'einer', zylinder: 'einem', blumen: 'einem', pirat: 'einem', zipfel: 'einer', party: 'einem', schleife: 'einer',
  koch: 'einer', bommel: 'einer', sonne: 'einem', zauber: 'einem', kapitaen: 'einer', kopfhoerer: '', cowboy: 'einem',
};
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
export const BLAETTER_PRO_HUT = 5;
export let FEHLT_BEVORZUGT = 0.2;  // Wahrscheinlichkeit, dass bewusst ein fehlendes Haus bzw. eine fehlende Kopfbedeckung kommt
export const setzeBevorzugt = w => { FEHLT_BEVORZUGT = w; }; // nur für Simulationen
const MAX_NAME = 20, MAX_TIERE = 3000, MAX_SCHACHTEL = 500;

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
  if (s.hat) t += ` und ${HAT_ART[s.hat] ? HAT_ART[s.hat] + ' ' : ''}${HATS[s.hat]}`;
  return t;
}

/* ---------- Speichern und Prüfen ---------- */

const STANDARD = {
  garden: [], walkers: [], leaves: 0, hutschachtel: [], hueteGefunden: [], practiceDays: 0, lastPracticeDay: '',
  deco: [], newCount: 0, nextId: 1, runde: null,
};
// Felder älterer Spielstände, die beim Laden noch gelesen werden, um sie zu übernehmen
const ALT = { lastRoundDay: '', korb: [] };

const istId = v => Number.isInteger(v) && v > 0 && v < 1e9;
const istZahl = (v, max) => Number.isInteger(v) && v >= 0 && v <= max;
const istTag = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const hat = (obj, k) => Object.prototype.hasOwnProperty.call(obj, k);
const istHut = k => typeof k === 'string' && hat(HATS, k);

/** Eine gespeicherte Schnecke prüfen. Gibt eine saubere Kopie oder null zurück. */
export function pruefeSchnecke(s) {
  if (!s || typeof s !== 'object') return null;
  if (!istId(s.id) || typeof s.name !== 'string' || !s.name.trim()) return null;
  if (!hat(COLORS, s.color) || !hat(PATTERNS, s.pattern)) return null;
  if (!(s.hat === null || istHut(s.hat))) return null;
  if (!(s.special === null || s.special === 'regenbogen' || s.special === 'kaefer')) return null;
  const runs = istZahl(s.runs, 100000) ? s.runs : 0;
  return {
    id: s.id, name: s.name.trim().slice(0, MAX_NAME), color: s.color, pattern: s.pattern, hat: s.special === 'kaefer' ? null : s.hat,
    special: s.special, runs, stage: s.special === 'kaefer' ? 0 : stageOf(runs),
    born: istTag(s.born) ? s.born : '', spiel: SPIELE.includes(s.spiel) ? s.spiel : '',
    ausflug: istTag(s.ausflug) ? s.ausflug : '',
  };
}

/** Den ganzen Zustand prüfen und bereinigen (auch alte Spielstände übernehmen). */
export function bereinigeZustand(roh, rnd = Math.random) {
  const z = { ...roh };
  const ids = new Set();
  z.garden = (Array.isArray(z.garden) ? z.garden : []).slice(0, MAX_TIERE).map(pruefeSchnecke)
    .filter(s => s && !ids.has(s.id) && ids.add(s.id));
  z.walkers = [...new Set((Array.isArray(z.walkers) ? z.walkers : []).filter(id => ids.has(id)))].slice(0, MAX_BEGLEITER);
  z.leaves = istZahl(z.leaves, BLAETTER_PRO_HUT - 1) ? z.leaves : 0;
  z.hutschachtel = (Array.isArray(z.hutschachtel) ? z.hutschachtel : []).filter(istHut).slice(0, MAX_SCHACHTEL);
  z.hueteGefunden = Object.keys(HATS).filter(k => (Array.isArray(z.hueteGefunden) && z.hueteGefunden.includes(k)) || z.hutschachtel.includes(k) || z.garden.some(s => s.hat === k));
  z.practiceDays = istZahl(z.practiceDays, 100000) ? z.practiceDays : 0;
  z.lastPracticeDay = istTag(z.lastPracticeDay) ? z.lastPracticeDay : (istTag(z.lastRoundDay) ? z.lastRoundDay : '');
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
    huete: (Array.isArray(r.huete) ? r.huete : []).filter(istHut).slice(0, 200),
    zeitUm: r.zeitUm === true,
  } : null;
  // Übernahme aus der vorigen Fassung: Schnecken aus dem Salatkorb schlüpfen jetzt
  const korb = Array.isArray(z.korb) ? z.korb.filter(k => typeof k === 'boolean').slice(0, 2) : [];
  for (let i = 0; i < korb.length; i++) {
    const s = neueSchnecke(z, rnd, z.lastPracticeDay || heute(), 'zehnerweg'); z.garden.push(s); z.newCount++;
  }
  delete z.korb; delete z.lastRoundDay; delete z.rundenHeute; delete z.neuHeute; delete z.neuHeuteTag; delete z.cleanLeaves;
  return z;
}

export function ladeParade(rnd = Math.random, tag = heute()) {
  // runde ist null oder ein Objekt; speicher.js prüft nur den Typ, darum hier {} als Muster und genaue Prüfung in bereinigeZustand
  let z = bereinigeZustand(lesen('parade', { ...STANDARD, ...ALT, runde: {} }), rnd);
  if (!z.garden.length) z = startGarten(z, rnd, tag);
  return z;
}
export const speichereParade = z => schreiben('parade', z);

/** Neuer Garten: 3 Babyschnecken ohne Kopfbedeckung, die gleich mitlaufen. */
export function startGarten(z, rnd = Math.random, tag = heute()) {
  const n = { ...structuredClone(STANDARD), ...z, garden: [], walkers: [] };
  for (let i = 0; i < 3; i++) { const s = neueSchnecke(n, rnd, tag, 'start'); s.special = null; n.garden.push(s); n.walkers.push(s.id); }
  return n;
}

/* ---------- Regeln ---------- */

const wahl = (rnd, a) => a[Math.floor(rnd() * a.length)];

/** Neue Babyschnecke ohne Kopfbedeckung. In 20 % der Fälle bewusst ein Haus, das im Sammelalbum fehlt. */
export function neueSchnecke(z, rnd = Math.random, tag = heute(), spiel = 'zehnerweg') {
  const vorhanden = new Set(z.garden.filter(s => !s.special).map(s => s.color + '|' + s.pattern));
  const frei = [];
  for (const c in COLORS) for (const p in PATTERNS) if (!vorhanden.has(c + '|' + p)) frei.push([c, p]);
  const [color, pattern] = frei.length && rnd() < FEHLT_BEVORZUGT ? wahl(rnd, frei) : [wahl(rnd, Object.keys(COLORS)), wahl(rnd, Object.keys(PATTERNS))];
  const special = rnd() < 1 / 15 ? 'regenbogen' : null;
  const benutzt = new Set(z.garden.map(s => s.name)); const freieNamen = NAMES.filter(n => !benutzt.has(n));
  const name = freieNamen.length ? wahl(rnd, freieNamen) : wahl(rnd, NAMES) + ' ' + (z.garden.length + 1);
  return { id: z.nextId++, name, color, pattern, hat: null, special, runs: 0, stage: 0, born: tag, spiel, ausflug: '' };
}

/** Neue Kopfbedeckung: zufällig, in 20 % der Fälle bewusst eine, die noch fehlt. */
export function neuerHut(z, rnd = Math.random) {
  const fehlt = Object.keys(HATS).filter(k => !z.hueteGefunden.includes(k));
  return wahl(rnd, fehlt.length && rnd() < FEHLT_BEVORZUGT ? fehlt : Object.keys(HATS));
}

export const laeuft = z => !!z.runde;

/** Runde beginnen (ob heute noch Lernzeit da ist, prüft runde.js). Gibt true zurück, wenn eine Runde läuft. */
export function rundeStarten(z, jetzt = Date.now(), dauer = RUNDE_MS, tag = heute()) {
  if (z.runde) return true;
  z.runde = { ende: jetzt + dauer, pause: null, tag, begleiter: [...z.walkers], neu: [], huete: [], zeitUm: false };
  return true;
}

export const restzeit = (z, jetzt = Date.now()) => (!z.runde ? 0 : z.runde.pause != null ? z.runde.pause : Math.max(0, z.runde.ende - jetzt));
export const pausiert = z => !!z.runde && z.runde.pause != null;

/** Uhr anhalten (nicht mehr, wenn die Zeit schon um ist). */
export function pausieren(z, jetzt = Date.now()) {
  const r = z.runde; if (!r || r.pause != null || r.zeitUm) return false;
  r.pause = Math.max(0, r.ende - jetzt); return true;
}
/** Uhr weiterlaufen lassen. Eine Runde vom Vortag zählt ab jetzt für heute. */
export function fortsetzen(z, jetzt = Date.now(), tag = heute()) {
  const r = z.runde; if (!r || r.pause == null) return false;
  r.ende = jetzt + r.pause; r.pause = null; r.tag = tag; return true;
}

/**
 * Richtige Aufgabe: ein Salatblatt. Bei 5 Blättern kommt eine Kopfbedeckung in die Hutschachtel.
 * @returns {{hut: string|null}|null} null, wenn keine Runde läuft (freies Üben)
 */
export function richtig(z, rnd = Math.random) {
  if (!z.runde) return null;
  z.leaves++;
  let hut = null;
  if (z.leaves >= BLAETTER_PRO_HUT) {
    hut = neuerHut(z, rnd);
    z.hutschachtel.push(hut);
    if (!z.hueteGefunden.includes(hut)) z.hueteGefunden.push(hut);
    z.runde.huete.push(hut);
    z.leaves = 0;
  }
  return { hut };
}

/** Falsche Aufgabe: kein Blatt, nichts geht verloren. */
export function falsch(z) { return !!z.runde; }

/**
 * Runde fertig (5 Minuten durchgehalten): eine neue Schnecke, jede 10. bringt einen Marienkäfer mit.
 * Begleiter von Anfang an zählen einen Ausflug (jede Schnecke höchstens einmal am Tag). Alle 5 Übungstage neue Deko.
 * @returns {{neu: object[], gewachsen: object[], deko: string|null, huete: string[]}}
 */
export function rundeBeenden(z, tag = heute(), rnd = Math.random) {
  const r = z.runde; if (!r) return { neu: [], gewachsen: [], deko: null, huete: [] };
  const rundenTag = r.tag || tag;
  const neu = neueSchnecke(z, rnd, rundenTag, 'zehnerweg');
  z.garden.push(neu); r.neu.push(neu.id); z.newCount++;
  if (z.newCount % 10 === 0) {
    const kaefer = { id: z.nextId++, name: wahl(rnd, KAEFER_NAMEN), color: 'rosa', pattern: 'uni', hat: null, special: 'kaefer', runs: 0, stage: 0, born: rundenTag, spiel: 'zehnerweg', ausflug: '' };
    z.garden.push(kaefer); r.neu.push(kaefer.id);
  }
  // Übungstage zählen jeden Tag nur einmal (nicht am Stück; Tage ohne Üben zählen einfach nicht)
  const neuerTag = z.lastPracticeDay !== rundenTag;
  if (neuerTag) { z.lastPracticeDay = rundenTag; z.practiceDays++; }
  z.runde = null;
  const byId = new Map(z.garden.map(s => [s.id, s]));
  const gewachsen = [];
  for (const id of r.begleiter) {
    const s = byId.get(id); if (!s || s.special === 'kaefer') continue;
    if (s.ausflug === rundenTag) continue; // jede Schnecke wächst höchstens einmal am Tag
    s.ausflug = rundenTag; s.runs++; const st = stageOf(s.runs);
    if (st > s.stage) { s.stage = st; gewachsen.push(s); }
  }
  let deko = null;
  if (neuerTag && z.practiceDays % 5 === 0) { const fehlt = Object.keys(DECO).filter(k => !z.deco.includes(k)); if (fehlt.length) { deko = fehlt[0]; z.deco.push(deko); } }
  return { neu: r.neu.map(id => byId.get(id)).filter(Boolean), gewachsen, deko, huete: [...r.huete] };
}

/** Begleiter an- oder abwählen (nicht während einer Runde). Bei mehr als 3 fällt der zuerst gewählte heraus. */
export function begleiterUmschalten(z, id) {
  if (z.runde || !z.garden.some(s => s.id === id)) return false;
  if (z.walkers.includes(id)) z.walkers = z.walkers.filter(x => x !== id);
  else { z.walkers.push(id); while (z.walkers.length > MAX_BEGLEITER) z.walkers.shift(); }
  return true;
}

/** Kopfbedeckung aus der Hutschachtel einer Schnecke aufsetzen; eine alte wandert zurück in die Schachtel. */
export function hutAufsetzen(z, hutKey, id) {
  const i = z.hutschachtel.indexOf(hutKey);
  const s = z.garden.find(x => x.id === id);
  if (i < 0 || !s || s.special === 'kaefer') return false;
  z.hutschachtel.splice(i, 1);
  if (s.hat) z.hutschachtel.push(s.hat);
  s.hat = hutKey;
  return true;
}
/** Kopfbedeckung abnehmen und zurück in die Schachtel legen. */
export function hutAbnehmen(z, id) {
  const s = z.garden.find(x => x.id === id);
  if (!s || !s.hat) return false;
  z.hutschachtel.push(s.hat); s.hat = null;
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
  const haeuser = {};
  for (const c in COLORS) for (const p in PATTERNS) haeuser[c + '|' + p] = `${COLORS[c].name}, ${PATTERNS[p]}`;
  const gruppen = [
    ['Häuser', haeuser, k => z.garden.some(s => !s.special && s.color + '|' + s.pattern === k)],
    ['Hüte', HATS, k => z.hueteGefunden.includes(k)],
    ['Besonderes', SPECIALS, k => (k === 'glitzer' ? z.garden.some(s => s.stage >= 3) : hatWert('special', k))],
    ['Garten-Deko', DECO, k => z.deco.includes(k)],
  ];
  return gruppen.map(([titel, dict, test]) => ({ titel, eintraege: Object.keys(dict).map(k => ({ key: k, name: dict[k], da: test(k) })) }));
}
