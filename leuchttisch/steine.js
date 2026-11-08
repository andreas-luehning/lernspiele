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

/**
 * Ein Edelstein als <g>, Mitte (x, y), Größe g (Breite in Einheiten), Drehung in Grad.
 * licht: Der Stein liegt auf dem Leuchttisch; das Licht von unten scheint durch (hellere Mitte, stärkerer Schein).
 */
export function stein(sorte, x, y, g, dreh = 0, { licht = false } = {}) {
  const art = STEIN_ART[sorte] || STEIN_ART.rubin, s = g / 84;
  const gr = svg('g', { transform: `translate(${x} ${y}) rotate(${dreh}) scale(${s})`, class: 'stein', 'data-sorte': sorte });
  const k = svg('g', { 'stroke-linejoin': 'round' });
  // Licht scheint durch den Stein auf den Tisch
  const sch = licht ? 1.22 : 1.1;
  k.append(svg('polygon', { points: pkt(art.umriss.map(([a, b]) => [a * sch, b * sch])), fill: licht ? art.farbe : art.hell, 'fill-opacity': licht ? '0.45' : '0.55', filter: 'url(#schein)' }));
  k.append(svg('polygon', { points: pkt(art.umriss), fill: `url(#verlauf-${sorte in STEIN_ART ? sorte : 'rubin'})`, 'fill-opacity': licht ? '0.74' : '0.9' }));
  if (licht) k.append(svg('polygon', { points: pkt(art.umriss), fill: 'url(#innenlicht)' }));
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
  const il = svg('radialGradient', { id: 'innenlicht', cx: '0.5', cy: '0.55', r: '0.55' });
  il.append(svg('stop', { offset: '0', 'stop-color': '#ffffff', 'stop-opacity': '0.75' }), svg('stop', { offset: '0.6', 'stop-color': '#ffffff', 'stop-opacity': '0.25' }), svg('stop', { offset: '1', 'stop-color': '#ffffff', 'stop-opacity': '0' }));
  defs.append(il);
  for (const [id, m] of Object.entries(MATERIAL)) {
    const r = svg('linearGradient', { id: 'rand-' + id, x1: '0.15', y1: '0', x2: '0.85', y2: '1' });
    r.append(svg('stop', { offset: '0', 'stop-color': m.hell }), svg('stop', { offset: '0.45', 'stop-color': m.mittel }), svg('stop', { offset: '0.7', 'stop-color': m.hell, 'stop-opacity': '0.9' }), svg('stop', { offset: '1', 'stop-color': m.dunkel }));
    const t = svg('radialGradient', { id: 'tief-' + id, cx: '0.45', cy: '0.4', r: '0.7' });
    t.append(svg('stop', { offset: '0', 'stop-color': m.tief1 }), svg('stop', { offset: '1', 'stop-color': m.tief2 }));
    defs.append(r, t);
  }
  const f = svg('filter', { id: 'schein', x: '-50%', y: '-50%', width: '200%', height: '200%' });
  f.append(svg('feGaussianBlur', { stdDeviation: '5' }));
  defs.append(f);
  document.body.append(svg('svg', { id: 'stein-defs', class: 'svg-defs', width: '0', height: '0', 'aria-hidden': 'true', focusable: 'false' }, [defs]));
}

/** Position der Fassungen im Amulett (Mitte 0/0): fünf im Kreis. */
export function fassungsPlatz(i, n) {
  const a = (-90 + i * 360 / n) * Math.PI / 180;
  return { x: 27 * Math.cos(a), y: 6 + 27 * Math.sin(a) };
}

// Materialien der Amulette (eins pro Stufe, siehe aufgaben.js).
// hell/mittel/dunkel: Verlauf des polierten Randes; tief1/tief2: vertiefte Innenfläche, auf der die Steine leuchten.
// glitzer: zusätzliche Funkelsterne auf dem Rand (höchste Stufe). Neue Materialien hier und in aufgaben.js MATERIALIEN ergänzen.
export const MATERIAL = {
  bronze:   { name: 'Bronze',   hell: '#f7cf9f', mittel: '#b8763a', dunkel: '#5a3210', tief1: '#94582a', tief2: '#3e220a' },
  silber:   { name: 'Silber',   hell: '#ffffff', mittel: '#c4cdd9', dunkel: '#677386', tief1: '#8f9bad', tief2: '#3f4859' },
  gold:     { name: 'Gold',     hell: '#fff4bd', mittel: '#e6b23a', dunkel: '#8d600b', tief1: '#b98522', tief2: '#5c3f05' },
  kristall: { name: 'Kristall', hell: '#ffffff', mittel: '#a9dcff', dunkel: '#3f7fbf', tief1: '#5f9fd9', tief2: '#16346a', glitzer: true },
};
const MITTE = [0, 6];
const rund = (n, rf) => Array.from({ length: n }, (_, i) => { const t = i / n * 2 * Math.PI - Math.PI / 2, r = rf(t); return [MITTE[0] + r * Math.cos(t), MITTE[1] + r * Math.sin(t)]; });
// Umrisse der Formen (Punkte um die Mitte 0/6); die Fassungen liegen auf einem Kreis mit Radius 27 (plus 13) und passen in jede Form
export const FORM = {
  rund:     { name: 'Rund',     umriss: () => rund(72, () => 52) },
  sechseck: { name: 'Sechseck', umriss: () => rund(6, () => 58) },
  sonne:    { name: 'Sonne',    umriss: () => rund(24, t => (Math.round((t + Math.PI / 2) / (Math.PI / 12)) % 2 ? 50 : 59)) },
  bluete:   { name: 'Blüte',    umriss: () => rund(96, t => 51 + 6 * Math.cos(6 * (t + Math.PI / 2))) },
  schild:   { name: 'Schild',   umriss: () => [[-50, -42], [50, -42], [53, -38], [53, 12], [44, 36], [24, 54], [0, 64], [-24, 54], [-44, 36], [-53, 12], [-53, -38]] },
  kissen:   { name: 'Kissen',   umriss: () => rund(64, t => 50 / Math.pow(Math.pow(Math.abs(Math.cos(t)), 4) + Math.pow(Math.abs(Math.sin(t)), 4), 0.25)) },
};
const skaliert = (ps, f) => ps.map(([x, y]) => [MITTE[0] + (x - MITTE[0]) * f, MITTE[1] + (y - MITTE[1]) * f]);

/** Punkte in gleichem Abstand entlang eines geschlossenen Umrisses (für die Perlenreihe). */
function entlang(ps, abstand) {
  const aus = []; let rest = 0;
  for (let i = 0; i < ps.length; i++) {
    const [x1, y1] = ps[i], [x2, y2] = ps[(i + 1) % ps.length], l = Math.hypot(x2 - x1, y2 - y1);
    let t = rest; while (t < l) { aus.push([x1 + (x2 - x1) * t / l, y1 + (y2 - y1) * t / l]); t += abstand; }
    rest = t - l;
  }
  return aus;
}

/**
 * Amulett mit n Fassungen; steine = eingesetzte Steine. Größe 124 × 132 Einheiten (viewBox -62 -64 124 132).
 * form, material: das Modell (siehe aufgaben.js MODELLE). neu = Index des gerade eingesetzten Steins (kleine Animation).
 * umriss: nur der graue Umriss (noch nicht gefundenes Modell im Album).
 * Verläufe kommen aus defsEinbauen().
 */
export function amulett(steine, n, { form = 'rund', material = 'gold', neu = -1, klein = false, umriss = false } = {}) {
  const f = FORM[form] || FORM.rund, mat = MATERIAL[material] ? material : 'gold', m = MATERIAL[mat];
  const s = svg('svg', { viewBox: '-62 -64 124 132', class: 'amulett' + (klein ? ' klein' : '') + (umriss ? ' umriss' : ''), 'aria-hidden': 'true' });
  const aussen = f.umriss();
  if (umriss) {
    s.append(svg('polygon', { points: pkt(aussen), fill: 'none', stroke: 'currentColor', 'stroke-width': '3', 'stroke-dasharray': '6 5', 'stroke-linejoin': 'round' }));
    return s;
  }
  const rand = `url(#rand-${mat})`;
  // Kette und Öse
  s.append(svg('path', { d: 'M-30 -64 Q0 -30 30 -64', fill: 'none', stroke: m.mittel, 'stroke-width': '3', 'stroke-dasharray': '2.5 3.5', 'stroke-linecap': 'round' }));
  s.append(svg('circle', { cx: 0, cy: -47, r: 6.5, fill: 'none', stroke: rand, 'stroke-width': '4.5' }));
  // Polierter Rand mit Lichtkante
  s.append(svg('polygon', { points: pkt(aussen), fill: rand, stroke: m.dunkel, 'stroke-width': '2.2', 'stroke-linejoin': 'round' }));
  s.append(svg('polygon', { points: pkt(skaliert(aussen, 0.95)), fill: 'none', stroke: '#ffffff', 'stroke-opacity': '0.45', 'stroke-width': '1.4', 'stroke-linejoin': 'round' }));
  // Perlenreihe
  for (const [x, y] of entlang(skaliert(aussen, 0.885), 7.2)) s.append(svg('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 1.9, fill: m.hell, stroke: m.dunkel, 'stroke-width': '0.5', 'stroke-opacity': '0.6' }));
  // Vertiefte Innenfläche
  s.append(svg('polygon', { points: pkt(skaliert(aussen, 0.8)), fill: `url(#tief-${mat})`, stroke: m.dunkel, 'stroke-width': '1.6', 'stroke-linejoin': 'round' }));
  // Mitte: kleine Rosette aus Metall
  for (let i = 0; i < 6; i++) { const t = i * Math.PI / 3; s.append(svg('circle', { cx: (4.2 * Math.cos(t)).toFixed(1), cy: (6 + 4.2 * Math.sin(t)).toFixed(1), r: 2.6, fill: rand, stroke: m.dunkel, 'stroke-width': '0.6' })); }
  s.append(svg('circle', { cx: 0, cy: 6, r: 2.4, fill: m.hell }));
  // Fassungen: Metallring mit vier Krallen, darin der Stein
  for (let i = 0; i < n; i++) {
    const p = fassungsPlatz(i, n);
    s.append(svg('circle', { class: 'a-fassung', cx: p.x, cy: p.y, r: 12.5, fill: m.tief2, 'fill-opacity': '0.55' }));
    if (steine[i]) {
      const g = stein(steine[i], p.x, p.y, 23);
      if (i === neu) g.firstChild.classList.add('neu'); // inneres <g>: die Animation darf das transform-Attribut nicht ersetzen
      s.append(g);
    }
    s.append(svg('circle', { cx: p.x, cy: p.y, r: 12.5, fill: 'none', stroke: rand, 'stroke-width': '2.6' }));
    for (let k = 0; k < 4; k++) {
      const t = (45 + k * 90) * Math.PI / 180;
      s.append(svg('circle', { cx: (p.x + 12 * Math.cos(t)).toFixed(1), cy: (p.y + 12 * Math.sin(t)).toFixed(1), r: 2.1, fill: m.hell, stroke: m.dunkel, 'stroke-width': '0.6' }));
    }
  }
  // Kristall: Funkelsterne auf dem Rand
  if (m.glitzer) for (const [x, y, g] of [[-40, -18, 1], [42, 22, 0.8], [-20, 50, 0.7], [30, -30, 0.6]]) {
    s.append(svg('path', { class: 'funkeln', d: `M${x} ${y - 7 * g} L${x + 1.8 * g} ${y - 1.8 * g} L${x + 7 * g} ${y} L${x + 1.8 * g} ${y + 1.8 * g} L${x} ${y + 7 * g} L${x - 1.8 * g} ${y + 1.8 * g} L${x - 7 * g} ${y} L${x - 1.8 * g} ${y - 1.8 * g} Z`, fill: '#ffffff', 'fill-opacity': '0.95' }));
  }
  return s;
}
