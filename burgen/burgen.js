// Burgen (Probe-Version): Burg zeigen, Antwort tippen, „Zeig mir's“, Statistik statt Belohnung. Regeln: docs/burgen.md.
import { lesen, schreiben } from '../gemeinsam/speicher.js';
import { platte } from '../leuchttisch/steine.js';
import { neueBurg, anordnen, antworten, STANDARD, statistikPruefen, geloestZaehlen } from './burg-logik.js';
import { burgSvg, zaehlPlakette, funkelStern } from './burg.js';

const $ = id => document.getElementById(id);
const tisch = $('tisch');
tisch.append(platte());                         // Milchglas-Körnung wie beim Edelstein-Tisch

let stat = statistikPruefen(lesen('burgen', STANDARD));
const speichern = () => schreiben('burgen', stat);

const verlauf = [];                              // letzte Burgen, damit sich Muster nicht wiederholen
let burg = null, lage = null, bild = null, nr = 0, geloest = false, zeigt = false, fehler = false, hilfe = false;

/* ---------- Neue Burg ---------- */
function neu() {
  if (zeigt) return;
  nr++; geloest = false; fehler = false; hilfe = false;
  burg = neueBurg(Math.random, verlauf); verlauf.push(burg); if (verlauf.length > 10) verlauf.shift();
  lage = anordnen(burg);
  tisch.classList.remove('jubel');
  zeichnen();
  zeigeHinweis('Zähl alle Bausteine. Jedes Teil zählt als 1.');
  const box = $('optionen');
  box.replaceChildren(...antworten(burg.total).map(z => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'opt'; b.textContent = String(z); b.dataset.wert = String(z);
    b.addEventListener('click', () => pruefen(z, b));
    return b;
  }));
}
function zeichnen() {
  tisch.querySelector('.burg-svg')?.remove();
  bild = burgSvg(lage);
  tisch.append(bild);
}

/* ---------- Prüfen ---------- */
function pruefen(wert, knopf) {
  if (geloest || zeigt || !burg) return;
  if (wert === burg.total) {
    geloest = true; knopf.classList.add('richtig');
    geloestZaehlen(stat, { fehler, hilfe }); speichern(); statistikZeigen();
    zeigeRechnung(true, `Stimmt! Zusammen ${burg.total}.`, 'good');
    tisch.classList.remove('jubel'); void tisch.offsetWidth; tisch.classList.add('jubel');
  } else {
    fehler = true; stat.fehlversuche++; speichern(); statistikZeigen();
    knopf.classList.remove('falsch'); void knopf.offsetWidth; knopf.classList.add('falsch');
    setTimeout(() => knopf.classList.remove('falsch'), 700);
    zeigeRechnung(false, 'Zerlege die Burg in Teile. Tipp: „Zeig mir\'s“ zählt die Teile für dich durch.', 'bad');
  }
}

/* ---------- „Zeig mir's“: Teil für Teil durchzählen, dann die Rechnung mit ? ---------- */
function zeigMirs() {
  if (zeigt || geloest || !burg) return;
  zeigt = true; hilfe = true; $('b-hilfe').disabled = $('b-neu').disabled = true;
  zeichnen();                                         // frisches Bild, alte Zahlen weg
  zeigeHinweis('Zähl mit: 1, 2, 3 …');
  const meine = nr, SCHRITT = 400, PAUSE = 420;
  let zeit = 250;
  for (const bereich of [0, 1, 2]) {
    lage.teile.filter(t => t.bereich === bereich).forEach((t, i) => {
      setTimeout(() => { if (meine === nr) bild.append(zaehlPlakette(t, i + 1)); }, zeit);
      zeit += SCHRITT;
    });
    zeit += PAUSE;                                     // kurze Atempause zwischen den Teilen
  }
  setTimeout(() => {
    if (meine !== nr) return;
    zeigeRechnung(false, 'Zwei gleiche Türme und die Mitte. Rechne zusammen!', '');
    zeigt = false; $('b-hilfe').disabled = $('b-neu').disabled = false;
  }, zeit + 150);
}

/* ---------- Hinweis, Rechnung, Statistik ---------- */
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
/** Turm + Mitte + Turm = ?  (das Ergebnis erst nach der richtigen Antwort) */
function zeigeRechnung(mitErgebnis, text, art) {
  zeigeHinweis(text, art);
  const [a, m, b] = burg.parts, r = document.createElement('div'); r.className = 'rechnung';
  r.append(chip(String(a), burg.cT), zeichen('+'), chip(String(m), burg.cM), zeichen('+'), chip(String(b), burg.cT), zeichen('='),
    mitErgebnis ? chip(String(burg.total), null, 'ergebnis') : chip('?', null, 'frage-chip'));
  $('hinweis').append(r);
}
function statistikZeigen() {
  $('s-geloest').textContent = String(stat.geloest);
  $('s-gleich').textContent = String(stat.gleichRichtig);
  $('s-hilfe').textContent = String(stat.mitHilfe);
  $('s-fehler').textContent = String(stat.fehlversuche);
}

/* ---------- Funkeln: ab und zu, sehr subtil, nie bei „Zeig mir's“ oder nach der richtigen Antwort ---------- */
const wenigBewegung = window.matchMedia?.('(prefers-reduced-motion: reduce)');
function funkeln() {
  if (bild && !zeigt && !geloest && !document.hidden && !wenigBewegung?.matches) {
    const t = lage.teile[Math.floor(Math.random() * lage.teile.length)];
    const stern = funkelStern(t); bild.append(stern);
    setTimeout(() => stern.remove(), 1400);
  }
  setTimeout(funkeln, 4000 + Math.random() * 4000);
}
setTimeout(funkeln, 3000);

/* ---------- Knöpfe ---------- */
$('b-neu').addEventListener('click', neu);
$('b-hilfe').addEventListener('click', zeigMirs);
$('b-info').addEventListener('click', () => {
  const g = $('grown'); g.hidden = !g.hidden; $('b-info').setAttribute('aria-expanded', String(!g.hidden));
});

statistikZeigen();
neu();
