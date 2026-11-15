// Schneckengarten: alle Tiere, Deko, Begleiter wählen, Sammelalbum.
import { ladeParade, speichereParade, begleiterUmschalten, helferUmschalten, rechenhelfer, album, describe, SCALE, STAGES, STAGES_KURZ, MAX_BEGLEITER, HATS, hutAufsetzen, hutAbnehmen, BLAETTER_PRO_HUT } from '../gemeinsam/parade-logik.js';
import { lernzeitNeu } from '../gemeinsam/lernzeit.js';
import { hutBild } from '../gemeinsam/parade.js';
import { snailSVG, decoSVG, hatSVG, bugSVG, svgElement } from '../gemeinsam/parade-bilder.js';
import { PROBE } from '../gemeinsam/runde.js';

const $ = id => document.getElementById(id);
const el = (tag, klasse, text) => { const e = document.createElement(tag); if (klasse) e.className = klasse; if (text != null) e.textContent = text; return e; };
let z = ladeParade();
let auswahl = null; // gewählte Kopfbedeckung aus der Hutschachtel oder 'ab' (abnehmen)
window.addEventListener('pageshow', e => { if (e.persisted) location.reload(); }); // nie mit veraltetem Stand weiter

function hinweis(t) { $('hinweis').textContent = t; }
function standardHinweis() {
  hinweis(auswahl === 'helfer' ? 'Tippe die Schnecke an, die dir beim Rechnen hilft.'
    : auswahl === 'ab' ? 'Tippe eine Schnecke an, die ihre Kopfbedeckung abnehmen soll.'
    : auswahl ? `Tippe eine Schnecke an. Sie bekommt: ${HATS[auswahl]}.`
    : z.runde ? 'Gerade läuft eine Runde. Begleiter wählst du danach aus.'
    : `Tippe bis zu ${MAX_BEGLEITER} Tiere an. Sie laufen in der nächsten Runde mit.`);
}

/* ---------- Hutschachtel: Kopfbedeckung antippen, dann eine Schnecke ---------- */
function zeigeHutschachtel() {
  const box = $('hutschachtel'); box.replaceChildren();
  const schachtel = el('span', 'hs-schachtel'); schachtel.setAttribute('aria-hidden', 'true');
  schachtel.append(svgElement('<svg viewBox="0 0 40 32"><path d="M4 12 H36 V28 H4 Z" fill="#c98a4b" stroke="#1d2747" stroke-width="2" stroke-linejoin="round"/><path d="M2 8 H38 V13 H2 Z" fill="#e2b36b" stroke="#1d2747" stroke-width="2" stroke-linejoin="round"/><path d="M14 20 H26" stroke="#1d2747" stroke-width="2" stroke-linecap="round"/></svg>'));
  box.append(schachtel);
  const hf = el('button', 'hs-hut hs-helfer'); hf.type = 'button';
  hf.append(svgElement('<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M8 26 L10 18 L28 4 L34 10 L16 24 Z" fill="#f6c945" stroke="#1d2747" stroke-width="2" stroke-linejoin="round"/><path d="M10 18 L16 24 L8 26 Z" fill="#fff" stroke="#1d2747" stroke-width="2" stroke-linejoin="round"/><path d="M26 6 L32 12" stroke="#1d2747" stroke-width="2"/></svg>'));
  hf.setAttribute('aria-label', 'Rechenhelfer wählen'); hf.setAttribute('aria-pressed', String(auswahl === 'helfer'));
  hf.addEventListener('click', () => { auswahl = auswahl === 'helfer' ? null : 'helfer'; zeigeHutschachtel(); standardHinweis(); });
  box.append(hf);
  const anzahl = {}; for (const h of z.hutschachtel) anzahl[h] = (anzahl[h] || 0) + 1;
  const arten = Object.keys(HATS).filter(h => anzahl[h]);
  if (!arten.length) box.append(el('span', 'hs-leer', `Für ${BLAETTER_PRO_HUT} Salatblätter gibt es eine Kopfbedeckung.`));
  for (const h of arten) {
    const k = el('button', 'hs-hut'); k.type = 'button';
    k.append(hutBild(h)); if (anzahl[h] > 1) k.append(el('b', 'hs-zahl', String(anzahl[h])));
    k.setAttribute('aria-label', HATS[h] + (anzahl[h] > 1 ? `, ${anzahl[h]} Stück` : ''));
    k.setAttribute('aria-pressed', String(auswahl === h));
    k.addEventListener('click', () => { auswahl = auswahl === h ? null : h; zeigeHutschachtel(); standardHinweis(); });
    box.append(k);
  }
  if (z.garden.some(s => s.hat)) {
    const ab = el('button', 'hs-hut hs-ab'); ab.type = 'button';
    ab.append(svgElement('<svg viewBox="0 0 40 32" aria-hidden="true"><path d="M8 22 L20 6 L32 22 Z" fill="#fff" stroke="#1d2747" stroke-width="2" stroke-linejoin="round"/><path d="M10 26 L30 6" stroke="#e5484d" stroke-width="3.5" stroke-linecap="round"/></svg>'));
    ab.setAttribute('aria-label', 'Kopfbedeckung abnehmen'); ab.setAttribute('aria-pressed', String(auswahl === 'ab'));
    ab.addEventListener('click', () => { auswahl = auswahl === 'ab' ? null : 'ab'; zeigeHutschachtel(); standardHinweis(); });
    box.append(ab);
  }
  document.querySelector('.garden-seite, .garten-seite').classList.toggle('hut-modus', !!auswahl);
}

function zeigeGarten() {
  const neu = new Set(z.runde ? z.runde.neu : []);
  const helfer = rechenhelfer(z);
  const g = $('garden'); g.replaceChildren();
  [...z.garden].sort((a, b) => b.stage - a.stage || b.id - a.id).forEach(s => {
    const laeuft = z.walkers.includes(s.id);
    const b = el('button', 'g-snail' + (laeuft ? ' walks' : '')); b.type = 'button';
    b.style.setProperty('--k', s.special === 'kaefer' ? 0.7 : SCALE[s.stage]);
    const ausfluege = `${s.runs} ${s.runs === 1 ? 'Ausflug' : 'Ausflüge'}`;
    const info = s.special === 'kaefer' ? 'Gast' : `${STAGES_KURZ[s.stage]} · ${ausfluege}`;   // kurz: wenig Platz unter dem Tier
    const infoLang = s.special === 'kaefer' ? 'Gast' : `${STAGES[s.stage]}, ${ausfluege}`;       // lang: Vorlesetext
    b.append(svgElement(snailSVG(s)), el('span', null, s.name), el('small', null, info));
    if (helfer && helfer.id === s.id) b.append(el('span', 'marke helfer', '✏'));
    if (neu.has(s.id)) b.append(el('span', 'marke neu', 'neu'));
    else if (laeuft) b.append(el('span', 'marke', 'läuft mit'));
    b.setAttribute('aria-pressed', String(laeuft));
    b.setAttribute('aria-label', `${describe(s)}, ${infoLang}`);
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
  if (auswahl === 'helfer') { helferWaehlen(s, knopf); return; }
  if (auswahl) { hutWaehlen(s, knopf); return; }
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
function helferWaehlen(s, knopf) {
  if (!helferUmschalten(z, s.id)) { hinweis(`${s.name} ist ein Marienkäfer und kann nicht rechnen helfen.`); knopf.classList.remove('wackeln'); void knopf.offsetWidth; knopf.classList.add('wackeln'); return; }
  auswahl = null; speichereParade(z); zeigeGarten(); zeigeHutschachtel();
  hinweis(z.helfer === s.id ? `${s.name} hilft dir beim Rechnen.` : `${s.name} hilft nicht mehr. Die erste Schnecke hilft wieder.`);
}
function hutWaehlen(s, knopf) {
  const wackeln = () => { knopf.classList.remove('wackeln'); void knopf.offsetWidth; knopf.classList.add('wackeln'); };
  if (s.special === 'kaefer') { hinweis(`${s.name} ist ein Marienkäfer und mag keine Hüte.`); wackeln(); return; }
  let ok;
  if (auswahl === 'ab') ok = hutAbnehmen(z, s.id);
  else ok = hutAufsetzen(z, auswahl, s.id);
  if (!ok) { wackeln(); return; }
  const was = auswahl; auswahl = null;
  speichereParade(z); zeigeGarten(); zeigeHutschachtel();
  hinweis(was === 'ab' ? `${s.name} hat die Kopfbedeckung zurück in die Schachtel gelegt.` : `${s.name} trägt jetzt: ${HATS[was]}.`);
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
    // so tun, als wäre ein neuer Tag: Lernzeit wieder voll, Übungstag und Wachsen zählen neu
    z.lastPracticeDay = ''; for (const s of z.garden) s.ausflug = '';
    lernzeitNeu();
    speichereParade(z); zeigeGarten(); standardHinweis();
    hinweis('Probe: Ein neuer Tag beginnt. Die Lernzeit ist wieder voll.');
  });
}

standardHinweis();
zeigeGarten();
zeigeHutschachtel();
