// Prüft die Aufgabenlogik von Zehnerweg und Leuchttisch ohne Browser. Aufruf: node tests/logik.mjs
import { neueAufgabe, bewerten, tipp, ORDER } from '../zehnerweg/aufgaben.js';
import * as LT from '../leuchttisch/aufgaben.js';
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

// Leuchttisch: Anzahl stimmt immer, Gruppen getrennt, Antworten, Amulett-Regeln, Speicher bereinigen
for (let st = 0; st < LT.STUFEN.length; st++) {
  const S = LT.STUFEN[st];
  for (let i = 0; i < 1500; i++) {
    const zwei = i % 2 === 0;
    const H = [420, 700, 1050, 1500][i % 4];
    const a0 = LT.neueAufgabe(st, { zweiSorten: zwei }); const a = LT.verteilen(a0, 1000, H, LT.steinGroesse(a0));
    chk(a.gesamt >= S.min && a.gesamt <= S.max, `lt stufe ${st} gesamt ${a.gesamt}`);
    chk(a.steine.length === a.gesamt, 'lt anzahl steine');
    chk(a.steine.every(p => p.x >= 0 && p.x <= 1000 && p.y >= 0 && p.y <= H && LT.STEINE.includes(p.sorte)), 'lt steine im tisch');
    if (a.modus === 'zerlegen') {
      const mg = S.maxGruppe || 6;
      chk(a.links + a.rechts === a.gesamt && a.links >= 2 && a.rechts >= 2 && a.links <= mg && a.rechts <= mg, `lt zerlegung ${a.links}+${a.rechts}`);
      chk(a.steine.filter(p => p.gruppe === 0).every(p => p.x < 460) && a.steine.filter(p => p.gruppe === 1).every(p => p.x > 540), 'lt gruppen getrennt');
      chk(zwei ? a.sorteL !== a.sorteR : a.sorteL === a.sorteR, 'lt sorten');
    }
    const o = LT.antworten(a.gesamt);
    chk(o.length === 4 && new Set(o).size === 4 && o.includes(a.gesamt) && o.every(z => z >= 1), 'lt antworten ' + o);
    chk(!LT.tipp(a).includes(String(a.gesamt)), 'lt tipp verrät nichts');
  }
}
const z = LT.zustandPruefen({ stufe: 9, eingabe: '<b>', zweiSorten: 'ja', fassung: ['rubin', 'gold', '__proto__', 'topas'], amulette: [['rubin'], ['rubin', 'saphir', 'smaragd', 'amethyst', 'topas'], 'x'] });
chk(z.stufe === 0 && z.eingabe === 'tippen' && z.zweiSorten === true && z.licht === 'ruhig', 'lt zustand werte');
chk(JSON.stringify(z.fassung) === '["rubin","topas"]' && z.amulette.length === 1, 'lt zustand steine bereinigt');
const z2 = LT.zustandPruefen({ stufe: 0, eingabe: 'tippen', zweiSorten: true, fassung: [], amulette: [] });
for (let i = 0; i < LT.FASSUNGEN - 1; i++) chk(!LT.steinEinsetzen(z2, 'saphir').voll, 'lt noch nicht voll');
const e = LT.steinEinsetzen(z2, 'boese');
chk(e.voll && z2.fassung.length === 0 && z2.amulette.length === 1 && z2.amulette[0].steine.every(s => LT.STEINE.includes(s)), 'lt amulett voll');
chk(LT.rundePruefen({ ende: 'x' }) === null && LT.rundePruefen(null) === null, 'lt runde ungültig');
const rp = LT.rundePruefen({ ende: 5, tag: '<b>', pause: -3, zeitUm: 'ja', steine: 1e9 });
chk(rp && rp.tag === '' && rp.pause === null && rp.zeitUm === false && rp.steine === 0, 'lt runde bereinigt');
const zr = { runde: { ende: 1, steine: 4 } }; chk(LT.rundeBeendenLT(zr).steine === 4 && zr.runde === null, 'lt runde beenden');
// Modelle: Material nach Stufe, fehlende Formen bevorzugt, alte Amulette übernommen
chk(LT.MODELLE.length === LT.FORMEN.length * LT.MATERIALIEN.length, 'lt modelle');
chk(LT.STUFEN.every(s => LT.MATERIALIEN.includes(s.material)), 'lt jede stufe hat ein material');
{ const am = []; const formen = new Set();
  for (let i = 0; i < LT.FORMEN.length; i++) { const m = LT.neuesModell(am, 'silber'); chk(m.material === 'silber', 'lt material'); formen.add(m.form); am.push({ steine: [], ...m }); }
  chk(formen.size === LT.FORMEN.length, 'lt fehlende formen zuerst');
  const m = LT.neuesModell(am, 'silber'); chk(m.form !== am[am.length - 1].form, 'lt nicht zweimal dasselbe'); }
const za = LT.zustandPruefen({ stufe: 3, amulette: [['rubin', 'rubin', 'saphir', 'topas', 'citrin'], { steine: ['rubin', 'rubin', 'saphir', 'topas', 'citrin'], form: '<b>', material: 'gold' }, { steine: ['rubin', 'rubin', 'saphir', 'topas', 'citrin'], form: 'sonne', material: 'ton' }], modell: { form: 'schild', material: 'gold' } });
chk(za.amulette.length === 2 && za.amulette[0].form === 'rund' && za.amulette[0].material === 'gold' && za.amulette[1].form === 'sonne' && za.amulette[1].material === 'bronze', 'lt alte amulette übernommen (ton → bronze), kaputte entfernt');
chk(za.modell.form === 'schild' && za.modell.material === 'kristall', 'lt angefangenes amulett: material der stufe');
{ const z3 = LT.zustandPruefen({ stufe: 1 }); for (let i = 0; i < LT.FASSUNGEN; i++) LT.steinEinsetzen(z3, 'rubin');
  chk(z3.amulette.length === 1 && z3.amulette[0].material === 'silber' && z3.modell.material === 'silber', 'lt fertiges amulett silber (stufe 2), neues auch'); }
{ const z4 = LT.zustandPruefen({ stufe: 0 }); const sorte = z4.modell.stein; chk(LT.STEINE.includes(sorte), 'lt amulett hat steinsorte');
  for (let i = 0; i < LT.FASSUNGEN; i++) LT.steinEinsetzen(z4, LT.STEINE.find(s => s !== sorte));
  chk(z4.amulette[0].steine.every(s => s === sorte) && z4.amulette[0].stein === sorte && z4.modell.stein !== sorte, 'lt alle steine eines amuletts gleich, nächstes andere sorte'); }
console.log('Leuchttisch geprüft');
console.log(fehler ? fehler + ' Fehler' : 'alles ok');
process.exit(fehler ? 1 : 0);
