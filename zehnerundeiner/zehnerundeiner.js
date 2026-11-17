// Zehner und Einer: Aufgabe zeigen, drei (oder zwei) Schreibfelder, Prüfen, Tipps, Schneckenparade.
// Regeln: docs/zehnerundeiner.md. Aufbau wie zehnerweg.js, nur mit eigenem Blatt statt Straße.
import { ladeModell } from '../gemeinsam/ziffern.js';
import { Schreibfeld, alleNeuZeichnen } from '../gemeinsam/schreibfeld.js';
import { lesen, schreiben } from '../gemeinsam/speicher.js';
import { MODI, neueAufgabe, tipp, zeichen, felderFuer, bewerten, ergebnis, bild } from './aufgaben.js';
import { Runde, PROBE, uhrText } from '../gemeinsam/runde.js';
import { ParadeStreifen, zeigeBlaetter, rueckblick } from '../gemeinsam/parade.js';
import { richtig, falsch, parade, HATS, BLAETTER_PRO_HUT, MIN_RICHTIG } from '../gemeinsam/parade-logik.js';

/* ---------- Gespeicherter Zustand ---------- */
const STANDARD = { modus: 'zehner', bild: true };
const zustand = lesen('zehnerundeiner', STANDARD);
if (!MODI.includes(zustand.modus)) zustand.modus = 'zehner';
const speichern = () => schreiben('zehnerundeiner', zustand);

const $ = id => document.getElementById(id);
const blatt = $('blatt'), felderEl = $('felder'), app = document.querySelector('.app');
const NAMEN = { z: 'Zehner', e: 'Einer', erg: 'Ergebnis' };

/* ---------- Felder ---------- */
const FIELDS = {}, SLOTS = {};
let task = null, pruefeLaeuft = false;
for (const id of ['z', 'e', 'erg']) {
  const slot = document.createElement('div'); slot.className = 'platz ' + id;
  const name = document.createElement('div'); name.className = 'name'; name.textContent = NAMEN[id];
  const box = document.createElement('div'); box.className = 'box';
  slot.append(name, box); felderEl.append(slot); SLOTS[id] = slot;
  FIELDS[id] = new Schreibfeld(box, {
    id, kind: 'box',
    onErkannt: nachErkennung,
    onStart: () => { grown.hidden = true; infoBtn.setAttribute('aria-expanded', 'false'); },
    onGeloescht: () => { blatt.classList.remove('done'); zeigeAufgabe(null); updateTarget(); knoepfe('rechnen'); },
  });
}
const aktiv = () => felderFuer(task);

function nachErkennung(f) {
  updateTarget();
  // Die Runde beginnt erst mit einer erkannten Zahl: Gekritzel startet nichts
  if (f.value != null && !f.kritzel) paradeStarten();
  if (f.kritzel) { setHint('Hier ist Platz für eine Zahl. Tippe auf ×, dann kannst du neu schreiben.', 'bad'); return; }
  if (pruefeLaeuft || !aktiv().every(id => FIELDS[id].value != null && !FIELDS[id].wartet)) return;
  if (aktiv().some(id => FIELDS[id].unsicher)) { setHint('Bei einem Feld bin ich nicht sicher, was da steht. Schreib deutlicher oder tippe auf Prüfen.', ''); knoepfe('pruefen'); }
  else check();
}

/* ---------- Aufgabe zeigen ---------- */
const span = (klasse, text) => { const s = document.createElement('span'); s.className = klasse; s.textContent = text; return s; };
/** Zahl mit gefärbten Ziffern: Zehner blau, Einer orange. */
function zahl(n) {
  const w = document.createElement('span');
  if (n >= 10) w.append(span('dz', String(Math.floor(n / 10))));
  w.append(span('de', String(n % 10)));
  return w;
}
/** Die Gleichung; luecke: null = Fragezeichen, Zahl = gelöst (nur ergänzen: das Gesuchte, sonst das Ergebnis). */
function zeigeAufgabe(loesung) {
  const q = span('leer' + (loesung == null ? '' : ' voll'), loesung == null ? '?' : '');
  if (loesung != null) q.replaceChildren(zahl(loesung));
  const z = zeichen(task.op), eq = $('aufgabe');
  if (task.art === 'ergaenzen') eq.replaceChildren(zahl(task.a), span('op', z), q, span('op', '='), zahl(task.c));
  else eq.replaceChildren(zahl(task.a), span('op', z), zahl(task.b), span('op', '='), q);
}
function zeigeBild() {
  const bd = bild(task), svg = $('bild');
  svg.setAttribute('viewBox', `0 0 ${bd.b} ${bd.h}`);
  svg.innerHTML = bd.svg;   // nur selbst berechnete Formen und Zahlen (aufgaben.js), nie Eingaben
  svg.style.aspectRatio = `${bd.b} / ${bd.h}`;
}
function bildSichtbar() { blatt.classList.toggle('mit-bild', zustand.bild || !!task?.hilfe); }

const START_TIPP = 'Schreib mit dem Finger oder Stift in die leeren Felder.';
function newTask() {
  task = neueAufgabe(zustand.modus, task);
  for (const id of ['z', 'e', 'erg']) { FIELDS[id].freigeben(); SLOTS[id].hidden = !aktiv().includes(id); }
  zeigeAufgabe(null); zeigeBild(); bildSichtbar();
  blatt.classList.remove('done');
  setHint(START_TIPP);
  knoepfe('rechnen'); updateTarget();
  requestAnimationFrame(() => { for (const id in FIELDS) FIELDS[id].groesseAnpassen(); });
  runde?.aufgabeFertig(); // war die Zeit schon um, endet die Runde jetzt
}
function updateTarget() {
  let marked = false;
  for (const id of ['z', 'e', 'erg']) {
    const f = FIELDS[id], t = aktiv().includes(id) && !marked && f.value == null;
    f.el.classList.toggle('target', t); if (t) marked = true;
  }
}
/** Hervorgehobener Knopf: rechnen → keiner, pruefen → „Prüfen“, weiter → „Neue Aufgabe“. */
function knoepfe(art) {
  $('b-check').classList.toggle('primary', art === 'pruefen');
  $('b-check').classList.toggle('leise', art === 'weiter');
  $('b-next').classList.toggle('primary', art === 'weiter');
  $('b-next').classList.toggle('puls', art === 'weiter');
}
function setHint(t, cls) { const h = $('hint'); h.textContent = t; h.className = 'hint' + (cls ? ' ' + cls : ''); }

function check() {
  if (!task) return;
  pruefeLaeuft = true;
  try { for (const id of aktiv()) { const f = FIELDS[id]; if (f.timer && f.strokes.length) f.erkennen(); } }
  finally { pruefeLaeuft = false; }
  const werte = Object.fromEntries(aktiv().map(id => [id, FIELDS[id].value]));
  const b = bewerten(task, werte);
  for (const id of aktiv()) {
    const el = FIELDS[id].el; el.classList.remove('ok', 'no'); void el.offsetWidth;
    if (b.richtig.includes(id)) el.classList.add('ok');
    if (b.falsch.includes(id)) el.classList.add('no');
  }
  if (b.falsch.length) {
    paradeFalsch();
    task.hilfe = true; bildSichtbar();   // nach einem Fehler hilft das Bild, auch wenn es sonst aus ist
    const f = FIELDS[b.falsch[0]];
    if (f.hinweis === 'siebenOhneQuerstrich' && String(task.ans[f.id]).includes('7')) setHint('Ich habe eine 1 gelesen. Eine 7 bekommt einen Querstrich in der Mitte.', 'bad');
    else setHint((f.unsicher ? `Ich habe ${f.value} gelesen. Schreib es deutlicher, falls du etwas anderes meinst. ` : '') + tipp(task, f.id), 'bad');
  } else if (b.leer.length) {
    setHint(`Bis hier stimmt alles! ${tipp(task, b.leer[0])}`, '');
  } else {
    zeigeAufgabe(task.art === 'ergaenzen' ? task.b : ergebnis(task));
    const z = zeichen(task.op);
    setHint(task.art === 'ergaenzen' ? `Super! ${task.a} ${z} ${task.b} = ${task.c}` : `Super! ${task.a} ${z} ${task.b} = ${task.ans.erg}`, 'good');
    if (!blatt.classList.contains('done')) {
      blatt.classList.add('done');
      knoepfe('weiter');
      paradeRichtig();
    }
  }
}

/* ---------- Schneckenparade (wie im Zehnerweg) ---------- */
const streifen = new ParadeStreifen($('track'));
const blaetter = $('leaves');
let runde = null;
const LERNZEIT_UM = 'Deine Lernzeit für heute ist um. Schau doch mal in deinen Garten! Du kannst auch frei weiter üben.';
const sagStart = () => streifen.sag(runde.pausiert ? 'Pause. Schreib weiter, dann läuft die Uhr wieder.' : runde.laeuft ? 'Weiter geht’s!' : runde.heuteMoeglich ? 'Schreib eine Zahl, dann startet die Parade!' : LERNZEIT_UM);
function zeigeParade(animiert) { streifen.zeige(parade(runde.z), animiert); zeigeBlaetter(blaetter, runde.z); }
function paradeStarten() {
  const was = runde.aktivitaet();
  if (was === 'neu') { zeigeParade(true); streifen.sag(`Los geht’s! Halte 5 Minuten durch und löse ${MIN_RICHTIG} Aufgaben richtig, dann kommt eine neue Schnecke.`); }
  else if (was === 'weiter') streifen.sag('Weiter geht’s!');
}
function paradeRichtig() {
  if (!runde.laeuft || task.belohnt) { if (!runde.laeuft) streifen.sag('Super gerechnet!'); return; } // freies Üben: Lob, keine Belohnung
  task.belohnt = true;
  const erg = richtig(runde.z); runde.speichern();
  const slots = blaetter.querySelectorAll('.slot');
  streifen.blattFliegt(FIELDS.erg.el, slots[erg.hut ? slots.length - 1 : Math.max(0, runde.z.leaves - 1)]);
  setTimeout(() => {
    zeigeParade(true);
    if (erg.hut) streifen.sag(`Fünf Blätter! Neu in deiner Hutschachtel im Garten: ${HATS[erg.hut]}.`);
    else { const noch = BLAETTER_PRO_HUT - runde.z.leaves; streifen.sag(['Mmh, Salat!', 'Ein Salatblatt!', 'Lecker, noch ein Blatt!'][runde.z.leaves % 3] + ` Noch ${noch}, dann gibt es eine Kopfbedeckung.`); }
  }, 800);
  setTimeout(() => runde.aufgabeFertig(), 2200);
}
function paradeFalsch() {
  if (!runde.laeuft || task.fehlerGezaehlt || task.belohnt) return;
  task.fehlerGezaehlt = true; // zählt nur einmal pro Aufgabe
  falsch(runde.z);
  streifen.sag('Macht nichts. Schau dir den Tipp an.');
}
const gartenUrl = '../garten/' + (PROBE ? '?probe' : '');
$('b-garten').href = gartenUrl;
// Die Schnecke gibt es nur mit genug richtigen Aufgaben; bis dahin läuft die Runde nach Ablauf der Zeit weiter (höchstens 3 Minuten)
const nochNoetig = () => Math.max(0, MIN_RICHTIG - ((runde.z.runde && runde.z.runde.geloest) || 0));
runde = new Runde({
  darfEnden: () => nochNoetig() === 0,
  onTick: (rest, dauer, pause) => {
    $('uhrzeit').textContent = uhrText(rest);
    $('sand').style.width = (rest / dauer * 100) + '%';
    $('uhr').classList.toggle('um', rest <= 0);
    $('uhr').classList.toggle('pause', !!pause);
  },
  onPause: () => streifen.sag('Pause. Schreib weiter, dann läuft die Uhr wieder.'),
  onZeitUm: () => {
    const noch = nochNoetig();
    if (noch > 0) { streifen.sag(`Die Zeit ist um! Löse noch ${noch === 1 ? 'eine Aufgabe' : noch + ' Aufgaben'} richtig, dann kommt deine Schnecke.`); return; }
    const angefangen = aktiv().some(id => FIELDS[id].strokes.length) && !blatt.classList.contains('done');
    if (angefangen) streifen.sag('Die Zeit ist um! Mach diese Aufgabe noch fertig.');
    else runde.beenden();
  },
  onEnde: ergebnisRunde => {
    streifen.ausziehen();
    setTimeout(() => { rueckblick(ergebnisRunde, { gartenUrl }); zeigeParade(false); sagStart(); }, 2600);
  },
});

/* ---------- Knöpfe ---------- */
const grown = $('grown'), infoBtn = $('b-info'), bildBtn = $('b-bild');
const modusKnoepfe = document.querySelectorAll('.seg button');
function zeigeModus() { modusKnoepfe.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.mode === zustand.modus))); }
modusKnoepfe.forEach(b => b.addEventListener('click', () => {
  if (!MODI.includes(b.dataset.mode)) return;
  zustand.modus = b.dataset.mode; speichern(); zeigeModus(); newTask();
}));
function bildKnopf() { bildBtn.setAttribute('aria-pressed', String(zustand.bild)); bildBtn.textContent = 'Bild: ' + (zustand.bild ? 'an' : 'aus'); }
bildBtn.addEventListener('click', () => { zustand.bild = !zustand.bild; speichern(); bildKnopf(); bildSichtbar(); requestAnimationFrame(() => { for (const id in FIELDS) FIELDS[id].groesseAnpassen(); }); });
$('b-check').addEventListener('click', check);
$('b-next').addEventListener('click', newTask);
$('b-clear').addEventListener('click', () => {
  for (const id of aktiv()) FIELDS[id].loeschen();
  blatt.classList.remove('done'); zeigeAufgabe(null); setHint(START_TIPP); updateTarget(); knoepfe('rechnen');
});
infoBtn.addEventListener('click', () => { grown.hidden = !grown.hidden; infoBtn.setAttribute('aria-expanded', String(!grown.hidden)); });
// Felder neu messen, wenn sich der Platz ändert (Drehen, Fenstergröße, Schriften fertig)
let rt = 0; const spaeter = () => { clearTimeout(rt); rt = setTimeout(() => { for (const id in FIELDS) FIELDS[id].groesseAnpassen(); }, 120); };
window.addEventListener('resize', spaeter);
new ResizeObserver(spaeter).observe(felderEl);
document.fonts?.ready.then(spaeter);
new MutationObserver(alleNeuZeichnen).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- Start ---------- */
bildKnopf(); zeigeModus();
newTask();
zeigeParade(false); sagStart(); runde.tick();
setHint('Einen Moment, die Zahlenerkennung lädt …');
ladeModell()
  .then(() => setHint(START_TIPP))
  .catch(() => setHint('Die Zahlenerkennung konnte nicht geladen werden. Bitte die Seite neu laden.', 'bad'));
