// Schneckengarten: alle Tiere, Deko, Begleiter wählen, Sammelalbum.
import { ladeParade, speichereParade, begleiterUmschalten, rundeBeenden, album, describe, heute, SCALE, STAGES, MAX_BEGLEITER } from '../gemeinsam/parade-logik.js';
import { snailSVG, decoSVG, svgElement } from '../gemeinsam/parade-bilder.js';
import { PROBE } from '../gemeinsam/runde.js';

const $ = id => document.getElementById(id);
const el = (tag, klasse, text) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (text != null) e.textContent = text; return e; };
let z = ladeParade();

function hinweis(t) { $('hinweis').textContent = t; }
function standardHinweis() {
  hinweis(z.runde ? 'Gerade läuft eine Runde. Begleiter wählst du danach aus.'
    : `Tippe bis zu ${MAX_BEGLEITER} Tiere an. Sie laufen in der nächsten Runde mit.`);
}

function zeigeGarten() {
  const neu = new Set(z.runde ? z.runde.neu : []);
  const g = $('garden'); g.replaceChildren();
  [...z.garden].sort((a, b) => b.stage - a.stage || b.id - a.id).forEach(s => {
    const laeuft = z.walkers.includes(s.id);
    const b = el('button', 'g-snail' + (laeuft ? ' walks' : '')); b.type = 'button';
    b.style.setProperty('--k', s.special === 'kaefer' ? 0.7 : SCALE[s.stage]);
    const info = s.special === 'kaefer' ? 'Gast' : `${STAGES[s.stage]} · ${s.runs} ${s.runs === 1 ? 'Ausflug' : 'Ausflüge'}`;
    b.append(svgElement(snailSVG(s)), el('span', null, s.name), el('small', null, info));
    if (neu.has(s.id)) b.append(el('span', 'marke neu', 'neu'));
    else if (laeuft) b.append(el('span', 'marke', 'läuft mit'));
    b.setAttribute('aria-pressed', String(laeuft));
    b.setAttribute('aria-label', `${describe(s)}, ${info}`);
    b.addEventListener('click', () => waehle(s, b));
    g.append(b);
  });
  $('anzahl').textContent = `${z.garden.length} ${z.garden.length === 1 ? 'Tier' : 'Tiere'} · ${z.practiceDays} ${z.practiceDays === 1 ? 'Übungstag' : 'Übungstage'}`;
  const deco = $('deco'); deco.replaceChildren();
  if (z.deco.length) z.deco.forEach(d => deco.append(svgElement(decoSVG(d))));
  else deco.append(el('span', 'leer', 'Nach 5 Übungstagen kommt hier die erste Garten-Deko hin.'));
  zeigeAlbum();
}

function waehle(s, knopf) {
  z = ladeParade(); // falls in einem anderen Tab gespielt wurde
  if (z.runde) { hinweis('Gerade läuft eine Runde. Begleiter wählst du danach aus.'); knopf.classList.remove('wackeln'); void knopf.offsetWidth; knopf.classList.add('wackeln'); return; }
  const vorher = z.walkers.includes(s.id);
  if (!begleiterUmschalten(z, s.id)) return;
  speichereParade(z);
  zeigeGarten();
  hinweis(vorher ? `${s.name} bleibt heute im Garten.` : `${s.name} läuft in der nächsten Runde mit.`);
}

function zeigeAlbum() {
  const box = $('album'); box.replaceChildren();
  let gesamt = 0, gefunden = 0;
  for (const gruppe of album(z)) {
    const da = gruppe.eintraege.filter(e => e.da).length; gesamt += gruppe.eintraege.length; gefunden += da;
    const div = el('div'); const h = el('h3');
    h.append(el('span', null, gruppe.titel), el('span', null, `${da} von ${gruppe.eintraege.length}`));
    if (gruppe.titel === 'Häuser') {
      // 6 × 6 Felder: jede Farbe mit jedem Muster
      div.className = 'voll';
      const raster = el('div', 'haeuser');
      for (const e of gruppe.eintraege) {
        const [color, pattern] = e.key.split('|');
        const f = el('span', 'haus' + (e.da ? '' : ' miss')); f.setAttribute('role', 'img'); f.setAttribute('aria-label', e.da ? e.name : 'noch nicht gefunden');
        if (e.da) f.append(svgElement(snailSVG({ color, pattern, hat: null, special: null, stage: 1 })));
        else f.textContent = '?';
        raster.append(f);
      }
      div.append(h, raster); box.append(div); continue;
    }
    const chips = el('div', 'chips');
    for (const e of gruppe.eintraege) {
      const c = el('span', 'chip' + (e.da ? '' : ' miss'));
      c.append(document.createTextNode(e.da ? e.name : '?'));
      chips.append(c);
    }
    div.append(h, chips); box.append(div);
  }
  $('album-zahl').textContent = `· ${gefunden} von ${gesamt} entdeckt`;
}

if (PROBE) {
  $('b-spiel').href = '../zehnerweg/?probe';
  const t = $('b-tag'); t.hidden = false;
  t.addEventListener('click', () => {
    z = ladeParade();
    if (z.runde) rundeBeenden(z, heute());
    z.lastRoundDay = ''; z.neuHeuteTag = ''; // so tun, als wäre heute noch keine Runde gewesen und keine Schnecke gekommen
    for (const s of z.garden) s.ausflug = '';
    speichereParade(z); zeigeGarten(); standardHinweis();
    hinweis('Probe: Ein neuer Tag beginnt. Die nächste Runde kann starten.');
  });
}

standardHinweis();
zeigeGarten();
