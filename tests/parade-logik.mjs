// Prüft die Regeln der Schneckenparade ohne Browser. Aufruf: node tests/parade-logik.mjs
import {
  startGarten, rundeStarten, richtig, falsch, rundeBeenden, kannHeuteSpielen, begleiterUmschalten,
  bereinigeZustand, parade, album, stageOf, neueSchnecke,
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
const ersteNormale = z.garden.filter(s => !s.special).slice(0, 36);
chk(new Set(ersteNormale.map(s => s.color + s.pattern)).size === ersteNormale.length, 'Bis alle 36 Kombinationen da sind, wiederholt sich keine Farbe-Muster-Kombination');
chk(album(z).find(g => g.titel === 'Garten-Deko').eintraege.every(x => x.da), 'Album zeigt alle Deko-Stücke als entdeckt');

// Begleiter: höchstens 3
z.walkers = []; z.garden.slice(0, 5).forEach(s => begleiterUmschalten(z, s.id));
chk(z.walkers.length === 3 && z.walkers[0] === z.garden[2].id, 'Höchstens 3 Begleiter, der zuerst gewählte fällt heraus');

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
