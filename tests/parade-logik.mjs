// Prüft die Regeln der Schneckenparade ohne Browser. Aufruf: node tests/parade-logik.mjs
import {
  startGarten, rundeStarten, richtig, falsch, rundeBeenden, kannHeuteSpielen, begleiterUmschalten,
  bereinigeZustand, parade, album, stageOf, neueSchnecke, nochRunden, pausieren, fortsetzen, restzeit,
  setzeBevorzugt, FEHLT_BEVORZUGT, NEU_PRO_TAG, KORB_MAX, limitErreicht,
} from '../gemeinsam/parade-logik.js';

let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok     ' : 'FEHLER ') + m); if (!c) fehler++; };
// Wiederholbarer Zufall
const zufall = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// Startgarten
let z = startGarten({}, zufall(3), '2026-11-02');
chk(z.garden.length === 3 && z.walkers.length === 3, 'Startgarten: 3 Schnecken, alle laufen mit');
chk(z.garden.every(s => s.hat === null && s.stage === 0 && !s.special), 'Startgarten: Babys ohne Hut');
chk(new Set(z.garden.map(s => s.name)).size === 3, 'Startgarten: keine doppelten Namen');

// Ohne Runde gibt es nichts
chk(richtig(z) === null && falsch(z) === false, 'Ohne laufende Runde: keine Blätter, keine Fehler');

// Runde, einmal am Tag
const T1 = '2026-11-02';
chk(rundeStarten(z, 0, 300000, T1), 'Runde startet');
let e = richtig(z, zufall(5), T1); chk(z.leaves === 1 && !e.neu, '1 richtig → 1 Blatt');
e = richtig(z, zufall(5), T1); e = richtig(z, zufall(6), T1);
chk(e.neu && e.neu.hat && z.leaves === 0, '3 richtig ohne Fehler → neue Schnecke mit Hut, Blätter zählen neu');
chk(e.neu.stage === 0 && z.runde.neu.includes(e.neu.id), 'Neue Schnecke ist ein Baby und läuft in der Parade mit');
richtig(z, zufall(7), T1); falsch(z); chk(z.leaves === 1 && !z.cleanLeaves, 'Fehler: Blatt bleibt, Hut fällt weg');
richtig(z, zufall(8), T1); e = richtig(z, zufall(9), T1);
chk(e.neu && e.neu.hat === null && z.cleanLeaves, 'Nach Fehler: Schnecke ohne Hut, danach wieder Hut möglich');
chk(parade(z).length === 5, 'Parade: 3 Begleiter + 2 Neue');
chk(!begleiterUmschalten(z, z.garden[0].id), 'Begleiter wechseln während der Runde nicht möglich');
let erg = rundeBeenden(z, T1);
chk(erg.neu.length === 2 && z.practiceDays === 1 && z.lastRoundDay === T1 && !z.runde, 'Runde endet: Rückblick, Übungstag gezählt');
chk(z.garden.filter(s => z.walkers.includes(s.id)).every(s => s.runs === 1), 'Begleiter haben einen Ausflug');
chk(!kannHeuteSpielen(z, T1) && !rundeStarten(z, 0, 300000, T1), 'Zweite Runde am selben Tag nicht möglich');
chk(kannHeuteSpielen(z, '2026-11-03'), 'Am nächsten Tag wieder möglich');

// Blätter vom Vortag bleiben
const blaetterVorher = z.leaves;
rundeStarten(z, 0, 300000, '2026-11-03');
chk(z.leaves === blaetterVorher, 'Blätter vom Vortag bleiben stehen');

// Runde vom Vortag zählt für den Vortag
z.runde.tag = '2026-11-03'; rundeBeenden(z, '2026-11-04');
chk(z.lastRoundDay === '2026-11-03' && kannHeuteSpielen(z, '2026-11-04'), 'Nicht beendete Runde vom Vortag blockiert den neuen Tag nicht');

// Wachsen
chk([0, 1, 2, 4, 5, 9, 10, 50].map(stageOf).join() === '0,0,1,1,2,2,3,3', 'Wachstumsstufen bei 2, 5, 10 Ausflügen');

// Typische Woche + Deko + Marienkäfer
z = startGarten({}, zufall(11), '2026-11-01');
const rnd = zufall(12); let decos = [];
for (let tag = 1; tag <= 30; tag++) {
  const d = `2026-12-${String(tag).padStart(2, '0')}`;
  rundeStarten(z, 0, 300000, d);
  for (let i = 0; i < 5; i++) richtig(z, rnd, d);
  const r = rundeBeenden(z, d); if (r.deko) decos.push(r.deko);
  if (tag === 5) chk(z.garden.length >= 3 + 7 && z.garden.length <= 3 + 9, `Nach 5 Tagen etwa 8 neue Schnecken (${z.garden.length - 3})`);
}
chk(decos.join() === 'pilz,blume,teich,bank,kanne,hotel', 'Deko alle 5 Übungstage in der richtigen Reihenfolge');
chk(z.garden.filter(s => s.special === 'kaefer').length === Math.floor(z.newCount / 10), 'Jede 10. neue Schnecke bringt einen Marienkäfer');
chk(z.garden.filter(s => z.walkers.includes(s.id)).every(s => s.stage === 3), 'Begleiter nach 30 Ausflügen: Glitzerhaus');
// Bevorzugung fehlender Häuser: bei 100 % keine Wiederholung, beim Standard (20 %) gibt es Wiederholungen
const standardWert = FEHLT_BEVORZUGT; setzeBevorzugt(1);
const voll1 = { garden: [], nextId: 1 }; for (let i = 0; i < 36; i++) voll1.garden.push(neueSchnecke(voll1, false, zufall(i + 7)));
chk(new Set(voll1.garden.filter(s => !s.special).map(s => s.color + s.pattern)).size === voll1.garden.filter(s => !s.special).length, 'Bei 100 % Bevorzugung keine doppelten Häuser');
setzeBevorzugt(standardWert);
chk(standardWert === 0.2, 'Standard: in 20 % der Fälle ein fehlendes Haus');
chk(album(z).find(g => g.titel === 'Garten-Deko').eintraege.every(x => x.da), 'Album zeigt alle Deko-Stücke als entdeckt');

// Begleiter: höchstens 3
z.walkers = []; z.garden.slice(0, 5).forEach(s => begleiterUmschalten(z, s.id));
chk(z.walkers.length === 3 && z.walkers[0] === z.garden[2].id, 'Höchstens 3 Begleiter, der zuerst gewählte fällt heraus');

// Mehrere Runden am Tag (Einstellung), Übungstage zählen einmal pro Tag
z = startGarten({}, zufall(31), '2026-11-01');
const TAG = '2026-11-10';
for (let i = 0; i < 3; i++) { chk(rundeStarten(z, 0, 300000, TAG, 3), `Runde ${i + 1} von 3 startet`); rundeBeenden(z, TAG); }
chk(!rundeStarten(z, 0, 300000, TAG, 3) && nochRunden(z, TAG, 3) === 0, 'Vierte Runde am selben Tag nicht möglich');
chk(z.practiceDays === 1 && z.rundenHeute === 3, 'Drei Runden zählen als ein Übungstag');
chk(z.garden.filter(s => z.walkers.includes(s.id)).every(s => s.runs === 1), 'Jede Schnecke wächst höchstens einmal am Tag');
chk(nochRunden(z, '2026-11-11', 3) === 3, 'Am nächsten Tag wieder 3 Runden');
chk(rundeStarten(z, 0, 300000, TAG, 0) && nochRunden(z, TAG, 0) === Infinity, 'Unbegrenzt: Runden gehen immer');
rundeBeenden(z, TAG);
// Deko nicht doppelt, wenn an einem 5. Übungstag mehrere Runden gespielt werden
z = startGarten({}, zufall(32), '2026-11-01');
for (let t = 1; t <= 5; t++) for (let i = 0; i < 2; i++) { rundeStarten(z, 0, 300000, `2026-12-0${t}`, 2); rundeBeenden(z, `2026-12-0${t}`); }
chk(z.deco.join() === 'pilz' && z.practiceDays === 5, 'Deko nur einmal am 5. Übungstag, auch bei 2 Runden täglich');
// Pause
z = startGarten({}, zufall(33), '2026-11-01');
rundeStarten(z, 1000, 300000, TAG, 3);
chk(pausieren(z, 61000) && restzeit(z, 500000) === 240000, 'Pause hält die Uhr an (Restzeit bleibt stehen)');
chk(fortsetzen(z, 900000) && restzeit(z, 960000) === 180000, 'Fortsetzen: Uhr läuft mit der Restzeit weiter');
z.runde.zeitUm = true; chk(!pausieren(z, 1e6), 'Nach Ablauf der Zeit keine Pause mehr');
rundeBeenden(z, TAG);

// Tageslimit 3 neue Schnecken, dann Salatkorb (Platz für 2), am nächsten Tag schlüpfen sie
z = startGarten({}, zufall(41), '2026-11-01');
const T = '2026-11-20', T2 = '2026-11-21';
rundeStarten(z, 0, 300000, T, 3);
const ergebnisse = []; for (let i = 0; i < 18; i++) ergebnisse.push(richtig(z, zufall(50 + i), T));
chk(ergebnisse.filter(e => e.neu).length === NEU_PRO_TAG && limitErreicht(z, T), '18 richtige Aufgaben: genau 3 neue Schnecken (Tageslimit)');
chk(z.korb.length === KORB_MAX && ergebnisse.filter(e => e.korb).length === 2 && ergebnisse.filter(e => e.korbVoll).length === 1, 'Danach füllt sich der Salatkorb (2), dann ist er voll');
rundeBeenden(z, T);
const vorher = z.garden.length;
rundeStarten(z, 0, 300000, T2, 3);
chk(z.garden.length >= vorher + 2 && z.runde.ausKorb.length >= 2 && z.korb.length === 0 && z.neuHeute === 2, 'Nächster Tag: 2 Schnecken schlüpfen aus dem Korb und zählen fürs Tageslimit');
rundeBeenden(z, T2);
// Andere Begleiter in der zweiten Runde wachsen auch
z = startGarten({}, zufall(42), '2026-11-01');
rundeStarten(z, 0, 1, T, 3); for (let i = 0; i < 3; i++) richtig(z, zufall(60 + i), T); rundeBeenden(z, T);
const ersteBegleiter = [...z.walkers]; const neue = z.garden.find(s => !ersteBegleiter.includes(s.id));
z.walkers = [neue.id];
rundeStarten(z, 0, 1, T, 3); rundeBeenden(z, T);
chk(neue.runs === 1 && z.garden.filter(s => ersteBegleiter.includes(s.id)).every(s => s.runs === 1), 'Zweite Runde mit anderem Begleiter: der wächst auch, die ersten nicht doppelt');
// Korb wird beim Laden geprüft
chk(bereinigeZustand({ korb: [true, 'x', false, true, 5] }).korb.join() === 'true,false', 'Salatkorb: nur wahr/falsch, höchstens 2');

// Manipulierte Daten
const boese = bereinigeZustand({
  garden: [
    { id: 1, name: '<img src=x onerror=alert(1)>'.repeat(5), color: 'rosa', pattern: 'uni', hat: null, special: null, runs: 3 },
    { id: 2, name: 'Böse', color: 'javascript:alert(1)', pattern: 'uni', hat: null, special: null, runs: 0 },
    { id: 3, name: 'Hutlos', color: 'gelb', pattern: 'punkte', hat: 'helm', special: null, runs: 0 },
    { id: 1, name: 'Doppelt', color: 'mint', pattern: 'uni', hat: null, special: null, runs: 0 },
    { id: 4, name: 'Riese', color: 'lila', pattern: 'sterne', hat: 'krone', special: null, runs: 1e12, stage: 99 },
    'kaputt', null,
  ],
  walkers: [1, 2, 99, 4, 4], leaves: 77, deco: ['pilz', 'atombombe'], nextId: -5,
  runde: { ende: 'bald', begleiter: [1] }, __proto__: { boese: true },
});
chk(boese.garden.length === 2, 'Ungültige Schnecken (Farbe, Hut, doppelte ID, kein Objekt) werden verworfen');
chk(boese.garden[0].name.length <= 20, 'Namen werden auf 20 Zeichen gekürzt');
chk(boese.garden[1].runs === 0 && boese.garden[1].stage === 0, 'Unsinnige Zahlen werden zurückgesetzt, Stufe neu berechnet');
chk(boese.walkers.join() === '1,4' && boese.leaves === 0 && boese.deco.join() === 'pilz', 'Begleiter, Blätter, Deko bereinigt');
chk(boese.nextId === 5 && boese.runde === null && !('boese' in Object.getPrototypeOf(boese)), 'nextId, Runde und Prototyp sicher');

// Name nie doppelt, auch wenn die Liste erschöpft ist
const voll = { garden: [], nextId: 1 };
for (let i = 0; i < 40; i++) voll.garden.push(neueSchnecke(voll, false, zufall(i + 1)));
chk(new Set(voll.garden.map(s => s.name)).size === 40, 'Auch bei mehr als 30 Schnecken keine doppelten Namen');

console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
process.exit(fehler ? 1 : 0);
