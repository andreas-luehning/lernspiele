// Edelsteine und Amulett als SVG, aus festen Formen gebaut (kein innerHTML).
// Acryl-Look wie in den Prototypen: durchscheinende Füllung, klare Farbkante, weicher Schein (#glow), Glanzpunkt.

const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, kinder = []) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  for (const c of kinder) e.append(c);
  return e;
}

// Formen im Bereich -40 … 40, Mitte 0/0
const vieleck = (n, r, start = -90) => Array.from({ length: n }, (_, i) => {
  const a = (start + i * 360 / n) * Math.PI / 180; return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

export const STEIN_ART = {
  rubin:     { name: 'Rubin',     farbe: '#FF3D5A', form: () => svg('path', { d: 'M0 -40 C16 -16 30 0 30 12 A30 30 0 1 1 -30 12 C-30 0 -16 -16 0 -40 Z' }),
               facette: () => svg('path', { d: 'M0 -14 C8 -2 14 6 14 12 A14 14 0 1 1 -14 12 C-14 6 -8 -2 0 -14 Z' }) },
  saphir:    { name: 'Saphir',    farbe: '#2E9BFF', form: () => svg('polygon', { points: '0,-42 34,0 0,42 -34,0' }),
               facette: () => svg('polygon', { points: '0,-18 14,0 0,18 -14,0' }) },
  smaragd:   { name: 'Smaragd',   farbe: '#18B868', form: () => svg('polygon', { points: vieleck(8, 38, -67.5) }),
               facette: () => svg('rect', { x: -14, y: -16, width: 28, height: 32, rx: 2 }) },
  amethyst:  { name: 'Amethyst',  farbe: '#8B5CF6', form: () => svg('polygon', { points: vieleck(6, 38, -90) }),
               facette: () => svg('polygon', { points: vieleck(6, 17, -90) }) },
  bernstein: { name: 'Bernstein', farbe: '#FF8A1A', form: () => svg('ellipse', { rx: 29, ry: 37 }),
               facette: () => svg('ellipse', { rx: 13, ry: 17 }) },
  topas:     { name: 'Topas',     farbe: '#E8A900', form: () => svg('polygon', { points: '0,-38 37,28 -37,28' }),
               facette: () => svg('polygon', { points: '0,-8 15,18 -15,18' }) },
};

/** Ein Edelstein als <g>, Mitte (x, y), Größe g (Breite in Einheiten), Drehung in Grad. */
export function stein(sorte, x, y, g, dreh = 0) {
  const art = STEIN_ART[sorte] || STEIN_ART.rubin, s = g / 84;
  const gr = svg('g', { transform: `translate(${x} ${y}) rotate(${dreh}) scale(${s})`, class: 'stein', 'data-sorte': sorte });
  const k = svg('g', { filter: 'url(#glow)', fill: art.farbe, stroke: art.farbe, 'stroke-linejoin': 'round' });
  const form = art.form(); form.setAttribute('fill-opacity', '0.4'); form.setAttribute('stroke-width', '2.8');
  const fac = art.facette(); fac.setAttribute('fill', 'none'); fac.setAttribute('stroke-opacity', '0.55'); fac.setAttribute('stroke-width', '1.8');
  const glanz = svg('ellipse', { cx: -11, cy: -14, rx: 6, ry: 4, fill: '#ffffff', 'fill-opacity': '0.65', stroke: 'none', transform: 'rotate(-30 -11 -14)' });
  k.append(form, fac, glanz); gr.append(k);
  return gr;
}

/** Filter für den weichen Schein; einmal pro SVG einbauen. */
export function glowDefs() {
  const f = svg('filter', { id: 'glow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  f.append(svg('feGaussianBlur', { stdDeviation: '1.6', result: 'b' }),
    svg('feMerge', {}, [svg('feMergeNode', { in: 'b' }), svg('feMergeNode', { in: 'SourceGraphic' })]));
  return svg('defs', {}, [f]);
}

/** Position der Fassungen im Amulett (Mitte 0/0): fünf im Kreis. */
export function fassungsPlatz(i, n) {
  const a = (-90 + i * 360 / n) * Math.PI / 180;
  return { x: 27 * Math.cos(a), y: 6 + 27 * Math.sin(a) };
}

/**
 * Amulett mit n Fassungen; steine = eingesetzte Steine. Größe 120 × 130 Einheiten (viewBox -60 -64 120 130).
 * neu = Index des gerade eingesetzten Steins (bekommt eine kleine Animation).
 */
export function amulett(steine, n, { neu = -1, klein = false } = {}) {
  const s = svg('svg', { viewBox: '-60 -64 120 130', class: 'amulett' + (klein ? ' klein' : ''), 'aria-hidden': 'true' });
  s.append(glowDefs());
  s.append(svg('path', { class: 'a-kette', d: 'M-30 -64 Q0 -30 30 -64' }));
  s.append(svg('circle', { class: 'a-oese', cx: 0, cy: -46, r: 7 }));
  s.append(svg('circle', { class: 'a-rand', cx: 0, cy: 6, r: 52 }));
  s.append(svg('circle', { class: 'a-innen', cx: 0, cy: 6, r: 43 }));
  s.append(svg('circle', { class: 'a-mitte', cx: 0, cy: 6, r: 8 }));
  for (let i = 0; i < n; i++) {
    const p = fassungsPlatz(i, n);
    s.append(svg('circle', { class: 'a-fassung', cx: p.x, cy: p.y, r: 13 }));
    if (steine[i]) {
      const g = stein(steine[i], p.x, p.y, 26);
      if (i === neu) g.firstChild.classList.add('neu'); // inneres <g>: die Animation darf das transform-Attribut nicht ersetzen
      s.append(g);
    }
  }
  return s;
}
