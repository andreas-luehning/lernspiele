// Einstellungen für Erwachsene, die das Spielen betreffen. Gespeichert unter "lernspiele:spiel".
import { lesen, schreiben, vorhanden } from './speicher.js';

const STANDARD = {
  siebenMitQuerstrich: true, // 7 zählt nur mit Querstrich (so lernen es Kinder in Deutschland)
  rundenProTag: 3,           // 1, 2, 3 … oder 0 = unbegrenzt
};
const RUNDEN = [0, 1, 2, 3, 4, 5];

export function einstellungen() {
  let e;
  if (vorhanden('spiel')) e = lesen('spiel', STANDARD);
  else e = { ...STANDARD, ...lesen('erkennung', { siebenMitQuerstrich: true }) }; // frühere Ablage übernehmen
  if (!RUNDEN.includes(e.rundenProTag)) e.rundenProTag = STANDARD.rundenProTag;
  return e;
}
export const setzeEinstellung = aenderung => schreiben('spiel', { ...einstellungen(), ...aenderung });
