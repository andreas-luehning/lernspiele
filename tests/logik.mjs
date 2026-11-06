// Prüft die Aufgabenlogik des Zehnerwegs ohne Browser. Aufruf: node tests/logik.mjs
import { neueAufgabe, bewerten, tipp, ORDER } from '../zehnerweg/aufgaben.js';
let fehler = 0; const chk = (c, m) => { if (!c) { fehler++; console.log('FEHLER', m); } };
for (const modus of ['plus', 'minus', 'mix']) {
  let vor = null; const ops = new Set();
  for (let i = 0; i < 5000; i++) {
    const t = neueAufgabe(modus, vor); ops.add(t.op);
    const { a, b, ans } = t;
    if (t.op === 'plus') { chk(a >= 3 && a <= 9 && b >= 2 && b <= 9 && a + b > 10, `plus ${a}+${b}`); chk(a + ans.part1 === 10 && ans.goal === a + b, 'plus lösung'); }
    else { chk(a >= 11 && a <= 18 && b >= 2 && b <= 9 && a - b < 10 && a - 10 < b, `minus ${a}-${b}`); chk(a - ans.part1 === 10 && ans.goal === a - b && ans.part2 + ans.goal === 10, 'minus lösung'); }
    chk(ans.part1 + ans.part2 === b && ans.part1 > 0 && ans.part2 > 0, 'zerlegung');
    if (vor) chk(!(vor.op === t.op && vor.a === a && vor.b === b), 'doppelt');
    for (const id of ORDER) chk(typeof tipp(t, id) === 'string', 'tipp');
    vor = t;
  }
  console.log(modus, [...ops]);
}
const t = neueAufgabe('plus');
let r = bewerten(t, { part1: t.ans.part1, ten: 10, part2: null, goal: 99 });
chk(r.falsch[0] === 'goal' && r.leer[0] === 'part2' && !r.fertig, 'bewerten teil');
r = bewerten(t, { ...t.ans }); chk(r.fertig, 'bewerten fertig');
console.log('Beispiel', t.a, '+', t.b, '→', tipp(t, 'part1'));
console.log(fehler ? fehler + ' Fehler' : 'alles ok');
process.exit(fehler ? 1 : 0);
