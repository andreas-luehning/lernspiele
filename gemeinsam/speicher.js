// Speicher für alle Lernspiele: localStorage mit Präfix "lernspiele:" und Versionsnummer.
//
// Sicherheit: Gespeicherte Daten gelten als nicht vertrauenswürdig (jemand kann sie im Browser
// verändern, oder eine alte Version hat etwas anderes geschrieben). Darum wird beim Lesen nur
// übernommen, was im Standard-Objekt vorkommt und denselben Typ hat. Unbekannte Schlüssel
// (auch "__proto__") werden ignoriert. Alle Zugriffe sind in try/catch, weil localStorage im
// privaten Modus oder bei vollem Speicher Fehler wirft.

import { PROBE } from './probe.js';

const BASIS = 'lernspiele:', PROBE_BASIS = 'lernspiele:probe:';
// Im Probe-Modus eigener Speicher, damit Tests von Erwachsenen den Garten des Kindes nicht verändern
const PRAEFIX = PROBE ? PROBE_BASIS : BASIS;
export const VERSION = 1;

function gleicherTyp(wert, standard) {
  if (Array.isArray(standard)) return Array.isArray(wert);
  if (typeof standard === 'number') return typeof wert === 'number' && Number.isFinite(wert);
  if (standard === null) return wert === null;
  return typeof wert === typeof standard && wert !== null;
}

/** Nimmt aus `daten` nur die Schlüssel von `standard` mit passendem Typ; Rest = Standardwert. */
export function bereinigen(daten, standard) {
  const aus = {};
  for (const key of Object.keys(standard)) {
    const wert = daten && Object.prototype.hasOwnProperty.call(daten, key) ? daten[key] : undefined;
    aus[key] = gleicherTyp(wert, standard[key]) ? wert : structuredClone(standard[key]);
  }
  return aus;
}

/** Liest `lernspiele:<name>`. Gibt immer ein Objekt mit genau den Schlüsseln von `standard` zurück. */
export function lesen(name, standard) {
  try {
    const roh = localStorage.getItem(PRAEFIX + name);
    if (roh == null || roh.length > 200_000) return bereinigen(null, standard);
    const obj = JSON.parse(roh);
    if (!obj || typeof obj !== 'object' || obj.version !== VERSION) return bereinigen(null, standard);
    return bereinigen(obj, standard);
  } catch (e) {
    return bereinigen(null, standard);
  }
}

/** Speichert `daten` unter `lernspiele:<name>`. Gibt false zurück, wenn es nicht ging. */
export function schreiben(name, daten) {
  try {
    localStorage.setItem(PRAEFIX + name, JSON.stringify({ version: VERSION, ...daten }));
    return true;
  } catch (e) {
    return false;
  }
}

/** Gibt es schon einen Eintrag `lernspiele:<name>`? */
export function vorhanden(name) {
  try { return localStorage.getItem(PRAEFIX + name) != null; } catch (e) { return false; }
}

/**
 * Gespeicherte Spielstände löschen. probe: true → nur den Probe-Speicher; false → alles Echte außer dem Tag/Nacht-Thema.
 * @returns {number} Anzahl gelöschter Einträge
 */
export function alleLoeschen(probe) {
  let n = 0;
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    for (const k of keys) {
      if (!k || !k.startsWith(BASIS)) continue;
      const istProbe = k.startsWith(PROBE_BASIS);
      if (probe ? istProbe : (!istProbe && k !== BASIS + 'einstellungen')) { localStorage.removeItem(k); n++; }
    }
  } catch (e) {}
  return n;
}

/** Liest einen alten Schlüssel ohne Präfix (nur für die einmalige Übernahme aus den Prototypen). */
export function altLesen(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
