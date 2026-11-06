// Zehnerweg: Aufgaben, Lösungen, Tipps. Keine Zugriffe auf die Seite, damit es sich leicht prüfen lässt.
// Regeln: docs/zehnerweg.md

/** Felder, die das Kind ausfüllt, in Rechenreihenfolge. */
export const ORDER = ['part1', 'ten', 'part2', 'goal'];

const zufall = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));

/**
 * Neue Aufgabe erzeugen.
 * Plus: a 3–9, b 2–9, a + b > 10. Minus: a 11–18, b 2–9, a − b < 10, a − 10 < b.
 * Nie zweimal hintereinander dieselbe Aufgabe.
 * @param {'plus'|'minus'|'mix'} modus
 * @param {{op:string,a:number,b:number}|null} vorige
 */
export function neueAufgabe(modus, vorige = null, rnd = Math.random) {
  const op = modus === 'mix' ? (rnd() < 0.5 ? 'plus' : 'minus') : (modus === 'minus' ? 'minus' : 'plus');
  const gleich = (a, b) => vorige && vorige.op === op && vorige.a === a && vorige.b === b;
  let a, b;
  if (op === 'plus') { do { a = zufall(rnd, 3, 9); b = zufall(rnd, 2, 9); } while (a + b <= 10 || gleich(a, b)); }
  else { do { a = zufall(rnd, 11, 18); b = zufall(rnd, 2, 9); } while (a - b >= 10 || a - 10 >= b || gleich(a, b)); }
  const p1 = op === 'plus' ? 10 - a : a - 10;
  return { op, a, b, ans: { part1: p1, ten: 10, part2: b - p1, goal: op === 'plus' ? a + b : a - b } };
}

export const zeichen = op => (op === 'plus' ? '+' : '−');

/** Tipp für ein Feld. */
export function tipp(t, id) {
  const { op, a, b, ans } = t;
  if (op === 'plus') return {
    part1: `Welche Zahl ist in die ${a} verliebt? Zusammen ergeben sie 10.`,
    ten: `${a} + ${ans.part1} = ? Dort kommst du nach dem ersten Schritt an.`,
    part2: `Zerlege die ${b}: ${ans.part1} und wie viel noch?`,
    goal: `Rechne jetzt 10 + ${ans.part2}.`,
  }[id];
  return {
    part1: `Wie viel musst du von ${a} wegnehmen, um bei 10 zu landen?`,
    ten: `${a} − ${ans.part1} = ? Dort kommst du nach dem ersten Schritt an.`,
    part2: `Zerlege die ${b}: ${ans.part1} und wie viel noch?`,
    goal: `10 − ${ans.part2}: Welche Zahl ist in die ${ans.part2} verliebt?`,
  }[id];
}

/** Das Feld mit dem Herz: Plus erster kleiner Kreis, Minus Ergebnis (zweiter Kreis + Ergebnis = 10). */
export const herzFeld = t => (t.op === 'plus' ? 'part1' : 'goal');

/**
 * Felder bewerten.
 * @param {object} t Aufgabe
 * @param {Record<string, number|null>} werte erkannte Werte je Feld
 */
export function bewerten(t, werte) {
  const richtig = [], falsch = [], leer = [];
  for (const id of ORDER) {
    const v = werte[id];
    if (v == null) leer.push(id);
    else if (v === t.ans[id]) richtig.push(id);
    else falsch.push(id);
  }
  return { richtig, falsch, leer, fertig: richtig.length === ORDER.length };
}
