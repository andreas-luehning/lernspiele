// Zehnerweg: Bühne zeichnen, Layout (hoch/quer/Seitenleiste), Felder, Prüfen, Tipps, Sterne.
import { ladeModell } from '../gemeinsam/ziffern.js';
import { Schreibfeld, alleNeuZeichnen } from '../gemeinsam/schreibfeld.js';
import { lesen, schreiben, vorhanden, altLesen } from '../gemeinsam/speicher.js';
import { ORDER, neueAufgabe, tipp, zeichen, herzFeld, bewerten } from './aufgaben.js';
import { Runde, PROBE, uhrText } from '../gemeinsam/runde.js';
import { ParadeStreifen, zeigeBlaetter, rueckblick } from '../gemeinsam/parade.js';
import { richtig, falsch, parade, rechenhelfer, HATS, BLAETTER_PRO_HUT, MIN_RICHTIG } from '../gemeinsam/parade-logik.js';
import { snailSVG, svgElement } from '../gemeinsam/parade-bilder.js';

/* ---------- Gespeicherter Zustand ---------- */
const STANDARD = { gespiegelt: false, modus: 'plus', schnecke: true };
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
// von/nach: die Felder an den Enden. Bei Pfeilen mit Spitze berührt die Spitze genau den Rahmen des Feldes (keine Lücke, nicht im Feld).
const ARROWS = [
  { pts: [[150, 386], [152, 284], [185, 259]], head: true, ende: [1, -1], von: 'start', nach: 'part1' },   // ende: Richtung der Spitze (sonst die der Kurve)
  { pts: [[345, 174], [362, 97], [392, 95]], head: false, von: 'part1', nach: 'ten' },
  { pts: [[608, 95], [645, 97], [664, 170]], head: true, von: 'ten', nach: 'part2' },
  { pts: [[814, 262], [868, 272], [872, 386]], head: false, von: 'part2', nach: 'goal' },
];
const LUFT_PX = 6;   // sichtbarer Abstand zwischen Pfeilspitze und Kreislinie in px
// Pfeilspitze: offener Winkel. Das letzte Stück des Strichs läuft gerade, damit die Spitze gerade auf dem Strich sitzt.
const SPITZE = { GERADE: 20, ARM: 28, WINKEL: 0.6, STRICH: 9 };
const qPunkt = ([P0, P1, P2], t) => [0, 1].map(i => (1 - t) ** 2 * P0[i] + 2 * t * (1 - t) * P1[i] + t * t * P2[i]);
// Abstand eines Punkts zum Feldrand (positiv = außerhalb), in SVG-Einheiten
function randAbstand(sh, x, y) {
  const dx = x - sh.cx, dy = y - sh.cy, a = sh.w / 2, b = sh.h / 2;
  if (sh.kind === 'box') { const qx = Math.abs(dx) - a, qy = Math.abs(dy) - b; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0); }
  const r = Math.hypot(dx / a, dy / b); if (r === 0) return -Math.min(a, b);
  return (r - 1) / (Math.hypot(dx / (a * a), dy / (b * b)) / r);
}
// Pfeil mit Spitze als ein Linienzug: Bogen → gerades Endstück → Spitze. Die Spitze hält LUFT_PX Abstand zur Kreislinie.
function pfeilMitSpitze(ar, frei) {
  const P = ar.pts;
  const richtung = t => { const d = [0, 1].map(i => 2 * (1 - t) * (P[1][i] - P[0][i]) + 2 * t * (P[2][i] - P[1][i])); const l = Math.hypot(d[0], d[1]) || 1; return [d[0] / l, d[1] / l]; };
  let t = 1;
  const R = ar.ende ? (() => { const l = Math.hypot(...ar.ende); return [ar.ende[0] / l, ar.ende[1] / l]; })() : null;
  const richtungSpitze = t => R || richtung(t);
  const aussen = t => { const p = qPunkt(P, t), u = richtungSpitze(t); return [p[0] + u[0] * SPITZE.STRICH / 2, p[1] + u[1] * SPITZE.STRICH / 2]; };
  while (t > 0.2 && randAbstand(SHAPES[ar.nach], ...aussen(t)) < frei) t -= 0.002;
  const E = qPunkt(P, t), u = richtungSpitze(t);
  const S = [E[0] - u[0] * SPITZE.GERADE, E[1] - u[1] * SPITZE.GERADE];   // Beginn des geraden Endstücks
  // Bogen (quadratisch) ohne Knick und ohne Schlenker: Kontrollpunkt = Schnitt der Anfangsrichtung mit der Richtung der Spitze
  const v = [P[1][0] - P[0][0], P[1][1] - P[0][1]], w = [S[0] - P[0][0], S[1] - P[0][1]];
  const kreuz = (a, b) => a[0] * b[1] - a[1] * b[0], det = kreuz(v, u);
  const s1 = det ? kreuz(w, u) / det : -1, s2 = det ? kreuz(v, w) / det : -1;   // P0 + s1·v = S − s2·u
  const K = s1 > 0 && s2 > 0 ? [P[0][0] + s1 * v[0], P[0][1] + s1 * v[1]] : [(P[0][0] + S[0]) / 2, (P[0][1] + S[1]) / 2];
  const arm = vz => { const c = Math.cos(SPITZE.WINKEL), s = Math.sin(SPITZE.WINKEL) * vz; return [E[0] - SPITZE.ARM * (u[0] * c - u[1] * s), E[1] - SPITZE.ARM * (u[1] * c + u[0] * s)]; };
  return { P0: P[0], K, S, E, l: arm(1), r: arm(-1) };
}
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
  // Gleichmäßige Mittelstreifen über die ganze Straße, symmetrisch zur Mitte (x = 500).
  // Weggelassen wird nur, was ein Feld auf der Fahrbahn berührt (Start, großer Kreis, Ziel), mit etwas Luft.
  const DECKT = ['start', 'big', 'goal'].map(k => SHAPES[k]);
  for (let x = 486 - 56 * 7; x <= 486 + 56 * 7; x += 56) {
    if (x < 120 || x + 28 > 880) continue;
    if (DECKT.some(f => x + 28 > f.cx - f.w / 2 - 8 && x < f.cx + f.w / 2 + 8)) continue;
    const [p, q] = T(x, 474), [p2, q2] = T(x + 28, 486);
    s += `<rect class="dash" x="${Math.min(p, p2)}" y="${Math.min(q, q2)}" width="${Math.abs(p2 - p)}" height="${Math.abs(q2 - q)}"/>`;
  }
  // Dünne Linien: der große Kreis zerfällt in die zwei kleinen
  for (const [x1, y1, x2, y2] of [[420, 408, 350, 335], [580, 408, 650, 335]]) {
    const [a, b] = T(x1, y1), [c, d] = T(x2, y2); s += `<line class="conn" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`;
  }
  let route = '';
  const frei = LUFT_PX * W / Math.max(1, parseFloat(stage.style.width) || W);   // px → SVG-Einheiten
  for (const ar of ARROWS) {
    let d;
    if (ar.head) {
      const p = pfeilMitSpitze(ar, frei), [P0, K, S, E, l, r] = [p.P0, p.K, p.S, p.E, p.l, p.r].map(q => T(q[0], q[1]));
      d = `M${P0} Q${K} ${S} L${E} M${l} L${E} L${r}`;   // ein Linienzug: Bogen, gerades Ende, Spitze
    } else {
      const [P0, P1, P2] = ar.pts.map(q => T(q[0], q[1]));   // Pfeile ohne Spitze enden direkt an der Box
      d = `M${P0} Q${P1} ${P2}`;
    }
    s += `<path class="arr" d="${d}"/>`;
    route += (route ? ' ' : '') + d;
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
  wandererZeigen();
  // Die Runde beginnt erst mit einer erkannten Zahl: Gekritzel und Bemalen starten nichts und halten die Uhr nicht an
  if (f.value != null && !f.kritzel) paradeStarten();
  if (task && f.id === herzFeld(task) && f.value === task.ans[f.id]) {
    stage.classList.remove('love'); void stage.offsetWidth; stage.classList.add('love');
  }
  if (f.kritzel) { setHint('Hier ist Platz für eine Zahl. Tippe auf ×, dann kannst du neu schreiben.', 'bad'); return; }
  // Automatisch prüfen, sobald alle Felder sicher erkannt sind und keins mehr in Arbeit ist
  if (pruefeLaeuft || !ORDER.every(id => FIELDS[id].value != null && !FIELDS[id].wartet)) return;
  if (ORDER.some(id => FIELDS[id].unsicher)) { setHint('Bei einem Feld bin ich nicht sicher, was da steht. Schreib deutlicher oder tippe auf Prüfen.', ''); knoepfe('pruefen'); }
  else check();
}
let pruefeLaeuft = false;
for (const id of Object.keys(SHAPES)) {
  FIELDS[id] = new Schreibfeld(stage, {
    id, kind: SHAPES[id].kind,
    onErkannt: nachErkennung,
    onStart: () => { grown.hidden = true; infoBtn.setAttribute('aria-expanded', 'false'); },
    onGeloescht: () => { stage.classList.remove('done'); updateTarget(); knoepfe('rechnen'); wandererZeigen(); },
  });
}

function layout() {
  const wrap = $('wrap');
  // Seitenleiste nur, wenn der Weg dadurch größer wird (breite Bildschirme im Querformat)
  const iw = window.innerWidth - 32, ih = window.innerHeight - 16;
  // Kopfzeile + Tipp/Knöpfe ≈ 150 px, Paradestreifen ≈ 104 px
  const topBottom = Math.min(iw, (ih - 254) * GH.W / GH.H), sideways = Math.min(iw - 300, (ih - 144) * GH.W / GH.H);
  app.classList.toggle('side', iw > ih && sideways > topBottom * 1.04);
  // Passt die Seitenleiste nicht in die Höhe (z. B. Tablet quer mit Browserleiste), lieber oben/unten anordnen
  if (app.classList.contains('side')) {
    const oben = document.querySelector('header .meta').getBoundingClientRect(), tipp = $('hint').getBoundingClientRect(), letzter = $('b-next').getBoundingClientRect();
    if (tipp.top < oben.bottom + 8 || letzter.bottom > window.innerHeight - 4) app.classList.remove('side');
  }
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
  wandererZeigen();
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
  knoepfe('rechnen');
  updateTarget();
  wandererZeigen();
  runde?.aufgabeFertig(); // war die Zeit schon um, endet die Runde jetzt
}
function updateTarget() {
  let marked = false;
  for (const id of ORDER) { const f = FIELDS[id]; const t = !marked && f.value == null; f.el.classList.toggle('target', t); if (t) marked = true; }
}
/**
 * Der hervorgehobene Knopf zeigt den nächsten sinnvollen Schritt:
 * rechnen → keiner (die Felder sind dran), pruefen → „Prüfen“ (alles ausgefüllt, aber unsicher),
 * weiter → „Neue Aufgabe“ (gelöst, mit sanftem Pulsieren).
 */
function knoepfe(zustand) {
  $('b-check').classList.toggle('primary', zustand === 'pruefen');
  $('b-check').classList.toggle('leise', zustand === 'weiter');
  $('b-next').classList.toggle('primary', zustand === 'weiter');
  $('b-next').classList.toggle('puls', zustand === 'weiter');
  $('b-weiter').classList.toggle('primary', zustand === 'weiter');
  $('b-weiter').classList.toggle('puls', zustand === 'weiter');
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
    wandererZeigen(true);
    if (!stage.classList.contains('done')) {
      stage.classList.add('done');
      knoepfe('weiter');
      paradeRichtig();
    }
  }
}

/* ---------- Schnecke geht mit ---------- */
// Die erste Begleitschnecke sitzt neben dem Startkästchen und kriecht mit jedem richtig erkannten Feld
// (der Reihe nach) eine Station weiter bis ins Ziel. Sie sucht sich einen freien Platz neben dem Feld:
// nie auf einem Schreibfeld und nie auf der „erkannt“-Anzeige mit dem Löschknopf (auch hoch, quer und gespiegelt).
// Abschaltbar (zustand.schnecke). Bei „Bewegung reduzieren“ springt sie ohne Animation (theme.css).
const wanderer = document.createElement('div');
wanderer.className = 'wanderer'; wanderer.setAttribute('aria-hidden', 'true'); wanderer.hidden = true;
stage.append(wanderer);
let wandererId = null;
/**
 * Freier Platz neben einem Feld (in Pixeln relativ zur Bühne): oben, seitlich oder unten,
 * ohne ein Feld oder den Bereich der „erkannt“-Anzeige darunter zu berühren. Ergebnis { x, y, b } (Mitte, Breite) oder null.
 */
function freierPlatz(feldEl) {
  const st = stage.getBoundingClientRect();
  const rel = r => ({ l: r.left - st.left, t: r.top - st.top, r: r.right - st.left, b: r.bottom - st.top });
  const b = Math.max(44, st.width * 0.075), h = b * 112 / 130;         // Schnecke: Breite b, Höhe h (viewBox 130 × 112)
  const hindernisse = [];
  for (const id in FIELDS) {
    const f = rel(FIELDS[id].el.getBoundingClientRect());
    hindernisse.push({ l: f.l - 2, t: f.t - 2, r: f.r + 2, b: f.b + 2 });
    if (!ORDER.includes(id)) continue;                                 // Start und großer Kreis haben keine Anzeige
    const mx = (f.l + f.r) / 2;                                        // Platz für „erkannt: … ×“ unter dem Feld
    hindernisse.push({ l: mx - 70, t: f.b, r: mx + 70, b: f.b + 38 });
  }
  // Herz und Hand (nur die sichtbaren) und die Pfeilspitzen auch frei lassen
  for (const g of stage.querySelectorAll('#bg .for-plus, #bg .for-minus')) {
    const r = g.getBoundingClientRect(); if (!r.width) continue;               // ausgeblendet (Plus/Minus)
    const o = rel(r); hindernisse.push({ l: o.l - 4, t: o.t - 4, r: o.r + 4, b: o.b + 4 });
  }
  const bg = $('bg'), m = bg.getScreenCTM && bg.getScreenCTM();
  if (m) for (const pfad of bg.querySelectorAll('.arr')) {
    const e = pfad.getPointAtLength(pfad.getTotalLength());                    // Ende des Pfeils = Spitze
    const x = e.x * m.a + e.y * m.c + m.e - st.left, y = e.x * m.b + e.y * m.d + m.f - st.top;
    hindernisse.push({ l: x - 22, t: y - 22, r: x + 22, b: y + 22 });
  }
  const f = rel(feldEl.getBoundingClientRect()), fw = f.r - f.l, fh = f.b - f.t;
  const kandidaten = [];
  // Ringsum: oben (links, Mitte, rechts), seitlich (oben, Mitte, unten), Ecken; zuerst oben, das wirkt wie „draufgekrochen“
  const dx = b / 2 + 5, dy = h / 2 + 5;                                 // halbe Schnecke plus etwas Luft zum Feld
  for (const fx of [0.25, 0.5, 0.75]) kandidaten.push([f.l + fw * fx, f.t - dy]);
  for (const fy of [0.25, 0.5, 0.75]) kandidaten.push([f.l - dx, f.t + fh * fy], [f.r + dx, f.t + fh * fy]);
  kandidaten.push([f.l - dx, f.t - dy], [f.r + dx, f.t - dy], [f.l - dx, f.b + dy], [f.r + dx, f.b + dy]);
  for (const [x, y] of kandidaten) {
    const k = { l: x - b / 2, t: y - h / 2, r: x + b / 2, b: y + h / 2 };
    if (k.l < 2 || k.t < 2 || k.r > st.width - 2 || k.b > st.height - 2) continue;
    if (hindernisse.some(o => k.l < o.r && o.l < k.r && k.t < o.b && o.t < k.b)) continue;
    return { x, y, b };
  }
  return null;
}
function wandererZeigen(feiern = false) {
  const tier = runde && rechenhelfer(runde.z);
  if (!zustand.schnecke || !tier || !task) { wanderer.hidden = true; return; }
  if (wandererId !== tier.id) { wanderer.replaceChildren(svgElement(snailSVG(tier))); wandererId = tier.id; }
  // So weit, wie die Felder der Reihe nach stimmen
  let k = 0;
  for (const id of ORDER) { if (FIELDS[id].value === task.ans[id]) k++; else break; }
  const station = ['start', ...ORDER][k];
  const platz = freierPlatz(FIELDS[station].el);
  if (!platz) { wanderer.hidden = true; return; }
  const st = stage.getBoundingClientRect();
  wanderer.hidden = false;
  Object.assign(wanderer.style, { left: platz.x / st.width * 100 + '%', top: platz.y / st.height * 100 + '%', width: platz.b / st.width * 100 + '%' });
  wanderer.classList.toggle('feiert', feiern && station === 'goal');
}

/* ---------- Schneckenparade ---------- */
const streifen = new ParadeStreifen($('track'));
const blaetter = $('leaves');
let runde = null;
const LERNZEIT_UM = 'Deine Lernzeit für heute ist um. Schau doch mal in deinen Garten! Du kannst auch frei weiter üben.';
const sagStart = () => streifen.sag(runde.pausiert ? 'Pause. Schreib weiter, dann läuft die Uhr wieder.' : runde.laeuft ? 'Weiter geht’s!' : runde.heuteMoeglich ? 'Schreib eine Zahl, dann startet die Parade!' : LERNZEIT_UM);
function zeigeParade(animiert) { streifen.zeige(parade(runde.z), animiert); zeigeBlaetter(blaetter, runde.z); }
function paradeStarten() {
  const was = runde.aktivitaet(); // startet eine Runde oder setzt nach einer Pause fort
  if (was === 'neu') { zeigeParade(true); streifen.sag(`Los geht’s! Halte 5 Minuten durch und löse ${MIN_RICHTIG} Aufgaben richtig, dann kommt eine neue Schnecke.`); }
  else if (was === 'weiter') streifen.sag('Weiter geht’s!');
}
function paradeRichtig() {
  if (!runde.laeuft || task.belohnt) { if (!runde.laeuft) streifen.sag('Super gerechnet!'); return; } // freies Üben: Lob, keine Belohnung
  task.belohnt = true;
  const erg = richtig(runde.z); runde.speichern();
  const slots = blaetter.querySelectorAll('.slot');
  streifen.blattFliegt(FIELDS.goal.el, slots[erg.hut ? slots.length - 1 : Math.max(0, runde.z.leaves - 1)]);
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
    // Nur eine angefangene Aufgabe darf fertig werden; ist noch nichts geschrieben (oder schon gelöst), endet die Runde gleich
    const angefangen = ORDER.some(id => FIELDS[id].strokes.length) && !stage.classList.contains('done');
    if (angefangen) streifen.sag('Die Zeit ist um! Mach diese Aufgabe noch fertig.');
    else runde.beenden();
  },
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
$('b-weiter').addEventListener('click', newTask);
$('b-clear').addEventListener('click', () => {
  for (const id of ORDER) FIELDS[id].loeschen();
  stage.classList.remove('done'); setHint(START_TIPP); updateTarget(); knoepfe('rechnen');
});
const schneckeBtn = $('b-schnecke');
function schneckeKnopf() { schneckeBtn.setAttribute('aria-pressed', String(zustand.schnecke)); schneckeBtn.textContent = 'Schnecke geht mit: ' + (zustand.schnecke ? 'an' : 'aus'); }
schneckeBtn.addEventListener('click', () => { zustand.schnecke = !zustand.schnecke; speichern(); schneckeKnopf(); wandererZeigen(); });
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
schneckeKnopf();
zeigeModus();
layout(); newTask();
zeigeParade(false); sagStart(); runde.tick();
setHint('Einen Moment, die Zahlenerkennung lädt …');
ladeModell()
  .then(() => setHint(START_TIPP))
  .catch(() => setHint('Die Zahlenerkennung konnte nicht geladen werden. Bitte die Seite neu laden.', 'bad'));
