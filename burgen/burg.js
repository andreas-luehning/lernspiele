// Burg als SVG zeichnen: Bauteile im Acryl-Look genau wie im Prototyp (prototypen/burgen.html),
// aber mit DOM-Elementen statt HTML-Strings. Dazu der Lichtschein von unten (wie bei den Edelsteinen).
import { svg } from '../leuchttisch/steine.js';
import { B } from './burg-logik.js';

const SW = 2.6;
const e = (tag, attrs) => svg(tag, attrs);
const linie = (x1, y1, x2, y2, deckung, breite) => e('line', { x1, y1, x2, y2, 'stroke-opacity': deckung, 'stroke-width': breite });

/** Acryl: durchscheinende Füllung, farbige Kante, leichtes Glühen (wie acryl() im Prototyp). */
function acryl(farbe, formen) {
  return svg('g', { filter: 'url(#burg-glow)', fill: farbe, 'fill-opacity': '0.38', stroke: farbe, 'stroke-width': SW, 'stroke-linejoin': 'round' }, formen);
}
function keilPunkte(x, y, h, flip, ueber = 1) {
  return flip ? `${x - ueber},${y + h} ${x + B + ueber},${y + h} ${x - ueber},${y - 1}`
    : `${x - ueber},${y + h} ${x + B + ueber},${y + h} ${x + B + ueber},${y - 1}`;
}

/** Ein Bauteil (Formen 1:1 aus dem Prototyp). */
function bauteil({ t, x, y, w, h, flip, farbe }) {
  switch (t) {
    case 'wuerfel': return acryl(farbe, [e('rect', { x, y, width: B, height: h, rx: 4 }), linie(x + 5, y + 5, x + B - 9, y + 5, 0.5, 1.6)]);
    case 'quaderV': return acryl(farbe, [e('rect', { x, y, width: B, height: h, rx: 4 }), linie(x + 5, y + 5, x + B - 9, y + 5, 0.5, 1.6),
      linie(x + 4, y + h / 2, x + B - 8, y + h / 2, 0.3, 1.3)]);
    case 'zylinder': return acryl(farbe, [
      e('path', { d: `M${x} ${y + 9} a${B / 2} 9 0 0 1 ${B} 0 v${h - 14} a${B / 2} 6 0 0 1 ${-B} 0 Z` }),
      e('ellipse', { cx: x + B / 2, cy: y + 9, rx: B / 2 - 2, ry: 7.5, 'fill-opacity': 0.16, 'stroke-opacity': 0.6, 'stroke-width': 1.6 }),
      e('rect', { x: x + 5, y: y + 13, width: 6, height: h - 26, rx: 3, stroke: 'none', 'fill-opacity': 0.28 })]);
    case 'platteV': { const tw = B * 0.52, xx = x + (B - tw) / 2;
      return acryl(farbe, [e('rect', { x: xx, y, width: tw, height: h, rx: 4 }), linie(xx + 3, y + 5, xx + tw - 5, y + 5, 0.45, 1.4)]); }
    case 'dach': return acryl(farbe, [e('polygon', { points: `${x + B / 2},${y - 2} ${x + B + 2},${y + h} ${x - 2},${y + h}` })]);
    case 'keil': case 'keilV': return acryl(farbe, [e('polygon', { points: keilPunkte(x, y, h, flip) })]);
    case 'kugel': { const r = B / 2;
      return acryl(farbe, [e('circle', { cx: x + r, cy: y + h - r, r: r - 1 }),
        e('circle', { cx: x + r - 4, cy: y + h - r - 5, r: 4, 'stroke-opacity': 0.55, fill: 'none', 'stroke-width': 1.6 })]); }
    case 'quaderH': return acryl(farbe, [e('rect', { x, y, width: w, height: h, rx: 4 }), linie(x + 6, y + 5, x + w - 10, y + 5, 0.5, 1.6)]);
    case 'platteH': return acryl(farbe, [e('rect', { x, y, width: w, height: h, rx: 3.5 })]);
    case 'bogen': { const r = w / 2 - 9, cx = x + w / 2;
      const d = !flip
        ? `M${x} ${y + h} v-${h - 5} q0 -5 5 -5 h${w - 10} q5 0 5 5 v${h - 5} h-9 a${r} ${r} 0 0 0 ${-2 * r} 0 Z`
        : `M${x + 5} ${y} q-5 0 -5 5 v${h - 10} q0 5 5 5 h${w - 10} q5 0 5 -5 v-${h - 10} q0 -5 -5 -5 Z M${cx - r} ${y} a${r} ${r} 0 0 0 ${2 * r} 0 Z`;
      return acryl(farbe, [e('path', { 'fill-rule': 'evenodd', d })]); }
    case 'dachW': return acryl(farbe, [e('polygon', { points: `${x + w / 2},${y - 4} ${x + w + 3},${y + h} ${x - 3},${y + h}` })]);
    case 'keilW': return acryl(farbe, [e('polygon', { points: flip
      ? `${x - 3},${y + h} ${x + w + 3},${y + h} ${x - 3},${y - 3}` : `${x - 3},${y + h} ${x + w + 3},${y + h} ${x + w + 3},${y - 3}` })]);
  }
  return svg('g');
}

/**
 * Burg zeichnen. Gibt das SVG zurück; die Bauteile tragen die Klasse .teil (genau ein Element pro Teil),
 * der Lichtschein liegt darunter in .lichtschein (keine .teil darin).
 */
export function burgSvg(lage) {
  const rand = 34;                                  // Platz um die Burg herum, damit sie nicht am Tischrand klebt
  const s = svg('svg', { viewBox: `${-rand} ${-rand} ${lage.W + 2 * rand} ${lage.H + 2 * rand}`, class: 'tisch-svg burg-svg',
    preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Burg aus Bausteinen' });
  const defs = svg('defs');
  const glow = svg('filter', { id: 'burg-glow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  glow.append(svg('feGaussianBlur', { stdDeviation: '1.6', result: 'b' }),
    svg('feMerge', {}, [svg('feMergeNode', { in: 'b' }), svg('feMergeNode', { in: 'SourceGraphic' })]));
  const schein = svg('filter', { id: 'burg-schein', x: '-50%', y: '-50%', width: '200%', height: '200%' });
  schein.append(svg('feGaussianBlur', { stdDeviation: '4.5' }));
  defs.append(glow, schein);
  s.append(defs);
  // Lichtschein von unten: jedes Teil als weicher Fleck in seiner Farbe, leicht nach rechts unten versetzt
  const licht = svg('g', { class: 'lichtschein', 'aria-hidden': 'true', transform: 'translate(2.5 3.5)', filter: 'url(#burg-schein)' });
  for (const t of lage.teile) {
    const g = bauteil(t); g.removeAttribute('filter'); g.setAttribute('fill-opacity', '0.4'); licht.append(g);
  }
  s.append(licht);
  lage.teile.forEach((t, i) => {
    const g = bauteil(t); g.classList.add('teil'); g.dataset.bereich = String(t.bereich); g.dataset.nr = String(i);
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
