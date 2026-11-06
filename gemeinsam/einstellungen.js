// Einstellungen für Erwachsene, die das Spielen betreffen. Gespeichert unter "lernspiele:erkennung".
import { lesen, schreiben } from './speicher.js';

const STANDARD = {
  siebenMitQuerstrich: true, // 7 zählt nur mit Querstrich (so lernen es Kinder in Deutschland)
};

export const erkennung = () => lesen('erkennung', STANDARD);
export const setzeErkennung = aenderung => schreiben('erkennung', { ...erkennung(), ...aenderung });
