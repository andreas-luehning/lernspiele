// Prüft die Aufgabenlogik von „Zehner und Einer“ ohne Browser. Aufruf: node tests/zehnerundeiner-logik.mjs
import { neueAufgabe, bewerten, tipp, felderFuer, bild, ergebnis } from '../zehnerundeiner/aufgaben.js';
let fehler = 0; const chk = (c, m) => { if (!c) { fehler++; console.log('FEHLER', m); } };
const z = n => Math.floor(n / 10), e = n => n % 10;
for (const modus of ['zehner', 'einer', 'ergaenzen', 'mix']) {
  let vor = null; const arten = new Set(), ops = new Set();
  for (let i = 0; i < 8000; i++) {
    const t = neueAufgabe(modus, vor); arten.add(t.art); ops.add(t.op);
    const { a, b } = t, plus = t.op === 'plus';
    if (t.art === 'rechnen') {
      const r = plus ? a + b : a - b;
      chk(r >= 10 && r <= 99, `ergebnis ${a}${plus ? '+' : '-'}${b}`);
      chk(t.ans.erg === r && t.ans.z === z(r) && t.ans.e === e(r), 'lösung');
      // kein Zehnerübergang: Zehner und Einer einzeln rechnen
      chk(plus ? e(a) + e(b) <= 9 && z(a) + z(b) <= 9 : e(a) >= e(b) && z(a) >= z(b), `übergang ${a} ${t.op} ${b}`);
      chk(modus !== 'zehner' || t.art !== 'rechnen' || e(b) === 0 || (plus && e(a) === 0), `zehner-modus ${a} ${t.op} ${b}`);
    } else {
      chk(b % 10 === 0 && b > 0 && t.ans.erg === b && t.ans.z === b / 10, 'ergänzen lösung');
      chk(plus ? a + b === t.c : a - b === t.c, 'ergänzen gleichung');
      chk(e(a) === e(t.c) && t.c >= 10 && t.c <= 99 && a >= 10, 'ergänzen einer gleich');
    }
    if (vor) chk(!(vor.art === t.art && vor.op === t.op && vor.a === a && vor.b === b), 'doppelt');
    for (const id of felderFuer(t)) chk(typeof tipp(t, id) === 'string' && tipp(t, id).length > 5, 'tipp');
    const bd = bild(t); chk(bd.b > 0 && bd.h > 0 && /^<[gtrlp]/.test(bd.svg), 'bild');
    const gut = Object.fromEntries(felderFuer(t).map(id => [id, t.ans[id]]));
    chk(bewerten(t, gut).fertig, 'bewerten fertig');
    chk(typeof ergebnis(t) === 'number', 'ergebnis');
    vor = t;
  }
  console.log(modus, [...arten], [...ops]);
}
const t = neueAufgabe('zehner');
const r = bewerten(t, { z: t.ans.z, e: null, erg: 1 });
chk(r.richtig[0] === 'z' && r.leer[0] === 'e' && r.falsch[0] === 'erg' && !r.fertig, 'bewerten teil');
console.log('Beispiel', t.a, t.op, t.b, '→', tipp(t, 'z'), '|', tipp(t, 'e'));
console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK'); process.exit(fehler ? 1 : 0);
