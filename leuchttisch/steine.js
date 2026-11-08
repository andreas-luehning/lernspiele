// Edelsteine und Amulett als SVG, aus festen Formen gebaut (kein innerHTML).

const NS = 'http://www.w3.org/2000/svg';
export function svg(tag, attrs = {}, kinder = []) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  for (const c of kinder) e.append(c);
  return e;
}

// Edelsteine mit Schliff: Umriss, darin Ringe von Facetten und eine Tafel (die flache Fläche oben).
// Jede Facette bekommt Licht von links oben: zum Licht hin heller, abgewandt dunkler. Dazu ein Funkeln.
// Formen im Bereich -42 … 42, Mitte 0/0.

const kreisPunkte = (n, rx, ry = rx, start = -90) => Array.from({ length: n }, (_, i) => {
  const a = (start + i * 360 / n) * Math.PI / 180; return [rx * Math.cos(a), ry * Math.sin(a)];
});
// Kissen: Quadrat mit runden Ecken (Superellipse)
const kissen = (n, r) => Array.from({ length: n }, (_, i) => {
  const a = (-90 + 22.5 + i * 360 / n) * Math.PI / 180, c = Math.cos(a), si = Math.sin(a);
  return [r * Math.sign(c) * Math.abs(c) ** 0.5, r * Math.sign(si) * Math.abs(si) ** 0.5];
});

export const STEIN_ART = {
  rubin:    { name: 'Rubin',    farbe: '#e8193c', hell: '#ff9aac', dunkel: '#7d0a20',
              umriss: kreisPunkte(16, 39), ringe: [{ s: 0.86, versetzt: true }, { s: 0.66 }] },
  saphir:   { name: 'Saphir',   farbe: '#1f6fe5', hell: '#9ccfff', dunkel: '#0a347f',
              umriss: [[0, -43], [12, -31], [20, -16], [23, 0], [20, 16], [12, 31], [0, 43], [-12, 31], [-20, 16], [-23, 0], [-20, -16], [-12, -31]],
              ringe: [{ s: 0.86, versetzt: true }, { s: 0.64 }] },
  smaragd:  { name: 'Smaragd',  farbe: '#14a85a', hell: '#8af2b8', dunkel: '#08502c',
              umriss: [[-17, -38], [17, -38], [27, -28], [27, 28], [17, 38], [-17, 38], [-27, 28], [-27, -28]],
              ringe: [{ s: 0.82 }, { s: 0.78 }] },
  amethyst: { name: 'Amethyst', farbe: '#8b4fe8', hell: '#dcc6ff', dunkel: '#43208a',
              umriss: kreisPunkte(6, 39), ringe: [{ s: 0.92, versetzt: true }, { s: 0.62 }] },
  citrin:   { name: 'Citrin',   farbe: '#ff8a1a', hell: '#ffd49a', dunkel: '#9c4300',
              umriss: kissen(16, 35), ringe: [{ s: 0.86, versetzt: true }, { s: 0.68 }] },
  topas:    { name: 'Topas',    farbe: '#f2b800', hell: '#fff3a8', dunkel: '#8a6000',
              umriss: [[0, -40], [11, -23], [37, 28], [20, 31], [-20, 31], [-37, 28], [-11, -23]].map(([x, y]) => [x, y - 2]),
              ringe: [{ s: 0.86, versetzt: true }, { s: 0.6 }] },
};

const pkt = ps => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const LICHT = -135 * Math.PI / 180;           // Licht von links oben
/** Fläche mit Licht schattieren: Richtung der Fläche vom Mittelpunkt aus. */
function facette(ps) {
  const mx = ps.reduce((a, p) => a + p[0], 0) / ps.length, my = ps.reduce((a, p) => a + p[1], 0) / ps.length;
  const h = Math.cos(Math.atan2(my, mx) - LICHT) * Math.min(1, Math.hypot(mx, my) / 20);
  return h > 0
    ? svg('polygon', { points: pkt(ps), fill: '#ffffff', 'fill-opacity': (0.08 + 0.55 * h).toFixed(2), stroke: '#ffffff', 'stroke-opacity': '0.3', 'stroke-width': '0.7' })
    : svg('polygon', { points: pkt(ps), fill: '#000000', 'fill-opacity': (0.06 + 0.42 * -h).toFixed(2), stroke: '#ffffff', 'stroke-opacity': '0.18', 'stroke-width': '0.7' });
}

/** Ein Edelstein als <g>, Mitte (x, y), Größe g (Breite in Einheiten), Drehung in Grad. */
export function stein(sorte, x, y, g, dreh = 0) {
  const art = STEIN_ART[sorte] || STEIN_ART.rubin, s = g / 84;
  const gr = svg('g', { transform: `translate(${x} ${y}) rotate(${dreh}) scale(${s})`, class: 'stein', 'data-sorte': sorte });
  const k = svg('g', { 'stroke-linejoin': 'round' });
  // Licht scheint durch den Stein auf den Tisch
  k.append(svg('polygon', { points: pkt(art.umriss.map(([a, b]) => [a * 1.1, b * 1.1])), fill: art.hell, 'fill-opacity': '0.55', filter: 'url(#schein)' }));
  k.append(svg('polygon', { points: pkt(art.umriss), fill: `url(#verlauf-${sorte in STEIN_ART ? sorte : 'rubin'})`, 'fill-opacity': '0.9' }));
  // Ringe von außen nach innen; s ist relativ zum vorigen Ring.
  // versetzt: Die inneren Ecken liegen zwischen den äußeren, das ergibt Dreiecke wie beim Brillanten.
  let aussen = art.umriss;
  for (const ring of art.ringe) {
    const n = aussen.length, nach = i => aussen[(i + 1) % n];
    const innen = ring.versetzt
      ? aussen.map((p, i) => [(p[0] + nach(i)[0]) / 2 * ring.s, (p[1] + nach(i)[1]) / 2 * ring.s])
      : aussen.map(([x, y]) => [x * ring.s, y * ring.s]);
    for (let i = 0; i < n; i++) {
      if (ring.versetzt) k.append(facette([aussen[i], nach(i), innen[i]]), facette([innen[(i - 1 + n) % n], aussen[i], innen[i]]));
      else k.append(facette([aussen[i], nach(i), innen[(i + 1) % n], innen[i]]));
    }
    aussen = innen;
  }
  // Tafel
  k.append(svg('polygon', { points: pkt(aussen), fill: art.hell, 'fill-opacity': '0.38', stroke: '#ffffff', 'stroke-opacity': '0.55', 'stroke-width': '1.2' }));
  // Kante
  k.append(svg('polygon', { points: pkt(art.umriss), fill: 'none', stroke: art.dunkel, 'stroke-width': '2.4' }));
  // Funkeln: ein großes, ein kleines
  k.append(svg('path', { class: 'funkeln', d: 'M14 10 l1.2 3.8 l3.8 1.2 l-3.8 1.2 l-1.2 3.8 l-1.2 -3.8 l-3.8 -1.2 l3.8 -1.2 Z', fill: '#ffffff', 'fill-opacity': '0.7' }));
  k.append(svg('path', { class: 'funkeln', d: 'M-13 -27 l2.2 6.8 l6.8 2.2 l-6.8 2.2 l-2.2 6.8 l-2.2 -6.8 l-6.8 -2.2 l6.8 -2.2 Z', fill: '#ffffff', 'fill-opacity': '0.95' }));
  gr.append(k);
  return gr;
}

/** Verläufe und Lichtschein für alle Steine; einmal pro Seite in ein verstecktes SVG. */
export function defsEinbauen() {
  if (document.getElementById('stein-defs')) return;
  const defs = svg('defs');
  for (const [id, art] of Object.entries(STEIN_ART)) {
    const v = svg('linearGradient', { id: 'verlauf-' + id, x1: '0', y1: '0', x2: '1', y2: '1' });
    v.append(svg('stop', { offset: '0', 'stop-color': art.hell }), svg('stop', { offset: '0.5', 'stop-color': art.farbe }), svg('stop', { offset: '1', 'stop-color': art.dunkel }));
    defs.append(v);
  }
  const f = svg('filter', { id: 'schein', x: '-50%', y: '-50%', width: '200%', height: '200%' });
  f.append(svg('feGaussianBlur', { stdDeviation: '4' }));
  defs.append(f);
  document.body.append(svg('svg', { id: 'stein-defs', class: 'svg-defs', width: '0', height: '0', 'aria-hidden': 'true', focusable: 'false' }, [defs]));
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
