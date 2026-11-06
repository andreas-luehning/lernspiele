// Schreibfeld: Canvas für Finger oder Stift, mit Erkennung und Anzeige "erkannt: 7" unter dem Feld.
//
// Robuste Eingabe (Erfahrungen aus dem Prototyp):
// - Jedes Feld folgt genau einem Zeiger. Handballen und zweite Finger werden ignoriert.
// - Nach einem Stift-Ereignis werden Finger nur 1,5 s lang ignoriert (Handflächen-Schutz), danach geht der Finger wieder.
// - pointerup am Fenster, lostpointercapture und blur als Sicherheitsnetz: Kein Feld bleibt "blockiert".
// - touch-action: none auf der Spielfläche (CSS), Kontextmenü und Zoom-Gesten aus.

import { leseZahl, UNSICHER } from './ziffern.js';

const WARTEZEIT = 650;          // ms nach dem letzten Strich bis zur Erkennung
const STIFT_SPERRE = 1500;      // ms, in denen Finger nach Stift-Benutzung ignoriert werden
const MAX_PUNKTE = 20000;       // Obergrenze pro Feld, damit Dauerkritzeln den Browser nicht ausbremst

let letzterStift = 0;
const alleFelder = new Set();

function sicherheitsnetz() {
  window.addEventListener('pointerup', e => { for (const f of alleFelder) if (f.pid === e.pointerId) f.strichEnde(); });
  window.addEventListener('pointercancel', e => { for (const f of alleFelder) if (f.pid === e.pointerId) f.strichEnde(); });
  window.addEventListener('blur', () => { for (const f of alleFelder) if (f.cur) f.strichEnde(true); else f.pid = null; });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
}
let netzAktiv = false;

function el(tag, klasse, text) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text != null) e.textContent = text;
  return e;
}

function inkColor() { return getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#2346a6'; }

export class Schreibfeld {
  /**
   * @param {HTMLElement} container  Element, in das Feld und Hinweis gehängt werden
   * @param {{id:string, kind:'box'|'oval', onErkannt?:(f:Schreibfeld)=>void, onStart?:(f:Schreibfeld)=>void, onGeloescht?:(f:Schreibfeld)=>void}} opt
   */
  constructor(container, { id, kind, onErkannt, onStart, onGeloescht }) {
    if (!netzAktiv) { sicherheitsnetz(); netzAktiv = true; }
    this.id = id; this.onErkannt = onErkannt || (() => {}); this.onStart = onStart || (() => {});
    this.onGeloescht = onGeloescht || (() => {});
    this.strokes = []; this.cur = null; this.pid = null; this.timer = 0;
    this.value = null; this.conf = 0; this.fixed = false; this.w = 0; this.h = 0; this.punkte = 0;

    this.el = el('div', 'field ' + kind); this.el.id = 'f-' + id;
    this.cv = el('canvas');
    this.given = el('div', 'given'); this.given.hidden = true;
    this.el.append(this.cv, this.given);
    if (kind === 'oval') { this.op = el('span', 'op'); this.el.append(this.op); }

    this.tag = el('div', 'tag'); this.tag.hidden = true;
    this.read = el('span', 'read');
    this.clr = el('button', 'clr', '×'); this.clr.type = 'button'; this.clr.setAttribute('aria-label', 'Feld löschen');
    this.tag.append(this.read, this.clr);
    container.append(this.el, this.tag);
    alleFelder.add(this);

    this.cv.addEventListener('pointerdown', e => this.#down(e));
    this.cv.addEventListener('pointermove', e => this.#move(e));
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      this.cv.addEventListener(ev, e => { if (this.pid === null || e.pointerId === this.pid) this.strichEnde(); });
    }
    this.clr.addEventListener('click', () => { this.loeschen(); this.onGeloescht(this); });
  }

  #pos(e) { const r = this.cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  #down(e) {
    if (this.fixed) return;
    if (e.pointerType === 'pen') letzterStift = Date.now();
    if (e.pointerType === 'touch' && Date.now() - letzterStift < STIFT_SPERRE) return;
    if (this.pid !== null && this.pid !== e.pointerId) return;
    e.preventDefault();
    try { this.cv.setPointerCapture(e.pointerId); } catch (err) {}
    this.pid = e.pointerId; clearTimeout(this.timer); this.timer = 0;
    this.el.classList.remove('ok', 'no');
    this.cur = [this.#pos(e)]; this.strokes.push(this.cur); this.punkte++;
    this.onStart(this);
    this.zeichnen();
  }

  #move(e) {
    if (e.pointerType === 'pen') letzterStift = Date.now();
    if (!this.cur || e.pointerId !== this.pid) return;
    e.preventDefault();
    if (this.punkte > MAX_PUNKTE) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    if (evs.length) for (const ev of evs) this.cur.push(this.#pos(ev)); else this.cur.push(this.#pos(e));
    this.punkte += evs.length || 1;
    this.zeichnen();
  }

  /** Strich beenden; Erkennung nach kurzer Pause (oder sofort). */
  strichEnde(sofort = false) {
    this.pid = null;
    if (!this.cur) return;
    this.cur = null;
    clearTimeout(this.timer);
    if (sofort) this.erkennen();
    else this.timer = setTimeout(() => this.erkennen(), WARTEZEIT);
  }

  /** Noch am Schreiben oder Erkennung steht aus. */
  get wartet() { return !!this.cur || !!this.timer; }

  erkennen() {
    clearTimeout(this.timer); this.timer = 0;
    if (this.fixed) return;
    const r = leseZahl(this.strokes, this.w, this.h);
    this.value = r ? r.value : null; this.conf = r ? r.conf : 0; this.hinweis = r ? r.hinweis : null;
    const has = this.strokes.length > 0;
    this.el.classList.toggle('has', has); this.tag.hidden = !has;
    this.read.textContent = r ? (r.conf < UNSICHER ? r.value + ' ?' : 'erkannt: ' + r.value) : 'nicht erkannt';
    this.tag.classList.toggle('unsure', !r || r.conf < UNSICHER);
    this.onErkannt(this);
  }

  get unsicher() { return this.conf < UNSICHER; }

  loeschen() {
    clearTimeout(this.timer); this.timer = 0;
    this.strokes = []; this.cur = null; this.pid = null; this.value = null; this.conf = 0; this.punkte = 0; this.hinweis = null;
    this.tag.hidden = true;
    this.el.classList.remove('has', 'ok', 'no');
    this.zeichnen();
  }

  /** Vorgegebene Zahl (nicht beschreibbar). */
  vorgeben(v) {
    this.loeschen();
    this.fixed = true; this.value = v; this.conf = 1;
    this.given.hidden = false; this.given.textContent = String(v); this.cv.style.cursor = 'default';
  }

  /** Wieder beschreibbar machen. */
  freigeben() {
    this.fixed = false; this.given.hidden = true; this.cv.style.cursor = '';
    this.loeschen();
  }

  setzeZeichen(z) { if (this.op) this.op.textContent = z; }

  /** Nach Größenänderung: Leinwand anpassen und vorhandene Striche mitskalieren. */
  groesseAnpassen() {
    const dpr = window.devicePixelRatio || 1, r = this.el.getBoundingClientRect();
    if (this.w && (Math.abs(r.width - this.w) > 1 || Math.abs(r.height - this.h) > 1)) {
      const sx = r.width / this.w, sy = r.height / this.h;
      for (const s of this.strokes) for (const p of s) { p.x *= sx; p.y *= sy; }
    }
    this.w = r.width; this.h = r.height;
    this.cv.width = Math.round(r.width * dpr); this.cv.height = Math.round(r.height * dpr);
    this.zeichnen();
  }

  zeichnen() {
    const dpr = window.devicePixelRatio || 1;
    const c = this.cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, this.w, this.h);
    c.strokeStyle = c.fillStyle = inkColor(); c.lineCap = c.lineJoin = 'round';
    c.lineWidth = Math.max(4, Math.min(this.w, this.h) * 0.045);
    for (const s of this.strokes) {
      if (s.length === 1) { c.beginPath(); c.arc(s[0].x, s[0].y, c.lineWidth / 2, 0, 7); c.fill(); continue; }
      c.beginPath(); c.moveTo(s[0].x, s[0].y);
      for (let i = 1; i < s.length - 1; i++) { const mx = (s[i].x + s[i + 1].x) / 2, my = (s[i].y + s[i + 1].y) / 2; c.quadraticCurveTo(s[i].x, s[i].y, mx, my); }
      const l = s[s.length - 1]; c.lineTo(l.x, l.y); c.stroke();
    }
  }
}

/** Alle Felder neu zeichnen (z. B. nach Wechsel Tag/Nacht, weil sich die Tintenfarbe ändert). */
export function alleNeuZeichnen() { for (const f of alleFelder) f.zeichnen(); }
