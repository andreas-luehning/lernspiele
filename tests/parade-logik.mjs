// Prüft die Regeln der Schneckenparade ohne Browser. Aufruf: node tests/parade-logik.mjs
import {
  startGarten, rundeStarten, richtig, falsch, rundeBeenden, begleiterUmschalten, bereinigeZustand, parade, album,
  stageOf, neueSchnecke, pausieren, fortsetzen, restzeit, hutAufsetzen, hutAbnehmen, setzeBevorzugt, FEHLT_BEVORZUGT,
  BLAETTER_PRO_HUT, HATS, MIN_RICHTIG, COLORS, namePasst, MAEDCHEN_NAMEN, JUNGEN_NAMEN, NEUTRALE_NAMEN,
} from '../gemeinsam/parade-logik.js';

let fehler = 0; const chk = (c, m) => { console.log((c ? 'ok     ' : 'FEHLER ') + m); if (!c) fehler++; };
const zufall = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const T1 = '2026-11-02', T2 = '2026-11-03';
// Eine Runde mit genug richtigen Aufgaben beenden (ohne dass dabei Salatblätter und Kopfbedeckungen entstehen)
const fertig = (z, tag, rnd) => { z.runde.geloest = MIN_RICHTIG; return rundeBeenden(z, tag, rnd); };

// Startgarten
let z = startGarten({}, zufall(3), '2026-11-01');
chk(z.garden.length === 1 && z.walkers.length === 1, 'Startgarten: eine Schnecke, sie läuft mit');
chk(z.garden.every(s => s.hat === null && s.stage === 0 && !s.special), 'Startgarten: Babys ohne Kopfbedeckung');
chk(z.garden[0].name.length > 0 && z.garden[0].born === '2026-11-01', 'Startgarten: Schnecke hat Namen und Geburtstag');

// Ohne Runde (Lernzeit um / freies Üben) gibt es nichts
chk(richtig(z) === null && falsch(z) === false, 'Ohne laufende Runde: keine Blätter (freies Üben)');

// Blätter → Kopfbedeckung
rundeStarten(z, 0, 300000, T1);
for (let i = 0; i < BLAETTER_PRO_HUT - 1; i++) richtig(z, zufall(10 + i));
chk(z.leaves === BLAETTER_PRO_HUT - 1 && z.hutschachtel.length === 0, `${BLAETTER_PRO_HUT - 1} richtige Aufgaben: ${BLAETTER_PRO_HUT - 1} Blätter, noch keine Kopfbedeckung`);
falsch(z);
chk(z.leaves === BLAETTER_PRO_HUT - 1, 'Falsche Aufgabe: kein Blatt, nichts geht verloren');
const e = richtig(z, zufall(20));
chk(e.hut && z.hutschachtel.includes(e.hut) && z.hueteGefunden.includes(e.hut) && z.leaves === 0 && z.runde.huete.includes(e.hut), `${BLAETTER_PRO_HUT}. Blatt: Kopfbedeckung in der Hutschachtel, Blätter zählen neu`);
chk(z.garden.length === 1, 'Blätter bringen keine Schnecken');

// Runde fertig → eine Schnecke
let erg = rundeBeenden(z, T1, zufall(30));
chk(erg.neu.length === 1 && erg.neu[0].hat === null && erg.neu[0].stage === 0 && z.garden.length === 2, 'Runde fertig: genau eine neue Babyschnecke ohne Kopfbedeckung');
chk(erg.huete.length === 1, 'Rückblick kennt die Kopfbedeckungen dieser Runde');
chk(z.practiceDays === 1 && z.lastPracticeDay === T1 && !z.runde, 'Ein Übungstag gezählt');
chk(z.garden.filter(s => z.walkers.includes(s.id)).every(s => s.runs === 1), 'Begleiter haben einen Ausflug');

// Zweite Runde am selben Tag
rundeStarten(z, 0, 300000, T1); erg = fertig(z, T1, zufall(31));
chk(erg.neu.length === 1 && z.practiceDays === 1, 'Zweite Runde am selben Tag: wieder eine Schnecke, Übungstag zählt nur einmal');
chk(z.garden.filter(s => z.walkers.includes(s.id)).every(s => s.runs === 1), 'Begleiter wachsen höchstens einmal am Tag');
const neue = z.garden.find(s => !z.walkers.includes(s.id) && s.special !== 'kaefer'); z.walkers = [neue.id];
rundeStarten(z, 0, 300000, T1); fertig(z, T1, zufall(32));
chk(neue.runs === 1, 'Andere Begleiter in der nächsten Runde wachsen auch');
rundeStarten(z, 0, 300000, T2); fertig(z, T2, zufall(33));
chk(z.practiceDays === 2, 'Nächster Tag: zweiter Übungstag');
chk(parade(z).length === z.walkers.length, 'Parade ohne Runde: nur die Begleiter');

// Mindestleistung: ohne 2 richtige Aufgaben (z. B. nur gemalt) gibt es keine Schnecke, aber auch keine Strafe
for (const richtige of [0, 1]) {
  z = startGarten({}, zufall(50 + richtige), '2026-11-01');
  rundeStarten(z, 0, 300000, T1); for (let i = 0; i < richtige; i++) richtig(z, zufall(60 + i));
  const vorher = z.garden.length; erg = rundeBeenden(z, T1, zufall(70));
  chk(erg.keineSchnecke === true && erg.neu.length === 0 && z.garden.length === vorher && !z.runde, `${richtige} richtige Aufgabe(n): keine Schnecke`);
  chk(z.practiceDays === 0 && z.lastPracticeDay === '' && z.garden[0].runs === 0, `${richtige} richtige Aufgabe(n): kein Übungstag, kein Ausflug`);
}
z = startGarten({}, zufall(55), '2026-11-01'); rundeStarten(z, 0, 300000, T1);
for (let i = 0; i < MIN_RICHTIG; i++) richtig(z, zufall(80 + i));
erg = rundeBeenden(z, T1, zufall(81));
chk(!erg.keineSchnecke && erg.neu.length === 1 && z.practiceDays === 1 && z.garden.length === 2, `${MIN_RICHTIG} richtige Aufgaben: Schnecke, Übungstag und Ausflug`);
chk(MIN_RICHTIG === 2, 'Mindestens 2 richtige Aufgaben');

// Wachsen
chk([0, 1, 2, 4, 5, 9, 10, 50].map(stageOf).join() === '0,0,1,1,2,2,3,3', 'Wachstumsstufen bei 2, 5, 10 Ausflügen');

// Marienkäfer und Deko (nicht am Stück)
z = startGarten({}, zufall(11), '2026-11-01');
const tage = ['2026-12-01', '2026-12-03', '2026-12-04', '2026-12-08', '2026-12-09', '2026-12-15', '2026-12-16', '2026-12-17', '2026-12-20', '2026-12-28'];
const decos = [];
for (const t of tage) { rundeStarten(z, 0, 1, t); const r = fertig(z, t, zufall(t.length + decos.length)); if (r.deko) decos.push(r.deko); }
chk(decos.join() === 'pilz,blume', 'Deko nach 5 und 10 Übungstagen, auch mit Lücken dazwischen (nicht am Stück)');
for (let i = 0; i < 20; i++) { rundeStarten(z, 0, 1, '2027-01-01'); fertig(z, '2027-01-01', zufall(100 + i)); }
chk(z.garden.filter(s => s.special === 'kaefer').length === Math.floor(z.newCount / 10), 'Jede 10. neue Schnecke bringt einen Marienkäfer');

// Hutschachtel: aufsetzen, tauschen, abnehmen
z = startGarten({}, zufall(5), '2026-11-01');
z.hutschachtel = ['krone', 'zylinder', 'krone']; z.hueteGefunden = ['krone', 'zylinder'];
const s1 = z.garden[0];
chk(hutAufsetzen(z, 'krone', s1.id) && s1.hat === 'krone' && z.hutschachtel.filter(h => h === 'krone').length === 1, 'Aufsetzen: Krone aus der Schachtel auf die Schnecke');
chk(hutAufsetzen(z, 'zylinder', s1.id) && s1.hat === 'zylinder' && z.hutschachtel.filter(h => h === 'krone').length === 2, 'Tauschen: alte Kopfbedeckung wandert zurück in die Schachtel');
chk(!hutAufsetzen(z, 'pirat', s1.id), 'Nur was in der Schachtel liegt, kann aufgesetzt werden');
chk(hutAbnehmen(z, s1.id) && s1.hat === null && z.hutschachtel.includes('zylinder'), 'Abnehmen: zurück in die Schachtel');
z.garden.push({ id: 99, name: 'Kiki', color: 'rosa', pattern: 'uni', hat: null, special: 'kaefer', runs: 0, stage: 0 });
chk(!hutAufsetzen(z, 'krone', 99), 'Marienkäfer bekommen keine Kopfbedeckung');

// Pause
z = startGarten({}, zufall(33), '2026-11-01');
rundeStarten(z, 1000, 300000, T1);
chk(pausieren(z, 61000) && restzeit(z, 500000) === 240000, 'Pause hält die Uhr an (Restzeit bleibt stehen)');
chk(fortsetzen(z, 900000, T2) && restzeit(z, 960000) === 180000 && z.runde.tag === T2, 'Fortsetzen: Restzeit läuft weiter, eine Runde vom Vortag zählt für heute');
z.runde.zeitUm = true; chk(!pausieren(z, 1e6), 'Nach Ablauf der Zeit keine Pause mehr');

// Album
chk(album(z).reduce((n, g) => n + g.eintraege.length, 0) === 71 && Object.keys(HATS).length === 14, 'Sammelalbum: 71 Felder (48 Häuser), 14 Kopfbedeckungen');

// Übernahme alter Spielstände (Salatkorb, Rundenzähler, Hüte auf Schnecken)
const alt = bereinigeZustand({
  garden: [{ id: 1, name: 'Alt', color: 'gelb', pattern: 'punkte', hat: 'krone', special: null, runs: 3 }],
  walkers: [1], leaves: 2, cleanLeaves: false, lastRoundDay: '2026-11-05', rundenHeute: 2, neuHeute: 3, neuHeuteTag: '2026-11-05', korb: [true, false], practiceDays: 4, newCount: 5, nextId: 2,
}, zufall(77));
chk(alt.garden.length === 3 && alt.garden[1].hat === null, 'Alter Salatkorb: 2 Schnecken schlüpfen beim Übernehmen');
chk(alt.lastPracticeDay === '2026-11-05' && alt.hueteGefunden.join() === 'krone' && alt.leaves === 2, 'Übungstag, gefundene Kopfbedeckung und Blätter übernommen');
chk(!('korb' in alt) && !('cleanLeaves' in alt) && !('rundenHeute' in alt), 'Alte Felder entfernt');

// Bevorzugung fehlender Häuser
const standardWert = FEHLT_BEVORZUGT; setzeBevorzugt(1);
const voll1 = { garden: [], nextId: 1 }; for (let i = 0; i < 48; i++) voll1.garden.push(neueSchnecke(voll1, zufall(i + 7)));
chk(new Set(voll1.garden.filter(s => !s.special).map(s => s.color + s.pattern)).size === voll1.garden.filter(s => !s.special).length, 'Bei 100 % Bevorzugung keine doppelten Häuser');
setzeBevorzugt(standardWert);
chk(standardWert === 0.2, 'Standard: in 20 % der Fälle ein fehlendes Haus bzw. eine fehlende Kopfbedeckung');

// Begleiter: höchstens 3
z = startGarten({}, zufall(9), '2026-11-01');
for (let i = 0; i < 5; i++) z.garden.push(neueSchnecke(z, zufall(40 + i)));
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
  walkers: [1, 2, 99, 4, 4], leaves: 77, deco: ['pilz', 'atombombe'], nextId: -5, hutschachtel: ['krone', '<b>', 42, 'zauber'],
  runde: { ende: 'bald', begleiter: [1] }, __proto__: { boese: true },
});
chk(boese.garden.length === 2, 'Ungültige Schnecken (Farbe, Kopfbedeckung, doppelte ID, kein Objekt) werden verworfen');
chk(boese.garden[0].name.length <= 20, 'Namen werden auf 20 Zeichen gekürzt');
chk(boese.garden[1].runs === 0 && boese.garden[1].stage === 0, 'Unsinnige Zahlen werden zurückgesetzt, Stufe neu berechnet');
chk(boese.walkers.join() === '1,4' && boese.leaves === 0 && boese.deco.join() === 'pilz', 'Begleiter, Blätter, Deko bereinigt');
chk(boese.hutschachtel.join() === 'krone,zauber', 'Hutschachtel: nur bekannte Kopfbedeckungen');
chk(boese.nextId === 5 && boese.runde === null && !('boese' in Object.getPrototypeOf(boese)), 'nextId, Runde und Prototyp sicher');

// Hausfarben: alle für alle Kinder, auch Rosa und Lila; Mint der alten Fassung wird Grün
chk(Object.keys(COLORS).join() === 'rot,orange,gelb,gruen,blau,kobalt,lila,rosa', 'Acht Hausfarben, auch Rosa und Lila');
const farben = bereinigeZustand({ garden: [['rosa', 'Lotti'], ['mint', 'Paul'], ['lila', 'Ida'], ['gelb', 'Karl'], ['violett', 'Mia'], ['rosa', 'Karl'], ['lila', 'Toni'], ['rosa', 'Nele 33']].map(([c, n], i) => ({ id: i + 1, name: n, color: c, pattern: 'uni', hat: null, special: null, runs: 0 })) });
chk(farben.garden.map(s => s.color).join() === 'rosa,gruen,lila,gelb,rot,kobalt,rosa', 'Alte Gärten: Rosa/Lila bleiben bei Mädchennamen, bei Karl/Toni → Rot/Dunkelblau; Mint → Grün; unbekannte Farben verworfen');
{ const viele = { garden: [], nextId: 1 }; for (let i = 0; i < 400; i++) viele.garden.push(neueSchnecke(viele, zufall(1000 + i)));
  const da = new Set(viele.garden.map(s => s.color)); chk(da.has('rosa') && da.has('lila') && da.has('kobalt') && da.has('rot'), 'Alle Farben kommen zufällig vor');
  chk(viele.garden.every(s => s.special === 'kaefer' || namePasst(s.name, s.color)), 'Rosa und Lila nur mit Mädchennamen (auch mit Nummer)');
  const jungen = viele.garden.filter(s => JUNGEN_NAMEN.includes(s.name.split(' ')[0]) || NEUTRALE_NAMEN.includes(s.name.split(' ')[0]));
  const maedchen = viele.garden.filter(s => MAEDCHEN_NAMEN.includes(s.name.split(' ')[0]));
  chk(jungen.length > 50 && !jungen.some(s => ['rosa', 'lila'].includes(s.color)), 'Jungen- und neutrale Namen nie mit Rosa oder Lila');
  chk(new Set(maedchen.map(s => s.color)).size === 8, 'Mädchennamen bekommen alle 8 Farben'); }

// Name nie doppelt, auch wenn die Liste erschöpft ist
const voll = { garden: [], nextId: 1 };
for (let i = 0; i < 40; i++) voll.garden.push(neueSchnecke(voll, zufall(i + 1)));
chk(new Set(voll.garden.map(s => s.name)).size === 40, 'Auch bei mehr als 30 Schnecken keine doppelten Namen');

console.log(fehler ? `${fehler} FEHLER` : 'ALLES OK');
process.exit(fehler ? 1 : 0);
