// Probe-Modus für Erwachsene: eigener Speicher (lernspiele:probe:…), kurze Runden, „Nächster Tag“ im Garten.
// Eingeschaltet mit ?probe an der Adresse oder dem Knopf unter „Für Erwachsene“. Er gilt für diesen Tab
// (sessionStorage), bleibt also beim Wechsel zwischen den Seiten an, bis er beendet wird.

const KEY = 'lernspiele-probe';
const param = new URLSearchParams(typeof location !== 'undefined' ? location.search : ''); // in Node-Tests gibt es kein location
if (param.has('probe')) { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }

function gesetzt() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }

export const PROBE = param.has('probe') || gesetzt();
export function probeStarten() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }
export function probeBeenden() { try { sessionStorage.removeItem(KEY); } catch (e) {} }
