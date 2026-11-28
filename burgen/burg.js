// Burg als SVG zeichnen: Bauteile mit denselben Formen wie im Prototyp (prototypen/burgen.html),
// aber mit DOM-Elementen statt HTML-Strings und mit klarem Acryl-Look statt Glühen (docs/burgen.md, 28.11.).
// Dazu ein blasser Lichtschein von unten (wie bei den Edelsteinen).
import { svg } from '../leuchttisch/steine.js';
import { B } from './burg-logik.js';

const e = (tag, attrs) => svg(tag, attrs);
const linie = (x1, y1, x2, y2, deckung, breite) => e('line', { x1, y1, x2, y2, 'stroke-opacity': deckung, 'stroke-width': breite });
/** Farbe abdunkeln (für die scharfe Umrisslinie und die dunkle Kante unten rechts). */
function dunkler(hex, f = 0.72) {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(c => Math.round(c * f).toString(16).padStart(2, '0')).join('');
}
let clipNr = 0;

/**
 * Acryl wie echte Bausteine: kräftige, durchsichtige Farbe, zum Rand hin dichter (dickeres Acryl),
 * helle Lichtkante oben links, dunkle Kante unten rechts, schwacher Glanz von oben, scharfe Umrisslinie.
 * form: die Grundform (ein Element), details: die Linien und Ellipsen aus dem Prototyp.
 */
function acryl(farbe, form, details = []) {
  const id = 'acryl-' + (++clipNr), kopie = attrs => { const k = form.cloneNode(true); for (const n in attrs) k.setAttribute(n, attrs[n]); return k; };
  const rand = dunkler(farbe);
  const g = svg('g', { 'stroke-linejoin': 'round' });
  const clip = svg('clipPath', { id }); clip.append(kopie({ 'clip-rule': form.getAttribute('fill-rule') || 'nonzero' }));
  g.append(clip);
  g.append(kopie({ class: 'acryl-koerper', fill: farbe, 'fill-opacity': '0.5', stroke: 'none' }));   // Körper: wirkt wie ein Farbfilter über dem Licht
  g.append(kopie({ fill: 'url(#acryl-glanz)', stroke: 'none' }));                          // Glanz von oben
  const innen = svg('g', { 'clip-path': `url(#${id})`, fill: 'none' });
  innen.append(kopie({ class: 'acryl-koerper', stroke: farbe, 'stroke-opacity': '0.65', 'stroke-width': '4.5' }));   // Rand dichter als die Mitte
  innen.append(svg('g', { transform: 'translate(1.4 1.4)' }, [kopie({ stroke: '#ffffff', 'stroke-opacity': '0.9', 'stroke-width': '1.3' })]));   // Lichtkante oben links
  innen.append(svg('g', { transform: 'translate(-1.4 -1.4)' }, [kopie({ stroke: rand, 'stroke-opacity': '0.45', 'stroke-width': '1.3' })]));     // Kante unten rechts
  g.append(innen);
  if (details.length) g.append(svg('g', { fill: farbe, stroke: farbe, 'stroke-width': '2' }, details));
  g.append(kopie({ fill: 'none', stroke: rand, 'stroke-width': '0.9' }));                  // feine, scharfe Umrisslinie
  return g;
}
function keilPunkte(x, y, h, flip, ueber = 1) {
  return flip ? `${x - ueber},${y + h} ${x + B + ueber},${y + h} ${x - ueber},${y - 1}`
    : `${x - ueber},${y + h} ${x + B + ueber},${y + h} ${x + B + ueber},${y - 1}`;
}

/** Ein Bauteil (Formen 1:1 aus dem Prototyp). */
function bauteil({ t, x, y, w, h, flip, farbe }) {
  switch (t) {
    case 'wuerfel': return acryl(farbe, e('rect', { x, y, width: B, height: h, rx: 4 }), [linie(x + 5, y + 5, x + B - 9, y + 5, 0.5, 1.6)]);
    case 'quaderV': return acryl(farbe, e('rect', { x, y, width: B, height: h, rx: 4 }), [linie(x + 5, y + 5, x + B - 9, y + 5, 0.5, 1.6),
      linie(x + 4, y + h / 2, x + B - 8, y + h / 2, 0.3, 1.3)]);
    case 'zylinder': return acryl(farbe,
      e('path', { d: `M${x} ${y + 9} a${B / 2} 9 0 0 1 ${B} 0 v${h - 14} a${B / 2} 6 0 0 1 ${-B} 0 Z` }), [
      e('ellipse', { cx: x + B / 2, cy: y + 9, rx: B / 2 - 2, ry: 7.5, 'fill-opacity': 0.16, 'stroke-opacity': 0.6, 'stroke-width': 1.6 }),
      e('rect', { x: x + 5, y: y + 13, width: 6, height: h - 26, rx: 3, stroke: 'none', fill: '#ffffff', 'fill-opacity': 0.35 })]);
    case 'platteV': { const tw = B * 0.52, xx = x + (B - tw) / 2;
      return acryl(farbe, e('rect', { x: xx, y, width: tw, height: h, rx: 4 }), [linie(xx + 3, y + 5, xx + tw - 5, y + 5, 0.45, 1.4)]); }
    case 'dach': return acryl(farbe, e('polygon', { points: `${x + B / 2},${y - 2} ${x + B + 2},${y + h} ${x - 2},${y + h}` }));
    case 'keil': case 'keilV': return acryl(farbe, e('polygon', { points: keilPunkte(x, y, h, flip) }));
    case 'kugel': { const r = B / 2;
      return acryl(farbe, e('circle', { cx: x + r, cy: y + h - r, r: r - 1 }),
        [e('circle', { cx: x + r - 4, cy: y + h - r - 5, r: 4, stroke: '#ffffff', 'stroke-opacity': 0.7, fill: 'none', 'stroke-width': 1.6 })]); }
    case 'quaderH': return acryl(farbe, e('rect', { x, y, width: w, height: h, rx: 4 }), [linie(x + 6, y + 5, x + w - 10, y + 5, 0.5, 1.6)]);
    case 'platteH': return acryl(farbe, e('rect', { x, y, width: w, height: h, rx: 3.5 }));
    case 'bogen': { const r = w / 2 - 9, cx = x + w / 2;
      // Tor: Öffnung unten. Fenster: dasselbe Bauteil, nur umgedreht (Öffnung oben, Rückmeldung 28.11.)
      const d = `M${x} ${y + h} v-${h - 5} q0 -5 5 -5 h${w - 10} q5 0 5 5 v${h - 5} h-9 a${r} ${r} 0 0 0 ${-2 * r} 0 Z`;
      return acryl(farbe, e('path', flip ? { d, transform: `rotate(180 ${cx} ${y + h / 2})` } : { d })); }
    case 'dachW': return acryl(farbe, e('polygon', { points: `${x + w / 2},${y - 4} ${x + w + 3},${y + h} ${x - 3},${y + h}` }));
    case 'keilW': return acryl(farbe, e('polygon', { points: flip
      ? `${x - 3},${y + h} ${x + w + 3},${y + h} ${x - 3},${y - 3}` : `${x - 3},${y + h} ${x + w + 3},${y + h} ${x + w + 3},${y - 3}` }));
  }
  return svg('g');
}
/** Nur die Grundform eines Teils (für den Lichtschein). */
function grundform(t) {
  const g = bauteil(t), k = g.querySelector('clipPath > *').cloneNode(true);
  k.removeAttribute('clip-rule'); if (g.querySelector('clipPath > [clip-rule="evenodd"]')) k.setAttribute('fill-rule', 'evenodd');
  return k;
}

/**
 * Burg zeichnen. Gibt das SVG zurück; die Bauteile tragen die Klasse .teil (genau ein Element pro Teil),
 * der Lichtschein liegt darunter in .lichtschein (keine .teil darin).
 */
export function burgSvg(lage) {
  const rx = 10, ry = 18;                           // etwas Platz um die Burg, damit sie nicht am Tischrand klebt
  const s = svg('svg', { viewBox: `${-rx} ${-ry} ${lage.W + 2 * rx} ${lage.H + 2 * ry}`, class: 'tisch-svg burg-svg',
    preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Burg aus Bausteinen' });
  const defs = svg('defs');
  const glanz = svg('linearGradient', { id: 'acryl-glanz', x1: '0', y1: '0', x2: '0.35', y2: '1' });
  glanz.append(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.45' }), svg('stop', { offset: '0.45', 'stop-color': '#ffffff', 'stop-opacity': '0.08' }),
    svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
  const schein = svg('filter', { id: 'burg-schein', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  schein.append(svg('feGaussianBlur', { stdDeviation: '2.2' }));
  defs.append(glanz, schein);
  s.append(defs);
  // Lichtschein von unten: farbiges Licht, das durch das Acryl auf die Platte fällt, leicht nach rechts unten versetzt
  const licht = svg('g', { class: 'lichtschein', 'aria-hidden': 'true', transform: 'translate(3.5 4.5)', filter: 'url(#burg-schein)' });
  for (const t of lage.teile) {
    const f = grundform(t); f.setAttribute('fill', t.farbe); f.setAttribute('fill-opacity', '0.3');
    licht.append(svg('g', {}, [f]));
  }
  s.append(licht);
  lage.teile.forEach((t, i) => {
    const g = bauteil(t); g.classList.add('teil'); g.dataset.bereich = String(t.bereich); g.dataset.nr = String(i); g.dataset.farbe = t.farbe;
    s.append(g);
  });
  return s;
}

/** Kleine Zählplakette auf einem Teil (für „Zeig mir's“). */
export function zaehlPlakette(t, n) {
  const cx = t.x + t.w / 2, cy = t.y + t.h / 2;
  const g = svg('g', { class: 'zaehl' });
  g.append(svg('circle', { cx, cy, r: 10, stroke: t.farbe }));
  const txt = svg('text', { x: cx, y: cy + 4.5, 'text-anchor': 'middle', fill: t.farbe }); txt.textContent = String(n);
  g.append(txt);
  return g;
}

/** Sehr subtiles Funkeln: kleiner Stern oben links auf einem Teil. */
export function funkelStern(t) {
  const x = t.x + Math.min(8, t.w * 0.3), y = t.y + Math.min(7, t.h * 0.3), a = 4.5, b = 1.2;
  return svg('path', { class: 'burg-funkeln', 'aria-hidden': 'true', fill: '#ffffff',
    d: `M${x} ${y - a} L${x + b} ${y - b} L${x + a} ${y} L${x + b} ${y + b} L${x} ${y + a} L${x - b} ${y + b} L${x - a} ${y} L${x - b} ${y - b} Z` });
}

/** Ring um ein Teil (für „Zeig mir's“ ohne Zahlen: ein Turm oder eine Farbe). */
export function zaehlRing(t) {
  return svg('rect', { class: 'zaehl-ring', x: t.x - 3, y: t.y - 3, width: t.w + 6, height: t.h + 6, rx: 7 });
}

/**
 * Tuch über dem rechten Turm (Stufe „Versteckt“): weicher Stoff mit Falten, deutlich anders als ein Bauteil,
 * deckt den Turm und seinen Lichtschein ganz ab. In der Mitte ein „?“.
 */
export function tuch(lage) {
  const turm = lage.teile.filter(t => t.bereich === 2);
  const x0 = Math.min(...turm.map(t => t.x)) - 6, x1 = Math.max(...turm.map(t => t.x + t.w)) + 9;
  const y0 = Math.min(...turm.map(t => t.y)) - 12, y1 = lage.groundY + 8;
  const w = x1 - x0, mx = (x0 + x1) / 2;
  const g = svg('g', { class: 'tuch', 'aria-label': 'Ein Turm ist unter dem Tuch versteckt', role: 'img' });
  // Stoff: oben rund (über der Turmspitze), unten leicht gewellt
  g.append(svg('path', { class: 'tuch-stoff', d:
    `M${x0} ${y1} L${x0 + 2} ${y0 + 14} Q${x0 + 3} ${y0} ${mx} ${y0} Q${x1 - 3} ${y0} ${x1 - 2} ${y0 + 14} L${x1} ${y1} ` +
    `Q${x1 - w * 0.25} ${y1 - 5} ${mx} ${y1} Q${x0 + w * 0.25} ${y1 + 5} ${x0} ${y1} Z` }));
  // Falten
  for (const f of [0.3, 0.55, 0.78]) {
    const fx = x0 + w * f;
    g.append(svg('path', { class: 'tuch-falte', d: `M${fx} ${y0 + 16} Q${fx - 3} ${(y0 + y1) / 2} ${fx + 1} ${y1 - 4}` }));
  }
  const cy = (y0 + y1) / 2;
  g.append(svg('circle', { class: 'tuch-frage-kreis', cx: mx, cy, r: 11 }));
  const t = svg('text', { class: 'tuch-frage', x: mx, y: cy + 5.5, 'text-anchor': 'middle' }); t.textContent = '?';
  g.append(t);
  return g;
}
