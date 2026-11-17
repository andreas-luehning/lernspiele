// Zehner und Einer: Aufgaben, Lösungen, Tipps, Bewertung, Bild der Zehnerstangen. Keine Zugriffe auf die Seite, direkt testbar.
// Regeln: docs/zehnerundeiner.md

export const MODI = ['zehner', 'einer', 'ergaenzen', 'mix'];
export const zeichen = op => (op === 'plus' ? '+' : '−');

const zufall = (rnd, a, b) => a + Math.floor(rnd() * (b - a + 1));
const zeh = n => Math.floor(n / 10), ein = n => n % 10;

/** Felder, die das Kind ausfüllt, in Reihenfolge. */
export const felderFuer = t => (t.art === 'ergaenzen' ? ['z', 'erg'] : ['z', 'e', 'erg']);

function rechnen(art, op, rnd) {
  let a, b;
  if (art === 'zehner') {
    if (op === 'plus') {
      if (rnd() < 0.3) { const az = zufall(rnd, 1, 6); a = az * 10; b = zufall(rnd, 1, 9 - az) * 10 + zufall(rnd, 1, 9); }   // 50 + 37
      else { const az = zufall(rnd, 1, 7); a = az * 10 + zufall(rnd, 1, 9); b = zufall(rnd, 1, 9 - az) * 10; }                 // 12 + 30
    } else { const az = zufall(rnd, 2, 9); a = az * 10 + zufall(rnd, 1, 9); b = zufall(rnd, 1, az - 1) * 10; }                  // 74 − 20
  } else if (op === 'plus') { const ae = zufall(rnd, 1, 8); a = zufall(rnd, 1, 9) * 10 + ae; b = zufall(rnd, 1, 9 - ae); }       // 42 + 5
  else { const ae = zufall(rnd, 1, 9); a = zufall(rnd, 1, 9) * 10 + ae; b = zufall(rnd, 1, ae); }                                  // 68 − 5
  const r = op === 'plus' ? a + b : a - b;
  return { art: 'rechnen', op, a, b, ans: { z: zeh(r), e: ein(r), erg: r } };
}

function ergaenzen(op, rnd) {
  let a, m;
  if (op === 'plus') { const az = zufall(rnd, 1, 6); a = az * 10 + zufall(rnd, 1, 9); m = zufall(rnd, 1, 9 - az) * 10; }   // 36 + ▢ = 66
  else { const az = zufall(rnd, 2, 9); a = az * 10 + zufall(rnd, 1, 9); m = zufall(rnd, 1, az - 1) * 10; }                  // 64 − ▢ = 24
  const c = op === 'plus' ? a + m : a - m;
  return { art: 'ergaenzen', op, a, b: m, c, ans: { z: m / 10, erg: m } };
}

/**
 * Neue Aufgabe. Nie zweimal hintereinander dieselbe.
 * @param {'zehner'|'einer'|'ergaenzen'|'mix'} modus
 */
export function neueAufgabe(modus, vorige = null, rnd = Math.random) {
  for (;;) {
    const art = modus === 'mix' ? ['zehner', 'einer', 'ergaenzen'][zufall(rnd, 0, 2)] : (MODI.includes(modus) ? modus : 'zehner');
    const op = rnd() < 0.5 ? 'plus' : 'minus';
    const t = art === 'ergaenzen' ? ergaenzen(op, rnd) : rechnen(art, op, rnd);
    if (!(vorige && vorige.art === t.art && vorige.op === t.op && vorige.a === t.a && vorige.b === t.b)) return t;
  }
}

/** Das Ergebnis (bei Ergänzen die Zahl am Ende der Gleichung). */
export const ergebnis = t => (t.art === 'ergaenzen' ? t.c : t.ans.erg);

/** Tipp für ein Feld. */
export function tipp(t, id) {
  const z = zeichen(t.op), plus = t.op === 'plus';
  if (t.art === 'ergaenzen') {
    const g = t.c, a = t.a;
    if (id === 'z') return `Von ${plus ? a : g} bis ${plus ? g : a}: Die Einer sind gleich. Wie viele Zehner ${plus ? 'kommen dazu' : 'werden weggenommen'}?`;
    return `${t.ans.z} Zehner sind ${t.b}. Probier die Umkehraufgabe: ${plus ? `${g} − ${a}` : `${a} − ${g}`}.`;
  }
  const az = zeh(t.a), bz = zeh(t.b), ae = ein(t.a), be = ein(t.b);
  if (id === 'z') {
    if (bz === 0) return `Die Zehner ändern sich nicht. Wie viele Zehner hat die ${t.a}?`;
    return plus ? `Wie viele Zehner sind es zusammen? ${az} Zehner und ${bz} Zehner.` : `Du hast ${az} Zehner und nimmst ${bz} weg.`;
  }
  if (id === 'e') return be === 0 ? `Die Einer bleiben sitzen. Welche Einer stehen in der ${t.a}?` : `Rechne die Einer: ${ae} ${z} ${be} = ?`;
  return `Setze zusammen: ${t.ans.z} Zehner und ${t.ans.e} Einer.`;
}

/**
 * Felder bewerten.
 * @param {object} t Aufgabe
 * @param {Record<string, number|null>} werte erkannte Werte je Feld
 */
export function bewerten(t, werte) {
  const richtig = [], falsch = [], leer = [], order = felderFuer(t);
  for (const id of order) {
    const v = werte[id];
    if (v == null) leer.push(id);
    else if (v === t.ans[id]) richtig.push(id);
    else falsch.push(id);
  }
  return { richtig, falsch, leer, fertig: richtig.length === order.length };
}

/* ---------- Bild: Zehnerstangen und Einerwürfel (nur Zahlen, nie Eingaben) ---------- */
const U = 12, LUECKE = 5;   // Würfelgröße, Abstand zwischen den Stangen
const STANGE_H = 10 * U;

/** Eine Zahl als Stangen (blau) und Würfel (orange). weg: Anzahl Stangen/Würfel am Ende, die durchgestrichen werden; neu: eigene Farbe für die zweite Zahl. */
function gruppe(z, e, x0, y0, { wegZ = 0, wegE = 0, neu = false } = {}) {
  let s = '', x = x0;
  const kreuz = (px, py, w, h) => `<path class="kreuz" d="M${px} ${py}L${px + w} ${py + h}M${px + w} ${py}L${px} ${py + h}"/>`;
  for (let i = 0; i < z; i++) {
    const weg = i >= z - wegZ;
    s += `<g class="${weg ? 'weg' : ''}"><rect class="stange${neu ? ' neu' : ''}" x="${x}" y="${y0}" width="${U}" height="${STANGE_H}" rx="2"/>`;
    for (let k = 1; k < 10; k++) s += `<line class="teil" x1="${x}" x2="${x + U}" y1="${y0 + k * U}" y2="${y0 + k * U}"/>`;
    s += '</g>' + (weg ? kreuz(x - 2, y0 + STANGE_H / 2 - 18, U + 4, 36) : '');
    x += U + LUECKE;
  }
  if (z) x += 8;
  const ex = x;
  for (let i = 0; i < e; i++) {
    const px = ex + Math.floor(i / 5) * (U + 3), py = y0 + STANGE_H - 5 * U + (i % 5) * U, weg = i >= e - wegE;
    s += `<rect class="wuerfel${neu ? ' neu' : ''}${weg ? ' weg' : ''}" x="${px}" y="${py}" width="${U - 1}" height="${U - 1}" rx="2"/>` + (weg ? kreuz(px, py, U - 1, U - 1) : '');
  }
  const breite = (ex - x0) + (e ? (e > 5 ? 2 : 1) * (U + 3) : 0);
  return { svg: s, breite: Math.max(breite, U) };
}

/** SVG-Text (ohne Rahmen-Tag) und Größe des Bildes zur Aufgabe. */
export function bild(t) {
  if (t.art === 'ergaenzen') {
    const g1 = gruppe(zeh(t.a), ein(t.a), 4, 4), g2 = gruppe(zeh(t.c), ein(t.c), 4, STANGE_H + 22);
    return { b: 190, h: 2 * STANGE_H + 40, svg: g1.svg + g2.svg };
  }
  const az = zeh(t.a), ae = ein(t.a), bz = zeh(t.b), be = ein(t.b);
  const g1 = gruppe(az, ae, 4, 4, t.op === 'minus' ? { wegZ: bz, wegE: be } : {});
  if (t.op === 'minus') return { b: g1.breite + 10, h: STANGE_H + 8, svg: g1.svg };
  const x2 = g1.breite + 46, g2 = gruppe(bz, be, x2, 4, { neu: true });
  return { b: x2 + g2.breite + 6, h: STANGE_H + 8, svg: g1.svg + `<text class="plus" x="${g1.breite + 12}" y="${STANGE_H / 2 + 14}">+</text>` + g2.svg };
}
