// Einstellungen für Erwachsene, die das Spielen betreffen. Gespeichert unter "lernspiele:spiel".
import { lesen, schreiben, vorhanden } from './speicher.js';

const STANDARD = {
  siebenMitQuerstrich: true, // 7 zählt nur mit Querstrich (so lernen es Kinder in Deutschland)
  lernzeitMinuten: 20,       // gemeinsame Lernzeit pro Tag für alle Spiele
};
export const LERNZEITEN = [15, 20, 25, 30];

export function einstellungen() {
  let e;
  if (vorhanden('spiel')) e = lesen('spiel', STANDARD);
  else e = { ...STANDARD, ...lesen('erkennung', { siebenMitQuerstrich: true }) }; // frühere Ablage übernehmen
  if (!LERNZEITEN.includes(e.lernzeitMinuten)) e.lernzeitMinuten = STANDARD.lernzeitMinuten;
  return e;
}
export const setzeEinstellung = aenderung => schreiben('spiel', { ...einstellungen(), ...aenderung });
