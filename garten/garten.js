// Schneckengarten: alle Tiere, Deko, Begleiter wählen, Sammelalbum.
import { ladeParade, speichereParade, begleiterUmschalten, rundeBeenden, album, describe, heute, SCALE, STAGES, MAX_BEGLEITER } from '../gemeinsam/parade-logik.js';
import { snailSVG, decoSVG, hatSVG, bugSVG, svgElement } from '../gemeinsam/parade-bilder.js';
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

// Sammelalbum: alles als eingeklebte Bilder (Kinder lesen noch nicht sicher); Namen nur für Vorlese-Hilfen
const HUT_BILD = h => `<svg viewBox="26 -10 56 40" aria-hidden="true">${hatSVG(h)}</svg>`;
function stickerBild(gruppe, key) {
  if (gruppe === 'Häuser') { const [color, pattern] = key.split('|'); return snailSVG({ color, pattern, hat: null, special: null, stage: 1 }); }
  if (gruppe === 'Hüte') return HUT_BILD(key);
  if (gruppe === 'Besonderes') {
    if (key === 'kaefer') return bugSVG();
    return snailSVG({ color: 'gelb', pattern: 'uni', hat: null, special: key === 'regenbogen' ? 'regenbogen' : null, stage: key === 'glitzer' ? 3 : 1 });
  }
  return decoSVG(key);
}
function zeigeAlbum() {
  const box = $('album'); box.replaceChildren();
  let gesamt = 0, gefunden = 0;
  for (const gruppe of album(z)) {
    const da = gruppe.eintraege.filter(e => e.da).length; gesamt += gruppe.eintraege.length; gefunden += da;
    const teil = el('section', 'seite-teil' + (gruppe.titel === 'Häuser' ? ' haeuser-teil' : ''));
    const h = el('h3'); h.append(el('span', null, gruppe.titel), el('span', 'teil-zahl', `${da} von ${gruppe.eintraege.length}`));
    const raster = el('div', 'sticker-raster' + (gruppe.titel === 'Häuser' ? ' sechs' : ''));
    for (const e of gruppe.eintraege) {
      const f = el('span', 'sticker' + (e.da ? '' : ' miss') + (gruppe.titel === 'Garten-Deko' || gruppe.titel === 'Hüte' ? ' klein' : ''));
      f.setAttribute('role', 'img'); f.setAttribute('aria-label', e.da ? e.name : 'noch nicht gefunden');
      if (e.da) f.append(svgElement(stickerBild(gruppe.titel, e.key))); else f.textContent = '?';
      raster.append(f);
    }
    teil.append(h, raster); box.append(teil);
  }
  $('album-zahl').textContent = `${gefunden} von ${gesamt} entdeckt`;
  $('album-zahl-reiter').textContent = `${gefunden}/${gesamt}`;
  $('album-balken').style.width = Math.round(gefunden / gesamt * 100) + '%';
}

/* ---------- Reiter Garten / Sammelalbum (Adresse #album merkt sich die Wahl) ---------- */
function zeigeReiter(album) {
  $('r-garten').setAttribute('aria-selected', String(!album)); $('r-album').setAttribute('aria-selected', String(album));
  $('seite-garten').hidden = album; $('seite-album').hidden = !album;
}
$('r-garten').addEventListener('click', () => { history.replaceState(null, '', location.pathname + location.search); zeigeReiter(false); });
$('r-album').addEventListener('click', () => { history.replaceState(null, '', location.pathname + location.search + '#album'); zeigeReiter(true); });
zeigeReiter(location.hash === '#album');

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
