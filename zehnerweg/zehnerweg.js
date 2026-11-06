// Zehnerweg: Bühne zeichnen, Layout (hoch/quer/Seitenleiste), Felder, Prüfen, Tipps, Sterne.
import { ladeModell } from '../gemeinsam/ziffern.js';
import { Schreibfeld, alleNeuZeichnen } from '../gemeinsam/schreibfeld.js';
import { lesen, schreiben, vorhanden, altLesen } from '../gemeinsam/speicher.js';
import { ORDER, neueAufgabe, tipp, zeichen, herzFeld, bewerten } from './aufgaben.js';
import { Runde, PROBE, uhrText } from '../gemeinsam/runde.js';
import { ParadeStreifen, zeigeBlaetter, rueckblick } from '../gemeinsam/parade.js';
import { richtig, falsch, parade, describe } from '../gemeinsam/parade-logik.js';

/* ---------- Gespeicherter Zustand ---------- */
const STANDARD = { gespiegelt: false, modus: 'plus' };
const MODI = ['plus', 'minus', 'mix'];
let zustand;
if (vorhanden('zehnerweg')) {
  zustand = lesen('zehnerweg', STANDARD);
} else {
  // Einmalige Übernahme aus dem Prototyp (alte Schlüssel bleiben, damit der Prototyp weiter geht)
  zustand = { ...STANDARD, gespiegelt: altLesen('zehnerweg-flip') === '1' };
}
if (!MODI.includes(zustand.modus)) zustand.modus = 'plus';
const speichern = () => schreiben('zehnerweg', zustand);

/* ---------- Geometrie (waagerecht; Hochformat dreht wie auf dem Blatt) ---------- */
const GH = { W: 1000, H: 600 };
const SHAPES = {
  start: { cx: 120, cy: 480, w: 200, h: 180, kind: 'box' },
  big:   { cx: 500, cy: 480, w: 250, h: 190, kind: 'oval' },
  part1: { cx: 300, cy: 255, w: 220, h: 170, kind: 'oval' },
  ten:   { cx: 500, cy: 95,  w: 210, h: 160, kind: 'box' },
  part2: { cx: 700, cy: 255, w: 220, h: 170, kind: 'oval' },
  goal:  { cx: 880, cy: 480, w: 200, h: 180, kind: 'box' },
};
const ARROWS = [
  { pts: [[150, 386], [150, 268], [186, 258]], head: true },
  { pts: [[345, 174], [362, 97], [392, 95]], head: false },
  { pts: [[608, 95], [645, 97], [664, 170]], head: true },
  { pts: [[814, 262], [868, 272], [872, 386]], head: false },
];
let vertical = false;
const T = (x, y0) => { const y = zustand.gespiegelt ? GH.H - y0 : y0; return vertical ? [GH.H - y, GH.W - x] : [x, y]; };
const dims = () => (vertical ? { W: GH.H, H: GH.W } : GH);

const $ = id => document.getElementById(id);
const stage = $('stage'), app = document.querySelector('.app');

// Die SVG-Texte bestehen nur aus eigenen Zahlen und festen Formen, nie aus Eingaben oder gespeicherten Daten.
function drawBg() {
  const svg = $('bg'); const { W, H } = dims();
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let s = '';
  const [ax, ay] = T(120, 450), [bx, by] = T(880, 510);
  s += `<rect class="road" x="${Math.min(ax, bx)}" y="${Math.min(ay, by)}" width="${Math.abs(bx - ax)}" height="${Math.abs(by - ay)}"/>`;
  for (let x = 236; x <= 740; x += 56) {
    if (x > 340 && x < 630) continue;
    const [p, q] = T(x, 474), [p2, q2] = T(x + 28, 486);
    s += `<rect class="dash" x="${Math.min(p, p2)}" y="${Math.min(q, q2)}" width="${Math.abs(p2 - p)}" height="${Math.abs(q2 - q)}"/>`;
  }
  // Dünne Linien: der große Kreis zerfällt in die zwei kleinen
  for (const [x1, y1, x2, y2] of [[420, 408, 350, 335], [580, 408, 650, 335]]) {
    const [a, b] = T(x1, y1), [c, d] = T(x2, y2); s += `<line class="conn" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  }
  let route = '';
  for (const ar of ARROWS) {
    const P = ar.pts.map(p => T(p[0], p[1]));
    const d = `M${P[0]} Q${P[1]} ${P[2]}`; s += `<path class="arr" d="${d}"/>`;
    route += (route ? ' ' : '') + d;
    if (ar.head) {
      const [ex, ey] = P[2], [cx, cy] = P[1]; const ang = Math.atan2(ey - cy, ex - cx), L = 30, sp = 0.55;
      const l = [ex - L * Math.cos(ang - sp), ey - L * Math.sin(ang - sp)], r = [ex - L * Math.cos(ang + sp), ey - L * Math.sin(ang + sp)];
      s += `<path class="arr head" d="M${l} L${ex},${ey} L${r}"/>`;
    }
  }
  s += `<path class="route" id="route" d="${route}"/>`;
  // Plus: Herz beim ersten kleinen Kreis. Minus: Hand beim Start, Herz beim zweiten kleinen Kreis.
  const [hx, hy] = T(58, 345), [gx, gy] = T(150, 195), [g2x, g2y] = T(850, 195);
  s += `<g class="for-minus" transform="translate(${hx - 26} ${hy - 30})"><path class="icon-line" d="M14 56 C8 46 6 38 6 30 L6 14 Q6 10 10 10 Q14 10 14 14 L14 28 L14 6 Q14 2 18 2 Q22 2 22 6 L22 27 L22 4 Q22 0 26 0 Q30 0 30 4 L30 27 L30 8 Q30 4 34 4 Q38 4 38 8 L38 34 L43 26 Q46 22 49 25 Q51 27 49 31 L40 48 Q36 56 28 58 Z"/></g>`;
  const HP = 'M22 38 C6 27 0 19 0 11 C0 4 5 0 11 0 C16 0 20 3 22 7 C24 3 28 0 33 0 C39 0 44 4 44 11 C44 19 38 27 22 38 Z';
  s += `<g class="for-plus" transform="translate(${gx - 22} ${gy - 20})"><path class="heart" d="${HP}"/></g>`;
  s += `<g class="for-minus" transform="translate(${g2x - 22} ${g2y - 20})"><path class="heart" d="${HP}"/></g>`;
  svg.innerHTML = s;
  const r = $('route');
  try { const len = r.getTotalLength(); r.style.strokeDasharray = len; r.style.setProperty('--len', len); r.style.strokeDashoffset = len; } catch (e) {}
}

/* ---------- Felder ---------- */
const FIELDS = {};
let task = null;

function nachErkennung(f) {
  updateTarget();
  if (task && f.id === herzFeld(task) && f.value === task.ans[f.id]) {
    stage.classList.remove('love'); void stage.offsetWidth; stage.classList.add('love');
  }
  if (f.kritzel) { setHint('Hier ist Platz für eine Zahl. Tippe auf ×, dann kannst du neu schreiben.', 'bad'); return; }
  // Automatisch prüfen, sobald alle Felder sicher erkannt sind und keins mehr in Arbeit ist
  if (pruefeLaeuft || !ORDER.every(id => FIELDS[id].value != null && !FIELDS[id].wartet)) return;
  if (ORDER.some(id => FIELDS[id].unsicher)) setHint('Bei einem Feld bin ich nicht sicher, was da steht. Schreib deutlicher oder tippe auf Prüfen.', '');
  else check();
}
let pruefeLaeuft = false;
for (const id of Object.keys(SHAPES)) {
  FIELDS[id] = new Schreibfeld(stage, {
    id, kind: SHAPES[id].kind,
    onErkannt: nachErkennung,
    onStart: () => { grown.hidden = true; infoBtn.setAttribute('aria-expanded', 'false'); paradeStarten(); },
    onGeloescht: () => { stage.classList.remove('done'); updateTarget(); },
  });
}

function layout() {
  const wrap = $('wrap');
  // Seitenleiste nur, wenn der Weg dadurch größer wird (breite Bildschirme im Querformat)
  const iw = window.innerWidth - 32, ih = window.innerHeight - 16;
  // Kopfzeile + Tipp/Knöpfe ≈ 150 px, Paradestreifen ≈ 104 px
  const topBottom = Math.min(iw, (ih - 254) * GH.W / GH.H), sideways = Math.min(iw - 300, (ih - 144) * GH.W / GH.H);
  app.classList.toggle('side', iw > ih && sideways > topBottom * 1.04);
  const availH = Math.max(240, wrap.clientHeight - 30);
  const availW = wrap.clientWidth - (app.classList.contains('side') ? 25 : 0);
  vertical = availW < availH * 1.05;
  const { W, H } = dims();
  stage.style.setProperty('--ar', `${W} / ${H}`);
  stage.style.width = Math.min(availW, availH * W / H) + 'px';
  drawBg();
  for (const id in FIELDS) {
    const f = FIELDS[id], sh = SHAPES[id];
    const [cx, cy] = T(sh.cx, sh.cy), w = vertical ? sh.h : sh.w, h = vertical ? sh.w : sh.h;
    Object.assign(f.el.style, { left: (cx - w / 2) / W * 100 + '%', top: (cy - h / 2) / H * 100 + '%', width: w / W * 100 + '%', height: h / H * 100 + '%' });
    Object.assign(f.tag.style, { left: cx / W * 100 + '%', top: (cy + h / 2) / H * 100 + '%' });
  }
  requestAnimationFrame(() => { for (const id in FIELDS) FIELDS[id].groesseAnpassen(); });
}

/* ---------- Aufgaben ---------- */
function zeigeGleichung(loesung) {
  const eq = $('eq'); const q = document.createElement('span'); q.className = 'q';
  q.textContent = loesung == null ? '?' : String(loesung);
  eq.replaceChildren(`${task.a} ${zeichen(task.op)} ${task.b} = `, q);
}
const START_TIPP = 'Schreib mit dem Finger oder Stift in die leeren Felder.';
function newTask() {
  task = neueAufgabe(zustand.modus, task);
  zeigeGleichung(null);
  for (const id in FIELDS) { FIELDS[id].freigeben(); FIELDS[id].setzeZeichen(zeichen(task.op)); }
  FIELDS.start.vorgeben(task.a); FIELDS.big.vorgeben(task.b);
  stage.classList.remove('done', 'love'); stage.classList.toggle('minus', task.op === 'minus');
  setHint(START_TIPP);
  updateTarget();
  runde?.aufgabeFertig(); // war die Zeit schon um, endet die Runde jetzt
}
function updateTarget() {
  let marked = false;
  for (const id of ORDER) { const f = FIELDS[id]; const t = !marked && f.value == null; f.el.classList.toggle('target', t); if (t) marked = true; }
}
function setHint(t, cls) { const h = $('hint'); h.textContent = t; h.className = 'hint' + (cls ? ' ' + cls : ''); }

function check() {
  if (!task) return;
  pruefeLaeuft = true;
  try { for (const id of ORDER) { const f = FIELDS[id]; if (f.timer && f.strokes.length) f.erkennen(); } }
  finally { pruefeLaeuft = false; }
  const werte = Object.fromEntries(ORDER.map(id => [id, FIELDS[id].value]));
  const b = bewerten(task, werte);
  for (const id of ORDER) {
    const el = FIELDS[id].el; el.classList.remove('ok', 'no'); void el.offsetWidth;
    if (b.richtig.includes(id)) el.classList.add('ok');
    if (b.falsch.includes(id)) el.classList.add('no');
  }
  if (b.falsch.length) {
    paradeFalsch();
    const f = FIELDS[b.falsch[0]];
    if (f.hinweis === 'siebenOhneQuerstrich' && String(task.ans[f.id]).includes('7')) setHint('Ich habe eine 1 gelesen. Eine 7 bekommt einen Querstrich in der Mitte.', 'bad');
    else setHint((f.unsicher ? `Ich habe ${f.value} gelesen. Schreib es deutlicher, falls du etwas anderes meinst. ` : '') + tipp(task, f.id), 'bad');
  } else if (b.leer.length) {
    setHint(`Bis hier stimmt alles! ${tipp(task, b.leer[0])}`, '');
  } else {
    const z = zeichen(task.op);
    zeigeGleichung(task.ans.goal);
    setHint(`Super! ${task.a} ${z} ${task.ans.part1} ${z} ${task.ans.part2} = ${task.ans.goal}`, 'good');
    if (!stage.classList.contains('done')) {
      stage.classList.add('done');
      paradeRichtig();
    }
  }
}

/* ---------- Schneckenparade ---------- */
const streifen = new ParadeStreifen($('track'));
const blaetter = $('leaves');
let runde = null;
const sagStart = () => streifen.sag(runde.laeuft ? 'Weiter geht’s!' : runde.heuteMoeglich ? 'Schreib los, dann startet die Parade!' : 'Für heute geschafft. Du kannst weiter üben.');
function zeigeParade(animiert) { streifen.zeige(parade(runde.z), animiert); zeigeBlaetter(blaetter, runde.z); }
function paradeStarten() {
  if (runde.laeuft || !runde.heuteMoeglich) return;
  if (runde.starten()) { zeigeParade(true); streifen.sag('Los geht’s! Die Parade läuft.'); }
}
function paradeRichtig() {
  if (!runde.laeuft || task.belohnt) { if (!runde.laeuft && !runde.heuteMoeglich) streifen.sag('Super gerechnet!'); return; }
  task.belohnt = true;
  const erg = richtig(runde.z); runde.speichern();
  const slot = blaetter.querySelectorAll('.slot')[Math.min(2, Math.max(0, runde.z.leaves - 1))];
  streifen.blattFliegt(FIELDS.goal.el, erg.neu ? blaetter.querySelectorAll('.slot')[2] : slot);
  setTimeout(() => {
    zeigeParade(true);
    if (erg.neu) streifen.sag(`${describe(erg.neu)} kriecht zur Parade!${erg.kaefer ? ' Ein Marienkäfer kommt als Gast mit!' : ''}`);
    else streifen.sag(['Mmh, Salat!', 'Ein Salatblatt für die Parade!', 'Lecker, noch ein Blatt!'][runde.z.leaves % 3] + ` Noch ${3 - runde.z.leaves}, dann kommt eine neue Schnecke.`);
  }, 800);
  setTimeout(() => runde.aufgabeFertig(), 2200);
}
function paradeFalsch() {
  if (!runde.laeuft || task.fehlerGezaehlt || task.belohnt) return;
  task.fehlerGezaehlt = true; // zählt nur einmal pro Aufgabe
  falsch(runde.z); runde.speichern(); zeigeBlaetter(blaetter, runde.z);
  streifen.sag('Macht nichts, niemand geht weg. Schau dir den Tipp an.');
}
const gartenUrl = '../garten/' + (PROBE ? '?probe' : '');
$('b-garten').href = gartenUrl;
runde = new Runde({
  onTick: (rest, dauer) => {
    $('uhrzeit').textContent = uhrText(rest);
    $('sand').style.width = (rest / dauer * 100) + '%';
    $('uhr').classList.toggle('um', rest <= 0);
  },
  onZeitUm: () => streifen.sag('Die Zeit ist um! Mach diese Aufgabe noch fertig.'),
  onEnde: ergebnis => {
    streifen.ausziehen();
    setTimeout(() => { rueckblick(ergebnis, { gartenUrl }); zeigeParade(false); sagStart(); }, 2600);
  },
});


/* ---------- Knöpfe ---------- */
const grown = $('grown'), infoBtn = $('b-info'), flipBtn = $('b-flip');
const modusKnoepfe = document.querySelectorAll('.seg button');
function zeigeModus() { modusKnoepfe.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.mode === zustand.modus))); }
modusKnoepfe.forEach(b => b.addEventListener('click', () => {
  if (!MODI.includes(b.dataset.mode)) return;
  zustand.modus = b.dataset.mode; speichern(); zeigeModus(); newTask();
}));
$('b-check').addEventListener('click', check);
$('b-next').addEventListener('click', newTask);
$('b-clear').addEventListener('click', () => {
  for (const id of ORDER) FIELDS[id].loeschen();
  stage.classList.remove('done'); setHint(START_TIPP); updateTarget();
});
flipBtn.addEventListener('click', () => {
  zustand.gespiegelt = !zustand.gespiegelt; speichern();
  flipBtn.setAttribute('aria-pressed', String(zustand.gespiegelt));
  layout();
});
infoBtn.addEventListener('click', () => { grown.hidden = !grown.hidden; infoBtn.setAttribute('aria-expanded', String(!grown.hidden)); });
// Neu anordnen, wenn sich der Platz ändert: Drehen, Fenstergröße, Kopfzeile bricht um (z. B. wenn die Schriften fertig geladen sind)
let rt = 0; const spaeterAnordnen = () => { clearTimeout(rt); rt = setTimeout(layout, 120); };
window.addEventListener('resize', spaeterAnordnen);
let letzteGroesse = '';
new ResizeObserver(() => {
  const w = $('wrap'), g = w.clientWidth + 'x' + w.clientHeight;
  if (g !== letzteGroesse) { letzteGroesse = g; spaeterAnordnen(); }
}).observe($('wrap'));
document.fonts?.ready.then(spaeterAnordnen);
// Tintenfarbe hängt vom Thema ab
new MutationObserver(alleNeuZeichnen).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- Start ---------- */
flipBtn.setAttribute('aria-pressed', String(zustand.gespiegelt));
zeigeModus();
layout(); newTask();
zeigeParade(false); sagStart(); runde.tick();
setHint('Einen Moment, die Zahlenerkennung lädt …');
ladeModell()
  .then(() => setHint(START_TIPP))
  .catch(() => setHint('Die Zahlenerkennung konnte nicht geladen werden. Bitte die Seite neu laden.', 'bad'));
