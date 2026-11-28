// Prüft die Aufgabenlogik von Zehnerweg und Leuchttisch ohne Browser. Aufruf: node tests/logik.mjs
import { neueAufgabe, bewerten, tipp, ORDER } from '../zehnerweg/aufgaben.js';
import * as LT from '../leuchttisch/aufgaben.js';
import * as BU from '../burgen/burg-logik.js';
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
chk(z.stufe === 0 && z.eingabe === 'tippen' && z.zweiSorten === true && z.licht === 'ruhig' && z.seite === 'rechts', 'lt zustand werte');
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

// Burgen: 8–20 Teile, Turm 2–6, Mitte 1–8, Turm · Mitte · Turm symmetrisch, Dach oben, nichts schwebt,
// kein Muster aus den letzten 5, nie zweimal dieselbe Anzahl, Antworten, Statistik
{ const anzahlen = new Map(), muster = new Set(), verlauf = [];
  for (let i = 0; i < 6000; i++) {
    const c = BU.neueBurg(Math.random, verlauf);
    anzahlen.set(c.total, (anzahlen.get(c.total) || 0) + 1); muster.add(BU.muster(c));
    chk(c.total >= 8 && c.total <= 20 && c.total === c.parts[0] + c.parts[1] + c.parts[2] && c.parts[0] === c.parts[2], 'burg anzahl ' + c.total);
    chk(c.tower.length === c.parts[0] && c.mid.list.length === c.parts[1] && c.parts[0] >= 2 && c.parts[0] <= 6 && c.parts[1] >= 1 && c.parts[1] <= 8, 'burg teile ' + BU.muster(c));
    chk(!verlauf.slice(-5).some(v => BU.muster(v) === BU.muster(c)), 'burg: Muster aus den letzten 5 wiederholt ' + BU.muster(c));
    chk(!verlauf.length || verlauf.at(-1).total !== c.total, 'burg: zweimal dieselbe Anzahl');
    chk(c.cT !== c.cM, 'burg zwei farben');
    chk(BU.istDach(c.tower.at(-1).t) && c.tower.slice(0, -1).every(p => !BU.istDach(p.t)), 'burg turm: dach nur oben');
    chk(c.mid.list.slice(0, -1).every(p => !BU.istDach(p.t)), 'burg mitte: dach nur oben');
    chk(c.mid.list.every((p, k) => !(p.t === 'bogen' && !p.flip) || k === 0), 'burg mitte: Tor nur unten');
    chk(c.tower.reduce((s, p) => s + p.rows, 0) <= 9 && c.mid.list.reduce((s, p) => s + p.rows, 0) <= 8, 'burg nicht zu hoch');
    const l = BU.anordnen(c);
    chk(l.teile.length === c.total, 'burg: ein Teil pro Baustein');
    for (const b of [0, 1, 2]) {             // nichts schwebt: jedes Teil steht auf dem Boden oder auf dem darunter
      const st = l.teile.filter(t => t.bereich === b);
      st.forEach((t, k) => { const unten = k === 0 ? l.groundY + BU.G : st[k - 1].y; chk(Math.abs(t.y + t.h + BU.G - unten) < 1e-6, 'burg schwebt nicht'); });
    }
    const opts = BU.antworten(c.total);
    chk(opts.length === 4 && new Set(opts).size === 4 && opts.includes(c.total) && opts.every(o => o > 0), 'burg antworten ' + opts);
    verlauf.push(c);
  }
  chk(anzahlen.size === 13 && Math.min(...anzahlen.values()) > 6000 / 13 * 0.7, 'burg: alle Anzahlen 8–20 etwa gleich oft ' + JSON.stringify([...anzahlen].sort((a, b) => a[0] - b[0])));
  chk(muster.size >= 25, 'burg: viele verschiedene Muster (' + muster.size + ')');
  console.log('Burgen: ' + muster.size + ' Muster, Anzahlen', [...anzahlen].sort((a, b) => a[0] - b[0]).map(([k, v]) => k + ':' + v).join(' '));
  const st = BU.statistikPruefen({ geloest: 3, gleichRichtig: -1, mitHilfe: 1.5, fehlversuche: '<b>', x: 1 });
  chk(JSON.stringify(st) === JSON.stringify({ geloest: 3, gleichRichtig: 0, mitHilfe: 0, fehlversuche: 0 }), 'burg statistik bereinigt ' + JSON.stringify(st));
  BU.geloestZaehlen(st, { fehler: false, hilfe: false }); BU.geloestZaehlen(st, { fehler: true, hilfe: false }); BU.geloestZaehlen(st, { fehler: false, hilfe: true });
  chk(st.geloest === 6 && st.gleichRichtig === 1 && st.mitHilfe === 1, 'burg statistik zählt ' + JSON.stringify(st)); }
console.log('Burgen geprüft');
console.log(fehler ? fehler + ' Fehler' : 'alles ok');
process.exit(fehler ? 1 : 0);
