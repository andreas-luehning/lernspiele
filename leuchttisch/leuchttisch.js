// Leuchttisch: Steine zeigen, Antwort tippen oder schreiben, „Zeig mir's“, Amulett füllen (fertige kommen in die Schatzkammer).
import { ladeModell } from '../gemeinsam/ziffern.js';
import { Schreibfeld, alleNeuZeichnen } from '../gemeinsam/schreibfeld.js';
import { lesen, schreiben } from '../gemeinsam/speicher.js';
import { Runde, uhrText, PROBE } from '../gemeinsam/runde.js';
import { STANDARD, STUFEN, FASSUNGEN, materialDerStufe, steinGroesse, neueAufgabe, verteilen, antworten, tipp, zustandPruefen, steinEinsetzen, rundeBeendenLT } from './aufgaben.js';
import { svg, stein, defsEinbauen, amulett, STEIN_ART } from './steine.js';

const $ = id => document.getElementById(id);

/* ---------- Gespeicherter Zustand ---------- */
let zustand = zustandPruefen(lesen('leuchttisch', STANDARD));
const speichern = () => schreiben('leuchttisch', zustand);

/* ---------- Tisch ---------- */
const tisch = $('tisch');
let G = 125;                       // Steingröße in Tisch-Einheiten (Tischbreite 1000), je Aufgabe
let aufgabe = null, B = 1000, H = 700, tischSvg = null, rundeNr = 0, geloest = false, zeigt = false;

function tischMasse() {
  const r = tisch.getBoundingClientRect();
  const h = r.width > 0 ? Math.round(1000 * r.height / r.width) : 700;
  return { B: 1000, H: Math.min(1500, Math.max(420, h)) };
}

function tischZeichnen() {
  tischSvg = svg('svg', { viewBox: `0 0 ${B} ${H}`, class: 'tisch-svg', role: 'img', 'aria-label': `Edelsteine auf dem Leuchttisch` });
  for (const s of aufgabe.steine) tischSvg.append(stein(s.sorte, s.x, s.y, G, s.dreh, { licht: true }));
  tisch.querySelector('.tisch-svg')?.remove();   // das Lichtspiel darunter bleibt
  tisch.append(tischSvg);
}

function neueSteine() {
  if (zeigt) return;
  rundeNr++; geloest = false;
  ({ B, H } = tischMasse());
  aufgabe = neueAufgabe(zustand.stufe, { zweiSorten: zustand.zweiSorten, vorher: aufgabe });
  G = steinGroesse(aufgabe);
  verteilen(aufgabe, B, H, G);
  tisch.classList.remove('jubel');
  tischZeichnen();
  $('frage').textContent = aufgabe.modus === 'zaehlen' ? 'Wie viele Steine sind es?' : 'Wie viele sind es zusammen?';
  if (rundenNachricht) { zeigeHinweis(rundenNachricht, 'good'); rundenNachricht = ''; }
  else zeigeHinweis(startText());
  optionenZeigen();
  feld?.freigeben(); feld?.el.classList.remove('ok', 'no');
}

/* ---------- Antworten: Tippen ---------- */
function optionenZeigen() {
  const box = $('optionen');
  box.replaceChildren(...antworten(aufgabe.gesamt).map(z => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'opt'; b.textContent = String(z); b.dataset.wert = String(z);
    b.addEventListener('click', () => { aktiv(); pruefen(z, b); });
    return b;
  }));
}

/* ---------- Antworten: Schreiben ---------- */
let feld = null, modellLaedt = null;
function schreibfeldBereit() {
  if (feld) return;
  feld = new Schreibfeld($('schreiben'), {
    id: 'antwort', kind: 'box',
    onErkannt: f => { if (f.value != null && !f.wartet) pruefen(f.value, null); },
    onStart: () => { $('grown').hidden = true; $('b-info').setAttribute('aria-expanded', 'false'); aktiv(); },
  });
  requestAnimationFrame(() => feld.groesseAnpassen());
}
function eingabeZeigen() {
  const schreibe = zustand.eingabe === 'schreiben';
  $('optionen').hidden = schreibe; $('schreiben').hidden = !schreibe;
  document.querySelectorAll('#eingabe button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.eingabe === zustand.eingabe)));
  if (!schreibe) return;
  schreibfeldBereit();
  requestAnimationFrame(() => feld.groesseAnpassen());
  if (!modellLaedt) {
    zeigeHinweis('Einen Moment, die Zahlenerkennung lädt …');
    modellLaedt = ladeModell()
      .then(() => { if (!geloest) zeigeHinweis('Schreib die Zahl in das Feld.'); })
      .catch(() => { modellLaedt = null; zeigeHinweis('Die Zahlenerkennung konnte nicht geladen werden. Bitte die Seite neu laden.', 'bad'); });
  }
}

/* ---------- Prüfen ---------- */
function pruefen(wert, knopf) {
  if (geloest || zeigt || !aufgabe) return;
  const a = aufgabe;
  a.versucht = true;
  if (wert === a.gesamt) {
    geloest = true;
    knopf?.classList.add('richtig'); feld?.el.classList.add('ok');
    let voll = false;
    if (runde.laeuft) {                         // Steine gibt es nur in einer Runde, danach ist freies Üben
      const e = steinEinsetzen(zustand, a.sorteL); voll = e.voll;
      zustand.runde.steine = (zustand.runde.steine || 0) + 1;
      speichern();
      schatzZeigen(voll ? -1 : e.platz, voll);
    }
    if (a.modus === 'zerlegen') zeigeRechnung(a, true, `Super! ${a.links} + ${a.rechts} = ${a.gesamt}.`, 'good');
    else zeigeHinweis(`Super! Es sind ${a.gesamt} Steine.`, 'good');
    jubeln();
    const nr = rundeNr;
    setTimeout(() => { if (nr !== rundeNr) return; runde.aufgabeFertig(); neueSteine(); }, voll ? 3200 : 2200);
  } else {
    if (knopf) { knopf.classList.remove('falsch'); void knopf.offsetWidth; knopf.classList.add('falsch'); setTimeout(() => knopf.classList.remove('falsch'), 700); }
    let text = tipp(a);
    if (feld && !knopf) {
      if (feld.unsicher) text = `Ich habe ${wert} gelesen. Schreib deutlich, falls du etwas anderes meinst. ` + text;
      feld.el.classList.remove('no'); void feld.el.offsetWidth; feld.el.classList.add('no');
      const nr = rundeNr;
      setTimeout(() => { if (nr === rundeNr && !geloest) { feld.loeschen(); feld.el.classList.remove('no'); } }, 1600);
    }
    if (a.modus === 'zerlegen') zeigeRechnung(a, false, text, 'bad');
    else zeigeHinweis(text, 'bad');
  }
}

/* ---------- Hinweis und Rechnung ---------- */
function zeigeHinweis(text, art = '') {
  const h = $('hinweis'); h.className = 'hinweis' + (art ? ' ' + art : '');
  const p = document.createElement('p'); p.textContent = text;
  h.replaceChildren(p);
}
function chip(text, farbe, klasse = '') {
  const c = document.createElement('span'); c.className = 'chip ' + klasse; c.textContent = text;
  if (farbe) c.style.background = farbe;
  return c;
}
function zeichen(t) { const s = document.createElement('span'); s.className = 'plus'; s.textContent = t; return s; }
/** a + b = ?  (Ergebnis nur bei mitErgebnis, also erst nach der richtigen Antwort) */
function zeigeRechnung(a, mitErgebnis, text, art) {
  zeigeHinweis(text, art);
  const r = document.createElement('div'); r.className = 'rechnung';
  r.append(chip(String(a.links), STEIN_ART[a.sorteL].farbe), zeichen('+'), chip(String(a.rechts), STEIN_ART[a.sorteR].farbe), zeichen('='),
    mitErgebnis ? chip(String(a.gesamt), null, 'ergebnis') : chip('?', null, 'frage-chip'));
  $('hinweis').append(r);
}

/* ---------- „Zeig mir's“ ---------- */
function zeigMirs() {
  if (zeigt || geloest || !aufgabe) return;
  zeigt = true; $('b-hilfe').disabled = $('b-neu').disabled = true; tisch.classList.add('ruhe');
  tischZeichnen();                                   // alte Zahlen weg
  const a = aufgabe, nr = rundeNr, fertig = () => { if (nr !== rundeNr) return; zeigt = false; $('b-hilfe').disabled = $('b-neu').disabled = false; tisch.classList.remove('ruhe'); };
  if (a.modus === 'zaehlen') {
    zeigeHinweis('Zähl mit: 1, 2, 3 …');
    const reihe = [...a.steine].sort((p, q) => p.x - q.x);
    reihe.forEach((s, i) => setTimeout(() => { if (nr === rundeNr) plakette(s.x + G * 0.4, s.y - G * 0.4, i + 1, STEIN_ART[s.sorte].farbe); }, 300 + i * 450));
    setTimeout(() => { if (nr === rundeNr) zeigeHinweis(zustand.eingabe === 'schreiben' ? 'Schreib jetzt die Zahl.' : 'Tipp jetzt die richtige Zahl.'); fertig(); }, 300 + reihe.length * 450 + 200);
  } else {
    setTimeout(() => { if (nr === rundeNr) gruppe(a.steine.filter(s => s.gruppe === 0), a.links, STEIN_ART[a.sorteL].farbe); }, 300);
    setTimeout(() => { if (nr === rundeNr) gruppe(a.steine.filter(s => s.gruppe === 1), a.rechts, STEIN_ART[a.sorteR].farbe); }, 1000);
    setTimeout(() => { if (nr === rundeNr) zeigeRechnung(a, false, 'Zwei Gruppen. Rechne sie zusammen!', ''); fertig(); }, 1600);
  }
}
function plakette(x, y, n, farbe) {
  const g = svg('g', { class: 'plakette' });
  g.append(svg('circle', { cx: x, cy: y, r: 22, stroke: farbe }));
  const t = svg('text', { x, y: y + 8, 'text-anchor': 'middle', fill: farbe }); t.textContent = String(n);
  g.append(t); tischSvg.append(g);
}
function gruppe(steine, n, farbe) {
  if (!steine.length) return;
  const xs = steine.map(s => s.x), ys = steine.map(s => s.y), p = G * 0.75;
  const x0 = Math.max(6, Math.min(...xs) - p), y0 = Math.max(6, Math.min(...ys) - p);
  const x1 = Math.min(B - 6, Math.max(...xs) + p), y1 = Math.min(H - 6, Math.max(...ys) + p);
  const g = svg('g', { class: 'gruppe' });
  g.append(svg('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, rx: 36, stroke: farbe, fill: farbe }));
  g.append(svg('circle', { class: 'g-zahl', cx: x0 + 30, cy: y0 + 30, r: 26, stroke: farbe }));
  const t = svg('text', { x: x0 + 30, y: y0 + 40, 'text-anchor': 'middle', fill: farbe }); t.textContent = String(n);
  g.append(t); tischSvg.append(g);
}

/* ---------- Amulett und Schatzkammer ---------- */
function schatzZeigen(neu = -1, voll = false) {
  const platz = $('amulett');
  if (voll) {
    // Volles Amulett kurz zeigen, dann leeres neues
    const fertigesAmulett = zustand.amulette[zustand.amulette.length - 1];
    const s = amulett(fertigesAmulett.steine, FASSUNGEN, { ...fertigesAmulett, neu: FASSUNGEN - 1 }); s.classList.add('fertig');
    platz.replaceChildren(s, beschriftung('Fertig! Ab in die Schatzkammer.'));
    setTimeout(() => { platz.replaceChildren(amulett(zustand.fassung, FASSUNGEN, zustand.modell), beschriftung(fassungText())); kisteZeigen(true); }, 1800);
  } else {
    platz.replaceChildren(amulett(zustand.fassung, FASSUNGEN, { ...zustand.modell, neu }), beschriftung(fassungText()));
  }
}
function fassungText() {
  const fehlt = FASSUNGEN - zustand.fassung.length;
  return fehlt === 1 ? 'Noch 1 Stein!' : `Noch ${fehlt} Steine`;
}
function beschriftung(t) { const s = document.createElement('span'); s.className = 'a-text'; s.textContent = t; return s; }
function kisteZeigen(pop = false) {
  $('kistezahl').textContent = String(zustand.amulette.length);
  const letztes = zustand.amulette[zustand.amulette.length - 1];
  $('kistebild').replaceChildren(letztes ? amulett(letztes.steine, FASSUNGEN, { ...letztes, klein: true }) : amulett([], FASSUNGEN, { klein: true }));
  if (pop) { const k = $('kiste'); k.classList.remove('pop'); void k.offsetWidth; k.classList.add('pop'); }
}

/* ---------- Runde und Lernzeit ---------- */
// Dieselbe 5-Minuten-Runde und Lernzeit wie beim Zehnerweg (gemeinsam/runde.js), aber mit eigenem Speicher:
// Eine fertige Leuchttisch-Runde bringt keine Schnecke. Steine gibt es nur, solange eine Runde läuft.
const LERNZEIT_UM = 'Deine Lernzeit für heute ist um. Du kannst frei weiter üben.';
let rundenNachricht = '';
function startText() {
  if (!runde.laeuft && !runde.heuteMoeglich) return LERNZEIT_UM;
  return zustand.eingabe === 'schreiben' ? 'Schreib die Zahl in das Feld.' : 'Tipp auf die richtige Zahl.';
}
function aktiv() {
  if (runde.aktivitaet() === 'weiter') zeigeHinweis('Weiter geht’s!');
}
const runde = new Runde({
  speicher: { laden: () => zustand, speichern: () => speichern(), beenden: z => rundeBeendenLT(z) },
  onTick: (rest, dauer, pause) => {
    $('uhrzeit').textContent = uhrText(rest);
    $('sand').style.width = (rest / dauer * 100) + '%';
    $('uhr').classList.toggle('um', rest <= 0);
    $('uhr').classList.toggle('pause', !!pause);
  },
  onPause: () => zeigeHinweis('Pause. Tipp weiter, dann läuft die Uhr wieder.'),
  onZeitUm: () => {
    // Nur eine angefangene Aufgabe darf fertig werden
    if (aufgabe && aufgabe.versucht && !geloest) zeigeHinweis('Die Zeit ist um! Mach diese Aufgabe noch fertig.');
    else runde.beenden();
  },
  onEnde: erg => {
    const n = erg.steine;
    rundenNachricht = `Geschafft! 5 Minuten geübt. ${n === 1 ? 'Ein Stein' : n + ' Steine'} für dein Amulett.` + (erg.lernzeitUm ? ' ' + LERNZEIT_UM : '');
    if (!geloest) { zeigeHinweis(rundenNachricht, 'good'); rundenNachricht = ''; }
  },
});

/* ---------- Licht ---------- */
const wenigBewegung = window.matchMedia?.('(prefers-reduced-motion: reduce)');
/** Richtige Antwort: Der Tisch leuchtet einmal auf, alle Steine funkeln nacheinander. */
function jubeln() {
  tisch.classList.remove('jubel'); void tisch.offsetWidth; tisch.classList.add('jubel');
  tischSvg?.querySelectorAll('.stein').forEach((st, i) => {
    for (const f of st.querySelectorAll('.funkeln')) f.style.animationDelay = (i * 70) + 'ms';
  });
}
/** Bewegtes Licht (Einstellung für Erwachsene): weiche Lichtflecken unter dem Tisch, ab und zu funkelt ein Stein. */
function lichtZeigen() {
  tisch.classList.toggle('bewegt', zustand.licht === 'bewegt');
  document.querySelectorAll('#licht button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.licht === zustand.licht)));
}
setInterval(() => {
  if (zustand.licht !== 'bewegt' || zeigt || geloest || document.hidden || wenigBewegung?.matches || !tischSvg) return;
  const steine = tischSvg.querySelectorAll('.stein');
  if (!steine.length) return;
  const st = steine[Math.floor(Math.random() * steine.length)];
  st.classList.remove('blinkt'); void st.getBoundingClientRect(); st.classList.add('blinkt');
  setTimeout(() => st.classList.remove('blinkt'), 1000);
}, 2600);

/* ---------- Knöpfe und Einstellungen ---------- */
function stufenZeigen() { document.querySelectorAll('#stufen button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.stufe === zustand.stufe))); }
document.querySelectorAll('#stufen button').forEach(b => b.addEventListener('click', () => {
  const i = +b.dataset.stufe; if (zeigt || !STUFEN[i]) return;
  zustand.stufe = i; zustand.modell.material = materialDerStufe(i); speichern(); stufenZeigen(); schatzZeigen(); neueSteine();
}));
document.querySelectorAll('#eingabe button').forEach(b => b.addEventListener('click', () => {
  zustand.eingabe = b.dataset.eingabe === 'schreiben' ? 'schreiben' : 'tippen'; speichern(); eingabeZeigen();
}));
function sortenZeigen() { document.querySelectorAll('#sorten button').forEach(b => b.setAttribute('aria-pressed', String((b.dataset.zwei === 'ja') === zustand.zweiSorten))); }
document.querySelectorAll('#sorten button').forEach(b => b.addEventListener('click', () => {
  zustand.zweiSorten = b.dataset.zwei === 'ja'; speichern(); sortenZeigen(); if (aufgabe?.modus === 'zerlegen') neueSteine();
}));
document.querySelectorAll('#licht button').forEach(b => b.addEventListener('click', () => {
  zustand.licht = b.dataset.licht === 'bewegt' ? 'bewegt' : 'ruhig'; speichern(); lichtZeigen();
}));
$('b-hilfe').addEventListener('click', () => { aktiv(); zeigMirs(); });
$('kiste').href = '../schatzkammer/' + (PROBE ? '?probe' : ''); // Probe-Modus bleibt erhalten
$('b-neu').addEventListener('click', () => { if (zustand.runde?.zeitUm) runde.beenden(); neueSteine(); });
$('b-info').addEventListener('click', () => { const g = $('grown'); g.hidden = !g.hidden; $('b-info').setAttribute('aria-expanded', String(!g.hidden)); });

// Nach dem Drehen: dieselbe Aufgabe neu verteilen, wenn sich die Form des Tisches deutlich ändert
let rt = 0;
new ResizeObserver(() => {
  clearTimeout(rt);
  rt = setTimeout(() => {
    feld?.groesseAnpassen();
    if (!aufgabe || zeigt) return;
    const m = tischMasse();
    if (Math.abs(m.H - H) / H > 0.15) { ({ B, H } = m); verteilen(aufgabe, B, H, G); tischZeichnen(); }
  }, 150);
}).observe(tisch);
new MutationObserver(alleNeuZeichnen).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- Start ---------- */
defsEinbauen();
stufenZeigen(); sortenZeigen(); lichtZeigen(); schatzZeigen(); kisteZeigen();
runde.tick();
requestAnimationFrame(() => { neueSteine(); eingabeZeigen(); });
