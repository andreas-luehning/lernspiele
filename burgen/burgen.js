// Burgen (Probe-Version): Stufen, Burg zeigen, Frage, Antwort tippen, „Zeig mir's“, Statistik je Stufe statt Belohnung.
// Regeln: docs/burgen.md.
import { lesen, schreiben } from '../gemeinsam/speicher.js';
import { platte } from '../leuchttisch/steine.js';
import { STUFEN, neueBurg, anordnen, antworten, frageWaehlen, SPEICHER_STANDARD, zustandPruefen, geloestZaehlen } from './burg-logik.js';
import { burgSvg, zaehlPlakette, zaehlRing, funkelStern, tuch } from './burg.js';

const $ = id => document.getElementById(id);
const tisch = $('tisch');
tisch.append(platte());                         // Milchglas-Körnung wie beim Edelstein-Tisch

let zustand = zustandPruefen(lesen('burgen', SPEICHER_STANDARD));
const speichern = () => schreiben('burgen', zustand);
const stufe = () => STUFEN[zustand.stufe];
const stat = () => zustand.stat[stufe().id];

let verlauf = [];                                // letzte Burgen, damit sich Muster nicht wiederholen
let burg = null, lage = null, frage = null, bild = null, tuchBild = null;
let nr = 0, geloest = false, zeigt = false, fehler = false, hilfe = false;

/** „grüne“ → „grünen“ (nach „die“), „orange“ bleibt fast gleich */
const mitArtikel = wort => wort === 'orange' ? 'orangen' : wort + 'n';

/* ---------- Neue Burg ---------- */
function neu() {
  if (zeigt) return;
  nr++; geloest = false; fehler = false; hilfe = false;
  burg = neueBurg(zustand.stufe, Math.random, verlauf); verlauf.push(burg); if (verlauf.length > 10) verlauf.shift();
  lage = anordnen(burg);
  frage = burg.versteckt ? { art: 'versteckt', antwort: burg.total } : frageWaehlen(burg);
  tisch.classList.remove('jubel');
  zeichnen();
  frageZeigen();
  zeigeHinweis(startText());
  $('optionen').replaceChildren(...antworten(frage.antwort).map(z => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'opt'; b.textContent = String(z); b.dataset.wert = String(z);
    b.addEventListener('click', () => pruefen(z, b));
    return b;
  }));
}
function zeichnen() {
  tisch.querySelector('.burg-svg')?.remove();
  bild = burgSvg(lage);
  tuchBild = null;
  if (burg.versteckt && !geloest) { tuchBild = tuch(lage); bild.append(tuchBild); }
  tisch.append(bild);
}
function frageZeigen() {
  const f = $('frage');
  f.dataset.art = frage.art; f.dataset.farbe = frage.farbe || '';
  const texte = {
    alle: 'Wie viele Bausteine hat die Burg?',
    turm: 'Wie viele Bausteine hat ein Turm?',
    farbe: `Wie viele ${frage.wort} Bausteine?`,
    versteckt: 'Ein Turm ist versteckt. Wie viele Bausteine hat die ganze Burg?',
  };
  f.textContent = texte[frage.art];
  if (frage.art === 'farbe') {                     // Farbfleck, weil die Kinder noch nicht sicher lesen
    const fl = document.createElement('span'); fl.className = 'farbfleck'; fl.style.background = frage.farbe; fl.setAttribute('aria-hidden', 'true');
    f.append(fl);
  }
}
function startText() {
  if (frage.art === 'turm') return 'Schau nur auf einen Turm. Das Dach zählt mit.';
  if (frage.art === 'farbe') return `Zähl nur die ${mitArtikel(frage.wort)} Bausteine.`;
  if (frage.art === 'versteckt') return 'Zähl, was du siehst. Was steht wohl unter dem Tuch?';
  if (stufe().id === 'ungleich') return 'Die Türme sind verschieden. Zähl jeden Teil.';
  return 'Zähl alle Bausteine. Jedes Teil zählt als 1.';
}

/* ---------- Prüfen ---------- */
function pruefen(wert, knopf) {
  if (geloest || zeigt || !burg) return;
  if (wert === frage.antwort) {
    geloest = true; knopf.classList.add('richtig');
    geloestZaehlen(stat(), { fehler, hilfe }); speichern(); statistikZeigen();
    if (frage.art === 'turm') zeigeHinweis(`Stimmt! Ein Turm hat ${wert} Bausteine.`, 'good');
    else if (frage.art === 'farbe') zeigeHinweis(`Stimmt! Es sind ${wert} ${frage.wort} Bausteine.`, 'good');
    else zeigeRechnung(true, `Stimmt! Zusammen ${burg.total}.`, 'good');
    if (tuchBild) { const t = tuchBild; t.classList.add('weg'); setTimeout(() => t.remove(), 750); tuchBild = null; }   // Tuch wegziehen
    tisch.classList.remove('jubel'); void tisch.offsetWidth; tisch.classList.add('jubel');
  } else {
    fehler = true; stat().fehlversuche++; speichern(); statistikZeigen();
    knopf.classList.remove('falsch'); void knopf.offsetWidth; knopf.classList.add('falsch');
    setTimeout(() => knopf.classList.remove('falsch'), 700);
    const tipp = 'Tipp: „Zeig mir\'s“ hilft dir.';
    if (frage.art === 'turm') zeigeHinweis('Schau nur auf einen Turm. Zähl von unten nach oben. ' + tipp, 'bad');
    else if (frage.art === 'farbe') zeigeHinweis(`Zähl nur die ${mitArtikel(frage.wort)} Bausteine. Die roten Dächer zählen nicht. ` + tipp, 'bad');
    else if (frage.art === 'versteckt') zeigeRechnung(false, 'Der versteckte Turm ist genauso wie der andere. ' + tipp, 'bad');
    else zeigeRechnung(false, 'Zerlege die Burg in Teile. ' + tipp, 'bad');
  }
}

/* ---------- „Zeig mir's“: den Weg zeigen, nie das Ergebnis ---------- */
function zeigMirs() {
  if (zeigt || geloest || !burg) return;
  zeigt = true; hilfe = true; knoepfeSperren(true);
  zeichnen();                                         // frisches Bild, alte Zahlen weg
  const meine = nr, SCHRITT = 400, PAUSE = 420;
  let zeit = 250;
  const spaeter = (f, t) => setTimeout(() => { if (meine === nr) f(); }, t);
  if (frage.art === 'turm' || frage.art === 'farbe') {
    // Nur Ringe, keine Zahlen: das Kind zählt selbst mit
    zeigeHinweis('Zeig mit dem Finger auf jeden Baustein und zähl mit.');
    const teile = frage.art === 'turm' ? lage.teile.filter(t => t.bereich === 0) : lage.teile.filter(t => t.farbe === frage.farbe);
    for (const t of teile) { spaeter(() => bild.append(zaehlRing(t)), zeit); zeit += SCHRITT + 150; }
    spaeter(() => { zeigeHinweis('Wie viele waren es? Tipp die Zahl.'); zeigt = false; knoepfeSperren(false); }, zeit + 150);
    return;
  }
  zeigeHinweis('Zähl mit: 1, 2, 3 …');
  const bereiche = frage.art === 'versteckt' ? [0, 1] : [0, 1, 2];
  for (const bereich of bereiche) {
    lage.teile.filter(t => t.bereich === bereich).forEach((t, i) => { spaeter(() => bild.append(zaehlPlakette(t, i + 1)), zeit); zeit += SCHRITT; });
    zeit += PAUSE;                                     // kurze Atempause zwischen den Teilen
  }
  const text = frage.art === 'versteckt' ? 'Unter dem Tuch steht derselbe Turm wie links. Rechne zusammen!'
    : stufe().id === 'ungleich' ? 'Die Türme sind verschieden. Rechne alle drei zusammen!'
    : 'Zwei gleiche Türme und die Mitte. Rechne zusammen!';
  spaeter(() => { zeigeRechnung(false, text, ''); zeigt = false; knoepfeSperren(false); }, zeit + 150);
}
function knoepfeSperren(an) {
  $('b-hilfe').disabled = $('b-neu').disabled = an;
  document.querySelectorAll('#stufen button').forEach(b => { b.disabled = an; });
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
/** Turm + Mitte + Turm = ?  (das Ergebnis erst nach der richtigen Antwort; versteckter Turm als ?) */
function zeigeRechnung(mitErgebnis, text, art) {
  zeigeHinweis(text, art);
  const [a, m, b] = burg.parts, r = document.createElement('div'); r.className = 'rechnung';
  const rechts = burg.versteckt && !mitErgebnis ? chip('?', null, 'frage-chip') : chip(String(b), burg.cT);
  r.append(chip(String(a), burg.cT), zeichen('+'), chip(String(m), burg.cM), zeichen('+'), rechts, zeichen('='),
    mitErgebnis ? chip(String(burg.total), null, 'ergebnis') : chip('?', null, 'frage-chip'));
  $('hinweis').append(r);
}
function statistikZeigen() {
  const s = stat();
  $('s-geloest').textContent = String(s.geloest);
  $('s-gleich').textContent = String(s.gleichRichtig);
  $('s-hilfe').textContent = String(s.mitHilfe);
  $('s-fehler').textContent = String(s.fehlversuche);
  $('statistik').setAttribute('aria-label', `Statistik für die Stufe ${stufe().name}`);
}

/* ---------- Funkeln: ab und zu, sehr subtil, nie bei „Zeig mir's“, nach der richtigen Antwort oder unter dem Tuch ---------- */
const wenigBewegung = window.matchMedia?.('(prefers-reduced-motion: reduce)');
function funkeln() {
  if (bild && !zeigt && !geloest && !document.hidden && !wenigBewegung?.matches) {
    const sichtbar = lage.teile.filter(t => !(tuchBild && t.bereich === 2));
    const t = sichtbar[Math.floor(Math.random() * sichtbar.length)];
    const stern = funkelStern(t);
    if (tuchBild) bild.insertBefore(stern, tuchBild); else bild.append(stern);
    setTimeout(() => stern.remove(), 1400);
  }
  setTimeout(funkeln, 4000 + Math.random() * 4000);
}
setTimeout(funkeln, 3000);

/* ---------- Stufen und Knöpfe ---------- */
function stufenZeigen() {
  document.querySelectorAll('#stufen button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.stufe === zustand.stufe)));
}
document.querySelectorAll('#stufen button').forEach(b => b.addEventListener('click', () => {
  const i = +b.dataset.stufe; if (zeigt || !STUFEN[i] || i === zustand.stufe) return;
  zustand.stufe = i; speichern(); verlauf = [];
  stufenZeigen(); statistikZeigen(); neu();
}));
$('b-neu').addEventListener('click', neu);
$('b-hilfe').addEventListener('click', zeigMirs);
$('b-info').addEventListener('click', () => {
  const g = $('grown'); g.hidden = !g.hidden; $('b-info').setAttribute('aria-expanded', String(!g.hidden));
});

stufenZeigen();
statistikZeigen();
neu();
