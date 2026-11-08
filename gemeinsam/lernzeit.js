// Gemeinsame Lernzeit pro Tag für alle Lernspiele (Medienzeit). Gespeichert unter "lernspiele:lernzeit".
// Gezählt wird nur echte Übungszeit: runde.js meldet, wie lange die Uhr gelaufen ist (nicht bei Pause).
// Die Dauer stellen Erwachsene ein (einstellungen.js: lernzeitMinuten 15, 20, 25, 30).

import { lesen, schreiben } from './speicher.js';
import { einstellungen } from './einstellungen.js';
import { PROBE } from './probe.js';
import { heute } from './parade-logik.js';

const STANDARD = { tag: '', ms: 0 };
const MAX_MS = 24 * 3600 * 1000;
// Im Probe-Modus ist alles fünfmal schneller (Runde 1 Minute statt 5)
const FAKTOR = PROBE ? 1 / 5 : 1;

function stand(tag = heute()) {
  const s = lesen('lernzeit', STANDARD);
  const ms = Number.isFinite(s.ms) && s.ms >= 0 && s.ms <= MAX_MS ? s.ms : 0;
  return s.tag === tag ? ms : 0; // neuer Tag: wieder bei 0
}

/** Lernzeit, die heute insgesamt zur Verfügung steht (ms). */
export const lernzeitGesamt = () => einstellungen().lernzeitMinuten * 60 * 1000 * FAKTOR;
/** Heute schon geübt (ms). */
export const geuebt = (tag = heute()) => stand(tag);
/** Noch übrige Lernzeit heute (ms). */
export const lernzeitRest = (tag = heute()) => Math.max(0, lernzeitGesamt() - stand(tag));
export const lernzeitUm = (tag = heute()) => lernzeitRest(tag) <= 0;

/** Geübte Zeit hinzurechnen (von runde.js aufgerufen). */
export function lernzeitZaehlen(ms, tag = heute()) {
  if (!(ms > 0)) return;
  schreiben('lernzeit', { tag, ms: Math.min(MAX_MS, stand(tag) + ms) });
}

/** Für die Anzeige: wie viele 5-Minuten-Runden insgesamt und wie viele schon geübt (angefangene zählt halb). */
export function rundenAnzeige(rundeMs = 5 * 60 * 1000 * FAKTOR, tag = heute()) {
  const gesamt = Math.round(lernzeitGesamt() / rundeMs);
  const fertig = stand(tag) / rundeMs;
  return { gesamt, fertig: Math.min(gesamt, fertig) };
}

/** Nur für den Probe-Modus („Nächster Tag“): heutige Lernzeit zurücksetzen. */
export const lernzeitNeu = () => schreiben('lernzeit', { tag: '', ms: 0 });
